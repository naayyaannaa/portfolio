const NAV = [
  { label: "Home", href: "#home", cls: "tab--home" },
  { label: "About", href: "#about", cls: "tab--about" },
  { label: "Work", href: "#work", cls: "tab--work" },
  { label: "Writing", href: "#writing", cls: "tab--writing" },
  { label: "Contact", href: "#contact", cls: "tab--contact" },
];

export default function Home() {
  return (
    <div className="page">
      {/* spiral coil binding */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="coil" src="/coil.svg" alt="" aria-hidden="true" />

      {/* sticky-note navigation */}
      <nav className="tabs" aria-label="Primary">
        {NAV.map((item) => (
          <a key={item.label} href={item.href} className={`tab ${item.cls}`}>
            {item.label}
          </a>
        ))}
      </nav>

      {/* hero */}
      <main className="hero" id="home">
        <span className="eyebrow">welcome to my notebook</span>
        <h1 className="title">
          Hi, I&apos;m
          <span className="accent">Nayana</span>
        </h1>
        <p className="lede">
          Designer &amp; developer scribbling{" "}
          <span className="marker">ideas into interfaces</span>. Flip through the
          tabs to see what I&apos;ve been making.
        </p>
        <p className="signature">— pull a tab, take a look →</p>
      </main>
    </div>
  );
}
