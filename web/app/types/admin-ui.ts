import type { IconName } from '~/utils/icons'

/** Column definition for <AdminDataTable>. */
export interface AdminColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  class?: string
  /** Hide below this breakpoint to keep tables readable on small screens. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

/** Item for <AdminActionMenu>. */
export interface AdminAction {
  label: string
  icon?: IconName
  to?: string
  danger?: boolean
  onSelect?: () => void
}

/** Entry for <AdminTimeline>. */
export interface TimelineItem {
  id: string | number
  title: string
  at: string
  actor?: string
  body?: string
  tone?: 'default' | 'success' | 'danger' | 'warning'
}
