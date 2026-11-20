import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import AdminStatusBadge from '~/components/admin/AdminStatusBadge.vue'
import AdminVehicleForm from '~/components/admin/AdminVehicleForm.vue'
import AdminVehicleImages from '~/components/admin/AdminVehicleImages.vue'
import { resetMockDb } from '~/services/mock/db'
import type { VehicleImage } from '~/types/admin'
import { ROLE_DEFINITIONS } from '~/utils/permissions'

function signIn(role: string) {
  const auth = useAuthStore()
  auth.user = { id: 1, name: 'Test User', email: 't@example.com', last_login_at: null, roles: [role], permissions: [...ROLE_DEFINITIONS.find((r) => r.name === role)!.permissions] }
  auth.initialized = true
}

describe('AdminSidebar', () => {
  it.each([
    ['super-admin', 10],
    ['vehicle-manager', 4],
    ['reviewer', 2],
    ['enquiry-manager', 2],
  ])('%s sees %i modules', async (role, count) => {
    signIn(role)
    const wrapper = await mountSuspended(AdminSidebar)
    expect(wrapper.findAll('[data-test="nav-item"]')).toHaveLength(count)
  })

  it('expands a group to show its pages', async () => {
    signIn('super-admin')
    const wrapper = await mountSuspended(AdminSidebar)
    const group = wrapper.find('[data-nav="Vehicle Catalogue"] button')
    expect(group.attributes('aria-expanded')).toBe('false')
    await group.trigger('click')
    expect(group.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('a[href="/admin/catalogue/models"]').exists()).toBe(true)
  })
})

describe('AdminStatusBadge', () => {
  it('labels every vehicle and enquiry status', async () => {
    for (const [status, label] of [['pending_approval', 'Pending Approval'], ['follow_up', 'Follow-up Required'], ['archived', 'Archived'], ['inactive', 'Inactive']]) {
      const wrapper = await mountSuspended(AdminStatusBadge, { props: { status } })
      expect(wrapper.text()).toBe(label)
    }
  })
})

describe('AdminVehicleImages', () => {
  beforeEach(() => {
    let n = 0
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => `blob:preview-${++n}`), revokeObjectURL: vi.fn() }))
  })

  it('previews valid photos, rejects invalid ones, sets primary and removes', async () => {
    let images: VehicleImage[] = []
    const wrapper = await mountSuspended(AdminVehicleImages, {
      props: { 'modelValue': images, 'onUpdate:modelValue': (v: VehicleImage[]) => { images = v; wrapper.setProps({ modelValue: v }) } },
    })
    const input = wrapper.find('[data-test="image-input"]')
    const files = [new File(['x'], 'front.jpg', { type: 'image/jpeg' }), new File(['x'], 'back.png', { type: 'image/png' }), new File(['x'], 'spec.pdf', { type: 'application/pdf' })]
    Object.defineProperty(input.element, 'files', { value: files, configurable: true })
    await input.trigger('change')
    // Uploading goes through the admin services (mock here), which is asynchronous.
    await vi.waitFor(() => expect(images.map((i) => i.name)).toEqual(['front.jpg', 'back.png']))
    await flushPromises()
    expect(images[0]!.isPrimary).toBe(true)
    expect(wrapper.find('[data-test="image-errors"]').text()).toContain('spec.pdf')

    await wrapper.findAll('[data-test="make-primary"]')[1]!.trigger('click')
    expect(images.map((i) => i.isPrimary)).toEqual([false, true])

    await wrapper.findAll('[data-test="remove-image"]')[1]!.trigger('click')
    expect(images.map((i) => i.name)).toEqual(['front.jpg'])
    expect(images[0]!.isPrimary).toBe(true)
  })
})

describe('AdminVehicleForm', () => {
  beforeEach(() => { resetMockDb(); signIn('super-admin') })

  it('blocks the next step until required fields are valid', async () => {
    const wrapper = await mountSuspended(AdminVehicleForm, { props: { mode: 'create' } })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('[data-test="step-error"]').exists()).toBe(true)
    const messages = wrapper.findAll('[data-test="field-error"]').map((e) => e.text())
    expect(messages).toContain('Choose the owner.')
    expect(messages).toContain('Enter a listing title.')
    expect(wrapper.find('[aria-current="step"]').text()).toContain('Basic information')
  })

  it('a draft needs only owner, make, model and year', async () => {
    const wrapper = await mountSuspended(AdminVehicleForm, { props: { mode: 'create' } })
    await wrapper.find('[data-test="save-draft"]').trigger('click')
    await flushPromises()
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('[data-test="step-error"]').text()).toContain('owner, make, model and year')
  })

  it('edit mode prefills from the vehicle', async () => {
    const { MOCK_VEHICLES } = await import('~/data/admin/vehicles')
    const { toVehicleInput } = await import('~/utils/vehicle-form')
    const wrapper = await mountSuspended(AdminVehicleForm, { props: { mode: 'edit', initial: toVehicleInput(MOCK_VEHICLES[5]!) } })
    expect((wrapper.find('input[name="title"]').element as HTMLInputElement).value).toBe(MOCK_VEHICLES[5]!.title)
    expect(wrapper.find('[data-test="save-changes"]').exists()).toBe(true)
  })
})
