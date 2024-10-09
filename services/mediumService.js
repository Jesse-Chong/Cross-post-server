const Parser = require("rss-parser");
const axios = require("axios");
const parser = new Parser();

const MEDIUM_USER_ID = process.env.MEDIUM_USER_ID;

// Grab the feed on medium
const fetchMediumFeed = async (feedUrl) => {
  try {
    const feed = await parser.parseURL(feedUrl);
    console.log(feed.items);
    return feed.items;
  } catch (error) {
    console.error("Error fetching Medium RSS feed:", error);
    throw error;
  }
};

// Helper function to post to Medium
const postToMedium = async (token, title, content, canonicalUrl) => {
  try {
    const response = await axios.post(
      `https://api.medium.com/v1/users/${MEDIUM_USER_ID}/posts`,
      {
        title: title,
        contentFormat: "markdown",
        content: content,
        canonicalUrl: canonicalUrl,
        publishStatus: "public"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
      }
    );

    console.log("Post shared on Medium:");
    return response.data;
  } catch (error) {
    console.error(
      "Error posting to Medium:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

module.exports = {
  fetchMediumFeed,
  postToMedium
};

// This is used once to get my medium user id
// const getMediumUserId = async (token) => {
//     try {
//       const response = await axios.get('https://api.medium.com/v1/me', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
  
//       const userId = response.data.data.id;
//       console.log('Medium User ID:', userId);
//       return userId;
//     } catch (error) {
//       console.error('Error fetching Medium User ID:', error.response ? error.response.data : error.message);
//       throw new Error('Failed to fetch Medium User ID');
//     }
//   };

//   const token = process.env.MEDIUM_INTEGRATION_TOKEN;

// getMediumUserId(token)
//   .then(userId => {
//     console.log(`Your Medium User ID is: ${userId}`);
//   })
//   .catch(error => {
//     console.error('Error fetching Medium User ID:', error.message);
//   });