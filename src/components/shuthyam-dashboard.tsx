"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Home, ClipboardList, History, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import AssignedDutiesPage from "./assigned-duties-page";
import HistoryPage from "./history-page";

const washrooms = [
    'Washroom 1',
    'Washroom 2',
    'Washroom 3',
    'Washroom 4',
    'Washroom 5',
    'Washroom 6',
    'Washroom 7',
    'Washroom 8',
    'Washroom 9',
    'Washroom 10',
];

const generateCleanlinessData = () => {
    return washrooms.map(name => ({
        name: name,
        rating: Math.floor(Math.random() * 5) + 1
    }));
};

const generateReportData = () => {
    const now = new Date();
    return Array.from({ length: washrooms.length }, (_, i) => {
        const reportTime = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24);
        return {
            id: i,
            washroom: washrooms[i],
            date: reportTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
            time: reportTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            peopleUsed: Math.floor(Math.random() * 301) + 100,
        }
    }).sort((a,b) => a.washroom.localeCompare(b.washroom));
};

const cleaningStaff = [
    { id: '1', name: 'Ramesh' },
    { id: '2', name: 'Suresh' },
    { id: '3', name: 'Gita' },
    { id: '4', name: 'Sita' },
];

export type DutyStatus = "Pending" | "Assigned" | "In Progress" | "Completed";

export interface AssignedDuty {
  id: number;
  washroom: string;
  staffName: string;
  assignedTime: string;
  status: DutyStatus;
  completedTime?: string;
}

export default function ShuthyamDashboard() {
  const [activePage, setActivePage] = React.useState("Dashboard")
  const [cleanlinessData, setCleanlinessData] = React.useState<any[]>([]);
  const [reportData, setReportData] = React.useState<any[]>([]);
  const [selectedWashroom, setSelectedWashroom] = React.useState<any>(null);
  const [selectedStaff, setSelectedStaff] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [assignedDuties, setAssignedDuties] = React.useState<AssignedDuty[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    setCleanlinessData(generateCleanlinessData());
    setReportData(generateReportData());
  }, []);

  const handleAssignDuty = () => {
    if (selectedWashroom && selectedStaff) {
      const staffMember = cleaningStaff.find(s => s.id === selectedStaff);
      if (staffMember) {
        const newDuty: AssignedDuty = {
            id: Date.now(),
            washroom: selectedWashroom.washroom,
            staffName: staffMember.name,
            assignedTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            status: 'Assigned'
        };
        setAssignedDuties(prevDuties => [...prevDuties, newDuty]);
        toast({
          title: "Duty Assigned!",
          description: `${staffMember.name} has been assigned to clean ${selectedWashroom.washroom}.`,
        });
        setIsDialogOpen(false);
        setSelectedStaff("");
      }
    }
  };

  const handleStatusChange = (dutyId: number, newStatus: DutyStatus) => {
    setAssignedDuties(prevDuties =>
      prevDuties.map(duty => {
        if (duty.id === dutyId) {
          const updatedDuty = { ...duty, status: newStatus };
          if (newStatus === "Completed") {
            updatedDuty.completedTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          }
          return updatedDuty;
        }
        return duty;
      })
    );
  };
  
  const activeDuties = assignedDuties.filter(duty => duty.status !== 'Completed');
  const completedDuties = assignedDuties.filter(duty => duty.status === 'Completed');

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-bold group-data-[collapsible=icon]:hidden">
              Shuthyam
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActivePage('Dashboard')} isActive={activePage === 'Dashboard'} tooltip="Dashboard">
                        <Home />
                        <span>Dashboard</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActivePage('Assigned Duties')} isActive={activePage === 'Assigned Duties'} tooltip="Assigned Duties">
                        <ClipboardList />
                        <span>Assigned Duties</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActivePage('History')} isActive={activePage === 'History'} tooltip="History">
                        <History />
                        <span>History</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="hidden md:flex" />
                 <div>
                    <h1 className="text-3xl font-bold">{activePage}</h1>
                    <p className="text-muted-foreground">
                        {activePage === 'Dashboard' 
                            ? 'Overview of cleanliness report and trends'
                            : activePage === 'Assigned Duties'
                            ? 'Track and manage cleaning duties'
                            : 'View history of completed cleaning duties'
                        }
                    </p>
                </div>
            </div>
        </header>

        {activePage === 'Dashboard' && (
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Average Cleanliness Score</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cleanlinessData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} label={{ value: 'Average rating', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Bar dataKey="rating" fill="hsl(var(--primary))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Reports</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {reportData.map((report) => (
                                <Card key={report.id} className="cursor-pointer hover:border-primary" onClick={() => {
                                    setSelectedWashroom(report)
                                    setIsDialogOpen(true)
                                }}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{report.washroom}</CardTitle>
                                        <CardDescription>{report.date}, {report.time}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={cn("flex items-center gap-2 text-sm", report.peopleUsed > 300 ? "text-destructive" : "text-muted-foreground")}>
                                            <Users className="h-4 w-4" />
                                            <span>{report.peopleUsed} people used</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Assign Cleaning Duty</DialogTitle>
                        <DialogDescription>
                            Assign a cleaning staff member to {selectedWashroom?.washroom}.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Select onValueChange={setSelectedStaff} value={selectedStaff}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cleaningStaff.map(staff => (
                                        <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssignDuty} disabled={!selectedStaff}>Assign Duty</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )}
        {activePage === 'Assigned Duties' && (
            <AssignedDutiesPage duties={activeDuties} onStatusChange={handleStatusChange} />
        )}
        {activePage === 'History' && (
            <HistoryPage completedDuties={completedDuties} />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
