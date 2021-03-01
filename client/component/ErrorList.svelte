<script>
	export let errors
</script>

{#if errors && errors.length}

	<ul>
	{#each errors as error}

		<li>
			<strong>{error.code} - {error.title}</strong>
			<br>
			{error.detail}
			{#if error.meta}
				<br>
				<strong>Metadata:</strong>
				<br>
				<pre>{JSON.stringify(error.meta, undefined, 2)}</pre>
			{/if}
		</li>

	{/each}
	</ul>

{/if}
