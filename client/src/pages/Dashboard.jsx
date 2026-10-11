import React, { useState } from "react";
import { 
  Sprout, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Search, 
  ScanSearch, 
  BookOpen, 
  Plus, 
  ArrowRight,
  SunMedium,
  Heart
} from "lucide-react";
import PlantCard from "../components/PlantCard";
import { calculateWateringStatus } from "../utils/storage";

export default function Dashboard({ 
  plants, 
  onWater, 
  onOpenAddModal, 
  onEditPlant, 
  onDeletePlant, 
  onViewDetails, 
  onAskAi,
  setActivePage 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Compute metrics
  const totalPlants = plants.length;
  
  const plantsNeedingWater = plants.filter(p => {
    const info = calculateWateringStatus(p.lastWateredDate, p.wateringIntervalDays);
    return info.status === "due_today" || info.status === "overdue";
  });

  const overduePlants = plants.filter(p => {
    const info = calculateWateringStatus(p.lastWateredDate, p.wateringIntervalDays);
    return info.status === "overdue";
  });

  const healthyPlants = plants.filter(p => p.healthStatus === "Healthy");
  const healthPercentage = totalPlants > 0 ? Math.round((healthyPlants.length / totalPlants) * 100) : 100;

  // Filtered plants for display
  const filteredPlants = plants.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const waterInfo = calculateWateringStatus(p.lastWateredDate, p.wateringIntervalDays);

    if (filterStatus === "needs_water") {
      return matchesSearch && (waterInfo.status === "due_today" || waterInfo.status === "overdue");
    }
    if (filterStatus === "healthy") {
      return matchesSearch && p.healthStatus === "Healthy";
    }
    if (filterStatus === "attention") {
      return matchesSearch && (p.healthStatus === "Needs Attention" || waterInfo.status === "overdue");
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/10">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI Botanical Care Engine Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Nurture your botanical haven with intelligent care.
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base font-normal leading-relaxed">
            {plantsNeedingWater.length > 0 
              ? `You have ${plantsNeedingWater.length} plant${plantsNeedingWater.length > 1 ? "s" : ""} requesting hydration today. Keep your garden flourishing!`
              : "All your botanical friends are well hydrated and thriving today. Great job, plant parent!"}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Plant</span>
            </button>

            <button
              onClick={() => setActivePage("chat")}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold flex items-center gap-2 transition active:scale-95 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Ask AI Plant Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Plants */}
        <div 
          onClick={() => setActivePage("plants")}
          className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Plants</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalPlants}</span>
            <span className="text-xs text-slate-400 font-medium">in garden</span>
          </div>
        </div>

        {/* Needs Water Today */}
        <div 
          onClick={() => { setFilterStatus("needs_water"); }}
          className={`p-5 rounded-3xl bg-white border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            plantsNeedingWater.length > 0 ? "border-amber-200 bg-amber-50/20" : "border-slate-200/80"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Needs Water</span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
              plantsNeedingWater.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
            }`}>
              <Droplets className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{plantsNeedingWater.length}</span>
            <span className="text-xs text-slate-400 font-medium">due today</span>
          </div>
        </div>

        {/* Overdue Alerts */}
        <div 
          onClick={() => { setFilterStatus("attention"); }}
          className={`p-5 rounded-3xl bg-white border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
            overduePlants.length > 0 ? "border-rose-200 bg-rose-50/20" : "border-slate-200/80"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Overdue Care</span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
              overduePlants.length > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{overduePlants.length}</span>
            <span className="text-xs text-slate-400 font-medium">attention required</span>
          </div>
        </div>

        {/* Garden Health Index */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Health Index</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <Heart className="w-5 h-5 fill-teal-600 text-teal-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{healthPercentage}%</span>
            <span className="text-xs text-emerald-600 font-semibold">{healthyPlants.length} healthy</span>
          </div>
        </div>

      </div>

      {/* Immediate Attention Callout if plants need water */}
      {plantsNeedingWater.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Droplets className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Watering Action Required ({plantsNeedingWater.length} Plants)
              </h4>
              <p className="text-xs text-slate-600">
                {plantsNeedingWater.map(p => p.name).slice(0, 3).join(", ")}
                {plantsNeedingWater.length > 3 ? ` and ${plantsNeedingWater.length - 3} more` : ""} are thirsty.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => {
                // Water all due plants with one click
                plantsNeedingWater.forEach(p => onWater(p.id));
              }}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm active:scale-95 text-center"
            >
              Water All {plantsNeedingWater.length} Now
            </button>
            <button
              onClick={() => setActivePage("schedule")}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-100/50 text-slate-700 text-xs font-semibold border border-amber-200 transition"
            >
              View Schedule
            </button>
          </div>
        </div>
      )}

      {/* Quick AI & Diagnostic Feature Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Chatbot feature card */}
        <div 
          onClick={() => setActivePage("chat")}
          className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
            <span>AI Plant Care Chatbot</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ask questions like "Why are my leaves yellowing?" or "Best rose fertilizer?" for instant botanical advice.
          </p>
        </div>

        {/* Disease detection feature card */}
        <div 
          onClick={() => setActivePage("diagnose")}
          className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
            <ScanSearch className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
            <span>Plant Disease Detection</span>
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload leaf photos to identify fungal blights, mildew, pests, and get organic recovery treatment plans.
          </p>
        </div>

        {/* Botanical Library feature card */}
        <div 
          onClick={() => setActivePage("library")}
          className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
            <span>Plant Care Library</span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Explore comprehensive care encyclopedia for Money Plant, Snake Plant, Tulsi, Aloe, Rose, and more.
          </p>
        </div>

      </div>

      {/* Main Section: My Plant Cards with Search & Filters */}
      <div className="space-y-4">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              My Plant Sanctuary
            </h2>
            <p className="text-xs text-slate-500">
              Active houseplants and garden specimens ({filteredPlants.length} displayed)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              {[
                { id: "all", label: "All" },
                { id: "needs_water", label: "Needs Water" },
                { id: "healthy", label: "Healthy" },
                { id: "attention", label: "Attention" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    filterStatus === f.id
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Plants Grid or Empty State */}
        {filteredPlants.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Sprout className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No plants match your criteria</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm 
                ? `No plant records matched "${searchTerm}". Try adjusting your keywords or clearing filters.`
                : "Your garden is empty! Add your first plant or import from the Plant Library to get started."}
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Add Plant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPlants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onWater={onWater}
                onEdit={onEditPlant}
                onDelete={onDeletePlant}
                onViewDetails={onViewDetails}
                onAskAi={onAskAi}
              />
            ))}
          </div>
        )}

      </div>

      {/* Horticultural Tip of the Day Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <SunMedium className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Horticultural Pro Tip
          </span>
          <h4 className="text-sm font-bold text-slate-900">
            The Finger Moisture Test Beats Calendar Waterings
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Indoor temperature and humidity fluctuate constantly. Always probe the top 2 inches of soil before watering — if it feels cool and damp, your plant is satisfied. Only water when the soil feels crumbly and dry!
          </p>
        </div>
      </div>

    </div>
  );
}
