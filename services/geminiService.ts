
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const COMEDY_ANALYSIS_PROMPT = `Analyze this comedy performance specifically for audience laughter and engagement.
Please provide:
1. A summary of the comedian's style and overall performance.
2. A detailed list of 'Laughter Events'. For every time the audience laughs:
   - Provide the timestamp (e.g., 1:24).
   - Describe the 'setup' or punchline that triggered it.
   - Rate the intensity from 1 (audible breath/smile) to 10 (standing ovation/explosive laughter).
   - Categorize the 'reactionType' (e.g., "Chuckle", "Guffaw", "Roar", "Applause Break").
3. Three deep 'deliveryInsights' regarding timing, stage presence, or joke structure.
4. An 'overallEngagementScore' from 1-100.
5. Identify the 'topPerformingJoke' based on the strongest audience reaction.

Return the response in JSON format.`;

export const analyzeVideo = async (videoBase64: string, mimeType: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: videoBase64,
            },
          },
          { text: COMEDY_ANALYSIS_PROMPT }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            laughterEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  setup: { type: Type.STRING },
                  intensity: { type: Type.NUMBER },
                  reactionType: { type: Type.STRING }
                },
                required: ['timestamp', 'setup', 'intensity', 'reactionType']
              }
            },
            deliveryInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            overallEngagementScore: { type: Type.NUMBER },
            topPerformingJoke: { type: Type.STRING }
          },
          required: ['summary', 'laughterEvents', 'deliveryInsights', 'overallEngagementScore', 'topPerformingJoke']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Comedy Analysis Error:", error);
    throw error;
  }
};

export const analyzeYoutubeVideo = async (url: string): Promise<{ analysis: AnalysisResult, sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a deep comedy analysis on this YouTube video: ${url}. 
      Use Google Search to find transcripts, audience reviews, and performance breakdowns if needed.
      
      ${COMEDY_ANALYSIS_PROMPT}`,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType: "application/json" might be tricky with search grounding, 
        // so we'll try to extract JSON from the text if it's not strictly JSON.
      }
    });

    const resultText = response.text || "";
    // Search for JSON block in the response text in case the model adds conversational filler
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : resultText) as AnalysisResult;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { analysis, sources };
  } catch (error) {
    console.error("YouTube Analysis Error:", error);
    throw error;
  }
};

export const chatWithVideo = async (
  videoBase64: string | null, 
  mimeType: string | null, 
  history: { role: string, content: string }[],
  newMessage: string,
  youtubeUrl?: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  
  if (videoBase64 && mimeType) {
    parts.push({ inlineData: { mimeType, data: videoBase64 } });
  } else if (youtubeUrl) {
    parts.push({ text: `Context: Analyzing YouTube video at ${youtubeUrl}` });
  }

  parts.push(...history.map(m => ({ text: m.content })));
  parts.push({ text: newMessage });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: youtubeUrl ? { tools: [{ googleSearch: {} }] } : {}
    });
    return response.text;
  } catch (error) {
    console.error("Comedy Chat Error:", error);
    throw error;
  }
};
