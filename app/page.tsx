"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  shot?: "hero" | "wide"; // a single placeholder box
  steps?: { step: string; caption: string }[]; // numbered grid, one shot each
  groups?: { label?: string; shots: number }[]; // labelled rows of shots
};

/* A written-up project. Every image slot is deliberately left blank —
   drop the artwork into the .shot boxes when the exports are ready. */
type Study = {
  kicker: string;
  date?: string; // sits beside the detail title
  intro: string;
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
    "Brand identity for Blysk Handcrafted, a maker of handcrafted goods — built out in Figma from the mark through to the applied system.",
  facts: [
    { label: "Brand", value: "Blysk Handcrafted" },
    { label: "Discipline", value: "Branding" },
    { label: "Tools", value: "Figma" },
  ],
  sections: [
    {
      heading: "The Brief",
      todo: true,
      body: "What was Blysk asking for, and what did handcrafted have to mean visually? Name the starting point — a new brand, a rename, or an identity that had outgrown itself.",
    },
    {
      heading: "Direction",
      todo: true,
      body: "The references and the thinking behind the look — where the warmth comes from, and what you deliberately steered away from.",
      shot: "wide",
    },
    {
      heading: "The Mark",
      todo: true,
      body: "The logo, its construction and the variants it ships in — primary, stacked, and whatever survives at small sizes.",
      groups: [{ shots: 2 }],
    },
    {
      heading: "Identity System",
      todo: true,
      body: "Type, colour and the supporting elements — the pieces that let the brand hold together across things you did not design yourself.",
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

/* Product Discovery Kiosk — written up from the Behance case study. */
const KIOSK: Study = {
  kicker: "UI/UX · Self-service retail kiosk · Pine Labs",
  date: "March 2025", // TODO placeholder — real Behance publish date needed
  intro:
    "A self-service digital kiosk interface, enabling customers to browse smartphones and other devices, compare models side by side, and complete purchases directly at the kiosk.",
  facts: [
    {
      label: "Objective",
      value:
        "Create stickiness with merchants and maximize brand visibility for Pine Labs.",
    },
    { label: "Merchant Type", value: "Electronic Store" },
    {
      label: "Solution Brief",
      value:
        "To build a UI that enables customers to seamlessly evaluate different phones and make an informed purchase, enhancing customer satisfaction.",
    },
  ],
  sections: [
    {
      heading: "The Challenge",
      todo: true,
      body: "What made this hard? Name what was breaking before the kiosk — shoppers waiting on staff to answer spec questions, no way to hold two phones side by side, inconsistent information across the shop floor.",
    },
    {
      heading: "Research",
      todo: true,
      body: "What did you look at before designing? Store visits, how customers compare phones today, existing kiosk and e-commerce comparison patterns, and the constraints of a fixed in-store touchscreen.",
      shot: "wide",
    },
    {
      heading: "Who It's For",
      todo: true,
      body: "One or two short profiles — the shopper deciding between two flagships, and the store staff the kiosk is meant to free up. What each needs from the screen.",
      groups: [{ shots: 2 }],
    },
    {
      heading: "Information Architecture",
      todo: true,
      body: "Sitemap or flow diagram: how someone gets from the idle home screen to a completed checkout, and how they recover if they change their mind.",
      shot: "wide",
    },
    {
      heading: "Wireframes",
      todo: true,
      body: "Early low-fidelity layouts for browse, compare and checkout, before the visual design landed.",
      groups: [{ shots: 3 }],
    },
    {
      heading: "Design System",
      todo: true,
      body: "Type scale, colour, buttons, cards and the comparison table — sized for touch targets at kiosk viewing distance rather than for a phone in the hand.",
      shot: "wide",
    },
    {
      heading: "User Journey",
      steps: [
        { step: "Step 1", caption: "Choose from various curated filters." },
        { step: "Step 2", caption: "Browse through phone inventory." },
        { step: "Step 3", caption: "View phone details." },
        { step: "Step 4", caption: "Select phone to compare." },
        { step: "Step 5", caption: "Compare features between phone models." },
        { step: "Step 6", caption: "Add to cart and checkout." },
      ],
    },
    {
      heading: "Responsive Design",
      lead: "Designed to fit your needs.",
      body: "The same interface holds up across kiosk screen sizes — two devices side by side on the smaller panel, three on the wider one.",
      shot: "wide",
    },
    {
      heading: "Screens",
      groups: [
        { label: "Home Screens", shots: 3 },
        { label: "Compare Devices", shots: 2 },
        { label: "Checkout", shots: 3 },
      ],
    },
    {
      heading: "Outcome",
      todo: true,
      body: "How did it land? Anything measurable is ideal — time taken to compare, completed checkouts, staff time saved — but a short honest reflection on what you would change works too.",
    },
  ],
};

/* The Bounce Factor — the Behance gallery is only a hero, a graphics board
   and a sign-off, so the written sections below are marked todo: they are
   prompts for Nayana to fill in, not claims about work already done. */
const BOUNCE: Study = {
  kicker: "UI/UX Design · Graphic Design · Sportswear brand",
  date: "June 2025", // TODO placeholder — real Behance publish date needed
  intro:
    "A dynamic sportswear brand bringing team spirit to life with custom-made jerseys designed for performance and identity.",
  facts: [
    { label: "Brand", value: "The Bounce Factor — thebouncefactor.in" },
    { label: "Discipline", value: "UI/UX Design, Graphic Design" },
    {
      label: "Deliverables",
      value:
        "Storefront website, social media creatives, jersey design and product brochure.",
    },
  ],
  sections: [
    {
      heading: "The Challenge",
      todo: true,
      body: "What was hard about this one? Name the problem the brand had before the redesign — teams could not picture a custom kit before ordering, the old site did not convert, the brand had no consistent visual language across channels.",
    },
    {
      heading: "Research",
      todo: true,
      body: "What did you look at before designing? Competitor teardowns, what team captains actually ask for when ordering kit, existing sportswear storefronts. Note anything that changed your direction.",
      shot: "wide",
    },
    {
      heading: "Who It's For",
      todo: true,
      body: "One or two short profiles — the team captain ordering twenty kits on a deadline, the individual player after one custom jersey. What each needs from the site.",
      groups: [{ shots: 2 }],
    },
    {
      heading: "Information Architecture",
      todo: true,
      body: "Sitemap or flow diagram: how someone gets from landing to a finished custom order.",
      shot: "wide",
    },
    {
      heading: "Wireframes",
      todo: true,
      body: "Early low-fidelity layouts before the visual design landed.",
      groups: [{ shots: 3 }],
    },
    {
      heading: "Design System",
      todo: true,
      body: "Type scale, colour, buttons and cards — the pieces the site is built from.",
      shot: "wide",
    },
    {
      heading: "The Website",
      lead: "Gear that matches your hustle.",
      body: "Customize your jersey with high-quality, performance-ready designs made for your game.",
      shot: "hero",
    },
    {
      heading: "Graphics",
      body: "Social Media · Jersey Design · Product Brochure",
      groups: [
        { label: "Social Media", shots: 3 },
        { label: "Jersey Design", shots: 3 },
        { label: "Product Brochure", shots: 2 },
      ],
    },
    {
      heading: "Outcome",
      todo: true,
      body: "How did it land? Anything measurable is ideal — orders, enquiries, time to place an order — but a short honest reflection on what you would change works too.",
    },
  ],
};

/* UI/UX gets its own copy of the collage so cards can carry case studies
   without changing the Other slide, which shares the same layout. */
const UIUX_CARDS: CardBox[] = COLLAGE.map((c, i) => {
  if (i === 2) return { ...c, name: "Product Discovery Kiosk", study: KIOSK };
  if (i === 3) return { ...c, name: "The Bounce Factor", study: BOUNCE };
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

export default function Page() {
  const [ribbon, setRibbon] = useState("Contact");
  const [menu, setMenu] = useState(false);
  const [slideId, setSlideId] = useState("home");
  const [project, setProject] = useState<number | null>(null);
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

  /* Work and case-study slides always take the full height they are given,
     so TouchDesigner, UI/UX and Other are the same box on mobile whatever
     their content adds up to. Home and contact keep the 4:3 floor instead
     and centre their copy in it. */
  const full = Boolean(slide.cards || slide.works);

  const openProject = (i: number) => {
    parked.current = scrollRef.current?.scrollTop ?? 0;
    setProject(i);
  };

  const closeProject = () => {
    returning.current = true;
    setProject(null);
  };

  const goto = (id: string) => {
    /* picking a different slide is not a back — that one starts at the top */
    returning.current = false;
    setSlideId(id);
    setProject(null);
  };

  return (
    <div className="frame">
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
          <article
            className={full ? "slide slide--full" : "slide"}
            style={accentVars}
          >
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
                      </a>{" "}
                      — briefs, collaborations and good ideas all welcome.
                    </>
                  }
                />
              ) : (
                <Split
                  title="Welcome to my portfolio"
                  body={
                    <>
                      Hi! i am <span className="accent">NAYANA</span>, a
                      multidisciplinary designer that loves creating and
                      experimenting with all things creative. Welcome to my
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
function CollageSlide({
  heading,
  cards,
  onOpen,
}: {
  heading: string;
  cards: CardBox[];
  onOpen: (i: number) => void;
}) {
  return (
    <div className="work work--collage">
      <h1 className="work__title">{heading}</h1>
      <ul className="work__collage">
        {cards.map((c, i) => (
          <li
            key={i}
            className="work__slot"
            style={{ left: c.x, top: c.y, width: c.w }}
          >
            <button type="button" className="card" onClick={() => onOpen(i)}>
              {/* project image goes here */}
              <span className="card__media" style={{ height: c.h }} />
              <span className="card__name">
                ({i + 1}) {c.name}
              </span>
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
  return (
    <div className="study">
      <p className="study__kicker">{study.kicker}</p>
      <p className="study__intro">{study.intro}</p>

      <span className="shot shot--hero" />

      <dl className="study__facts">
        {study.facts.map((f) => (
          <div key={f.label} className="study__fact">
            <dt className="study__label">{f.label}</dt>
            <dd className="study__value">{f.value}</dd>
          </div>
        ))}
      </dl>

      {study.sections.map((s) => (
        <StudySection key={s.heading} section={s} />
      ))}
    </div>
  );
}

function StudySection({ section: s }: { section: Section }) {
  return (
    <section className="study__section">
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
            {Array.from({ length: g.shots }, (_, i) => (
              <span key={i} className="shot shot--screen" />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
