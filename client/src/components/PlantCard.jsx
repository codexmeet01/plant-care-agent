import React from "react";
import confetti from "canvas-confetti";
import { 
  Droplets, 
  Sun, 
  MapPin, 
  Calendar, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { calculateWateringStatus } from "../utils/storage";

export default function PlantCard({ 
  plant, 
  onWater, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onAskAi
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  const waterInfo = calculateWateringStatus(plant.lastWateredDate, plant.wateringIntervalDays);

  // Close dropdown menu on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWaterClick = (e) => {
    e.stopPropagation();
    
    // Trigger celebratory particle burst
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 },
        colors: ["#10b981", "#06b6d4", "#3b82f6", "#a7f3d0"]
      });
    } catch (err) {
      // safe fallback if canvas is not ready
    }

    onWater(plant.id);
  };

  const getHealthBadge = (status) => {
    switch (status) {
      case "Healthy":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          text: "Healthy"
        };
      case "Needs Water":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertCircle,
          text: "Needs Water"
        };
      case "Needs Attention":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: AlertCircle,
          text: "Attention"
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          icon: CheckCircle2,
          text: status || "Good"
        };
    }
  };

  const healthBadge = getHealthBadge(plant.healthStatus);
  const HealthIcon = healthBadge.icon;

  const isDueOrOverdue = waterInfo.status === "overdue" || waterInfo.status === "due_today";

  return (
    <div 
      onClick={() => onViewDetails(plant)}
      className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Image & Floating Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img 
          src={plant.imageUrl || "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80"} 
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80";
          }}
        />

        {/* Gradient shadow overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Health status pill */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs border ${healthBadge.bg}`}>
            <HealthIcon className="w-3.5 h-3.5" />
            {healthBadge.text}
          </span>
        </div>

        {/* Top Right Context Dropdown Menu */}
        <div className="absolute top-3 right-3" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition"
            aria-label="Plant actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onViewDetails(plant);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" /> View Care Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onAskAi(plant);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Ask AI About This
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(plant);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Plant
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(plant.id);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Plant
              </button>
            </div>
          )}
        </div>

        {/* Plant Name overlay on image base */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-bold leading-tight drop-shadow-md truncate">
            {plant.name}
          </h3>
          <p className="text-xs text-white/90 drop-shadow-sm italic truncate">
            {plant.species}
          </p>
        </div>
      </div>

      {/* Body: Location, Light & Watering Metrics */}
      <div className="p-4 space-y-3.5">
        
        {/* Meta tags */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate max-w-[140px]" title={plant.location}>
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{plant.location || "Indoor"}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{plant.sunlight || "Bright Indirect"}</span>
          </span>
        </div>

        {/* Watering Status Progress Card */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Next Watering:
            </span>
            <span className={`font-bold ${
              waterInfo.status === "overdue" ? "text-rose-600" :
              waterInfo.status === "due_today" ? "text-amber-600" : "text-emerald-700"
            }`}>
              {waterInfo.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                waterInfo.status === "overdue" ? "bg-rose-500" :
                waterInfo.status === "due_today" ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${waterInfo.percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Every {plant.wateringIntervalDays} days</span>
            <span>Last: {plant.lastWateredDate || "Not recorded"}</span>
          </div>
        </div>

        {/* Action Button: Mark as Watered */}
        <button
          type="button"
          onClick={handleWaterClick}
          className={`w-full py-2.5 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 ${
            isDueOrOverdue
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          <Droplets className={`w-4 h-4 ${isDueOrOverdue ? "fill-white" : "fill-emerald-600 text-emerald-600"}`} />
          <span>Mark as Watered</span>
        </button>

      </div>
    </div>
  );
}
