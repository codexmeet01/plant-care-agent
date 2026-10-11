// LocalStorage management and initial sample datasets for PlantCare AI

export const STORAGE_KEYS = {
  PLANTS: "plantcare_ai_plants",
  CARE_LOGS: "plantcare_ai_care_logs",
  SETTINGS: "plantcare_ai_settings",
  CHAT_HISTORY: "plantcare_ai_chat_history"
};

// Initial realistic sample plants for first launch
export const INITIAL_SAMPLE_PLANTS = [
  {
    id: "sample-1",
    name: "Luna",
    species: "Money Plant (Golden Pothos)",
    location: "Living Room Window",
    wateringIntervalDays: 7,
    lastWateredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    plantingDate: "2024-03-15",
    healthStatus: "Healthy",
    sunlight: "Bright Indirect",
    imageUrl: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80",
    notes: "Loves morning indirect sun. Vines are trailing beautifully along the bookshelf."
  },
  {
    id: "sample-2",
    name: "Verde",
    species: "Snake Plant (Sansevieria)",
    location: "Master Bedroom",
    wateringIntervalDays: 14,
    lastWateredDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    plantingDate: "2023-11-20",
    healthStatus: "Healthy",
    sunlight: "Low to Moderate",
    imageUrl: "https://images.unsplash.com/photo-1593482874117-89e9f1550293?auto=format&fit=crop&w=800&q=80",
    notes: "Extremely resilient. Great nighttime air cleaner in the bedroom."
  },
  {
    id: "sample-3",
    name: "Sacred Shanti",
    species: "Tulsi (Holy Basil)",
    location: "East Balcony",
    wateringIntervalDays: 3,
    lastWateredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    plantingDate: "2024-05-01",
    healthStatus: "Needs Water",
    sunlight: "Direct Sunlight",
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    notes: "Prune seed tops regularly to encourage bushier herbal foliage."
  },
  {
    id: "sample-4",
    name: "Ruby Queen",
    species: "Garden Rose",
    location: "Rooftop Garden",
    wateringIntervalDays: 4,
    lastWateredDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    plantingDate: "2024-02-10",
    healthStatus: "Needs Attention",
    sunlight: "Full Sun",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    notes: "Overdue for watering! Pruning spent blooms needed this weekend."
  }
];

// Initial default settings
export const DEFAULT_SETTINGS = {
  apiKeyOverride: "",
  tempUnit: "C",
  notificationsEnabled: true,
  dailyTipEnabled: true,
  theme: "nature-light"
};

// Safe LocalStorage helpers
export const getStoredPlants = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(INITIAL_SAMPLE_PLANTS));
      return INITIAL_SAMPLE_PLANTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_PLANTS;
  } catch (e) {
    console.error("Failed to read plants from localStorage:", e);
    return INITIAL_SAMPLE_PLANTS;
  }
};

export const saveStoredPlants = (plants) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
  } catch (e) {
    console.error("Failed to save plants to localStorage:", e);
  }
};

export const getStoredCareLogs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARE_LOGS);
    if (!raw) {
      const initialLogs = [
        {
          id: "log-1",
          plantId: "sample-1",
          plantName: "Luna",
          actionType: "watered",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Regular hydration with filtered water."
        },
        {
          id: "log-2",
          plantId: "sample-2",
          plantName: "Verde",
          actionType: "watered",
          timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Soaked and drained."
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CARE_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read care logs:", e);
    return [];
  }
};

export const saveStoredCareLogs = (logs) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CARE_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save care logs:", e);
  }
};

export const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
};

// Date & Watering Calculation utilities
export const calculateWateringStatus = (lastWateredDate, intervalDays = 7) => {
  if (!lastWateredDate) {
    return {
      status: "due_today",
      daysDiff: 0,
      nextWaterDate: new Date().toISOString().split("T")[0],
      label: "Needs Water Today",
      badgeColor: "amber",
      percentage: 100
    };
  }

  const last = new Date(lastWateredDate);
  const next = new Date(last);
  next.setDate(next.getDate() + Number(intervalDays));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  next.setHours(0, 0, 0, 0);

  const diffTime = next - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const nextWaterDateStr = next.toISOString().split("T")[0];

  // Percentage elapsed
  const totalDays = Number(intervalDays);
  const daysSince = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const percentage = Math.min(100, Math.max(0, Math.round((daysSince / totalDays) * 100)));

  if (diffDays < 0) {
    return {
      status: "overdue",
      daysDiff: diffDays,
      nextWaterDate: nextWaterDateStr,
      label: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? "day" : "days"}`,
      badgeColor: "rose",
      percentage: 100
    };
  } else if (diffDays === 0) {
    return {
      status: "due_today",
      daysDiff: 0,
      nextWaterDate: nextWaterDateStr,
      label: "Watering Due Today",
      badgeColor: "amber",
      percentage: 100
    };
  } else if (diffDays === 1) {
    return {
      status: "upcoming",
      daysDiff: 1,
      nextWaterDate: nextWaterDateStr,
      label: "Watering Tomorrow",
      badgeColor: "emerald",
      percentage
    };
  } else {
    return {
      status: "upcoming",
      daysDiff: diffDays,
      nextWaterDate: nextWaterDateStr,
      label: `In ${diffDays} days`,
      badgeColor: "emerald",
      percentage
    };
  }
};
