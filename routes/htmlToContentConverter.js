// Helper function to convert HTML content to Markdown or linkedin format
function htmlToContentConverter(html, platform = "linkedin") {
  let content = html
    // Convert bold tags
    .replace(/<(strong|b)>(.*?)<\/\1>/g, platform === "devto" ? "**$2**" : "$2")
    // Convert italic tags
    .replace(/<(em|i)>(.*?)<\/\1>/g, platform === "devto" ? "*$2*" : "$2")
    // Convert unordered list items to bullet points
    .replace(/<ul>\s*<li>(.*?)<\/li>\s*<\/ul>/g, (content) => {
      const listItems = content
        .split(/<\/li>\s*<li>/)
        .map(
          (listItem) =>
            `${platform === "devto" ? "-" : "•"} ${listItem.replace(
              /<\/?[^>]+(>|$)/g,
              ""
            )}`
        )
        .join("\n");
      return `\n${listItems}\n`;
    })
    // Convert ordered list items to numbered points
    .replace(/<ol>\s*<li>(.*?)<\/li>\s*<\/ol>/g, (content) => {
      const listItems = content
        .split(/<\/li>\s*<li>/)
        .map(
          (listItem, index) =>
            `${index + 1}. ${listItem.replace(/<\/?[^>]+(>|$)/g, "")}`
        )
        .join("\n");
      return `\n${listItems}\n`;
    })
    // Remove paragraph tags and add line breaks
    .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
    // Replace <br> tags with newlines
    .replace(/<br\s*\/?>/g, "\n")
    // Remove all remaining HTML tags
    .replace(/<(?:.|\n)*?>/gm, "")
    // Replace non-breaking space HTML entities with regular spaces
    .replace(/&nbsp;/g, " ")
    // Remove Markdown image syntax for LinkedIn, keep for Dev.to
    .replace(/!\[.*?\]\((.*?)\)/g, platform === "devto" ? "$&" : "$1")
    .trim();

  return content;
}

module.exports = {
  htmlToContentConverter
};