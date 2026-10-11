import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { plantLibraryData } from "./data/plantsLibrary.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Helper: Determine if an API key is available
function getEffectiveApiKey(reqKey) {
  if (reqKey && typeof reqKey === "string" && reqKey.trim().length > 10) {
    return reqKey.trim();
  }
  return process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";
}

// Helper: sleep utility for exponential backoff
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Check if error is temporary/retryable (503 UNAVAILABLE or 429 RESOURCE_EXHAUSTED / RATE LIMIT)
function isRetryableError(err) {
  const status = Number(err?.status) || Number(err?.statusCode) || Number(err?.code);
  if (status === 503 || status === 429) return true;
  const msg = typeof err?.message === "string" ? err.message : "";
  if (msg.includes("503") || msg.includes("429")) return true;
  const lowerMsg = msg.toLowerCase();
  return (
    lowerMsg.includes("unavailable") ||
    lowerMsg.includes("high demand") ||
    lowerMsg.includes("resource_exhausted") ||
    lowerMsg.includes("too many requests") ||
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("overloaded") ||
    lowerMsg.includes("temporarily")
  );
}

// Helper: Sanitize error messages to prevent leaking API keys or secrets in logs/responses
function sanitizeError(err, apiKey) {
  if (!err) return "";
  let msg = err.message || String(err);
  if (apiKey && typeof apiKey === "string" && apiKey.length > 5) {
    msg = msg.replaceAll(apiKey, "[REDACTED_API_KEY]");
  }
  msg = msg.replace(/key=[a-zA-Z0-9_\-\.]+/gi, "key=[REDACTED]");
  msg = msg.replace(/(AQ\.[a-zA-Z0-9_\-]{20,}|AIzaSy[a-zA-Z0-9_\-]{30,})/g, "[REDACTED_API_KEY]");
  return msg;
}

/**
 * Execute an operation with exponential backoff retry for temporary errors (503 / 429).
 * Maximum of 3 attempts with reasonable exponential backoff delays and a 25s timeout guard.
 */
async function callGeminiWithRetry(fn, maxAttempts = 3, initialDelayMs = 1000) {
  let attempt = 1;
  let delay = initialDelayMs;

  while (attempt <= maxAttempts) {
    let timerId;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => {
          const timeoutErr = new Error("Gemini API call timed out after 25 seconds.");
          timeoutErr.status = 503;
          reject(timeoutErr);
        }, 25000);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      clearTimeout(timerId);
      return result;
    } catch (err) {
      if (timerId) clearTimeout(timerId);
      const isRetryable = isRetryableError(err);
      if (isRetryable && attempt < maxAttempts) {
        console.warn(
          `[PlantCare AI] Gemini API temporary error (attempt ${attempt}/${maxAttempts}, status: ${err.status || err.code || "503"}). Retrying in ${delay}ms...`
        );
        await wait(delay);
        delay *= 2;
        attempt++;
      } else {
        throw err;
      }
    }
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  res.json({
    status: "ok",
    service: "PlantCare AI Backend API",
    hasGeminiKey: hasEnvKey,
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    timestamp: new Date().toISOString()
  });
});

