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
		Sign Up
		<small>
			<a href={asr.makePath('login')}>
				or log in
			</a>
		</small>
	</h1>

	<p>Get yourself a free account today!</p>

	{#if success}
		<p>
			Success!
			<a href={asr.makePath('login')}>Go here</a>
			to log in!
		</p>
	{:else}
		<form on:submit|preventDefault={() => dispatch('signup', { email, password })}>
			<p>
				Email
				<input type="text" bind:value={email} placeholder="email@site.com">
			</p>

			<p>
				Password
				<input type="password" bind:value={password}>
			</p>

			<p>
				<button type="submit" {disabled}>
					Sign Up
				</button>
			</p>
		</form>
	{/if}

	<ErrorList {errors} />
</Container>
