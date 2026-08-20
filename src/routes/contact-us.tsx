import { createFileRoute } from "@tanstack/react-router";
import { LegalPageShell } from "@/components/PublicPageShell";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us — IntellectFlow" },
      { name: "description", content: "Get in touch with the IntellectFlow team — email, WhatsApp, or send us a message." },
    ],
  }),
  component: ContactUs,
});

function ContactUs() {
  return (
    <LegalPageShell eyebrow="We're here to help" title="Contact Us">
      <p>Have a question about your account, billing, or how something works? Reach us any of these ways:</p>

      <div className="grid sm:grid-cols-2 gap-3 not-prose">
        <a href="mailto:intellectflowteam@gmail.com" className="ticket-card p-4 flex items-start gap-3 hover:shadow-md transition no-underline">
          <span className="w-9 h-9 rounded-lg bg-[var(--ink)] text-white grid place-items-center shrink-0"><Mail className="w-4 h-4" /></span>
          <div>
            <div className="font-bold text-sm text-[var(--ink)]">Email</div>
            <div className="text-sm text-zinc-600">intellectflowteam@gmail.com</div>
          </div>
        </a>
        <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="ticket-card p-4 flex items-start gap-3 hover:shadow-md transition no-underline">
          <span className="w-9 h-9 rounded-lg bg-[#25D366] text-white grid place-items-center shrink-0"><MessageCircle className="w-4 h-4" /></span>
          <div>
            <div className="font-bold text-sm text-[var(--ink)]">WhatsApp</div>
            <div className="text-sm text-zinc-600">Chat with our support team</div>
          </div>
        </a>
      </div>

      <h2>Registered address</h2>
      <p className="flex items-start gap-2">
        <MapPin className="w-4 h-4 mt-1 shrink-0 text-zinc-400" />
        IntellectFlow, Visavadar, Junagadh District, Gujarat, India
      </p>

      <h2>Support hours</h2>
      <p>Monday–Saturday, 10:00 AM – 7:00 PM IST. We typically reply within a few hours on WhatsApp and within one business day by email.</p>
    </LegalPageShell>
  );
}
