const axios = require('axios');
const cheerio = require('cheerio');

// Function to extract metadata from a URL
const extractMetadata = async (url) => {
  try {
    // Fetch the HTML content
    const response = await axios.get(url);
    const html = response.data;
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    
    // Extract description
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '';
    
    // Extract favicon
    const favicon = getFaviconUrl(url, $);
    
    // Extract thumbnail
    const thumbnail = $('meta[property="og:image"]').attr('content') || '';
    
    return {
      title,
      description,
      favicon,
      thumbnail
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: '',
      description: '',
      favicon: '',
      thumbnail: ''
    };
  }
};

// Helper function to get favicon URL
const getFaviconUrl = (url, $) => {
  // Try to get favicon from link tags
  const faviconLink = $('link[rel="icon"]').attr('href') || 
                     $('link[rel="shortcut icon"]').attr('href');
  
  if (faviconLink) {
    // Convert relative URLs to absolute
    if (faviconLink.startsWith('/')) {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${faviconLink}`;
    }
    return faviconLink;
  }
  
  // Default to /favicon.ico if nothing else found
  const urlObj = new URL(url);
  return `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
};

module.exports = { extractMetadata };