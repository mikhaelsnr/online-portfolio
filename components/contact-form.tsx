"use client";

import { FormEvent } from "react";

export default function ContactForm({ recipient }: { recipient: string }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  }

  return <form className="contactForm" onSubmit={submit}>
    <label htmlFor="contact-name">Name</label>
    <input id="contact-name" name="name" type="text" placeholder="Your name" autoComplete="name" required />
    <label htmlFor="contact-email">Email</label>
    <input id="contact-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
    <label htmlFor="contact-message">Message</label>
    <textarea id="contact-message" name="message" placeholder="What would you like to automate?" rows={5} required />
    <button className="button primary" type="submit">Send message</button>
  </form>;
}
