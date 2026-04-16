import { getTravelItinerary } from '../services/llm.service.js';

export const generateRecommendations = async (req, res) => {
    try {
        const travelData = req.body;

        console.log("✈️ Data received from Frontend:", travelData);
        console.log("⏳ Sending data to TravelGenieAi (Groq AI)...");

        // Service call karke itinerary generate karwa rahe hain
        const itinerary = await getTravelItinerary(travelData);

        console.log("✅ Itinerary generated successfully!");

        // Frontend ko real response bhej do
        res.status(200).json({
            success: true,
            data: itinerary, 
        });

    } catch (error) {
        console.error("❌ Error generating recommendation:", error.message);
        console.log("🛠️ SENDING FALLBACK MOCK DATA SO FRONTEND DOESN'T BREAK...");

        // PRO DEV TRICK: Agar API fail ho jaye, toh ye beautiful Table wala Fallback data bhej do
        const destination = req.body.destination || "your destination";
        const mockItinerary = `
## 🏕️ Welcome to ${destination}!
**⚠️ NOTE:** *The AI API is currently experiencing high traffic or token limits. This is a sample itinerary generated so you can test the UI without crashing!*

## Day 1: Arrival & Local Vibes
| Time | Activity | Highlights | Food | Local Guide Secret |
|---|---|---|---|---|
| 🌅 Morning | Arrive at ${destination} | Check into budget stay | Quick local breakfast | Ask the host for a local map |
| ☀️ Afternoon | Explore nearby markets | Shopping and photos | Famous street food | Bargain hard at street stalls |
| 🌙 Evening | Watch the sunset | Relaxing views | Authentic dinner | Book dinner table in advance |

## Day 2: The Core Adventure
| Time | Activity | Highlights | Food | Local Guide Secret |
|---|---|---|---|---|
| 🌅 Morning | Main attraction visit | Trekking or sightseeing | Packed snacks | Start early to avoid crowds |
| ☀️ Afternoon | Continue exploring | Hidden trails | Lunch at a local cafe | Try the regional special tea |
| 🌙 Evening | Campfire or cafe visit | Live music & chill | Light dinner | Carry a light jacket |

## 💰 Budget Breakdown
- **Transport:** 40% of budget
- **Stay:** 30% of budget
- **Food & Activities:** 30% of budget

*TravelGenieAi hopes you have a great trip!*
        `;

        // Frontend ko Fallback success response bhej do
        res.status(200).json({
            success: true,
            data: mockItinerary,
            isMock: true
        });
    }
};