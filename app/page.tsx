"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Ribbon — the "File / Home / Edit" strip                            */
/* ------------------------------------------------------------------ */

const RIBBON = [
  { label: "Contact", items: ["nayanaavinash25@gmail.com"] },
  {
    label: "Services",
    items: [
      "Web/App Design",
      "Branding & Identity",
      "Graphic Design",
      "Creative Direction",
      "Motion/Visuals",
    ],
  },
  {
    label: "Tech Stack",
    items: ["Figma", "TouchDesigner", "Photoshop", "Claude Code"],
  },
  { label: "Links", items: ["LinkedIn", "Behance"] },
];

const LINKEDIN = "https://www.linkedin.com/in/nayana-avinash-b5064028a/";

/* ribbon items that go somewhere; the rest are plain text */
const RIBBON_LINKS: Record<string, string> = {
  "nayanaavinash25@gmail.com": "mailto:nayanaavinash25@gmail.com",
  LinkedIn: LINKEDIN,
  Behance: "https://www.behance.net/nayana_avinash",
};

/* A ribbon item: a link out when it has one, plain text otherwise. */
function RibbonItem({ item, className }: { item: string; className: string }) {
  const href = RIBBON_LINKS[item];
  /* sites open in a new tab; the email opens the mail app in place */
  const away = href?.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return href ? (
    <a className={`${className} ribbon__link`} href={href} {...away}>
      {item}
    </a>
  ) : (
    <span className={className}>{item}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Slides — the overview rail doubles as the nav                      */
/* ------------------------------------------------------------------ */

/* A card placed by hand: position and size, measured off the deck.
   `study` is optional — a card without one still opens the plain title view. */
type CardBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  /* for a card with no case study yet; a study carries its own */
  date?: string;
  study?: Study;
};

/* One block of a case study. Everything past `heading` is optional, so a
   section can be pure copy, a single big image slot, a numbered step grid,
   or rows of screens — whichever the project needs.
   `todo: true` marks a section that still needs writing; it renders a tag
   and greys the prompt text, so nothing reads as finished when it isn't. */
type Section = {
  heading: string;
  lead?: string; // one large sentence
  body?: string; // supporting paragraph
  todo?: boolean;
  /* tighter layout: full-width copy, screen rows stacked with a small
     label above and short images, no dividers — for process sketches */
  compact?: boolean;
  shot?: "hero" | "wide"; // a single placeholder box
  steps?: { step: string; caption: string }[]; // numbered grid, one shot each
  /* labelled rows of shots: real `images`, or `shots` empty placeholders */
  groups?: { label?: string; shots?: number; images?: string[] }[];
  /* full screenshots one under another, as wide as the Figma embed */
  stack?: string[];
  /* rows of images, as wide as the embed: one image fills the row, two
     sit side by side */
  rows?: string[][];
  /* logo lockups by use: a small label over a rule, the logos in a row
     underneath. `small` is for the long one-line lockups. */
  uses?: { label: string; images: string[]; small?: boolean }[];
  /* rows of images all at one height, across every row, each image as
     wide as its own shape (w and h are the file's pixel size). A row can
     carry a heading, an image its own label above it. */
  figRows?: {
    label?: string;
    items: { src: string; w: number; h: number; label?: string }[];
  }[];
  /* a logo sheet: one column per variant, one row per colourway; a `dark`
     row sits on black, for the white versions */
  logos?: {
    columns: string[];
    rows: { label: string; dark?: boolean; images: string[] }[];
  };
  context?: { label: string; value: string }[]; // side-by-side columns
  /* labelled rows of real screens, label left, screens scrolling right */
  /* `slots` adds that many empty placeholder screens after the images */
  screens?: { label: string; images: string[]; slots?: number }[];
  /* tabbed panel: tabs across the top, copy left and a screenshot right,
     the text and the image each sliding to the next — see StudyTabs */
  tabs?: { title: string; body: string; image: string }[];
  /* numbered decisions, title left and explanation right. With an `image`
     the row turns round: the image in an outlined blue-glow square on the
     left, the number, title and copy on the right. */
  moments?: { title: string; body: string; image?: string }[];
};

/* A written-up project. Every image slot is deliberately left blank —
   drop the artwork into the .shot boxes when the exports are ready. */
type Study = {
  kicker?: string; // small grey line under the title
  date?: string; // sits beside the detail title
  intro: string;
  /* a live site, linked under the title */
  link?: string;
  hero?: string; // image in the top .shot--hero slot; blank box if absent
  /* a live embed (e.g. a Figma prototype) under the hero, with its heading */
  embed?: string;
  embedTitle?: string;
  /* a screen recording under the hero, with its heading */
  video?: string;
  videoTitle?: string;
  /* the kiosk's layout — hero panel left, facts right — even before there
     is a hero image to put in it. "glow" swaps the grey grained panel for
     an outlined square with the blue glow, as on Klik AI's features. */
  framed?: boolean | "glow";
  /* a faint shape laid under the grey grain of the hero panel and card */
  backdrop?: string;
  /* "dusk" swaps the grey grain of the hero panel and card for a white
     square of yellow and orange caustic light (public/bounce/caustic.jpg); "aura" for
     a soft pink and blue glow, no grain */
  grain?: "dusk" | "aura" | "dots" | "sand";
  /* a star sticker stuck over the top right corner of the card */
  sticker?: string;
  /* what I did, shown in square brackets under the card's name */
  tags?: string[];
  facts: { label: string; value: string }[];
  sections: Section[];
};

/* A piece on the TouchDesigner gallery wall. Files live in public/td
   (compressed from media/td vids); the cover is a still from the video.
   `w` is the cover's width on the wall and `dy` how far it hangs below the
   top of its row — the gaps between covers are all the same (.wall's
   column-gap), so the scatter is in the sizes and drops alone. `row` starts
   a new row. `ratio` is the video's width / height. */
type Work = {
  name: string;
  blurb?: string;
  video: string;
  poster: string;
  ratio: number;
  w: number;
  dy: number;
  row?: boolean;
};

const td = (slug: string) => ({
  video: `/td/${slug}.mp4`,
  poster: `/td/${slug}.jpg`,
});
const PORTRAIT = 9 / 16;
const TD_BLURB = "Short project description goes here.";

/* Hung in rows of three, four and three, each row centred with the same
   gap between every cover; sizes and drops differ so nothing lines up. */
/* extra air either side of each cover, per row: the rows of three are
   spread wider than the row of four, which only just fits */
const TD_ROW_AIR = [20, 0, 20];
const TD_WORKS: Work[] = [
  {
    name: "dandelion",
    ...td("dandelion"),
    ratio: PORTRAIT,
    w: 160,
    dy: 30,
    blurb:
      "Inspired by the movements of a real dandelion, I modeled the dandelion myself in TouchDesigner and used the MediaPipe plugin to make it responsive to my movements.",
  },
  { name: "constructing memories", ...td("constructing-memories"), ratio: 1078 / 1280, w: 190, dy: 0 },
  { name: "magical tree", ...td("magical-tree"), ratio: PORTRAIT, w: 170, dy: 90 },
  { name: "haunting beach", ...td("haunting-beach"), ratio: PORTRAIT, w: 180, dy: -60, row: true },
  { name: "jellyfish", ...td("jellyfish"), ratio: PORTRAIT, w: 180, dy: -90 },
  { name: "pollinating bee", ...td("pollinating-bee"), ratio: 1078 / 602, w: 250, dy: 10 },
  { name: "love letter to the beach", ...td("love-letter-to-the-beach"), ratio: PORTRAIT, w: 172, dy: -30 },
  { name: "gallery of a time i miss", ...td("gallery-of-a-time-i-miss"), ratio: PORTRAIT, w: 190, dy: -40, row: true },
  { name: "bubble wand", ...td("bubble-wand"), ratio: PORTRAIT, w: 170, dy: 30 },
  { name: "ripple touch", ...td("ripple-touch"), ratio: 3 / 2, w: 260, dy: -20 },
].map((w: Work) => ({ ...w, blurb: w.blurb ?? TD_BLURB }));

type Slide = {
  id: string;
  title: string;
  color: string;
  ink: string;
  accent: string;
  strokeColor?: string;
  heading?: string;
  intro?: string; // a line or two under the heading
  works?: Work[];
  cards?: CardBox[];
};

/* Blysk Handcrafted — laid out like the others: description, the cover with
   the facts, then the logo, the packaging and the marketing assets. Files
   live in public/blysk (from media/blysk logo, packaging and marketing). */
const BLYSK: Study = {
  date: "August 2025",
  tags: ["Branding", "Package Design", "Marketing"],
  intro:
    "Blysk Handcrafted is a jewelry brand rooted in craftsmanship and creativity, offering distinguished pieces. I developed a cohesive visual identity that reflects the brand’s essence of craftsmanship and elegance. My work included designing the logo, packaging, and Amazon seller marketing assets to establish a consistent and memorable brand presence. The goal was to balance elegance with accessibility, creating a look and feel that resonates with modern jewelry buyers while standing out in a competitive marketplace.",
  hero: "/blysk/cover.png", // media/blysk cover.png
  grain: "sand",
  facts: [
    { label: "Role", value: "Branding · Package Design · Marketing" },
    { label: "Timeline", value: "2 weeks" },
    { label: "Tools", value: "Photoshop · Figma" },
  ],
  sections: [
    {
      heading: "Logo",
      uses: [
        {
          label: "Primary Use",
          images: ["/blysk/logo-navy.svg", "/blysk/logo-gold.svg"],
        },
        {
          label: "Secondary Use",
          small: true,
          images: ["/blysk/secondary-navy.svg", "/blysk/secondary-gold.svg"],
        },
      ],
    },
    {
      heading: "Packaging",
      figRows: [
        {
          items: [
            { label: "Packaging Die-line", src: "/blysk/die-line.png", w: 1002, h: 725 },
            { label: "Packaging Design", src: "/blysk/packaging.png", w: 1002, h: 726 },
          ],
        },
        {
          label: "Final Product",
          items: [
            { src: "/blysk/package-1.jpg", w: 1046, h: 918 },
            { src: "/blysk/package-2.jpg", w: 1170, h: 1635 },
          ],
        },
      ],
    },
    {
      heading: "Marketing Assets",
      rows: [
        ["/blysk/marketing-1.png"],
        ["/blysk/marketing-2.png", "/blysk/marketing-3.png"],
        ["/blysk/marketing-4.png"],
        ["/blysk/marketing-5.png", "/blysk/marketing-6.png"],
      ],
    },
  ],
};

/* Five-card collage used by UI/UX and Other. Sizes deliberately differ. */
const COLLAGE: CardBox[] = [
  { x: 42, y: 162, w: 267, h: 276, name: "project name" },
  { x: 381, y: 190, w: 215, h: 274, name: "project name" },
  { x: 643, y: 174, w: 267, h: 273, name: "project name" },
  { x: 88, y: 535, w: 278, h: 305, name: "project name" },
  { x: 518, y: 535, w: 281, h: 305, name: "project name" },
];

/* public/kiosk/<name>-1.png … <name>-n.png */
const kioskShots = (name: string, n: number) =>
  Array.from({ length: n }, (_, i) => `/kiosk/${name}-${i + 1}.png`);

/* Product Discovery Kiosk — written up from the Behance case study. */
const KIOSK: Study = {
  date: "July 2025",
  intro:
    "A self-service digital kiosk interface, enabling customers to browse smartphones and other devices, compare models side by side, and complete purchases directly at the kiosk.",
  hero: "/kiosk/hero.png",
  backdrop: "/kiosk/bg-shape.svg", // the green scalloped panel from the cover
  tags: ["UI/UX", "Product Design", "Research"],
  facts: [
    { label: "Role", value: "Design · Research" },
    { label: "Timeline", value: "3 months" },
    { label: "Tools", value: "Figma · FigJam" },
  ],
  sections: [
    {
      heading: "Project Context",
      context: [
        {
          label: "Objective",
          value:
            "Create merchant retention and maximize brand visibility for Pine Labs.",
        },
        { label: "Merchant Type", value: "Electronic Store" },
        {
          label: "Solution Brief",
          value:
            "To build a UI that enables customers to seamlessly evaluate different phones and make an informed purchase, enhancing customer satisfaction.",
        },
      ],
    },
    {
      heading: "Final Product",
      screens: [
        { label: "Standby", images: kioskShots("standby", 3) },
        { label: "Browse", images: kioskShots("browse", 2) },
        { label: "Compare Devices", images: kioskShots("compare", 2) },
        { label: "Checkout & Complete", images: kioskShots("checkout", 4) },
      ],
    },
    {
      heading: "Snippets from my Process",
      compact: true,
      todo: true,
      body: "Sketches, flows and early wireframes from the kiosk, and a line on what each one shows.",
      screens: [{ label: "Process", images: [], slots: 3 }],
    },
    {
      heading: "Key Design Moments",
      moments: [
        {
          title: "Designing for signage, not a tablet",
          body: "The kiosk runs on large touchscreen digital signage, not just tablets, and signage touch is far less precise than a phone's. Buttons were sized up and spaced apart so nothing triggers by accident. Every interactive element had to be intentional.",
        },
        {
          title: "Tap is the only gesture",
          body: "Digital signage doesn't register scrolling, only taps, so every interaction has to work with a single tap and nothing can depend on a swipe or scroll.",
        },
        {
          title: "Standby screens must be adjustable by merchant",
          body: "Standby screens are each store's shop window, so merchants needed to be able to promote their own products and offers. The layouts were designed to be customisable and to plug into a backend system later, where merchants can change the content themselves.",
        },
        {
          title: "Filters backed by customer research",
          body: "Customer research came first. We studied who actually comes into each store, and those findings decided the standby categories and product filters: when to lead with brand, when with price range, and so on.",
        },
      ],
    },
    {
      heading: "Reflections",
      body: "Apart from the usual time constraints and the continuous cycle of feedback and iteration, the project was a success. The one surprise was that the team only found out the signage couldn't scroll after we got the hardware. By then the designs were done, so it was solved with a last minute change directly in the backend, adding click to scroll navigation instead of actual scrolling. The screens above are the original designs and don't reflect that change.",
    },
  ],
};

/* Klik AI — AI that builds, lists & grows an ecommerce store. Laid out
   on the kiosk's template. The full product is under NDA, so instead of a
   Final Product section it walks through the platform (tabbed) and its AI
   features, with a screenshot each, then pages from the sketchbook notes
   (media/klik notes.pdf, exported to public/klik/process). Screens live in
   public/klik. */
const KLIK: Study = {
  date: "February 2025",
  intro:
    "An ecommerce management tool that brings cataloging, product photos, content, pricing and listing across multiple platforms into one place. It uses AI to make the process less of a hassle and to remove the redundant steps, so a brand can build, list and grow its store more easily.",
  hero: "/klik/hero.png", // media/Group 64.png
  framed: "glow",
  tags: ["UI/UX", "Product Design", "Research"],
  facts: [
    { label: "Role", value: "Design · Research" },
    { label: "Timeline", value: "8 months" },
    { label: "Tools", value: "Figma · FigJam · ChatGPT · Gemini" },
  ],
  sections: [
    {
      heading: "Project Context",
      context: [
        {
          label: "Problem",
          value:
            "Fast fashion thrives on volume and variety, with hundreds of SKUs launched monthly. Each piece requires photos, content, pricing, and multi-platform management, which slows down speed-to-market and inflates operational costs.",
        },
        { label: "Who It Affects", value: "Brands, teams, and customers alike." },
        {
          label: "Solution Brief",
          value:
            "A tool that automates it all, removing the manual choking point in fast-fashion ecommerce.",
        },
      ],
    },
    {
      heading: "The Platform",
      body: "A full-stack commerce back-end that powers everything from product creation to multi-channel sales, streamlining operations and accelerating growth.",
      tabs: [
        {
          title: "End-to-End Commerce",
          body: "The complete catalog generation pipeline, covering the entire product life cycle. Businesses can track products from the moment they are ordered from vendors, follow their status through the supply chain, and sync listings across ecommerce platforms, their own website and physical stores.",
          image: "/klik/end-to-end.png",
        },
        {
          title: "Multi-Channel Management",
          body: "Integrates with Amazon, Flipkart, Shopify and offline POS systems, so the whole catalog is managed in one place. Any change, whether price, stock or description, updates instantly across every platform, cutting errors and manual upkeep.",
          image: "/klik/multi-channel.png",
        },
        {
          title: "Data and Analytics",
          body: "Real-time sales analytics and inventory tracking show performance by product, platform and location. Teams can spot fast movers, weak listings and overstock early, and act on the data quickly.",
          image: "/klik/data-analytics.png",
        },
      ],
    },
    {
      heading: "AI Features",
      moments: [
        {
          title: "Cataloging",
          body: "From a single product image, it generates optimised, platform-ready titles and detailed descriptions. That takes a large load off content teams, keeps the brand consistent across channels, and improves discoverability and SEO.",
          image: "/klik/cataloging.png",
        },
        {
          title: "Image Generation",
          body: "Removes the need for slow, costly photoshoots. From one input image, it generates multiple visuals of the product in different angles, styles and backgrounds, saving time and money while improving consistency and speed to market.",
          image: "/klik/image-generation.png",
        },
        {
          title: "Documentation",
          body: "Reads invoices and shipping labels, pulls out the key details and fills in the required fields with high accuracy. Upload a PDF and the system handles the rest, removing repetitive data entry, reducing errors and speeding up order processing.",
          image: "/klik/documentation.png",
        },
        {
          title: "Collection Generation",
          body: "Turns existing inventory into curated, ready-to-market collections. In a few clicks it picks products that go well together and writes the collection names, themes and descriptions for the website and social media, so collections ship faster with consistent branding.",
          image: "/klik/collection-generation.png",
        },
      ],
    },
    {
      heading: "Snippets from my Process",
      compact: true,
      body: "I studied existing commerce back ends and POS tools to shape a multi-module backend, from vendor purchases and warehousing to marketplace integration and access control. Customer and client research decided what each dashboard leads with, and it all started on paper before moving into Figma.",
      screens: [
        { label: "Dashboard & Data", images: ["/klik/process/notes-1.jpg"] },
        {
          label: "Collection AI & Roles",
          images: ["/klik/process/notes-2.jpg", "/klik/process/notes-3.jpg"],
        },
        {
          label: "Wireframes",
          images: ["/klik/process/notes-4.jpg", "/klik/process/notes-5.jpg"],
        },
      ],
    },
    {
      heading: "Key Design Moments",
      moments: [
        {
          title: "Designing as a user too",
          body: "Klik was designed to become a product later on, but it was built and tested with the company's own jewellery brand first. So I got to use it day to day myself and work closely with the operations staff. That gave me a much better understanding of the ecommerce process and helped me design a better product.",
        },
        {
          title: "Getting the logistics right",
          body: "There were lots of challenges along the way, but the logistics were the most frustrating. We had a lot of inventory, and coming up with a way to manage every SKU and automate certain processes was a real challenge.",
        },
        {
          title: "Figuring out AI as we went",
          body: "At this stage, using AI in industry practice was still new. The team and I had to do a lot of research and trial and error to find a process that worked and to figure out which tools to use, like which AI was best for image generation.",
        },
      ],
    },
    {
      heading: "Reflections",
      body: "This product kept developing throughout my entire time at the company. More than the design itself, what I gained the most was learning an industry that was completely new to me, and I've carried that knowledge, and the way I learned it, into my other projects. For the operations team, it changed how the whole ecommerce process ran. Work that used to be done by hand, like writing listings, organising photoshoots, entering invoice details and updating every platform one by one, could now be done in a few steps, which made the whole process much faster and more efficient.",
    },
  ],
};

/* The Bounce Factor — the description, the live Figma prototype, and a
   brand elements section still to be filled in. */
const BOUNCE: Study = {
  date: "March 2025",
  tags: ["UI/UX", "Graphic Design", "Branding"],
  intro:
    "A dynamic sportswear brand bringing team spirit to life with custom-made jerseys designed for performance and identity.",
  embedTitle: "Figma Prototype",
  embed:
    "https://embed.figma.com/proto/ZJhY2s8cxKmNzWW0a7ixwq/The-Bounce-Factor--Copy-?node-id=2009-1515&scaling=scale-down-width&content-scaling=fixed&page-id=2009%3A1514&starting-point-node-id=2009%3A1515&show-proto-sidebar=0&embed-host=share",
  hero: "/bounce/hero.png", // media/tbf.png
  grain: "dusk",
  facts: [
    { label: "Role", value: "UI/UX Design · Graphic Design" },
    { label: "Timeline", value: "2 weeks" },
    { label: "Tools", value: "Figma · Photoshop" },
  ],
  sections: [
    {
      heading: "Brand Elements",
      body: "Designs made around the brand's jerseys, used as promotional material and as posts on its social media.",
      groups: [
        {
          label: "Basketball",
          images: [
            "/bounce/basketball-blue.png",
            "/bounce/basketball-floral.png",
            "/bounce/basketball-pink.png",
          ],
        },
        {
          label: "Football",
          images: [
            "/bounce/football-blue.png",
            "/bounce/football-red.png",
            "/bounce/football-green.png",
          ],
        },
      ],
    },
  ],
};

/* Zenith — a landing page, laid out like The Bounce Factor: description,
   cover with the facts, then the live Figma prototype. */
const ZENITH: Study = {
  date: "January 2026",
  tags: ["UI/UX", "Website Design"],
  intro:
    "Zenith is a fractional CFO and outsourced financial services firm. I headed the design team, made up of a junior designer, a copywriter and an SEO specialist, and together we designed the complete website, from the landing page to services, contact and every page in between.",
  hero: "/zenith/hero.png", // media/zenith.png, on the grey grain
  facts: [
    { label: "Role", value: "Head of Design" },
    { label: "Timeline", value: "2 months" },
    { label: "Tools", value: "Figma · Photoshop · Claude Code" },
  ],
  embedTitle: "Figma Prototype",
  embed:
    "https://embed.figma.com/proto/8vns8KbMFmbzzXHC6Y8bJS/Zenith-Landing-Page?node-id=3001-7733&scaling=scale-down-width&content-scaling=fixed&page-id=3001%3A3414&starting-point-node-id=3001%3A7733&show-proto-sidebar=0&embed-host=share",
  sections: [],
};

/* Digital Mixtape — a live site: the link, the description, the cover with
   the facts, then a screen recording of it in use. */
const MIXTAPE: Study = {
  date: "October 2026",
  tags: ["Design", "Development"],
  link: "https://my-mixtape.vercel.app/",
  intro:
    "I love having music on in the background, but I never liked the music player Spotify provides, so I thought, why not make my own? It turns your Spotify playlists into CD cases on a shelf, and opening one plays it through a little player with a spinning disc.",
  hero: "/mixtape/hero.png", // media/mix.png
  grain: "aura",
  sticker: "my favourite",
  facts: [
    { label: "Role", value: "Design · Development" },
    { label: "Timeline", value: "1 week" },
    { label: "Tools", value: "Figma · Claude Code · Photoshop" },
  ],
  videoTitle: "Demo",
  video: "/mixtape/demo.mp4", // media/mixtape vid.MOV, at 720p
  sections: [
    {
      heading: "Limitations",
      body: "This was so fun to make, and my friends and I genuinely use it. But Spotify's developer platform only allows up to 5 users per account unless you are a registered business, which I am not. So on the login page I added a special star button that still has the background visuals, so those who can't connect to Spotify can still use it. I also wanted to make this work with Apple Music, but that requires an Apple Developer account, which wasn't in my budget.",
    },
  ],
};

/* Midas — the description, the cover with the facts, then the dashboard
   and the landing page as full screens, and a reflection to close. */
const MIDAS: Study = {
  date: "April 2026",
  tags: ["UI/UX", "Product", "Logo Design", "Dev"],
  intro:
    "Midas is a product developed by Zenith. It's an AI CFO that connects a company's financial, operational and growth data in one place, so they can see what breaks first and how to prevent it. I worked with the dev team to design the dashboard and the landing page, and also designed the logo. With the help of Claude Code and the dev team, I did the frontend development myself.",
  hero: "/midas/hero.png", // media/midas cover.png
  grain: "dots",
  facts: [
    { label: "Role", value: "UI/UX · Frontend Dev · Graphic Design" },
    { label: "Timeline", value: "8 months" },
    { label: "Tools", value: "Claude Code · Figma · FigJam · Photoshop" },
  ],
  sections: [
    {
      heading: "Logo Design",
      body: "The mark is a spiral, drawn to feel like gold being worked into shape, and it is paired with a serif wordmark. It comes in four versions, the mark, the wordmark, and horizontal and vertical lockups, each in gold, black and white so it works on any background.",
      logos: {
        columns: ["Mark", "Wordmark", "Horizontal", "Vertical"],
        rows: (["gold", "black", "white"] as const).map((c) => ({
          label: c[0].toUpperCase() + c.slice(1),
          dark: c === "white",
          images: ["mark", "type", "horizontal", "vertical"].map(
            (v) => `/midas/logo/${v}-${c}.svg`,
          ),
        })),
      },
    },
    {
      heading: "Dashboard",
      body: "The executive summary gives a high-level overview of financial performance: profit and loss, balance sheet, cash flow, financial health and key metrics, with the Midas assistant alongside to explain trends and answer questions about the numbers.",
      stack: ["/midas/dashboard-1.png", "/midas/dashboard-2.png"],
    },
    {
      heading: "Landing Page",
      body: "The landing page introduces Midas and what it does, leading with the dashboard itself so visitors see the product straight away.",
      stack: [1, 2, 3, 4, 5].map((n) => `/midas/landing-${n}.png`),
    },
    {
      heading: "Reflections",
      todo: true,
      body: "What you learned designing Midas, what worked, and what you would do differently given another pass.",
    },
  ],
};

/* UI/UX gets its own copy of the collage so cards can carry case studies
   without changing the Other slide, which shares the same layout. */
/* extra room between the first row of UI/UX cards and the second, whose
   tags sit lower now that every top-row card carries a study */
const UIUX_ROW_GAP = 48;

/* The first row is the deck's. The two under it are hand-placed rather
   than lined up, so the page keeps the scattered feel of the top row:
   sizes, heights and left edges all differ a little. */
const ROW_2 = COLLAGE[3].y + UIUX_ROW_GAP;
const ROW_3 = ROW_2 + 262 + 104; // under row 2's tallest card (Midas)
const UIUX_CARDS: CardBox[] = [
  { ...COLLAGE[0], name: "Klik AI", study: KLIK },
  /* swapped places, each keeping its own shape: the near-square kiosk
     moves to the middle, the narrower Zenith to the right */
  { ...COLLAGE[2], x: COLLAGE[1].x, name: "Product Discovery Kiosk", study: KIOSK },
  /* a little higher than the slot it came from */
  { ...COLLAGE[1], x: 910 - COLLAGE[1].w, y: COLLAGE[1].y - 24, name: "Zenith Website", study: ZENITH },
  /* row 2: Midas sits a little higher on the left, Mixtape lower and
     further in */
  { x: 74, y: ROW_2 - 14, w: 246, h: 268, name: "Midas Dashboard", study: MIDAS },
  /* landscape, to suit its wide cover */
  { x: 448, y: ROW_2 + 14, w: 296, h: 236, name: "Digital Mixtape", study: MIXTAPE },
  /* row 3: Blysk before The Bounce Factor, each its own size — Blysk a
     near square stepped down and in, Bounce a wider landscape (to suit
     its website cover) up and out to the right */
  { x: 150, y: ROW_3 + 22, w: 276, h: 288, name: "Blysk Handcrafted", study: BLYSK },
  { x: 540, y: ROW_3 - 6, w: 336, h: 244, name: "The Bounce Factor", study: BOUNCE },
];

/* Physical Design: the collage's top row of three, still blank covers
   until the artwork is in */
const OTHER_CARDS: CardBox[] = [
  { ...COLLAGE[0], name: "Nails" },
  { ...COLLAGE[1], name: "Jewelry" },
  { ...COLLAGE[2], name: "Paintings & Doodles" },
];

const SLIDES: Slide[] = [
  { id: "home", title: "Home", color: "#FF2E77", ink: "#000000", accent: "#FF2E77" },
  {
    id: "uiux",
    title: "Design",
    color: "#31FF2E",
    ink: "#000000",
    accent: "#31FF2E",
    strokeColor: "#000000",
    heading: "Design Work",
    cards: UIUX_CARDS,
  },
  {
    id: "touchdesigner",
    title: "Touch-designer",
    color: "#FFFC2E",
    ink: "#000000",
    accent: "#FFFC2E",
    strokeColor: "#000000",
    heading: "TouchDesigner Work",
    intro:
      "TouchDesigner is a node-based visual programming language for real-time interactive multimedia content. I started learning TouchDesigner this year and have really come to love experimenting with it. Hope you like my work.",
    works: TD_WORKS,
  },
  {
    id: "other",
    title: "Physical Design",
    color: "#FF2E2E",
    ink: "#000000",
    accent: "#FF2E2E",
    strokeColor: "#000000",
    heading: "Physical Design Work",
    cards: OTHER_CARDS,
  },
  {
    id: "contact",
    title: "Contact",
    color: "#283EFF",
    ink: "#FFFFFF",
    accent: "#283EFF",
  },
];

/* Always two rows, with the extra item on the first — matches the deck:
   5 items -> 3 + 2, 4 -> 2 + 2, 2 -> 1 + 1. Each row is flush right. */
function splitRows(items: string[]) {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)].filter((r) => r.length > 0);
}

