"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UploadStockPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("idle");
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    setUploadStatus("uploading");
    // Simulate upload
    setTimeout(() => {
      setUploadStatus("success");
      setSelectedFile(null);
    }, 2000);
  };

  const recentUploads = [
    { id: "UP-001", filename: "inventory_jan_2024.xlsx", date: "2024-01-18", items: 125, status: "Success" },
    { id: "UP-002", filename: "parts_stock.csv", date: "2024-01-15", items: 89, status: "Success" },
    { id: "UP-003", filename: "inventory_dec_2023.xlsx", date: "2024-01-10", items: 156, status: "Success" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-mono uppercase">
          UPLOAD_STOCK
        </h1>
        <p className="font-mono text-sm text-[#94a3b8] uppercase tracking-wider">
          {/* // */} BULK_UPLOAD_INVENTORY_AND_STOCK_DATA
        </p>
      </div>

      {/* Upload Section */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            UPLOAD_FILE
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            Upload CSV or Excel file to bulk import inventory items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Input */}
          <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#3b82f6]/20 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-[#3b82f6]" />
              </div>
              <div>
                <p className="font-mono text-sm text-white mb-2">
                  {selectedFile ? selectedFile.name : "Select a file to upload"}
                </p>
                <p className="font-mono text-xs text-[#94a3b8] mb-4">
                  Supported formats: CSV, XLSX (Max 10MB)
                </p>
                <Input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="font-mono uppercase border-white/20 bg-transparent hover:bg-white/10"
                  style={{ color: '#ffffff' }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  SELECT FILE
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-[#1a1c1e] rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-[#3b82f6]" />
                <div>
                  <p className="font-mono text-sm text-white">{selectedFile.name}</p>
                  <p className="font-mono text-xs text-[#94a3b8]">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploadStatus === "uploading"}
                className="font-mono uppercase [clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50"
              >
                {uploadStatus === "uploading" ? "UPLOADING..." : "UPLOAD"}
              </Button>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === "success" && (
            <div className="flex items-center gap-2 p-4 bg-[#22d3ee]/20 border border-[#22d3ee]/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-[#22d3ee]" />
              <p className="font-mono text-sm text-[#22d3ee]">
                File uploaded successfully! Inventory items have been imported.
              </p>
            </div>
          )}

          {/* Download Template */}
          <div className="pt-4 border-t border-white/10">
            <p className="font-mono text-xs text-[#94a3b8] mb-3">
              Need a template? Download our sample file:
            </p>
            <Button
              variant="outline"
              className="font-mono uppercase border-white/20 bg-transparent hover:bg-white/10"
              style={{ color: '#ffffff' }}
            >
              <Download className="h-4 w-4 mr-2" />
              DOWNLOAD TEMPLATE
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card className="bg-gradient-to-br from-[#2a2e33] to-[#16181b] border-white/5 shadow-[inset_1px_1px_0_rgba(255,255,255,0.05),20px_20px_60px_#0d0e10]">
        <CardHeader>
          <CardTitle className="font-mono text-xs text-[#3b82f6] uppercase tracking-wider">
            RECENT_UPLOADS
          </CardTitle>
          <CardDescription className="font-mono text-xs text-[#94a3b8]">
            History of recent stock uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between p-4 bg-[#1a1c1e] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#3b82f6]/20 rounded flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-white">{upload.filename}</p>
                    <p className="font-mono text-xs text-[#94a3b8]">
                      {upload.items} items • {upload.date}
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30">
                  {upload.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
