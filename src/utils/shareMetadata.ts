// Utility functions to dynamically set meta tags for better social sharing

export interface ShareMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export const setShareMetadata = (metadata: ShareMetadata) => {
  const { title, description, image, url, type = "website" } = metadata;
  const baseUrl = window.location.origin;
  const defaultImage = `${baseUrl}/assets/natcycle-share-image.png`;
  const shareUrl = url || window.location.href;

  // Remove existing meta tags
  removeExistingMetaTags();

  // Add new meta tags
  const metaTags: Array<{ property?: string; name?: string; content: string }> =
    [
      // Open Graph (Facebook, LinkedIn)
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image || defaultImage },
      { property: "og:url", content: shareUrl },
      { property: "og:type", content: type },
      { property: "og:site_name", content: "NatCycle" },

      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image || defaultImage },
      { name: "twitter:site", content: "@NatCycle" },

      // LinkedIn specific
      { property: "article:author", content: "NatCycle" },
      { property: "article:published_time", content: new Date().toISOString() },
    ];

  metaTags.forEach((tag) => {
    const meta = document.createElement("meta");
    if (tag.property) {
      meta.setAttribute("property", tag.property);
    } else if (tag.name) {
      meta.setAttribute("name", tag.name);
    }
    meta.setAttribute("content", tag.content);
    document.head.appendChild(meta);
  });
};

export const removeExistingMetaTags = () => {
  const selectors = [
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'meta[property^="article:"]',
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => element.remove());
  });
};

export const createDropoffShareMetadata = (
  campaignName?: string,
  materialType?: string,
  carbonUnits?: number,
  locationName?: string
): ShareMetadata => {
  const title = campaignName
    ? `Eco-Impact: ${campaignName} Campaign Dropoff`
    : `Sustainable Dropoff at ${locationName || "NatCycle Location"}`;

  const description = carbonUnits
    ? `Just completed an eco-friendly dropoff${
        materialType ? ` of ${materialType}` : ""
      } and earned ${carbonUnits} Carbon Units! Join me in making a positive environmental impact.`
    : `Making a difference through sustainable recycling and dropoffs. Every action counts towards a greener future!`;

  return {
    title,
    description,
    type: "article",
  };
};

export const createProfileShareMetadata = (
  totalDropoffs: number,
  carbonUnits: number,
  userName?: string
): ShareMetadata => {
  const title = userName
    ? `${userName}'s Environmental Impact on NatCycle`
    : `My Environmental Impact Journey`;

  const description = `I've completed ${totalDropoffs} eco-friendly dropoffs and saved ${Math.floor(
    carbonUnits
  )} Carbon Units through NatCycle. Join me in building a sustainable future!`;

  return {
    title,
    description,
    type: "profile",
  };
};
