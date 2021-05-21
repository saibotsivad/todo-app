<script>
	import Container from '@/component/Container.svelte'
	import ErrorList from '@/component/ErrorList.svelte'
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
	<h1>
		Forgot Password
		<small>
			<a href={asr.makePath('login')}>
				or log in
			</a>
		</small>
	</h1>

	<p>Enter your email to get a password reset link, if you have an account.</p>

	{#if success}
		<p>
			Success! Check your email for a password reset link.
		</p>
	{:else}
		<form on:submit|preventDefault={() => dispatch('submit', { email, password })}>
			<p>
				Email
				<input type="text" bind:value={email} placeholder="email@site.com">
			</p>

			<p>
				<button type="submit" {disabled}>
					Reset Password
				</button>
			</p>
		</form>
	{/if}

	<ErrorList {errors} />
</Container>
