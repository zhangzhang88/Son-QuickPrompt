# 儿子快捷提示词

> 把自己的提示词放进 Chrome 侧边栏，搜索、复制和管理都在当前网页旁完成。
> A local Chrome extension for searching, copying, and managing your prompts.

**[中文](#中文) | [English](#english)**

---

<a name="中文"></a>
## 中文

你写 Prompt 时，经常要翻笔记、找模板、复制一大段文字。

儿子快捷提示词把你自己的提示词放进 Chrome 侧边栏：点插件图标打开，搜索标题或正文，一键复制。

### 功能

- 点击插件图标直接打开 Chrome 侧边栏
- 全文搜索：标题和正文都会匹配
- 普通提示词可一键复制，复制后有明确反馈
- 分步提示词可在录入时启用；每一步单独填写，并可选填步骤名称
- 点击分步提示词卡片打开步骤列表，可单独复制所需步骤；复制后仍停留在步骤列表
- 新增 / 编辑用弹窗完成，不占用默认列表空间
- 本地 `chrome.storage.local` 保存
- 支持 JSON 导入 / 导出；导出文件名为 `son-quickprompt-YYYY-MM-DD.json`
- 全新安装会载入仓库附带的 7 条默认提示词
- 已安装用户升级后会一次性补充缺少的默认提示词，不覆盖已有条目

### 安装

1. 下载或 clone 本仓库。
2. 打开 Chrome 的 `chrome://extensions`。
3. 开启右上角 Developer mode。
4. 点击 Load unpacked，选择本仓库目录。
5. 如果更新了代码，回到 `chrome://extensions` 点击 Reload。

### 使用

点击浏览器工具栏里的“儿子快捷提示词”图标，侧边栏会直接打开。

常见操作：

- 搜索 `标题`、`公众号`、`GEO`、`标题优化` 等关键词。
- 普通提示词：点击列表卡片复制整条内容。
- 分步提示词：点击卡片展开步骤列表，再点击对应步骤的“复制本步”。
- 点击“新增”，在弹窗里录入提示词；需要分步时勾选“这是分步提示词”，添加步骤并填写内容，名称可选。
- 在设置中可导入或导出 JSON；导出的文件名会带上导出日期。

### 权限说明

- `storage`：保存本地提示词库。
- `clipboardWrite`：点击复制按钮时写入剪贴板。
- `sidePanel`：显示 Chrome 侧边栏。

### 许可

- 扩展代码：MIT License。

### Troubleshooting

| 问题 | 处理 |
| --- | --- |
| 复制按钮没反应 | 确认插件已 Reload；如果仍失败，检查该页面是否限制剪贴板权限。 |

---

<a name="english"></a>
## English

儿子快捷提示词 keeps your prompts in a Chrome side panel. Open the extension, search by title or prompt text, and copy with one click.

### Features

- Opens the Chrome side panel directly from the extension icon
- Full-text search across titles and content
- One-click copy with visual feedback for regular prompts
- Multi-step prompts with individually entered steps and optional step names
- Clicking a multi-step prompt opens its step list; copy a step without leaving the list
- Dialog-based add/edit flow
- Favorites
- Local storage via `chrome.storage.local`
- JSON import/export; exported files use `son-quickprompt-YYYY-MM-DD.json`
- Includes seven bundled prompts on a fresh install
- Existing installs receive missing bundled prompts once without overwriting existing entries

### Install

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked and select this repository directory.
5. Click Reload after code updates.

Extension code is MIT licensed.
