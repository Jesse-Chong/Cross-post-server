const axios = require("axios");
const USER_URN = process.env.USER_URN;

// Function to get LinkedIn profile and URN using access token
const getLinkedInProfile = async (accessToken) => {
  try {
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    });
    const profileData = response.data;
    const linkedinUrn = `urn:li:person:${profileData.sub}`;
    return linkedinUrn;
  } catch (error) {
    console.error(
      "Error fetching LinkedIn profile:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to fetch LinkedIn profile");
  }
};

// Helper function to post to LinkedIn
const postToLinkedIn = async (
  accessToken,
  title,
  content,
  articleUrl,
  tags
) => {
  try {
    // Format tags with a '#' before each tag, removing any existing 'hashtag#'
    // and joining multi-word or hyphenated tags with camelCase
    const formattedTags = tags
      .map((tag) => {
        // Remove any existing 'hashtag#' prefix
        tag = tag.replace(/^hashtag#/, "");
        // Convert hyphenated or space-separated words to camelCase
        tag = tag.replace(/[-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
        return `#${tag}`;
      })
      .join(" ");

    // Construct the post text
    const postText = `${title}

${content}

Read more at: ${articleUrl}

${formattedTags}`;

    const response = await axios.post(
      "https://api.linkedin.com/v2/shares",
      {
        owner: `urn:li:person:${USER_URN}`,
        subject: title,
        text: {
          text: postText
        },
        distribution: {
          linkedInDistributionTarget: {}
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0"
        },
      }
    );
    console.log("Post shared on LinkedIn:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error posting to LinkedIn:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

module.exports = {
  getLinkedInProfile,
  postToLinkedIn
};