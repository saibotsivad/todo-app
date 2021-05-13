<script>
	// Vertical Alignment: https://getbootstrap.com/docs/5.0/layout/columns/#vertical-alignment
	// string: <"start" | "center" | "end">
	export let alignSelf = undefined
	$: align = alignSelf ? `align-items-${alignSelf}` : ''

	// string|number: <"1" | ... | "12">
	export let size = undefined
	export let sizes = undefined
	$: col = size ? `col-${size}` : 'col'
</script>

<div class="col {align}">
	<slot></slot>
</div>
