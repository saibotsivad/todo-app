<script>
	// Vertical Alignment: https://getbootstrap.com/docs/5.0/layout/columns/#vertical-alignment
	// string: <"start" | "center" | "end">
	export let alignItems = undefined
	$: align = alignItems ? `align-items-${alignItems}` : ''

	// Horizontal Alignment: https://getbootstrap.com/docs/5.0/layout/columns/#horizontal-alignment
	// string: <"start" | "center" | "end" | "around" | "between" | "evenly">
	export let justifyContent = undefined
	$: justify = justifyContent ? `justify-content-${justifyContent}` : ''

</script>

<div class="row {align}">
	<slot></slot>
</div>
