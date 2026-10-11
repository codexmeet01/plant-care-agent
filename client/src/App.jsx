import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import PlantModal from "./components/PlantModal";
import PlantDetailModal from "./components/PlantDetailModal";

// Pages
import Dashboard from "./pages/Dashboard";
import MyPlants from "./pages/MyPlants";
import PlantLibrary from "./pages/PlantLibrary";
import AiAssistant from "./pages/AiAssistant";
import DiseaseDetection from "./pages/DiseaseDetection";
import CareSchedule from "./pages/CareSchedule";
import Settings from "./pages/Settings";

// Utilities & Initial Data
import { 
  getStoredPlants, 
  saveStoredPlants, 
  getStoredCareLogs, 
  saveStoredCareLogs, 
  getStoredSettings, 
  saveStoredSettings,
  calculateWateringStatus,
  INITIAL_SAMPLE_PLANTS
} from "./utils/storage";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [plants, setPlants] = useState(() => getStoredPlants());
  const [careLogs, setCareLogs] = useState(() => getStoredCareLogs());
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  // Modals & Popups
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const [detailPlantModal, setDetailPlantModal] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Selected plant context for AI Assistant chat
  const [selectedPlantContext, setSelectedPlantContext] = useState(null);

  // Backend Health Telemetry
  const [serverHealth, setServerHealth] = useState({ status: "checking", hasGeminiKey: false, model: "gemini-3.8-flash" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchServerHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setServerHealth(data);
      }
    } catch (err) {
      console.log("Backend offline or not yet connected.");
      setServerHealth({ status: "offline", hasGeminiKey: false, model: "gemini-3.8-flash" });
    }
  };

  useEffect(() => {
    fetchServerHealth();
    const interval = setInterval(fetchServerHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync state to localStorage whenever modified
  useEffect(() => {
    saveStoredPlants(plants);
  }, [plants]);

  useEffect(() => {
    saveStoredCareLogs(careLogs);
  }, [careLogs]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Derived metrics
  const needsWaterCount = plants.filter(p => {
    const info = calculateWateringStatus(p.lastWateredDate, p.wateringIntervalDays);
    return info.status === "due_today" || info.status === "overdue";
  }).length;

  const healthyCount = plants.filter(p => p.healthStatus === "Healthy").length;

  // Water a plant action
  const handleWaterPlant = (plantId) => {
    const todayStr = new Date().toISOString().split("T")[0];

    setPlants(prevPlants => {
      return prevPlants.map(plant => {
        if (plant.id === plantId) {
          const updatedHealth = plant.healthStatus === "Needs Water" ? "Healthy" : plant.healthStatus;
          
          // Log care activity
          const newLog = {
            id: "log-" + Date.now(),
            plantId: plant.id,
            plantName: plant.name,
            actionType: "watered",
            timestamp: new Date().toISOString(),
            notes: `Hydrated according to ${plant.wateringIntervalDays}-day schedule.`
          };
          setCareLogs(prevLogs => [newLog, ...prevLogs]);

          showToast(`Marked ${plant.name} as watered! 💧 Next date updated.`, "success");

          return {
            ...plant,
            lastWateredDate: todayStr,
            healthStatus: updatedHealth
          };
        }
        return plant;
      });
    });

    // If detail modal is open for this plant, refresh it
    if (detailPlantModal && detailPlantModal.id === plantId) {
      setDetailPlantModal(prev => ({
        ...prev,
        lastWateredDate: todayStr,
        healthStatus: prev.healthStatus === "Needs Water" ? "Healthy" : prev.healthStatus
      }));
    }
  };

  // Add / Edit save handler
  const handleSavePlant = (plantData) => {
    if (plantToEdit) {
      // Update existing
      setPlants(prev => prev.map(p => p.id === plantToEdit.id ? { ...plantData, id: plantToEdit.id } : p));
      showToast(`Updated profile for ${plantData.name}! 🌿`, "success");
      setPlantToEdit(null);
    } else {
      // Add new
      const newPlant = {
        ...plantData,
        id: "plant-" + Date.now()
      };
      setPlants(prev => [newPlant, ...prev]);
      showToast(`Added ${plantData.name} to your garden! 🎉`, "success");
    }
  };

  // Delete plant handler
  const handleDeletePlant = (plantId) => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;

    if (window.confirm(`Are you sure you want to remove "${plant.name}" from your garden?`)) {
      setPlants(prev => prev.filter(p => p.id !== plantId));
      if (detailPlantModal && detailPlantModal.id === plantId) {
        setDetailPlantModal(null);
      }
      showToast(`Removed ${plant.name} from your garden.`, "info");
    }
  };

  // Add to garden from library
  const handleAddToGardenFromLibrary = (libPlant) => {
    setPlantToEdit(null);
    setIsAddModalOpen(true);
    // Pre-fill modal with library parameters
    setTimeout(() => {
      setPlantToEdit({
        name: `My ${libPlant.name}`,
        species: libPlant.scientificName ? `${libPlant.name} (${libPlant.scientificName})` : libPlant.name,
        location: libPlant.category === "Outdoor" ? "Garden Bed" : "Living Room",
        wateringIntervalDays: libPlant.wateringIntervalDays || 7,
        lastWateredDate: new Date().toISOString().split("T")[0],
        plantingDate: new Date().toISOString().split("T")[0],
        healthStatus: "Healthy",
        sunlight: libPlant.sunlight || "Bright Indirect",
        imageUrl: libPlant.imageUrl,
        notes: `Adopted from PlantCare Library. ${libPlant.careTips ? libPlant.careTips[0] : ""}`
      });
    }, 50);
  };

  // Ask AI about this plant
  const handleAskAiAboutPlant = (plant) => {
    setSelectedPlantContext(plant);
    setActivePage("chat");
  };

  // Reset demo data
  const handleResetSampleData = () => {
    if (window.confirm("Restore realistic demo plants (Money Plant, Snake Plant, Tulsi, Rose)?")) {
      setPlants(INITIAL_SAMPLE_PLANTS);
      showToast("Demo plants restored!", "success");
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to delete ALL plants and logs? This cannot be undone.")) {
      setPlants([]);
      setCareLogs([]);
      showToast("All garden records cleared.", "info");
    }
  };

  // Import JSON data
  const handleImportData = (importedPlants, importedLogs = []) => {
    setPlants(importedPlants);
    if (importedLogs.length > 0) {
      setCareLogs(importedLogs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={() => {
          setPlantToEdit(null);
          setIsAddModalOpen(true);
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        needsWaterCount={needsWaterCount}
        serverHealth={serverHealth}
        setActivePage={setActivePage}
      />

      {/* Main Layout Container with responsive sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Left Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          totalPlants={plants.length}
          needsWaterCount={needsWaterCount}
          healthyCount={healthyCount}
        />

        {/* Center / Right Main Content Page Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activePage === "dashboard" && (
            <Dashboard
              plants={plants}
              onWater={handleWaterPlant}
              onOpenAddModal={() => {
                setPlantToEdit(null);
                setIsAddModalOpen(true);
              }}
              onEditPlant={(plant) => {
                setPlantToEdit(plant);
                setIsAddModalOpen(true);
              }}
              onDeletePlant={handleDeletePlant}
              onViewDetails={(plant) => setDetailPlantModal(plant)}
              onAskAi={handleAskAiAboutPlant}
              setActivePage={setActivePage}
            />
          )}

          {activePage === "plants" && (
            <MyPlants
              plants={plants}
              onWater={handleWaterPlant}
              onOpenAddModal={() => {
                setPlantToEdit(null);
                setIsAddModalOpen(true);
              }}
              onEditPlant={(plant) => {
                setPlantToEdit(plant);
                setIsAddModalOpen(true);
              }}
              onDeletePlant={handleDeletePlant}
              onViewDetails={(plant) => setDetailPlantModal(plant)}
              onAskAi={handleAskAiAboutPlant}
              onResetSampleData={handleResetSampleData}
            />
          )}

          {activePage === "library" && (
            <PlantLibrary
              onAddToGarden={handleAddToGardenFromLibrary}
              onAskAi={handleAskAiAboutPlant}
            />
          )}

          {activePage === "chat" && (
            <AiAssistant
              plants={plants}
              selectedPlantContext={selectedPlantContext}
              setSelectedPlantContext={setSelectedPlantContext}
              serverHealth={serverHealth}
              setActivePage={setActivePage}
            />
          )}

          {activePage === "diagnose" && (
            <DiseaseDetection
              serverHealth={serverHealth}
              setActivePage={setActivePage}
            />
          )}

          {activePage === "schedule" && (
            <CareSchedule
              plants={plants}
              onWater={handleWaterPlant}
              onViewDetails={(plant) => setDetailPlantModal(plant)}
              careLogs={careLogs}
            />
          )}

          {activePage === "settings" && (
            <Settings
              settings={settings}
              onSaveSettings={setSettings}
              serverHealth={serverHealth}
              onRefreshHealth={fetchServerHealth}
              plants={plants}
              careLogs={careLogs}
              onImportData={handleImportData}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
              showToast={showToast}
            />
          )}
        </main>

      </div>

      {/* Add / Edit Plant Modal */}
      <PlantModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPlantToEdit(null);
        }}
        onSave={handleSavePlant}
        plantToEdit={plantToEdit}
      />

      {/* Detailed Plant Profile Modal */}
      <PlantDetailModal
        plant={detailPlantModal}
        onClose={() => setDetailPlantModal(null)}
        onWater={handleWaterPlant}
        onEdit={(plant) => {
          setDetailPlantModal(null);
          setPlantToEdit(plant);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeletePlant}
        onAskAi={handleAskAiAboutPlant}
        careLogs={careLogs}
        onAddCareLog={(newLog) => {
          setCareLogs(prev => [newLog, ...prev]);
          showToast(`Care action logged for ${newLog.plantName}!`, "success");
        }}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
