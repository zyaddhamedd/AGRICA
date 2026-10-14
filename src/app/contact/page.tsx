import Image from "next/image";
import type { ReactNode } from "react";

const phones = [
  { city: "Cairo", display: "+20 106 168 0854", href: "tel:+201061680854" },
  { city: "Calgary", display: "+1 587 917 4538", href: "tel:+15879174538" },
  { city: "Den Haag", display: "+31 6 47 29 69 78", href: "tel:+31647296978" },
] as const;

function ProduceIllustration() {
  return (
    <svg viewBox="0 0 180 126" role="img" aria-label="Citrus fruit and leaves">
      <path className="illustration-line" d="M91 32c10-13 22-19 38-18-2 15-14 25-36 25" />
      <path className="illustration-leaf" d="M94 32c8-12 19-16 33-16-5 11-16 18-33 16Z" />
      <path className="illustration-line" d="M84 39c5-10 6-18 3-27" />
      <circle className="illustration-fruit" cx="71" cy="72" r="36" />
      <circle className="illustration-fruit illustration-fruit--small" cx="119" cy="80" r="25" />
      <path className="illustration-detail" d="M48 72h46M71 49v46M55 56l32 32M87 56 55 88" />
      <circle className="illustration-seed" cx="71" cy="72" r="4" />
    </svg>
  );
}

function HerbsIllustration() {
  return (
    <svg viewBox="0 0 180 126" role="img" aria-label="Herb sprig and spice seeds">
      <path className="illustration-line" d="M56 107c17-18 29-41 38-72" />
      <path className="illustration-leaf" d="M81 66c-19 1-29-6-31-21 17-2 28 5 31 21Z" />
      <path className="illustration-leaf" d="M88 50c1-18 10-27 26-28 1 15-8 25-26 28Z" />
      <path className="illustration-leaf" d="M69 87c-16 2-25-4-28-17 15-3 24 3 28 17Z" />
      <path className="illustration-leaf" d="M78 74c3 16 13 23 29 21 0-14-10-21-29-21Z" />
      <circle className="illustration-seed" cx="127" cy="81" r="7" />
      <circle className="illustration-seed" cx="144" cy="94" r="5" />
      <circle className="illustration-seed illustration-seed--outline" cx="128" cy="105" r="4" />
    </svg>
  );
}

type DivisionCardProps = {
  number: string;
  title: string;
  websiteHref: string;
  profileHref: string;
  illustration: ReactNode;
};

function DivisionCard({ number, title, websiteHref, profileHref, illustration }: DivisionCardProps) {
  return (
    <article className="division-card">
      <div className="division-art">{illustration}</div>
      <div className="division-content">
        <div className="division-heading">
          <span>{number}</span>
          <h2>{title}</h2>
        </div>
        <nav className="division-links" aria-label={title + " links"}>
          <a href={websiteHref}>Website <span aria-hidden="true">↗</span></a>
          <a href={profileHref} target="_blank" rel="noopener noreferrer">
            Company Profile <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </article>
  );
}

export default function AgricaConnectPage() {
  return (
    <main className="connect-page">
      <header className="connect-header">
        <a className="connect-brand" href="/en" aria-label="AGRICA English homepage">
          <Image src="/assets/agrica-logo-brand.png" alt="AGRICA" width={800} height={206} priority />
        </a>
        <p>Egyptian Agricultural Exports</p>
      </header>
      <section className="connect-intro" aria-labelledby="connect-title">
        <p className="connect-kicker"><span aria-hidden="true" />Official digital contact</p>
        <h1 id="connect-title">Choose your division.</h1>
      </section>
      <section className="division-list" aria-label="AGRICA business divisions">
        <DivisionCard number="01" title="AGRICA Produce" websiteHref="/en" profileHref="/contact/AGRICA-Produce-Company-Profile.pdf" illustration={<ProduceIllustration />} />
        <DivisionCard number="02" title="AGRICA Herbs & Spices" websiteHref="/en/herbs-spices" profileHref="/contact/AGRICA-Herbs-Spices-Company-Profile.pdf" illustration={<HerbsIllustration />} />
      </section>
      <nav className="contact-actions" aria-label="Contact AGRICA">
        <details className="phone-menu">
          <summary><span className="action-icon" aria-hidden="true">☎</span><span>Call</span></summary>
          <div className="phone-options">
            <p>Select an office</p>
            {phones.map((phone) => (
              <a href={phone.href} key={phone.city}><span>{phone.city}</span><strong>{phone.display}</strong></a>
            ))}
          </div>
        </details>
        <a href="mailto:info@agriculturecairo.com"><span className="action-icon" aria-hidden="true">@</span><span>Email</span></a>
        <a href="/contact/AGRICA.vcf" download><span className="action-icon action-icon--save" aria-hidden="true">↓</span><span>Save Contact</span></a>
      </nav>
      <footer className="connect-footer">
        <span>Rooted in Egypt. Connected worldwide.</span>
      </footer>
    </main>
  );
}
