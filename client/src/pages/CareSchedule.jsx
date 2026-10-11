import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  CalendarDays, 
  Droplets, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ChevronRight,
  Sparkles,
  History,
  Filter
} from "lucide-react";
import { calculateWateringStatus } from "../utils/storage";

export default function CareSchedule({ 
  plants = [], 
  onWater, 
  onViewDetails, 
  careLogs = [],
  onSnoozePlant
}) {
  const [selectedTab, setSelectedTab] = useState("schedule"); // 'schedule' | 'history'

  const handleWaterClick = (plantId) => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10b981", "#06b6d4", "#3b82f6"]
      });
    } catch (e) {}
    onWater(plantId);
  };

  // Group plants by urgency
  const categorized = plants.reduce(
    (acc, plant) => {
      const waterInfo = calculateWateringStatus(plant.lastWateredDate, plant.wateringIntervalDays);

      if (waterInfo.status === "overdue") {
        acc.overdue.push({ ...plant, waterInfo });
      } else if (waterInfo.status === "due_today") {
        acc.dueToday.push({ ...plant, waterInfo });
      } else if (waterInfo.daysDiff === 1) {
        acc.dueTomorrow.push({ ...plant, waterInfo });
      } else if (waterInfo.daysDiff <= 7) {
        acc.thisWeek.push({ ...plant, waterInfo });
      } else {
        acc.later.push({ ...plant, waterInfo });
      }
      return acc;
    },
    { overdue: [], dueToday: [], dueTomorrow: [], thisWeek: [], later: [] }
  );

  const totalActionNeeded = categorized.overdue.length + categorized.dueToday.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Care & Hydration Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Timeline reminders, interval tracking, and historical care logs
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setSelectedTab("schedule")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              selectedTab === "schedule"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" /> Upcoming Tasks ({plants.length})
          </button>
          <button
            onClick={() => setSelectedTab("history")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              selectedTab === "history"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Care History Log ({careLogs.length})
          </button>
        </div>
      </div>

      {selectedTab === "schedule" ? (
        <div className="space-y-6">
          
          {/* Summary Alert Pill */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                <Droplets className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {totalActionNeeded > 0
                    ? `${totalActionNeeded} Plant${totalActionNeeded > 1 ? "s" : ""} Require Watering Today`
                    : "Garden Hydration Optimal — Zero Overdue Tasks!"}
                </h4>
                <p className="text-xs text-slate-600">
                  Automated schedules calculated based on each plant's custom interval and species needs.
                </p>
              </div>
            </div>

            {totalActionNeeded > 0 && (
              <button
                onClick={() => {
                  [...categorized.overdue, ...categorized.dueToday].forEach(p => handleWaterClick(p.id));
                }}
                className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                Water All Due
              </button>
            )}
          </div>

          {/* Group 1: Overdue Care (Red) */}
          {categorized.overdue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <h3>Overdue Watering ({categorized.overdue.length})</h3>
              </div>

              <div className="space-y-2">
                {categorized.overdue.map(plant => (
                  <ScheduleItemCard
                    key={plant.id}
                    plant={plant}
                    waterInfo={plant.waterInfo}
                    onWater={() => handleWaterClick(plant.id)}
                    onViewDetails={() => onViewDetails(plant)}
                    badgeColor="bg-rose-100 text-rose-700 border-rose-200"
                    isUrgent={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Due Today (Amber) */}
          {categorized.dueToday.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <h3>Watering Due Today ({categorized.dueToday.length})</h3>
              </div>

              <div className="space-y-2">
                {categorized.dueToday.map(plant => (
                  <ScheduleItemCard
                    key={plant.id}
                    plant={plant}
                    waterInfo={plant.waterInfo}
                    onWater={() => handleWaterClick(plant.id)}
                    onViewDetails={() => onViewDetails(plant)}
                    badgeColor="bg-amber-100 text-amber-700 border-amber-200"
                    isUrgent={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Tomorrow */}
          {categorized.dueTomorrow.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                <h3>Tomorrow ({categorized.dueTomorrow.length})</h3>
              </div>

              <div className="space-y-2">
                {categorized.dueTomorrow.map(plant => (
                  <ScheduleItemCard
                    key={plant.id}
                    plant={plant}
                    waterInfo={plant.waterInfo}
                    onWater={() => handleWaterClick(plant.id)}
                    onViewDetails={() => onViewDetails(plant)}
                    badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 4: This Week */}
          {categorized.thisWeek.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <CalendarDays className="w-4 h-4 text-teal-600" />
                <h3>Upcoming This Week ({categorized.thisWeek.length})</h3>
              </div>

              <div className="space-y-2">
                {categorized.thisWeek.map(plant => (
                  <ScheduleItemCard
                    key={plant.id}
                    plant={plant}
                    waterInfo={plant.waterInfo}
                    onWater={() => handleWaterClick(plant.id)}
                    onViewDetails={() => onViewDetails(plant)}
                    badgeColor="bg-slate-100 text-slate-700 border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group 5: Later / Drought-tolerant */}
          {categorized.later.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <h3>Future Care ({categorized.later.length})</h3>
              </div>

              <div className="space-y-2">
                {categorized.later.map(plant => (
                  <ScheduleItemCard
                    key={plant.id}
                    plant={plant}
                    waterInfo={plant.waterInfo}
                    onWater={() => handleWaterClick(plant.id)}
                    onViewDetails={() => onViewDetails(plant)}
                    badgeColor="bg-slate-50 text-slate-600 border-slate-200"
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Care Logs History Tab */
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Care Log History Timeline
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All recorded waterings, fertilizer doses, and pruning events are safely preserved in browser storage.
            </p>

            {careLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                No care activities recorded yet. When you mark plants as watered, timestamps will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {careLogs.map(log => (
                  <div 
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Droplets className="w-4 h-4 fill-emerald-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">
                          {log.plantName} — <span className="capitalize text-emerald-700 font-semibold">{log.actionType}</span>
                        </h5>
                        <p className="text-[11px] text-slate-500">{log.notes || "Recorded care activity."}</p>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium sm:text-right shrink-0">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component for individual schedule item
function ScheduleItemCard({ plant, waterInfo, onWater, onViewDetails, badgeColor, isUrgent }) {
  return (
    <div 
      onClick={onViewDetails}
      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-12 h-12 rounded-xl object-cover shrink-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80";
          }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-slate-800 truncate group-hover:text-emerald-700 transition">
              {plant.name}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {waterInfo.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">
            {plant.species} • <span className="text-slate-400">{plant.location}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={e => e.stopPropagation()}>
        <span className="text-xs text-slate-400 hidden md:inline">
          Due: <strong className="text-slate-700">{waterInfo.nextWaterDate}</strong>
        </span>

        <button
          type="button"
          onClick={onWater}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
            isUrgent
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/20"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
          }`}
        >
          <Droplets className={`w-3.5 h-3.5 ${isUrgent ? "fill-white" : "fill-emerald-600"}`} />
          <span>Mark Watered</span>
        </button>
      </div>
    </div>
  );
}
