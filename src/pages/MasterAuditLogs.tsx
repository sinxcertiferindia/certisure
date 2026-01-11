import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Filter, RefreshCcw } from "lucide-react";
import api from "@/services/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const MasterAuditLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("all");
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchLogs();
    }, [actionFilter]);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            let url = "/audit-logs";
            if (actionFilter !== "all") {
                url += `?action=${actionFilter}`;
            }

            const response = await api.get(url);
            if (response.data.success) {
                setLogs(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch logs:", error);
            toast({
                title: "Error",
                description: "Failed to load audit logs",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearLogs = async () => {
        if (!window.confirm("Are you sure you want to delete ALL logs? This cannot be undone.")) {
            return;
        }

        try {
            const response = await api.delete("/audit-logs/all");
            if (response.data.success) {
                toast({ title: "Success", description: "All logs cleared." });
                fetchLogs();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to clear logs", variant: "destructive" });
        }
    };

    const handleDeleteLog = async (logId: string) => {
        try {
            const response = await api.delete(`/audit-logs/${logId}`);
            if (response.data.success) {
                setLogs(logs.filter(l => l._id !== logId));
                toast({ title: "Deleted", description: "Log entry removed." });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete log", variant: "destructive" });
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/master-dashboard")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
                            <Badge variant="active">Master Admin</Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                                <SelectItem value="ORGANIZATION_REGISTERED">Org Registered</SelectItem>
                                <SelectItem value="CERTIFICATE_ISSUED">Certificate Issued</SelectItem>
                                <SelectItem value="USER_DELETED_BY_MASTER">User Deleted</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" onClick={fetchLogs} title="Refresh">
                            <RefreshCcw className="w-4 h-4" />
                        </Button>

                        <Button variant="destructive" size="sm" onClick={handleClearLogs}>
                            <Trash2 className="w-4 h-4 mr-2" /> Clear All Logs
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6">
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 text-center">Loading logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No logs found</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {logs.map((log) => (
                                    <div key={log._id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{log.action}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{log.orgId?.name || "System"}</span>
                                                <span className="text-xs text-muted-foreground">Org</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{log.userId?.email || "Unknown"}</span>
                                                <span className="text-xs text-muted-foreground">User</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono text-muted-foreground">{log.ipAddress || "N/A"}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeleteLog(log._id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default MasterAuditLogs;
