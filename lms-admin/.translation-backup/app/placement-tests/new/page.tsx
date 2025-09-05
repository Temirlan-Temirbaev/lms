"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { useI18n } from "@/components/i18n-provider";
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
  const { t } = useI18n();
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
      alert(t('placementTest.enterTitle'));
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
        alert(`${t('placementTest.createError')}: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating placement test:", error);
      alert(t('placementTest.createFailed'));
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
                <span>{t('placementTest.backToTests')}</span>
              </Button>
            </div>

            <div>
              <h1 className="text-3xl font-bold">{t('placementTest.createNew')}</h1>
              <p className="text-gray-600">
                {t('placementTest.createDescription')}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('placementTest.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('placementTest.title')} *</Label>
                  <Input
                    id="title"
                    placeholder={t('placementTest.titlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('placementTest.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('placementTest.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleBack}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('placementTest.creating')}...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t('placementTest.create')}
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