import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🔍 Validate Input
const validateTravelData = (data) => {
  const { origin, destination, timing, guests, budget_limit } = data;

  if (!origin || !destination || !timing || !guests || !budget_limit) {
    throw new Error("Missing required travel data fields.");
  }

  if (!guests.adult && !guests.child) {
    throw new Error("At least one guest is required.");
  }
};

// 🚀 Main Function
export const getTravelItinerary = async (travelData) => {
  try {
    validateTravelData(travelData);

    const {
      origin,
      destination,
      timing,
      guests,
      budget_limit,
      language = "English",
    } = travelData;

    const totalGuests = (guests.adult || 0) + (guests.child || 0);

    // 🧠 ADVANCED TABLE-FORCING PROMPT
// File: src/services/llm.service.js (Only the prompt part)

    // 🧠 NEW CLEAN FORMAT PROMPT
    const prompt = `
You are TravelGenieAi, an enthusiastic and highly knowledgeable local tourist guide.

Traveler Details:
- 📍 Traveling From: ${origin}
- 🗺️ Destination: ${destination}
- 📅 Dates: ${timing}
- 👥 Guests: ${totalGuests} (Adults: ${guests.adult}, Children: ${guests.child})
- 💰 Budget: ${budget_limit}

CRITICAL INSTRUCTIONS:
You MUST create a detailed day-by-day itinerary. 
Do NOT use tables. Write in a clean, engaging, and premium travel blog style.

Format EXACTLY like this for each day:
## Day 1: [Exciting Title for the Day]
* **🌅 Morning:** [Descriptive activity and food suggestions, 2-3 lines]
* **☀️ Afternoon:** [Descriptive activity and food suggestions, 2-3 lines]
* **🌙 Evening:** [Descriptive activity and food suggestions, 2-3 lines]
* **💡 Local Secret:** [A hidden gem or pro-tip]

After completing all days, provide:
## 💰 Budget Breakdown
- Transport: ...
- Stay: ...
- Food & Activities: ...

Respond in ${language}. Make the text sound human and exciting!
`;

    const messages = [
      {
        role: "system",
        content: "You are a precise AI travel planner that strictly follows formatting rules and always outputs daily schedules in Markdown tables.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    // Llama 3.3 70B is Groq's most powerful and fast free model
    const model = "llama-3.3-70b-versatile"; 
    console.log(`🤖 Sending request to Groq using model: ${model}`);

    // 🔁 Call Groq API
    const completion = await groq.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.5, // Thoda kam kiya taaki format strict rahe
      max_tokens: 2000,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "No itinerary generated.";

    console.log("📤 Response generated successfully via Groq!");

    return response;
  } catch (error) {
    console.error("❌ Groq Service Error:", error);

    const errorMessage =
      error?.response?.data?.error?.message ||
      error?.message ||
      error?.error?.message ||
      "Failed to generate itinerary";

    throw new Error(errorMessage);
  }
};