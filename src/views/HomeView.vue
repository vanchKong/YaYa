<template>
	<div class="container">
		<div class="layout-drop" ref="layout" v-if="fileList.length == 0 || dragStatus">
			<div :class="['inner-box', { dashed: dragStatus }]">
				<div class="icon-list">
					<SvgIcon name="JPG"></SvgIcon>
					<SvgIcon name="PNG"></SvgIcon>
					<SvgIcon name="GIF"></SvgIcon>
					<SvgIcon name="floder"></SvgIcon>
				</div>
				<p class="flashing">拖入 JPG / PNG / GIF 开始压缩</p>
				<!-- <code class="flashing">gltfpack -i path -o path -cf</code> -->
				<p class="flashing">为你的图片减减肥</p>
				<!-- <div
			class="el-upload-dragger"
			:class="{
				'is-dragover': dragStatus,
			}"
			@drop.prevent="onDrop"
			@dragover.prevent="onDragover"
			@dragleave.prevent="dragover = false"
		>
			123
		</div> -->
			</div>
			<!-- <HelloWorld :msg="'123123'" @click.native="redo"></HelloWorld> -->
		</div>
		<div v-else class="layout-list">
			<p class="menu-item">
				<el-tooltip effect="dark" content="撤回" placement="bottom">
					<SvgIcon name="undo" :disabled="!canUndo" @click.native="undo"></SvgIcon>
				</el-tooltip>
				<el-tooltip effect="dark" content="压缩" placement="bottom">
					<SvgIcon name="redo" :disabled="!canRedo" @click.native="redo"></SvgIcon>
				</el-tooltip>

				<span style="flex: 1"></span>
				<el-tooltip effect="dark" content="清除" placement="bottom">
					<SvgIcon name="clear" @click.native="clear" :disabled="selectedList.length <= 0"></SvgIcon>
				</el-tooltip>
			</p>
			<p
				:class="['file-item', { selected: selectedList.includes(item.id) }]"
				@click.exact="selectItem(item.id)"
				@click.shift.exact="shiftDown(item.id)"
				v-for="(item, index) in fileList"
				:key="item.id"
			>
				<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
					<SvgIcon :name="item.compressed ? 'success' : 'pic'" :loading="item.loading" style="margin-right: 10px"></SvgIcon>{{ item.name }}</span
				>
				<span>{{ item.originSize }}</span>
				<span>{{ item.compressSize }}</span>
				<span v-show="item.compressed"> <SvgIcon name="down" style="margin-right: 2px"></SvgIcon>{{ item.rate }}</span>
			</p>
		</div>
		<div class="footer-box">
			<span> 输出方式：原始路径替换 </span>
			<div>
				输出质量：
				<select name="qulity" id="qulity" v-model="qulity" @change="qulityChange">
					<option v-for="item in 9" :value="item * 10" :key="item">{{ item * 10 }}</option>
				</select>
			</div>
		</div>
	</div>
</template>

<script>
import { invoke } from '@tauri-apps/api/tauri'
// import { useEventListener } from '@vueuse/core'
import { listen } from '@tauri-apps/api/event'
import { readBinaryFile, writeBinaryFile, readDir, copyFile, BaseDirectory } from '@tauri-apps/api/fs'
import imageTiny from './index'

