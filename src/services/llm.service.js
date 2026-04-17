import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const validateTravelData = (data) => {
  const { origin, destination, timing, guests, budget_limit } = data;
  if (!origin || !destination || !timing || !guests || !budget_limit) {
    throw new Error("Missing required travel data fields.");
  }
  if (!guests.adult && !guests.child) {
    throw new Error("At least one guest is required.");
  }
};

export const getTravelItinerary = async (travelData) => {
  try {
    validateTravelData(travelData);

    const { origin, destination, timing, guests, budget_limit, language = "English" } = travelData;
    const totalGuests = (guests.adult || 0) + (guests.child || 0);

    // 🧠 ADVANCED PROMPT WITH PACKING ESSENTIALS
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
Do NOT use tables. Write in a clean, engaging, and premium travel blog style using bullet points.
You MUST **bold** the names of all specific locations, cafes, restaurants, and landmarks.

Format EXACTLY like this for each day:
## Day 1: [Exciting Title for the Day]
* **🌅 Morning:** [Write 3 to 4 LONG, descriptive sentences...]
* **☀️ Afternoon:** [Write 3 to 4 LONG, descriptive sentences...]
* **🌙 Evening:** [Write 3 to 4 LONG, descriptive sentences...]
* **💡 Local Secret:** [Write a 2-3 sentence hidden gem...]

After the itinerary, provide a smart packing list:
## 🎒 Packing Essentials
* **[Item]:** [Why it is needed]

After the packing list, provide EXACTLY 4 real hotel/stay recommendations for ${destination} categorized by budget. 
CRITICAL RULE: You MUST strictly format each hotel line separating details with the "|" (pipe) character like this:
## 🏨 Recommended Stays
* **[Category]:** **[Hotel Name]** | [Approx Price per night] | [2-3 Top Amenities like WiFi, Pool, Spa] | [1-2 lines of descriptive text]

Example: 
* **Budget:** **The Orchid Inn** | ₹1,500 | Free WiFi, Breakfast | A cozy budget-friendly stay near the city center.

After the stays, provide EXACTLY this heading for budget:
## 💰 Budget Breakdown
- Transport: ...
- Stay: ...
- Food & Activities: ...

Respond in ${language}. Never write short or fragmented sentences.
`;

    const messages = [
      {
        role: "system",
        content: "You are a precise AI travel planner that strictly follows formatting rules. You must NEVER use tables. Only output clean bullet points.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const fallbackModels = [
      "llama-3.1-8b-instant",      
      "mixtral-8x7b-32768",        
      "llama-3.3-70b-versatile"    
    ];

    let responseContent = null;
    let successfulModel = "";

    for (const model of fallbackModels) {
      try {
        console.log(`🤖 Trying Groq model: ${model}...`);
        const completion = await groq.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.5, 
          max_tokens: 2000,
        });

        responseContent = completion.choices[0]?.message?.content;
        successfulModel = model;
        break; 
      } catch (err) {
        console.warn(`⚠️ Model ${model} failed. Trying next...`);
      }
    }

    if (!responseContent) {
      throw new Error("All AI models are currently overloaded. Please try again.");
    }

    console.log(`✅ Response generated successfully using: ${successfulModel}`);
    return responseContent;

  } catch (error) {
    console.error("❌ Groq Service Error:", error);
    const errorMessage = error?.message || "Failed to generate itinerary";
    throw new Error(errorMessage);
  }
};