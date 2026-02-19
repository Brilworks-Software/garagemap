"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Shield,
  Edit,
  Trash2,
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
import { colors, colorClasses } from "@/lib/colors";

export default function PolicyManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const policies = [
    { id: "POL-001", name: "Warranty Policy", type: "Warranty", description: "Standard warranty coverage for all services", status: "Active", lastUpdated: "2024-01-15" },
    { id: "POL-002", name: "Return Policy", type: "Returns", description: "Parts return and refund policy", status: "Active", lastUpdated: "2024-01-10" },
    { id: "POL-003", name: "Payment Terms", type: "Payment", description: "Payment terms and conditions", status: "Active", lastUpdated: "2024-01-08" },
    { id: "POL-004", name: "Cancellation Policy", type: "Cancellation", description: "Service cancellation and refund policy", status: "Draft", lastUpdated: "2024-01-05" },
  ];

  const filteredPolicies = policies.filter((policy) =>
    policy.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className={colorClasses.badgeSuccess}>
            Active
          </Badge>
        );
      case "Draft":
        return (
          <Badge className={colorClasses.badgeMuted}>
            Draft
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className={colorClasses.badgeError}>
            Inactive
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
            POLICY_MANAGEMENT
          </h1>
          <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
            {/* // */} MANAGE_BUSINESS_POLICIES_AND_TERMS
          </p>
        </div>
        <Button className={`font-mono uppercase ${colorClasses.buttonPrimary}`}>
          <Plus className="h-4 w-4" />
          CREATE POLICY
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Total Policies</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>{policies.length}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Active</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
                  {policies.filter((p) => p.status === "Active").length}
                </p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgCyan} rounded flex items-center justify-center`}>
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Draft</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>
                  {policies.filter((p) => p.status === "Draft").length}
                </p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgMuted} rounded flex items-center justify-center`}>
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-mono text-xs ${colorClasses.textSecondary} uppercase mb-1`}>Policy Types</p>
                <p className={`text-2xl font-bold ${colorClasses.textPrimary}`}>4</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.iconBgBlue} rounded flex items-center justify-center`}>
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardContent className="pt-6">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colorClasses.textSecondary}`} />
            <Input
              placeholder="Search policies by ID, name, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: colors.background.input }}
              className={`pl-10 ${colorClasses.borderInput} font-mono text-sm`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
        <CardHeader>
          <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
            ALL_POLICIES
          </CardTitle>
          <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
            Total: {filteredPolicies.length} policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Policy ID</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Name</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Type</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Description</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Status</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Last Updated</TableHead>
                <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className={`text-center py-8 ${colorClasses.textSecondary} font-mono`}>
                    No policies found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPolicies.map((policy) => (
                  <TableRow key={policy.id} className={`${colorClasses.borderHover} hover:bg-white/5`}>
                    <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                      {policy.id}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                      {policy.name}
                    </TableCell>
                    <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                      {policy.type}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary} max-w-xs truncate`}>
                      {policy.description}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(policy.status)}
                    </TableCell>
                    <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                      {policy.lastUpdated}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
