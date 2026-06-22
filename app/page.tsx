"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Service = { id: string; name: string; price: number; note?: string };
type Extra = { id: string; name: string; price: number; note?: string };
type CarePackage = { id: string; title: string; price: number; items: string[]; icon: "shield" | "diamond" | "crown" | "laurel" };
type CarEntry = { id: string; type: string; makeModel: string; reg: string; packageId: string; services: string[]; extras: string[]; notes: string };
type CustomerInfo = { name: string; phone: string; email: string; address: string };
type InvoiceInfo = { invoiceType: string; company: string; cvr: string; invoiceEmail: string; invoiceAddress: string };
type OrderStatus = "Ny" | "Kontaktet" | "Bekræftet" | "I gang" | "Færdig" | "Faktureret" | "Annulleret";
type Order = {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  invoice: InvoiceInfo;
  preferredDate: string;
  preferredTime: string;
  cars: CarEntry[];
  status: OrderStatus;
  adminDate: string;
  adminTime: string;
  adminNotes: string;
  customerMessage: string;
};

const STORAGE_KEY = "nordic-auto-care-orders-v1";

const services: Service[] = [
  { id: "handwash", name: "Udvendig håndvask", price: 249 },
  { id: "inside", name: "Indvendig rengøring", price: 399 },
  { id: "complete", name: "Komplet rengøring inde & ude", price: 599 },
  { id: "fabric", name: "Sæderens (stof)", price: 499 },
  { id: "leather", name: "Læderrens og pleje", price: 599 },
  { id: "engine", name: "Motorrumsrens", price: 299 },
  { id: "wheels", name: "Fælgrens og dækpleje", price: 199 },
  { id: "paintclean", name: "Lakrens", price: 699 },
  { id: "one-step", name: "1-trins polering", price: 1499 },
  { id: "two-step", name: "2-trins polering", price: 2499 },
  { id: "ceramic", name: "Keramisk coating", price: 3999 },
  { id: "hair", name: "Fjernelse af hundehår", price: 299 },
  { id: "odor", name: "Lugtfjernelse / Ozonbehandling", price: 499 }
];

const extras: Extra[] = [
  { id: "dirty", name: "Ekstra beskidt bil", price: 200, note: "fra 200 kr." },
  { id: "suv", name: "Stor SUV / Varevogn", price: 300 },
  { id: "pet", name: "Dyrehår", price: 299 },
  { id: "tar", name: "Tjære- og flyverustbehandling", price: 399 }
];

const packages: CarePackage[] = [
  { id: "basis", title: "Basis pakke", price: 599, icon: "shield", items: ["Udvendig håndvask", "Støvsugning", "Aftørring af kabine", "Rudepudsning"] },
  { id: "premium", title: "Premium pakke", price: 1199, icon: "diamond", items: ["Komplet rengøring inde & ude", "Fælgrens", "Dækpleje", "Lakforsegling"] },
  { id: "deluxe", title: "Deluxe pakke", price: 2499, icon: "crown", items: ["Komplet rengøring", "1-trins polering", "Lakforsegling", "Fælgrens og dækpleje"] },
  { id: "ultimate", title: "Ultimate pakke", price: 5999, icon: "laurel", items: ["Komplet rengøring", "2-trins polering", "Keramisk coating", "Fælgrens", "Dækpleje", "Lakbeskyttelse"] }
];

const statuses: OrderStatus[] = ["Ny", "Kontaktet", "Bekræftet", "I gang", "Færdig", "Faktureret", "Annulleret"];
const qualities = [
  { title: "Kvalitet i topklasse", icon: "badge" },
  { title: "Detaljer der gør forskellen", icon: "spark" },
  { title: "Personlig service", icon: "handshake" }
];

const emptyCustomer: CustomerInfo = { name: "", phone: "", email: "", address: "" };
const emptyInvoice: InvoiceInfo = { invoiceType: "Privat", company: "", cvr: "", invoiceEmail: "", invoiceAddress: "" };
const makeCar = (): CarEntry => ({ id: cryptoId(), type: "Personbil", makeModel: "", reg: "", packageId: "basis", services: [], extras: [], notes: "" });

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function kr(value: number) {
  return `${value.toLocaleString("da-DK")} kr.`;
}

