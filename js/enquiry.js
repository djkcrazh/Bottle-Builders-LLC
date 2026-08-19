/* Contact sheet (A-04) enquiry form, posted to Formspree.

   The form works without JavaScript and without an endpoint: its action is a
   mailto, so a visitor with either one missing still reaches us. When an
   endpoint is set the submit is intercepted and posted in the background, so
   the visitor stays on the sheet and gets an answer in place. */

import { FORM_ENDPOINT, isConfigured } from "./form-config.js";

const form = document.getElementById("enquiry-form");

/* Custom subject. This runs whether or not an endpoint is configured, because
   the mailto fallback carries the field too and the menu has to behave the
   same either way. */
if (form) {
  const interest = form.querySelector("#f-interest");
  const wrap = form.querySelector("#f-subject-wrap");
  const custom = form.querySelector("#f-subject");

  if (interest && wrap && custom) {
    const sync = () => {
      const writingTheirOwn = interest.value === "other";
      wrap.hidden = !writingTheirOwn;
      // Required only while visible. A required field that cannot be focused
      // blocks submit with an error nobody can see.
      custom.required = writingTheirOwn;
      if (!writingTheirOwn) custom.value = "";
    };

    interest.addEventListener("change", sync);
    // Runs once on load so a value restored by the browser is honoured.
    sync();
  }
}

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
    // an inbox without opening them. The prefix stays whatever the sender
    // chose, so a custom subject is still recognisable at a glance.
    const chosen = String(data.get("interest") || "other");
    const written = String(data.get("subject_other") || "").trim();
    const subject = chosen === "other" && written ? written : chosen;
    data.set("_subject", "Bottle Builders enquiry: " + subject);
    // Folded into the subject line, so it would only repeat in the body.
    data.delete("subject_other");

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
