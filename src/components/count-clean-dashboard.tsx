"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowLeftCircle,
  ArrowRightCircle,
  CheckCircle2,
  ClipboardList,
  History,
  Lightbulb,
  Loader2,
  Rss,
  Timer,
  Users,
  UserPlus,
} from 'lucide-react';

import { reasonAboutOccupancy, type ReasonAboutOccupancyInput } from '@/ai/flows/reason-about-occupancy';
import { fetchFromUrl } from '@/ai/flows/fetch-from-url';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Cleaner = {
  id: string;
  name: string;
};

type CleaningTask = {
  id: number;
  status: 'Pending Assignment' | 'In Progress' | 'Completed';
  assignedTo?: Cleaner['id'];
  assignedAt?: Date;
  completedAt?: Date;
};

const cleaners: Cleaner[] = [
  { id: 'cleaner-1', name: 'Alex' },
  { id: 'cleaner-2', name: 'Ben' },
  { id: 'cleaner-3', name: 'Carla' },
];

const OCCUPANCY_THRESHOLD = 10;
const FLASK_APP_URL = 'http://127.0.0.1:5000/count'; // Placeholder URL

export default function CountCleanDashboard() {
  const [occupancy, setOccupancy] = useState(0);
  const [previousOccupancy, setPreviousOccupancy] = useState(0);
  const [reasoning, setReasoning] = useState('System is ready. Awaiting first entry/exit event.');
  const [isThresholdBreached, setIsThresholdBreached] = useState(false);
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState<string | undefined>();
  const [useLiveFeed, setUseLiveFeed] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const { toast } = useToast();

  const activeTask = useMemo(
    () => cleaningTasks.find(t => t.status === 'Pending Assignment' || t.status === 'In Progress'),
    [cleaningTasks]
  );
  
  const completedTasks = useMemo(
    () => cleaningTasks.filter(t => t.status === 'Completed').sort((a,b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)),
    [cleaningTasks]
  );

  useEffect(() => {
    if (isThresholdBreached && !activeTask) {
      setCleaningTasks(prev => [...prev, { id: Date.now(), status: 'Pending Assignment' }]);
    }
  }, [isThresholdBreached, activeTask]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (useLiveFeed) {
      const fetchLiveCount = async () => {
        setIsFetching(true);
        try {
          const result = await fetchFromUrl({ url: FLASK_APP_URL });
          // Assuming the flask app returns { "count": <number> }
          const newCount = result.data.count;
          
          if (newCount !== occupancy) {
             const input: ReasonAboutOccupancyInput = {
                entranceCount: Math.max(0, newCount - occupancy),
                exitCount: Math.max(0, occupancy - newCount),
                previousOccupancy: occupancy,
                threshold: OCCUPANCY_THRESHOLD,
            };
            const reasonResult = await reasonAboutOccupancy(input);
            setOccupancy(reasonResult.occupancy);
            setPreviousOccupancy(reasonResult.occupancy);
            setReasoning(reasonResult.reasoning);
            setIsThresholdBreached(reasonResult.isThresholdBreached);
          }
        } catch (error) {
          console.error("Failed to fetch from Flask app:", error);
          toast({
            variant: "destructive",
            title: "Live Feed Error",
            description: "Could not fetch data from the live feed. Please check if your app is running.",
          });
          setUseLiveFeed(false); // Toggle off on error
        } finally {
            setIsFetching(false);
        }
      };
      
      fetchLiveCount();
      interval = setInterval(fetchLiveCount, 5000); // Fetch every 5 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [useLiveFeed, occupancy]);

  const handlePersonEvent = async (type: 'enter' | 'exit') => {
    setIsLoading(true);

    const input: ReasonAboutOccupancyInput = {
      entranceCount: type === 'enter' ? 1 : 0,
      exitCount: type === 'exit' ? 1 : 0,
      previousOccupancy: occupancy,
      threshold: OCCUPANCY_THRESHOLD,
    };

    try {
      const result = await reasonAboutOccupancy(input);
      setOccupancy(result.occupancy);
      setPreviousOccupancy(result.occupancy); // Update for next reasoning cycle
      setReasoning(result.reasoning);
      setIsThresholdBreached(result.isThresholdBreached);
    } catch (error) {
      console.error("AI reasoning failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get reasoning from AI. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAssignCleaner = () => {
    if (!selectedCleaner || !activeTask || activeTask.status !== 'Pending Assignment') return;

    setCleaningTasks(tasks =>
      tasks.map(t =>
        t.id === activeTask.id
          ? { ...t, status: 'In Progress', assignedTo: selectedCleaner, assignedAt: new Date() }
          : t
      )
    );
    setSelectedCleaner(undefined);
    setDialogOpen(false);
  };
  
  const handleCompleteTask = (taskId: number) => {
    setCleaningTasks(tasks =>
      tasks.map(t =>
        t.id === taskId
          ? { ...t, status: 'Completed', completedAt: new Date() }
          : t
      )
    );
  };

  const getCleanerName = (cleanerId?: string) => cleaners.find(c => c.id === cleanerId)?.name || 'N/A';
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold font-headline text-primary-foreground/90">CountClean</h1>
        <p className="text-muted-foreground mt-2 text-lg">Intelligent Washroom Occupancy & Cleaning Management</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-lg">
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <div className="flex items-center gap-2"><Users className="text-primary-foreground/70" /> Sensor Input</div>
                 <div className="flex items-center space-x-2">
                   {isFetching ? <Loader2 className="animate-spin text-primary" /> : <Rss className={useLiveFeed ? 'text-green-500' : 'text-muted-foreground'} />}
                   <Label htmlFor="live-feed-switch">Live Feed</Label>
                   <Switch id="live-feed-switch" checked={useLiveFeed} onCheckedChange={setUseLiveFeed} />
                 </div>
               </CardTitle>
               <CardDescription>
                 {useLiveFeed ? 'Receiving live data from auto-counter.' : 'Simulate people entering and exiting the washroom.'}
               </CardDescription>
             </CardHeader>
             {!useLiveFeed && (
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button size="lg" onClick={() => handlePersonEvent('enter')} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRightCircle />}
                    Person Enters
                  </Button>
                  <Button size="lg" onClick={() => handlePersonEvent('exit')} disabled={isLoading} variant="secondary">
                     {isLoading ? <Loader2 className="animate-spin" /> : <ArrowLeftCircle />}
                    Person Exits
                  </Button>
                </CardContent>
             )}
           </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary-foreground/70"/> AI Reasoning</CardTitle>
              <CardDescription>How the AI determined the current occupancy.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic bg-accent/50 p-4 rounded-md border border-dashed">"{reasoning}"</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="text-primary-foreground/70"/> Live Occupancy</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center text-center gap-8">
              <div className="flex-1">
                <p className="text-7xl font-bold font-headline transition-colors" style={{color: isThresholdBreached ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))'}}>{occupancy}</p>
                <p className="text-muted-foreground">Current Occupants</p>
              </div>
              <div className="h-20 w-px bg-border"></div>
              <div className="flex-1">
                 <p className="text-4xl font-bold">{OCCUPANCY_THRESHOLD}</p>
                 <p className="text-muted-foreground">Max Capacity</p>
              </div>
            </CardContent>
            {isThresholdBreached && (
               <CardFooter>
                  <Alert variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Threshold Breached!</AlertTitle>
                    <AlertDescription>
                      Occupancy has exceeded the maximum limit. A cleaning task has been generated.
                    </AlertDescription>
                  </Alert>
               </CardFooter>
            )}
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="text-primary-foreground/70"/> Cleaning Management</CardTitle>
              <CardDescription>Assign and track cleaning tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTask ? (
                <div className="p-4 rounded-lg bg-secondary/50 border">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Active Task</h3>
                            <p className="text-sm text-muted-foreground">ID: {activeTask.id}</p>
                        </div>
                        <Badge variant={activeTask.status === 'In Progress' ? 'default' : 'secondary'}>
                            {activeTask.status === 'In Progress' ? <Timer className="mr-2 h-4 w-4" /> : null}
                            {activeTask.status}
                        </Badge>
                    </div>
                    {activeTask.status === 'Pending Assignment' && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full mt-4"><UserPlus /> Assign Cleaner</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Assign Cleaner</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                <Select onValueChange={setSelectedCleaner} value={selectedCleaner}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a cleaner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cleaners.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAssignCleaner} disabled={!selectedCleaner}>Assign</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    {activeTask.status === 'In Progress' && (
                        <div className="mt-4 space-y-2">
                           <p><strong>Assigned to:</strong> {getCleanerName(activeTask.assignedTo)}</p>
                           <p><strong>Assigned at:</strong> {activeTask.assignedAt?.toLocaleTimeString()}</p>
                           <Button className="w-full mt-2" variant="outline" onClick={() => handleCompleteTask(activeTask.id)}><CheckCircle2 /> Mark as Complete</Button>
                        </div>
                    )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No active cleaning tasks.</p>
                </div>
              )}
              {completedTasks.length > 0 && (
                <Accordion type="single" collapsible className="w-full mt-4">
                  <AccordionItem value="history">
                    <AccordionTrigger><History className="mr-2"/>View Cleaning History</AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Completed At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedTasks.map(task => (
                            <TableRow key={task.id}>
                                <TableCell><Badge variant="secondary"><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />Completed</Badge></TableCell>
                                <TableCell>{getCleanerName(task.assignedTo)}</TableCell>
                                <TableCell>{task.completedAt?.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
