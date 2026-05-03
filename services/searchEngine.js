const axios = require("axios");

/* ===================== OPENAI SEARCH (if you have web-enabled model or tool API) ===================== */
async function openAISearch(query) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: `Search and return latest factual info about: ${query}`,
        tools: [{ type: "web_search" }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return res.data?.output?.[0]?.content?.[0]?.text || null;
  } catch (err) {
    return null;
  }
}

module.exports = { openAISearch };