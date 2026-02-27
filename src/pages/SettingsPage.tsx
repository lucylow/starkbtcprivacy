import React, { useState } from "react";
import { Settings as SettingsIcon, Key, Clock, Cpu, Palette, Trash2, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { clearAllSecrets, exportSecretsBlob, importSecretsBlob } from "@/lib/secure-storage";
import { clearActivity } from "@/lib/zephyr-sdk";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [defaultWait, setDefaultWait] = useState("72");
  const [localProving, setLocalProving] = useState(true);
  const { toast } = useToast();

  const handleExportSecrets = () => {
    const blob = new Blob([exportSecretsBlob()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zephyr-secrets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Secrets exported", description: "Encrypted secrets downloaded." });
  };

  const handleImportSecrets = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const count = importSecretsBlob(text);
        toast({ title: `Imported ${count} secret(s)` });
      } catch {
        toast({ variant: "destructive", title: "Invalid file" });
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (window.confirm("⚠️ This will delete ALL local secrets and activity. This CANNOT be undone. Are you sure?")) {
      clearAllSecrets();
      clearActivity();
      toast({ title: "All data cleared" });
      window.location.reload();
    }
  };

  return (
    <>
      <PageHeader
        title="Settings & Security"
        description="Control your local security and preferences."
      />

      <div className="space-y-6 max-w-2xl">
        {/* Secret & Backup */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Key className="w-4 h-4 text-primary" />
              <span>Secret & Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your shielded secrets are encrypted and stored locally. Export them for backup
              or import from another device.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportSecrets} className="space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Secrets</span>
              </Button>
              <Button variant="outline" onClick={handleImportSecrets} className="space-x-2">
                <Upload className="w-4 h-4" />
                <span>Import Secrets</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Defaults */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>Privacy Defaults</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Default Wait Time (hours)</label>
              <div className="flex gap-2">
                {["24", "72", "168"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDefaultWait(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      defaultWait === v ? "bg-primary text-primary-foreground border-primary" : "glass border-border hover:bg-muted"
                    }`}
                  >
                    {v}h
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-info" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Local Proving</div>
                <div className="text-xs text-muted-foreground">Maximum privacy. Proofs generated on your device.</div>
              </div>
              <Switch checked={localProving} onCheckedChange={setLocalProving} />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Danger Zone</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Clear all local data including secrets and activity. This is irreversible.
              Make sure to export your secrets first.
            </p>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All Local Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
