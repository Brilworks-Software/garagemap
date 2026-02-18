"use client";

import { useState } from "react";
import {
  Settings,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConfigurePage() {
  const [activeTab, setActiveTab] = useState("settings");

  // Settings state
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [memberCount, setMemberCount] = useState("");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
          CONFIGURE
        </h1>
        <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
          {/* // */} MANAGE_SETTINGS_AND_USER_ACCOUNTS
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#1a1c1e] border border-white/10">
          <TabsTrigger
            value="settings"
            className="font-mono text-xs data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            SETTINGS
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="font-mono text-xs data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            USERS
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
            <CardHeader>
              <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
                SERVICE_INFORMATION
              </CardTitle>
              <CardDescription className="font-mono text-xs text-[#94a3b8]">
                Update your service details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-[#94a3b8] uppercase">
                    Service Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <Input
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Enter service name"
                      className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs text-[#94a3b8] uppercase">
                    Service Type
                  </Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="bg-[#1a1c1e] border-white/10 font-mono text-white">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#25282c] border-white/10">
                      <SelectItem value="garage" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Garage</SelectItem>
                      <SelectItem value="service" className="text-white font-mono hover:bg-white/10 focus:bg-white/10">Service Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs text-[#94a3b8] uppercase">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="service@example.com"
                      className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs text-[#94a3b8] uppercase">
                    Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="font-mono text-xs text-[#94a3b8] uppercase">
                    Address
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#94a3b8]" />
                    <Textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter full address"
                      className="pl-10 bg-[#1a1c1e] border-white/10 font-mono text-sm min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs text-[#94a3b8] uppercase">
                    Member Count
                  </Label>
                  <Input
                    type="number"
                    value={memberCount}
                    onChange={(e) => setMemberCount(e.target.value)}
                    placeholder="0"
                    className="bg-[#1a1c1e] border-white/10 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  className="font-mono uppercase border-white/20 bg-transparent hover:bg-white/10"
                  style={{ color: '#ffffff' }}
                >
                  CANCEL
                </Button>
                <Button className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                  <Save className="h-4 w-4 mr-2" />
                  SAVE CHANGES
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
            <CardHeader>
              <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
                USER_MANAGEMENT
              </CardTitle>
              <CardDescription className="font-mono text-xs text-[#94a3b8]">
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[#94a3b8] mx-auto mb-4" />
                <p className="font-mono text-sm text-[#94a3b8]">
                  User management feature coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