export default {
	data() {
		return {
			timer: null,
			dragStatus: false,
			fileList: [],
			currentIndex: null,
			shiftIndex: null,
			prefix: '',
			suffix: '',
			qulity: localStorage.getItem('qulity') || 80,
			pathSplit: '/',
			unit: 1000,
		}
	},
	created() {
		console.log(navigator.userAgent)
		if (navigator.userAgent.toLowerCase().indexOf('windows') != -1) {
			this.pathSplit = '\\'
			this.unit = 1024
			console.log(this.pathSplit)
		}
	},
	async mounted() {
		// useEventListener(this.$refs.layout, 'dragstart', (e) => {
		// 	e.preventDefault()
		// 	console.log('dragstart')
		// })
		// useEventListener(this.$refs.layout, 'dragend', (e) => {
		// 	e.preventDefault()
		// 	console.log('dragend')
		// })
		// useEventListener(this.$refs.layout, 'dragleave', (e) => {
		// 	e.preventDefault()
		// 	this.dragStatus = false
		// 	console.log('dragleave')
		// })
		// useEventListener(this.$refs.layout, 'dragenter', (e) => {
		// 	e.preventDefault()
		// 	this.dragStatus = true
		// 	console.log('dragenter')
		// })
		// useEventListener(this.$refs.layout, 'drop', (e) => {
		// 	console.log('drop')
		// 	e.preventDefault()
		// 	this.dragStatus = false
		// 	console.log(e.dataTransfer.items)
		// 	const items = e.dataTransfer.items
		// 	for (let i = 0; i < items.length; i++) {
		// 		const item = items[i]
		// 		if (item.kind == 'file') {
		// 			let entry = item.webkitGetAsEntry()
		// 			console.log(entry)
		// 			this.getFilesFromEntry(entry)
		// 		}
		// 	}
		// })
		listen('tauri://file-drop-hover', () => {
			this.dragStatus = true
		})
		listen('tauri://file-drop-cancelled', () => {
			this.dragStatus = false
		})
		listen('tauri://file-drop', this.dropFile)
	},
	computed: {
		selectedList() {
			let selectedList = []
			if (this.currentIndex == null && this.shiftIndex == null) {
				selectedList = []
			} else if (this.currentIndex != null && this.shiftIndex == null) {
				// selectedList = [this.currentIndex]
				selectedList = [this.fileList[this.currentIndex].id]
			} else if (this.shiftIndex >= this.currentIndex) {
				selectedList = this.fileList.map((item, index) => {
					if (index <= this.shiftIndex && index >= this.currentIndex) {
						return item.id
					}
				})
				// selectedList = Array.from({ length: this.shiftIndex - this.currentIndex + 1 }, (v, i) => {
				// 	return i + this.currentIndex
				// })
			} else {
				selectedList = this.fileList.map((item, index) => {
					if (index >= this.shiftIndex && index <= this.currentIndex) {
						return item.id
					}
				})
				// selectedList = Array.from({ length: this.currentIndex - this.shiftIndex + 1 }, (v, i) => {
				// 	return i + this.shiftIndex
				// })
			}
			return selectedList
		},
		canUndo() {
			let compressedList = this.fileList.filter((item) => item.compressed)
			compressedList = compressedList.map((item) => item.id)
			// console.log(compressedList, 111)
			return this.selectedList.some((item) => compressedList.includes(item))
		},
		canRedo() {
			let unCompressedList = this.fileList.filter((item) => !item.compressed)
			unCompressedList = unCompressedList.map((item) => item.id)
			// console.log(unCompressedList, 222)
			return this.selectedList.some((item) => unCompressedList.includes(item))
		},
	},
	methods: {
		qulityChange() {
			console.log(this.qulity)
			localStorage.setItem('qulity', this.qulity)
		},
		redo() {
			// console.log(22222)

			this.fileList
				.filter((item) => {
					return this.selectedList.includes(item.id) && !item.compressed
				})
				.forEach((item) => {
					this.compressFileItem(item)
				})
		},
		undo() {
			if (!this.canUndo) {
				return
			}
			this.fileList
				.filter((item) => {
					return this.selectedList.includes(item.id) && item.compressed
				})
				.forEach((item) => {
					writeBinaryFile({ path: item.originPath, contents: item.originU8File })
					console.log(item)
					item.compressSize = ''
					item.compressed = false
					item.rate = ''
				})
		},
		clear() {
			if (this.selectedList.length <= 0) {
				return
			}
			// const shiftIndex =  this.shiftIndex||0
			if (this.shiftIndex == null) {
				this.fileList.splice(this.currentIndex, 1)
			} else {
				const length = Math.max(this.currentIndex, this.shiftIndex) - Math.min(this.currentIndex, this.shiftIndex) + 1
				console.log(this.currentIndex, this.shiftIndex, Math.min(this.currentIndex, this.shiftIndex), length)
				this.fileList.splice(Math.min(this.currentIndex, this.shiftIndex), length)
			}
			console.log(this.fileList)
		},
		shiftDown(id) {
			// console.log(e)
			this.currentIndex = this.currentIndex || 0
			this.shiftIndex = this.fileList.findIndex((item) => item.id === id)
		},
		selectItem(id) {
			this.shiftIndex = null
			this.currentIndex = this.fileList.findIndex((item) => item.id === id)
			// console.log(this.currentIndex)
		},
		async dropFile(event) {
			this.dragStatus = false
			// console.log(event)
			const dirList = event.payload
			dirList.forEach((dirPath) => {
				this.readDir(dirPath)
			})
			// console.log(result)
			// readBinaryFile()
			// const fileName = event.payload[0].split('/').slice(-1)
			// const path = event.payload[0].split('/').slice(0, -1)
			// const afterPath = `${path.join('/')}/compressed_${fileName}`
		},
		readDir(dirPath) {
			readDir(dirPath)
				.then((contentInFolder) => {
					// console.log(contentInFolder)
					contentInFolder
						.filter((item) => !item.name.startsWith('.'))
						.forEach((item) => {
							if (['jpeg', 'jpg', 'png', 'gif'].includes(item.name.split(this.pathSplit).slice(-1)[0].split('.').slice(-1))) {
								this.readFile(item.path)
							} else {
								this.readDir(item.path)
							}
						})
				})
				.catch((err) => {
					console.log(err)
					// dirPath实际为文件路径，而不是文件夹路径
					if (err.indexOf('Not a directory') != -1 || err.indexOf('目录名称无效') != -1) {
						const fullFileName = dirPath.split(this.pathSplit).slice(-1)[0]
						const fileType = fullFileName.split('.').slice(-1)[0]
						// console.log(fileType[0])
						if (['jpeg', 'jpg', 'png', 'gif'].includes(fileType.toLocaleLowerCase())) {
							this.readFile(dirPath)
						}
					}
				})
		},
		readFile(originPath) {
			// console.log(originPath)
			readBinaryFile(originPath)
				.then((fileU8Array) => {
					this.compressSource(fileU8Array, originPath)
				})
				.catch((err) => {
					console.log(err)
				})
		},
		async compressFileItem(item) {
			const index = this.fileList.findIndex((fileItem) => fileItem.id === item.id)

			const originPath = item.originPath
			const fullFileName = originPath.split(this.pathSplit).slice(-1)[0]
			const fileType = fullFileName.split('.').slice(-1)[0]
			const fileName = fullFileName.split('.').slice(0, -1).join('.')
			const path = originPath.split(this.pathSplit).slice(0, -1)
			const afterPath = `${path.join(this.pathSplit)}${this.pathSplit}${this.prefix}${fileName}${this.suffix}.${fileType}`

			const tinyFile = await imageTiny(item.originU8File, this.qulity)
			this.fileList[index].compressed = true
			this.fileList[index].rate = `${(((item.originU8File.byteLength - tinyFile.size) * 100) / item.originU8File.byteLength).toFixed(2)}%`
			this.fileList[index].compressSize = `${tinyFile.size / this.unit} KB`
			this.handleSaveFile(tinyFile, afterPath)
		},
		async compressSource(file, originPath) {
			console.log(originPath)
			const fullFileName = originPath.split(this.pathSplit).slice(-1)[0]
			const fileType = fullFileName.split('.').slice(-1)[0]
			const fileName = fullFileName.split('.').slice(0, -1).join('.')
			const path = originPath.split(this.pathSplit).slice(0, -1)
			// console.log(path,`${path.join(this.pathSplit)}`)
			const afterPath = `${path.join(this.pathSplit)}${this.pathSplit}${this.prefix}${fileName}${this.suffix}.${fileType}`
			let fileItem = {
				id: this.getUuid(),
				name: fullFileName,
				originSize: `${file.byteLength / this.unit} KB`,
				compressSize: ``,
				originU8File: file,
				rate: '0%',
				loading: true,
				compressed: false,
				originPath,
			}
			this.fileList.push(fileItem)
			const tinyFile = await imageTiny(file, this.qulity)
			// console.log(tinyFile)
			fileItem.loading = false
			fileItem.compressed = true
			fileItem.compressSize = `${tinyFile.size / this.unit} KB`
			fileItem.rate = `${(((file.byteLength - tinyFile.size) * 100) / file.byteLength).toFixed(2)}%`
			this.handleSaveFile(tinyFile, afterPath)
		},

		// 保存单个图片
		async handleSaveFile(file, afterPath) {
			const reader = new FileReader()
			reader.readAsArrayBuffer(file)
			reader.onload = (e) => {
				let fileU8A = new Uint8Array(e.target?.result)
				writeBinaryFile({ contents: fileU8A, path: afterPath })
			}
			// console.log(this.fileList)
		},

		/**
		 * 获取Uuid
		 */
		getUuid() {
			var s = []
			var hexDigits = '0123456789abcdef'
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
			}
			s[14] = '4'
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
			s[8] = s[13] = s[18] = s[23] = '-'
			return s.join('')
		},
		// getFilesFromEntry(entry) {
		// 	if (entry.isFile) {
		// 		entry.file(
		// 			(file) => {
		// 				// console.log(file)
		// 			},
		// 			(err) => {
		// 				// console.log(err)
		// 			},
		// 		)
		// 	} else {
		// 		console.log(entry.__proto__)
		// 	}
		// },
		// fileChange(e) {
		// 	console.log(e)
		// },

		// onDragover(e) {
		// 	e.preventDefault()
		// 	console.log('onDragover')
		// 	// if (!this.disabled) {
		// 	// 	this.dragover = true
		// 	// }
		// },
		// onDrop(e) {
		// 	e.preventDefault()
		// 	console.log('onDrop')
		// 	console.log(e.dataTransfer.files)
		// },
	},
}

