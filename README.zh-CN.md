# Live Note Parameters · 笔记实时参数

**笔记写一次，使用时填写当前环境，直接复制代入后的命令。**

在 Obsidian 的正文或命令中点击参数，同标签页内的同名引用立即同步。交互语法块与固定示例并存；默认值保留在 Markdown，临时填写只留在当前标签页内存。

[English](README.md) · [快速开始](#复制一份完整配置) · [案例](#可直接使用的案例) · [安装](#安装)

## 先看效果

![在实时预览中填写项目与区域，正文及两段命令同步，固定示例保持原文](docs/media/live-sync.gif)

动图依次展示真实 Obsidian 实时预览中的三个状态：默认值、填写项目、填写区域。下方 **Fixed reference** 固定示例始终不变。[实时预览静态图](docs/media/live-preview.png) · [阅读模式效果图](docs/media/reading-mode.png) · [演示笔记源码](examples/cloud-runbook.md)。

当 `PROJECT_ID` 填为 `atlas-staging`、`REGION` 填为 `europe-west1`，点击代码块原有复制按钮，得到：

```bash
gcloud compute backend-services list \
  --project="atlas-staging" \
  --regions="europe-west1"
```

这是代入后的命令文本，不是命令执行结果；插件不会执行命令。

## 功能与效果

- **任意位置填写，同标签页同步。** 正文、行内代码和参与替换的代码块均可填写，实时预览与阅读模式都可使用。
- **保留语法与固定示例。** 需要交互的围栏加 `docvars`，普通代码块保持字面内容。
- **复制当前值。** 沿用代码块原有复制按钮，复制时保留原有相邻引号。
- **新标签页重新开始。** 临时输入不写入笔记、插件数据或工作区状态，新标签页使用已保存默认值。
- **在实时预览维护默认值。** 面板支持新增、重命名、引用操作、草稿保存与取消，以及原生撤销与重做。

## 复制一份完整配置

[安装插件](#安装)后，将下面整段 Markdown 复制到新笔记，切到**实时预览**或**阅读模式**。已有 Frontmatter 时，只把 `doc_vars` 合并进原有头部。

````markdown
---
doc_vars:
  PROJECT_ID: "demo-project"
  REGION: "us-central1"
---

Project: {{PROJECT_ID}} · Region: {{REGION}}

Inline command: `gcloud --project="{{PROJECT_ID}}"`

## Editable syntax

```bash docvars
gcloud compute backend-services list \
  --project="{{PROJECT_ID}}" \
  --regions="{{REGION}}"
```

## Fixed example

```bash
gcloud compute backend-services list \
  --project="example-project" \
  --regions="asia-east1"
```
````

1. 点击任意紫色字段填写，同标签页内的同名参数即时更新。
2. 点击命令块原有复制按钮，得到代入后的完整命令。
3. 在新标签页打开同一笔记，重新看到 `demo-project` / `us-central1` 默认值。

| 写法 | 含义 |
| --- | --- |
| `doc_vars` | 保存在笔记中的默认值，使用 YAML 字符串映射 |
| `{{PROJECT_ID}}` | 正文或行内代码中的同名参数引用 |
| `bash docvars` | 参与交互替换的命令代码块 |
| 普通 `bash` | 固定代码块，可用于保留示例 |

## 可直接使用的案例

全部使用虚构数据。打开示例的 Markdown 源码即可复制完整笔记；也可先看[配置与代入结果](docs/examples.zh-CN.md)，无需安装就能理解效果。

| 场景 | 每次填写 | 复用效果 |
| --- | --- | --- |
| [云环境操作手册](examples/cloud-runbook.md) | 项目、区域 | 后端服务与转发规则查询使用同一组环境信息 |
| [Kubernetes 命名空间检查](examples/kubernetes-checks.md) | Context、Namespace、应用标签 | Pod 与事件查询使用相同目标 |
| [HTTP 请求笔记](examples/http-request.md) | 基础 URL、资源 ID、请求 ID | 行内接口地址与 `curl` 命令同步 |

## 安装

电脑端 MVP，最低 Obsidian **1.13.7**；当前验收环境为 macOS / Obsidian 1.13.7。

1. 下载 [Releases](https://github.com/nestealin/obsidian-live-note-parameters/releases) 中的 `main.js`、`manifest.json` 和 `styles.css`。
2. 放入 `<vault>/<config-dir>/plugins/live-note-parameters/`，默认配置目录为 `.obsidian`。
3. 刷新 Obsidian 社区插件列表并启用 **Live Note Parameters**。

市场安装查看[官方社区条目](https://community.obsidian.md/plugins/live-note-parameters)；若 **Add to Obsidian** 不可用，使用上方手动安装方式。BRAT 用户可添加 `nestealin/obsidian-live-note-parameters`。

## 在实时预览维护默认值

展开编辑区上方的“笔记参数”，或点击工具栏滑块图标、执行“管理笔记参数”命令。

![实时预览的参数管理面板，包含参数名、默认值、引用计数及保存取消操作](docs/media/parameter-manager.png)

**面板修改的是保存到笔记的默认值，正文紫色字段修改的是本标签页临时值。** 面板可以继续保存 `demo-project`，当前标签页同时临时使用 `atlas-staging`。

- 新增参数、编辑默认值与参数名，查看引用数、定位引用或在光标处插入引用。
- 修改先保留为草稿，“保存定义”才写入笔记；“取消”丢弃草稿。
- 重命名会展示受影响引用数，保存时连同受支持引用一并修改，固定示例保持原文。
- 仍有引用的参数不能直接删除；先处理引用再删除。
- 保存只修改定义及明确重命名的引用，保留其它 Frontmatter 和正文；一次原生撤销可恢复本次定义编辑。
- 默认值变化不会清空已有临时覆盖值；未覆盖的参数和新标签页使用新默认值。
- 定义或重命名范围已变化时拒绝保存过期草稿，取消后重新编辑。

旧版 `<!-- doc-vars {...} -->` 声明可通过“预览迁移”查看新 Frontmatter，再显式保存，一次转换并删除旧注释。两种声明同时存在时显示冲突，不静默选择优先级。

## 配置与常见问题

| 问题 | 说明 |
| --- | --- |
| 原有 Frontmatter 可以保留吗？ | 可以，将一份 `doc_vars` 与 `title`、`tags` 等现有属性并列，面板保存保留无关内容。 |
| 每次都要编辑 YAML 吗？ | 不需要。本次使用直接填写紫色字段；修改默认值用实时预览面板。原生“笔记属性”可能将嵌套映射显示为 JSON，维护时用本插件面板或源码模式。 |
| 参数名和值有什么限制？ | 名称以字母或下划线开头，其后可用字母、数字、下划线；禁止 `__proto__`、`prototype`、`constructor`。值为最多 512 字符的单行字符串，日期、数字、布尔含义文本及空字符串请加引号。 |
| 支持表达式或嵌套对象吗？ | 不支持表达式、嵌套值，或 `doc_vars` 中的 YAML 锚点与别名；参数按字面量代入。 |
| 清空与重置有什么区别？ | 清空得到显式空字符串；`Esc` 恢复单项默认值，命令“重置当前标签页变量”重置全部。 |
| 为什么仍显示 `{{NAME}}`？ | 核对名称与定义，确认在实时预览或阅读模式，代码围栏已加 `docvars`；源码模式有意保留占位符。定义错误会出现在实时预览面板。 |
| 行内代码有复制按钮吗？ | 本插件不新增行内图标。可选安装 **Copy Inline Code 2.1.0**，沿用其原有图标复制整段行内命令的当前值；普通行内复制仍由原插件处理。 |
| 填写参数会修改笔记吗？ | 临时填写不会落盘，保存定义才修改 Markdown。同标签页切换模式保留临时值，新标签页从默认值开始。 |

## 数据与兼容边界

临时值只留在当前标签页内存，不写笔记、插件数据、浏览器存储或工作区状态；默认值是笔记明文。复制操作会将结果写入系统剪贴板。插件不联网、不采集遥测、不执行命令、不求值模板表达式；停用后仍保留可读的 Markdown 占位符。

参数按字面量代入，不自动执行 Shell 转义，请按目标命令或格式保留适当引号。

当前验收覆盖电脑端主窗口、正文、行内代码、普通顶层围栏代码块及 Copy Inline Code 2.1.0；移动端、弹出窗口、跨笔记嵌入、复杂嵌套、所有主题和代码块插件组合尚未验收。

## 项目维护规范

使用 Node 22+ 与已提交的依赖锁文件，执行 `npm ci --ignore-scripts`、`npm test`、`npm run build`、`npm run check`。`package.json` 是版本源，发布时同步 `manifest.json`、`versions.json` 与 CHANGELOG。

发布前及宿主升级后，核验双模式输入、参数保存与撤销、原有复制按钮、相邻引号和标签页隔离；测试库与使用库安装同一份已验证资产。产品文档只描述支持的功能、实际交互、使用边界与维护操作。

示例笔记与代入结果同步维护，真实截图和动图的更新步骤见[演示资产维护](docs/media/README.md)。反馈问题时，请在 [GitHub Issues](https://github.com/nestealin/obsidian-live-note-parameters/issues) 提供 Obsidian 版本、显示模式、复制插件版本和最小脱敏示例。

构建、验收、升级和回退见[维护说明](docs/maintenance.md)，版本变化见 [CHANGELOG](CHANGELOG.md)。许可证见 [LICENSE](LICENSE) 与[依赖许可说明](THIRD_PARTY_NOTICES.md)。
