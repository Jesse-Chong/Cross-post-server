const axios = require("axios");

// Helper function to post to DEV.to
const postToDevto = async (apiKey, title, content, canonicalUrl) => {
  try {
    const response = await axios.post(
      "https://dev.to/api/articles",
      {
        article: {
          title: title,
          published: true,
          canonical_url: canonicalUrl,
          body_markdown: `${content}`
        },
      },
      {
        headers: { "api-key": apiKey }
      }
    );
    console.log("Post shared on Dev.to:");
  } catch (error) {
    console.error("Error posting to Dev.to:", error);
  }
};

// Helper function to fetch latest Dev.to post
const fetchLatestDevtoPost = async (apiKey) => {
  try {
    const response = await axios.get("https://dev.to/api/articles/me", {
      headers: { "api-key": apiKey },
      params: { per_page: 1 }
    });
    return response.data[0];
  } catch (error) {
    console.error("Error fetching latest Dev.to post:", error);
    throw error;
  }
};

module.exports = {
  postToDevto,
  fetchLatestDevtoPost,
};
