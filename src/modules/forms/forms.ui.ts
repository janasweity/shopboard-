import { requireElement } from '../../shared/ui/dom.ts'

export function initializeForms() {
  const view = requireElement('#page-view', HTMLElement)
  const registration = requireElement('#registration-dialog', HTMLDialogElement)
  const reopen = requireElement('.reopen-button', HTMLButtonElement)
  const registrationStatus = requireElement('#registration-status', HTMLElement)
  requireElement('form', HTMLFormElement, registration).addEventListener(
    'submit',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLFormElement)) return
      event.preventDefault()
      registration.close()
      registrationStatus.textContent =
        'Successful demo validation only. No account was created; no details were sent or stored.'
    },
  )
  registration.addEventListener('close', () => {
    requireElement('form', HTMLFormElement, registration).reset()
    reopen.hidden = false
    reopen.focus()
  })
  reopen.addEventListener('click', () => {
    registrationStatus.textContent = ''
    registration.show()
    reopen.hidden = true
    requireElement('#email', HTMLInputElement).focus()
  })

  view.addEventListener('submit', (event) => {
    const target = event.target
    if (!(target instanceof HTMLFormElement)) return
    if (target.id === 'contact-form') {
      event.preventDefault()
      target.reset()
      requireElement('#contact-status', HTMLElement).textContent =
        'Demo complete. No message was sent and your entries have been cleared.'
    }
  })

  return {
    reset(page: string) {
      requireElement('#registration', HTMLElement).hidden = page !== 'home'
      requireElement('form', HTMLFormElement, registration).reset()
      registrationStatus.textContent = ''
    },
  }
}