// const iface = {
// 	read: function (path) {
// 		return readBinaryFile(path)
// 	},
// 	write: function (path, data) {
// 		console.log(data, 3333)
// 		writeBinaryFile(path, data)
// 	},
// }
// console.log(library)
// await fetch('/public/library.wasm')
// 	.then((res) => {
// 		// console.log(res)
// 		return res.arrayBuffer()
// 	})
// 	.then((arrayBuffer) => {
// 		// console.log(arrayBuffer)
// 		gltfpack.init(arrayBuffer)
// 	})
// gltfpack.init(library)
// readBinaryFile('/public/library.wasm').then((res) => {
// 	gltfpack.init(res)
// })
// gltfpack.pack(['-i', './originModels/frms.glb', '-o', './targetModels/frms-gltapack.glb', '-cf'], iface)
// console.log(await fs.readBinaryFile('/Users/vanch/Desktop/frms.glb'))
// useEventListener(this.$refs.layout, 'dragover', (e) => {
// 	e.preventDefault()
// 	console.log('dragover')
// 	this.dragStatus = true
// 	// if (this.timer) {
// 	// 	clearTimeout(this.timer)
// 	// 	this.timer = null
// 	// }
// 	// this.timer = setTimeout(() => {
// 	// 	this.dragStatus = false
// 	// }, 100)
// })

