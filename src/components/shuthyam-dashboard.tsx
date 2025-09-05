"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Home, ClipboardList, History, PanelLeft } from "lucide-react"

const cleanlinessData = [
  { name: 'Washroom 1', rating: 3 },
  { name: 'Washroom 2', rating: 4 },
  { name: 'Washroom 3', rating: 2 },
  { name: 'Washroom 4', rating: 5 },
  { name: 'Washroom 5', rating: 4 },
];

const reportData = [
    { washroom: 'Washroom 1', date: 'July 22', time: '8:00pm' },
    { washroom: 'Washroom 2', date: 'July 22', time: '9:00pm' },
    { washroom: 'Washroom 3', date: 'July 22', time: '10:00pm' },
    { washroom: 'Washroom 4', date: 'July 22', time: '12:00pm' },
];

export default function ShuthyamDashboard() {
  const [activePage, setActivePage] = React.useState("Dashboard")

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
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of cleanliness report and trends</p>
                </div>
            </div>
        </header>

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

            <div>
                <h2 className="text-2xl font-bold mb-4">Reports</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportData.map((report, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="text-lg">{report.washroom}</CardTitle>
                                <CardDescription>{report.date}, {report.time}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
