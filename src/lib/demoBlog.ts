/* Demo blog data (swap for admin GET /admin/blog-posts). UI-first. */

export type BlogStatus = "Published" | "Scheduled" | "Draft" | "Unpublished";

export const STATUS_COLOR: Record<BlogStatus, string> = {
  Published: "#009D35",
  Scheduled: "#8A38F5",
  Draft: "#DC8E1D",
  Unpublished: "#E30045",
};

export type BlogPost = { id: string; short: string; title: string; added: string; status: BlogStatus; views: string };

export const BLOG_POSTS: BlogPost[] = [
  { id: "b1", short: "Is Now the Right Time to Invest in Lagos ...", title: "Is Now the Right Time to Invest in Lagos Real Estate?", added: "15 May 2025", status: "Scheduled", views: "0" },
  { id: "b2", short: "The Rise of Eco-Friendly Developments ...", title: "The Rise of Eco-Friendly Developments in Lagos", added: "15 May 2025", status: "Published", views: "1,595" },
  { id: "b3", short: "Navigating Lagos Real Estate Financing ...", title: "Navigating Lagos Real Estate Financing Options", added: "15 May 2025", status: "Draft", views: "0" },
  { id: "b4", short: "Navigating Lagos Property Titles: What ...", title: "Navigating Lagos Property Titles: What You Need to Know", added: "15 May 2025", status: "Published", views: "3,028" },
  { id: "b5", short: "The Rise of Eco-Friendly Developments in ...", title: "The Rise of Eco-Friendly Developments in Nigeria", added: "15 May 2025", status: "Published", views: "503" },
  { id: "b6", short: "Navigating Lagos Real Estate Financing ...", title: "Navigating Lagos Real Estate Financing Made Simple", added: "15 May 2025", status: "Published", views: "2,182" },
  { id: "b7", short: "Is Now the Right Time to Invest in Lagos ...", title: "Is Now the Right Time to Invest in Lagos?", added: "15 May 2025", status: "Published", views: "2,182" },
];

export const getBlogPost = (id: string) => BLOG_POSTS.find((p) => p.id === id);

export const BLOG_COVER = "/icons/admin/blog/blog-cover.png";

export const BLOG_BODY: string[] = [
  "The Nigerian real estate market offers unique avenues for growth, and we are dedicated to helping you capitalize on them by providing data-driven insights, identifying prime investment zones, managing high-performance assets, and offering secure, reliable financial structuring that maximizes your long-term returns and builds lasting generational wealth.",
  "We understand that the path to homeownership in Nigeria can be complex, and that is exactly why [Your Brand Name] streamlines the entire process, offering a wide, vetted portfolio of diverse properties, introducing flexible and innovative financing solutions, and providing expert legal and logistical guidance to make your dream a practical reality for you and your family.",
  "As Nigeria's urban landscape expands rapidly, [Your Brand Name] establishes trust through transparent property acquisition, verified listings, meticulous land checks, and comprehensive post-sale support, ensuring a seamless and reliable journey for every single client, investor, and prospective homeowner.",
  "The Nigerian real estate market offers unique avenues for growth, and we are dedicated to helping you capitalize on them by providing data-driven insights, identifying prime investment zones, managing high-performance assets, and offering secure, reliable financial structuring that maximizes your long-term returns and builds lasting generational wealth.",
];
