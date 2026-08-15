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
    label: "Stack",
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
  intro: string;
  facts: { label: string; value: string }[];
  sections: Section[];
};

type Slide = {
  id: string;
  title: string;
  color: string;
  ink: string;
  accent: string;
  strokeColor?: string;
  heading?: string;
  projects?: string[];
  cards?: CardBox[];
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

const SLIDES: Slide[] = [
  { id: "home", title: "Home", color: "#FF2E77", ink: "#000000", accent: "#FF2E77" },
  {
    id: "uiux",
    title: "UI/UX",
    color: "#31FF2E",
    ink: "#000000",
    accent: "#3DC83B",
    heading: "UI/UX work",
    cards: UIUX_CARDS,
  },
  {
    id: "touchdesigner",
    title: "Touch-designer",
    color: "#FF2E2E",
    ink: "#000000",
    accent: "#FF2E2E",
    heading: "TouchDesigner work",
    projects: ["project name", "project name", "project name"],
  },
  {
    id: "other",
    title: "Other",
    color: "#FFFC2E",
    ink: "#000000",
    accent: "#FFFC2E",
    strokeColor: "#000000",
    heading: "Other work",
    cards: COLLAGE,
  },
  {
    id: "contact",
    title: "Contact",
    color: "#283EFF",
    ink: "#FFFFFF",
    accent: "#283EFF",
  },
];

/* Cards sit at staggered heights across the row, measured off the deck.
   Cycles if there are more than three projects. */
const STAGGER = [0, 31, 13];

/* Always two rows, with the extra item on the first — matches the deck:
   5 items -> 3 + 2, 4 -> 2 + 2, 2 -> 1 + 1. Each row is flush right. */
function splitRows(items: string[]) {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)].filter((r) => r.length > 0);
}

export default function Page() {
  const [ribbon, setRibbon] = useState("Contact");
  const [slideId, setSlideId] = useState("uiux");
  const [project, setProject] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* The frame is a literal 1280x720 so every value matches Figma exactly;
     scale it as a whole to fit the window. */
  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
      document.documentElement.style.setProperty("--fit", String(s));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const panel = RIBBON.find((r) => r.label === ribbon);
  const slide = SLIDES.find((s) => s.id === slideId) ?? SLIDES[0];

  const accentVars = {
    "--accent": slide.accent,
    "--accent-stroke": slide.strokeColor ?? "transparent",
    "--accent-stroke-width": slide.strokeColor ? "1px" : "0",
  } as React.CSSProperties;

  const goto = (id: string) => {
    setSlideId(id);
    setProject(null);
  };

  return (
    <div className="frame">
      {/* ---------- header ---------- */}
      <header className="header">
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

      {/* ---------- body ---------- */}
      <div className="body">
        {/* slide overview rail = primary nav */}
        <nav className="rail" aria-label="Slides">
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
        </nav>

        {/* the slide */}
        <main className="stage">
          <article className="slide" style={accentVars}>
            <div className="slide__scroll" ref={scrollRef}>
              {project !== null && (slide.cards || slide.projects) ? (
                <ProjectDetail
                  name={
                    slide.cards?.[project]?.name ??
                    slide.projects?.[project] ??
                    "project"
                  }
                  index={project}
                  study={slide.cards?.[project]?.study}
                  onBack={() => setProject(null)}
                />
              ) : slide.cards ? (
                <CollageSlide
                  heading={slide.heading ?? slide.title}
                  cards={slide.cards}
                  onOpen={setProject}
                />
              ) : slide.projects ? (
                <WorkSlide
                  heading={slide.heading ?? slide.title}
                  projects={slide.projects}
                  onOpen={setProject}
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
                      multidisciplinary designer that loves experimenting with all
                      things creative. Welcome to my gallery of work.
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

/* Grid layout — TouchDesigner keeps this. */
function WorkSlide({
  heading,
  projects,
  onOpen,
}: {
  heading: string;
  projects: string[];
  onOpen: (i: number) => void;
}) {
  return (
    <div className="work">
      <h1 className="work__title">{heading}</h1>
      <ul className="work__grid">
        {projects.map((name, i) => (
          <li
            key={i}
            className="work__cell"
            style={{ "--stagger": `${STAGGER[i % STAGGER.length]}px` } as React.CSSProperties}
          >
            <button type="button" className="card" onClick={() => onOpen(i)}>
              {/* project image goes here */}
              <span className="card__media" />
              <span className="card__name">
                ({i + 1}) {name}
              </span>
            </button>
          </li>
        ))}
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

function ProjectDetail({
  name,
  index,
  study,
  onBack,
}: {
  name: string;
  index: number;
  study?: Study;
  onBack: () => void;
}) {
  return (
    <div className="detail">
      <button type="button" className="detail__back" onClick={onBack}>
        ← back
      </button>
      <h1 className="detail__title">
        ({index + 1}) {name}
      </h1>
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
