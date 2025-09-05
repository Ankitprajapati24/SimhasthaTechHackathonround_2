"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AssignedDuty, DutyStatus } from "./shuthyam-dashboard";
import { cn } from "@/lib/utils";

interface AssignedDutiesPageProps {
  duties: AssignedDuty[];
  onStatusChange: (dutyId: number, newStatus: DutyStatus) => void;
}

const statusColors: Record<DutyStatus, string> = {
    Pending: "bg-yellow-500",
    Assigned: "bg-blue-500",
    "In Progress": "bg-orange-500",
    Completed: "bg-green-500",
};

export default function AssignedDutiesPage({ duties, onStatusChange }: AssignedDutiesPageProps) {
  const dutyStatuses: DutyStatus[] = ["Assigned", "In Progress", "Completed"];

  if (duties.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No duties assigned yet.</p>
        </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Washroom</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Assigned Time</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {duties.map((duty) => (
            <TableRow key={duty.id}>
              <TableCell className="font-medium">{duty.washroom}</TableCell>
              <TableCell>{duty.staffName}</TableCell>
              <TableCell>{duty.assignedTime}</TableCell>
              <TableCell className="text-right">
                <Select
                  value={duty.status}
                  onValueChange={(newStatus: DutyStatus) =>
                    onStatusChange(duty.id, newStatus)
                  }
                >
                  <SelectTrigger className="w-48 float-right">
                    <SelectValue>
                        <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full", statusColors[duty.status])} />
                            <span>{duty.status}</span>
                        </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {dutyStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                           <span className={cn("h-2 w-2 rounded-full", statusColors[status])} />
                           <span>{status}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
