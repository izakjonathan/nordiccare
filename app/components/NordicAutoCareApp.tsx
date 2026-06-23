"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Service = { id: string; name: string; price: number; note?: string };
type Extra = { id: string; name: string; price: number; note?: string };
type CarePackage = { id: string; title: string; price: number; items: string[]; icon: "shield" | "diamond" | "crown" | "laurel" };
type CarEntry = { id: string; type: string; makeModel: string; reg: string; packageId: string; services: string[]; extras: string[]; notes: string };
type CustomerInfo = { name: string; phone: string; email: string; address: string };
type InvoiceInfo = { invoiceType: string; company: string; cvr: string; invoiceEmail: string; invoiceAddress: string };
type OrderStatus = "Ny" | "Kontaktet" | "Bekræftet" | "I gang" | "Færdig" | "Faktureret" | "Annulleret";
type PaymentStatus = "Ikke faktureret" | "Sendt" | "Betalt" | "Afventer";
type InvoiceStatus = "Kladde" | "Sendt" | "Betalt" | "Forfalden" | "Annulleret";
type InvoiceLine = { id: string; text: string; qty: number; price: number };
type InvoiceRecord = { id: string; orderId: string; invoiceNo: string; createdAt: string; dueDate: string; sentAt?: string; paidAt?: string; customerName: string; email: string; invoiceAddress: string; company: string; cvr: string; status: InvoiceStatus; lines: InvoiceLine[]; note: string };
type Priority = "Normal" | "Haster" | "VIP";
type AdminView = "overview" | "pipeline" | "calendar" | "customers" | "invoices" | "settings";
type Order = {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  invoice: InvoiceInfo;
  preferredDate: string;
  preferredTime: string;
  cars: CarEntry[];
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  priority?: Priority;
  assignedTo?: string;
  adminDate: string;
  adminTime: string;
  adminNotes: string;
  customerMessage: string;
  activity?: string[];
};

const STORAGE_KEY = "nordic-auto-care-orders-v2";
const INVOICE_STORAGE_KEY = "nordic-auto-care-invoices-v1";
const LEGACY_STORAGE_KEY = "nordic-auto-care-orders-v1";

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
const paymentStatuses: PaymentStatus[] = ["Ikke faktureret", "Sendt", "Betalt", "Afventer"];
const priorities: Priority[] = ["Normal", "Haster", "VIP"];
const qualities = [
  { title: "Kvalitet i topklasse", icon: "badge" },
  { title: "Detaljer der gør forskellen", icon: "spark" },
  { title: "Personlig service", icon: "handshake" }
];
const adminViews: Array<{ id: AdminView; label: string }> = [
  { id: "overview", label: "Overblik" },
  { id: "pipeline", label: "Pipeline" },
  { id: "calendar", label: "Kalender" },
  { id: "customers", label: "Kunder" },
  { id: "invoices", label: "Faktura" },
  { id: "settings", label: "Backup" }
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

function invoiceTotal(invoice: Pick<InvoiceRecord, "lines">) {
  return invoice.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
}

function invoiceEmailBody(invoice: InvoiceRecord) {
  const lines = invoice.lines.map((line) => `${line.text} - ${line.qty} x ${kr(line.price)} = ${kr(line.qty * line.price)}`).join("\n");
  return [`Hej ${invoice.customerName || ""}`, "", `Her er faktura ${invoice.invoiceNo} fra Nordic Auto Care.`, "", lines, "", `Total: ${kr(invoiceTotal(invoice))}`, `Forfaldsdato: ${invoice.dueDate || "ikke sat"}`, "", invoice.note || "Tak for din ordre.", "", "Med venlig hilsen", "Nordic Auto Care"].join("\n");
}

function normaliseInvoice(invoice: InvoiceRecord): InvoiceRecord {
  return {
    ...invoice,
    status: invoice.status ?? "Kladde",
    lines: invoice.lines ?? [],
    note: invoice.note ?? ""
  };
}

function selectedNames(ids: string[], source: Array<{ id: string; name: string }>) {
  return ids.map((id) => source.find((item) => item.id === id)?.name).filter(Boolean).join(", ");
}

function normaliseOrder(order: Order): Order {
  return {
    ...order,
    status: order.status ?? "Ny",
    paymentStatus: order.paymentStatus ?? "Ikke faktureret",
    priority: order.priority ?? "Normal",
    assignedTo: order.assignedTo ?? "",
    activity: order.activity ?? [`Oprettet ${new Date(order.createdAt || Date.now()).toLocaleString("da-DK")}`]
  };
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
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`form-input ${props.className ?? ""}`} />; }
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`form-input min-h-28 resize-none ${props.className ?? ""}`} />; }
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`form-input ${props.className ?? ""}`} />; }

