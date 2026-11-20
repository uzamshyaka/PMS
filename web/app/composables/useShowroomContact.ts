/**
 * Showroom (business) contact details, managed under Admin → Website →
 * Contact details. Owner contact details are never shown on the public site.
 */
export function useShowroomContact() {
  const contact = useSiteContent().contact

  const telHref = `tel:${contact.phone.replace(/[^\d+]/g, '')}`

  function whatsappHref(message?: string): string {
    const base = `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`
    return message ? `${base}?text=${encodeURIComponent(message)}` : base
  }

  return { ...contact, telHref, whatsappHref, mailHref: `mailto:${contact.email}` }
}
