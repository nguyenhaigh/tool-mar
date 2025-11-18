// backend-server/src/services/gemini.service.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import config from '../config';

// Lấy các giá trị Enum từ file types (Giả sử bạn sẽ copy file types.ts sang backend)
// Tạm thời hardcode ở đây để đơn giản
const validSentiments = ['Positive', 'Negative', 'Neutral'];
const validTopics = ['Campaign', 'Shipping', 'Price', 'Product Quality', 'CustomerService', 'General', 'Product'];

const genAI = new GoogleGenerativeAI(config.geminiApiKey!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Dùng model mới hơn
});

const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function suggestLabels(content: string): Promise<{ sentiment: string; topic: string }> {

  const prompt = `
    Analyze the following content and determine its sentiment and topic.
    Content: "${content}"

    Instructions:
    1.  Classify the sentiment as one of: ${validSentiments.join(', ')}.
    2.  Classify the topic as one of: ${validTopics.join(', ')}.
    3.  Provide the output in JSON format: {"sentiment": "...", "topic": "..."}
    `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const jsonString = response.text().trim().replace(/```json|```/g, ''); // Dọn dẹp
    const parsed = JSON.parse(jsonString);

    // Validate the parsed data
    if (!validSentiments.includes(parsed.sentiment) || !validTopics.includes(parsed.topic)) {
      throw new Error(`Invalid labels received from API: ${jsonString}`);
    }

    return parsed as { sentiment: string; topic: string };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestion from AI");
  }
}