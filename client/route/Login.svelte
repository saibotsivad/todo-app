<script>
	import Container from 'component/Container.svelte'
	import ErrorList from 'component/ErrorList.svelte'
	import { createEventDispatcher } from 'svelte'

	export let asr
	export let disabled
	export let errors
	export let success
	let email
	let password

	const dispatch = createEventDispatcher()
</script>

<Container>
	<form {disabled} on:submit|preventDefault={() => dispatch('login', { email, password })}>
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
	{#if success}
		<p>Success logging in, one moment while we wrap things up and redirect you...</p>
	{/if}
	<p>
		Don't have an account?
		<a href={asr.makePath('signup')}>
			Create an account today!
		</a>
	</p>
	<ErrorList {errors} />
</Container>
