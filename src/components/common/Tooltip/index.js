// 继承原生tooltip，且在unplugincomponent 中排除原生tooltip的自动引入
import { Tooltip } from 'element-ui'
import 'element-ui/lib/theme-chalk/tooltip.css'

const TooltipExtends = {
	extends: Tooltip,
	name: 'ElTooltip',
	props: {
		effect: {
			type: String,
			default: 'light',
		},
	},
	methods: {},
}

export default {
	install(Vue) {
		Vue.component(Tooltip.name, TooltipExtends)
	},
}
