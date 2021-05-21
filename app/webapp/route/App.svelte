<script>
	import Container from '@/component/Container.svelte'
	import { createEventDispatcher } from 'svelte'

	export let disabled
	export let submitting
	export let user

	const dispatch = createEventDispatcher()
</script>


<Container>
	<h1>Hello!</h1>

	<p>You are logged in as {user && user.attributes && user.attributes.email || 'N/A'}</p>

	<p>
		{#if submitting}
			Logging out, one moment...
		{:else}
			<button on:click={() => dispatch('logout')} {disabled}>
				Log Out
			</button>
		{/if}
	</p>

	<hr>

	<uiView />
</Container>
