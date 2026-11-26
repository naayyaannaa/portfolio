"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

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
  { label: "Links", items: ["Instagram", "LinkedIn", "Behance"] },
];

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
  hero?: string; // image in the top .shot--hero slot; blank box if absent
  /* a live embed (e.g. a Figma prototype) under the hero, with its heading */
  embed?: string;
  embedTitle?: string;
  /* the kiosk's layout — hero panel left, facts right — even before there
     is a hero image to put in it. "glow" swaps the grey grained panel for
     an outlined square with the blue glow, as on Klik AI's features. */
  framed?: boolean | "glow";
  /* a faint shape laid under the grey grain of the hero panel and card */
  backdrop?: string;
  /* "dusk" swaps the grey grain of the hero panel and card for a white
     square with an orange caustic (public/bounce/caustic.svg) */
  grain?: "dusk";
  /* what I did, shown in square brackets under the card's name */
  tags?: string[];
  facts: { label: string; value: string }[];
  sections: Section[];
};

/* A row on the TouchDesigner reel. The red block is a cover sitting over the
   video — drop an .mp4 in public/videos and point `video` at it; a row with
   no video still slides open, onto an empty placeholder. */
type Work = {
  name: string;
  blurb?: string;
  video?: string;
  poster?: string;
};

type Slide = {
  id: string;
  title: string;
  color: string;
  ink: string;
  accent: string;
  strokeColor?: string;
  heading?: string;
  works?: Work[];
  cards?: CardBox[];
};

/* Blysk Handcrafted — the Behance gallery is gated past the preview, so the
   only things stated as fact below are what the page itself lists: the brand,
   the discipline, the tool and the publish date. Everything written is marked
   todo, the same way BOUNCE handles it — prompts for Nayana, not claims. */
