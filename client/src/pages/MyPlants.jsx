import React, { useState, useMemo } from "react";
import { 
  Sprout, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Sparkles,
  RotateCcw
} from "lucide-react";
import PlantCard from "../components/PlantCard";
import { calculateWateringStatus, INITIAL_SAMPLE_PLANTS } from "../utils/storage";

export default function MyPlants({ 
  plants, 
  onWater, 
  onOpenAddModal, 
  onEditPlant, 
  onDeletePlant, 
  onViewDetails, 
  onAskAi,
  onResetSampleData
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("urgency"); // 'urgency' | 'name' | 'frequency' | 'recent'

  // Extract unique locations from user plants
  const uniqueLocations = useMemo(() => {
    const locs = new Set(plants.map(p => p.location).filter(Boolean));
    return Array.from(locs);
  }, [plants]);

  // Filter and sort plants
  const processedPlants = useMemo(() => {
    let result = plants.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation = 
        selectedLocation === "all" || 
        (p.location && p.location.toLowerCase() === selectedLocation.toLowerCase());

      const waterInfo = calculateWateringStatus(p.lastWateredDate, p.wateringIntervalDays);
      let matchesStatus = true;
      if (selectedStatus === "healthy") matchesStatus = p.healthStatus === "Healthy";
      if (selectedStatus === "needs_water") matchesStatus = waterInfo.status === "due_today" || waterInfo.status === "overdue";
      if (selectedStatus === "attention") matchesStatus = p.healthStatus === "Needs Attention" || waterInfo.status === "overdue";

      return matchesSearch && matchesLocation && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "urgency") {
        const aWater = calculateWateringStatus(a.lastWateredDate, a.wateringIntervalDays);
        const bWater = calculateWateringStatus(b.lastWateredDate, b.wateringIntervalDays);
        return aWater.daysDiff - bWater.daysDiff;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "frequency") {
        return a.wateringIntervalDays - b.wateringIntervalDays;
      }
      if (sortBy === "recent") {
        return new Date(b.plantingDate || 0) - new Date(a.plantingDate || 0);
      }
      return 0;
    });

    return result;
  }, [plants, searchQuery, selectedLocation, selectedStatus, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Botanical Collection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your personal garden sanctuary ({plants.length} total plants)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plants.length === 0 && (
            <button
              onClick={onResetSampleData}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample Plants</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Plant</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Sorters */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by nickname, species, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full md:w-auto px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none focus:border-emerald-500"
            >
              <option value="urgency">Sort: Water Urgency (Needs Water First)</option>
              <option value="name">Sort: Alphabetical (A-Z)</option>
              <option value="frequency">Sort: Water Frequency (Shortest first)</option>
              <option value="recent">Sort: Recently Planted</option>
            </select>
          </div>

        </div>

        {/* Location & Status Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Status:</span>
          {[
            { id: "all", label: "All Plants" },
            { id: "needs_water", label: "Needs Water" },
            { id: "healthy", label: "Healthy" },
            { id: "attention", label: "Needs Attention" }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                selectedStatus === s.id
                  ? "bg-emerald-600 text-white font-bold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}

          {uniqueLocations.length > 0 && (
            <>
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
              <span className="text-slate-400 font-semibold mr-1">Location:</span>
              <button
                onClick={() => setSelectedLocation("all")}
                className={`px-3 py-1.5 rounded-xl font-medium transition ${
                  selectedLocation === "all"
                    ? "bg-teal-600 text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Rooms
              </button>
              {uniqueLocations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition ${
                    selectedLocation === loc
                      ? "bg-teal-600 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Plants Grid */}
      {processedPlants.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Plants Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || selectedLocation !== "all" || selectedStatus !== "all"
                ? "No plants matched your selected filters or search terms."
                : "You haven't added any plants yet! Add your first companion to begin tracking."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Add Plant
            </button>
            <button
              onClick={onResetSampleData}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              Load Demo Plants
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {processedPlants.map(plant => (
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
  );
}
