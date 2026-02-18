"use client";

import { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("month");

  const reportCards = [
    { title: "Sales Report", description: "Revenue and sales analytics", icon: DollarSign, color: "text-[#3b82f6]" },
    { title: "Job Report", description: "Job completion and status", icon: BarChart3, color: "text-[#22d3ee]" },
    { title: "Customer Report", description: "Customer analytics and insights", icon: BarChart3, color: "text-[#3b82f6]" },
    { title: "Inventory Report", description: "Stock levels and movements", icon: BarChart3, color: "text-[#22d3ee]" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
            REPORTS
          </h1>
          <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
            {/* // */} ANALYTICS_AND_BUSINESS_INSIGHTS
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] bg-[#1a1c1e] border-white/10 font-mono">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent className="bg-[#25282c] border-white/10">
              <SelectItem value="week" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">This Week</SelectItem>
              <SelectItem value="month" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">This Month</SelectItem>
              <SelectItem value="quarter" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">This Quarter</SelectItem>
              <SelectItem value="year" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
            <Download className="h-4 w-4" />
            EXPORT
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardContent className="pt-6">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full md:w-[300px] bg-[#1a1c1e] border-white/10 font-mono">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent className="bg-[#25282c] border-white/10">
              <SelectItem value="sales" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Sales Report</SelectItem>
              <SelectItem value="jobs" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Job Report</SelectItem>
              <SelectItem value="customers" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Customer Report</SelectItem>
              <SelectItem value="inventory" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Inventory Report</SelectItem>
              <SelectItem value="financial" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Financial Report</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((card, index) => (
          <Card key={index} className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 hover:border-white/10 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm text-white uppercase">
                  {card.title}
                </CardTitle>
                <div className={`w-10 h-10 bg-[#3b82f6]/20 rounded flex items-center justify-center ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <CardDescription className="font-mono text-xs text-[#94a3b8]">
                {card.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <CardHeader>
            <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
              SALES_SUMMARY
            </CardTitle>
            <CardDescription className="font-mono text-xs text-[#94a3b8]">
              Revenue overview for selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">Total Revenue</span>
                <span className="font-mono text-lg font-bold text-white">$12,450.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">Total Sales</span>
                <span className="font-mono text-lg font-bold text-white">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">Average Order</span>
                <span className="font-mono text-lg font-bold text-white">$79.81</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">Growth</span>
                <span className="font-mono text-lg font-bold text-[#22d3ee] flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +12.5%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
          <CardHeader>
            <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
              JOB_SUMMARY
            </CardTitle>
            <CardDescription className="font-mono text-xs text-[#94a3b8]">
              Job completion statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">Total Jobs</span>
                <span className="font-mono text-lg font-bold text-white">84</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">Completed</span>
                <span className="font-mono text-lg font-bold text-[#22d3ee]">68</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">In Progress</span>
                <span className="font-mono text-lg font-bold text-[#3b82f6]">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#94a3b8]">Pending</span>
                <span className="font-mono text-lg font-bold text-[#ef4444]">4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
