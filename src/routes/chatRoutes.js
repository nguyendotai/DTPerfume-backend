const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid messages format" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "AI service error" });
  }
});

module.exports = router;
