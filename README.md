# Nes Doc Variables Demo

在普通 Markdown 中原位填写命令变量。输入仅属于当前标签页；同名字段同步，原有代码块复制按钮复制当前值。开发参考 Demo，版本 0.0.1，已在 macOS / Obsidian 1.13.7 验证。

## 试用

打开 NesDev 的 `zz-doc-vars-demo.md`，在实时预览或阅读模式点击下划线字段。`Esc` 恢复单字段默认值，命令面板的“重置当前标签页变量”恢复整页默认值。在新标签页打开同一文件时使用默认值。

源代码模式显示底层占位符；运行时填写不改变文件。语法和静态示例可并存：

````markdown
<!-- doc-vars {"PROJECT_ID":"demo-project","REGION":"us-central1"} -->

当前项目：{{PROJECT_ID}}

```bash docvars
gcloud compute backend-services list \
  --project="{{PROJECT_ID}}" \
  --regions="{{REGION}}"
```

```bash
gcloud compute backend-services list --project="example-project"
```
````

每篇只有一个默认值声明，变量名用字母、数字和下划线且不以数字开头；值为不超过 512 字符的单行字符串。仅带 `docvars` 的代码块参与渲染，普通代码块保留字面内容。

## 源码与验证

本目录就是 NesDev 中保留的 Demo 源目录，`main.js` 为确定性生成文件。无需安装构建依赖。Obsidian 插件运行时提供 `obsidian` 和 CodeMirror 模块；测试和构建需要 Node 22+，界面验收还需 Python 3、已运行的 NesDev 和固定 Obsidian CLI。

```bash
npm test
npm run build
npm run check
python3 scripts/verify-runtime.py
python3 scripts/verify-width.py
python3 scripts/verify-focus.py
```

在当前插件目录执行。`verify-runtime.py` 只测试合成 Demo，创建两张独立测试标签页、切换模式，最后关闭自己的测试页并恢复原标签页；会覆盖剪贴板为合成命令，不执行笔记中的命令。失败即抛错停止，检查 `evidence/runtime.json` 的生成时间，不能将旧回执视为新测试成功。

- `src/core.cjs`：默认值和 Markdown 围栏解析、文本替换、每标签页会话。
- `src/plugin.cjs`：CodeMirror 装饰、阅读后处理、原有复制按钮适配和生命周期。
- `scripts/build.mjs`：将本地源码组合为单个 `main.js`；无依赖下载。
- `tests/core.test.cjs`：解析、静态示例、隔离、空值和危险路径测试。
- `scripts/verify-width.py`：两种模式的短值、中文、空值和字体宽度回归，回执为 `evidence/width.json`。
- `scripts/verify-focus.py`：在 CDP 焦点仿真下断言实际 `:focus` 和全选状态，检查相邻双引号、原生复制及笔记原文；回执为 `evidence/focus.json`，结束时还原仿真。
- `evidence/runtime.json`：受控界面验收回执，默认不进入 Git。

2026-10-16：核心测试 6/6，真实宿主交互断言 16/16。真实输入使用 CDP `Input.insertText`，在两种模式的代码块字段内输入中文合成值；比较复制结果、标签页状态和交互前后笔记字节。源码模式保留占位符，测试后恢复默认值。`data.json` 不存在。

## 实现约束

状态放在 `WeakMap<WorkspaceLeaf, Session>`；不写笔记、frontmatter、插件数据、浏览器 storage 或 workspace state。仅访问当前渲染笔记；保护目录和私有伴随笔记被跳过。插件不发网络请求、不执行命令、不求值模板表达式。剪贴板写入只发生在用户点原有复制按钮时。

实时预览使用替换装饰，底层 CodeMirror 文档不改。阅读代码块在原生异步语法高亮完成后挂载输入框；视图缓存挂回时同步当前会话的值。原生代码块结构和语法高亮保留。 输入框使用宿主原生 `field-sizing: content` 按真实字体与内容定宽，移除了字符数估宽和额外一个字符的预留；两种模式的 12 组布局检查通过。当前宿主已确认支持该 CSS 能力，旧渲染器兼容性未验收。 聚焦提示使用内侧阴影，不再向外绘制 3px 焦点环，以免遮住紧邻的引号；两种模式的聚焦全选和带引号复制已通过定向回归。

## 限制

单行输入、顶层普通代码块；已实测 Bash。复杂嵌套 Markdown、跨笔记嵌入、移动端、多窗口、其它代码块插件组合和长文性能未验收。清空输入保留空字符串，`Esc` 才是恢复默认值。

变量按字面量替换，不自动做 Shell、YAML、JSON 上下文转义。引号等输入会改变复制命令的语义，使用前需检查。默认值是笔记明文的一部分，仅运行时覆盖值不落盘。复制之后的系统剪贴板归宿主和使用者管理。

当前版本只在开发库启用；正式应用、发布与长期兼容维护需要后续决定。最低版本声明不代表已完成所有旧版 Obsidian 验收。

## 一手参考

- [Google Cloud 示例](https://docs.cloud.google.com/load-balancing/docs/l7-internal/setting-up-traffic-management?hl=zh-cn)
- [Obsidian Decorations](https://docs.obsidian.md/Plugins/Editor/Decorations)
- [Obsidian API](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
