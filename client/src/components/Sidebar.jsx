import React from "react";
import { 
  LayoutDashboard, 
  Flower2, 
  BookOpen, 
  Bot, 
  ScanSearch, 
  CalendarDays, 
  Settings,
  Heart,
  Droplets,
  ExternalLink
} from "lucide-react";

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  totalPlants,
  needsWaterCount,
  healthyCount
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "plants",
      label: "My Plants",
      icon: Flower2,
      badge: totalPlants > 0 ? totalPlants : null,
      badgeColor: "bg-emerald-100 text-emerald-800"
    },
    {
      id: "library",
      label: "Plant Library",
      icon: BookOpen,
      badge: "12+"
    },
    {
      id: "chat",
      label: "AI Assistant",
      icon: Bot,
      badge: "Gemini",
      badgeColor: "bg-teal-100 text-teal-800"
    },
    {
      id: "diagnose",
      label: "Disease Detection",
      icon: ScanSearch,
      badge: "Vision",
      badgeColor: "bg-purple-100 text-purple-800"
    },
    {
      id: "schedule",
      label: "Care Schedule",
      icon: CalendarDays,
      badge: needsWaterCount > 0 ? `${needsWaterCount} Due` : null,
      badgeColor: "bg-rose-100 text-rose-800"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      badge: null
    }
  ];

  const handleSelectPage = (id) => {
    setActivePage(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:sticky top-[61px] left-0 z-40 h-[calc(100vh-61px)] w-64 bg-white/95 border-r border-slate-200/80 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Navigation Items */}
        <div className="space-y-1.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? "bg-white/20 text-white" 
                        : item.badgeColor || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Garden Health Mini Card */}
        <div className="pt-4 border-t border-slate-100 mt-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Garden Health
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {totalPlants > 0 ? `${Math.round((healthyCount / totalPlants) * 100)}%` : "100%"}
              </span>
            </div>

            {/* Health Meter */}
            <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalPlants > 0 ? (healthyCount / totalPlants) * 100 : 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Flower2 className="w-3 h-3 text-emerald-600" /> {totalPlants} Plants
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-amber-600" /> {needsWaterCount} Needs Water
              </span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
