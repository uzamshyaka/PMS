import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import HomeBenefitsBar from '~/components/home/HomeBenefitsBar.vue'
import SiteHeader from '~/components/site/SiteHeader.vue'
import VehicleCard from '~/components/vehicle/VehicleCard.vue'
import VehicleEnquiryPanel from '~/components/vehicle/VehicleEnquiryPanel.vue'
import VehicleInspections from '~/components/vehicle/VehicleInspections.vue'
import { DEMO_VEHICLES } from '~/data/demo-vehicles'

const mercedes = DEMO_VEHICLES.find((v) => v.slug === 'mercedes-benz-c-class-2021')!

describe('VehicleCard', () => {
  it('shows year badge, title, specs and KES price, linking to the details page', async () => {
    const wrapper = await mountSuspended(VehicleCard, { props: { vehicle: mercedes } })

    expect(wrapper.text()).toContain('2021')
    expect(wrapper.text()).toContain('Mercedes-Benz C-Class C200 AMG Line')
    expect(wrapper.find('[data-test="specs"]').text()).toMatch(/45,000 km\s*\|\s*Automatic\s*\|\s*Petrol/)
    expect(wrapper.find('[data-test="price"]').text()).toBe('KES 5,490,000')
    expect(wrapper.find('a').attributes('href')).toBe('/inventory/mercedes-benz-c-class-2021')
    expect(wrapper.find('[data-test="location"]').text()).toBe('Nairobi')
    expect(wrapper.find('[data-test="payment"]').text()).toBe('Cash')
  })
})

describe('VehicleCard payment terms', () => {
  it('labels Lipa Mdogo Mdogo vehicles', async () => {
    const evoque = DEMO_VEHICLES.find((v) => v.slug === 'range-rover-evoque-2020')!
    const wrapper = await mountSuspended(VehicleCard, { props: { vehicle: evoque } })
    expect(wrapper.find('[data-test="payment"]').text()).toBe('Lipa Mdogo Mdogo')
  })
})

describe('HomeBenefitsBar', () => {
  it('renders four benefits without claiming every vehicle is verified', async () => {
    const wrapper = await mountSuspended(HomeBenefitsBar)

    expect(wrapper.findAll('[data-test="benefit"]')).toHaveLength(4)
    expect(wrapper.text().toLowerCase()).not.toContain('verified')
  })
})

describe('SiteHeader', () => {
  it('has one inventory link (new and used together) and no finance or trade-in', async () => {
    const wrapper = await mountSuspended(SiteHeader)
    const text = wrapper.text()

    for (const label of ['Home', 'Inventory', 'About Us', 'Contact']) expect(text).toContain(label)
    expect(text).not.toMatch(/new cars|used cars/i)
    expect(text).not.toMatch(/finance|trade-in/i)
  })

  it('toggles the mobile menu', async () => {
    const wrapper = await mountSuspended(SiteHeader)
    const toggle = wrapper.find('[data-test="menu-toggle"]')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('[data-test="mobile-nav"]').isVisible()).toBe(true)
  })
})

describe('VehicleInspections', () => {
  it('only shows a Verified badge for independent inspections with evidence', async () => {
    const wrapper = await mountSuspended(VehicleInspections, {
      props: {
        inspections: [
          { source: 'independently_verified', title: 'A', date: '2026-10-01', summary: 'x', hasEvidence: true },
          { source: 'independently_verified', title: 'B', date: '2026-10-02', summary: 'x', hasEvidence: false },
          { source: 'owner_declared', title: 'C', date: '2026-10-03', summary: 'x', hasEvidence: true },
        ],
      },
    })

    expect(wrapper.findAll('[data-test="verified-badge"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('Declared by owner')
  })
})

describe('VehicleEnquiryPanel', () => {
  it('uses the showroom number and a prefilled WhatsApp message, never owner details', async () => {
    const wrapper = await mountSuspended(VehicleEnquiryPanel, { props: { vehicle: mercedes } })
    const whatsapp = wrapper.find('[data-test="whatsapp"]').attributes('href')!

    expect(wrapper.find('[data-test="call"]').attributes('href')).toBe('tel:+254700000000')
    expect(whatsapp).toMatch(/^https:\/\/wa\.me\/254700000000\?text=/)
    expect(decodeURIComponent(whatsapp)).toContain('2021 Mercedes-Benz C-Class C200 AMG Line in Nairobi')
    expect(wrapper.text().toLowerCase()).not.toContain('owner')
  })
})
