# 🌿 PlantCare AI — Intelligent Plant Care Agent

A modern, responsive, nature-inspired web application designed to help users keep their indoor and outdoor plants healthy with automated watering schedules, personalized botanical advice, plant disease diagnosis, and smart reminders.

---

## 🌟 Key Features

### 1. 📊 Nature-Inspired Dashboard
- **Garden Metrics at a Glance:** Live counters for Total Plants, Needs Water Today, Overdue Care, and Garden Health Index (%).
- **Hydration Action Strip:** One-click bulk watering for all thirsty plants with celebratory confetti animations.
- **Botanical Tip of the Day:** Pro-tips for soil moisture testing and seasonal hydration.
- **Quick Plant Grid:** Filter by status (Healthy, Needs Water, Attention) and search across nicknames, species, and rooms.

### 2. 🪴 My Plants Management
- **Full CRUD Support:** Add, edit, inspect, and remove plants with ease.
- **Custom Care Parameters:** Set custom watering intervals (in days), sunlight exposures, planting dates, and last watered timestamps.
- **Photo Customization:** Choose from botanical presets, upload local images (with base64 conversion), or enter image URLs.
- **Multi-Room Grouping & Sorting:** Filter by Living Room, Bedroom, Balcony, Terrace, Office, or Garden Bed. Sort by water urgency, name, or planting date.
- **Persistent Storage:** All plant profiles and care history are saved locally in `localStorage`.

### 3. 🤖 AI Plant Care Chatbot
- **Horticultural Expert Agent:** Answers real-world plant questions:
  - *"Why are my plant leaves turning yellow?"*
  - *"How often should I water my money plant?"*
  - *"What fertilizer is best for a rose plant?"*
  - *"Why is my plant not growing?"*
- **Plant Context Focus:** Option to focus chat on a specific plant from your garden for context-aware advice.
- **Live Gemini & Demo Mode Support:** Powered by Google's latest **Gemini 3.8 Flash** (`gemini-3.8-flash`). If no API key is provided, operates seamlessly in intelligent Demo Mode with a built-in botanical knowledge base.

### 4. 🔍 Leaf Disease Detection
- **Multimodal Leaf Analysis:** Upload or drag-and-drop leaf photos to detect fungal, bacterial, or deficiency issues.
- **Test Specimens Included:** Built-in test cases for Early Blight, Powdery Mildew, and Healthy foliage.
- **Honest Diagnostic Guarantee:** When an API key is configured, runs neural vision analysis with symptoms, causes, organic solutions, and fungicides. When no key is set, explicitly labels Demo Mode without generating fabricated scans.

### 5. 📚 Botanical Care Encyclopedia (Library)
- **12+ Popular Species:** Money Plant, Snake Plant, Aloe Vera, Tulsi (Holy Basil), Rose, Tomato, Peace Lily, Monstera Deliciosa, Spider Plant, ZZ Plant, Jade Plant, Fiddle Leaf Fig.
- **Detailed Specifications:** Sunlight, soil mix, watering frequency, temperature ranges, and pet toxicity indicators.
- **"Add to My Garden" Shortcut:** One-click adoption that pre-fills the Add Plant form with accurate care parameters.

### 6. 📅 Smart Care & Hydration Schedule
- **Automated Categorization:** Groups tasks into *Overdue*, *Due Today*, *Tomorrow*, *This Week*, and *Future Care*.
- **One-Click Hydration:** "Mark as Watered" logs the action timestamp and recalculates the next due date based on the plant's interval.
- **Historical Care Log:** Chronological timeline of all waterings, fertilizations, and prunings.

### 7. ⚙️ Settings & Data Portability
- **Gemini Key Configuration:** Test and save custom Gemini API keys without exposing them in frontend code.
- **Temperature Units:** Switch between Celsius (°C) and Fahrenheit (°F).
- **JSON Backup & Restore:** Export your entire garden to a `.json` backup file or restore from previous backups.
- **Sample Garden Reset:** One-click button to load realistic default plants (Luna, Verde, Sacred Shanti, Ruby Queen).

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Icons & UI** | Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express.js |
| **AI Integration** | Google GenAI SDK (`@google/genai`), Gemini 3.8 Flash (`gemini-3.8-flash`) |
| **Storage** | Client `localStorage` (with JSON backup export/import) |

---

## 📂 Project Structure

