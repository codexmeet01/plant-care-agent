import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Key, 
  Sparkles, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Thermometer, 
  Bell, 
  ExternalLink,
  ShieldCheck,
  Server
} from "lucide-react";

export default function Settings({ 
  settings, 
  onSaveSettings, 
  serverHealth, 
  onRefreshHealth,
  plants,
  careLogs,
  onImportData,
  onResetSampleData,
  onClearAllData,
  showToast
}) {
  const [apiKeyInput, setApiKeyInput] = useState(settings?.apiKeyOverride || "");
  const [tempUnit, setTempUnit] = useState(settings?.tempUnit || "C");
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings?.notificationsEnabled ?? true);
  const [dailyTipEnabled, setDailyTipEnabled] = useState(settings?.dailyTipEnabled ?? true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleSaveApiSettings = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      apiKeyOverride: apiKeyInput.trim(),
      tempUnit,
      notificationsEnabled,
      dailyTipEnabled
    });
    showToast("Settings saved successfully!", "success");
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Say 'Connection Successful' in 5 words.",
          apiKeyOverride: apiKeyInput.trim()
        })
      });

      const data = await res.json();
      if (data.isDemo) {
        setTestResult({
          success: false,
          message: data.apiError || "Operating in Demo Mode. Provide a valid Gemini API key to activate live model."
        });
      } else {
        setTestResult({
          success: true,
          message: `Connected successfully to ${data.source || "gemini-3.8-flash"}!`
        });
        if (onRefreshHealth) onRefreshHealth();
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: "Failed to connect to backend server: " + err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleExportJson = () => {
    const dataToExport = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      plants,
      careLogs,
      settings
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `plantcare_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Garden data exported as JSON file!", "success");
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.plants && Array.isArray(parsed.plants)) {
          onImportData(parsed.plants, parsed.careLogs || []);
          showToast(`Successfully imported ${parsed.plants.length} plants!`, "success");
        } else {
          showToast("Invalid backup JSON format.", "error");
        }
      } catch (err) {
        showToast("Failed to parse JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System & AI Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure Google Gemini model credentials, data backups, and care preferences
        </p>
      </div>

      {/* Section 1: Google Gemini AI Integration */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Gemini API Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Powers conversational horticultural answers & multimodal leaf disease diagnosis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              serverHealth?.hasGeminiKey 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              {serverHealth?.hasGeminiKey ? "Connected: Live AI" : "Demo Mode Active"}
            </span>
          </div>
        </div>

        {/* Server & Model Telemetry */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Backend Server:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              http://localhost:5000
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Target Neural Model:</span>
            <span className="font-bold text-emerald-700 mt-0.5 block">
              gemini-3.8-flash (Latest)
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block">Multimodal Vision:</span>
            <span className="font-bold text-slate-800 mt-0.5 block">
              Supported (Leaf Inspection)
            </span>
          </div>
        </div>

        {/* Key Input Form */}
        <form onSubmit={handleSaveApiSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Custom Gemini API Key Override (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="AIzaSy... (leave blank to rely on server/.env GEMINI_API_KEY)"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
              />
              <button
                type="button"
                disabled={testing}
                onClick={handleTestKey}
                className="absolute right-2 top-2 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                {testing ? "Testing..." : "Test Key"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Keys are never exposed on client-side code; all requests are securely proxied via backend API endpoints.
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>

        {/* Step-by-Step Instructions */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-2">
          <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            How to configure your free Gemini API Key:
          </h4>
          <ol className="list-decimal pl-4 space-y-1 text-emerald-900 leading-relaxed">
            <li>Visit <strong>Google AI Studio</strong> at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline font-semibold">aistudio.google.com</a>.</li>
            <li>Click <strong>"Get API key"</strong> and create a complimentary key.</li>
            <li>Paste your key in the box above OR place it in <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono">server/.env</code> as: <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY=AIzaSy...</code></li>
            <li>Enjoy live neural plant care intelligence with Google Gemini 3.8 Flash!</li>
          </ol>
        </div>

      </div>

      {/* Section 2: Botanical Preferences */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-emerald-600" />
          Botanical & Care Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Temperature Units</span>
              <span className="text-slate-500">Display plant temperature tolerances in Celsius or Fahrenheit</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTempUnit("C")}
                className={`px-3 py-1 rounded-lg font-bold transition ${tempUnit === "C" ? "bg-emerald-600 text-white" : "text-slate-600"}`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setTempUnit("F")}
                className={`px-3 py-1 rounded-lg font-bold transition ${tempUnit === "F" ? "bg-emerald-600 text-white" : "text-slate-600"}`}
              >
                °F
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Daily Horticultural Tip</span>
              <span className="text-slate-500">Show curated seasonal tip on the dashboard</span>
            </div>
            <input
              type="checkbox"
              checked={dailyTipEnabled}
              onChange={e => setDailyTipEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </div>

        </div>
      </div>

      {/* Section 3: Data Management & Backup */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          Garden Data & Backups (LocalStorage)
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          Your plant records and watering history are securely saved locally in your browser. You can export a JSON backup at any time or restore previously saved data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Export */}
          <button
            onClick={handleExportJson}
            className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition space-y-1.5"
          >
            <Download className="w-5 h-5 text-emerald-600" />
            <h5 className="font-bold text-xs text-slate-800">Export Garden JSON</h5>
            <p className="text-[11px] text-slate-400">Download backup file of all plants and logs</p>
          </button>

          {/* Import */}
          <label className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition space-y-1.5 cursor-pointer block">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-teal-600" />
            <h5 className="font-bold text-xs text-slate-800">Import Garden Backup</h5>
            <p className="text-[11px] text-slate-400">Restore plants from a valid JSON file</p>
          </label>

          {/* Reset to Demo */}
          <button
            onClick={onResetSampleData}
            className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition space-y-1.5"
          >
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <h5 className="font-bold text-xs text-slate-800">Reset Sample Garden</h5>
            <p className="text-[11px] text-slate-400">Re-seed with Money Plant, Snake Plant, Tulsi, Rose</p>
          </button>

        </div>

        {/* Clear Data dangerous action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Need to start completely from scratch?</span>
          <button
            onClick={onClearAllData}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All Garden Data
          </button>
        </div>

      </div>

    </div>
  );
}
