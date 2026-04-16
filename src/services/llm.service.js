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

CRITICAL FORMATTING RULE: You MUST **bold** the names of all specific locations, cafes, restaurants, monuments, beaches, and landmarks mentioned in your text.

Format EXACTLY like this for each day:
## Day 1: [Exciting Title for the Day]
* **🌅 Morning:** [Write 3 to 4 LONG, descriptive sentences. Detail the atmosphere, what to do, what to see, and specifically name local food/cafes to try. Remember to **bold** locations. Do NOT be brief.]
* **☀️ Afternoon:** [Write 3 to 4 LONG, descriptive sentences. Include specific travel routes, local interactions, and immersive details. Remember to **bold** locations. Do NOT be brief.]
* **🌙 Evening:** [Write 3 to 4 LONG, descriptive sentences. Focus on relaxing activities, sunset spots, and dinner recommendations. Remember to **bold** locations. Do NOT be brief.]
* **💡 Local Secret:** [Write a highly detailed 2-3 sentence hidden gem or pro-tip that only locals know. **Bold** the specific hidden location.]

After the last day, you MUST provide a smart packing list strictly tailored to the vibe and weather of ${destination}:
## 🎒 Packing Essentials
* **[Essential Item 1]:** [Why it is strictly needed for ${destination}]
* **[Essential Item 2]:** [Why it is strictly needed for ${destination}]
* **[Essential Item 3]:** [Why it is strictly needed for ${destination}]
* **[Essential Item 4]:** [Why it is strictly needed for ${destination}]

After the packing list, provide EXACTLY this heading for budget:
## 💰 Budget Breakdown
- Transport: ...
- Stay: ...
- Food & Activities: ...

Respond in ${language}. Make the text sound deeply descriptive, human, and exciting! Never write short or fragmented sentences.
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