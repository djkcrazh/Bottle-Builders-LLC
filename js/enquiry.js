/* Contact sheet (A-04) enquiry form, backed by Supabase.

   The form works without JavaScript and without Supabase: its action is a
   mailto, so a visitor with either one missing still reaches us. When Supabase
   is configured the submit is intercepted and written to public.enquiries. */

import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from "./supabase-config.js";

const form = document.getElementById("enquiry-form");
if (form) {
  const status = document.getElementById("enquiry-status");
  const submit = form.querySelector('[type="submit"]');

  const say = (text, state) => {
    status.textContent = text;
    status.dataset.state = state;
  };

  if (!isConfigured) {
    // Leave the mailto fallback in charge, silently. It said so in the interface
    // until launch, but that note was a message to whoever was building the site
    // and there is no version of it worth showing a visitor: either the form
    // posts here, or it opens their email app, and both are ordinary outcomes.
  } else {
    let client = null;

    const getClient = async () => {
      if (client) return client;
      const { createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );
      client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return client;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const row = {
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        phone: String(data.get("phone") || "").trim() || null,
        organisation: String(data.get("organisation") || "").trim() || null,
        interest: String(data.get("interest") || "other"),
        message: String(data.get("message") || "").trim()
      };

      submit.disabled = true;
      say("Sending", "busy");

      try {
        const supabase = await getClient();
        const { error } = await supabase.from("enquiries").insert(row);
        if (error) throw error;

        form.reset();
        say("Sent. We will come back to you at " + row.email + ".", "ok");
      } catch (err) {
        console.error("Enquiry failed", err);
        say(
          "That did not send. Email office@bottlebuilders.com or call +233 55 548 9350.",
          "error"
        );
      } finally {
        submit.disabled = false;
      }
    });
  }
}