// Plant Library endpoint
app.get("/api/library", (req, res) => {
  const { query, category, difficulty } = req.query;
  let results = [...plantLibraryData];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.commonName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (category && category !== "All") {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty && difficulty !== "All") {
    results = results.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  res.json({
    count: results.length,
    plants: results
  });
});

// Smart Fallback Plant Care Knowledge Base for Chatbot Demo Mode
function getSmartFallbackReply(message, plantContext) {
  const q = (message || "").toLowerCase();

  let contextPrefix = "";
  if (plantContext && plantContext.name) {
    contextPrefix = `*(Advice tailored for your **${plantContext.name}** [${plantContext.species || "Houseplant"}] in the **${plantContext.location || "Indoor"}**)*\n\n`;
  }

  if (q.includes("yellow") && (q.includes("leaf") || q.includes("leaves"))) {
    return (
      contextPrefix +
      `### 🌿 Why Leaves Turn Yellow (Chlorosis) & What To Do

Yellowing leaves are the most common cry for help from houseplants. Here is how to diagnose and fix it:

1. **Overwatering (Most Frequent Cause ~70% of cases):**
   - **Symptom:** Lower leaves turn pale yellow, feel soft, limp, or slightly soggy. The soil remains damp for days.
   - **Action:** Stick your finger 2 inches into the soil. If damp, cease watering immediately. Ensure the pot has functional drainage holes and empty saucers of still water.

2. **Under-watering / Dehydration:**
   - **Symptom:** Yellow leaves are accompanied by crisp, dry brown tips and drooping posture. Soil pulls away from pot edges.
   - **Action:** Give a thorough, deep watering until water freely flows from the drainage hole.

3. **Lighting Shock:**
   - **Symptom:** Leaves pale gradually, or scorch yellow-brown if recently exposed to sudden direct sun.
   - **Action:** Move the plant to **bright indirect sunlight** (near a sheer curtain or north/east window).

4. **Nutrient Deficiency (Nitrogen or Iron):**
   - **Symptom:** New leaves are pale or yellow with green veins (interveinal chlorosis).
   - **Action:** Feed with a balanced, organic water-soluble houseplant fertilizer diluted to half-strength.

*(Note: PlantCare AI is operating in working demo mode. Add a Gemini API key in Settings or server/.env for personalized neural responses!)*`
    );
  }

  if (q.includes("money plant") && (q.includes("water") || q.includes("often"))) {
    return (
      contextPrefix +
      `### 💧 How Often to Water a Money Plant (Pothos)

Money Plants (*Epipremnum aureum*) prefer to dry slightly between waterings:

- **Standard Frequency:** Every **7 to 10 days** in warm months (spring/summer), and every **12 to 14 days** in winter.
- **The Golden Rule:** Always test the top **1 to 2 inches** of soil with your finger or a moisture meter. If it feels dry and powdery, water thoroughly. If damp, wait another 3-4 days.
- **Watering in Water Jars:** If growing directly in a vase with water, change the water every **7 to 10 days** to prevent algae and replenish dissolved oxygen.
- **Tip:** Drooping leaves that perk up within hours after hydration mean it was just thirsty!`
    );
  }

  if (q.includes("rose") && (q.includes("fertilizer") || q.includes("food") || q.includes("feed"))) {
    return (
      contextPrefix +
      `### 🌹 Best Fertilizer for Rose Plants

Roses are heavy feeders that thrive on a balanced diet rich in nitrogen, phosphorus, and potassium (NPK):

1. **Active Blooming Phase (Spring - Summer):**
   - Use an **organic rose fertilizer with a 10-15-10 or 8-12-8 NPK ratio**.
   - Feed every **2 to 3 weeks** around the drip line (avoid placing directly against the woody cane).

2. **Organic Boosters:**
   - **Bone Meal:** Rich in slow-release phosphorus for explosive root formation and profuse blooms.
   - **Epsom Salt (Magnesium Sulfate):** 1 tablespoon dissolved in 1 liter of water once a month promotes lush dark foliage and new cane sprouts (basal breaks).
   - **Vermicompost / Well-rotted Cow Manure:** Top-dress 2 inches around the base in late winter or early spring.

3. **Watering Rule:** Always water the soil deeply before and after applying granular fertilizer to prevent root burn!`
    );
  }

  if (q.includes("not growing") || q.includes("slow growth") || q.includes("stunted")) {
    return (
      contextPrefix +
      `### 🌱 Why Is Your Plant Not Growing? Checklist & Solution

When plant growth stalls, review these 5 vital factors:

1. **Inadequate Light (Primary Reason):**
   - Photosynthesis requires photon energy. A plant placed in a dark corner will survive in stasis but cannot produce new growth.
   - **Fix:** Relocate closer to an east or south window with bright, filtered sunlight.

2. **Dormancy Season:**
   - Most plants naturally slow down or halt growth during autumn and winter due to cooler temperatures and shorter daylight hours.
   - **Fix:** Normal seasonal behavior! Reduce watering and hold fertilizers until spring.

3. **Root-Bound Roots:**
   - If roots are circling tightly inside the pot or poking through bottom drainage holes, the plant has exhausted its soil volume.
   - **Fix:** Repot into a container **2 inches larger** in diameter with fresh potting soil.

4. **Soil Nutrient Depletion:**
   - Potting soil loses its organic nutrients after 6-9 months of watering.
   - **Fix:** Apply a gentle liquid organic fertilizer diluted to 50% strength.

5. **Pest Pressure:**
   - Inspect the underside of leaves and leaf nodes for spider mites, mealybugs, or scale sucking the plant's sap.`
    );
  }

  if (q.includes("snake plant") || q.includes("sansevieria")) {
    return (
      contextPrefix +
      `### 🪴 Snake Plant Care Master Guide

- **Water:** Only every **2 to 3 weeks**. Let the soil dry out 100%. Overwatering is the only real way to harm a snake plant!
- **Sunlight:** From low light bedroom corners to bright direct sunshine, snake plants tolerate virtually any environment.
- **Soil:** Fast-draining succulent or cactus mix with coarse perlite.
- **Pro Tip:** Never pour water into the central leaf crown; water into the surrounding soil to prevent crown rot.`
    );
  }

  if (q.includes("aloe")) {
    return (
      contextPrefix +
      `### 🌵 Aloe Vera Care Guide

- **Watering:** Water deeply every **2 to 3 weeks**. Allow the potting soil to dry out completely between waterings.
- **Sunlight:** Bright direct or bright indirect light for 4 to 6 hours daily.
- **Pot & Soil:** Plant in terracotta pots with drainage holes and sandy cactus mix.
- **Harvesting:** Always cut the outermost, thickest leaves close to the base for fresh healing gel!`
    );
  }

  if (q.includes("tulsi") || q.includes("holy basil")) {
    return (
      contextPrefix +
      `### 🌿 Sacred Tulsi (Holy Basil) Care

- **Watering:** Daily or every 2 days in warm weather. Water in the morning, keeping soil moist but well-drained.
- **Sunlight:** Full direct sunlight (4 to 6 hours minimum). Tulsi craves warmth and light.
- **Pruning (Important):** Pinch off the flower seed heads (*manjari*) as soon as they form to keep the plant bushy and prevent it from going to seed and dying.
- **Winter Care:** Protect from freezing drafts; bring indoors near a sunny south-facing window when cold.`
    );
  }

  // Generic comprehensive response
  return (
    contextPrefix +
    `### 🌿 PlantCare AI Horticultural Advice

Thank you for asking about **"${message}"**!

Here are essential recommendations:
- **Hydration Check:** Always test the top 1-2 inches of soil before watering. Overwatering causes 80% of houseplant problems.
- **Light Requirement:** Most common houseplants prefer bright, indirect light rather than harsh direct midday sun.
- **Ventilation & Airflow:** Ensure good air circulation around foliage to prevent fungal spores and pest infestations.
- **Drainage:** Always check that the pot has unobstructed drainage holes and never allow pots to sit in standing water.

*(Demo Mode Note: To get instant, dynamic neural AI responses powered by Google Gemini 3.8 Flash, simply add your \`GEMINI_API_KEY\` in Settings or the server/.env file!)*`
  );
}

// AI Plant Assistant Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history = [], plantContext = null, apiKeyOverride = null } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  const apiKey = getEffectiveApiKey(apiKeyOverride);

  // If no Gemini API Key is available, use our high quality demo knowledge base
  if (!apiKey) {
    const demoReply = getSmartFallbackReply(message, plantContext);
    return res.json({
      reply: demoReply,
      source: "demo-knowledge-base",
      isDemo: true,
      tip: "Set GEMINI_API_KEY in server/.env or in Settings to unlock live Google Gemini 3.8 Flash intelligence!"
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Construct system and context instructions
    let systemInstruction = `You are PlantCare AI, an empathetic, expert horticulturalist and botanist.
Your goal is to help users keep their plants vibrant and healthy.
Provide accurate, actionable advice on:
- Watering frequencies and soil moisture testing
- Lighting and placement requirements
- Fertilizer types, NPK ratios, and application schedules
- Diagnosing leaf problems (yellowing, browning, drooping, curling)
- Pest management (organic and conventional)
- Propagation and repotting
Format responses using clear markdown with headings, bullet points, and bold terms. Keep answers practical, encouraging, and easy to follow.`;

    if (plantContext && plantContext.name) {
      systemInstruction += `\n\nCURRENT PLANT IN FOCUS:
Name: ${plantContext.name}
Species: ${plantContext.species || "Unspecified"}
Location: ${plantContext.location || "Indoor"}
Watering Interval: Every ${plantContext.wateringIntervalDays || 7} days
Health Status: ${plantContext.healthStatus || "Healthy"}
Last Watered: ${plantContext.lastWateredDate || "Unknown"}
Give answers specifically tailored to this plant's environment and care profile!`;
    }

    // Prepare contents payload
    const contents = [];

    // Add prior conversational turns if provided
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach(msg => {
        contents.push({
          role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.content || msg.text || "" }]
        });
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const response = await callGeminiWithRetry(async () => {
      return await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction
        }
      });
    }, 3, 1000);

    const reply = response.text || "I was unable to generate a response. Please try again.";

    res.json({
      reply,
      source: modelName,
      isDemo: false
    });
  } catch (err) {
    console.error("Gemini API Chat Error:", err);
    // Graceful fallback if API call failed (e.g., quota or invalid key)
    const fallbackReply = getSmartFallbackReply(message, plantContext);
    res.json({
      reply: fallbackReply,
      source: "demo-fallback-after-error",
      isDemo: true,
      apiError: err.message || "Failed to communicate with Gemini API. Showing local botanical response."
    });
  }
});

