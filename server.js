import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// test route
app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

// webhook
app.post("/webhook", async (req, res) => {
  const message = req.body.message;

  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userText = message.text;

  try {
    // Gemini AI request
    const aiRes = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    contents: [
      {
        parts: [
          {
            text: `
You are a friendly assistant.

User: ${userText}
`
          }
        ]
      }
    ]
  }
);

    const reply =
      aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, something went wrong.";

    // send back to Telegram
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: reply
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