function carTotal(car: CarEntry) {
  const pack = packages.find((item) => item.id === car.packageId);
  const packageTotal = pack ? pack.price : 0;
  const serviceTotal = car.services.reduce((sum, id) => sum + (services.find((item) => item.id === id)?.price ?? 0), 0);
  const extraTotal = car.extras.reduce((sum, id) => sum + (extras.find((item) => item.id === id)?.price ?? 0), 0);
  return packageTotal + serviceTotal + extraTotal;
}

function orderTotal(order: Pick<Order, "cars">) {
  return order.cars.reduce((sum, car) => sum + carTotal(car), 0);
}

function selectedNames(ids: string[], source: Array<{ id: string; name: string }>) {
  return ids.map((id) => source.find((item) => item.id === id)?.name).filter(Boolean).join(", ");
}

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const common = "fill-none stroke-current stroke-[1.6] stroke-linecap-round stroke-linejoin-round";
  if (name === "shield") return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path className={common} d="M32 6 52 14v14c0 15-8.6 25-20 30C20.6 53 12 43 12 28V14L32 6Z" /><path className="fill-current" d="m32 20 3.1 6.3 7 1-5 4.9 1.2 6.9-6.3-3.3-6.3 3.3 1.2-6.9-5-4.9 7-1L32 20Z" /></svg>;
  if (name === "diamond") return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path className={common} d="M12 22 22 10h20l10 12-20 34L12 22Z" /><path className={common} d="M12 22h40M22 10l10 46 10-46M22 10l-3 12 13 34 13-34-3-12" /></svg>;
  if (name === "crown") return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path className={common} d="m10 48 6-30 12 16 8-22 8 22 12-16 6 30H10Z" /><path className={common} d="M14 56h44M18 48h36" /><circle className={common} cx="16" cy="18" r="3" /><circle className={common} cx="36" cy="12" r="3" /><circle className={common} cx="56" cy="18" r="3" /></svg>;
  if (name === "laurel") return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path className={common} d="M22 10C12 18 8 28 10 42c1 7 5 12 12 16" /><path className={common} d="M42 10c10 8 14 18 12 32-1 7-5 12-12 16" /><path className={common} d="M15 21c-5 0-8-2-10-5 5 0 9 1 12 5Zm-3 9c-5 1-8-1-11-4 5-1 9 0 12 4Zm1 10c-4 3-8 2-12 0 4-3 8-3 12 0Zm7 10c-3 4-7 5-12 4 3-4 7-5 12-4Zm29-29c5 0 8-2 10-5-5 0-9 1-12 5Zm3 9c5 1 8-1 11-4-5-1-9 0-12 4Zm-1 10c4 3 8 2 12 0-4-3-8-3-12 0Zm-7 10c3 4 7 5 12 4-3-4-7-5-12-4Z" /></svg>;
  if (name === "badge") return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path className={common} d="M32 6 38 12l8-1 3 8 7 5-4 8 4 8-7 5-3 8-8-1-6 6-6-6-8 1-3-8-7-5 4-8-4-8 7-5 3-8 8 1 6-6Z" /><path className={common} d="m22 33 7 7 14-17" /></svg>;
  if (name === "spark") return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path className={common} d="M30 6c4 15 9 20 24 24-15 4-20 9-24 24-4-15-9-20-24-24 15-4 20-9 24-24Z" /><path className={common} d="M50 4c2 7 4 9 11 11-7 2-9 4-11 11-2-7-4-9-11-11 7-2 9-4 11-11Z" /></svg>;
  if (name === "handshake") return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path className={common} d="m25 35 7 7c2 2 5 2 7 0l13-13" /><path className={common} d="M12 25 24 13l11 11-12 12L12 25Zm40 0L40 13l-9 9 17 17 4-4c3-3 3-7 0-10Z" /><path className={common} d="m20 39 8 8m-2-14 9 9m-3-15 10 10" /></svg>;
  if (name === "phone") return <svg viewBox="0 0 24 24" className={className}><path className={common} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1.1.4 2.2.7 3.2a2 2 0 0 1-.5 2.1L8.1 10.2a16 16 0 0 0 5.7 5.7l1.2-1.2a2 2 0 0 1 2.1-.5c1 .3 2.1.6 3.2.7a2 2 0 0 1 1.7 2Z" /></svg>;
  if (name === "mail") return <svg viewBox="0 0 24 24" className={className}><path className={common} d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path className={common} d="m22 6-10 7L2 6" /></svg>;
  return null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-gold/90"><span>{label}</span>{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`form-input ${props.className ?? ""}`} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`form-input min-h-28 resize-none ${props.className ?? ""}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`form-input ${props.className ?? ""}`} />;
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>(emptyCustomer);
  const [invoice, setInvoice] = useState<InvoiceInfo>(emptyInvoice);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [cars, setCars] = useState<CarEntry[]>([makeCar()]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "Alle">("Alle");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [submittedId, setSubmittedId] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Order[];
        setOrders(parsed);
        setSelectedOrderId(parsed[0]?.id ?? "");
      }
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const draftTotal = useMemo(() => orderTotal({ cars }), [cars]);
  const filteredOrders = activeStatus === "Alle" ? orders : orders.filter((order) => order.status === activeStatus);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0];
  const kpis = useMemo(() => {
    const active = orders.filter((order) => !["Færdig", "Faktureret", "Annulleret"].includes(order.status));
    return {
      total: orders.length,
      active: active.length,
      confirmed: orders.filter((order) => order.status === "Bekræftet").length,
      value: orders.reduce((sum, order) => sum + orderTotal(order), 0)
    };
  }, [orders]);

  function updateCar(id: string, patch: Partial<CarEntry>) {
    setCars((current) => current.map((car) => car.id === id ? { ...car, ...patch } : car));
  }

  function toggleCarArray(carId: string, key: "services" | "extras", itemId: string) {
    setCars((current) => current.map((car) => {
      if (car.id !== carId) return car;
      const exists = car[key].includes(itemId);
      return { ...car, [key]: exists ? car[key].filter((id) => id !== itemId) : [...car[key], itemId] };
    }));
  }

  function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newOrder: Order = {
      id: `NAC-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      customer,
      invoice,
      preferredDate,
      preferredTime,
      cars,
      status: "Ny",
      adminDate: preferredDate,
      adminTime: preferredTime,
      adminNotes: "",
      customerMessage
    };
    setOrders((current) => [newOrder, ...current]);
    setSelectedOrderId(newOrder.id);
    setSubmittedId(newOrder.id);
    setCustomer(emptyCustomer);
    setInvoice(emptyInvoice);
    setPreferredDate("");
    setPreferredTime("");
    setCustomerMessage("");
    setCars([makeCar()]);
  }

  function updateOrder(id: string, patch: Partial<Order>) {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...patch } : order));
  }

  function deleteOrder(id: string) {
    setOrders((current) => current.filter((order) => order.id !== id));
    if (selectedOrderId === id) setSelectedOrderId(orders.find((order) => order.id !== id)?.id ?? "");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-stone-50">
      <div className="splash-screen" aria-hidden="true"><Image src="/images/nordic-logo-splash.jpeg" alt="" fill priority sizes="100vw" className="object-cover" /></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(180,116,59,.25),transparent_34%),linear-gradient(180deg,#0b0a09_0%,#030303_100%)]" />
      <div className="noise fixed inset-0 -z-10 opacity-35" />

      <nav className="sticky top-0 z-40 border-b border-gold/15 bg-black/72 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <a href="#top" className="text-xs font-black uppercase tracking-[0.26em] text-gold">NAC</a>
          <div className="flex gap-2 overflow-x-auto text-[0.68rem] font-black uppercase tracking-[0.14em] text-stone-200/80">
            <a className="nav-pill" href="#booking">Book</a>
            <a className="nav-pill" href="#priser">Priser</a>
            <a className="nav-pill" href="#admin">Backend</a>
          </div>
        </div>
      </nav>

      <section id="top" className="relative px-5 pb-8 pt-12 sm:px-8 lg:px-12 lg:pt-20">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(196,135,77,.18),transparent_55%)]" aria-hidden="true" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.02fr_.98fr]">
          <div className="relative z-10 flex flex-col justify-center gap-8 pt-4 lg:pt-0">
            <div>
              <p className="text-center text-[0.78rem] uppercase tracking-[0.54em] text-stone-200 lg:text-left">Din bil i bedste hænder</p>
              <div className="mx-auto mt-4 h-px w-48 bg-gold/70 lg:mx-0" />
              <p className="mt-4 text-center text-sm uppercase tracking-[0.42em] text-gold lg:text-left">Kvalitet · Omhu · Tillid</p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-gold/35 bg-black/45 p-3 backdrop-blur sm:max-w-2xl lg:max-w-xl">
              {qualities.map((item) => <div key={item.title} className="flex min-h-28 flex-col items-center justify-center gap-2 border-r border-gold/20 px-2 text-center last:border-r-0"><Icon name={item.icon} className="h-9 w-9 text-gold" /><span className="text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.22em] text-gold sm:text-xs">{item.title}</span></div>)}
            </div>
          </div>
          <aside className="relative z-10 rounded-[2rem] border border-gold/40 bg-black/64 p-5 shadow-[0_25px_90px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-7 lg:p-8">
            <p className="eyebrow">Book din tid i dag</p>
            <h1 className="mt-3 text-4xl font-semibold uppercase leading-none tracking-[0.18em] text-gold sm:text-5xl">Nordic Auto Care</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-200/82">Professionel bilpleje med bookingformular, ordrestyring og åben backend til at håndtere indkommende forespørgsler.</p>
            <div className="mt-8 grid gap-3">
              <a href="tel:+4581912674" className="contact-card group"><Icon name="phone" className="h-5 w-5 text-gold transition group-hover:scale-110" /><span>81912674</span></a>
              <a href="mailto:nordicacare.2026@gmail.com" className="contact-card group"><Icon name="mail" className="h-5 w-5 text-gold transition group-hover:scale-110" /><span>nordicacare.2026@gmail.com</span></a>
              <div className="contact-card"><span className="grid h-5 w-5 place-items-center text-lg text-gold">◷</span><span>Åben 8-20 hver dag</span></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#booking" className="gold-button">Start booking</a><a href="#admin" className="outline-button">Åben backend</a></div>
          </aside>
        </div>
      </section>

      <section id="booking" className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div><p className="eyebrow">Kunde booking</p><h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.18em] text-gold sm:text-5xl">Send forespørgsel</h2></div>
            <div className="panel px-5 py-4 text-right"><p className="text-xs uppercase tracking-[0.22em] text-stone-300/70">Estimeret total</p><p className="text-3xl font-black text-gold">{kr(draftTotal)}</p></div>
          </div>

          {submittedId && <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/[0.08] p-4 text-sm text-stone-100">Forespørgsel <strong className="text-gold">{submittedId}</strong> er oprettet i backend.</div>}

          <form onSubmit={submitRequest} className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="grid gap-5">
              {cars.map((car, index) => (
                <article key={car.id} className="panel p-5 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div><p className="eyebrow">Bil {index + 1}</p><h3 className="mt-2 text-2xl font-black uppercase tracking-[0.14em] text-gold">Vælg behandling</h3></div>
                    {cars.length > 1 && <button type="button" className="small-danger" onClick={() => setCars((current) => current.filter((item) => item.id !== car.id))}>Fjern</button>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Biltype"><Select value={car.type} onChange={(e) => updateCar(car.id, { type: e.target.value })}><option>Personbil</option><option>SUV</option><option>Varevogn</option><option>Elbil</option><option>Andet</option></Select></Field>
                    <Field label="Mærke / model"><TextInput value={car.makeModel} onChange={(e) => updateCar(car.id, { makeModel: e.target.value })} placeholder="BMW 320d" /></Field>
                    <Field label="Nummerplade"><TextInput value={car.reg} onChange={(e) => updateCar(car.id, { reg: e.target.value })} placeholder="AB 12 345" /></Field>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {packages.map((pack) => <button key={pack.id} type="button" onClick={() => updateCar(car.id, { packageId: pack.id })} className={car.packageId === pack.id ? "choice-card is-selected" : "choice-card"}><span><Icon name={pack.icon} className="h-9 w-9 text-gold" /></span><span className="min-w-0"><strong>{pack.title}</strong><em>{kr(pack.price)}</em></span></button>)}
                  </div>

                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <div><h4 className="mini-title">Ekstra enkelt ydelser</h4><div className="mt-3 grid gap-2">{services.map((service) => <label key={service.id} className="check-row"><input type="checkbox" checked={car.services.includes(service.id)} onChange={() => toggleCarArray(car.id, "services", service.id)} /><span>{service.name}</span><strong>{kr(service.price)}</strong></label>)}</div></div>
                    <div><h4 className="mini-title">Tillæg</h4><div className="mt-3 grid gap-2">{extras.map((extra) => <label key={extra.id} className="check-row"><input type="checkbox" checked={car.extras.includes(extra.id)} onChange={() => toggleCarArray(car.id, "extras", extra.id)} /><span>{extra.name}</span><strong>{extra.note ?? kr(extra.price)}</strong></label>)}</div><div className="mt-4"><Field label="Noter om bilen"><TextArea value={car.notes} onChange={(e) => updateCar(car.id, { notes: e.target.value })} placeholder="Stand, særlige ønsker, afhentning osv." /></Field></div></div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-gold/25 bg-black/35 p-4 text-right text-sm uppercase tracking-[0.16em] text-stone-300/80">Bil {index + 1} total <strong className="ml-3 text-xl text-gold">{kr(carTotal(car))}</strong></div>
                </article>
              ))}
              <button type="button" className="outline-button w-full" onClick={() => setCars((current) => [...current, makeCar()])}>+ Tilføj endnu en bil</button>
            </div>

            <aside className="grid content-start gap-5">
              <section className="panel p-5 sm:p-6"><h3 className="panel-title">Kontaktinformation</h3><div className="grid gap-4"><Field label="Navn"><TextInput required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Fulde navn" /></Field><Field label="Telefon"><TextInput required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="81912674" /></Field><Field label="Email"><TextInput type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="kunde@email.dk" /></Field><Field label="Adresse"><TextInput value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Adresse / område" /></Field></div></section>
              <section className="panel p-5 sm:p-6"><h3 className="panel-title">Dato & tid</h3><div className="grid grid-cols-2 gap-4"><Field label="Dato"><TextInput required type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} /></Field><Field label="Tid"><TextInput required type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} /></Field></div><div className="mt-4"><Field label="Besked"><TextArea value={customerMessage} onChange={(e) => setCustomerMessage(e.target.value)} placeholder="Skriv ønsket tidspunkt, spørgsmål eller afhentningsinfo." /></Field></div></section>
              <section className="panel p-5 sm:p-6"><h3 className="panel-title">Faktura</h3><div className="grid gap-4"><Field label="Type"><Select value={invoice.invoiceType} onChange={(e) => setInvoice({ ...invoice, invoiceType: e.target.value })}><option>Privat</option><option>Firma</option></Select></Field>{invoice.invoiceType === "Firma" && <><Field label="Firmanavn"><TextInput value={invoice.company} onChange={(e) => setInvoice({ ...invoice, company: e.target.value })} /></Field><Field label="CVR"><TextInput value={invoice.cvr} onChange={(e) => setInvoice({ ...invoice, cvr: e.target.value })} /></Field></>}<Field label="Faktura email"><TextInput type="email" value={invoice.invoiceEmail} onChange={(e) => setInvoice({ ...invoice, invoiceEmail: e.target.value })} placeholder="Hvis anden end kontakt email" /></Field><Field label="Faktura adresse"><TextInput value={invoice.invoiceAddress} onChange={(e) => setInvoice({ ...invoice, invoiceAddress: e.target.value })} /></Field></div></section>
              <button type="submit" className="gold-button w-full">Send forespørgsel</button>
            </aside>
          </form>
        </div>
      </section>

      <section id="priser" className="relative px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center"><p className="eyebrow">Prisoversigt</p><h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.22em] text-gold sm:text-5xl">Kvalitet i hver detalje</h2></div>
          <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
            <div className="panel p-5 sm:p-6"><h3 className="panel-title">Enkelt ydelser</h3><div className="divide-y divide-gold/18">{services.map((row) => <div key={row.id} className="flex items-start justify-between gap-5 py-2.5 text-[0.94rem] leading-tight sm:text-base"><span className="text-stone-100/90">{row.name}</span><span className="shrink-0 text-right font-medium tracking-wide text-stone-100/90">{kr(row.price)}</span></div>)}</div><p className="mt-6 text-sm leading-6 text-gold/86">Priserne er fra-priser og kan variere afhængigt af bilens størrelse og stand.</p><div className="mt-9"><h3 className="panel-title">Tillæg</h3><div className="divide-y divide-gold/18">{extras.map((row) => <div key={row.id} className="flex items-start justify-between gap-5 py-2.5 text-[0.94rem] leading-tight sm:text-base"><span className="text-stone-100/90">{row.name}</span><span className="shrink-0 text-right font-medium tracking-wide text-stone-100/90">{row.note ?? kr(row.price)}</span></div>)}</div></div></div>
            <div id="pakker" className="grid gap-4"><h3 className="panel-title mb-0">Pakkeløsninger</h3>{packages.map((pack) => <article key={pack.title} className="package-card"><div className="flex items-center gap-5"><Icon name={pack.icon} className="h-16 w-16 shrink-0 text-gold sm:h-20 sm:w-20" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-xl font-semibold uppercase tracking-[0.14em] text-gold sm:text-2xl">{pack.title}</h4><p className="text-2xl font-bold tracking-wide text-gold sm:text-3xl">{kr(pack.price)}</p></div><ul className="mt-3 grid gap-1.5 text-sm leading-5 text-stone-100/86 sm:text-base">{pack.items.map((item) => <li key={item} className="flex gap-2"><span className="text-gold">•</span><span>{item}</span></li>)}</ul></div></div></article>)}</div>
          </div>
        </div>
      </section>

      <section id="admin" className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="eyebrow">Åben backend</p><h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.18em] text-gold sm:text-5xl">Order Operations</h2><p className="mt-3 max-w-3xl text-stone-300/75">Ordresystemet er åbent for nu. Alle forespørgsler gemmes lokalt i browseren som første prototype.</p></div><a href="#booking" className="gold-button">Ny ordre</a></div>
          <div className="grid gap-4 sm:grid-cols-4">{[{ label: "Ordrer", value: kpis.total }, { label: "Aktive", value: kpis.active }, { label: "Bekræftet", value: kpis.confirmed }, { label: "Est. værdi", value: kr(kpis.value) }].map((item) => <div key={item.label} className="panel p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-400">{item.label}</p><p className="mt-2 text-2xl font-black text-gold">{item.value}</p></div>)}</div>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2"><button onClick={() => setActiveStatus("Alle")} className={activeStatus === "Alle" ? "filter-pill active" : "filter-pill"}>Alle</button>{statuses.map((status) => <button key={status} onClick={() => setActiveStatus(status)} className={activeStatus === status ? "filter-pill active" : "filter-pill"}>{status}</button>)}</div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div className="grid content-start gap-3">{filteredOrders.length === 0 && <div className="panel p-6 text-center text-stone-300/70">Ingen ordrer endnu.</div>}{filteredOrders.map((order) => <button key={order.id} type="button" onClick={() => setSelectedOrderId(order.id)} className={selectedOrder?.id === order.id ? "order-card is-active" : "order-card"}><div className="flex items-start justify-between gap-3"><span><strong>{order.customer.name || "Ukendt kunde"}</strong><em>{order.id} · {new Date(order.createdAt).toLocaleDateString("da-DK")}</em></span><b>{order.status}</b></div><div className="mt-3 grid grid-cols-3 gap-2 text-left text-xs uppercase tracking-[0.12em] text-stone-300/70"><span>{order.cars.length} bil(er)</span><span>{order.preferredDate}</span><span className="text-right text-gold">{kr(orderTotal(order))}</span></div></button>)}</div>
            <div className="panel min-h-[32rem] p-5 sm:p-6">{selectedOrder ? <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">{selectedOrder.id}</p><h3 className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-gold">{selectedOrder.customer.name || "Ordre"}</h3><p className="mt-2 text-stone-300/75">{selectedOrder.customer.phone} · {selectedOrder.customer.email || "ingen email"}</p></div><div className="text-left sm:text-right"><p className="text-xs uppercase tracking-[0.18em] text-stone-400">Total</p><p className="text-3xl font-black text-gold">{kr(orderTotal(selectedOrder))}</p></div></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3"><Field label="Status"><Select value={selectedOrder.status} onChange={(e) => updateOrder(selectedOrder.id, { status: e.target.value as OrderStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></Field><Field label="Dato"><TextInput type="date" value={selectedOrder.adminDate} onChange={(e) => updateOrder(selectedOrder.id, { adminDate: e.target.value })} /></Field><Field label="Tid"><TextInput type="time" value={selectedOrder.adminTime} onChange={(e) => updateOrder(selectedOrder.id, { adminTime: e.target.value })} /></Field></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="detail-box"><h4>Kunde</h4><p>{selectedOrder.customer.address || "Ingen adresse"}</p><p>{selectedOrder.customer.phone}</p><p>{selectedOrder.customer.email}</p></div><div className="detail-box"><h4>Faktura</h4><p>{selectedOrder.invoice.invoiceType}</p><p>{selectedOrder.invoice.company || "Privat kunde"}</p><p>{selectedOrder.invoice.cvr}</p><p>{selectedOrder.invoice.invoiceEmail || selectedOrder.customer.email}</p></div></div>
              <div className="mt-6 grid gap-4">{selectedOrder.cars.map((car, index) => { const pack = packages.find((item) => item.id === car.packageId); return <div key={car.id} className="detail-box"><div className="flex justify-between gap-3"><h4>Bil {index + 1} · {car.type}</h4><strong className="text-gold">{kr(carTotal(car))}</strong></div><p>{car.makeModel || "Model ikke angivet"} {car.reg && `· ${car.reg}`}</p><p><strong>Pakke:</strong> {pack?.title}</p>{car.services.length > 0 && <p><strong>Ekstra ydelser:</strong> {selectedNames(car.services, services)}</p>}{car.extras.length > 0 && <p><strong>Tillæg:</strong> {selectedNames(car.extras, extras)}</p>}{car.notes && <p><strong>Bilnote:</strong> {car.notes}</p>}</div>; })}</div>
              <div className="mt-6"><Field label="Interne noter"><TextArea value={selectedOrder.adminNotes} onChange={(e) => updateOrder(selectedOrder.id, { adminNotes: e.target.value })} placeholder="Aftaler, opfølgning, betaling, særlige forhold." /></Field></div>{selectedOrder.customerMessage && <div className="mt-4 detail-box"><h4>Kundebesked</h4><p>{selectedOrder.customerMessage}</p></div>}
              <div className="mt-6 flex flex-wrap gap-3"><a className="outline-button" href={`tel:${selectedOrder.customer.phone}`}>Ring kunde</a><a className="outline-button" href={`mailto:${selectedOrder.customer.email}`}>Email kunde</a><button className="small-danger" type="button" onClick={() => deleteOrder(selectedOrder.id)}>Slet ordre</button></div>
            </div> : <div className="grid h-full place-items-center text-center text-stone-300/70">Vælg en ordre for at åbne detaljer.</div>}</div>
          </div>
        </div>
      </section>

      <footer className="px-5 pb-8 pt-4 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl border border-gold/25 bg-black/55 px-5 py-5 text-center sm:flex-row sm:text-left"><div><p className="text-sm uppercase tracking-[0.28em] text-gold">Nordic Auto Care</p><p className="mt-1 text-sm text-stone-300/70">Tak for din tid og tillid</p></div><a href="#booking" className="gold-button">Book nu</a></div></footer>
    </main>
  );
}
