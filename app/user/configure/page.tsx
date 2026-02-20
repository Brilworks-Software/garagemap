"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Building2,
  Phone,
  MapPin,
  Save,
  Loader2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { colors, colorClasses } from "@/lib/colors";
import { AuthService } from "@/firebase/services/AuthService";
import { useGetUser } from "@/firebase/hooks/useUser";
import { useGetService, useUpdateService } from "@/firebase/hooks/useService";
import { useGetUsersByServiceId } from "@/firebase/hooks/useUser";
import { User } from "@/firebase/types";

export default function ConfigurePage() {
  const [activeTab, setActiveTab] = useState("settings");
  const [formError, setFormError] = useState("");

  // Get current user
  const currentUser = AuthService.getCurrentUser();
  const { data: userData } = useGetUser(currentUser?.uid || "", {
    enabled: !!currentUser?.uid,
  });

  // Get service data
  const serviceId = userData?.serviceId || "";
  const { data: serviceData, isLoading: isLoadingService } = useGetService(serviceId, {
    enabled: !!serviceId,
  });

  // Get users for the service
  const { data: serviceUsers = [], isLoading: isLoadingUsers } = useGetUsersByServiceId(serviceId, {
    enabled: !!serviceId,
  });

  console.log("Service type",serviceData?.serviceType);

  // Settings state - initialize from serviceData
  const [serviceName, setServiceName] = useState(serviceData?.serviceName || "");
  const [serviceType, setServiceType] = useState<"garage" | "service" | null>(serviceData?.serviceType || null);
  const [phone, setPhone] = useState(serviceData?.phoneNumber || "");
  const [address, setAddress] = useState(serviceData?.address || "");
  const [memberCount, setMemberCount] = useState(serviceData?.memberCount?.toString() || "");

  // Update mutation
  const updateServiceMutation = useUpdateService();

  // Update form when service data changes
  useEffect(() => {
    if (serviceData) {
      setServiceName(serviceData.serviceName || "");
      setServiceType(serviceData?.serviceType?.toLowerCase() || "");
      setPhone(serviceData.phoneNumber || "");
      setAddress(serviceData.address || "");
      setMemberCount(serviceData.memberCount?.toString() || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceData?.serviceId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!serviceId) {
      setFormError("Service ID not found.");
      return;
    }

    try {
      await updateServiceMutation.mutateAsync({
        serviceId,
        data: {
          serviceName: serviceName || null,
          serviceType: serviceType,
          phoneNumber: phone || null,
          address: address || null,
          memberCount: memberCount ? parseInt(memberCount) : null,
        },
      });
      alert("Settings saved successfully!");
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || "Failed to save settings. Please try again.");
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    try {
      const dateObj = date instanceof Date 
        ? date 
        : (date as { toDate?: () => Date; seconds?: number }).toDate?.() 
        || new Date((date as { seconds: number }).seconds * 1000);
      return dateObj.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "owner":
        return (
          <Badge className={colorClasses.badgeInfo}>
            Owner
          </Badge>
        );
      case "member":
        return (
          <Badge className={colorClasses.badgeMuted}>
            Member
          </Badge>
        );
      default:
        return <Badge className={colorClasses.badgeMuted}>Unknown</Badge>;
    }
  };

  if (isLoadingService) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`h-8 w-8 animate-spin ${colorClasses.textBlue}`} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className={`text-4xl font-black tracking-tight ${colorClasses.textPrimary} mb-2 font-mono uppercase`}>
          CONFIGURE
        </h1>
        <p className={`font-mono text-sm ${colorClasses.textSecondary} uppercase tracking-wider`}>
          {/* // */} MANAGE_SETTINGS_AND_USER_ACCOUNTS
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex gap-6 flex-col">

          <TabsList 
            style={{ backgroundColor: colors.background.input }}
            className={`flex h-auto w-48 items-stretch ${colorClasses.borderHover}`}
          >
            <TabsTrigger
              value="settings"
              className={`w-full justify-start font-mono text-xs data-[state=active]:${colorClasses.textPrimary}`}
              style={{ 
                backgroundColor: activeTab === 'settings' ? colors.primary.blue : 'transparent',
                color: activeTab === 'settings' ? colors.text.primary : colors.text.secondary
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              SETTINGS
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className={`w-full justify-start font-mono text-xs data-[state=active]:${colorClasses.textPrimary}`}
              style={{ 
                backgroundColor: activeTab === 'users' ? colors.primary.blue : 'transparent',
                color: activeTab === 'users' ? colors.text.primary : colors.text.secondary
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              USERS
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1">

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
            <CardHeader>
              <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
                SERVICE_INFORMATION
              </CardTitle>
              <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                Update your service details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSaveSettings}>
                {formError && (
                  <div className={`${colorClasses.badgeError.replace('hover:bg-[#ef4444]/30', '')} border rounded p-3 mb-4`} style={{ borderColor: `${colors.primary.red}80` }}>
                    <p className={`font-mono text-xs ${colorClasses.textRed}`}>{formError}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                      Service Name
                    </Label>
                    <div className="relative">
                      <Building2 className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colorClasses.textSecondary}`} />
                      <Input
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Enter service name"
                        style={{ backgroundColor: colors.background.input }}
                        className={`pl-10 ${colorClasses.borderInput} font-mono text-sm text-white`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                      Service Type
                    </Label>
                    <Select 
                      value={serviceType || ""} 
                      onValueChange={(value) => setServiceType(value as "garage" | "service" | null)}
                    >
                      <SelectTrigger 
                        style={{ backgroundColor: colors.background.input }}
                        className={`${colorClasses.borderInput} font-mono ${colorClasses.textPrimary}`}
                      >
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent 
                        style={{ backgroundColor: colors.background.surface }}
                        className={colorClasses.borderInput}
                      >
                        <SelectItem value="garage" className={`${colorClasses.textPrimary} font-mono `}>Garage</SelectItem>
                        <SelectItem value="service" className={`${colorClasses.textPrimary} font-mono `}>Service Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                      Phone
                    </Label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colorClasses.textSecondary}`} />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        style={{ backgroundColor: colors.background.input }}
                        className={`pl-10 ${colorClasses.borderInput} font-mono text-sm text-white`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                      Member Count
                    </Label>
                    <Input
                      type="number"
                      value={memberCount}
                      onChange={(e) => setMemberCount(e.target.value)}
                      placeholder="0"
                      style={{ backgroundColor: colors.background.input }}
                      className={`${colorClasses.borderInput} font-mono text-sm text-white`}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className={`font-mono text-xs ${colorClasses.textSecondary} uppercase`}>
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className={`absolute left-3 top-3 h-4 w-4 ${colorClasses.textSecondary}`} />
                      <Textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address"
                        style={{ backgroundColor: colors.background.input }}
                        className={`pl-10 ${colorClasses.borderInput} font-mono text-sm min-h-[80px] text-white`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`flex justify-end gap-4 pt-4 border-t ${colorClasses.borderHover} mt-6`}>
                  <Button
                    type="submit"
                    disabled={updateServiceMutation.isPending}
                    className={`font-mono uppercase ${colorClasses.buttonPrimary}`}
                  >
                    {updateServiceMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        SAVE CHANGES
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className={`${colorClasses.cardGradient} ${colorClasses.borderDefault} shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]`}>
            <CardHeader>
              <CardTitle className={`font-mono text-xs ${colorClasses.textBlue} uppercase tracking-wider`}>
                USER_MANAGEMENT
              </CardTitle>
              <CardDescription className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                Manage user accounts and permissions ({serviceUsers.length} users)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`h-8 w-8 animate-spin ${colorClasses.textBlue}`} />
                </div>
              ) : serviceUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className={`h-12 w-12 ${colorClasses.textSecondary} mx-auto mb-4`} />
                  <p className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                    No users found for this service
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className={`${colorClasses.borderHover} hover:bg-white/5`}>
                      <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>User ID</TableHead>
                      <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Name</TableHead>
                      <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Email</TableHead>
                      <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Role</TableHead>
                      <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Owner Name</TableHead>
                      <TableHead className={`font-mono text-xs uppercase ${colorClasses.textSecondary}`}>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceUsers.map((user: User) => (
                      <TableRow key={user.uid} className={`${colorClasses.borderHover} hover:bg-white/5`}>
                        <TableCell className={`font-mono text-sm font-bold ${colorClasses.textPrimary}`}>
                          {user.uid.substring(0, 8)}...
                        </TableCell>
                        <TableCell className={`font-mono text-sm ${colorClasses.textPrimary}`}>
                          {user.displayName || "N/A"}
                        </TableCell>
                        <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                          {user.email || "N/A"}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.userRole)}
                        </TableCell>
                        <TableCell className={`font-mono text-sm ${colorClasses.textSecondary}`}>
                          {user.ownerName || "N/A"}
                        </TableCell>
                        <TableCell className={`font-mono text-xs ${colorClasses.textSecondary}`}>
                          {formatDate(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
