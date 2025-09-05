"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface PlacementTestFormData {
  title: string;
  description: string;
  questions: any[];
}

export default function NewPlacementTestPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlacementTestFormData>({
    title: "",
    description: "",
    questions: []
  });

  const handleInputChange = (field: keyof PlacementTestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Тақырыпты енгізіңіз');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/placement-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/placement-tests/${result.data._id}`);
      } else {
        const error = await response.json();
        alert(`Орналастыру тестін жасау қатесі: ${error.message}`);
      }
    } catch (error) {
      console.error("Деңгей анықтау тестін жасау кезінде қате:", error);
      alert('Орналастыру тестін жасау сәтсіз аяқталды');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/placement-tests");
  };

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Тесттерге оралу</span>
              </Button>
            </div>

            <div>
              <h1 className="text-3xl font-bold">Жаңа орналастыру тестін жасау</h1>
              <p className="text-gray-600">
                Жаңа орналастыру тестін жасаңыз және сұрақтар қосыңыз
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Негізгі ақпарат</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Тақырып *</Label>
                  <Input
                    id="title"
                    placeholder="Тест тақырыбын енгізіңіз"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Сипаттама</Label>
                  <Textarea
                    id="description"
                    placeholder="Тест сипаттамасын енгізіңіз"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleBack}>
                    Бас тарту
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Жасалуда...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Жасау
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}