import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogImage = "https://lovix.app/logo.png",
  ogType = "website",
  noIndex = false,
}: SEOHeadProps) => {
  const baseUrl = "https://lovix.app";
  const fullUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : baseUrl;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper function to update or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Set meta description
    setMetaTag("description", description);

    // Set keywords if provided
    if (keywords) {
      setMetaTag("keywords", keywords);
    }

    // Set robots
    if (noIndex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      setMetaTag("robots", "index, follow");
    }

    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:url", fullUrl, true);
    setMetaTag("og:image", ogImage, true);
    setMetaTag("og:site_name", "LOVIX", true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage);
    setMetaTag("twitter:site", "@LOVIX");

    // Canonical URL
    if (canonicalPath) {
      setLinkTag("canonical", fullUrl);
    }

    // Cleanup function - remove dynamically added tags if needed
    return () => {
      // We don't remove tags on cleanup as they should persist
    };
  }, [title, description, keywords, canonicalPath, ogImage, ogType, noIndex, fullUrl]);

  return null; // This component doesn't render anything
};

export default SEOHead;