```
plant-care-agent/
├── package.json               # Root scripts (concurrently dev runner)
├── README.md                  # Project documentation
├── server/
│   ├── package.json           # Express server dependencies
│   ├── server.js              # Express API server & Gemini integration
│   ├── .env.example           # Server environment template
│   ├── .env                   # Server environment file (API keys)
│   └── data/
│       └── plantsLibrary.js   # Curated botanical library dataset
└── client/
    ├── package.json           # React & Vite dependencies
    ├── vite.config.js         # Vite configuration with Tailwind v4 & API proxy
    ├── index.html             # Application entry point with fonts & SEO
    └── src/
        ├── App.jsx            # Main application orchestrator & router
        ├── App.css            # Application styles
        ├── index.css          # Tailwind CSS v4 & custom botanical theme
        ├── main.jsx           # React DOM root
        ├── utils/
        │   └── storage.js     # LocalStorage helpers & date calculators
        ├── components/
        │   ├── Navbar.jsx     # Navigation bar & status pill
        │   ├── Sidebar.jsx    # Responsive sidebar navigation
        │   ├── PlantCard.jsx  # Plant card with progress ring & actions
        │   ├── PlantModal.jsx # Add/Edit modal with image upload
        │   ├── PlantDetailModal.jsx # Deep-dive plant care profile
        │   └── Toast.jsx      # Animated feedback notifications
        └── pages/
            ├── Dashboard.jsx  # Main metrics & garden overview
            ├── MyPlants.jsx   # Filterable plant management
            ├── PlantLibrary.jsx # Botanical encyclopedia
            ├── AiAssistant.jsx # Interactive Gemini AI chatbot
            ├── DiseaseDetection.jsx # Multimodal leaf scanner
            ├── CareSchedule.jsx # Schedule & historical timeline
            └── Settings.jsx   # Gemini key setup & data management
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 1. Install Dependencies
Run the install command from the root directory:
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Configure Environment (Optional)
The application works **100% out of the box in Demo Mode** without any API key.

To unlock live neural responses from **Google Gemini 3.8 Flash**:
1. Copy `server/.env.example` to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```
2. Open `server/.env` and insert your Gemini API Key:
   ```env
   PORT=5000
   GEMINI_API_KEY=AIzaSy...
   ```
*(You can also set the API key directly within the app's **Settings** page!)*

### 3. Run the Complete Application
To start both the Express backend and the Vite frontend simultaneously:
```bash
npm run dev
```

Or start each service independently:
- **Backend API Server (Port 5000):**
  ```bash
  npm run dev:server
  ```
- **Frontend Vite Dev Server (Port 5173):**
  ```bash
  npm run dev:client
  ```

### 4. Open in Browser
Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Local Verification & User Flows

1. **Dashboard & Watering:**
   - Notice the plants loaded on first launch (*Luna, Verde, Sacred Shanti, Ruby Queen*).
   - Click **"Mark as Watered"** on *Sacred Shanti* to test the confetti animation, updated next watering date, and health status reset.
2. **Adding a New Plant:**
   - Click the **"+ Add Plant"** button.
   - Enter a name (e.g. *Jade Master*), select species *Jade Plant*, set location to *Sunny Balcony*, adjust watering interval to *14 days*, and choose a photo preset or upload an image.
   - Click **"Add Plant to Garden"** and refresh the page to verify persistence.
3. **Plant Library:**
   - Click **"Plant Library"** in the sidebar.
   - Search for *Tulsi* or *Rose*.
   - Click **"Add to My Garden"** to verify that care parameters are pre-filled automatically.
4. **AI Plant Assistant:**
   - Navigate to **"AI Assistant"**.
   - Click the prompt chip: *"Why are my plant leaves turning yellow?"*.
   - Select a plant from your garden using the dropdown menu to ask customized questions.
5. **Disease Detection:**
   - Navigate to **"Disease Detection"**.
   - Select the sample leaf specimen (*Early Blight Leaf* or *Powdery Mildew*).
   - Click **"Run Leaf Diagnostic Scan"** to view symptoms, causes, and organic treatments.
6. **Care Schedule & History:**
   - Open **"Care Schedule"** to review grouped tasks (*Overdue, Today, Tomorrow, This Week*).
   - Switch to the **"Care History Log"** tab to verify all recorded actions.

---

## 🔑 API Keys Information

| API | Key Name | Required? | Description |
|---|---|---|---|
| **Google Gemini API** | `GEMINI_API_KEY` | Optional | Free key from [Google AI Studio](https://aistudio.google.com). Unlocks live `gemini-3.8-flash` chatbot answers and neural vision leaf disease detection. |

*If no key is configured, PlantCare AI operates seamlessly in Demo Mode with zero crashes.*
