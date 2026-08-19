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

  /* The four fields a visitor has to fill in. Native `required` only checks
     that a field is not empty, so a run of spaces satisfies it and an enquiry
     of pure whitespace used to send. Checking the trimmed value closes that,
     and setCustomValidity means the browser raises it on the offending field
     in its own voice, in the visitor's own language, exactly as it does for a
     genuinely empty one. */
  const mustHaveContent = ["name", "email", "subject", "message"];

  const gradeBlanks = () => {
    mustHaveContent.forEach((fieldName) => {
      const field = form.elements[fieldName];
      if (!field) return;
      const blank = field.value.trim() === "";
      // Clearing the custom error leaves native checks intact, so a malformed
      // address still reports as a malformed address rather than as blank.
      field.setCustomValidity(blank ? "Please fill out this field." : "");
    });
  };

  // Clear a custom error as soon as the visitor types, so a message raised on
  // the last attempt cannot outlive the problem it described.
  mustHaveContent.forEach((fieldName) => {
    const field = form.elements[fieldName];
    if (field) field.addEventListener("input", () => field.setCustomValidity(""));
  });

  /* Native validation runs before the submit event, so a click on a form with
     an empty field is rejected by the browser and the submit handler never
     runs. Clearing the status there alone would leave a network error from a
     previous attempt on screen while the visitor is being shown a validation
     bubble about something else entirely. The invalid event is the only signal
     that path gives us. It does not bubble, so this listens in the capture
     phase. */
  form.addEventListener("invalid", () => say("", "idle"), true);

  // The button is disabled synchronously below, so a second click cannot reach
  // it and no visitor path produces two requests today. This closes the class
  // anyway, including submits raised in code rather than by a click.
  let submitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitting) return;

    // A network error from a previous attempt must not sit on screen while the
    // problem in front of the visitor is an empty field.
    say("", "idle");

    gradeBlanks();
    if (!form.reportValidity()) return;

    const data = new FormData(form);

    // Send what they meant, not the spaces around it.
    mustHaveContent.forEach((fieldName) => {
      const value = data.get(fieldName);
      if (typeof value === "string") data.set(fieldName, value.trim());
    });

    // Anything typed into the honeypot came from a bot, since the field is
    // hidden from people. Act as though it sent, and send nothing.
    if (String(data.get("_gotcha") || "").trim() !== "") {
      form.reset();
      say("Sent. We will come back to you shortly.", "ok");
      return;
    }
    data.delete("_gotcha");

    const email = String(data.get("email") || "").trim();

    // What the sender typed becomes the email subject, behind a prefix so every
    // enquiry from the site is filterable in an inbox. The field is then
    // dropped, since repeating it in the body adds nothing.
    const written = String(data.get("subject") || "").trim();
    data.set("_subject", "Bottle Builders enquiry: " + written);
    data.delete("subject");

    submitting = true;
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
      submitting = false;
      submit.disabled = false;
      // Disabling a focused button drops focus to <body>, which sends a keyboard
      // visitor back to the top of the document. Put it back where they left it,
      // and only then, so focus is never taken from somewhere they moved to
      // while the request was in flight. The status paragraph is not the target:
      // it is already role="status" aria-live="polite", so it announces on its
      // own, and moving focus onto it would take focus to say so.
      if (document.activeElement === document.body) submit.focus();
    }
  });
}
