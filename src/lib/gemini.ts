import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeReceipt(base64Image: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this receipt. Extract the following information:
1. The amount transferred (in numbers only)
2. The recipient phone number or name
3. Is it falsified or a valid receipt? Check for mismatched fonts, alignment issues, or signs of tampering. Return a boolean.

Return the result as JSON.`,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType,
            },
          },
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: {
            type: Type.NUMBER,
            description: "The amount transferred. Omit currency symbols and just return the number."
          },
          recipient: {
            type: Type.STRING,
            description: "The recipient phone number or the recipient name found on the receipt."
          },
          is_falsified: {
            type: Type.BOOLEAN,
            description: "True if there are visible signs of falsification or tampering, false otherwise."
          },
          reasoning: {
            type: Type.STRING,
            description: "Short explanation for why it may be falsified or valid."
          }
        },
        required: ["amount", "recipient", "is_falsified", "reasoning"]
      }
    }
  });

  const jsonStr = response.text?.trim() || '{}';
  return JSON.parse(jsonStr) as { amount: number, recipient: string, is_falsified: boolean, reasoning: string };
}
