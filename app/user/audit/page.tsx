"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ClipboardCheck,
  User,
  Calendar,
} from "lucide-react";
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

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const auditLogs = [
    { id: "AUD-001", user: "John Admin", action: "Created Job", entity: "JOB-001", timestamp: "2024-01-18 10:30:25", ip: "192.168.1.100" },
    { id: "AUD-002", user: "Jane Manager", action: "Updated Customer", entity: "CUST-005", timestamp: "2024-01-18 09:15:10", ip: "192.168.1.101" },
    { id: "AUD-003", user: "John Admin", action: "Deleted Invoice", entity: "INV-003", timestamp: "2024-01-17 16:45:30", ip: "192.168.1.100" },
    { id: "AUD-004", user: "Mike Staff", action: "Created Vehicle", entity: "VEH-012", timestamp: "2024-01-17 14:20:15", ip: "192.168.1.102" },
    { id: "AUD-005", user: "Jane Manager", action: "Updated Inventory", entity: "INV-002", timestamp: "2024-01-17 11:05:45", ip: "192.168.1.101" },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction =
      actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes("Created")) {
      return (
        <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
          Created
        </Badge>
      );
    } else if (action.includes("Updated")) {
      return (
        <Badge className="bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30">
          Updated
        </Badge>
      );
    } else if (action.includes("Deleted")) {
      return (
        <Badge className="bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">
          Deleted
        </Badge>
      );
    }
    return <Badge>{action}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
          AUDIT_LOG
        </h1>
        <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
          {/* // */} TRACK_ALL_SYSTEM_ACTIVITIES_AND_CHANGES
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Total Logs</p>
                <p className="text-2xl font-bold text-white">{auditLogs.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Today</p>
                <p className="text-2xl font-bold text-white">2</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#22d3ee]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">Active Users</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="w-12 h-12 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                <User className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-[#94a3b8] uppercase mb-1">This Week</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="w-12 h-12 bg-[#22d3ee]/20 rounded flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-[#22d3ee]" />
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
                placeholder="Search audit logs by ID, user, or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#1a1c1e] border-white/10 font-mono">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent className="bg-[#25282c] border-white/10">
                <SelectItem value="all" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">All Actions</SelectItem>
                <SelectItem value="created" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Created</SelectItem>
                <SelectItem value="updated" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Updated</SelectItem>
                <SelectItem value="deleted" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            AUDIT_LOGS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Total: {filteredLogs.length} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Log ID</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">User</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Action</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Entity</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">Timestamp</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#94a3b8]">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#94a3b8] font-mono">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-sm font-bold text-white">
                      {log.id}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-white">
                      {log.user}
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-[#94a3b8]">
                      {log.entity}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#94a3b8]">
                      {log.ip}
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
