import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FileText,
    Search,
    Filter,
    Calendar,
    Building2,
    Eye,
    Trash2,
    Download,
    MoreVertical,
    Layout as LayoutIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const MasterTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/templates/certificate/all");
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            toast({
                title: "Error",
                description: "Failed to load certificate templates",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm("Are you sure you want to delete this template? This cannot be undone.")) return;

        try {
            await api.delete(`/templates/certificate/${templateId}`);
            toast({
                title: "Deleted",
                description: "Template has been removed successfully",
            });
            setTemplates(templates.filter(t => t._id !== templateId));
        } catch (error) {
            console.error("Delete template error:", error);
            toast({
                title: "Error",
                description: "Failed to delete template",
                variant: "destructive",
            });
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.orgId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <LayoutIcon className="w-8 h-8 text-primary" />
                            Certificate Templates
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and monitor all certificate templates across the platform.
                        </p>
                    </div>
                    <Badge variant="outline" className="w-fit px-4 py-1 text-sm bg-primary/5 border-primary/20 text-primary">
                        Total Templates: {templates.length}
                    </Badge>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Global Templates</p>
                                    <h3 className="text-2xl font-bold mt-1">{templates.length}</h3>
                                </div>
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Add more stats if needed */}
                </div>

                {/* Filters & Search */}
                <Card className="border-0 shadow-sm bg-card">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search templates or organizations..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Templates List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <div className="aspect-[4/3] bg-muted m-4 rounded-md" />
                                <CardContent className="space-y-2 h-24" />
                            </Card>
                        ))
                    ) : filteredTemplates.length > 0 ? (
                        filteredTemplates.map((template) => (
                            <motion.div
                                key={template._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="overflow-hidden group border-border/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                                    {/* Template Preview Placeholder */}
                                    <div className="aspect-[4/3] bg-muted relative flex items-center justify-center p-4">
                                        <div className="w-full h-full border-2 border-dashed border-muted-foreground/20 rounded-md flex flex-col items-center justify-center gap-2 bg-card/50">
                                            <LayoutIcon className="w-12 h-12 text-muted-foreground/20" />
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-semibold">Preview (Encrypted)</span>
                                        </div>
                                        {template.isDefault && (
                                            <Badge className="absolute top-2 right-2 bg-success text-success-foreground border-0">
                                                Default
                                            </Badge>
                                        )}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-[10px] font-bold border">
                                            {template.width}x{template.height}{template.unit}
                                        </div>
                                    </div>

                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-lg truncate flex-1">{template.templateName}</h4>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/dashboard/templates/builder?id=${template._id}`)}>
                                                        <Eye className="w-4 h-4 mr-2" /> View/Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteTemplate(template._id)}>
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                <Building2 className="w-3.5 h-3.5" />
                                                <span className="truncate">{template.orgId?.name || "Unknown Org"}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t flex items-center justify-between">
                                            <Badge variant="secondary" className="capitalize text-[10px]">
                                                {template.orientation}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                ID: {template._id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <LayoutIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold">No templates found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                {searchTerm ? `No templates matching "${searchTerm}"` : "The platform doesn't have any templates yet."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MasterTemplates;
