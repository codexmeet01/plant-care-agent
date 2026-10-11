import React, { useState, useEffect } from "react";
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Droplets, 
  Sun, 
  MapPin, 
  Calendar, 
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react";

const SAMPLE_PHOTO_PRESETS = [
  { label: "Pothos / Money Plant", url: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=800&q=80" },
  { label: "Snake Plant", url: "https://images.unsplash.com/photo-1593482874117-89e9f1550293?auto=format&fit=crop&w=800&q=80" },
  { label: "Aloe Vera", url: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80" },
  { label: "Tulsi / Herb", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80" },
  { label: "Rose", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" },
  { label: "Monstera", url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80" }
];

export default function PlantModal({ 
  isOpen, 
  onClose, 
  onSave, 
  plantToEdit = null 
}) {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    location: "Living Room",
    wateringIntervalDays: 7,
    lastWateredDate: new Date().toISOString().split("T")[0],
    plantingDate: new Date().toISOString().split("T")[0],
    healthStatus: "Healthy",
    sunlight: "Bright Indirect",
    imageUrl: SAMPLE_PHOTO_PRESETS[0].url,
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [imageMethod, setImageMethod] = useState("preset"); // 'preset' | 'upload' | 'url'

  useEffect(() => {
    if (plantToEdit) {
      setFormData({
        name: plantToEdit.name || "",
        species: plantToEdit.species || "",
        location: plantToEdit.location || "Living Room",
        wateringIntervalDays: plantToEdit.wateringIntervalDays || 7,
        lastWateredDate: plantToEdit.lastWateredDate || new Date().toISOString().split("T")[0],
        plantingDate: plantToEdit.plantingDate || new Date().toISOString().split("T")[0],
        healthStatus: plantToEdit.healthStatus || "Healthy",
        sunlight: plantToEdit.sunlight || "Bright Indirect",
        imageUrl: plantToEdit.imageUrl || SAMPLE_PHOTO_PRESETS[0].url,
        notes: plantToEdit.notes || ""
      });
      setImageMethod("url");
    } else {
      setFormData({
        name: "",
        species: "",
        location: "Living Room",
        wateringIntervalDays: 7,
        lastWateredDate: new Date().toISOString().split("T")[0],
        plantingDate: new Date().toISOString().split("T")[0],
        healthStatus: "Healthy",
        sunlight: "Bright Indirect",
        imageUrl: SAMPLE_PHOTO_PRESETS[0].url,
        notes: ""
      });
      setImageMethod("preset");
    }
    setErrors({});
  }, [plantToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Plant name is required.";
    if (!formData.species.trim()) newErrors.species = "Species or variety is required.";
    if (!formData.wateringIntervalDays || Number(formData.wateringIntervalDays) < 1) {
      newErrors.wateringIntervalDays = "Interval must be at least 1 day.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      wateringIntervalDays: Number(formData.wateringIntervalDays)
    });
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Image must be less than 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      setErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {plantToEdit ? "Edit Plant Profile" : "Add Plant to Your Garden"}
              </h2>
              <p className="text-xs text-emerald-100">
                {plantToEdit ? "Update watering rules, status, and notes" : "Provide details to establish custom watering schedules"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Plant Name & Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Plant Nickname <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Luna, Sunny, Emerald Queen"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                  errors.name ? "border-rose-300 bg-rose-50/50" : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Species / Botanical Variety <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.species}
                onChange={e => setFormData({ ...formData, species: e.target.value })}
                placeholder="e.g. Golden Pothos, Snake Plant, Rose"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition ${
                  errors.species ? "border-rose-300 bg-rose-50/50" : "border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.species && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.species}</p>}
            </div>
          </div>

          {/* Location & Sunlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location in Home / Garden
              </label>
              <div className="relative">
                <select
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none bg-white"
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Sunny Balcony">Sunny Balcony</option>
                  <option value="Kitchen Window">Kitchen Window</option>
                  <option value="Home Office">Home Office</option>
                  <option value="Bathroom">Bathroom (High Humidity)</option>
                  <option value="Terrace / Rooftop">Terrace / Rooftop</option>
                  <option value="Garden Bed">Garden Bed (Outdoor)</option>
                </select>
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sunlight Exposure
              </label>
              <div className="relative">
                <select
                  value={formData.sunlight}
                  onChange={e => setFormData({ ...formData, sunlight: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 appearance-none bg-white"
                >
                  <option value="Low Light">Low Light (Shaded corner)</option>
                  <option value="Bright Indirect">Bright Indirect (Filtered sun)</option>
                  <option value="Medium Light">Medium Light (East morning sun)</option>
                  <option value="Direct Sunlight">Direct Sunlight (4-6+ hrs sun)</option>
                </select>
                <Sun className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Watering Interval (Days) with presets */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                Watering Schedule Interval
              </label>
              <span className="text-sm font-extrabold text-emerald-700">
                Every {formData.wateringIntervalDays} {Number(formData.wateringIntervalDays) === 1 ? "day" : "days"}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              value={formData.wateringIntervalDays}
              onChange={e => setFormData({ ...formData, wateringIntervalDays: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[2, 4, 7, 10, 14, 21].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, wateringIntervalDays: d })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    formData.wateringIntervalDays === d
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {d === 2 ? "Every 2 days (Herbs)" :
                   d === 4 ? "4 days (Flowers)" :
                   d === 7 ? "7 days (Weekly)" :
                   d === 10 ? "10 days (Foliage)" :
                   d === 14 ? "14 days (Succulents)" : "21 days (Cactus)"}
                </button>
              ))}
            </div>
          </div>

          {/* Dates: Last Watered & Planting Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Watered Date
              </label>
              <input
                type="date"
                value={formData.lastWateredDate}
                onChange={e => setFormData({ ...formData, lastWateredDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Planting / Adopted Date
              </label>
              <input
                type="date"
                value={formData.plantingDate}
                onChange={e => setFormData({ ...formData, plantingDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
              />
            </div>
          </div>

          {/* Health Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Health Condition
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "Healthy", label: "Healthy & Thriving", color: "border-emerald-300 text-emerald-800 bg-emerald-50" },
                { id: "Needs Water", label: "Needs Water", color: "border-amber-300 text-amber-800 bg-amber-50" },
                { id: "Needs Attention", label: "Needs Attention", color: "border-rose-300 text-rose-800 bg-rose-50" }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, healthStatus: item.id })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center ${
                    formData.healthStatus === item.id
                      ? `${item.color} ring-2 ring-emerald-500/30`
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Management: Presets / File Upload / Direct URL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Plant Photo
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageMethod("preset")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                    imageMethod === "preset" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageMethod("upload")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                    imageMethod === "upload" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMethod("url")}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                    imageMethod === "url" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            {imageMethod === "preset" && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SAMPLE_PHOTO_PRESETS.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                    className={`relative rounded-xl overflow-hidden cursor-pointer h-16 border-2 transition group ${
                      formData.imageUrl === p.url ? "border-emerald-600 ring-2 ring-emerald-600/30" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    {formData.imageUrl === p.url && (
                      <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* File Upload */}
            {imageMethod === "upload" && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-400 transition bg-slate-50/50">
                <input
                  type="file"
                  id="plant-photo-file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="plant-photo-file" className="cursor-pointer flex flex-col items-center gap-1.5">
                  <Upload className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Click to select a plant photo from your device</span>
                  <span className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</span>
                </label>
              </div>
            )}

            {/* Image URL */}
            {imageMethod === "url" && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Paste direct image URL (https://...)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>
            )}

            {/* Preview */}
            {formData.imageUrl && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = SAMPLE_PHOTO_PRESETS[0].url;
                  }}
                />
                <span className="text-xs text-slate-500 truncate flex-1">Image loaded successfully</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Personal Care Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Needs repotting this summer, prefers rainwater..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              {plantToEdit ? "Save Changes" : "Add Plant to Garden"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
