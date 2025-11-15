// Site Configuration - Update this once for all pages
const SITE_CONFIG = {
  // Update this with your actual domain (include https:// and trailing slash)
  baseUrl: 'https://jburos.github.io/games/',
  
  // Site name
  siteName: 'Games Collection',
  
  // Site description
  siteDescription: 'Free online games for kids with no ads. Safe, educational, and fun games for children.'
};

// Helper function to update a URL with the new base URL
function updateUrl(oldUrl) {
  if (!oldUrl || !oldUrl.startsWith('https://games.example.com/')) {
    return oldUrl;
  }
  // Extract the path (everything after the domain)
  const path = oldUrl.replace('https://games.example.com/', '');
  // Ensure baseUrl has trailing slash, and path doesn't start with one
  const baseUrl = SITE_CONFIG.baseUrl.endsWith('/') 
    ? SITE_CONFIG.baseUrl 
    : SITE_CONFIG.baseUrl + '/';
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return baseUrl + cleanPath;
}

// Function to update meta tags and structured data with the base URL
function updateSEOWithConfig() {
  // Update canonical links
  const canonicalLinks = document.querySelectorAll('link[rel="canonical"]');
  canonicalLinks.forEach(link => {
    const currentHref = link.getAttribute('href');
    const newHref = updateUrl(currentHref);
    if (newHref !== currentHref) {
      link.setAttribute('href', newHref);
    }
  });
  
  // Update Open Graph URLs
  const ogUrls = document.querySelectorAll('meta[property="og:url"]');
  ogUrls.forEach(meta => {
    const currentContent = meta.getAttribute('content');
    const newContent = updateUrl(currentContent);
    if (newContent !== currentContent) {
      meta.setAttribute('content', newContent);
    }
  });
  
  // Update Twitter URLs
  const twitterUrls = document.querySelectorAll('meta[property="twitter:url"]');
  twitterUrls.forEach(meta => {
    const currentContent = meta.getAttribute('content');
    const newContent = updateUrl(currentContent);
    if (newContent !== currentContent) {
      meta.setAttribute('content', newContent);
    }
  });
  
  // Update JSON-LD structured data
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  jsonLdScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      let updated = false;
      
      if (data.url) {
        const newUrl = updateUrl(data.url);
        if (newUrl !== data.url) {
          data.url = newUrl;
          updated = true;
        }
      }
      
      // Handle ItemList items
      if (data.itemListElement && Array.isArray(data.itemListElement)) {
        data.itemListElement.forEach(item => {
          if (item.url) {
            const newUrl = updateUrl(item.url);
            if (newUrl !== item.url) {
              item.url = newUrl;
              updated = true;
            }
          }
        });
      }
      
      // Update potentialAction target
      if (data.potentialAction && data.potentialAction.target) {
        const newTarget = updateUrl(data.potentialAction.target);
        if (newTarget !== data.potentialAction.target) {
          data.potentialAction.target = newTarget;
          updated = true;
        }
      }
      
      if (updated) {
        script.textContent = JSON.stringify(data, null, 2);
      }
    } catch (e) {
      console.warn('Error updating JSON-LD:', e);
    }
  });
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateSEOWithConfig);
} else {
  updateSEOWithConfig();
}

