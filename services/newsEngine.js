const axios = require("axios");

async function getNews(query) {
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;

    const res = await axios.get(url);

    if (!res.data?.articles) return null;

    return res.data.articles.map((a) => ({
      title: a.title,
      source: a.source.name,
      time: a.publishedAt,
      url: a.url,
      description: a.description,
    }));
  } catch (e) {
    return null;
  }
}

module.exports = { getNews };
