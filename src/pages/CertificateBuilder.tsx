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
  ArrowLeft,
  Save,
  Type,
  Image,
  PenTool,
  Trash2,
  Move,
  Layers,
  Upload,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CanvasElement {
  id: string;
  type: "text" | "logo" | "signature";
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  align?: string;
  imageUrl?: string;
  placeholder?: boolean;
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

  const [templateName, setTemplateName] = useState("");
  const [elements, setElements] = useState<CanvasElement[]>([]);

  useEffect(() => {
    if (templateId) {
      // Load existing template
      const templates = JSON.parse(localStorage.getItem("certificateTemplates") || "[]");
      const template = templates.find((t: any) => t.id === templateId);
      if (template) {
        setTemplateName(template.name);
        setElements(template.elements || []);
      }
    }
  }, [templateId]);

  const handleAddText = () => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "text",
      content: "New Text",
      x: 50,
      y: 50,
      fontSize: 16,
      fontWeight: "normal",
      color: "#000000",
      align: "left",
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
        reader.onload = (event) => {
          const newElement: CanvasElement = {
            id: Date.now().toString(),
            type: "logo",
            x: 10,
            y: 10,
            width: 100,
            height: 50,
            imageUrl: event.target?.result as string,
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
        reader.onload = (event) => {
          const newElement: CanvasElement = {
            id: Date.now().toString(),
            type: "signature",
            x: 70,
            y: 85,
            width: 120,
            height: 40,
            imageUrl: event.target?.result as string,
          };
          setElements([...elements, newElement]);
          setSelectedElement(newElement.id);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDelete = () => {
    if (selectedElement) {
      setElements(elements.filter((el) => el.id !== selectedElement));
      setSelectedElement(null);
    }
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

  const handleSave = () => {
    if (!templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }

    const templates: any[] = JSON.parse(
      localStorage.getItem("certificateTemplates") || JSON.stringify([])
    );

    const templateData = {
      id: templateId || Date.now().toString(),
      name: templateName,
      description: `Certificate template: ${templateName}`,
      preview: `Template with ${elements.length} elements`,
      elements,
      usageCount: 0,
    };

    if (templateId) {
      // Update existing
      const index = templates.findIndex((t) => t.id === templateId);
      if (index !== -1) {
        templates[index] = templateData;
      }
    } else {
      // Create new
      templates.push(templateData);
    }

    localStorage.setItem("certificateTemplates", JSON.stringify(templates));
    toast({
      title: "Template saved",
      description: "Your certificate template has been saved successfully.",
    });
    navigate("/dashboard/templates/certificate");
  };

  const selectedElementData = elements.find((el) => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar - Tools */}
        <div className="w-64 border-r border-border bg-card p-4 space-y-4 overflow-y-auto">
          <div>
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Certificate of Completion"
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Add Elements</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleAddText} className="flex flex-col h-auto py-3">
                <Type className="w-4 h-4 mb-1" />
                <span className="text-xs">Add Text</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddLogo} className="flex flex-col h-auto py-3">
                <Image className="w-4 h-4 mb-1" />
                <span className="text-xs">Add Logo</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddSignature} className="flex flex-col h-auto py-3">
                <PenTool className="w-4 h-4 mb-1" />
                <span className="text-xs">Add Signature</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={!selectedElement}
                className="flex flex-col h-auto py-3 text-destructive"
              >
                <Trash2 className="w-4 h-4 mb-1" />
                <span className="text-xs">Delete</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Placeholders</Label>
            <div className="space-y-1">
              {[
                "{{recipient_name}}",
                "{{course_name}}",
                "{{issue_date}}",
                "{{organization_name}}",
                "{{certificate_type}}",
              ].map((placeholder) => (
                <button
                  key={placeholder}
                  onClick={() => {
                    if (selectedElementData?.type === "text") {
                      const newContent = (selectedElementData.content || "") + placeholder;
                      setElements(
                        elements.map((el) =>
                          el.id === selectedElement ? { ...el, content: newContent } : el
                        )
                      );
                    }
                  }}
                  className="w-full text-left px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
                  disabled={selectedElementData?.type !== "text"}
                >
                  {placeholder}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Certificate Canvas</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard/templates/certificate")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button variant="premium" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-muted/20">
            <div
              ref={canvasRef}
              className="bg-white shadow-lg"
              style={{
                width: "210mm",
                height: "297mm",
                aspectRatio: "210/297",
                maxWidth: "100%",
                maxHeight: "100%",
                position: "relative",
                cursor: isDragging ? "grabbing" : "default",
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(element.id);
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  className={`absolute ${
                    selectedElement === element.id
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:ring-1 hover:ring-border"
                  } cursor-move`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: selectedElement === element.id ? 1000 : 1,
                  }}
                >
                  {element.type === "text" && (
                    <div
                      style={{
                        fontSize: `${element.fontSize || 16}px`,
                        fontWeight: element.fontWeight || "normal",
                        color: element.color || "#000000",
                        textAlign: (element.align as any) || "left",
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
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {element.type === "logo" ? "Logo" : "Signature"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-border bg-card p-4 space-y-4 overflow-y-auto">
          <h3 className="font-semibold">Properties</h3>
          {selectedElementData ? (
            <div className="space-y-4">
              {selectedElementData.type === "text" && (
                <>
                  <div>
                    <Label>Text Content</Label>
                    <Input
                      value={selectedElementData.content || ""}
                      onChange={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === selectedElement ? { ...el, content: e.target.value } : el
                          )
                        );
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Font Size</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setElements(
                            elements.map((el) =>
                              el.id === selectedElement
                                ? { ...el, fontSize: Math.max(8, (el.fontSize || 16) - 2) }
                                : el
                            )
                          );
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={selectedElementData.fontSize || 16}
                        onChange={(e) => {
                          setElements(
                            elements.map((el) =>
                              el.id === selectedElement
                                ? { ...el, fontSize: parseInt(e.target.value) || 16 }
                                : el
                            )
                          );
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setElements(
                            elements.map((el) =>
                              el.id === selectedElement
                                ? { ...el, fontSize: (el.fontSize || 16) + 2 }
                                : el
                            )
                          );
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Font Weight</Label>
                    <Select
                      value={selectedElementData.fontWeight || "normal"}
                      onValueChange={(value) => {
                        setElements(
                          elements.map((el) =>
                            el.id === selectedElement ? { ...el, fontWeight: value } : el
                          )
                        );
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="600">Semi-bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      value={selectedElementData.color || "#000000"}
                      onChange={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === selectedElement ? { ...el, color: e.target.value } : el
                          )
                        );
                      }}
                      className="mt-2 h-10"
                    />
                  </div>
                  <div>
                    <Label>Alignment</Label>
                    <Select
                      value={selectedElementData.align || "left"}
                      onValueChange={(value) => {
                        setElements(
                          elements.map((el) =>
                            el.id === selectedElement ? { ...el, align: value } : el
                          )
                        );
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {(selectedElementData.type === "logo" || selectedElementData.type === "signature") && (
                <>
                  <div>
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={selectedElementData.width || 100}
                      onChange={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === selectedElement
                              ? { ...el, width: parseInt(e.target.value) || 100 }
                              : el
                          )
                        );
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={selectedElementData.height || 50}
                      onChange={(e) => {
                        setElements(
                          elements.map((el) =>
                            el.id === selectedElement
                              ? { ...el, height: parseInt(e.target.value) || 50 }
                              : el
                          )
                        );
                      }}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setElements(
                              elements.map((el) =>
                                el.id === selectedElement
                                  ? { ...el, imageUrl: event.target?.result as string, placeholder: false }
                                  : el
                              )
                            );
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Replace Image
                  </Button>
                </>
              )}
              <div className="pt-4 border-t">
                <Label>Position</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">X: {selectedElementData.x.toFixed(1)}%</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Y: {selectedElementData.y.toFixed(1)}%</Label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an element to edit properties</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateBuilder;

