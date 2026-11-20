import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginForm from '~/components/auth/LoginForm.vue'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)

describe('LoginForm', () => {
  let login: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    navigateToMock.mockClear()
    login = vi.spyOn(useAuthStore(), 'login').mockResolvedValue()
  })

  async function submit(email: string, password: string) {
    const wrapper = await mountSuspended(LoginForm)
    await wrapper.find('#email').setValue(email)
    await wrapper.find('#password').setValue(password)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    return wrapper
  }

  it('requires email and password before calling the API', async () => {
    const wrapper = await submit('', '')

    expect(wrapper.find('[data-test="email-error"]').text()).toBe('Email is required.')
    expect(wrapper.find('[data-test="password-error"]').text()).toBe('Password is required.')
    expect(login).not.toHaveBeenCalled()
  })

  it('rejects a malformed email address', async () => {
    const wrapper = await submit('not-an-email', 'secret')

    expect(wrapper.find('[data-test="email-error"]').text()).toBe('Enter a valid email address.')
    expect(login).not.toHaveBeenCalled()
  })

  it('logs in with valid input and goes to the dashboard', async () => {
    await submit('admin@example.com', 'secret')

    expect(login).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret', remember: false })
    expect(navigateToMock).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('shows server-side field errors', async () => {
    login.mockRejectedValueOnce(new ApiError('Invalid.', 422, { email: ['These credentials do not match our records.'] }))

    const wrapper = await submit('admin@example.com', 'wrong')

    expect(wrapper.find('[data-test="email-error"]').text()).toBe('These credentials do not match our records.')
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
