const express = require("express");
const router = express.Router();
const { fetchMediumFeed, postToMedium } = require("../services/mediumService");
const {
  fetchLatestDevtoPost,
  postToDevto,
} = require("../services/devtoService");
const { postToLinkedIn } = require("../services/linkedinService");
const {
  extractImagesFromMarkdown,
  extractImagesFromHtml,
} = require("../routes/extractImages");
const { htmlToMarkdown } = require("../routes/htmlToMarkdown");

// Cross post latest article
router.post("/cross-post", async (req, res) => {
  const { source } = req.body; // 'devto' or 'medium'

  try {
    let article;
    if (source === "devto") {
      article = await fetchLatestDevtoPost(process.env.DEVTO_API_KEY);
      console.log("Dev.to article:", article);
      const images = extractImagesFromMarkdown(article.body_markdown);
      console.log("images:", images);
      await postToMedium(
        process.env.MEDIUM_INTEGRATION_TOKEN,
        article.title,
        article.body_markdown,
        article.url
      );
      let linkedInContent =
        content.replace(/<[^>]+>/g, "").substring(0, 200) + "...";
      if (images.length > 0) {
        linkedInContent += `\n\nImage: ${images[0]}`;
      }
      await postToLinkedIn(
        process.env.LINKEDIN_ACCESS_TOKEN,
        article.title,
        linkedInContent,
        article.url
      );
    } else if (source === "medium") {
      const mediumRSSFeed = "https://medium.com/feed/@jessechong";
      const articles = await fetchMediumFeed(mediumRSSFeed);
      article = articles[0];
      console.log("syncRoutes article from medium:", article);

      const content = article["content:encoded"];
      const images = extractImagesFromHtml(content);
      console.log("syncRoutes images:", images);

      const validImages = images.filter(
        (img) => !img.includes("medium.com/_/stat")
      );
      console.log("syncRoutes validImages:", validImages);

      // Convert HTML content to Markdown
      let markdownContent = htmlToMarkdown(content);

      // Add images to the top of the content
      if (validImages.length > 0) {
        // Add images in markdown format on top of the content
        const imageMarkdown = validImages
          .map((img) => `![](${img})`)
          .join("\n");
        markdownContent = `${imageMarkdown}\n\n${markdownContent}`;
      }

      // Add canonical URL
      markdownContent += `\n\nOriginally published at [Medium](${article.link})`;

      console.log("Markdown content for Dev.to:", markdownContent);

      await postToDevto(
        process.env.DEVTO_API_KEY,
        article.title,
        markdownContent,
        article.link
      );
      let linkedInContent =
        content.replace(/<[^>]+>/g, "").substring(0, 200) + "...";
      if (images.length > 0) {
        linkedInContent += `\n\nImage: ${images[0]}`;
      }
      // console.log('linkedInContent:', linkedInContent)
      await postToLinkedIn(
        process.env.LINKEDIN_ACCESS_TOKEN,
        article.title,
        linkedInContent,
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