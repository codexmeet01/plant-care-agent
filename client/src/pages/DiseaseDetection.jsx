import React, { useState } from "react";
import { 
  ScanSearch, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Droplets, 
  Flame, 
  Bug, 
  Layers, 
  ExternalLink,
  Settings,
  HelpCircle,
  RefreshCw,
  X
} from "lucide-react";

const SAMPLE_LEAF_IMAGES = [
  {
    id: "sample-blight",
    label: "Early Blight Leaf (Tomato)",
    url: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80",
    plantName: "Tomato Plant",
    symptoms: "Dark concentric spots on lower leaves with yellow halos"
  },
  {
    id: "sample-mildew",
    label: "Powdery Mildew (Rose)",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    plantName: "Garden Rose",
    symptoms: "White powdery film spreading across foliage and buds"
  },
  {
    id: "sample-healthy",
    label: "Healthy Pothos Leaf",
    url: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80",
    plantName: "Golden Pothos",
    symptoms: "Vibrant green leaves, checking for general vitality"
  }
];

export default function DiseaseDetection({ serverHealth, setActivePage }) {
  const [selectedImage, setSelectedImage] = useState(null); // base64 or url
  const [selectedFile, setSelectedFile] = useState(null);
  const [plantName, setPlantName] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const hasApiKey = Boolean(serverHealth?.hasGeminiKey);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 8MB. Please choose a smaller image.");
      return;
    }

    setErrorMsg("");
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.url);
    setSelectedFile(null);
    setPlantName(sample.plantName);
    setSymptomsInput(sample.symptoms);
    setAnalysisResult(null);
    setErrorMsg("");
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) {
      setErrorMsg("Please upload or select a plant leaf image to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg("");
    setAnalysisResult(null);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 25000); // 25-second request timeout

    try {
      let imageBase64ToSend = selectedImage;

      // If it's a sample URL rather than raw base64 data, convert to base64 via canvas/blob
      if (selectedImage.startsWith("http")) {
        try {
          const sampleSignal = typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(5000) : undefined;
          const fetched = await fetch(selectedImage, { signal: sampleSignal });
          if (fetched.ok) {
            const blob = await fetched.blob();
            const reader = new FileReader();
            imageBase64ToSend = await new Promise((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (fetchErr) {
          console.warn("Could not fetch remote sample directly on client, forwarding to backend handler.");
        }
      }

      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64ToSend,
          mimeType: "image/jpeg",
          plantName: plantName.trim(),
          symptomsDescription: symptomsInput.trim()
        }),
        signal: abortController.signal
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`The diagnostic service returned an unreadable response (HTTP ${res.status}). Please try again.`);
      }

      if (!res.ok || data.success === false) {
        throw new Error(data?.error || `Diagnostic scan failed (HTTP ${res.status}). Please try again.`);
      }

      setAnalysisResult(data);
    } catch (err) {
      console.error("Diagnosis request failed:", err);
      if (err.name === "AbortError") {
        setErrorMsg("The diagnosis scan timed out. The AI service may be experiencing high demand. Please try again.");
      } else {
        setErrorMsg(err.message || "Failed to communicate with diagnostic service. Please verify the backend is running.");
      }
      setAnalysisResult(null);
    } finally {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plant Disease & Health Diagnostic Agent
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Multimodal neural vision analysis for foliar diseases, fungal blights, and deficiency detection
          </p>
        </div>

        {/* API Status Pill */}
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            hasApiKey 
              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            {hasApiKey ? "Gemini 3.8 Flash Vision Connected" : "Diagnostic Demo Mode"}
          </span>
        </div>
      </div>

      {/* Honest Demo Mode Explanation Alert (Required by instructions) */}
      {!hasApiKey && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Demo Diagnostic Interface Notice
            </span>
            <button
              onClick={() => setActivePage("settings")}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
            >
              <Settings className="w-3 h-3" /> Configure Gemini API Key
            </button>
          </div>
          <p className="leading-relaxed">
            No Google Gemini API key is currently configured in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">server/.env</code>. 
            In compliance with our integrity policy, <strong>this application will never pretend an image was analyzed by an AI model when no model is connected</strong>. 
            You can still test the upload interface, and review our botanical pathology knowledge reference below!
          </p>
        </div>
      )}

      {/* Upload and Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Upload & Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Leaf Photograph Upload</span>
              <span className="text-[11px] text-slate-400 font-normal">Clear close-up photos yield highest accuracy</span>
            </h3>

            {/* Dropzone or Image Preview */}
            <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-3xl overflow-hidden transition bg-slate-50/50 min-h-[260px] flex items-center justify-center">
              {selectedImage ? (
                <div className="relative w-full h-[280px] bg-slate-900 group">
                  <img
                    src={selectedImage}
                    alt="Leaf to inspect"
                    className="w-full h-full object-contain"
                  />

                  {/* Scanning Animation line when isAnalyzing */}
                  {isAnalyzing && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-lg shadow-emerald-400 animate-scan-line pointer-events-none" />
                  )}

                  {/* Clear image button */}
                  {!isAnalyzing && (
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedFile(null);
                        setAnalysisResult(null);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <label htmlFor="leaf-file-input" className="cursor-pointer">
                      <span className="text-sm font-bold text-emerald-700 hover:underline">
                        Upload a photo of the affected plant leaf
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Drag and drop or browse files (JPEG, PNG, WEBP up to 8MB)
                      </p>
                    </label>
                    <input
                      id="leaf-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-600 block">
                Or test with sample leaf specimens:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_LEAF_IMAGES.map(sample => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition flex items-center gap-2 text-xs"
                  >
                    <img src={sample.url} alt={sample.label} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{sample.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{sample.plantName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Plant Metadata & Action Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            
            <h3 className="text-sm font-bold text-slate-800">
              Diagnostic Context (Optional)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant Variety / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomato, Money Plant, Rose..."
                  value={plantName}
                  onChange={e => setPlantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observed Symptoms Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Yellow spots on lower foliage, powdery white powder, curling leaves..."
                  value={symptomsInput}
                  onChange={e => setSymptomsInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || !selectedImage}
                  className="text-xs font-bold text-rose-800 hover:text-rose-950 underline shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Run Analysis Button */}
            <button
              type="button"
              disabled={isAnalyzing || !selectedImage}
              onClick={handleRunAnalysis}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Leaf Morphology...</span>
                </>
              ) : (
                <>
                  <ScanSearch className="w-4 h-4 stroke-[2.5]" />
                  <span>{errorMsg ? "Retry Leaf Diagnostic Scan" : "Run Leaf Diagnostic Scan"}</span>
                </>
              )}
            </button>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">🔍 What the diagnostic scans for:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                <li>Fungal infections (Powdery mildew, black spot, blights)</li>
                <li>Bacterial leaf spots & viral mosaics</li>
                <li>Nutrient deficiencies (Chlorosis, nitrogen, magnesium)</li>
                <li>Water stress, scorch, and pest infestations</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      {/* Analysis Results Section */}
      {analysisResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200 shadow-xl shadow-emerald-950/5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {analysisResult.isDemo ? (
            /* Demo Mode Output: Honest explanation & Reference pathology cards */
            <div className="space-y-6">
              
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <h4>Demo Mode Result</h4>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {analysisResult.message}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActivePage("settings")}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition"
                  >
                    Open Settings to Add Gemini API Key
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Botanical Pathology Reference Library
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  These represent the primary plant diseases identified by horticultural AI models:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.sampleDiseasesReference?.map((dis, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">{dis.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {dis.targetPlants}
                        </span>
                      </div>
                      <p className="text-slate-600"><strong className="text-slate-700">Symptoms:</strong> {dis.symptoms}</p>
                      <p className="text-emerald-700 font-medium"><strong className="text-emerald-800">🌱 Organic Remedy:</strong> {dis.organicRemedy}</p>
                      <p className="text-slate-500"><strong className="text-slate-600">🧪 Chemical Option:</strong> {dis.chemicalRemedy}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* Live Gemini 3.8 Flash Multimodal Diagnostic Result */
            <div className="space-y-6">
              
              {/* Result Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    analysisResult.diagnosis?.severity === "Severe" ? "bg-rose-100 text-rose-600" :
                    analysisResult.diagnosis?.severity === "Moderate" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  }`}>
                    {analysisResult.diagnosis?.severity === "Healthy" ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">
                        {analysisResult.diagnosis?.conditionName}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        analysisResult.diagnosis?.severity === "Severe" ? "bg-rose-100 text-rose-800" :
                        analysisResult.diagnosis?.severity === "Moderate" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        Severity: {analysisResult.diagnosis?.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 italic">
                      {analysisResult.diagnosis?.scientificName} • Diagnostic Confidence: {analysisResult.diagnosis?.confidencePercent || 85}%
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                  Source: Gemini 3.8 Flash Neural Vision
                </span>
              </div>

              {/* Overall Assessment paragraph */}
              {analysisResult.diagnosis?.overallAssessment && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                  <p className="font-semibold text-emerald-950 mb-0.5">Summary Assessment:</p>
                  <p>{analysisResult.diagnosis.overallAssessment}</p>
                </div>
              )}

              {/* Symptoms & Causes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Visible Symptoms */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Observed Symptoms
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.diagnosis?.visibleSymptoms?.map((sym, i) => (
                      <li key={i} className="text-slate-600 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Underlying Causes */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    Underlying Causes & Environmental Factors
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.diagnosis?.underlyingCauses?.map((cause, i) => (
                      <li key={i} className="text-slate-600 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Treatment Solutions (Immediate Actions, Organic & Chemical) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Recommended Treatment Protocol</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Immediate Actions */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                    <h5 className="font-bold text-blue-900">🚨 Immediate Actions</h5>
                    <ul className="space-y-1">
                      {analysisResult.diagnosis?.immediateActions?.map((act, i) => (
                        <li key={i} className="text-blue-800 flex items-start gap-1">
                          <span>•</span> <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Organic Treatment */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                    <h5 className="font-bold text-emerald-900">🌿 Organic Solutions</h5>
                    <ul className="space-y-1">
                      {analysisResult.diagnosis?.organicTreatments?.map((org, i) => (
                        <li key={i} className="text-emerald-800 flex items-start gap-1">
                          <span>•</span> <span>{org}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical Treatment */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                    <h5 className="font-bold text-purple-900">🧪 Fungicide / Chemical</h5>
                    <ul className="space-y-1">
                      {Array.isArray(analysisResult.diagnosis?.chemicalTreatments) ? (
                        analysisResult.diagnosis.chemicalTreatments.map((chem, i) => (
                          <li key={i} className="text-purple-800 flex items-start gap-1">
                            <span>•</span> <span>{chem}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-purple-800">{analysisResult.diagnosis?.chemicalTreatments || "None required."}</li>
                      )}
                    </ul>
                  </div>

                </div>
              </div>

              {/* Prevention Tips */}
              {analysisResult.diagnosis?.preventionTips && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <h5 className="font-bold text-slate-800">🛡️ Long-Term Prevention:</h5>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.diagnosis.preventionTips.map((tip, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
