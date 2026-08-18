/* Contact sheet (A-04) enquiry form, posted to Formspree.

   The form works without JavaScript and without an endpoint: its action is a
   mailto, so a visitor with either one missing still reaches us. When an
   endpoint is set the submit is intercepted and posted in the background, so
   the visitor stays on the sheet and gets an answer in place. */

import { FORM_ENDPOINT, isConfigured } from "./form-config.js";

const form = document.getElementById("enquiry-form");
if (form && isConfigured) {
  const status = document.getElementById("enquiry-status");
  const submit = form.querySelector('[type="submit"]');

  const say = (text, state) => {
    status.textContent = text;
    status.dataset.state = state;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);

    // Anything typed into the honeypot came from a bot, since the field is
    // hidden from people. Act as though it sent, and send nothing.
    if (String(data.get("_gotcha") || "").trim() !== "") {
      form.reset();
      say("Sent. We will come back to you shortly.", "ok");
      return;
    }
    data.delete("_gotcha");

    const email = String(data.get("email") || "").trim();

    // Subject line on the email Formspree sends, so enquiries are sortable in
    // an inbox without opening them.
    const interest = String(data.get("interest") || "other");
    data.set("_subject", "Bottle Builders enquiry: " + interest);

    submit.disabled = true;
    say("Sending", "busy");

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Formspree responded " + response.status);

      form.reset();
      say("Sent. We will come back to you at " + email + ".", "ok");
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
