const express = require("express");
const router = express.Router();
const { fetchMediumFeed, postToMedium } = require("../services/mediumService");
const {
  fetchLatestDevtoPost,
  postToDevto,
} = require("../services/devtoService");
const { postToLinkedIn } = require("../services/linkedinService");

// Cross post latest article
router.post("/cross-post", async (req, res) => {
  const { source } = req.body; // 'devto' or 'medium'

  try {
    let article;
    if (source === "devto") {
      article = await fetchLatestDevtoPost(process.env.DEVTO_API_KEY);
      console.log('Dev.to article:', article)
      await postToMedium(
        process.env.MEDIUM_INTEGRATION_TOKEN,
        article.title,
        article.body_markdown,
        article.url
      );
      await postToLinkedIn(
        process.env.LINKEDIN_ACCESS_TOKEN,
        article.title,
        article.description,
        article.url
      );
    } else if (source === "medium") {
      const mediumRSSFeed = "https://medium.com/feed/@jessechong";
      const articles = await fetchMediumFeed(mediumRSSFeed);
      article = articles[0];
      console.log('article from medium:', article[0]);
      await postToDevto(
        process.env.DEVTO_API_KEY,
        article.title,
        article["content:encodedSnippet"] || "",
        article.link
      );
      await postToLinkedIn(
        process.env.LINKEDIN_ACCESS_TOKEN,
        article.title,
        article["content:encodedSnippet"] || "",
        article.link
      );
    } else {
      return res
        .status(400)
        .send('Invalid source specified. Use "devto" or "medium".');
    }

    res.send(`Latest ${source} post has been cross-posted successfully!`);
  } catch (error) {
    console.error("Error cross-posting:", error);
    res.status(500).send("Error cross-posting: " + error.message);
  }
});

module.exports = router;
