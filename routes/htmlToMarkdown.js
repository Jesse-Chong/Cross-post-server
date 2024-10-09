// Helper function to convert HTML content to Markdown
function htmlToMarkdown(html) {
    let markdown = html
      // Remove <p>...</p> tags and replace them with the content between the tags, followed by two newlines.
      .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
      // Replace <br> or <br/>  tags with single newlines.
      .replace(/<br\s*\/?>/g, "\n")
      // Remove all remaining HTML tags by matching anything enclosed within < >.
      .replace(/<(?:.|\n)*?>/gm, "")
      // Replace HTML non-breaking space entities (&nbsp;) with regular spaces.
      .replace(/&nbsp;/g, " ")
      // Trim leading and trailing whitespace
      .trim();
    return markdown;
  }

  module.exports = {
    htmlToMarkdown
  };