export default function NordicAutoCareApp({ mode = "frontend" }: { mode?: "frontend" | "backend" }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo>(emptyCustomer);
  const [invoice, setInvoice] = useState<InvoiceInfo>(emptyInvoice);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [cars, setCars] = useState<CarEntry[]>([makeCar()]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "Alle">("Alle");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [submittedId, setSubmittedId] = useState<string>("");
  const [adminView, setAdminView] = useState<AdminView>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const importRef = useRef<HTMLInputElement>(null);
  const isBackend = mode === "backend";
  const [adminPin, setAdminPin] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    if (!isBackend) return;
    setAdminUnlocked(sessionStorage.getItem("nac-admin-unlocked") === "true");
  }, [isBackend]);

  function unlockBackend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (adminPin.trim() === "2026") {
      sessionStorage.setItem("nac-admin-unlocked", "true");
      setAdminUnlocked(true);
      setAdminPin("");
    }
  }

  function lockBackend() {
    sessionStorage.removeItem("nac-admin-unlocked");
    setAdminUnlocked(false);
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = (JSON.parse(stored) as Order[]).map(normaliseOrder);
        setOrders(parsed);
        setSelectedOrderId(parsed[0]?.id ?? "");
      }
    } catch { setOrders([]); }
    try {
      const storedInvoices = localStorage.getItem(INVOICE_STORAGE_KEY);
      if (storedInvoices) {
        const parsedInvoices = (JSON.parse(storedInvoices) as InvoiceRecord[]).map(normaliseInvoice);
        setInvoices(parsedInvoices);
        setSelectedInvoiceId(parsedInvoices[0]?.id ?? "");
      }
    } catch { setInvoices([]); }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices)); }, [invoices]);

  const draftTotal = useMemo(() => orderTotal({ cars }), [cars]);
  const searchedOrders = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    const byStatus = activeStatus === "Alle" ? orders : orders.filter((order) => order.status === activeStatus);
    if (!needle) return byStatus;
    return byStatus.filter((order) => [order.id, order.customer.name, order.customer.phone, order.customer.email, order.customer.address, order.invoice.company, ...order.cars.flatMap((car) => [car.makeModel, car.reg, car.type])].join(" ").toLowerCase().includes(needle));
  }, [activeStatus, orders, searchTerm]);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0];
  const kpis = useMemo(() => {
    const active = orders.filter((order) => !["Færdig", "Faktureret", "Annulleret"].includes(order.status));
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: orders.length,
      active: active.length,
      today: orders.filter((order) => (order.adminDate || order.preferredDate) === today).length,
      cars: orders.reduce((sum, order) => sum + order.cars.length, 0),
      value: orders.reduce((sum, order) => sum + orderTotal(order), 0),
      unpaid: invoices.filter((invoice) => invoice.status !== "Betalt" && invoice.status !== "Annulleret").reduce((sum, invoice) => sum + invoiceTotal(invoice), 0),
      invoices: invoices.length
    };
  }, [invoices, orders]);
  const calendarDays = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach((order) => {
      const date = order.adminDate || order.preferredDate || "Ikke planlagt";
      map.set(date, [...(map.get(date) ?? []), order]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [orders]);
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; email: string; orders: number; cars: number; value: number; last: string }>();
    orders.forEach((order) => {
      const key = order.customer.phone || order.customer.email || order.customer.name || order.id;
      const current = map.get(key) ?? { name: order.customer.name || "Ukendt kunde", phone: order.customer.phone, email: order.customer.email, orders: 0, cars: 0, value: 0, last: order.createdAt };
      current.orders += 1;
      current.cars += order.cars.length;
      current.value += orderTotal(order);
      current.last = order.createdAt > current.last ? order.createdAt : current.last;
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
  }, [orders]);

  function updateCar(id: string, patch: Partial<CarEntry>) { setCars((current) => current.map((car) => car.id === id ? { ...car, ...patch } : car)); }
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
      customer, invoice, preferredDate, preferredTime, cars,
      status: "Ny", paymentStatus: "Ikke faktureret", priority: "Normal", assignedTo: "",
      adminDate: preferredDate, adminTime: preferredTime, adminNotes: "", customerMessage,
      activity: [`Forespørgsel modtaget ${new Date().toLocaleString("da-DK")}`]
    };
    setOrders((current) => [newOrder, ...current]);
    setSelectedOrderId(newOrder.id); setSubmittedId(newOrder.id);
    setCustomer(emptyCustomer); setInvoice(emptyInvoice); setPreferredDate(""); setPreferredTime(""); setCustomerMessage(""); setCars([makeCar()]);
  }
  function updateOrder(id: string, patch: Partial<Order>, activity?: string) {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...patch, activity: activity ? [`${new Date().toLocaleString("da-DK")}: ${activity}`, ...(order.activity ?? [])] : order.activity } : order));
  }
  function updateOrderCustomer(id: string, patch: Partial<CustomerInfo>) {
    const order = orders.find((item) => item.id === id); if (!order) return;
    updateOrder(id, { customer: { ...order.customer, ...patch } }, "Kundeinformation opdateret");
  }
  function updateOrderInvoice(id: string, patch: Partial<InvoiceInfo>) {
    const order = orders.find((item) => item.id === id); if (!order) return;
    updateOrder(id, { invoice: { ...order.invoice, ...patch } }, "Fakturainfo opdateret");
  }
  function updateOrderCar(orderId: string, carId: string, patch: Partial<CarEntry>) {
    const order = orders.find((item) => item.id === orderId); if (!order) return;
    updateOrder(orderId, { cars: order.cars.map((car) => car.id === carId ? { ...car, ...patch } : car) }, "Bil/opgave opdateret");
  }
  function toggleOrderCarArray(orderId: string, carId: string, key: "services" | "extras", itemId: string) {
    const order = orders.find((item) => item.id === orderId); const car = order?.cars.find((item) => item.id === carId); if (!order || !car) return;
    const exists = car[key].includes(itemId);
    updateOrderCar(orderId, carId, { [key]: exists ? car[key].filter((id) => id !== itemId) : [...car[key], itemId] } as Partial<CarEntry>);
  }
  function addCarToOrder(orderId: string) {
    const order = orders.find((item) => item.id === orderId); if (!order) return;
    updateOrder(orderId, { cars: [...order.cars, makeCar()] }, "Bil tilføjet");
  }
  function removeCarFromOrder(orderId: string, carId: string) {
    const order = orders.find((item) => item.id === orderId); if (!order || order.cars.length <= 1) return;
    updateOrder(orderId, { cars: order.cars.filter((car) => car.id !== carId) }, "Bil fjernet");
  }
  function deleteOrder(id: string) {
    const next = orders.filter((order) => order.id !== id);
    setOrders(next); if (selectedOrderId === id) setSelectedOrderId(next[0]?.id ?? "");
  }
  function createInvoiceFromOrder(order: Order) {
    const today = new Date();
    const due = new Date(today);
    due.setDate(today.getDate() + 8);
    const lines: InvoiceLine[] = order.cars.map((car, index) => {
      const pack = packages.find((item) => item.id === car.packageId);
      const label = [`Bil ${index + 1}`, car.makeModel, car.reg, pack?.title].filter(Boolean).join(" · ");
      return { id: cryptoId(), text: label, qty: 1, price: carTotal(car) };
    });
    const invoice: InvoiceRecord = {
      id: `INV-${String(Date.now()).slice(-6)}`,
      orderId: order.id,
      invoiceNo: `NAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, "0")}`,
      createdAt: today.toISOString(),
      dueDate: due.toISOString().slice(0, 10),
      customerName: order.customer.name,
      email: order.invoice.invoiceEmail || order.customer.email,
      invoiceAddress: order.invoice.invoiceAddress || order.customer.address,
      company: order.invoice.company,
      cvr: order.invoice.cvr,
      status: "Kladde",
      lines,
      note: "Tak for din ordre hos Nordic Auto Care."
    };
    setInvoices((current) => [invoice, ...current]);
    setSelectedInvoiceId(invoice.id);
    setAdminView("invoices");
    updateOrder(order.id, { paymentStatus: "Ikke faktureret" }, `Faktura ${invoice.invoiceNo} oprettet som kladde`);
  }

  function updateInvoice(id: string, patch: Partial<InvoiceRecord>) {
    setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, ...patch } : invoice));
  }

  function sendInvoice(id: string) {
    const invoice = invoices.find((item) => item.id === id);
    if (!invoice) return;
    const subject = encodeURIComponent(`Faktura ${invoice.invoiceNo} fra Nordic Auto Care`);
    const body = encodeURIComponent(invoiceEmailBody(invoice));
    if (invoice.email) window.location.href = `mailto:${invoice.email}?subject=${subject}&body=${body}`;
    updateInvoice(id, { status: "Sendt", sentAt: new Date().toISOString() });
    updateOrder(invoice.orderId, { paymentStatus: "Sendt" }, `Faktura ${invoice.invoiceNo} markeret som sendt`);
  }

  function markInvoicePaid(id: string) {
    const invoice = invoices.find((item) => item.id === id);
    if (!invoice) return;
    updateInvoice(id, { status: "Betalt", paidAt: new Date().toISOString() });
    updateOrder(invoice.orderId, { status: "Faktureret", paymentStatus: "Betalt" }, `Faktura ${invoice.invoiceNo} markeret som betalt`);
  }

  function deleteInvoice(id: string) {
    const next = invoices.filter((invoice) => invoice.id !== id);
    setInvoices(next);
    if (selectedInvoiceId === id) setSelectedInvoiceId(next[0]?.id ?? "");
  }

  function exportOrders() {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `nordic-auto-care-orders-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
  }
  async function importOrders(file?: File) {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as Order[];
    setOrders(parsed.map(normaliseOrder));
    setSelectedOrderId(parsed[0]?.id ?? "");
  }

  if (isBackend && !adminUnlocked) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-black px-5 text-stone-50">
        <div className="splash-screen" aria-hidden="true"><Image src="/images/nordic-logo-splash.jpeg" alt="" fill priority sizes="100vw" className="object-cover" /></div>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(180,116,59,.25),transparent_34%),linear-gradient(180deg,#0b0a09_0%,#030303_100%)]" />
        <div className="noise fixed inset-0 -z-10 opacity-35" />
        <section className="panel w-full max-w-md p-6 sm:p-8">
          <p className="eyebrow">Beskyttet backend</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.18em] text-gold">Order Operations</h1>
          <p className="mt-4 text-sm leading-6 text-stone-300/80">Backend er adskilt fra kundesiden. Indtast admin PIN for at åbne ordrestyringen.</p>
          <form onSubmit={unlockBackend} className="mt-6 grid gap-4">
            <Field label="Admin PIN"><TextInput type="password" inputMode="numeric" value={adminPin} onChange={(event) => setAdminPin(event.target.value)} placeholder="PIN" autoFocus /></Field>
            <button type="submit" className="gold-button w-full">Åbn backend</button>
          </form>
          <a href="/" className="outline-button mt-4 w-full">Gå til kundesiden</a>
          {adminPin && adminPin.trim() !== "2026" && <p className="mt-4 text-sm text-red-200">Forkert PIN.</p>}
        </section>
      </main>
    );
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
            {isBackend ? <><a className="nav-pill" href="/">Kundeside</a><button type="button" className="nav-pill" onClick={lockBackend}>Lås backend</button></> : <><a className="nav-pill" href="#booking">Book</a><a className="nav-pill" href="#priser">Priser</a></>}
          </div>
        </div>
      </nav>

      {!isBackend && <>
      <section id="top" className="relative px-5 pb-8 pt-12 sm:px-8 lg:px-12 lg:pt-20">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(196,135,77,.18),transparent_55%)]" aria-hidden="true" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.02fr_.98fr]">
          <div className="relative z-10 flex flex-col justify-center gap-8 pt-4 lg:pt-0">
            <div><p className="text-center text-[0.78rem] uppercase tracking-[0.54em] text-stone-200 lg:text-left">Din bil i bedste hænder</p><div className="mx-auto mt-4 h-px w-48 bg-gold/70 lg:mx-0" /><p className="mt-4 text-center text-sm uppercase tracking-[0.42em] text-gold lg:text-left">Kvalitet · Omhu · Tillid</p></div>
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-gold/35 bg-black/45 p-3 backdrop-blur sm:max-w-2xl lg:max-w-xl">{qualities.map((item) => <div key={item.title} className="flex min-h-28 flex-col items-center justify-center gap-2 border-r border-gold/20 px-2 text-center last:border-r-0"><Icon name={item.icon} className="h-9 w-9 text-gold" /><span className="text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.22em] text-gold sm:text-xs">{item.title}</span></div>)}</div>
          </div>
          <aside className="relative z-10 rounded-[2rem] border border-gold/40 bg-black/64 p-5 shadow-[0_25px_90px_rgba(0,0,0,.55)] backdrop-blur-xl sm:p-7 lg:p-8">
            <p className="eyebrow">Book din tid i dag</p><h1 className="mt-3 text-4xl font-semibold uppercase leading-none tracking-[0.18em] text-gold sm:text-5xl">Nordic Auto Care</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-200/82">Professionel bilpleje med enkel booking, tydelige priser og personlig service.</p>
            <div className="mt-8 grid gap-3"><a href="tel:+4581912674" className="contact-card group"><Icon name="phone" className="h-5 w-5 text-gold transition group-hover:scale-110" /><span>81912674</span></a><a href="mailto:nordicacare.2026@gmail.com" className="contact-card group"><Icon name="mail" className="h-5 w-5 text-gold transition group-hover:scale-110" /><span>nordicacare.2026@gmail.com</span></a><div className="contact-card"><span className="grid h-5 w-5 place-items-center text-lg text-gold">◷</span><span>Åben 8-20 hver dag</span></div></div>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#booking" className="gold-button">Start booking</a><a href="#priser" className="outline-button">Se priser</a></div>
          </aside>
        </div>
      </section>

      <section id="booking" className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="eyebrow">Kunde booking</p><h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.18em] text-gold sm:text-5xl">Send forespørgsel</h2></div><div className="panel px-5 py-4 text-right"><p className="text-xs uppercase tracking-[0.22em] text-stone-300/70">Estimeret total</p><p className="text-3xl font-black text-gold">{kr(draftTotal)}</p></div></div>
          {submittedId && <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/[0.08] p-4 text-sm text-stone-100">Forespørgsel <strong className="text-gold">{submittedId}</strong> er oprettet i backend.</div>}
          <form onSubmit={submitRequest} className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="grid gap-5">{cars.map((car, index) => <article key={car.id} className="panel p-5 sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="eyebrow">Bil {index + 1}</p><h3 className="mt-2 text-2xl font-black uppercase tracking-[0.14em] text-gold">Vælg behandling</h3></div>{cars.length > 1 && <button type="button" className="small-danger" onClick={() => setCars((current) => current.filter((item) => item.id !== car.id))}>Fjern</button>}</div><CarEditor car={car} onPatch={(patch) => updateCar(car.id, patch)} onToggle={(key, itemId) => toggleCarArray(car.id, key, itemId)} /><div className="mt-5 rounded-2xl border border-gold/25 bg-black/35 p-4 text-right text-sm uppercase tracking-[0.16em] text-stone-300/80">Bil {index + 1} total <strong className="ml-3 text-xl text-gold">{kr(carTotal(car))}</strong></div></article>)}<button type="button" className="outline-button w-full" onClick={() => setCars((current) => [...current, makeCar()])}>+ Tilføj endnu en bil</button></div>
            <aside className="grid content-start gap-5"><section className="panel p-5 sm:p-6"><h3 className="panel-title">Kontaktinformation</h3><div className="grid gap-4"><Field label="Navn"><TextInput required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Fulde navn" /></Field><Field label="Telefon"><TextInput required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="81912674" /></Field><Field label="Email"><TextInput type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="kunde@email.dk" /></Field><Field label="Adresse"><TextInput value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Adresse / område" /></Field></div></section><section className="panel p-5 sm:p-6"><h3 className="panel-title">Dato & tid</h3><div className="grid grid-cols-2 gap-4"><Field label="Dato"><TextInput required type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} /></Field><Field label="Tid"><TextInput required type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} /></Field></div><div className="mt-4"><Field label="Besked"><TextArea value={customerMessage} onChange={(e) => setCustomerMessage(e.target.value)} placeholder="Skriv ønsket tidspunkt, spørgsmål eller afhentningsinfo." /></Field></div></section><section className="panel p-5 sm:p-6"><h3 className="panel-title">Faktura</h3><div className="grid gap-4"><Field label="Type"><Select value={invoice.invoiceType} onChange={(e) => setInvoice({ ...invoice, invoiceType: e.target.value })}><option>Privat</option><option>Firma</option></Select></Field>{invoice.invoiceType === "Firma" && <><Field label="Firmanavn"><TextInput value={invoice.company} onChange={(e) => setInvoice({ ...invoice, company: e.target.value })} /></Field><Field label="CVR"><TextInput value={invoice.cvr} onChange={(e) => setInvoice({ ...invoice, cvr: e.target.value })} /></Field></>}<Field label="Faktura email"><TextInput type="email" value={invoice.invoiceEmail} onChange={(e) => setInvoice({ ...invoice, invoiceEmail: e.target.value })} placeholder="Hvis anden end kontakt email" /></Field><Field label="Faktura adresse"><TextInput value={invoice.invoiceAddress} onChange={(e) => setInvoice({ ...invoice, invoiceAddress: e.target.value })} /></Field></div></section><button type="submit" className="gold-button w-full">Send forespørgsel</button></aside>
          </form>
        </div>
      </section>

      <section id="priser" className="relative px-5 py-10 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><div className="mb-8 text-center"><p className="eyebrow">Prisoversigt</p><h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.22em] text-gold sm:text-5xl">Kvalitet i hver detalje</h2></div><div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]"><div className="panel p-5 sm:p-6"><h3 className="panel-title">Enkelt ydelser</h3><div className="divide-y divide-gold/18">{services.map((row) => <div key={row.id} className="flex items-start justify-between gap-5 py-2.5 text-[0.94rem] leading-tight sm:text-base"><span className="text-stone-100/90">{row.name}</span><span className="shrink-0 text-right font-medium tracking-wide text-stone-100/90">{kr(row.price)}</span></div>)}</div><p className="mt-6 text-sm leading-6 text-gold/86">Priserne er fra-priser og kan variere afhængigt af bilens størrelse og stand.</p><div className="mt-9"><h3 className="panel-title">Tillæg</h3><div className="divide-y divide-gold/18">{extras.map((row) => <div key={row.id} className="flex items-start justify-between gap-5 py-2.5 text-[0.94rem] leading-tight sm:text-base"><span className="text-stone-100/90">{row.name}</span><span className="shrink-0 text-right font-medium tracking-wide text-stone-100/90">{row.note ?? kr(row.price)}</span></div>)}</div></div></div><div id="pakker" className="grid gap-4"><h3 className="panel-title mb-0">Pakkeløsninger</h3>{packages.map((pack) => <article key={pack.title} className="package-card"><div className="flex items-center gap-5"><Icon name={pack.icon} className="h-16 w-16 shrink-0 text-gold sm:h-20 sm:w-20" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-xl font-semibold uppercase tracking-[0.14em] text-gold sm:text-2xl">{pack.title}</h4><p className="text-2xl font-bold tracking-wide text-gold sm:text-3xl">{kr(pack.price)}</p></div><ul className="mt-3 grid gap-1.5 text-sm leading-5 text-stone-100/86 sm:text-base">{pack.items.map((item) => <li key={item} className="flex gap-2"><span className="text-gold">•</span><span>{item}</span></li>)}</ul></div></div></article>)}</div></div></div></section>
      </>}

      {isBackend && <section id="admin" className="px-5 py-10 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="eyebrow">Åben backend</p><h2 className="mt-2 text-3xl font-semibold uppercase tracking-[0.18em] text-gold sm:text-5xl">Order Operations</h2><p className="mt-3 max-w-3xl text-stone-300/75">Ordresystemet er adskilt fra kundesiden og har pipeline, kalender, kundeliste, fuld redigering og backup/import.</p></div><a href="/" className="gold-button">Åbn kundeside</a></div>
        <div className="admin-shell"><div className="admin-tabs">{adminViews.map((view) => <button key={view.id} type="button" onClick={() => setAdminView(view.id)} className={adminView === view.id ? "admin-tab is-active" : "admin-tab"}>{view.label}</button>)}</div><div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">{[{ label: "Ordrer", value: kpis.total }, { label: "Aktive", value: kpis.active }, { label: "I dag", value: kpis.today }, { label: "Biler", value: kpis.cars }, { label: "Est. værdi", value: kr(kpis.value) }, { label: "Fakturaer", value: kpis.invoices }, { label: "Ikke betalt", value: kr(kpis.unpaid) }].map((item) => <div key={item.label} className="panel p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-400">{item.label}</p><p className="mt-2 text-2xl font-black text-gold">{item.value}</p></div>)}</div>
          {adminView === "overview" && <><div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]"><TextInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Søg kunde, telefon, ordre, bil eller nummerplade" /><div className="flex gap-2 overflow-x-auto pb-1"><button onClick={() => setActiveStatus("Alle")} className={activeStatus === "Alle" ? "filter-pill active" : "filter-pill"}>Alle</button>{statuses.map((status) => <button key={status} onClick={() => setActiveStatus(status)} className={activeStatus === status ? "filter-pill active" : "filter-pill"}>{status}</button>)}</div></div><div className="mt-6 grid gap-6 lg:grid-cols-[.86fr_1.14fr]"><OrderList orders={searchedOrders} selectedId={selectedOrder?.id} onSelect={setSelectedOrderId} /><OrderDetail selectedOrder={selectedOrder} onUpdate={updateOrder} onUpdateCustomer={updateOrderCustomer} onUpdateInvoice={updateOrderInvoice} onUpdateCar={updateOrderCar} onToggleCarArray={toggleOrderCarArray} onAddCar={addCarToOrder} onRemoveCar={removeCarFromOrder} onDelete={deleteOrder} /></div></>}
          {adminView === "pipeline" && <div className="mt-6 grid gap-4 lg:grid-cols-7">{statuses.map((status) => <div key={status} className="pipeline-column"><div className="mb-3 flex items-center justify-between"><h3>{status}</h3><span>{orders.filter((order) => order.status === status).length}</span></div>{orders.filter((order) => order.status === status).map((order) => <button key={order.id} className="pipeline-card" onClick={() => { setSelectedOrderId(order.id); setAdminView("overview"); }}><strong>{order.customer.name || "Ukendt"}</strong><em>{order.adminDate || order.preferredDate || "Ikke planlagt"} · {kr(orderTotal(order))}</em><span>{order.priority ?? "Normal"}</span></button>)}</div>)}</div>}
          {adminView === "calendar" && <div className="mt-6 grid gap-4">{calendarDays.length === 0 && <div className="panel p-6 text-center text-stone-300/70">Ingen planlagte ordrer endnu.</div>}{calendarDays.map(([date, dayOrders]) => <section key={date} className="panel p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-black uppercase tracking-[0.18em] text-gold">{date === "Ikke planlagt" ? date : new Date(`${date}T00:00`).toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" })}</h3><span className="rounded-full border border-gold/30 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gold">{dayOrders.length} ordre</span></div><div className="grid gap-3">{dayOrders.sort((a, b) => (a.adminTime || a.preferredTime).localeCompare(b.adminTime || b.preferredTime)).map((order) => <button key={order.id} className="calendar-row" onClick={() => { setSelectedOrderId(order.id); setAdminView("overview"); }}><span>{order.adminTime || order.preferredTime || "--:--"}</span><strong>{order.customer.name || "Ukendt kunde"}</strong><em>{order.cars.length} bil(er) · {order.status}</em><b>{kr(orderTotal(order))}</b></button>)}</div></section>)}</div>}
          {adminView === "customers" && <div className="mt-6 grid gap-3">{customers.length === 0 && <div className="panel p-6 text-center text-stone-300/70">Ingen kunder endnu.</div>}{customers.map((item) => <div key={`${item.phone}-${item.email}-${item.name}`} className="customer-row"><div><strong>{item.name}</strong><p>{item.phone} · {item.email || "ingen email"}</p></div><span>{item.orders} ordre</span><span>{item.cars} bil(er)</span><b>{kr(item.value)}</b></div>)}</div>}
          {adminView === "invoices" && <InvoiceModule orders={orders} invoices={invoices} selectedInvoiceId={selectedInvoiceId} onSelectInvoice={setSelectedInvoiceId} onCreateFromOrder={createInvoiceFromOrder} onUpdateInvoice={updateInvoice} onSendInvoice={sendInvoice} onMarkPaid={markInvoicePaid} onDeleteInvoice={deleteInvoice} />}
          {adminView === "settings" && <div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="panel p-6"><h3 className="panel-title">Backup</h3><p className="text-stone-300/75">Eksporter alle ordrer til JSON, så data kan gemmes eller flyttes til en anden browser.</p><button className="gold-button mt-5 w-full" onClick={exportOrders}>Eksporter ordrer</button></section><section className="panel p-6"><h3 className="panel-title">Importer</h3><p className="text-stone-300/75">Importer en tidligere JSON backup. Dette erstatter de nuværende lokale ordrer.</p><input ref={importRef} type="file" accept="application/json" className="hidden" onChange={(e) => importOrders(e.target.files?.[0])} /><button className="outline-button mt-5 w-full" onClick={() => importRef.current?.click()}>Importer backup</button></section></div>}
        </div></div></section>}
      <footer className="px-5 pb-8 pt-4 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl border border-gold/25 bg-black/55 px-5 py-5 text-center sm:flex-row sm:text-left"><div><p className="text-sm uppercase tracking-[0.28em] text-gold">Nordic Auto Care</p><p className="mt-1 text-sm text-stone-300/70">Tak for din tid og tillid</p></div>{isBackend ? <a href="/" className="gold-button">Åbn kundeside</a> : <a href="#booking" className="gold-button">Book nu</a>}</div></footer>
    </main>
  );
}

function CarEditor({ car, onPatch, onToggle }: { car: CarEntry; onPatch: (patch: Partial<CarEntry>) => void; onToggle: (key: "services" | "extras", itemId: string) => void }) {
  return <><div className="grid gap-4 sm:grid-cols-3"><Field label="Biltype"><Select value={car.type} onChange={(e) => onPatch({ type: e.target.value })}><option>Personbil</option><option>SUV</option><option>Varevogn</option><option>Elbil</option><option>Andet</option></Select></Field><Field label="Mærke / model"><TextInput value={car.makeModel} onChange={(e) => onPatch({ makeModel: e.target.value })} placeholder="BMW 320d" /></Field><Field label="Nummerplade"><TextInput value={car.reg} onChange={(e) => onPatch({ reg: e.target.value })} placeholder="AB 12 345" /></Field></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{packages.map((pack) => <button key={pack.id} type="button" onClick={() => onPatch({ packageId: pack.id })} className={car.packageId === pack.id ? "choice-card is-selected" : "choice-card"}><span><Icon name={pack.icon} className="h-9 w-9 text-gold" /></span><span className="min-w-0"><strong>{pack.title}</strong><em>{kr(pack.price)}</em></span></button>)}</div><div className="mt-6 grid gap-5 lg:grid-cols-2"><div><h4 className="mini-title">Ekstra enkelt ydelser</h4><div className="mt-3 grid gap-2">{services.map((service) => <label key={service.id} className="check-row"><input type="checkbox" checked={car.services.includes(service.id)} onChange={() => onToggle("services", service.id)} /><span>{service.name}</span><strong>{kr(service.price)}</strong></label>)}</div></div><div><h4 className="mini-title">Tillæg</h4><div className="mt-3 grid gap-2">{extras.map((extra) => <label key={extra.id} className="check-row"><input type="checkbox" checked={car.extras.includes(extra.id)} onChange={() => onToggle("extras", extra.id)} /><span>{extra.name}</span><strong>{extra.note ?? kr(extra.price)}</strong></label>)}</div><div className="mt-4"><Field label="Noter om bilen"><TextArea value={car.notes} onChange={(e) => onPatch({ notes: e.target.value })} placeholder="Stand, særlige ønsker, afhentning osv." /></Field></div></div></div></>;
}

function OrderList({ orders, selectedId, onSelect }: { orders: Order[]; selectedId?: string; onSelect: (id: string) => void }) {
  return <div className="grid content-start gap-3">{orders.length === 0 && <div className="panel p-6 text-center text-stone-300/70">Ingen ordrer matcher filteret.</div>}{orders.map((order) => <button key={order.id} type="button" onClick={() => onSelect(order.id)} className={selectedId === order.id ? "order-card is-active" : "order-card"}><div className="flex items-start justify-between gap-3"><span><strong>{order.customer.name || "Ukendt kunde"}</strong><em>{order.id} · {new Date(order.createdAt).toLocaleDateString("da-DK")}</em></span><b>{order.status}</b></div><div className="mt-3 grid grid-cols-3 gap-2 text-left text-xs uppercase tracking-[0.12em] text-stone-300/70"><span>{order.cars.length} bil(er)</span><span>{order.adminDate || order.preferredDate}</span><span className="text-right text-gold">{kr(orderTotal(order))}</span></div></button>)}</div>;
}

function InvoiceModule({ orders, invoices, selectedInvoiceId, onSelectInvoice, onCreateFromOrder, onUpdateInvoice, onSendInvoice, onMarkPaid, onDeleteInvoice }: { orders: Order[]; invoices: InvoiceRecord[]; selectedInvoiceId: string; onSelectInvoice: (id: string) => void; onCreateFromOrder: (order: Order) => void; onUpdateInvoice: (id: string, patch: Partial<InvoiceRecord>) => void; onSendInvoice: (id: string) => void; onMarkPaid: (id: string) => void; onDeleteInvoice: (id: string) => void }) {
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? invoices[0];
  const ordersWithoutInvoice = orders.filter((order) => !invoices.some((invoice) => invoice.orderId === order.id) && order.status !== "Annulleret");
  const totals = {
    draft: invoices.filter((invoice) => invoice.status === "Kladde").length,
    sent: invoices.filter((invoice) => invoice.status === "Sendt").length,
    paid: invoices.filter((invoice) => invoice.status === "Betalt").length,
    unpaidValue: invoices.filter((invoice) => invoice.status !== "Betalt" && invoice.status !== "Annulleret").reduce((sum, invoice) => sum + invoiceTotal(invoice), 0)
  };

  function updateLine(lineId: string, patch: Partial<InvoiceLine>) {
    if (!selectedInvoice) return;
    onUpdateInvoice(selectedInvoice.id, { lines: selectedInvoice.lines.map((line) => line.id === lineId ? { ...line, ...patch } : line) });
  }

  function addLine() {
    if (!selectedInvoice) return;
    onUpdateInvoice(selectedInvoice.id, { lines: [...selectedInvoice.lines, { id: cryptoId(), text: "Ny fakturalinje", qty: 1, price: 0 }] });
  }

  function removeLine(lineId: string) {
    if (!selectedInvoice || selectedInvoice.lines.length <= 1) return;
    onUpdateInvoice(selectedInvoice.id, { lines: selectedInvoice.lines.filter((line) => line.id !== lineId) });
  }

  return <div className="mt-6 grid gap-6">
    <div className="grid gap-4 sm:grid-cols-4">{[{ label: "Kladder", value: totals.draft }, { label: "Sendt", value: totals.sent }, { label: "Betalt", value: totals.paid }, { label: "Åbent beløb", value: kr(totals.unpaidValue) }].map((item) => <div key={item.label} className="panel p-4"><p className="text-xs uppercase tracking-[0.22em] text-stone-400">{item.label}</p><p className="mt-2 text-2xl font-black text-gold">{item.value}</p></div>)}</div>
    <section className="panel p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="panel-title mb-0">Opret faktura fra ordre</h3><p className="mt-3 text-sm text-stone-300/75">Vælg en ordre og opret en fakturakladde med bilerne som fakturalinjer.</p></div></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{ordersWithoutInvoice.length === 0 && <p className="text-sm text-stone-300/70">Alle aktive ordrer har allerede en faktura.</p>}{ordersWithoutInvoice.map((order) => <div key={order.id} className="detail-box flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h4>{order.id} · {order.customer.name || "Ukendt kunde"}</h4><p>{order.cars.length} bil(er) · {order.adminDate || order.preferredDate || "Ikke planlagt"} · {kr(orderTotal(order))}</p></div><button type="button" className="gold-button" onClick={() => onCreateFromOrder(order)}>Opret faktura</button></div>)}</div></section>
    <div className="grid gap-6 lg:grid-cols-[.82fr_1.18fr]">
      <div className="grid content-start gap-3">{invoices.length === 0 && <div className="panel p-6 text-center text-stone-300/70">Ingen fakturaer endnu.</div>}{invoices.map((invoice) => <button key={invoice.id} type="button" onClick={() => onSelectInvoice(invoice.id)} className={selectedInvoice?.id === invoice.id ? "order-card is-active" : "order-card"}><div className="flex items-start justify-between gap-3"><span><strong>{invoice.invoiceNo}</strong><em>{invoice.customerName || "Ukendt kunde"} · {invoice.orderId}</em></span><b>{invoice.status}</b></div><div className="mt-3 grid grid-cols-3 gap-2 text-left text-xs uppercase tracking-[0.12em] text-stone-300/70"><span>{invoice.dueDate}</span><span>{invoice.email || "ingen email"}</span><span className="text-right text-gold">{kr(invoiceTotal(invoice))}</span></div></button>)}</div>
      {!selectedInvoice ? <div className="panel grid min-h-[28rem] place-items-center p-6 text-center text-stone-300/70">Vælg eller opret en faktura.</div> : <section className="panel p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">{selectedInvoice.orderId}</p><h3 className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-gold">{selectedInvoice.invoiceNo}</h3><p className="mt-2 text-stone-300/75">{selectedInvoice.customerName || "Ukendt kunde"} · {selectedInvoice.email || "ingen email"}</p></div><div className="text-left sm:text-right"><p className="text-xs uppercase tracking-[0.18em] text-stone-400">Total</p><p className="text-3xl font-black text-gold">{kr(invoiceTotal(selectedInvoice))}</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><Field label="Fakturanr."><TextInput value={selectedInvoice.invoiceNo} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { invoiceNo: e.target.value })} /></Field><Field label="Status"><Select value={selectedInvoice.status} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { status: e.target.value as InvoiceStatus })}><option>Kladde</option><option>Sendt</option><option>Betalt</option><option>Forfalden</option><option>Annulleret</option></Select></Field><Field label="Forfald"><TextInput type="date" value={selectedInvoice.dueDate} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { dueDate: e.target.value })} /></Field><Field label="Kunde"><TextInput value={selectedInvoice.customerName} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { customerName: e.target.value })} /></Field><Field label="Email"><TextInput value={selectedInvoice.email} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { email: e.target.value })} /></Field><Field label="CVR"><TextInput value={selectedInvoice.cvr} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { cvr: e.target.value })} /></Field><Field label="Firma"><TextInput value={selectedInvoice.company} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { company: e.target.value })} /></Field><Field label="Fakturaadresse"><TextInput value={selectedInvoice.invoiceAddress} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { invoiceAddress: e.target.value })} /></Field></div><div className="mt-6 detail-box"><div className="mb-4 flex items-center justify-between gap-3"><h4>Fakturalinjer</h4><button type="button" className="outline-button" onClick={addLine}>+ Linje</button></div><div className="grid gap-3">{selectedInvoice.lines.map((line) => <div key={line.id} className="grid gap-3 rounded-2xl border border-gold/15 bg-black/25 p-3 sm:grid-cols-[1fr_5rem_7rem_6rem_auto]"><TextInput value={line.text} onChange={(e) => updateLine(line.id, { text: e.target.value })} /><TextInput type="number" min="1" value={line.qty} onChange={(e) => updateLine(line.id, { qty: Number(e.target.value) || 1 })} /><TextInput type="number" min="0" value={line.price} onChange={(e) => updateLine(line.id, { price: Number(e.target.value) || 0 })} /><div className="grid place-items-center text-sm font-black text-gold">{kr(line.qty * line.price)}</div><button type="button" className="small-danger" onClick={() => removeLine(line.id)}>Fjern</button></div>)}</div></div><div className="mt-6"><Field label="Fakturanote"><TextArea value={selectedInvoice.note} onChange={(e) => onUpdateInvoice(selectedInvoice.id, { note: e.target.value })} /></Field></div><div className="mt-6 grid gap-3 sm:grid-cols-4"><button type="button" className="gold-button" onClick={() => onSendInvoice(selectedInvoice.id)}>Send faktura</button><button type="button" className="outline-button" onClick={() => onMarkPaid(selectedInvoice.id)}>Marker betalt</button><a className="outline-button" href={`mailto:${selectedInvoice.email}`}>Email kunde</a><button type="button" className="small-danger" onClick={() => onDeleteInvoice(selectedInvoice.id)}>Slet faktura</button></div><div className="mt-4 detail-box"><h4>Statuskontrol</h4><p>Oprettet: {new Date(selectedInvoice.createdAt).toLocaleString("da-DK")}</p><p>Sendt: {selectedInvoice.sentAt ? new Date(selectedInvoice.sentAt).toLocaleString("da-DK") : "ikke sendt"}</p><p>Betalt: {selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleString("da-DK") : "ikke betalt"}</p><p>Mail-knappen åbner kundens mailprogram med fakturateksten. Et rigtigt send-/betalingsflow kan kobles på senere med database, email-provider og regnskabssystem.</p></div></section>}
    </div>
  </div>;
}

function OrderDetail({ selectedOrder, onUpdate, onUpdateCustomer, onUpdateInvoice, onUpdateCar, onToggleCarArray, onAddCar, onRemoveCar, onDelete }: { selectedOrder?: Order; onUpdate: (id: string, patch: Partial<Order>, activity?: string) => void; onUpdateCustomer: (id: string, patch: Partial<CustomerInfo>) => void; onUpdateInvoice: (id: string, patch: Partial<InvoiceInfo>) => void; onUpdateCar: (orderId: string, carId: string, patch: Partial<CarEntry>) => void; onToggleCarArray: (orderId: string, carId: string, key: "services" | "extras", itemId: string) => void; onAddCar: (id: string) => void; onRemoveCar: (orderId: string, carId: string) => void; onDelete: (id: string) => void }) {
  if (!selectedOrder) return <div className="panel grid min-h-[32rem] place-items-center p-6 text-center text-stone-300/70">Vælg en ordre for at åbne detaljer.</div>;
  return <div className="panel min-h-[32rem] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">{selectedOrder.id}</p><h3 className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-gold">{selectedOrder.customer.name || "Ordre"}</h3><p className="mt-2 text-stone-300/75">{selectedOrder.customer.phone} · {selectedOrder.customer.email || "ingen email"}</p></div><div className="text-left sm:text-right"><p className="text-xs uppercase tracking-[0.18em] text-stone-400">Total</p><p className="text-3xl font-black text-gold">{kr(orderTotal(selectedOrder))}</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><Field label="Status"><Select value={selectedOrder.status} onChange={(e) => onUpdate(selectedOrder.id, { status: e.target.value as OrderStatus }, `Status ændret til ${e.target.value}`)}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></Field><Field label="Betaling"><Select value={selectedOrder.paymentStatus ?? "Ikke faktureret"} onChange={(e) => onUpdate(selectedOrder.id, { paymentStatus: e.target.value as PaymentStatus }, `Betaling ændret til ${e.target.value}`)}>{paymentStatuses.map((status) => <option key={status}>{status}</option>)}</Select></Field><Field label="Prioritet"><Select value={selectedOrder.priority ?? "Normal"} onChange={(e) => onUpdate(selectedOrder.id, { priority: e.target.value as Priority }, `Prioritet ændret til ${e.target.value}`)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</Select></Field><Field label="Dato"><TextInput type="date" value={selectedOrder.adminDate} onChange={(e) => onUpdate(selectedOrder.id, { adminDate: e.target.value }, "Dato opdateret")} /></Field><Field label="Tid"><TextInput type="time" value={selectedOrder.adminTime} onChange={(e) => onUpdate(selectedOrder.id, { adminTime: e.target.value }, "Tid opdateret")} /></Field><Field label="Ansvarlig"><TextInput value={selectedOrder.assignedTo ?? ""} onChange={(e) => onUpdate(selectedOrder.id, { assignedTo: e.target.value }, "Ansvarlig opdateret")} placeholder="Mike / team" /></Field></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="detail-box"><h4>Kunde</h4><div className="grid gap-3"><TextInput value={selectedOrder.customer.name} onChange={(e) => onUpdateCustomer(selectedOrder.id, { name: e.target.value })} placeholder="Navn" /><TextInput value={selectedOrder.customer.phone} onChange={(e) => onUpdateCustomer(selectedOrder.id, { phone: e.target.value })} placeholder="Telefon" /><TextInput value={selectedOrder.customer.email} onChange={(e) => onUpdateCustomer(selectedOrder.id, { email: e.target.value })} placeholder="Email" /><TextInput value={selectedOrder.customer.address} onChange={(e) => onUpdateCustomer(selectedOrder.id, { address: e.target.value })} placeholder="Adresse" /></div></div><div className="detail-box"><h4>Faktura</h4><div className="grid gap-3"><Select value={selectedOrder.invoice.invoiceType} onChange={(e) => onUpdateInvoice(selectedOrder.id, { invoiceType: e.target.value })}><option>Privat</option><option>Firma</option></Select><TextInput value={selectedOrder.invoice.company} onChange={(e) => onUpdateInvoice(selectedOrder.id, { company: e.target.value })} placeholder="Firma" /><TextInput value={selectedOrder.invoice.cvr} onChange={(e) => onUpdateInvoice(selectedOrder.id, { cvr: e.target.value })} placeholder="CVR" /><TextInput value={selectedOrder.invoice.invoiceEmail || selectedOrder.customer.email} onChange={(e) => onUpdateInvoice(selectedOrder.id, { invoiceEmail: e.target.value })} placeholder="Faktura email" /><TextInput value={selectedOrder.invoice.invoiceAddress} onChange={(e) => onUpdateInvoice(selectedOrder.id, { invoiceAddress: e.target.value })} placeholder="Faktura adresse" /></div></div></div><div className="mt-6 grid gap-4">{selectedOrder.cars.map((car, index) => <div key={car.id} className="detail-box"><div className="mb-4 flex items-center justify-between gap-3"><h4>Bil {index + 1} · {car.type}</h4><div className="flex items-center gap-3"><strong className="text-gold">{kr(carTotal(car))}</strong>{selectedOrder.cars.length > 1 && <button type="button" className="small-danger" onClick={() => onRemoveCar(selectedOrder.id, car.id)}>Fjern</button>}</div></div><CarEditor car={car} onPatch={(patch) => onUpdateCar(selectedOrder.id, car.id, patch)} onToggle={(key, itemId) => onToggleCarArray(selectedOrder.id, car.id, key, itemId)} /></div>)}</div><button className="outline-button mt-4 w-full" onClick={() => onAddCar(selectedOrder.id)}>+ Tilføj bil til ordre</button><div className="mt-6"><Field label="Interne noter"><TextArea value={selectedOrder.adminNotes} onChange={(e) => onUpdate(selectedOrder.id, { adminNotes: e.target.value })} placeholder="Aftaler, opfølgning, betaling, særlige forhold." /></Field></div>{selectedOrder.customerMessage && <div className="mt-4 detail-box"><h4>Kundebesked</h4><p>{selectedOrder.customerMessage}</p></div>}<div className="mt-4 detail-box"><h4>Aktivitet</h4><div className="grid gap-2 text-sm text-stone-300/75">{(selectedOrder.activity ?? []).slice(0, 8).map((item, index) => <p key={`${item}-${index}`}>• {item}</p>)}</div></div><div className="mt-6 flex flex-wrap gap-3"><a className="outline-button" href={`tel:${selectedOrder.customer.phone}`}>Ring kunde</a><a className="outline-button" href={`mailto:${selectedOrder.customer.email}`}>Email kunde</a><button className="small-danger" type="button" onClick={() => onDelete(selectedOrder.id)}>Slet ordre</button></div></div>;
}
