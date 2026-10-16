# Demo 工件登记

| 工件 | 事实源 | 用途 |
| --- | --- | --- |
| 插件源码 | src/core.cjs、src/plugin.cjs、styles.css | NesDev 内开发参考 |
| 运行插件 | main.js、manifest.json | 由本目录源码构建与加载 |
| 可参考笔记 | NesDev/zz-doc-vars-demo.md | 交互与双代码块示例 |
| 核心验证 | tests/core.test.cjs | Markdown 解析与会话隔离 |
| 宿主验证 | scripts/verify-runtime.py | 双模式、代码块输入、复制和标签页隔离 |
| 布局验证 | scripts/verify-width.py | 双模式实际字体宽度、短值、中文和空值 |
| 焦点验证 | scripts/verify-focus.py | 双模式聚焦全选、相邻引号与原生复制 |
| 受控回执 | evidence/runtime.json、evidence/width.json、evidence/focus.json | 当前机器验证，排除 Git |

本目录属于用户指定 NesDev 开发库，不是正式发布源或临时区引用。
