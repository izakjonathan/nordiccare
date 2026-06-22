import Image from "next/image";

type Service = { name: string; price: string };
type Extra = { name: string; price: string };
type Package = { title: string; price: string; items: string[]; icon: "shield" | "diamond" | "crown" | "laurel" };

const services: Service[] = [
  { name: "Udvendig håndvask", price: "249 kr." },
  { name: "Indvendig rengøring", price: "399 kr." },
  { name: "Komplet rengøring inde & ude", price: "599 kr." },
  { name: "Sæderens (stof)", price: "499 kr." },
  { name: "Læderrens og pleje", price: "599 kr." },
  { name: "Motorrumsrens", price: "299 kr." },
  { name: "Fælgrens og dækpleje", price: "199 kr." },
  { name: "Lakrens", price: "699 kr." },
  { name: "1-trins polering", price: "1.499 kr." },
  { name: "2-trins polering", price: "2.499 kr." },
  { name: "Keramisk coating", price: "3.999 kr." },
  { name: "Fjernelse af hundehår", price: "299 kr." },
  { name: "Lugtfjernelse / Ozonbehandling", price: "499 kr." }
];

const extras: Extra[] = [
  { name: "Ekstra beskidt bil", price: "+200 - 500 kr." },
  { name: "Stor SUV / Varevogn", price: "+300 kr." },
  { name: "Dyrehår", price: "+299 kr." },
  { name: "Tjære- og flyverustbehandling", price: "+399 kr." }
];

const packages: Package[] = [
  {
    title: "Basis pakke",
    price: "599 kr.",
    icon: "shield",
    items: ["Udvendig håndvask", "Støvsugning", "Aftørring af kabine", "Rudepudsning"]
  },
  {
    title: "Premium pakke",
    price: "1.199 kr.",
    icon: "diamond",
    items: ["Komplet rengøring inde & ude", "Fælgrens", "Dækpleje", "Lakforsegling"]
  },
  {
    title: "Deluxe pakke",
    price: "2.499 kr.",
    icon: "crown",
    items: ["Komplet rengøring", "1-trins polering", "Lakforsegling", "Fælgrens og dækpleje"]
  },
  {
    title: "Ultimate pakke",
    price: "5.999 kr.",
    icon: "laurel",
    items: ["Komplet rengøring", "2-trins polering", "Keramisk coating", "Fælgrens", "Dækpleje", "Lakbeskyttelse"]
  }
];

const qualities = [
  { title: "Kvalitet i topklasse", icon: "badge" },
  { title: "Detaljer der gør forskellen", icon: "spark" },
  { title: "Personlig service", icon: "handshake" },
  { title: "Tilfredshed garanteret", icon: "shield" }
];

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const common = "fill-none stroke-current stroke-[1.6] stroke-linecap-round stroke-linejoin-round";
  if (name === "shield") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path className={common} d="M32 6 52 14v14c0 15-8.6 25-20 30C20.6 53 12 43 12 28V14L32 6Z" />
        <path className="fill-current" d="m32 20 3.1 6.3 7 1-5 4.9 1.2 6.9-6.3-3.3-6.3 3.3 1.2-6.9-5-4.9 7-1L32 20Z" />
      </svg>
    );
  }
  if (name === "diamond") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path className={common} d="M12 22 22 10h20l10 12-20 34L12 22Z" />
        <path className={common} d="M12 22h40M22 10l10 46 10-46M22 10l-3 12 13 34 13-34-3-12" />
      </svg>
    );
  }
  if (name === "crown") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path className={common} d="m10 48 6-30 12 16 8-22 8 22 12-16 6 30H10Z" />
        <path className={common} d="M14 56h44M18 48h36" />
        <circle className={common} cx="16" cy="18" r="3" />
        <circle className={common} cx="36" cy="12" r="3" />
        <circle className={common} cx="56" cy="18" r="3" />
      </svg>
    );
  }
  if (name === "laurel") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path className={common} d="M22 10C12 18 8 28 10 42c1 7 5 12 12 16" />
        <path className={common} d="M42 10c10 8 14 18 12 32-1 7-5 12-12 16" />
        {[16, 24, 32, 40, 48].map((y) => (
          <g key={y}>
            <path className={common} d={`M${18 - y / 10} ${y}c-5 0-8-2-10-5 5 0 9 1 12 5Z`} />
            <path className={common} d={`M${46 + y / 10} ${y}c5 0 8-2 10-5-5 0-9 1-12 5Z`} />
          </g>
        ))}
      </svg>
    );
  }
  if (name === "badge") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path className={common} d="M32 6 38 12l8-1 3 8 7 5-4 8 4 8-7 5-3 8-8-1-6 6-6-6-8 1-3-8-7-5 4-8-4-8 7-5 3-8 8 1 6-6Z" />
        <path className={common} d="m22 33 7 7 14-17" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path className={common} d="M30 6c4 15 9 20 24 24-15 4-20 9-24 24-4-15-9-20-24-24 15-4 20-9 24-24Z" />
        <path className={common} d="M50 4c2 7 4 9 11 11-7 2-9 4-11 11-2-7-4-9-11-11 7-2 9-4 11-11Z" />
      </svg>
    );
  }
  if (name === "handshake") {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path className={common} d="m25 35 7 7c2 2 5 2 7 0l13-13" />
        <path className={common} d="M12 25 24 13l11 11-12 12L12 25Zm40 0L40 13l-9 9 17 17 4-4c3-3 3-7 0-10Z" />
        <path className={common} d="m20 39 8 8m-2-14 9 9m-3-15 10 10" />
      </svg>
    );
  }
  if (name === "phone") {
    return <svg viewBox="0 0 24 24" className={className}><path className={common} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1.1.4 2.2.7 3.2a2 2 0 0 1-.5 2.1L8.1 10.2a16 16 0 0 0 5.7 5.7l1.2-1.2a2 2 0 0 1 2.1-.5c1 .3 2.1.6 3.2.7a2 2 0 0 1 1.7 2Z" /></svg>;
  }
  if (name === "mail") {
    return <svg viewBox="0 0 24 24" className={className}><path className={common} d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path className={common} d="m22 6-10 7L2 6" /></svg>;
  }
  return null;
}

