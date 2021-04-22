<script>
	import Container from 'component/Container.svelte'
	import ErrorList from 'component/ErrorList.svelte'
	import { createEventDispatcher } from 'svelte'

	export let asr
	export let disabled
	export let errors
	export let parameters
	export let submitting
	export let success
	let email
	let password

	const dispatch = createEventDispatcher()
</script>

<Container>
	{#if parameters && parameters.logout && !submitting && !success}
		<p>success logging out!</p>
	{/if}
	{#if !submitting && !success}
		<form disabled={disabled || success} on:submit|preventDefault={() => dispatch('login', { email, password })}>
			<p>
				Email
				<input type="text" bind:value={email} placeholder="email@site.com">
			</p>

			<p>
				Password
				<input type="password" bind:value={password}>
			</p>

			<p>
				<button type="submit">
					log in
				</button>
			</p>
		</form>
	{/if}
	{#if submitting}
		<p>Just a moment, logging you in...</p>
	{:else if success}
		<p>Success logging in, one moment while we wrap things up and redirect you...</p>
	{/if}
	<p>
		Forgot your password?
		<a href={asr.makePath('forgot')}>
			Send yourself a password reset link.
		</a>
	</p>
	<p>
		Don't have an account?
		<a href={asr.makePath('signup')}>
			Create an account today!
		</a>
	</p>
	<ErrorList {errors} />
</Container>
