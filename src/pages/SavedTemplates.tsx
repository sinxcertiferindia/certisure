import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    FileText,
    Edit,
    Trash2,
    Layout as LayoutIcon,
    Clock,
    ArrowRight,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Badge } from "@/components/ui/badge";

const SavedTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/templates/certificate");
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            toast({
                title: "Error",
                description: "Failed to load saved templates.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            await api.delete(`/templates/certificate/${id}`);
            toast({
                title: "Success",
                description: "Template deleted successfully.",
            });
            fetchTemplates();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete template.",
                variant: "destructive",
            });
        }
    };

    const filteredTemplates = templates.filter((t: any) =>
        t.templateName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Saved Templates</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and customize your organization's certificate designs.
                    </p>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link to="/dashboard/templates/builder">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Template
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        className="pl-10 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredTemplates.length} Templates
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : filteredTemplates.length === 0 ? (
                <Card className="border-dashed py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-semibold">No Templates Found</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            {searchQuery ? "No templates match your search criteria." : "You haven't created any certificate templates yet."}
                        </p>
                        <Button asChild variant="outline" className="mt-6">
                            <Link to="/dashboard/templates/builder">
                                Get Started
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template: any) => (
                        <Card key={template._id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
                            <CardHeader className="p-0">
                                <div className="aspect-[1.414/1] bg-muted/30 relative flex items-center justify-center overflow-hidden border-b border-border/50">
                                    {/* Layout Preview Placeholder */}
                                    <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                                        <LayoutIcon className="w-20 h-20" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <Button asChild size="sm" variant="hero" className="w-full">
                                            <Link to={`/dashboard/templates/builder?id=${template._id}`}>
                                                <Edit className="w-3 h-3 mr-2" />
                                                Edit Template
                                            </Link>
                                        </Button>
                                    </div>
                                    {template.isDefault && (
                                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-sm">Default</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg leading-none">{template.templateName}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>Edited {new Date(template.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(template._id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="px-5 py-4 border-t border-border/50 bg-muted/20 flex justify-between items-center text-xs">
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1 font-medium capitalize">
                                        {template.orientation || 'landscape'}
                                    </span>
                                    <span className="text-border">|</span>
                                    <span className="uppercase font-mono text-[10px]">{template.width}x{template.height}{template.unit}</span>
                                </div>
                                <Link
                                    to={`/dashboard/templates/builder?id=${template._id}`}
                                    className="text-primary font-bold flex items-center gap-1 hover:underline"
                                >
                                    Details <ChevronRight className="w-3 h-3" />
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedTemplates;