function PriceRows({ rows }: { rows: Service[] | Extra[] }) {
  return (
    <div className="divide-y divide-gold/18">
      {rows.map((row) => (
        <div key={row.name} className="flex items-start justify-between gap-5 py-2.5 text-[0.94rem] leading-tight sm:text-base">
          <span className="text-stone-100/90">{row.name}</span>
          <span className="shrink-0 text-right font-medium tracking-wide text-stone-100/90">{row.price}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-stone-50">
      <div className="splash-screen" aria-hidden="true">
        <Image src="/images/nordic-logo-splash.jpeg" alt="" fill priority sizes="100vw" className="object-cover" />
      </div>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(180,116,59,.25),transparent_34%),linear-gradient(180deg,#0b0a09_0%,#030303_100%)]" />
      <div className="noise fixed inset-0 -z-10 opacity-35" />

      <section className="relative flex min-h-[100svh] items-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="absolute inset-0 opacity-30">
          <Image src="/images/nordic-brand-services.jpeg" alt="Sort luksusbil" fill priority sizes="100vw" className="object-cover object-left-bottom" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/80 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/90" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative z-10 flex min-h-[76svh] flex-col justify-between pt-8 lg:min-h-[82vh]">
            <div>
              <div className="mx-auto mb-8 w-full max-w-[21rem] lg:mx-0">
                <Image src="/images/nordic-logo-splash.jpeg" alt="Nordic Auto Care logo" width={709} height={1536} priority className="h-auto w-full rounded-[2rem] object-cover shadow-[0_0_60px_rgba(188,126,70,.22)]" />
              </div>
              <p className="text-center text-[0.78rem] uppercase tracking-[0.54em] text-stone-200 lg:text-left">Din bil i bedste hænder</p>
              <div className="mx-auto mt-4 h-px w-48 bg-gold/70 lg:mx-0" />
              <p className="mt-4 text-center text-sm uppercase tracking-[0.42em] text-gold lg:text-left">Kvalitet · Omhu · Tillid</p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 rounded-2xl border border-gold/35 bg-black/45 p-3 backdrop-blur sm:max-w-2xl lg:max-w-xl">
              {qualities.slice(0, 3).map((item) => (
                <div key={item.title} className="flex min-h-28 flex-col items-center justify-center gap-2 border-r border-gold/20 px-2 text-center last:border-r-0">
                  <Icon name={item.icon} className="h-9 w-9 text-gold" />
                  <span className="text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.22em] text-gold sm:text-xs">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative z-10 rounded-[2rem] border border-gold/40 bg-black/64 p-5 shadow-[0_25px_90px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-7 lg:p-8">
            <p className="eyebrow">Book din tid i dag</p>
            <h1 className="mt-3 text-4xl font-semibold uppercase leading-none tracking-[0.18em] text-gold sm:text-5xl">Nordic Auto Care</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-200/82">Professionel bilpleje med fokus på grundig rengøring, polering, lakbeskyttelse og personlig service.</p>

            <div className="mt-8 grid gap-3">
              <a href="tel:+4581912674" className="contact-card group">
                <Icon name="phone" className="h-5 w-5 text-gold transition group-hover:scale-110" />
                <span>81912674</span>
              </a>
              <a href="mailto:nordicacare.2026@gmail.com" className="contact-card group">
                <Icon name="mail" className="h-5 w-5 text-gold transition group-hover:scale-110" />
                <span>nordicacare.2026@gmail.com</span>
              </a>
              <div className="contact-card">
                <span className="grid h-5 w-5 place-items-center text-lg text-gold">◷</span>
                <span>Åben 8-20 hver dag</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pakker" className="gold-button">Se pakker</a>
              <a href="#priser" className="outline-button">Prisoversigt</a>
            </div>
          </aside>
        </div>
      </section>

      <section id="priser" className="relative px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="eyebrow">Prisoversigt</p>
            <h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.22em] text-gold sm:text-5xl">Kvalitet i hver detalje</h2>
          </div>

          <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
            <div className="panel p-5 sm:p-6">
              <h3 className="panel-title">Enkelt ydelser</h3>
              <PriceRows rows={services} />
              <p className="mt-6 text-sm leading-6 text-gold/86">Priserne er fra-priser og kan variere afhængigt af bilens størrelse og stand.</p>

              <div className="mt-9">
                <h3 className="panel-title">Tillæg</h3>
                <PriceRows rows={extras} />
              </div>
            </div>

            <div id="pakker" className="grid gap-4">
              <h3 className="panel-title mb-0">Pakkeløsninger</h3>
              {packages.map((pack) => (
                <article key={pack.title} className="package-card">
                  <div className="flex items-center gap-5">
                    <Icon name={pack.icon} className="h-16 w-16 shrink-0 text-gold sm:h-20 sm:w-20" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-xl font-semibold uppercase tracking-[0.14em] text-gold sm:text-2xl">{pack.title}</h4>
                        <p className="text-2xl font-bold tracking-wide text-gold sm:text-3xl">{pack.price}</p>
                      </div>
                      <ul className="mt-3 grid gap-1.5 text-sm leading-5 text-stone-100/86 sm:text-base">
                        {pack.items.map((item) => (
                          <li key={item} className="flex gap-2"><span className="text-gold">•</span><span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-gold/35 bg-black/55 shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur">
          <div className="grid lg:grid-cols-[.82fr_1.18fr]">
            <div className="relative min-h-[22rem] lg:min-h-full">
              <Image src="/images/nordic-brand-services.jpeg" alt="Nordic Auto Care flyer med bil" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-left" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />
            </div>
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="eyebrow">Vores ydelser</p>
              <h2 className="mt-3 text-3xl font-semibold uppercase tracking-[0.18em] text-gold sm:text-4xl">Alt til bilen samlet ét sted</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {["Indvendig & udvendig klargøring", "Lakbehandling", "Polering & lakforsegling", "Rens af sæder & kabine", "Lugtfjernelse", "Og meget mere"].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-gold/18 bg-white/[0.025] p-4">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/70 text-xs text-gold">✓</span>
                    <span className="text-stone-100/86">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-9 rounded-2xl border border-gold/28 bg-gold/[0.06] p-5 text-center">
                <p className="text-lg font-semibold uppercase tracking-[0.2em] text-gold">Din tilfredshed er vores prioritet</p>
                <p className="mt-3 text-stone-200/80">Vi går ikke på kompromis med kvaliteten. Er du ikke 100% tilfreds, så finder vi en løsning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-5 pb-8 pt-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl border border-gold/25 bg-black/55 px-5 py-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gold">Nordic Auto Care</p>
            <p className="mt-1 text-sm text-stone-300/70">Tak for din tid og tillid</p>
          </div>
          <a href="tel:+4581912674" className="gold-button">Ring og book</a>
        </div>
      </footer>
    </main>
  );
}
