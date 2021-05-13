import StateRouter from 'abstract-state-router'
import SvelteRenderer from 'svelte-state-renderer'

export const router = StateRouter(SvelteRenderer(), document.querySelector('body'))
router.setMaxListeners(20)
