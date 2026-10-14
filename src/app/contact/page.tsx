import Image from "next/image";

const phones = [
  { city: "Cairo", display: "+20 106 168 0854", href: "tel:+201061680854" },
  { city: "Calgary", display: "+1 587 917 4538", href: "tel:+15879174538" },
  { city: "Den Haag", display: "+31 6 47 29 69 78", href: "tel:+31647296978" },
] as const;

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 3.5h7l4 4v13h-11v-17Z" />
      <path d="M13.5 3.5v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.8 4.5 6.1c-.5.5-.5 1.4-.2 2.2 2 5 5.5 8.5 10.5 10.5.8.3 1.7.3 2.2-.2l2.3-2.7-4-2.7-1.8 1.8a12.5 12.5 0 0 1-4.6-4.6l1.8-1.8-3.5-4.8Z" /></svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M6.5 16c.5-2 1.3-3 2.5-3s2 .9 2.5 3M14 9h3.5M14 13h3.5" /></svg>
  );
}

type DivisionCardProps = {
  number: string;
  division: string;
  websiteHref: string;
  profileHref: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  tone: "produce" | "herbs";
};

function DivisionCard({
  number,
  division,
  websiteHref,
  profileHref,
  imageSrc,
  imageAlt,
  imagePosition,
  tone,
}: DivisionCardProps) {
  const title = `AGRICA ${division}`;

  return (
    <article className={`division-card division-card--${tone}`}>
      <div className="division-copy">
        <span className="division-number">{number}</span>
        <h2><span>AGRICA</span>{division}</h2>
      </div>
      <div className="division-image">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 767px) 48vw, 310px"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <nav className="division-links" aria-label={`${title} links`}>
        <a className="division-link division-link--primary" href={websiteHref}>
          <GlobeIcon />
          <span>Website</span>
          <span className="link-arrow" aria-hidden="true">→</span>
        </a>
        <a
          className="division-link division-link--secondary"
          href={profileHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} company profile PDF`}
        >
          <DocumentIcon />
          <span>Company <span className="profile-word">Profile</span></span>
          <span className="link-arrow" aria-hidden="true">→</span>
        </a>
      </nav>
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
        <span aria-hidden="true" />
      </header>

      <section className="division-list" aria-label="AGRICA business divisions">
        <DivisionCard
          number="01"
          division="Produce"
          websiteHref="/en"
          profileHref="/contact/AGRICA-Produce-Company-Profile.pdf"
          imageSrc="/assets/products/fresh/oranges.avif"
          imageAlt="Fresh AGRICA oranges"
          imagePosition="52% 50%"
          tone="produce"
        />
        <DivisionCard
          number="02"
          division="Herbs & Spices"
          websiteHref="/en/herbs-spices"
          profileHref="/contact/AGRICA-Herbs-Spices-Company-Profile.pdf"
          imageSrc="/assets/herbs-spices/home/hero-primary.webp"
          imageAlt="AGRICA herbs and spices"
          imagePosition="50% 58%"
          tone="herbs"
        />
      </section>

      <nav className="contact-actions" aria-label="Contact AGRICA">
        <details className="phone-menu">
          <summary><span className="action-icon"><PhoneIcon /></span><span>Call</span></summary>
          <div className="phone-options">
            <p>Select an office</p>
            {phones.map((phone) => (
              <a href={phone.href} key={phone.city}><span>{phone.city}</span><strong>{phone.display}</strong></a>
            ))}
          </div>
        </details>
        <a href="mailto:info@agriculturecairo.com"><span className="action-icon"><MailIcon /></span><span>Email</span></a>
        <a href="/contact/AGRICA.vcf" download><span className="action-icon"><ContactIcon /></span><span>Save Contact</span></a>
      </nav>

      <footer className="connect-footer">
        <span>Rooted in Egypt. Connected worldwide.</span>
      </footer>
    </main>
  );
}
