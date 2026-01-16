import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft as ArrowLeftIcon,
  Save as SaveIcon,
  Type as TypeIcon,
  Image as ImageIcon,
  PenTool as PenToolIcon,
  Trash2 as TrashIcon,
  Move as MoveIcon,
  Layers as LayersIcon,
  Upload as UploadIcon,
  X as XIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Bold as BoldIcon,
  Underline as UnderlineIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  Palette as PaletteIcon,
  Maximize as MaximizeIcon,
  Grid as GridIcon,
  Lock as LockIcon,
  Layout as LayoutIcon,
  QrCode as QrCodeIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CanvasElement {
  id: string;
  type: "text" | "logo" | "signature" | "shape" | "qrcode";
  shapeType?: "rectangle" | "circle" | "line";
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string; // Border color or text color
  fillColor?: string; // Background color for shapes
  strokeWidth?: number;
  borderRadius?: number;
  opacity?: number;
  align?: string;
  imageUrl?: string;
  placeholder?: boolean;
  textDecoration?: string;
  padding?: number;
}

const CertificateBuilder = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasBgColor, setCanvasBgColor] = useState("#ffffff");
  const [canvasBgImage, setCanvasBgImage] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [canvasSize, setCanvasSize] = useState({ width: 297, height: 210, unit: "mm" });
  const [zoom, setZoom] = useState(0.75);

  const [templateName, setTemplateName] = useState("");
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("FREE");
  const [permissions, setPermissions] = useState<any>({});
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Check subscription plan
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const response = await api.get("/users/me");
        if (response.data.success) {
          const org = response.data.data.organization;
          const planName = org.plan?.planName || org.subscriptionPlan || "FREE";
          setSubscriptionPlan(planName);

          const fetchedPermissions = org.plan?.permissions || {};

          // Fallback: Force enable PRO features if plan indicates PRO/ENTERPRISE
          const isPro = ["PRO", "ENTERPRISE", "PRO_PLAN", "ENTERPRISE_PLAN"].includes(planName) ||
            ["PRO", "ENTERPRISE"].includes(org.subscriptionPlan || "");

          if (isPro) {
            const allTools = {
              textEditing: true,
              logoUpload: true,
              signatureUpload: true,
              backgroundImage: true,
              backgroundColor: true,
              shapes: true,
              icons: true,
              qrCode: true,
              layers: true,
              advancedColors: true,
              typography: true,
              sizeControl: true,
              fontStyle: true
            };

            if (!fetchedPermissions.editorTools) {
              fetchedPermissions.editorTools = allTools;
            } else {
              // Ensure ALL critical tools are unlocked by merging
              fetchedPermissions.editorTools = {
                ...fetchedPermissions.editorTools,
                ...allTools
              };
            }
            fetchedPermissions.customTemplates = true;
          } else {
            // FREE Plan - Ensure Logo/Signature are allowed
            if (!fetchedPermissions.editorTools) {
              fetchedPermissions.editorTools = {};
            }
            // Explicitly allow allowed tools
            fetchedPermissions.editorTools.logoUpload = true;
            fetchedPermissions.editorTools.signatureUpload = true;

            // Ensure reduced tools are disabled (just in case)
            fetchedPermissions.editorTools.textEditing = false;
            fetchedPermissions.editorTools.shapes = false;
            fetchedPermissions.editorTools.backgroundColor = false;
          }

          setPermissions(fetchedPermissions);

          if (org.plan?.planName === "FREE") {
            toast({
              title: "Free Plan Mode",
              description: "Some design tools are restricted. Upgrade to Pro for full control.",
            });
          }
        }
        setIsLoadingPlan(false);
      } catch (error) {
        console.error("Failed to load organization:", error);
        setIsLoadingPlan(false);
      }
    };
    loadOrganization();
  }, [navigate, toast]);

  // Load existing template from API
  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          const response = await api.get(`/templates/certificate/${templateId}`);
          const template = response.data.data;

          setTemplateName(template.templateName);

          // Parse canvasJSON
          let canvasData;
          try {
            canvasData = typeof template.canvasJSON === 'string'
              ? JSON.parse(template.canvasJSON)
              : template.canvasJSON;
          } catch (e) {
            canvasData = {};
          }

          if (Array.isArray(canvasData)) {
            // Legacy format or direct array
            setElements(canvasData);
          } else {
            // New format with background color and orientation
            setElements(canvasData.elements || []);
            setCanvasBgColor(canvasData.backgroundColor || "#ffffff");
            setCanvasBgImage(canvasData.backgroundImage || null);
            setOrientation(canvasData.orientation || "landscape");
          }

        } catch (error) {
          console.error("Failed to load template:", error);
          toast({
            title: "Error",
            description: "Failed to load template details",
            variant: "destructive",
          });
        }
      }
    };

    if (templateId && !isLoadingPlan) {
      loadTemplate();
    } else if (!templateId && !isLoadingPlan) {
      // Default to classic for new templates
      applyStarterTemplate('classic');
    }
  }, [templateId, isLoadingPlan, toast]);

  const compressImage = (base64Str: string, maxWidth: number = 800, maxHeight: number = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 quality
      };
    });
  };

  const handleAddText = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "text",
      content: "New Text",
      x: 50,
      y: 50,
      fontSize: 24,
      fontWeight: "normal",
      fontFamily: "Arial, sans-serif",
      color: "#000000",
      align: "center",
      textDecoration: "none",
      padding: 0,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleAddLogo = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const compressed = await compressImage(event.target?.result as string);
          const newElement: CanvasElement = {
            id: Date.now().toString(),
            type: "logo",
            x: 10,
            y: 10,
            width: 150,
            height: 150,
            imageUrl: compressed,
          };
          setElements([...elements, newElement]);
          setSelectedElement(newElement.id);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddSignature = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const compressed = await compressImage(event.target?.result as string);
          const newElement: CanvasElement = {
            id: Date.now().toString(),
            type: "signature",
            x: 70,
            y: 85,
            width: 200,
            height: 80,
            imageUrl: compressed,
          };
          setElements([...elements, newElement]);
          setSelectedElement(newElement.id);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddShape = (shapeType: "rectangle" | "circle" | "line") => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "shape",
      shapeType,
      x: 50,
      y: 50,
      width: shapeType === "line" ? 200 : 100,
      height: shapeType === "line" ? 2 : 100,
      fillColor: shapeType === "line" ? "#000000" : "transparent",
      color: "#000000",
      strokeWidth: 2,
      borderRadius: shapeType === "circle" ? 100 : 0,
      opacity: 1,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleAddQRCode = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "qrcode",
      x: 80,
      y: 80,
      width: 80,
      height: 80,
      placeholder: true,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleDelete = () => {
    if (selectedElement) {
      setElements(elements.filter((el) => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const applyStarterTemplate = (type: 'classic' | 'modern' | 'minimal') => {
    if (elements.length > 0 && !confirm("This will replace your current design. Continue?")) return;

    let starterElements: CanvasElement[] = [];

    if (type === 'classic') {
      starterElements = [
        { id: '1', type: 'shape', shapeType: 'rectangle', x: 50, y: 50, width: 95, height: 95, color: '#b8860b', fillColor: 'transparent', strokeWidth: 5 },
        { id: '2', type: 'text', content: 'CERTIFICATE OF COMPLETION', x: 50, y: 25, fontSize: 32, fontWeight: 'bold', fontFamily: 'serif', color: '#1a1a1a', align: 'center' },
        { id: '3', type: 'text', content: 'This is to certify that', x: 50, y: 38, fontSize: 18, align: 'center' },
        { id: '4', type: 'text', content: '{{recipient_name}}', x: 50, y: 50, fontSize: 42, fontWeight: 'bold', fontFamily: 'serif', color: '#b8860b', align: 'center' },
        { id: '5', type: 'text', content: 'has successfully completed', x: 50, y: 62, fontSize: 18, align: 'center' },
        { id: '6', type: 'text', content: '{{course_name}}', x: 50, y: 72, fontSize: 24, fontWeight: 'bold', align: 'center' },
        { id: '7', type: 'shape', shapeType: 'line', x: 30, y: 85, width: 150, height: 1, color: '#000', fillColor: '#000' },
        { id: '8', type: 'shape', shapeType: 'line', x: 70, y: 85, width: 150, height: 1, color: '#000', fillColor: '#000' },
        { id: '9', type: 'text', content: 'Principal Signature', x: 30, y: 90, fontSize: 12, align: 'center' },
        { id: '10', type: 'text', content: 'Director Signature', x: 70, y: 90, fontSize: 12, align: 'center' }
      ];
    } else if (type === 'modern') {
      starterElements = [
        { id: '1', type: 'shape', shapeType: 'rectangle', x: 10, y: 50, width: 20, height: 100, color: 'transparent', fillColor: '#3b82f6', opacity: 0.1 },
        { id: '2', type: 'text', content: 'CERTIFICATE', x: 60, y: 20, fontSize: 48, fontWeight: 'bold', color: '#1e3a8a', align: 'left' },
        { id: '3', type: 'text', content: 'OF ACHIEVEMENT', x: 60, y: 28, fontSize: 24, color: '#3b82f6', align: 'left' },
        { id: '4', type: 'text', content: '{{recipient_name}}', x: 60, y: 50, fontSize: 36, fontWeight: 'bold', align: 'left' },
        { id: '5', type: 'text', content: 'For excellence in {{course_name}}', x: 60, y: 60, fontSize: 18, align: 'left' },
        { id: '6', type: 'shape', shapeType: 'circle', x: 15, y: 85, width: 80, height: 80, color: '#3b82f6', fillColor: '#3b82f6', opacity: 0.2 }
      ];
    } else if (type === 'minimal') {
      starterElements = [
        { id: '1', type: 'text', content: 'C E R T I F I C A T E', x: 50, y: 15, fontSize: 14, color: '#666', align: 'center' },
        { id: '2', type: 'text', content: '{{recipient_name}}', x: 50, y: 45, fontSize: 48, fontWeight: 'normal', align: 'center' },
        { id: '3', type: 'shape', shapeType: 'line', x: 50, y: 55, width: 300, height: 1, color: '#eee', fillColor: '#eee' },
        { id: '4', type: 'text', content: '{{course_name}}', x: 50, y: 65, fontSize: 16, align: 'center' }
      ];
    }

    setElements(starterElements);
    setTemplateName(`Starter ${type.charAt(0).toUpperCase() + type.slice(1)}`);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    const element = elements.find((el) => el.id === elementId);
    if (element && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left - (element.x * rect.width) / 100,
        y: e.clientY - rect.top - (element.y * rect.height) / 100,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
      const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

      setElements(
        elements.map((el) =>
          el.id === selectedElement
            ? { ...el, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
            : el
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleBringToFront = () => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const others = elements.filter(el => el.id !== selectedElement);
    setElements([...others, element]);
  };

  const handleSendToBack = () => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const others = elements.filter(el => el.id !== selectedElement);
    setElements([element, ...others]);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const canvasJSON = {
        elements,
        backgroundColor: canvasBgColor,
        backgroundImage: canvasBgImage,
        orientation,
      };

      if (templateId) {
        // Update existing
        await api.put(`/templates/certificate/${templateId}`, {
          templateName,
          canvasJSON,
          width: canvasSize.width,
          height: canvasSize.height,
          unit: canvasSize.unit,
          orientation,
          backgroundColor: canvasBgColor,
          backgroundImage: canvasBgImage,
        });
        toast({
          title: "Success",
          description: "Template updated successfully.",
        });
      } else {
        // Create new
        await api.post("/templates/certificate", {
          templateName,
          canvasJSON,
          width: canvasSize.width,
          height: canvasSize.height,
          unit: canvasSize.unit,
          orientation,
          backgroundColor: canvasBgColor,
          backgroundImage: canvasBgImage,
        });
        toast({
          title: "Success",
          description: "Template created successfully.",
        });
      }
      navigate("/dashboard/templates");
    } catch (error: any) {
      console.error("Save template error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElementData = elements.find((el) => el.id === selectedElement);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>

        {/* Top Header Bar */}
        <div className="border-b border-border bg-card p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/templates")}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Label className="hidden sm:block">Template Name:</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Certificate Template Name"
              className="w-64"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Orientation Toggle */}
            <div className="flex bg-muted rounded-md p-1 items-center">
              <Button
                variant={orientation === "landscape" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setOrientation("landscape")}
              >
                <LayoutIcon className="w-3 h-3 mr-1 rotate-90" /> Landscape
              </Button>
              <Button
                variant={orientation === "portrait" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setOrientation("portrait")}
              >
                <LayoutIcon className="w-3 h-3 mr-1" /> Portrait
              </Button>
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            <div className="flex items-center bg-muted rounded-md p-1 gap-1">
              <Select
                value={(zoom * 100).toFixed(0)}
                onValueChange={(val) => setZoom(Number(val) / 100)}
              >
                <SelectTrigger className="h-7 w-20 text-[10px] font-bold">
                  <SelectValue placeholder="Zoom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="60">60%</SelectItem>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Sidebar Toggles */}
            <div className="flex bg-muted rounded-md p-1 gap-1">
              <Button
                variant={showLeftSidebar ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                title={showLeftSidebar ? "Hide Tools" : "Show Tools"}
              >
                <PlusIcon className={`w-3 h-3 transition-transform ${showLeftSidebar ? "" : "rotate-45"}`} />
              </Button>
              <Button
                variant={showRightSidebar ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                title={showRightSidebar ? "Hide Properties" : "Show Properties"}
              >
                <LayoutIcon className="w-3 h-3" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border mx-2" />

            <Button variant="hero" onClick={handleSave} disabled={isSaving}>
              <SaveIcon className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Sidebar - Tools */}
          {showLeftSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-64 border-r border-border bg-card p-4 space-y-6 overflow-y-auto z-20"
            >
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" /> Add Elements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddText}
                            disabled={!permissions.editorTools?.textEditing}
                            className="w-full flex flex-col h-auto py-4 hover:bg-muted/50 transition-colors relative"
                          >
                            <TypeIcon className="w-6 h-6 mb-2 text-primary" />
                            <span className="text-xs font-medium">Text</span>
                            {!permissions.editorTools?.textEditing && <LockIcon className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!permissions.editorTools?.textEditing && (
                        <TooltipContent><p>Upgrade to Pro to add text</p></TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddLogo}
                            disabled={!permissions.editorTools?.logoUpload}
                            className="w-full flex flex-col h-auto py-4 hover:bg-muted/50 transition-colors relative"
                          >
                            <ImageIcon className="w-6 h-6 mb-2 text-primary" />
                            <span className="text-xs font-medium">Logo</span>
                            {!permissions.editorTools?.logoUpload && <LockIcon className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!permissions.editorTools?.logoUpload && (
                        <TooltipContent><p>Upgrade to Pro to upload logos</p></TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddSignature}
                            disabled={!permissions.editorTools?.signatureUpload}
                            className="w-full flex flex-col h-auto py-4 hover:bg-muted/50 transition-colors relative"
                          >
                            <PenToolIcon className="w-6 h-6 mb-2 text-primary" />
                            <span className="text-xs font-medium">Signature</span>
                            {!permissions.editorTools?.signatureUpload && <LockIcon className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!permissions.editorTools?.signatureUpload && (
                        <TooltipContent><p>Upgrade to Pro to upload signatures</p></TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddQRCode}
                            disabled={!permissions.editorTools?.qrCode}
                            className="w-full flex flex-col h-auto py-4 hover:bg-muted/50 transition-colors relative"
                          >
                            <QrCodeIcon className="w-6 h-6 mb-2 text-primary" />
                            <span className="text-xs font-medium">QR Code</span>
                            {!permissions.editorTools?.qrCode && <LockIcon className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!permissions.editorTools?.qrCode && (
                        <TooltipContent><p>Upgrade to Pro to add QR codes</p></TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={!selectedElement || (subscriptionPlan === "FREE" && selectedElementData?.type !== "logo" && selectedElementData?.type !== "signature")}
                            className="w-full flex flex-col h-auto py-4 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 relative"
                          >
                            <TrashIcon className="w-6 h-6 mb-2" />
                            <span className="text-xs font-medium">Delete</span>
                            {subscriptionPlan === "FREE" && selectedElement && selectedElementData?.type !== "logo" && selectedElementData?.type !== "signature" && (
                              <LockIcon className="w-3 h-3 absolute top-1 right-1" />
                            )}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {subscriptionPlan === "FREE" && selectedElement && selectedElementData?.type !== "logo" && selectedElementData?.type !== "signature" && (
                        <TooltipContent><p>Free users can only delete logos/signatures</p></TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
                  <MaximizeIcon className="w-4 h-4 mr-2" /> Shapes
                </h3>
                <div className="grid grid-cols-3 gap-2 relative">
                  <Button variant="outline" size="icon" onClick={() => handleAddShape("rectangle")} disabled={!permissions.editorTools?.shapes}>
                    <div className="w-5 h-4 border-2 border-primary rounded-sm" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleAddShape("circle")} disabled={!permissions.editorTools?.shapes}>
                    <div className="w-5 h-5 border-2 border-primary rounded-full" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleAddShape("line")} disabled={!permissions.editorTools?.shapes}>
                    <div className="w-6 h-0.5 bg-primary" />
                  </Button>
                  {!permissions.editorTools?.shapes && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-md cursor-not-allowed group">
                      <LockIcon className="w-4 h-4 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground font-bold opacity-0 group-hover:opacity-100 transition-opacity">PRO ONLY</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
                  <LayoutIcon className="w-4 h-4 mr-2" /> Starter Templates
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-left justify-start" onClick={() => applyStarterTemplate('classic')}>
                    Classic Certificate
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-left justify-start" onClick={() => applyStarterTemplate('modern')}>
                    Modern Achievement
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-left justify-start" onClick={() => applyStarterTemplate('minimal')}>
                    Minimal Professional
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
                  <PaletteIcon className="w-4 h-4 mr-2" /> Canvas Style
                </h3>
                <div className="relative">
                  <Label className="text-xs text-muted-foreground mb-2 block">Background Color</Label>
                  <div className="flex gap-2 items-center">
                    <div className="relative overflow-hidden w-10 h-10 rounded-md border shadow-sm">
                      <Input
                        type="color"
                        value={canvasBgColor}
                        onChange={(e) => setCanvasBgColor(e.target.value)}
                        disabled={!permissions.editorTools?.backgroundColor}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 cursor-pointer border-none"
                      />
                    </div>
                    <Input
                      value={canvasBgColor}
                      onChange={(e) => setCanvasBgColor(e.target.value)}
                      disabled={!permissions.editorTools?.backgroundColor}
                      className="flex-1 font-mono text-xs uppercase"
                    />
                  </div>
                  {!permissions.editorTools?.backgroundColor && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-md cursor-not-allowed z-10">
                      <LockIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="pt-2 relative">
                  <Label className="text-xs text-muted-foreground mb-2 block">Background Image</Label>
                  <div className="space-y-2">
                    {canvasBgImage ? (
                      <div className="relative group aspect-video rounded-md overflow-hidden border">
                        <img src={canvasBgImage} className="w-full h-full object-cover" alt="Background" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setCanvasBgImage(null)}
                          disabled={!permissions.editorTools?.backgroundImage}
                        >
                          <XIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full relative"
                        onClick={() => document.getElementById('bg-upload')?.click()}
                        disabled={!permissions.editorTools?.backgroundImage}
                      >
                        <UploadIcon className="w-3 h-3 mr-2" />
                        Upload Image
                        {!permissions.editorTools?.backgroundImage && <LockIcon className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />}
                      </Button>
                    )}
                    <input
                      type="file"
                      id="bg-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            const compressed = await compressImage(ev.target?.result as string, 1200, 1200);
                            setCanvasBgImage(compressed);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {!permissions.editorTools?.backgroundImage && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-md cursor-not-allowed z-10">
                      <LockIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
                  <GridIcon className="w-4 h-4 mr-2" /> Placeholders
                </h3>
                <div className="space-y-1">
                  {[
                    { label: "Recipient Name", val: "{{recipient_name}}" },
                    { label: "Course Name", val: "{{course_name}}" },
                    { label: "Issue Date", val: "{{issue_date}}" },
                    { label: "Org Name", val: "{{organization_name}}" },
                    { label: "Cert. Type", val: "{{certificate_type}}" },
                    { label: "Cert. ID", val: "{{certificate_id}}" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => {
                        // Logic to insert placeholder
                        if (selectedElementData?.type === "text") {
                          const newContent = (selectedElementData.content || "") + item.val;
                          setElements(elements.map(el => el.id === selectedElement ? { ...el, content: newContent } : el));
                        } else if (!selectedElement) {
                          const newElement: CanvasElement = {
                            id: Date.now().toString(),
                            type: "text",
                            content: item.val,
                            x: 50, y: 50, fontSize: 24, fontWeight: "normal", fontFamily: "Arial, sans-serif",
                            color: "#000000", align: "center", textDecoration: "none",
                          };
                          setElements([...elements, newElement]);
                          setSelectedElement(newElement.id);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs bg-muted/50 hover:bg-muted rounded-md transition-colors flex items-center justify-between group"
                      disabled={selectedElementData?.type === "logo" || selectedElementData?.type === "signature"}
                    >
                      <span>{item.label}</span>
                      <PlusIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
                {!selectedElementData && (
                  <p className="text-[10px] text-muted-foreground mt-2 italic px-1">
                    Tip: Click to add a new text element with this placeholder.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Center - Canvas Area */}
          <div className="flex-1 overflow-auto bg-muted/20 relative flex items-center justify-center min-h-0">
            {/* Canvas Container */}
            <div
              className="relative shadow-2xl transition-all duration-300 transform-gpu"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <div
                ref={canvasRef}
                className="bg-white"
                style={{
                  width: orientation === 'landscape' ? `${canvasSize.width}mm` : `${canvasSize.height}mm`,
                  height: orientation === 'landscape' ? `${canvasSize.height}mm` : `${canvasSize.width}mm`,
                  position: "relative",
                  cursor: isDragging ? "grabbing" : "default",
                  backgroundColor: canvasBgColor,
                  backgroundImage: canvasBgImage ? `url(${canvasBgImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  overflow: "hidden",
                  border: "1px solid #ddd",
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element.id);
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                    className={`absolute ${selectedElement === element.id
                      ? "ring-2 ring-primary ring-offset-2 outline-none"
                      : "hover:ring-1 hover:ring-primary/30"
                      } cursor-move group select-none transition-shadow`}
                    style={{
                      left: `${element.x}%`,
                      top: `${element.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: index + 1,
                    }}
                  >
                    {element.type === "text" && (
                      <div
                        style={{
                          fontSize: `${element.fontSize || 16}px`,
                          fontWeight: element.fontWeight || "normal",
                          fontFamily: element.fontFamily || "Arial, sans-serif",
                          color: element.color || "#000000",
                          textAlign: (element.align as any) || "left",
                          textDecoration: element.textDecoration || "none",
                          padding: `${element.padding || 0}px`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {element.content || "Text"}
                      </div>
                    )}
                    {(element.type === "logo" || element.type === "signature") && (
                      <div
                        style={{
                          width: `${element.width || 100}px`,
                          height: `${element.height || 50}px`,
                          border: element.placeholder ? "2px dashed #ccc" : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: element.placeholder ? "#f5f5f5" : "transparent",
                        }}
                      >
                        {element.imageUrl ? (
                          <img
                            src={element.imageUrl}
                            alt={element.type}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {element.type === "logo" ? "Logo" : "Signature"}
                          </span>
                        )}
                      </div>
                    )}
                    {element.type === "qrcode" && (
                      <div
                        style={{
                          width: `${element.width || 80}px`,
                          height: `${element.height || 80}px`,
                          border: "1px dashed #ccc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f9f9f9",
                        }}
                      >
                        <QrCodeIcon className="w-1/2 h-1/2 text-muted-foreground opacity-50" />
                        <span className="absolute bottom-1 text-[8px] text-muted-foreground uppercase font-bold">QR Code</span>
                      </div>
                    )}
                    {element.type === "shape" && (
                      <div
                        style={{
                          width: `${element.width || 100}px`,
                          height: `${element.height || 100}px`,
                          backgroundColor: element.fillColor || "transparent",
                          border: element.shapeType === "line" ? "none" : `${element.strokeWidth || 1}px solid ${element.color || "#000"}`,
                          borderTop: element.shapeType === "line" ? `${element.strokeWidth || 1}px solid ${element.color || "#000"}` : undefined,
                          borderRadius: element.shapeType === "circle" ? "50%" : `${element.borderRadius || 0}px`,
                          opacity: element.opacity || 1,
                        }}
                      />
                    )}

                    {/* Context controls just for delete on hover */}
                    {selectedElement === element.id && (
                      <>
                        <div
                          className="absolute -top-3 -right-3 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform z-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setElements(elements.filter(el => el.id !== element.id));
                            setSelectedElement(null);
                          }}
                          title="Remove element"
                        >
                          <XIcon className="w-3 h-3" />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Properties - WIDENED as requested */}
          {showRightSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 350, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-[350px] border-l border-border bg-card flex flex-col shadow-xl z-20"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-base uppercase tracking-wider text-foreground">Element Properties</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* GLOBAL CANVAS SETTINGS - Always at top of right panel */}
                <Card className="border-border/50 shadow-none bg-muted/30">
                  <CardContent className="p-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                      <MaximizeIcon className="w-3 h-3" /> Page Settings
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs mb-1.5 block">Page Size</Label>
                        <Select
                          disabled={!permissions.editorTools?.sizeControl}
                          value={`${canvasSize.width}x${canvasSize.height}`}
                          onValueChange={(val) => {
                            const [w, h] = val.split('x').map(Number);
                            setCanvasSize({ width: w, height: h, unit: 'mm' });
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs relative">
                            <SelectValue />
                            {!permissions.editorTools?.sizeControl && <LockIcon className="w-3 h-3 absolute right-8 top-2 text-muted-foreground" />}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="297x210">A4 (Standard)</SelectItem>
                            <SelectItem value="420x297">A3 (Large)</SelectItem>
                            <SelectItem value="216x279">Letter (US)</SelectItem>
                            <SelectItem value="custom">Custom Size</SelectItem>
                          </SelectContent>
                        </Select>
                        {!permissions.editorTools?.sizeControl && <p className="text-[10px] text-accent mt-1">Available in Pro plan</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 relative">
                        {!permissions.editorTools?.sizeControl && <div className="absolute inset-0 bg-background/20 z-10 cursor-not-allowed" />}
                        <div>
                          <Label className="text-[10px] mb-1 block">Width (mm)</Label>
                          <Input
                            type="number"
                            disabled={!permissions.editorTools?.sizeControl}
                            value={canvasSize.width}
                            onChange={(e) => setCanvasSize({ ...canvasSize, width: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] mb-1 block">Height (mm)</Label>
                          <Input
                            type="number"
                            disabled={!permissions.editorTools?.sizeControl}
                            value={canvasSize.height}
                            onChange={(e) => setCanvasSize({ ...canvasSize, height: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!selectedElementData ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center animate-in fade-in duration-500">
                    <MoveIcon className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-lg font-medium">No Element Selected</p>
                    <p className="text-sm max-w-[200px] mt-2">Click on an element in the canvas to edit its properties.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Layer Controls - Always visible */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="secondary" onClick={handleBringToFront} title="Bring to Front">
                        <ArrowUpIcon className="w-4 h-4 mr-2" /> Bring Forward
                      </Button>
                      <Button variant="secondary" onClick={handleSendToBack} title="Send to Back">
                        <ArrowDownIcon className="w-4 h-4 mr-2" /> Send Backward
                      </Button>
                    </div>

                    <Accordion type="multiple" defaultValue={["text", "style", "position"]} className="w-full">

                      {/* TEXT PROPERTIES GROUP */}
                      {selectedElementData.type === "text" && (
                        <AccordionItem value="text">
                          <AccordionTrigger className="text-sm font-semibold text-primary">Text Properties</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="relative">
                              <Label className="mb-1.5 block flex items-center justify-between">
                                Content
                                {!permissions.editorTools?.textEditing && <Badge variant="outline" className="text-[9px] border-accent/30 text-accent">PRO</Badge>}
                              </Label>
                              <textarea
                                disabled={!permissions.editorTools?.textEditing}
                                value={selectedElementData.content || ""}
                                onChange={(e) => {
                                  setElements(elements.map(el => el.id === selectedElement ? { ...el, content: e.target.value } : el));
                                }}
                                className={`w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${!permissions.editorTools?.textEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                rows={3}
                              />
                              {!permissions.editorTools?.textEditing && (
                                <div className="absolute inset-x-0 bottom-0 top-6 bg-background/5 flex items-center justify-center cursor-not-allowed pointer-events-auto z-10">
                                  <LockIcon className="w-5 h-5 text-muted-foreground opacity-30" />
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="mb-1.5 block">Font</Label>
                                <Select
                                  value={selectedElementData.fontFamily || "Arial, sans-serif"}
                                  onValueChange={(value) => {
                                    setElements(elements.map(el => el.id === selectedElement ? { ...el, fontFamily: value } : el));
                                  }}
                                >
                                  <SelectTrigger> <SelectValue /> </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                                    <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                                    <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                                    <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                                    <SelectItem value="'Outfit', sans-serif">Outfit (Brand)</SelectItem>
                                    <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="mb-1.5 block">Size</Label>
                                <div className="flex items-center">
                                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
                                    setElements(elements.map(el => el.id === selectedElement ? { ...el, fontSize: Math.max(8, (el.fontSize || 16) - 1) } : el));
                                  }}><MinusIcon className="w-3 h-3" /></Button>
                                  <Input
                                    type="number"
                                    className="h-9 flex-1 text-center mx-1"
                                    value={selectedElementData.fontSize || 16}
                                    onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, fontSize: parseInt(e.target.value) || 16 } : el))}
                                  />
                                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
                                    setElements(elements.map(el => el.id === selectedElement ? { ...el, fontSize: (el.fontSize || 16) + 1 } : el));
                                  }}><PlusIcon className="w-3 h-3" /></Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 p-1 bg-muted rounded-md relative">
                              {!permissions.editorTools?.fontStyle && <div className="absolute inset-0 bg-background/20 z-10 cursor-not-allowed" />}
                              <Button
                                disabled={!permissions.editorTools?.fontStyle}
                                variant={selectedElementData.fontWeight === "bold" ? "default" : "ghost"}
                                size="sm" className="flex-1"
                                onClick={() => setElements(elements.map(el => el.id === selectedElement ? { ...el, fontWeight: el.fontWeight === "bold" ? "normal" : "bold" } : el))}
                              >
                                <BoldIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                disabled={!permissions.editorTools?.fontStyle}
                                variant={selectedElementData.textDecoration === "underline" ? "default" : "ghost"}
                                size="sm" className="flex-1"
                                onClick={() => setElements(elements.map(el => el.id === selectedElement ? { ...el, textDecoration: el.textDecoration === "underline" ? "none" : "underline" } : el))}
                              >
                                <UnderlineIcon className="w-4 h-4" />
                              </Button>
                              <div className="w-px bg-border my-1" />
                              <Button
                                variant={selectedElementData.align === "left" ? "secondary" : "ghost"}
                                size="sm" className="flex-1"
                                onClick={() => setElements(elements.map(el => el.id === selectedElement ? { ...el, align: "left" } : el))}
                              >
                                <AlignLeftIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant={selectedElementData.align === "center" ? "secondary" : "ghost"}
                                size="sm" className="flex-1"
                                onClick={() => setElements(elements.map(el => el.id === selectedElement ? { ...el, align: "center" } : el))}
                              >
                                <AlignCenterIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant={selectedElementData.align === "right" ? "secondary" : "ghost"}
                                size="sm" className="flex-1"
                                onClick={() => setElements(elements.map(el => el.id === selectedElement ? { ...el, align: "right" } : el))}
                              >
                                <AlignRightIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* QR PROPERTIES GROUP */}
                      {selectedElementData.type === "qrcode" && (
                        <AccordionItem value="qr">
                          <AccordionTrigger className="text-sm font-semibold text-primary">QR Code Properties</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="mb-1.5 block text-xs">Size (px)</Label>
                                <Input
                                  type="number"
                                  value={selectedElementData.width || 80}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setElements(elements.map(el => el.id === selectedElement ? { ...el, width: val, height: val } : el));
                                  }}
                                />
                              </div>
                              <div className="flex items-end">
                                <p className="text-[10px] text-muted-foreground italic pb-2">QR codes are always square</p>
                              </div>
                            </div>
                            <p className="text-xs bg-muted p-2 rounded border border-border/50 text-muted-foreground">
                              This placeholder will be replaced with a unique verification QR code when the certificate is issued.
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* SHAPE PROPERTIES GROUP */}
                      {selectedElementData.type === "shape" && (
                        <AccordionItem value="shape">
                          <AccordionTrigger className="text-sm font-semibold text-primary">Shape Properties</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            {selectedElementData.shapeType !== "line" && (
                              <div>
                                <Label className="mb-2 block">Fill Color</Label>
                                <div className="flex gap-3">
                                  <div className="h-10 w-10 shrink-0 rounded border border-border overflow-hidden relative">
                                    <Input type="color" value={selectedElementData.fillColor || "#ffffff00"}
                                      onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, fillColor: e.target.value } : el))}
                                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-none cursor-pointer"
                                    />
                                  </div>
                                  <Input value={selectedElementData.fillColor || "transparent"}
                                    onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, fillColor: e.target.value } : el))}
                                    className="font-mono"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <Label className="mb-2 block">{selectedElementData.shapeType === 'line' ? 'Line Color' : 'Border Color'}</Label>
                              <div className="flex gap-3">
                                <div className="h-10 w-10 shrink-0 rounded border border-border overflow-hidden relative">
                                  <Input type="color" value={selectedElementData.color || "#000000"}
                                    onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, color: e.target.value } : el))}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-none cursor-pointer"
                                  />
                                </div>
                                <Input value={selectedElementData.color || "#000000"}
                                  onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, color: e.target.value } : el))}
                                  className="font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="mb-1.5 block text-xs">Stroke Width</Label>
                                <Input type="number" min="0" value={selectedElementData.strokeWidth || 1}
                                  onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, strokeWidth: parseInt(e.target.value) || 0 } : el))}
                                />
                              </div>
                              <div>
                                <Label className="mb-1.5 block text-xs">Opacity</Label>
                                <Input type="number" step="0.1" min="0" max="1" value={selectedElementData.opacity || 1}
                                  onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, opacity: parseFloat(e.target.value) || 1 } : el))}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* STYLE PROPERTIES GROUP */}
                      <AccordionItem value="style">
                        <AccordionTrigger className="text-sm font-semibold text-primary">Style</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                          {selectedElementData.type === "text" && (
                            <>
                              <div>
                                <Label className="mb-2 block">Text Color</Label>
                                <div className="flex gap-3">
                                  <div className="h-10 w-10 shrink-0 rounded border border-border overflow-hidden relative">
                                    <Input type="color" value={selectedElementData.color || "#000000"}
                                      onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, color: e.target.value } : el))}
                                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-none cursor-pointer"
                                    />
                                  </div>
                                  <Input value={selectedElementData.color || "#000000"}
                                    onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, color: e.target.value } : el))}
                                    className="font-mono"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="mb-2 flex justify-between">
                                  <span>Padding</span>
                                  <span className="text-muted-foreground">{selectedElementData.padding || 0}px</span>
                                </Label>
                                <Input type="range" min="0" max="50" step="1"
                                  value={selectedElementData.padding || 0}
                                  onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, padding: parseInt(e.target.value) } : el))}
                                  className="cursor-pointer"
                                />
                              </div>
                            </>
                          )}
                          {(selectedElementData.type === "logo" || selectedElementData.type === "signature") && (
                            <Button
                              variant="outline" className="w-full"
                              onClick={() => { /* Reuse logic */ document.getElementById("hidden-img-upload")?.click() }}
                            >
                              <UploadIcon className="w-4 h-4 mr-2" /> Replace Image
                            </Button>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* DIMENSIONS & POS GROUP */}
                      <AccordionItem value="position">
                        <AccordionTrigger className="text-sm font-semibold text-primary">Dimensions & Position</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                          {(selectedElementData.type === "logo" || selectedElementData.type === "signature") && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="mb-1.5 block text-xs">Width (px)</Label>
                                <Input type="number" value={selectedElementData.width || 100}
                                  onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, width: parseInt(e.target.value) || 100 } : el))}
                                />
                              </div>
                              <div>
                                <Label className="mb-1.5 block text-xs">Height (px)</Label>
                                <Input type="number" value={selectedElementData.height || 50}
                                  onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, height: parseInt(e.target.value) || 50 } : el))}
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="mb-1.5 block text-xs">X Position (%)</Label>
                              <Input type="number" step="0.1" value={selectedElementData.x.toFixed(1)}
                                onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, x: parseFloat(e.target.value) || 0 } : el))}
                              />
                            </div>
                            <div>
                              <Label className="mb-1.5 block text-xs">Y Position (%)</Label>
                              <Input type="number" step="0.1" value={selectedElementData.y.toFixed(1)}
                                onChange={(e) => setElements(elements.map(el => el.id === selectedElement ? { ...el, y: parseFloat(e.target.value) || 0 } : el))}
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                    </Accordion>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Hidden inputs for reuse */}
        <input type="file" id="hidden-img-upload" className="hidden" accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && selectedElement) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                setElements(elements.map(el => el.id === selectedElement ? { ...el, imageUrl: ev.target?.result as string, placeholder: false } : el));
              }
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
    </div>
  );
};

export default CertificateBuilder;