/* Breakpoint shared with the @media block in globals.css — keep them equal. */
const MOBILE = 900;

/* Close glyph: two diagonals crossing on a 7x7 grid, one cell thick, drawn
   and rendered like the chevron so the whole set stays one pixel size. */
function PixelX() {
  return (
    <svg
      viewBox="0 0 7 7"
      width="14"
      height="14"
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <rect x="0" y="0" width="1" height="1" />
      <rect x="6" y="0" width="1" height="1" />
      <rect x="1" y="1" width="1" height="1" />
      <rect x="5" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" />
      <rect x="4" y="2" width="1" height="1" />
      <rect x="3" y="3" width="1" height="1" />
      <rect x="2" y="4" width="1" height="1" />
      <rect x="4" y="4" width="1" height="1" />
      <rect x="1" y="5" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="0" y="6" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
    </svg>
  );
}

/* Expand and minimize: a pair of diagonal arrows on a 9x9 grid, rendered at
   2x like the rest of the pixel art. Each arrow is a corner — its two arms
   and the diagonal that runs into it. Expanded, the corners sit in the
   glyph's own corners and point out; minimized, they sit by the middle and
   point in. */
const ARROWS_OUT = [
  ...[4, 5, 6, 7, 8].map((i) => [i, 0]),
  ...[1, 2, 3, 4].map((i) => [8, i]),
  [7, 1], [6, 2], [5, 3],
  ...[0, 1, 2, 3, 4].map((i) => [i, 8]),
  ...[4, 5, 6, 7].map((i) => [0, i]),
  [1, 7], [2, 6], [3, 5],
];
const ARROWS_IN = [
  ...[5, 6, 7, 8].map((i) => [i, 3]),
  ...[0, 1, 2].map((i) => [5, i]),
  [6, 2], [7, 1], [8, 0],
  ...[0, 1, 2, 3].map((i) => [i, 5]),
  ...[6, 7, 8].map((i) => [3, i]),
  [2, 6], [1, 7], [0, 8],
];

