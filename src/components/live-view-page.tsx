
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, ArrowRight, Video, Camera } from "lucide-react";

interface LiveViewPageProps {
  washroom: {
    washroom: string;
    peopleUsed: number;
  } | null;
  onBack: () => void;
}

export default function LiveViewPage({ washroom, onBack }: LiveViewPageProps) {
  const [entryCount, setEntryCount] = React.useState(0);
  const [exitCount, setExitCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setEntryCount(prev => prev + Math.floor(Math.random() * 2));
      setExitCount(prev => prev + Math.floor(Math.random() * 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const occupancy = entryCount - exitCount > 0 ? entryCount - exitCount : 0;

  if (!washroom) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Camera className="w-16 h-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Select a Washroom</h2>
        <p className="text-muted-foreground">
          Click on a washroom from the dashboard to see its live view.
        </p>
        <Button onClick={onBack} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Live Camera Feed</CardTitle>
            <CardDescription>{washroom.washroom}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <Video className="h-16 w-16 mx-auto" />
                    <p>CCTV Feed Placeholder</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Live Occupancy</CardTitle>
                    <CardDescription>Real-time entry and exit counts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-around text-center">
                        <div>
                            <p className="text-4xl font-bold text-green-500">{entryCount}</p>
                            <p className="text-sm text-muted-foreground">Entries</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-red-500">{exitCount}</p>
                            <p className="text-sm text-muted-foreground">Exits</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">{occupancy}</p>
                            <p className="text-sm text-muted-foreground">Inside</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Last cleaned: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, {new Date(Date.now() - 3600000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xl">
                  <Users className="h-6 w-6" />
                  <span>
                    <span className="font-bold">{washroom.peopleUsed}</span> people have used this washroom today.
                  </span>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
