"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Bell,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RemindersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const reminders = [
    { id: "REM-001", title: "Follow up with John Doe", description: "Check on service completion", type: "Customer", dueDate: "2024-01-20", status: "Pending", priority: "High" },
    { id: "REM-002", title: "Order brake pads", description: "Low stock alert", type: "Inventory", dueDate: "2024-01-19", status: "Pending", priority: "Medium" },
    { id: "REM-003", title: "Send invoice to Jane Smith", description: "Invoice INV-002 pending", type: "Invoice", dueDate: "2024-01-18", status: "Completed", priority: "High" },
    { id: "REM-004", title: "Vehicle inspection reminder", description: "Toyota Camry service due", type: "Vehicle", dueDate: "2024-01-25", status: "Pending", priority: "Low" },
  ];

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch =
      reminder.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reminder.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            Pending
          </Badge>
        );
      case "Completed":
        return (
          <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30">
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge className="bg-[#94a3b8]/20 text-[#94a3b8] hover:bg-[#94a3b8]/30">
            Low
          </Badge>
        );
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
            REMINDERS
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} MANAGE_TASKS_AND_NOTIFICATIONS
          </p>
        </div>
        <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <Plus className="h-4 w-4" />
          CREATE REMINDER
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Reminders</p>
                <p className="text-2xl font-bold text-white">{reminders.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <Bell className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {reminders.filter((r) => r.status === "Pending").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {reminders.filter((r) => r.status === "Completed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">High Priority</p>
                <p className="text-2xl font-bold text-white">
                  {reminders.filter((r) => r.priority === "High").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ef4444]/20 rounded flex items-center justify-center">
                <Bell className="h-6 w-6 text-[#ef4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <Input
                placeholder="Search reminders by ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#1a1c1e] border-white/10 font-mono">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#25282c] border-white/10">
                <SelectItem value="all" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">All Status</SelectItem>
                <SelectItem value="pending" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Pending</SelectItem>
                <SelectItem value="completed" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reminders Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            ALL_REMINDERS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredReminders.length} reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Reminder ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Title</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Description</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Type</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Due Date</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Priority</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#94a3b8] font-mono">
                    No reminders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReminders.map((reminder) => (
                  <TableRow key={reminder.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {reminder.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {reminder.title}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8] max-w-xs truncate">
                      {reminder.description}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {reminder.type}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {reminder.dueDate}
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(reminder.priority)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reminder.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