function PixelArrows({ inward }: { inward?: boolean }) {
  return (
    <svg
      viewBox="0 0 9 9"
      width="18"
      height="18"
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      {(inward ? ARROWS_IN : ARROWS_OUT).map(([x, y]) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />
      ))}
    </svg>
  );
}

/* Menu glyph: three 3x3 cells in a row, rendered at 2x like the chevron and
   the cursor art, so the dots read as pixels rather than as circles. */
function PixelDots() {
  return (
    <svg
      viewBox="0 0 11 3"
      width="22"
      height="6"
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <rect x="0" y="0" width="3" height="3" />
      <rect x="4" y="0" width="3" height="3" />
      <rect x="8" y="0" width="3" height="3" />
    </svg>
  );
}

/* The deck's one arrow. 1px rects on a 7x4 grid rendered at 2x, so every step
   is two screen pixels — the same pixel size as the cursor art in /public.
   The two diagonals meet on a single pixel, so the tip comes to a point.
   Points down; callers rotate it. */
function PixelChevron() {
  return (
    <svg
      viewBox="0 0 7 4"
      width="14"
      height="8"
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <rect x="0" y="0" width="1" height="1" />
      <rect x="6" y="0" width="1" height="1" />
      <rect x="1" y="1" width="1" height="1" />
      <rect x="5" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" />
      <rect x="4" y="2" width="1" height="1" />
      <rect x="3" y="3" width="1" height="1" />
    </svg>
  );
}

