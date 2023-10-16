import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'
import path from 'path'
// 不同浏览器，自动css前缀
import autoprefixer from 'autoprefixer'
// 一个svg图标的插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
// unplugin-vue-components 按需自动引入组件
import Components from 'unplugin-vue-components/vite'
import { ElementUiResolver } from 'unplugin-vue-components/resolvers'
import copy from 'rollup-plugin-copy'

// https://vitejs.dev/config/
export default defineConfig({
	clearScreen: false,
	server: {
		port: 5172,
		strictPort: true,
	},
	envPrefix: ['VITE_', 'TAURI_'],
	build: {
		// Tauri uses Chromium on Windows and WebKit on macOS and Linux
		target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
		// don't minify for debug builds
		minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
		// 为调试构建生成源代码映射 (sourcemap)
		sourcemap: !!process.env.TAURI_DEBUG,
	},
	plugins: [
		vue2(),
		legacy({
			targets: ['ie >= 11'],
			additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
		}),
		copy({
			targets: [{ src: 'node_modules/@mxsir/image-tiny/dist/pngtiny-custom.wasm', dest: 'public' }],
			verbose: true,
			hook: 'writeBundle',
		}),
		Components({
			dts: true,
			resolvers: [
				ElementUiResolver({
					exclude: /ElTooltip/g,
				}),
			], // VuetifyUI按需自动引入，会在根目录生成 components.d.ts 文件
			// allowOverrides: true,
		}),
		createSvgIconsPlugin({
			// Specify the icon folder to be cached
			iconDirs: [path.resolve(__dirname, './src/assets/svg')],
			// Specify symbolId format
			symbolId: '[dir][name]',
			// symbolId: '[name]',
			// inject?: 'body-last' | 'body-first'
			// customDomId: '__svg__icons__dom__',
		}),
	],
	css: {
		postcss: {
			plugins: [
				autoprefixer({
					overrideBrowserslist: ['Android 4.1', 'iOS 7.1', 'Chrome > 31', 'ff > 31', 'ie >= 8'],
				}),
			],
		},
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
})
