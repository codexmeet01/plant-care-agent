import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  X, 
  Droplets, 
  Sun, 
  MapPin, 
  Calendar, 
  Bot, 
  Sparkles, 
  Scissors, 
  HeartHandshake, 
  Clock, 
  Edit3, 
  Trash2,
  CheckCircle2,
  History
} from "lucide-react";
import { calculateWateringStatus } from "../utils/storage";

export default function PlantDetailModal({ 
  plant, 
  onClose, 
  onWater, 
  onEdit, 
  onDelete, 
  onAskAi,
  careLogs = [],
  onAddCareLog
}) {
  const [logActionNote, setLogActionNote] = useState("");
  const [selectedAction, setSelectedAction] = useState("fertilized");

  if (!plant) return null;

  const waterInfo = calculateWateringStatus(plant.lastWateredDate, plant.wateringIntervalDays);

  const plantLogs = careLogs.filter(log => log.plantId === plant.id);

  const handleWater = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.75 },
        colors: ["#10b981", "#06b6d4", "#3b82f6"]
      });
    } catch (e) {}
    onWater(plant.id);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (onAddCareLog) {
      onAddCareLog({
        id: "log-" + Date.now(),
        plantId: plant.id,
        plantName: plant.name,
        actionType: selectedAction,
        timestamp: new Date().toISOString(),
        notes: logActionNote.trim() || `Recorded ${selectedAction} activity.`
      });
      setLogActionNote("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Banner Image & Top Controls */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900">
          <img 
            src={plant.imageUrl} 
            alt={plant.name}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-black/30" />

          {/* Close button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner bottom info */}
          <div className="absolute bottom-4 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/80 text-white backdrop-blur-md">
                  {plant.healthStatus}
                </span>
                <span className="text-xs text-white/80 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" /> {plant.location}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                {plant.name}
              </h1>
              <p className="text-sm text-emerald-200 italic">
                {plant.species}
              </p>
            </div>

            {/* Quick Ask AI button on banner */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onAskAi(plant);
              }}
              className="px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold border border-white/30 flex items-center gap-2 transition active:scale-95 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Ask AI Care Advice</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Hydration Alert & Quick Water Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                waterInfo.status === "overdue" ? "bg-rose-100 text-rose-600" :
                waterInfo.status === "due_today" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
              }`}>
                <Droplets className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Hydration Status</p>
                <h4 className="text-base font-bold text-slate-800">
                  {waterInfo.label}
                </h4>
                <p className="text-xs text-slate-500">
                  Target Next Watering: <span className="font-semibold text-slate-700">{waterInfo.nextWaterDate}</span> (Every {plant.wateringIntervalDays} days)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWater}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Droplets className="w-4 h-4 fill-white" />
              <span>Mark as Watered Now</span>
            </button>
          </div>

          {/* Plant Core Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Sunlight
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">{plant.sunlight || "Bright Indirect"}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Water Interval
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">Every {plant.wateringIntervalDays} Days</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Last Watered
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">{plant.lastWateredDate || "Not recorded"}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-500" /> Planted Since
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">{plant.plantingDate || "Recent"}</p>
            </div>
          </div>

          {/* Care Notes */}
          {plant.notes && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/80">
              <h5 className="text-xs font-bold text-amber-900 mb-1">Care & Observational Notes</h5>
              <p className="text-xs text-amber-800 leading-relaxed">{plant.notes}</p>
            </div>
          )}

          {/* Log Additional Care Activity Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-600" />
              Log Other Care Activities
            </h5>

            <form onSubmit={handleAddLog} className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedAction}
                onChange={e => setSelectedAction(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none focus:border-emerald-500"
              >
                <option value="fertilized">🌿 Fertilized</option>
                <option value="pruned">✂️ Pruned</option>
                <option value="misted">💦 Misted Foliage</option>
                <option value="repotted">🪴 Repotted</option>
              </select>

              <input
                type="text"
                placeholder="Optional notes (e.g. half-strength seaweed fertilizer)"
                value={logActionNote}
                onChange={e => setLogActionNote(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition"
              >
                Record Action
              </button>
            </form>
          </div>

          {/* Care History Timeline */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700">Recent Care History</h5>
            {plantLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No care actions recorded yet. Watering or care actions will show here.</p>
            ) : (
              <div className="space-y-2">
                {plantLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold capitalize text-slate-800">{log.actionType}</span>
                      <span className="text-slate-500 truncate max-w-xs">{log.notes}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(plant.id);
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" /> Remove Plant
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(plant);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 transition"
              >
                Close
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