/* the expand / minimize resize — same pace as the drawer */
const RESIZE: KeyframeAnimationOptions = { duration: 350, easing: "ease" };

export default function Page() {
  const [ribbon, setRibbon] = useState("Contact");
  const [menu, setMenu] = useState(false);
  const [slideId, setSlideId] = useState("home");
  const [project, setProject] = useState<number | null>(null);
  /* a case study blown up to fill the window — see .is-expanded */
  const [expanded, setExpanded] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  /* where the slide and its scrollbar sat before expanding, in design px
     relative to the frame — what the animation grows from and shrinks to */
  const homes = useRef<{ el: HTMLElement; box: Keyframe }[]>([]);
  const shrinking = useRef<Animation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  /* where the work page was left when a project was opened, and whether the
     next view change is a back out of that project */
  const parked = useRef(0);
  const returning = useRef(false);

  /* The frame is a literal 1280x720 so every value matches Figma exactly;
     scale it as a whole to fit the window. Below MOBILE the deck stops being
     a fixed canvas and stacks instead, so it is left unscaled and the media query in globals.css takes over the layout. */
  useEffect(() => {
    const fit = () => {
      const wide = window.matchMedia(`(min-width: ${MOBILE + 1}px)`).matches;
      const s = wide
        ? Math.min(window.innerWidth / 1280, window.innerHeight / 720)
        : 1;
      document.documentElement.style.setProperty("--fit", String(s));
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);

  /* Every view change starts at the top — the slide keeps one scroll
     container across slides, so without this a long case study would leave
     the next slide scrolled halfway down. The exception is backing out of a
     case study: that returns you to the card you opened, not to the top of
     the work page. */
  useEffect(() => {
    const top = returning.current ? parked.current : 0;
    returning.current = false;
    scrollRef.current?.scrollTo({ top });
  }, [slideId, project]);

  /* The current view lives in the URL hash — #uiux, #uiux/2, #uiux/2/expanded
     — so a refresh (or a shared link) lands back where you were instead of
     on home. Read once on mount, after hydration; written on every change. */
  const restored = useRef(false);
  /* The server can't see the hash, so the first render has to be home to
     match it; the saved view is applied straight after hydration. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const [id, p, x] = window.location.hash.slice(1).split("/");
    const s = SLIDES.find((sl) => sl.id === id);
    if (s) {
      setSlideId(s.id);
      const n = Number(p);
      const full = Boolean(s.cards || s.works);
      if (p && Number.isInteger(n) && s.cards?.[n]) {
        setProject(n);
        if (x === "expanded") setExpanded(true);
      } else if (p === "expanded" && full) {
        setExpanded(true);
      }
    }
    restored.current = true;
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!restored.current) return;
    const parts = [slideId];
    if (project !== null) parts.push(String(project));
    if (expanded) parts.push("expanded");
    const hash = slideId === "home" && project === null ? "" : `#${parts.join("/")}`;
    history.replaceState(null, "", hash || window.location.pathname);
  }, [slideId, project, expanded]);

  const panel = RIBBON.find((r) => r.label === ribbon);
  const slide = SLIDES.find((s) => s.id === slideId) ?? SLIDES[0];

  const accentVars = {
    "--accent": slide.accent,
    "--accent-stroke": slide.strokeColor ?? "transparent",
    /* Doubled, because paint-order draws the stroke behind the fill — only
       the outer half of it shows, so 2px on the glyph is a 1px outline on
       screen. The mid and small steps are the lighter outlines for smaller
       type — section headings at 32px, and the whole scale again on mobile,
       where the titles themselves drop to 40 and 34. */
    "--accent-stroke-width": slide.strokeColor ? "2px" : "0",
    "--accent-stroke-mid": slide.strokeColor ? "1.5px" : "0",
    "--accent-stroke-small": slide.strokeColor ? "1px" : "0",
  } as React.CSSProperties;

  /* escape closes the drawer, the one control that covers the deck */
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const expand = () => {
    const frame = frameRef.current;
    if (!frame) return;
    const f = frame.getBoundingClientRect();
    /* the frame is transform-scaled, so convert screen px back to design px */
    const fit = f.width / frame.offsetWidth || 1;
    homes.current = Array.from(
      frame.querySelectorAll<HTMLElement>(".slide, .scrollbar"),
    ).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        box: {
          top: `${(r.top - f.top) / fit}px`,
          left: `${(r.left - f.left) / fit}px`,
          width: `${r.width / fit}px`,
          height: `${r.height / fit}px`,
        },
      };
    });
    setExpanded(true);
  };

  /* Shrinks back to where it came from first, and only then drops the
     expanded layout — the fill holds the last frame until React has. */
  const minimize = useCallback(() => {
    if (shrinking.current.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setExpanded(false);
      return;
    }
    shrinking.current = homes.current.map(({ el, box }) =>
      el.animate([{ ...box, offset: 1 }], { ...RESIZE, fill: "forwards" }),
    );
    Promise.all(shrinking.current.map((a) => a.finished)).then(
      () => setExpanded(false),
      () => {},
    );
  }, []);

  /* Runs before paint, so the slide is never seen at full size before it
     has grown there, nor left holding its shrunk fill once it is home. */
  useLayoutEffect(() => {
    shrinking.current.forEach((a) => a.cancel());
    shrinking.current = [];
    if (!expanded) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    homes.current.forEach(({ el, box }) =>
      el.animate([{ ...box, offset: 0 }], RESIZE),
    );
  }, [expanded]);

  /* escape also minimizes an expanded case study */
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") minimize();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, minimize]);

  /* Work and case-study slides always take the full height they are given,
     so TouchDesigner, UI/UX and Other are the same box on mobile whatever
     their content adds up to. Home and contact keep the 4:3 floor instead
     and centre their copy in it. */
  const full = Boolean(slide.cards || slide.works);

  const openProject = (i: number) => {
    /* only the slide scrolls, on desktop and mobile alike */
    parked.current = scrollRef.current?.scrollTop ?? 0;
    setProject(i);
  };

  const closeProject = () => {
    returning.current = true;
    setProject(null);
    setExpanded(false);
  };

  const goto = (id: string) => {
    /* picking a different slide is not a back — that one starts at the top */
    returning.current = false;
    setSlideId(id);
    setProject(null);
    setExpanded(false);
  };

  return (
    <div className={expanded ? "frame is-expanded" : "frame"} ref={frameRef}>
      {/* ---------- header ---------- */}
      <header className="header">
        {/* mobile only — the ribbon below is hidden there and this opens it
            as a drawer instead */}
        <button
          type="button"
          className="header__dots"
          aria-label="Menu"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
        >
          <PixelDots />
        </button>

        <nav className="header__tabs" aria-label="Utility">
          {RIBBON.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className="tab"
              aria-current={ribbon === tab.label ? "true" : undefined}
              onClick={() => setRibbon(ribbon === tab.label ? "" : tab.label)}
            >
              {tab.label}
            </button>
          ))}
          <span className="header__rule" aria-hidden="true" />
        </nav>

        <div className="header__meta">
          <div className="header__panel">
            {splitRows(panel?.items ?? []).map((row, i) => (
              <div key={i} className="header__row">
                {row.map((item) => (
                  <RibbonItem key={item} item={item} className="header__item" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ---------- mobile drawer ---------- */}
      {/* Same `ribbon` state as the desktop ribbon, so opening one section
          closes whichever was open — the accordion falls out of that rather
          than needing its own bookkeeping. */}
      <div
        className={menu ? "drawer__scrim is-open" : "drawer__scrim"}
        onClick={() => setMenu(false)}
        aria-hidden="true"
      />
      <aside className={menu ? "drawer is-open" : "drawer"} aria-label="Menu">
        <button
          type="button"
          className="drawer__close"
          aria-label="Close menu"
          onClick={() => setMenu(false)}
        >
          <PixelX />
        </button>
        <ul className="drawer__list">
          {RIBBON.map((tab) => {
            const open = ribbon === tab.label;
            return (
              <li key={tab.label} className={open ? "drawer__item is-open" : "drawer__item"}>
                <button
                  type="button"
                  className="drawer__tab"
                  aria-expanded={open}
                  onClick={() => setRibbon(open ? "" : tab.label)}
                >
                  <span className="drawer__label">{tab.label}</span>
                  {/* runs from the label to the right edge, the way the
                      desktop ribbon's rule runs off the last tab */}
                  <span className="drawer__rule" aria-hidden="true" />
                </button>
                {/* always rendered — a conditional one cannot slide */}
                <div className="drawer__panel">
                  <div className="drawer__panelInner">
                    {tab.items.map((item) => (
                      <p key={item} className="drawer__row">
                        <RibbonItem item={item} className="drawer__text" />
                      </p>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ---------- body ---------- */}
      <div className="body">
        {/* slide overview rail = primary nav */}
        <nav className="rail" aria-label="Slides">
          {/* mobile only — the strip swipes sideways, and nothing else says so */}
          <span className="rail__cue rail__cue--start" aria-hidden="true">
            <PixelChevron />
          </span>
          <div className="rail__list">
            {SLIDES.map((s, i) => (
              <div key={s.id} className="rail__item">
                <span className="rail__num">({i + 1})</span>
                <button
                  type="button"
                  className="thumb"
                  style={{ background: s.color, color: s.ink }}
                  aria-current={slideId === s.id ? "true" : undefined}
                  onClick={() => goto(s.id)}
                >
                  {s.title}
                </button>
              </div>
            ))}
          </div>
          <span className="rail__cue rail__cue--end" aria-hidden="true">
            <PixelChevron />
          </span>
        </nav>

        {/* the slide */}
        <main className="stage">
          {/* sits in the grey, above the slide rather than inside it, so it
              stays put however far down a case study you scroll */}
          {project !== null && slide.cards && (
            <button
              type="button"
              className="detail__back stage__back"
              onClick={closeProject}
            >
              ← back
            </button>
          )}
          {/* work pages and case studies — across the bar from the back button */}
          {full && (
            <button
              type="button"
              className="iconbtn stage__expand"
              aria-label="Expand"
              onClick={expand}
            >
              <PixelArrows />
            </button>
          )}
          <article
            className={full ? "slide slide--full" : "slide"}
            style={accentVars}
          >
            {/* outside the scroll container, like the back button, so it
                stays in the corner however far down you are */}
            {expanded && (
              <div className="slide__bar">
                <button
                  type="button"
                  className="iconbtn"
                  aria-label="Minimize"
                  onClick={minimize}
                >
                  <PixelArrows inward />
                </button>
              </div>
            )}
            <div className="slide__scroll" ref={scrollRef}>
              {project !== null && slide.cards ? (
                <ProjectDetail
                  name={slide.cards[project]?.name ?? "project"}
                  index={project}
                  date={slide.cards[project]?.date}
                  study={slide.cards[project]?.study}
                />
              ) : slide.cards ? (
                <CollageSlide
                  heading={slide.heading ?? slide.title}
                  cards={slide.cards}
                  onOpen={openProject}
                />
              ) : slide.works ? (
                <GallerySlide
                  heading={slide.heading ?? slide.title}
                  intro={slide.intro}
                  works={slide.works}
                />
              ) : slide.id === "contact" ? (
                <Contact />
              ) : (
                <Split
                  title="Welcome to my portfolio"
                  body={
                    <>
                      Hi! i am <span className="accent">NAYANA</span>, a
                      multidisciplinary designer that loves creating,
                      experimenting and solving problems. Welcome to my
                      gallery of work.
                    </>
                  }
                />
              )}
            </div>
          </article>
        </main>

        {/* full-height scrollbar at the far right of the deck */}
        <SlideScrollbar targetRef={scrollRef} resetOn={`${slideId}:${project}`} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Split({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="split">
      <h1 className="split__title">{title}</h1>
      <p className="split__body">{body}</p>
    </div>
  );
}

/* Contact — the heading top left, the ways to reach me listed bottom right,
   on the same grid as the home slide. */
function Contact() {
  return (
    <div className="split">
      <h1 className="split__title">For inquiries and commissions</h1>
      <ul className="split__list">
        <li>
          Contact me through{" "}
          <a href="mailto:nayanaavinash25@gmail.com">email</a>.
        </li>
        <li>
          Here&apos;s my{" "}
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          .
        </li>
      </ul>
    </div>
  );
}

/* Play glyph: a plain white right-pointing triangle on a 9x11 grid, each
   row a stair step wider towards the middle. Drawn at 4x, crisp, like the
   rest of the pixel art; the shadow under it is CSS (.wall__play svg). */
const PLAY_ROWS = [1, 2, 4, 6, 7, 9, 7, 6, 4, 2, 1];
const PLAY_FILL = PLAY_ROWS.flatMap((n, y) =>
  Array.from({ length: n }, (_, x) => [x, y]),
);

function PixelPlay() {
  return (
    <svg
      viewBox="0 0 9 11"
      width="36"
      height="44"
      shapeRendering="crispEdges"
      fill="#fff"
      aria-hidden="true"
    >
      {PLAY_FILL.map(([x, y]) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />
      ))}
    </svg>
  );
}

/* one pace for the whole wall, so the piece opening and the pieces making
   room for it move as one */
const FLIP: KeyframeAnimationOptions = {
  duration: 700,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
};

/* Gallery wall — TouchDesigner. The videos hang in loose, centred rows,
   each its own size and height, the way the Design page's collage is
   scattered. Pointing at one puts a red frame round it; clicking opens it
   in place, across the whole wall, with the video on the left and its
   title and description on the right. The open piece grows out of its
   cover into the panel, and everything else slides aside to make room
   (FLIP: measure every piece before and after, then play each from where
   it was). While a piece is open, the covers that hang up into the row
   above (a negative `dy`) drop back to their row's top, so nothing
   overlaps the panel. One piece is open at a time. */
function GallerySlide({
  heading,
  intro,
  works,
}: {
  heading: string;
  intro?: string;
  works: Work[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const before = useRef<Map<number, DOMRect>>(new Map());
  const was = useRef<number | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  /* which row each piece hangs in, counted off the `row` breaks */
  const rowOf = works.reduce<number[]>(
    (acc, w, i) => [...acc, (i ? acc[i - 1] : 0) + (i && w.row ? 1 : 0)],
    [],
  );

  const show = useCallback(
    (i: number | null) => {
      const m = new Map<number, DOMRect>();
      items.current.forEach((el, j) => {
        if (el) m.set(j, el.getBoundingClientRect());
      });
      before.current = m;
      was.current = open;
      setPlaying(false);
      setOpen(i);
    },
    [open],
  );

  useLayoutEffect(() => {
    const prev = before.current;
    if (!prev.size) return;
    before.current = new Map();
    const target = open !== null ? items.current[open] : null;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.current.forEach((el, j) => {
        const from = prev.get(j);
        if (!el || !from) return;
        const to = el.getBoundingClientRect();
        /* the deck is transform-scaled, so convert screen px to design px */
        const fit = el.offsetWidth ? to.width / el.offsetWidth : 1;
        const dx = (from.left - to.left) / fit;
        const dy = (from.top - to.top) / fit;
        /* The piece opening grows out of its cover: the panel starts
           squeezed to the cover's box and stretches to its own, while its
           contents fade in once it has mostly arrived. */
        if (j === open) {
          el.animate(
            [
              {
                transformOrigin: "0 0",
                transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`,
              },
              { transformOrigin: "0 0", transform: "none" },
            ],
            FLIP,
          );
          el.querySelectorAll(".wall__panel > *").forEach((kid) =>
            kid.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 350,
              delay: 300,
              easing: "ease-out",
              fill: "backwards",
            }),
          );
          return;
        }
        /* the piece closing settles back in as a cover */
        if (j === was.current) {
          el.animate(
            [
              { opacity: 0, transform: "scale(0.92)" },
              { opacity: 1, transform: "none" },
            ],
            FLIP,
          );
          return;
        }
        if (!dx && !dy) return;
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
          FLIP,
        );
      });
    }
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [open]);

  /* escape shuts the open piece */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") show(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show]);

  /* Starts with sound, since a click opened it. If the browser still won't
     allow that, it plays muted rather than not at all; failing that, the
     play button stays up. */
  const play = useCallback(() => {
    const v = video.current;
    if (!v) return;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  /* a piece plays as soon as it opens */
  useEffect(() => {
    if (open !== null) play();
  }, [open, play]);

  const pause = () => video.current?.pause();

  return (
    <div className="work work--wall">
      <h1 className="work__title">{heading}</h1>
      {intro && <p className="work__intro">{intro}</p>}
      <ul className="wall">
        {works.map((w, i) => (
          <Fragment key={i}>
            {/* forces the row break, so every row keeps its pieces */}
            {w.row && <li className="wall__break" aria-hidden="true" />}
            {open === i ? (
              <li
                ref={(el) => {
                  items.current[i] = el;
                }}
                className="wall__item is-open"
              >
                <div className="wall__panel">
                  <div
                    className={w.ratio < 1 ? "wall__media wall__media--tall" : "wall__media"}
                    style={{ aspectRatio: w.ratio }}
                  >
                    <video
                      ref={video}
                      className="wall__video"
                      src={w.video}
                      poster={w.poster}
                      playsInline
                      preload="auto"
                      onClick={playing ? pause : play}
                      /* the button follows the video itself, however it
                         was started or stopped */
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => setPlaying(false)}
                    />
                    {!playing && (
                      <button
                        type="button"
                        className="wall__play"
                        aria-label={`Play ${w.name}`}
                        onClick={play}
                      >
                        <PixelPlay />
                      </button>
                    )}
                  </div>
                  <div className="wall__info">
                    <h2 className="wall__name">{w.name}</h2>
                    {w.blurb && <p className="wall__blurb">{w.blurb}</p>}
                  </div>
                  <button
                    type="button"
                    className="iconbtn wall__close"
                    aria-label="Close"
                    onClick={() => show(null)}
                  >
                    <PixelX />
                  </button>
                </div>
              </li>
            ) : (
              <li
                ref={(el) => {
                  items.current[i] = el;
                }}
                className="wall__item"
                style={{
                  width: w.w,
                  marginTop: open === null ? w.dy : Math.max(0, w.dy),
                  marginInline: TD_ROW_AIR[rowOf[i]] ?? 0,
                }}
              >
                <button type="button" className="wall__card" onClick={() => show(i)}>
                  <span className="wall__frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="wall__cover"
                      src={w.poster}
                      alt=""
                      style={{ aspectRatio: w.ratio }}
                    />
                  </span>
                  <span className="card__name">
                    ({i + 1}) {w.name}
                  </span>
                </button>
              </li>
            )}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}


/* Collage layout — each card is placed and sized individually, measured
   off the deck. Used by UI/UX and Other. */
/* Puts a study's backdrop shape under the grey grain (see .has-backdrop). */
function backdropStyle(
  backdrop: string | undefined,
  style: React.CSSProperties = {},
): React.CSSProperties {
  return backdrop
    ? ({ ...style, "--backdrop": `url("${backdrop}")` } as React.CSSProperties)
    : style;
}

function CollageSlide({
  heading,
  cards,
  onOpen,
}: {
  heading: string;
  cards: CardBox[];
  onOpen: (i: number) => void;
}) {
  /* Expanded, the collage is laid out again in its own centred box: each
     card keeps its place as a share of the free space across (--fx), so the
     gaps grow with the box while the arrangement stays the deck's; down, the
     offsets are stretched by --spread-y. See .is-expanded .work__collage. */
  const minX = Math.min(...cards.map((c) => c.x));
  const minY = Math.min(...cards.map((c) => c.y));
  const span = Math.max(...cards.map((c) => c.x + c.w)) - minX;
  const tall = Math.max(...cards.map((c) => c.y - minY + c.h));
  const box = {
    "--span": `${span}px`,
    "--tall": `${tall}px`,
    /* lowest card edge on the deck — a third row makes the page longer */
    "--bottom": `${Math.max(...cards.map((c) => c.y + c.h))}px`,
  } as React.CSSProperties;

  return (
    <div className="work work--collage" style={box}>
      <h1 className="work__title">{heading}</h1>
      <ul className="work__collage">
        {cards.map((c, i) => (
          <li
            key={i}
            className="work__slot"
            style={
              {
                left: c.x,
                top: c.y,
                width: c.w,
                "--w": `${c.w}px`,
                "--fx": span > c.w ? (c.x - minX) / (span - c.w) : 0,
                "--dy": `${c.y - minY}px`,
              } as React.CSSProperties
            }
          >
            <button type="button" className="card" onClick={() => onOpen(i)}>
              {/* the case study's cover, framed the same way as its header,
                  with anything stuck on its corner */}
              <span className="card__frame">
                <span
                  className={
                    !c.study?.hero
                      ? "card__media"
                      : c.study.framed === "glow"
                        ? "card__media card__media--cover card__media--glow"
                        : c.study.backdrop
                        ? "card__media card__media--cover card__media--grain has-backdrop"
                        : c.study.grain === "dusk"
                        ? "card__media card__media--cover card__media--grain grain--dusk"
                        : c.study.grain === "aura"
                        ? "card__media card__media--cover grain--aura"
                        : c.study.grain === "dots"
                        ? "card__media card__media--cover grain--dots"
                        : c.study.grain === "sand"
                        ? "card__media card__media--cover grain--sand"
                        : "card__media card__media--cover card__media--grain"
                  }
                  style={backdropStyle(c.study?.backdrop, { height: c.h })}
                >
                  {c.study?.hero && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="card__cover" src={c.study.hero} alt="" />
                  )}
                </span>
                {c.study?.sticker && <Sticker label={c.study.sticker} />}
              </span>
              <span className="card__name">
                ({i + 1}) {c.name}
              </span>
              {c.study?.tags && (
                <span className="card__tags">[{c.study.tags.join(" · ")}]</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Classic stepper scrollbar: arrow button, thumb, track, arrow button.
   Drives the slide's scroll container, so it sits outside the slide at the
   far right of the deck and runs the full height of the section. */
const STEP = 48;

function SlideScrollbar({
  targetRef,
  resetOn,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  resetOn: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, size: 0, enabled: false });

  const sync = useCallback(() => {
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const trackH = track.clientHeight;
    const overflow = el.scrollHeight - el.clientHeight;
    if (overflow <= 0 || trackH <= 0) {
      setThumb({ top: 0, size: trackH, enabled: false });
      return;
    }
    const size = Math.max(24, (el.clientHeight / el.scrollHeight) * trackH);
    const top = (el.scrollTop / overflow) * (trackH - size);
    setThumb({ top, size, enabled: true });
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync, targetRef, resetOn]);

  const step = (dir: number) => {
    targetRef.current?.scrollBy({ top: dir * STEP });
  };

  const onThumbDown = (e: React.PointerEvent) => {
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track || !thumb.enabled) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    const startY = e.clientY;
    const startScroll = el.scrollTop;
    const overflow = el.scrollHeight - el.clientHeight;
    const range = track.clientHeight - thumb.size;

    const move = (ev: PointerEvent) => {
      if (range <= 0) return;
      /* the deck is transform-scaled, so convert screen px back to design px */
      const scale = track.getBoundingClientRect().height / track.clientHeight;
      const dy = (ev.clientY - startY) / (scale || 1);
      el.scrollTop = startScroll + (dy / range) * overflow;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const page = (e: React.MouseEvent) => {
    const el = targetRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const rect = track.getBoundingClientRect();
    const scale = rect.height / track.clientHeight || 1;
    const y = (e.clientY - rect.top) / scale;
    el.scrollBy({ top: y < thumb.top ? -el.clientHeight : el.clientHeight });
  };

  return (
    <div className="scrollbar" aria-hidden="true">
      <button
        type="button"
        className="scrollbar__btn"
        onClick={() => step(-1)}
        tabIndex={-1}
      >
        <span className="scrollbar__arrow scrollbar__arrow--up" />
      </button>

      <div className="scrollbar__track" ref={trackRef} onMouseDown={page}>
        {thumb.enabled && (
          <div
            className="scrollbar__thumb"
            style={{ top: thumb.top, height: thumb.size }}
            onPointerDown={onThumbDown}
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}
      </div>

      <button
        type="button"
        className="scrollbar__btn"
        onClick={() => step(1)}
        tabIndex={-1}
      >
        <span className="scrollbar__arrow scrollbar__arrow--down" />
      </button>
    </div>
  );
}

/* No back button here — it lives in the slide's own bar, outside the scroll
   container, so it stays reachable however far down a case study you are. */
function ProjectDetail({
  name,
  index,
  date,
  study,
}: {
  name: string;
  index: number;
  date?: string;
  study?: Study;
}) {
  return (
    <div className="detail">
      <div className="detail__head">
        <h1 className="detail__title">
          ({index + 1}) {name}
        </h1>
        {(study?.date ?? date) && (
          <p className="detail__date">{study?.date ?? date}</p>
        )}
      </div>
      {study && <CaseStudy study={study} />}
    </div>
  );
}

/* A round chrome sticker stuck over a card's top right corner, half on and
   half off, as if it were holding the cover down. Work page only. */
function Sticker({ label }: { label: string }) {
  return (
    <span className="sticker" aria-hidden="true">
      <span className="sticker__text">
        {label.split(" ").map((w) => (
          <span key={w}>{w}</span>
        ))}
      </span>
    </span>
  );
}

/* Every .shot is an empty bordered box, matching the card placeholders —
   the artwork drops in later. */
function CaseStudy({ study }: { study: Study }) {
  const facts = (
    <dl className="study__facts">
      {study.facts.map((f) => (
        <div key={f.label} className="study__fact">
          <dt className="study__label">{f.label}</dt>
          <dd className="study__value">{f.value}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div className="study">
      {study.link && (
        <a
          className="study__link"
          href={study.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          visit site
        </a>
      )}
      {study.kicker && <p className="study__kicker">{study.kicker}</p>}
      <p className="study__intro">{study.intro}</p>

      {study.hero || study.framed ? (
        <div className="study__top">
          <div
            className={
              study.framed === "glow"
                ? "study__heroFrame glowSquare edgeGlow"
                : study.backdrop
                  ? "study__heroFrame has-backdrop"
                  : study.grain === "dusk"
                    ? "study__heroFrame grain--dusk"
                    : study.grain === "aura"
                      ? "study__heroFrame grain--aura"
                      : study.grain === "dots"
                        ? "study__heroFrame grain--dots"
                        : study.grain === "sand"
                          ? "study__heroFrame grain--sand"
                      : "study__heroFrame"
            }
            style={backdropStyle(study.backdrop)}
          >
            {study.hero && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="study__heroImg" src={study.hero} alt="" />
            )}
          </div>
          {facts}
        </div>
      ) : (
        <>
          <span className="shot shot--hero" />
          {facts}
        </>
      )}

      {study.embed && (
        <section className="study__section">
          <div className="study__embedHead">
            {study.embedTitle && <h2 className="study__heading">{study.embedTitle}</h2>}
            <p className="study__embedHint">*prototype is interactive</p>
          </div>
          <div className="study__embed">
            <iframe
              src={study.embed}
              title={study.embedTitle ?? "Prototype"}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>
      )}

      {study.video && (
        <section className="study__section">
          {study.videoTitle && (
            <h2 className="study__heading">{study.videoTitle}</h2>
          )}
          <video
            className="study__video"
            src={study.video}
            controls
            playsInline
            preload="metadata"
          />
        </section>
      )}

      {study.sections.map((s) => (
        <StudySection key={s.heading} section={s} />
      ))}
    </div>
  );
}

function StudySection({ section: s }: { section: Section }) {
  /* nothing but a paragraph — Reflections, Limitations — reads larger */
  const prose =
    s.body &&
    !s.lead &&
    !s.context &&
    !s.screens &&
    !s.tabs &&
    !s.moments &&
    !s.shot &&
    !s.steps &&
    !s.groups &&
    !s.stack &&
    !s.logos &&
    !s.rows &&
    !s.uses &&
    !s.figRows;
  const cls = ["study__section"];
  if (s.compact) cls.push("study__section--compact");
  if (prose) cls.push("study__section--prose");
  if (s.stack || s.logos || s.rows || s.uses || s.figRows)
    cls.push("study__section--stack");
  return (
    <section className={cls.join(" ")}>
      <h2 className="study__heading">
        {s.heading}
        {s.todo && <span className="study__todo">to write</span>}
      </h2>

      {s.lead && <p className="study__lead">{s.lead}</p>}
      {s.body && (
        <p className={s.todo ? "study__caption study__prompt" : "study__caption"}>
          {s.body}
        </p>
      )}

      {s.context && (
        <dl className="study__context">
          {s.context.map((c) => (
            <div key={c.label} className="study__contextItem">
              <dt className="study__contextLabel">{c.label}</dt>
              <dd className="study__value">{c.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {s.screens && (
        <div className="study__screens">
          {s.screens.map((row) => (
            <div key={row.label} className="study__screenRow">
              <p className="study__screenLabel">{row.label}</p>
              <div className="study__screenStrip">
                {row.images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    className="study__screen"
                    src={src}
                    alt={`${row.label} screen`}
                    loading="lazy"
                  />
                ))}
                {Array.from({ length: row.slots ?? 0 }, (_, i) => (
                  <span key={i} className="shot study__screen study__screenSlot" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {s.tabs && <StudyTabs tabs={s.tabs} />}

      {s.moments && (
        <ol className="study__moments">
          {s.moments.map((m, i) => (
            <li
              key={m.title}
              className={m.image ? "study__moment study__moment--shot" : "study__moment"}
            >
              {m.image && (
                <div className="glowSquare">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="glowSquare__img"
                    src={m.image}
                    alt={`${m.title} screen`}
                    loading="lazy"
                  />
                </div>
              )}
              <div className="study__momentText">
                <div className="study__momentHead">
                  <span className="study__momentNum">({i + 1})</span>
                  <h3 className="study__momentTitle">{m.title}</h3>
                </div>
                <p className="study__value">{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {s.shot && <span className={`shot shot--${s.shot}`} />}

      {s.steps && (
        <ol className="study__journey">
          {s.steps.map((step) => (
            <li key={step.step} className="study__step">
              <span className="shot shot--screen" />
              <p className="study__stepName">{step.step}</p>
              <p className="study__caption">{step.caption}</p>
            </li>
          ))}
        </ol>
      )}

      {s.logos && (
        <div className="logos">
          <span />
          {s.logos.columns.map((c) => (
            <p key={c} className="logos__col">{c}</p>
          ))}
          {s.logos.rows.map((row) => (
            <Fragment key={row.label}>
              <p className="logos__row">{row.label}</p>
              {row.images.map((src, i) => (
                <div
                  key={src}
                  className={row.dark ? "logos__tile logos__tile--dark" : "logos__tile"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="logos__img"
                    src={src}
                    alt={`${row.label} ${s.logos!.columns[i]} logo`}
                    loading="lazy"
                  />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      )}

      {s.uses && (
        <div className="uses">
          {s.uses.map((u) => (
            <div key={u.label} className="uses__group">
              <p className="uses__label">{u.label}</p>
              <div className={u.small ? "uses__row uses__row--small" : "uses__row"}>
                {u.images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} className="uses__img" src={src} alt={`${u.label} logo`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {s.figRows && <FigRows rows={s.figRows} alt={s.heading} />}

      {s.rows && (
        <div className="study__stack">
          {s.rows.map((row) => (
            <div key={row.join()} className="study__imgRow">
              {row.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  className="study__stackImg"
                  src={src}
                  alt={`${s.heading} image`}
                  loading="lazy"
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {s.stack && (
        <div className="study__stack">
          {s.stack.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              className="study__stackImg"
              src={src}
              alt={`${s.heading} screen`}
              loading="lazy"
            />
          ))}
        </div>
      )}

      {s.groups?.map((g, gi) => (
        <div key={g.label ?? gi} className="study__group">
          {g.label && <p className="study__groupName">{g.label}</p>}
          <div className="study__row">
            {g.images?.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                className="study__groupImg"
                src={src}
                alt={g.label ?? ""}
                loading="lazy"
              />
            ))}
            {Array.from({ length: g.shots ?? 0 }, (_, i) => (
              <span key={i} className="shot shot--screen" />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/* Rows of images that all share one height. Each image's flex-grow is its
   own width / height, so in a full row the widths split in proportion and
   the heights match. A row with less in it gets an empty spacer making up
   the difference, so its images come out at that same height rather than
   stretching to fill the width. Spacing is a margin on every image but the
   first, never on the spacer, so it costs every row the same. */
function FigRows({
  rows,
  alt,
}: {
  rows: NonNullable<Section["figRows"]>;
  alt: string;
}) {
  const sum = (r: (typeof rows)[number]) =>
    r.items.reduce((t, it) => t + it.w / it.h, 0);
  const widest = Math.max(...rows.map(sum));
  return (
    <div className="figrows">
      {rows.map((row, ri) => (
        <div key={ri} className="figrows__row">
          {row.label && <p className="figrows__label">{row.label}</p>}
          <div className="figrows__items">
            {row.items.map((it) => (
              <figure
                key={it.src}
                className="figrows__item"
                style={{ flex: `${it.w / it.h} 1 0` }}
              >
                {it.label && (
                  <figcaption className="figrows__label">{it.label}</figcaption>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="figrows__img"
                  src={it.src}
                  alt={it.label ?? row.label ?? alt}
                  loading="lazy"
                />
              </figure>
            ))}
            {widest - sum(row) > 0.001 && (
              <span aria-hidden style={{ flex: `${widest - sum(row)} 1 0` }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Tabbed panel — tabs across the top, copy left, a square screenshot right.
   The copy and the screenshots are two separate tracks, each in its own
   window, so picking a tab slides the text to the next text and the image
   to the next image. The soft blue gradient sits on the image window, not
   on the track, so it stays put behind the screens as they slide. */
function StudyTabs({ tabs }: { tabs: { title: string; body: string; image: string }[] }) {
  const [active, setActive] = useState(0);
  const shift = { transform: `translateX(${-active * 100}%)` };

  return (
    <div className="tabs">
      <div className="tabs__bar" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.title}
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="tabs__panel">
        <div className="tabs__window">
          <div className="tabs__track" style={shift}>
            {tabs.map((t, i) => (
              <div
                key={t.title}
                className="tabs__text"
                role="tabpanel"
                aria-hidden={i !== active}
                inert={i !== active}
              >
                <h3 className="tabs__title">{t.title}</h3>
                <p className="study__value">{t.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="tabs__window tabs__media">
          <div className="tabs__track" style={shift}>
            {tabs.map((t, i) => (
              <div key={t.title} className="tabs__shot" aria-hidden={i !== active}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="tabs__img" src={t.image} alt={`${t.title} screens`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
