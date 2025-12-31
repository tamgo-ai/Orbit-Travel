import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a luxury description for a vehicle
export const generateLuxuryDescription = async (vehicleName: string, category: string, features: string[]): Promise<string> => {
  if (!apiKey) return "Luxury vehicle description unavailable (API Key missing).";

  try {
    const prompt = `
      Write a short, sophisticated, and seductive marketing description (max 2 sentences) for a luxury vehicle rental.
      The vehicle is a ${vehicleName} (${category}).
      Key features: ${features.join(', ')}.
      Tone: Exclusive, high-end, professional, "Succession" style wealth.
      Do not use emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Experience the pinnacle of automotive excellence.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Experience unparalleled comfort and style with this premium vehicle.";
  }
};

// Helper to suggest an itinerary based on location (just for fun in the booking flow)
export const suggestItinerary = async (location: string): Promise<string> => {
    if (!apiKey) return "";
    
    try {
        const prompt = `Give a 1-sentence luxury recommendation for someone arriving in ${location}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
}