// Plant Disease Detection Endpoint (Multimodal Leaf Analysis)
app.post("/api/diagnose", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg", plantName = "", symptomsDescription = "", apiKeyOverride = null } = req.body;

  const apiKey = getEffectiveApiKey(apiKeyOverride);

  // If no API key is configured, explicitly state demo mode without fabricating fake real-time analysis
  if (!apiKey) {
    return res.json({
      success: true,
      isDemo: true,
      message: "Demo Mode Active: No Google Gemini API key is configured. To analyze your uploaded leaf image with the live Gemini 3.8 Flash Vision model, configure your GEMINI_API_KEY in server/.env or in Settings.",
      sampleDiseasesReference: [
        {
          name: "Early Blight (Alternaria solani)",
          targetPlants: "Tomato, Potato",
          symptoms: "Concentric 'target-board' dark brown rings on older foliage with yellow halos",
          organicRemedy: "Copper fungicide, neem oil, remove infected lower foliage and mulch soil",
          chemicalRemedy: "Chlorothalonil or Mancozeb fungicide"
        },
        {
          name: "Powdery Mildew (Erysiphales)",
          targetPlants: "Rose, Squash, Cucumber, Begonia",
          symptoms: "White talcum-powder-like coating on leaf surfaces and young shoots",
          organicRemedy: "Baking soda spray (1 tsp baking soda + 1/2 tsp dish soap in 1L water) or diluted milk spray (40% milk / 60% water in sun)",
          chemicalRemedy: "Myclobutanil or sulfur-based dusts"
        },
        {
          name: "Bacterial Leaf Spot (Xanthomonas)",
          targetPlants: "Pothos, Peace Lily, Pepper, Ficus",
          symptoms: "Water-soaked dark lesions that become angular, often surrounded by yellow chlorotic margins",
          organicRemedy: "Avoid overhead watering; isolate plant; spray with copper-based bactericide",
          chemicalRemedy: "Streptomycin sulfate or copper octanoate"
        },
        {
          name: "Root Rot & Edema",
          targetPlants: "Snake Plant, ZZ Plant, Succulents, Monstera",
          symptoms: "Yellowing lower leaves, mushy brown root base, foul soil odor, blisters under leaves",
          organicRemedy: "Unpot immediately, trim mushy black roots with sanitized shears, soak remaining roots in 3% hydrogen peroxide solution, repot in fresh dry soil",
          chemicalRemedy: "Mefenoxam or fosetyl-Al drench for severe greenhouse cases"
        }
      ]
    });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: "Leaf image (imageBase64) is required for analysis." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Handle image input: support data URL, raw base64, or remote image URL
    let cleanBase64 = "";
    let effectiveMimeType = mimeType || "image/jpeg";

    if (typeof imageBase64 === "string" && (imageBase64.startsWith("http://") || imageBase64.startsWith("https://"))) {
      try {
        const fetchRes = await fetch(imageBase64, { signal: AbortSignal.timeout(8000) });
        if (!fetchRes.ok) {
          throw new Error(`Failed to retrieve image: HTTP ${fetchRes.status}`);
        }
        const arrayBuf = await fetchRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuf).toString("base64");
        const ct = fetchRes.headers.get("content-type");
        if (ct) effectiveMimeType = ct;
      } catch (fetchErr) {
        return res.status(400).json({
          success: false,
          error: "Could not retrieve the remote leaf image. Please upload a local image file."
        });
      }
    } else if (typeof imageBase64 === "string") {
      cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").replace(/\s/g, "");
    }

    if (!cleanBase64 || cleanBase64.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid or empty leaf image data provided."
      });
    }

    const promptText = `You are a certified plant pathologist and diagnostic AI. Analyze this leaf or plant image carefully.
Plant Name / Type reported by user: ${plantName || "Not specified"}
User reported symptoms: ${symptomsDescription || "None provided"}

Determine if the plant exhibits any disease, pest infestation, nutrient deficiency, or cultural/environmental damage, or if it is healthy.
Return your diagnosis strictly as a JSON object with this exact structure:
{
  "conditionName": "Specific name of the disease, condition, or 'Healthy Plant'",
  "scientificName": "Pathogen scientific name or physiological condition",
  "confidencePercent": 88,
  "severity": "Healthy" | "Mild" | "Moderate" | "Severe",
  "visibleSymptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "underlyingCauses": ["cause 1", "cause 2"],
  "immediateActions": ["action step 1", "action step 2"],
  "organicTreatments": ["organic remedy 1", "organic remedy 2"],
  "chemicalTreatments": ["chemical treatment or write 'None needed' if organic/mild"],
  "preventionTips": ["prevention tip 1", "prevention tip 2"],
  "overallAssessment": "2-3 sentences summarizing the plant's condition and outlook."
}

Do not enclose with any markdown code blocks other than json. Return strictly valid JSON.`;

    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const response = await callGeminiWithRetry(async () => {
      return await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: effectiveMimeType
                }
              },
              {
                text: promptText
              }
            ]
          }
        ]
      });
    }, 3, 1000);

    const textOutput = response.text || "";
    // Parse JSON safely
    const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
    let diagnosisData = null;
    if (jsonMatch) {
      try {
        diagnosisData = JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        console.warn("[PlantCare AI] JSON parse failed on Gemini response text; formatting fallback structure.");
      }
    }

    if (!diagnosisData) {
      if (!textOutput.trim()) {
        throw new Error("Gemini AI returned an empty diagnosis response.");
      }
      diagnosisData = {
        conditionName: "Visual Inspection Completed",
        scientificName: "Visual assessment by Gemini AI",
        confidencePercent: 75,
        severity: "Moderate",
        visibleSymptoms: ["Visual changes observed in leaf morphology."],
        underlyingCauses: ["Environmental stress or pathogen activity."],
        immediateActions: ["Isolate plant from others while monitoring."],
        organicTreatments: ["Neem oil spray and clean leaf wipe down."],
        chemicalTreatments: ["Consult local nursery if symptoms spread."],
        preventionTips: ["Avoid overhead watering and provide adequate airflow."],
        overallAssessment: textOutput
      };
    }

    res.json({
      success: true,
      isDemo: false,
      diagnosis: diagnosisData,
      source: `${modelName}-vision`
    });
  } catch (err) {
    const safeMsg = sanitizeError(err, apiKey);
    console.error(`[PlantCare AI Diagnosis Error] Status: ${err?.status || err?.code || 500} - Details: ${safeMsg}`);

    if (isRetryableError(err)) {
      return res.status(503).json({
        success: false,
        error: "The AI service is temporarily busy. Please try again in a moment.",
        details: safeMsg
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to analyze leaf image with Gemini API.",
      details: safeMsg
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🌿 PlantCare AI Backend running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});
