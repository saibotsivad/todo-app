<script>
	import Container from 'component/Container.svelte'
	import { createEventDispatcher } from 'svelte'

	export let disabled
	export let user

	const dispatch = createEventDispatcher()
</script>


<Container>
	<h1>Hello!</h1>

	<p>You are logged in as {user.attributes.email}</p>

	<p>
		<button on:click={() => dispatch('logout')} {disabled}>
			log out
		</button>
	</p>

	<hr>

	<uiView />
</Container>
