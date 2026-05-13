const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Download the image
  const res = await fetch('https://i.imgur.com/maMbWFm.jpeg');
  const buffer = await res.arrayBuffer();
  fs.writeFileSync('temp.jpg', Buffer.from(buffer));
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      {
        role: 'user',
        parts: [
          { text: "Describe this UI design in exact detail. Specifically list all the tabs in the bottom navigation bar, all buttons on the dashboard, colors, and layout." },
          { inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: "image/jpeg" } }
        ]
      }
    ]
  });
  console.log(response.text);
}
run().catch(console.error);