const BLYSK: Study = {
  kicker: "Branding · Handcrafted goods",
  date: "August 2025",
  intro:
    "Brand identity for Blysk Handcrafted, a maker of handcrafted goods, built out in Figma from the mark through to the applied system.",
  facts: [
    { label: "Brand", value: "Blysk Handcrafted" },
    { label: "Discipline", value: "Branding" },
    { label: "Tools", value: "Figma" },
  ],
  sections: [
    {
      heading: "The Brief",
      todo: true,
      body: "What was Blysk asking for, and what did handcrafted have to mean visually? Name the starting point: a new brand, a rename, or an identity that had outgrown itself.",
    },
    {
      heading: "Direction",
      todo: true,
      body: "The references and the thinking behind the look: where the warmth comes from, and what you deliberately steered away from.",
      shot: "wide",
    },
    {
      heading: "The Mark",
      todo: true,
      body: "The logo, its construction and the variants it ships in: primary, stacked, and whatever survives at small sizes.",
      groups: [{ shots: 2 }],
    },
    {
      heading: "Identity System",
      todo: true,
      body: "Type, colour and the supporting elements, the pieces that let the brand hold together across things you did not design yourself.",
      shot: "wide",
    },
    {
      heading: "Applications",
      todo: true,
      body: "The identity in use: packaging, labels, social and anything physical the handcrafted line called for.",
      groups: [{ label: "Applications", shots: 3 }],
    },
    {
      heading: "Outcome",
      todo: true,
      body: "How it landed, and what you would push further given another pass.",
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
  date: "April 2025",
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
  kicker: "UI/UX Design · Graphic Design · Sportswear brand",
  date: "March 2024",
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

/* UI/UX gets its own copy of the collage so cards can carry case studies
   without changing the Other slide, which shares the same layout. */
/* extra room between the first row of UI/UX cards and the second, whose
   tags sit lower now that every top-row card carries a study */
const UIUX_ROW_GAP = 64;

const UIUX_CARDS: CardBox[] = COLLAGE.map((box, i) => {
  const c = i >= 3 ? { ...box, y: box.y + UIUX_ROW_GAP } : box;
  if (i === 0) return { ...c, name: "Klik AI", study: KLIK };
  if (i === 1) return { ...c, name: "Zenith Website", study: ZENITH };
  if (i === 2) return { ...c, name: "Product Discovery Kiosk", study: KIOSK };
  /* landscape, to suit its wide website cover */
  if (i === 3)
    return { ...c, w: 340, h: 250, name: "The Bounce Factor", study: BOUNCE };
  return c;
});

/* and Other gets its own copy for the same reason */
const OTHER_CARDS: CardBox[] = COLLAGE.map((c, i) =>
  i === 0 ? { ...c, name: "Blysk Handcrafted", study: BLYSK } : c,
);

const SLIDES: Slide[] = [
  { id: "home", title: "Home", color: "#FF2E77", ink: "#000000", accent: "#FF2E77" },
  {
    id: "uiux",
    title: "UI/UX",
    color: "#31FF2E",
    ink: "#000000",
    accent: "#31FF2E",
    strokeColor: "#000000",
    heading: "UI/UX work",
    cards: UIUX_CARDS,
  },
  {
    id: "touchdesigner",
    title: "Touch-designer",
    color: "#FF2E2E",
    ink: "#000000",
    accent: "#FF2E2E",
    strokeColor: "#000000",
    heading: "TouchDesigner work",
    works: [
      { name: "Project Name", blurb: "Short project description goes here." },
      { name: "Project Name", blurb: "Short project description goes here." },
      { name: "Project Name", blurb: "Short project description goes here." },
      { name: "Project Name", blurb: "Short project description goes here." },
      { name: "Project Name", blurb: "Short project description goes here." },
    ],
  },
  {
    id: "other",
    title: "Other",
    color: "#FFFC2E",
    ink: "#000000",
    accent: "#FFFC2E",
    strokeColor: "#000000",
    heading: "Other work",
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
     a fixed canvas and becomes an ordinary scrolling document, so it is left
     unscaled and the media query in globals.css takes over the layout. */
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
     the work page. On mobile the window scrolls instead, so move both. */
  useEffect(() => {
    const top = returning.current ? parked.current : 0;
    returning.current = false;
    scrollRef.current?.scrollTo({ top });
    window.scrollTo({ top });
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
    /* the slide scrolls on desktop, the window on mobile — see globals.css */
    parked.current = scrollRef.current?.scrollTop || window.scrollY;
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
                  <span key={item} className="header__item">
                    {item}
                  </span>
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
                        {item}
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
                  study={slide.cards[project]?.study}
                />
              ) : slide.cards ? (
                <CollageSlide
                  heading={slide.heading ?? slide.title}
                  cards={slide.cards}
                  onOpen={openProject}
                />
              ) : slide.works ? (
                <ReelSlide
                  heading={slide.heading ?? slide.title}
                  works={slide.works}
                />
              ) : slide.id === "contact" ? (
                <Split
                  title="Let's make something"
                  body={
                    <>
                      Say hello at{" "}
                      <a className="accent" href="mailto:nayanaavinash25@gmail.com">
                        nayanaavinash25@gmail.com
                      </a>
                      . Briefs, collaborations and good ideas all welcome.
                    </>
                  }
                />
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

/* Reel layout — TouchDesigner. Ruled rows, each with a red block sitting in
   the bottom-right corner. Pointing at a row opens the whole row accordion-
   style: it grows from 89 to 190, and because everything in it is bottom-
   aligned the block stretches to a 16:9 frame while the name rides down with
   the rule. The red cover slides up out of that frame as it grows, uncovering
   the video. Rows below are pushed down by ordinary flow.
   One row is open at a time; closing rewinds, so a row always opens on its
   first frame. */
function ReelSlide({ heading, works }: { heading: string; works: Work[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  /* Drive playback off the open row rather than off the pointer, so the row
     that closes because another one opened is rewound too.
     play() rejects when the browser declines to autoplay — the row still
     opens, so there is nothing to recover from. */
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === open) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [open]);

  return (
    <div className="work work--reel">
      <h1 className="work__title">{heading}</h1>
      <ul className="work__reel">
        {works.map((w, i) => {
          const isOpen = open === i;
          return (
            <li key={i} className={isOpen ? "reel__row is-open" : "reel__row"}>
              {/* click toggles: opening one row closes the others, and
                  clicking the open row shuts it again. Same gesture on touch
                  and pointer, and Enter/Space on the focused button lands on
                  it too. */}
              <button
                type="button"
                className="reel"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="reel__text">
                  <span className="reel__head">
                    {/* points down closed, up open — decorative, since
                        aria-expanded already carries the state */}
                    <span className="reel__arrow" aria-hidden="true">
                      <PixelChevron />
                    </span>
                    <span className="reel__name">{w.name}</span>
                  </span>
                  {w.blurb ? (
                    <span className="reel__blurb">
                      <span className="reel__blurbText">{w.blurb}</span>
                    </span>
                  ) : null}
                </span>
                <span className="reel__side">
                  <span className="reel__media">
                    {w.video ? (
                      <video
                        ref={(el) => {
                          videos.current[i] = el;
                        }}
                        className="reel__video"
                        src={w.video}
                        poster={w.poster}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      /* video goes here */
                      <span className="reel__slot" />
                    )}
                    <span className="reel__cover" />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
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
              {/* the case study's cover, framed the same way as its header */}
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
                      : "card__media card__media--cover card__media--grain"
                }
                style={backdropStyle(c.study?.backdrop, { height: c.h })}
              >
                {c.study?.hero && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="card__cover" src={c.study.hero} alt="" />
                )}
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
  study,
}: {
  name: string;
  index: number;
  study?: Study;
}) {
  return (
    <div className="detail">
      <div className="detail__head">
        <h1 className="detail__title">
          ({index + 1}) {name}
        </h1>
        {study?.date && <p className="detail__date">{study.date}</p>}
      </div>
      {study && <CaseStudy study={study} />}
    </div>
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

      {study.sections.map((s) => (
        <StudySection key={s.heading} section={s} />
      ))}
    </div>
  );
}

function StudySection({ section: s }: { section: Section }) {
  return (
    <section className={s.compact ? "study__section study__section--compact" : "study__section"}>
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
