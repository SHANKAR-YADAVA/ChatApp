import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const translateText = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang" });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a translation model. Only return the translated version of the input text in the target language. Do not add explanations, transliterations, or any formatting."
          },
          {
            role: "user",
            content: `Translate this text to ${targetLang}: ${text}`
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let translatedText = response.data.choices?.[0]?.message?.content?.trim();

    // Optional: get only the first line to remove extra explanation if any
    translatedText = translatedText.split("\n")[0];

    res.status(200).json({ translatedText });
  } catch (error) {
    console.error("Groq translation error:", error.response?.data || error.message);
    res.status(500).json({ error: "Groq translation failed" });
  }
};
