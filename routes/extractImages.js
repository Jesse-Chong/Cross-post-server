// Function to extract images from Markdown
const extractImagesFromMarkdown = (content) => {
  const imgRegex = /!\[.*?\]\((https?:\/\/[^)]+)\)/g;
  const images = [];
  let match;
  while ((match = imgRegex.exec(content))) {
    images.push(match[1]);
  }
  return images;
};

// Function to extract unique images from HTML
const extractImagesFromHtml = (html) => {
  // Find all html img tags
  const imageRegex = /<img.*?src="(.*?)"/g;
  // Extract all images from the html
  const images = [...html.matchAll(imageRegex)].map((match) => match[1]);
  // Remove tracking images and ensure uniqueness by filtering out unessecary images
  const filteredImages = images.filter(
    (img) => !img.includes("medium.com/_/stat")
  );
  return filteredImages;
};

module.exports = {
  extractImagesFromMarkdown,
  extractImagesFromHtml
};