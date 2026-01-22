import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Calendar, Building2, Trash2 } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const MasterCertificates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/certificates/all");
      if (response.data.success) {
        setCertificates(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate? This cannot be undone.")) {
      return;
    }

    try {
      const response = await api.delete(`/certificates/${id}`);
      if (response.data.success) {
        toast({
          title: "Certificate Deleted",
          description: "The certificate has been permanently removed.",
        });
        setCertificates(certificates.filter((cert) => cert._id !== id));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete certificate",
        variant: "destructive",
      });
    }
  };

  // Get unique organization names for filter
  const orgNames = Array.from(new Set(certificates.map(c => c.orgId?.name).filter(Boolean)));

  // Filter certificates
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      (cert.recipientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.courseName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.certificateId || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrg = orgFilter === "all" || cert.orgId?.name === orgFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const certDate = new Date(cert.issueDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);

      switch (dateFilter) {
        case "today":
          matchesDate = certDate >= today;
          break;
        case "month":
          matchesDate = certDate >= thisMonth;
          break;
        case "year":
          matchesDate = certDate >= thisYear;
          break;
      }
    }

    return matchesSearch && matchesOrg && matchesDate;
  });

  const getStatusVariant = (status: string) => {
    return status === "active" ? "verified" : "warning";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/master-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Master Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">All Issued Certificates</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all certificates issued across all organizations
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search certificates..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Date Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Issued Today</SelectItem>
                  <SelectItem value="month">Issued This Month</SelectItem>
                  <SelectItem value="year">Issued This Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {orgNames.map((name: any) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
            <CardDescription>
              Showing all certificates from all organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Certificate ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Recipient Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Organization Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Issue Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((cert) => (
                    <tr
                      key={cert._id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-foreground">{cert.certificateId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{cert.recipientName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{cert.orgId?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-muted-foreground">{cert.courseName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-muted-foreground">{new Date(cert.issueDate).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(cert.status)}>{cert.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteCertificate(cert._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredCertificates.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No certificates found matching your filters.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading certificates...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MasterCertificates;

