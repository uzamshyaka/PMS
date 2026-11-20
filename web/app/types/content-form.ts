export interface ContentField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'number' | 'select' | 'checkbox' | 'color' | 'image' | 'vehicles'
  required?: boolean
  maxLength?: number
  min?: number
  max?: number
  hint?: string
  options?: { value: string, label: string }[]
  /** Spans both columns. */
  wide?: boolean
}

export interface ContentGroup {
  title: string
  description?: string
  fields: ContentField[]
}
