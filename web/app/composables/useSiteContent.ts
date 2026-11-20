export interface SiteContent {
  homepage: { heroEyebrow: string, heroTitle: string, heroScript: string, heroSubtitle: string }
  about: { title: string, intro: string, body: string }
  contact: { phone: string, whatsapp: string, email: string, address: string, hours: string }
  branding: { siteName: string, tagline: string, accentColour: string, logoUrl: string }
  seo: { metaTitle: string, metaDescription: string, ogImageUrl: string }
}

export function defaultSiteContent(): SiteContent {
  const config = useRuntimeConfig().public
  return {
    homepage: { heroEyebrow: 'Quality cars. Trusted service.', heroTitle: 'Drive', heroScript: 'Excellence', heroSubtitle: 'Discover quality vehicles selected for your next journey.' },
    about: { title: 'Quality vehicles, clearly presented', intro: 'Car Showcase presents quality vehicles with the information buyers actually need.', body: 'Our team prepares and reviews every listing before it goes live, so what you see online is what you will find in the showroom.' },
    contact: { ...config.contact },
    branding: { siteName: config.appName, tagline: 'Quality Vehicles', accentColour: '#b08d57', logoUrl: '' },
    seo: { metaTitle: 'Car Showcase: Quality Cars, Trusted Service', metaDescription: 'Discover quality vehicles selected for your next journey.', ogImageUrl: '' },
  }
}

/** Merge API content over the defaults, section by section. */
export function mergeSiteContent(remote: Partial<SiteContent>): SiteContent {
  const d = defaultSiteContent()
  return {
    homepage: { ...d.homepage, ...remote.homepage },
    about: { ...d.about, ...remote.about },
    contact: { ...d.contact, ...remote.contact },
    branding: { ...d.branding, ...remote.branding },
    seo: { ...d.seo, ...remote.seo },
  }
}

/**
 * Website content managed under Admin → Website (hero text, About, contact
 * details, branding, SEO). Loaded once per page load by plugins/site-content.ts,
 * before rendering, so server and browser always show the same text.
 */
export function useSiteContent(): SiteContent {
  return useState<SiteContent>('site-content', () => defaultSiteContent()).value
}
