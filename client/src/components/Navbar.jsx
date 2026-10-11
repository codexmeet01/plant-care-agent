import React from "react";
import { 
  Sprout, 
  Plus, 
  Menu, 
  X, 
  Cpu, 
  Droplets,
  Sparkles 
} from "lucide-react";

export default function Navbar({ 
  onOpenAddModal, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  needsWaterCount, 
  serverHealth,
  setActivePage
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActivePage("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 animate-sway" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent">
                  PlantCare
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Intelligent Horticultural Agent</p>
            </div>
          </div>
        </div>

        {/* Center / Right: Status Badges & Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* AI Status Badge */}
          <button
            onClick={() => setActivePage("settings")}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              serverHealth?.hasGeminiKey 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }`}
            title={serverHealth?.hasGeminiKey ? "Connected to Google Gemini 3.8 Flash" : "Working in Demo Mode. Click to configure API Key."}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{serverHealth?.hasGeminiKey ? "Gemini 3.8 Flash Active" : "AI Demo Mode"}</span>
          </button>

          {/* Plants Needing Water Alert Pill */}
          {needsWaterCount > 0 && (
            <button
              onClick={() => setActivePage("schedule")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition animate-pulse"
              title={`${needsWaterCount} plant(s) need hydration today!`}
            >
              <Droplets className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{needsWaterCount} Due</span>
            </button>
          )}

          {/* Quick Add Plant Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Plant</span>
            <span className="sm:hidden">Add</span>
          </button>

        </div>

      </div>
    </header>
  );
}