// listen('tauri://file-drop', async (event) => {
// 	// console.log(event.payload[0])
// 	const fileName = event.payload[0].split('/').slice(-1)
// 	const path = event.payload[0].split('/').slice(0, -1)
// 	const afterPath = `${path.join('/')}/compressed_${fileName}`
// 	// console.log(fileName, path, afterPath)
// 	this.dragStatus = false

// 	axios.post('http://127.0.0.1:3000/glb', { path: event.payload[0], afterPath }).then((res) => {
// 		console.log(res)
// 	})

// 	// gltfpack
// 	// 	.pack(['-i', event.payload[0], '-o', afterPath, '-cf'], iface)
// 	// 	.then(function (log) {
// 	// 		// console.log(log)
// 	// 	})
// 	// 	.catch(function (err) {
// 	// 		// console.log(err)
// 	// 	})

// 	// readBinaryFile(event.payload[0]).then((res) => {
// 	// 	console.log(res)
// 	// })
// })
</script>
<style lang="scss" scoped>
* {
	outline: none;
}
.container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	.footer-box {
		// height: 20px;
		padding: 8px 10px;
		border-top: 1px solid var(--color-background-mute);
		font-size: 12px;
		font-weight: bold;
		display: flex;
		justify-content: space-between;
	}
}
.layout-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	> :nth-child(odd) {
		background-color: var(--color-background-soft);
	}
	.menu-item {
		position: sticky;
		top: 0;
		padding: 8px 10px;
		font-size: 18px;
		display: flex;
		gap: 10px;
		align-items: center;
		.svg-icon {
			cursor: pointer;
		}
	}
	.file-item {
		padding: 4px 12px;
		transition: all 0.2s;
		// display: flex;
		// justify-content: space-between;
		// align-items: center;
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr 1fr;
		cursor: default;
		font-size: 12px;
		font-weight: bold;
		&.selected {
			background-color: rgb(86, 165, 255);
		}
	}
}
.layout-drop {
	padding: 80px 40px;
	flex: 1;
	// height: 100vh;
	.inner-box {
		width: 100%;
		height: 100%;
		padding: 0 40px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		&.dashed {
			border: dashed 1px var(--color-text);
		}
	}
	.icon-list {
		margin-bottom: 20px;
		display: flex;
		// gap: 20px;
		font-size: 40px;
		align-self: stretch;
		justify-content: space-between;
	}
	.flashing {
		font-size: 14px;
		font-weight: bold;
		cursor: default;
		animation: flashing 1s ease-in-out infinite alternate;
	}
}
@keyframes flashing {
	0% {
		opacity: 1;
	}
	100% {
		opacity: 0.55;
	}
}
</style>
