"use client";

import { useState } from "react";

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

const SLIDES = [
  { id: "home", title: "Home", color: "#FF2E77", ink: "#000000" },
  { id: "uiux", title: "UI/UX", color: "#31FF2E", ink: "#000000" },
  { id: "touchdesigner", title: "Touch-designer", color: "#FF2E2E", ink: "#000000" },
  { id: "other", title: "Other", color: "#FFFC2E", ink: "#000000" },
  { id: "contact", title: "Contact", color: "#283EFF", ink: "#FFFFFF" },
];

/* Always two rows, with the extra item on the first — matches the deck:
   5 items -> 3 + 2, 4 -> 2 + 2, 2 -> 1 + 1. Each row is flush right. */
function splitRows(items: string[]) {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)].filter((r) => r.length > 0);
}

export default function Page() {
  const [ribbon, setRibbon] = useState("Contact");
  const [slide, setSlide] = useState("home");

  const panel = RIBBON.find((r) => r.label === ribbon);

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
                  aria-current={slide === s.id ? "true" : undefined}
                  onClick={() => setSlide(s.id)}
                >
                  {s.title}
                </button>
              </div>
            ))}
          </div>
        </nav>

        {/* the slide */}
        <main className="stage">
          <article className="slide">
            <div className="slide__scroll">
              {slide === "home" && (
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
              {slide === "uiux" && (
                <Split
                  title="UI/UX"
                  body={
                    <>
                      Interfaces built to be used, not just looked at. Product work,
                      design systems, and the odd side quest.
                    </>
                  }
                />
              )}
              {slide === "touchdesigner" && (
                <Split
                  title="Touch-designer"
                  body={
                    <>
                      Real-time visuals and generative systems that react to sound,
                      motion and people.
                    </>
                  }
                />
              )}
              {slide === "other" && (
                <Split
                  title="Other"
                  body={
                    <>
                      Print, type, photography, and everything that refuses to sit in
                      a neat folder.
                    </>
                  }
                />
              )}
              {slide === "contact" && (
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
              )}
            </div>
          </article>
        </main>
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
