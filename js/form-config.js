/* Contact form endpoint.

   The form posts to Formspree, which emails each submission to the address on
   the Formspree account. There is no key and no secret here: a Formspree form
   ID is a public endpoint by design, the same way a mailto address is public.

   To fill this in:
     1. Create a form at formspree.io and copy its endpoint.
     2. It looks like https://formspree.io/f/abcdwxyz. Paste the whole URL.

   While this is left as a placeholder the form falls back to opening the
   visitor's email app, which is what it does today. Nothing breaks. */

export const FORM_ENDPOINT = "https://formspree.io/f/xjybjwoy";

export const isConfigured = !FORM_ENDPOINT.includes("YOUR-FORM-ID");
