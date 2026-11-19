/**
 * Showroom (business) contact details from runtime config. Owner contact
 * details are never shown on the public site until that policy is decided.
 */
export function useShowroomContact() {
  const contact = useRuntimeConfig().public.contact

  const telHref = `tel:${contact.phone.replace(/[^\d+]/g, '')}`

  function whatsappHref(message?: string): string {
    const base = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`
    return message ? `${base}?text=${encodeURIComponent(message)}` : base
  }

  return { ...contact, telHref, whatsappHref, mailHref: `mailto:${contact.email}` }
}
