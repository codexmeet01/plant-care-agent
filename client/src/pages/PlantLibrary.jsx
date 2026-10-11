import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Droplets, 
  Sun, 
  Thermometer, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Sparkles, 
  Layers, 
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { plantLibraryData } from "../../../server/data/plantsLibrary.js";

export default function PlantLibrary({ onAddToGarden, onAskAi }) {
  const [libraryPlants, setLibraryPlants] = useState(plantLibraryData);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [petFriendlyOnly, setPetFriendlyOnly] = useState(false);
  const [selectedPlantDetail, setSelectedPlantDetail] = useState(null);

  useEffect(() => {
    // Try fetching latest library from backend API
    fetch("/api/library")
      .then(res => res.json())
      .then(data => {
        if (data.plants && data.plants.length > 0) {
          setLibraryPlants(data.plants);
        }
      })
      .catch(err => {
        // Fallback to imported plantLibraryData seamlessly
        console.log("Using local botanical library cache.");
      });
  }, []);

  const filteredPlants = libraryPlants.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;
    const matchesPet = !petFriendlyOnly || p.isPetFriendly;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesPet;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Botanical Care Encyclopedia
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Horticultural blueprints, watering parameters, and care guidelines for common species
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {libraryPlants.length} Botanical Profiles
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by common name, scientific name (e.g. Tulsi, Rose, Aloe, Pothos)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Indoor">Indoor Houseplants</option>
              <option value="Medicinal / Herb">Medicinal & Herbs</option>
              <option value="Flowering">Flowering Plants</option>
              <option value="Vegetable">Vegetables</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none focus:border-emerald-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner Friendly</option>
              <option value="Intermediate">Intermediate</option>
            </select>
          </div>

        </div>

        {/* Pet Friendly Toggle & Quick category chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {["Money Plant", "Snake Plant", "Aloe Vera", "Tulsi", "Rose", "Tomato", "Peace Lily"].map(quick => (
              <button
                key={quick}
                onClick={() => setSearchQuery(quick)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition"
              >
                {quick}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={petFriendlyOnly}
              onChange={e => setPetFriendlyOnly(e.target.checked)}
              className="rounded-md text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
            />
            <span className="flex items-center gap-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Pet-Friendly Only
            </span>
          </label>
        </div>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlants.map(plant => (
          <div
            key={plant.id}
            className="bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            {/* Image & Header */}
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-emerald-800 backdrop-blur-md shadow-xs">
                    {plant.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/80 text-white backdrop-blur-md">
                    {plant.difficulty}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md flex items-center gap-1 ${
                    plant.isPetFriendly 
                      ? "bg-emerald-500/90 text-white" 
                      : "bg-rose-500/90 text-white"
                  }`}>
                    {plant.isPetFriendly ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                    {plant.isPetFriendly ? "Pet Safe" : "Pet Toxic"}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-xl font-bold leading-tight">{plant.name}</h3>
                  <p className="text-xs text-white/90 italic">{plant.scientificName}</p>
                </div>
              </div>

              {/* Plant Care Details Body */}
              <div className="p-4 space-y-3.5 text-xs">
                
                <p className="text-slate-600 line-clamp-2 leading-relaxed">
                  {plant.summary}
                </p>

                {/* Core Parameters Table */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-emerald-500" /> Watering
                    </span>
                    <p className="font-semibold text-slate-800">Every {plant.wateringIntervalDays} Days</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> Sunlight
                    </span>
                    <p className="font-semibold text-slate-800 truncate" title={plant.sunlight}>{plant.sunlight}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-purple-500" /> Soil
                    </span>
                    <p className="font-semibold text-slate-800 truncate" title={plant.soil}>{plant.soil}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-rose-500" /> Temperature
                    </span>
                    <p className="font-semibold text-slate-800 truncate" title={plant.temperatureRange}>{plant.temperatureRange}</p>
                  </div>
                </div>

                {/* Key Care Tips */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700">Essential Care Tips:</p>
                  <ul className="space-y-1">
                    {plant.careTips.slice(0, 2).map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-600 text-[11px] leading-normal">
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAddToGarden(plant)}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to My Garden</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlantDetail(plant)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="View full care profile & troubleshooting"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Comprehensive Plant Detail Modal from Library */}
      {selectedPlantDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="relative h-56 w-full">
              <img src={selectedPlantDetail.imageUrl} alt={selectedPlantDetail.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setSelectedPlantDetail(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                  {selectedPlantDetail.category}
                </span>
                <h2 className="text-2xl font-bold mt-1">{selectedPlantDetail.name}</h2>
                <p className="text-xs text-emerald-200 italic">{selectedPlantDetail.scientificName} • {selectedPlantDetail.commonName}</p>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto text-xs">
              <p className="text-slate-600 text-sm leading-relaxed">{selectedPlantDetail.summary}</p>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-700">Watering Schedule:</span>
                  <p className="text-slate-600 mt-0.5">{selectedPlantDetail.wateringSchedule}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Sunlight Needs:</span>
                  <p className="text-slate-600 mt-0.5">{selectedPlantDetail.sunlightDetail}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Fertilizer Regimen:</span>
                  <p className="text-slate-600 mt-0.5">{selectedPlantDetail.fertilizer}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Toxicity & Pets:</span>
                  <p className="text-slate-600 mt-0.5">{selectedPlantDetail.toxicity}</p>
                </div>
              </div>

              {selectedPlantDetail.commonIssues && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm">Common Issues & Solutions</h4>
                  <div className="space-y-2">
                    {selectedPlantDetail.commonIssues.map((issue, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                        <span className="font-bold text-amber-900">{issue.issue}:</span>
                        <p className="text-amber-800 mt-0.5">{issue.symptom}</p>
                        <p className="text-emerald-800 font-semibold mt-1">💡 Solution: {issue.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const plant = selectedPlantDetail;
                    setSelectedPlantDetail(null);
                    onAddToGarden(plant);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" /> Add to My Garden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
