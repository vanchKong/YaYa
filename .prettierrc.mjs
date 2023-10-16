export default {
	/** 会把多行的 HTML(包括 HTML、 JSX、 Vue 和 Angular) 元素的＞放在最后一个属性的末尾，而不是另起一行（自闭合标签不受该选项控制）*/
	bracketSameLine: false,
	/**
	 * 指定 HTML 文件的空白字符敏感度。
	 * @param 可选项： css | strict | ignore
	 */
	htmlWhitespaceSensitivity: 'css',
	/** JSX 中使用单引号而不是双引号。*/
	jsxSingleQuote: true,
	/** 每行代码的长度限制。*/
	printWidth: 300,
	/**
	 * 指定对象字面量中的属性名引号添加方式。
	 * @param 可选项： consistent | as-needed | preserve
	 */
	quoteProps: 'consistent',
	/** 在所有代码语句的末尾添加分号。*/
	semi: false,
	/** 使用单引号而不是双引号。*/
	singleQuote: true,
	/**
	 * 指定添加尾后逗号的方式。
	 * @param 可选项： none | es5 | all
	 */
	trailingComma: 'all',
	/** 使用制表符缩进，而不是空格缩认 */
	useTabs: true,
}
