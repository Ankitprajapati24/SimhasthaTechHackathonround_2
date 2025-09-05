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
import { fetchFromUrl } from "@/ai/flows/fetch-from-url";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

const washrooms = [
    'Washroom 1',
    'Washroom 2',
    'Washroom 3',
];

const generateCleanlinessData = () => {
    return washrooms.map(name => ({
        name: name,
        rating: Math.floor(Math.random() * 5) + 1
    }));
};

const generateInitialReportData = () => {
    return washrooms.map((name, i) => ({
        id: i,
        washroom: name,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        peopleUsed: 0,
    }));
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
  const [isLive, setIsLive] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const newCleanlinessData = generateCleanlinessData();
    const newReportData = generateInitialReportData();
    setCleanlinessData(newCleanlinessData);
    setReportData(newReportData);
  }, []);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchLiveCount = async () => {
        try {
            const response = await fetchFromUrl({ url: 'http://127.0.0.1:5000/count' });
            const personCount = response.data?.count ?? 0;
            
            setReportData(prevData => {
                // In a real scenario, you might have separate endpoints for each washroom.
                // For this demo, we'll update one of the washrooms with the fetched count.
                // Let's cycle through which washroom gets updated.
                const washroomIndexToUpdate = Math.floor(Date.now() / 5000) % washrooms.length;
                
                const newData = prevData.map((report, index) => {
                    if (index === washroomIndexToUpdate) {
                        const updatedReport = { ...report, peopleUsed: personCount };
                        
                        if (updatedReport.peopleUsed > 20) { // Using a smaller threshold for demo
                            toast({
                                variant: "destructive",
                                title: "High Washroom Usage Alert",
                                description: `${updatedReport.washroom} is currently busy.`,
                            });
                        }
                        return updatedReport;
                    }
                    // Optionally reset other counts if you want only one to be "live" at a time
                    return report; 
                });
                return newData;
            });
        } catch (error) {
            console.error("Failed to fetch live count:", error);
            toast({
                variant: "destructive",
                title: "Live Feed Error",
                description: "Could not connect to the Python server. Please ensure it's running.",
            });
            setIsLive(false); // Turn off the switch on error
        }
    };

    if (isLive) {
      // Fetch immediately and then set an interval
      fetchLiveCount();
      intervalId = setInterval(fetchLiveCount, 5000); // Fetch every 5 seconds
    }

    // Cleanup function to clear the interval when the component unmounts or isLive becomes false
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLive, toast]);

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
              Shudhyam
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
            {activePage === 'Dashboard' && (
                <div className="flex items-center space-x-2">
                    <Label htmlFor="live-feed">Live Feed</Label>
                    <Switch id="live-feed" checked={isLive} onCheckedChange={setIsLive} />
                </div>
            )}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        <div className={cn("flex items-center gap-2 text-sm", report.peopleUsed > 20 ? "text-destructive" : "text-muted-foreground")}>
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

    