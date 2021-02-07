<script>
	import { createEventDispatcher } from 'svelte'

	export let parameters
	let email
	let password

	const dispatch = createEventDispatcher()
</script>

<form on:submit|preventDefault={() => dispatch('login', { email, password })}>
	<p>
		email
		<input type="text" bind:value={email} placeholder="email@site.com">
	</p>

	<p>
		password
		<input type="password" bind:value={password}>
	</p>

	<p>
		<button type="submit">
			log in
		</button>
	</p>
</form>
