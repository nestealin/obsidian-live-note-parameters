# Live Note Parameters · 笔记实时参数

在笔记中直接填写参数，全文实时同步，临时值按标签页隔离。默认值保留在 Markdown；本次填写留在内存。

## 安装与使用

电脑端 MVP，最低 Obsidian 1.13.7。下载 [Release](https://github.com/nestealin/obsidian-live-note-parameters/releases) 的 `main.js`、`manifest.json`、`styles.css`，放入库的 `.obsidian/plugins/live-note-parameters/` 后启用。使用自定义配置目录时替换 `.obsidian`。已提交[官方社区目录](https://community.obsidian.md/plugins/live-note-parameters)，市场安装以审核结果和页面按钮状态为准。也可通过 BRAT 添加 `nestealin/obsidian-live-note-parameters`。

1. 在笔记已有 Frontmatter 中加入 `doc_vars` 字符串映射；正文和行内代码使用 `{{PROJECT_ID}}`。
2. 需要填写的语法代码块在语言后加 `docvars`；固定示例的普通代码块保持原样。
3. 在实时预览或阅读模式点击下划线字段填写，同标签页同名参数同步。
4. 使用代码块原有复制按钮。安装 Copy Inline Code 2.1.0 后，行内代码沿用它的复制图标并复制当前值；普通行内复制仍由原插件处理。
5. 新标签页从默认值开始。`Esc` 重置单项；命令面板的“重置当前标签页变量”重置全部。

[完整示例](examples/live-note-parameters.md) 可直接复制到测试库。

## 日常维护

实时预览上方的“笔记参数”面板、工具栏滑块图标或“管理笔记参数”命令可进入维护。默认折叠，支持新增、修改默认值、重命名、删除、引用计数、定位和插入。

定义编辑先保留为草稿，“保存定义”才写入笔记，“取消”丢弃草稿。重命名展示影响范围，保存时连同受支持引用一起修改；仍有引用的参数不能直接删除。原生一次撤销恢复本次定义编辑，其它 Frontmatter 和正文保留。

默认值变化不会清空已有标签页的临时覆盖值。手工修改 YAML 也可以更新定义；有冲突的草稿会被拒绝保存。

旧版 `<!-- doc-vars {...} -->` 声明提供“预览迁移”，确认后一次转换为 Frontmatter 并移除旧注释。两种声明同时存在时显示错误，不静默选择优先级。

## 边界

- 默认值必须是最多 512 字符的单行字符串。日期、数字和布尔含义的文本请加引号；不支持表达式、嵌套字段或参数中的 YAML 锚点。
- 参数按字面量代入，不自动转义，也不执行命令。
- 临时填写不写笔记、插件数据或工作区状态；默认值本身仍是笔记明文，复制结果进入系统剪贴板。
- 当前验收覆盖 macOS / Obsidian 1.13.7 的主窗口、双模式及 Copy Inline Code 2.1.0；移动端、弹出窗口、跨笔记嵌入、复杂嵌套和所有主题组合尚未验收。

开发、维护和回退入口见 [英文 README](README.md) 与 [维护说明](docs/maintenance.md)。
