import React, { useState } from "react";
import { Activity, Download, Trash2, ExternalLink, StickyNote } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActivityLog } from "@/hooks/useZephyr";
import { clearActivity, addActivityNote } from "@/lib/zephyr-sdk";
import { useToast } from "@/hooks/use-toast";

export default function ActivityPage() {
  const activity = useActivityLog();
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const filtered = filter === "all" ? activity : activity.filter((a) => a.type === filter);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(activity, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zephyr-activity-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Activity exported", description: "Downloaded as JSON file." });
  };

  const handleClear = () => {
    if (window.confirm("Clear all local activity? This cannot be undone.")) {
      clearActivity();
      toast({ title: "Activity cleared" });
      window.location.reload();
    }
  };

  return (
    <>
      <PageHeader
        title="Activity & Receipts"
        description="Your local activity history. This data is stored only on your device."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "deposit", "withdraw", "proof", "error"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              filter === f ? "bg-primary text-primary-foreground border-primary" : "glass border-border hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <Card className="glass border-border mb-6">
        <CardContent className="pt-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No activity to show.</p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((entry) => (
                <div key={entry.id} className="py-3 flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0">
                    <Activity className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{entry.description}</div>
                      <div className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</div>
                      {entry.txHash && (
                        <div className="text-xs font-mono text-muted-foreground truncate max-w-[300px] mt-0.5">
                          {entry.txHash}
                        </div>
                      )}
                      {entry.note && (
                        <div className="text-xs text-accent mt-1 flex items-center space-x-1">
                          <StickyNote className="w-3 h-3" />
                          <span>{entry.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge
                    variant={entry.status === "success" ? "success" : entry.status === "failed" ? "error" : "pending"}
                  >
                    {entry.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExport} className="space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Activity</span>
        </Button>
        <Button variant="outline" onClick={handleClear} className="space-x-2 text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </Button>
      </div>

      {/* Confidentiality */}
      <div className="mt-6 glass rounded-lg p-4 text-xs text-muted-foreground">
        <strong className="text-foreground">🔒 Local Only:</strong> All activity data is stored exclusively on this device.
        It is never sent to any server. Export for personal bookkeeping if needed.
      </div>
    </>
  );
}
