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
import type { AssignedDuty } from "./shuthyam-dashboard";
import { Badge } from "@/components/ui/badge";

interface HistoryPageProps {
  completedDuties: AssignedDuty[];
}

export default function HistoryPage({ completedDuties }: HistoryPageProps) {
  if (completedDuties.length === 0) {
    return (
        <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No completed duties yet.</p>
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
            <TableHead>Completed Time</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {completedDuties.map((duty) => (
            <TableRow key={duty.id}>
              <TableCell className="font-medium">{duty.washroom}</TableCell>
              <TableCell>{duty.staffName}</TableCell>
              <TableCell>{duty.assignedTime}</TableCell>
              <TableCell>{duty.completedTime}</TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {duty.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
