const API_KEY = "YOUR_API_KEY_HERE"; // Replace with actual key or use environment variable
const MODEL = "models/gemini-1.5-flash-001-tuning";

export async function generateChatResponse(prompt) {
  try {
    console.log(`Sending prompt to Gemini API (${MODEL}):`, prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    const data = await response.json();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return removeMarkdownFormatting(data.candidates[0].content.parts[0].text);
    }

    console.warn("Unexpected Gemini API response:", data);
    return "Sorry, I didn’t understand that.";
  } catch (error) {
    console.error("Error fetching response:", error);
    return "Sorry, an error occurred while processing your request.";
  }
}

function removeMarkdownFormatting(text) {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // bold+italic
    .replace(/\*\*(.*?)\*\*/g, "$1")     // bold
    .replace(/\*(.*?)\*/g, "$1")         // italic
    .replace(/^\* /gm, "")               // list markers
    .replace(/`/g, "")                   // inline code
    .replace(/#+ /g, "")                 // heading hashes
    .replace(/\n{2,}/g, "\n");           // excessive newlines
}
