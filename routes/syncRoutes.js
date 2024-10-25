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
const { htmlToContentConverter } = require("./htmlToContentConverter");

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
      const validImages = images.filter(
        (img) => !img.includes("medium.com/_/stat")
      );
      // Convert HTML content to Markdown
      let markdownContent = htmlToContentConverter(content, "devto");
      // Add images to the top of the content
      if (validImages.length > 0) {
        // Add images in markdown format on top of the content
        const imageMarkdown = validImages
          .map((img) => `![](${img})`)
          .join("\n");
        markdownContent = `${imageMarkdown}\n\n${markdownContent}`;
      }
      // Use the link provided in the RSS feed
      const publicMediumUrl = article.link.split("?")[0]; // Remove any query parameters
      // Add canonical URL
      markdownContent += `\n\nOriginally published at [Medium](${publicMediumUrl})`;
      // Ensure tags are extracted correctly
      const tags = article.categories || [];
      // Map Medium tags to Dev.to tags
      const devtoTags = tags
        .map((tag) => tag.toLowerCase().replace(/[^a-z0-9]/g, "")) // Remove non-alphanumeric characters
        .filter((tag) => tag.length > 0) // Remove empty tags
        .slice(0, 4); // Dev.to allows up to 4 tags
      await postToDevto(
        process.env.DEVTO_API_KEY,
        article.title,
        markdownContent,
        publicMediumUrl,
        devtoTags
      );
      // Format content for LinkedIn
      let linkedInContent = htmlToContentConverter(content, "linkedin");
      // Truncate the content for LinkedIn's character limit
      linkedInContent =
        linkedInContent.substring(0, 1200) +
        (linkedInContent.length > 1200 ? "..." : "");
      // Add image to the content if available
      if (validImages.length > 0) {
        linkedInContent = `${validImages[0]}\n\n${linkedInContent}`;
      }
      await postToLinkedIn(
        process.env.LINKEDIN_ACCESS_TOKEN,
        article.title,
        linkedInContent,
        publicMediumUrl,
        tags
      );
    } else {
      return res
        .status(400)
        .send('Invalid source specified. Use "devto" or "`medium`".');
    }
    res.send(`Latest ${source} post has been cross-posted successfully!`);
  } catch (error) {
    console.error("Error cross-posting:", error);
    res.status(500).send("Error cross-posting: " + error.message);
  }
});

module.exports = router;