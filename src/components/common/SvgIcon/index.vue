<template>
	<svg aria-hidden="true" :class="[svgClass, size ? `icon--${size}` : '']">
		<use :href="iconClassName" fill="currentColor" />
	</svg>
</template>

<script>
export default {
	name: 'SvgIcon',
	props: {
		// 自定义类名
		className: {
			type: String,
			default: '',
		},
		// 图标名
		name: {
			type: String,
			required: true,
		},
		// color: {
		// 	type: String,
		// 	default: '#333',
		// },
		loading: Boolean,
		size: String,
		disabled: Boolean,
	},

	computed: {
		iconClassName() {
			return `#${this.loading ? 'loading' : this.name ? this.name : ''}`
		},
		svgClass() {
			if (this.className) {
				return `svg-icon${this.className}${this.loading ? ' loading' : ''}${this.disabled ? ' disabled' : ''}`
			}
			return `svg-icon${this.loading ? ' loading' : ''}${this.disabled ? ' disabled' : ''}`
		},
	},
}
</script>
<style scoped lang="scss">
svg:focus {
	outline: none;
}
.svg-icon {
	// color: v-bind(color);
	color: var(--color-text);
	// font-size: 24px;
	font-size: inherit;
	width: 1em;
	height: 1em;
	position: relative;
	fill: currentColor;
	vertical-align: -2px;
	&.loading {
		animation: rotating 2s linear infinite;
	}
	&.disabled {
		color: #6b6c6f;
		cursor: not-allowed !important;
		// pointer-events: none;
	}
}
@keyframes rotating {
	0% {
		transform: rotateZ(0);
	}

	100% {
		transform: rotateZ(360deg);
	}
}
.icon--mini {
	font-size: 12px;
}
.icon--small {
	font-size: 16px;
}
.icon--medium {
	font-size: 20px;
}
</style>
