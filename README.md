# AI Chat Exporter

一个用于导出各大 AI 聊天平台对话记录的浏览器脚本工具。

## 支持的平台

| 平台 | 文件 | 网站 |
|------|------|------|
| Kimi | `platforms/kimi.js` | www.kimi.com |
| 智谱清言 | `platforms/chatglm.js` | www.chatglm.cn |
| 豆包 | `platforms/doubao.js` | www.doubao.com |
| ChatGPT | `platforms/chatgpt.js` | www.chatgpt.com |
| DeepSeek | `platforms/deepseek.js` | chat.deepseek.com |
| Claude | `platforms/claude.js` | claude.ai |
| Gemini | `platforms/gemini.js` | gemini.google.com |
| 通义千问 | `platforms/tongyi-qianwen.js` | www.qianwen.com / www.qianwen.com|
| Qwen Chat | `platforms/qwen-chat.js` | chat.qwen.ai |
| Grok | `platforms/grok.js` | https://grok.com |

## 使用方法

### 方法一：使用完整版（自动检测平台）

1. 打开任意支持的 AI 聊天网站
2. 按 `F12` 打开浏览器开发者工具
3. 切换到 `Console`（控制台）标签
4. 复制 `main.js` 的全部内容并粘贴到控制台
5. 按 `Enter` 执行
6. 对话记录将自动下载为 `.txt` 文件

### 方法二：使用单平台脚本

如果你只需要导出特定平台的对话：

1. 进入 `platforms/` 文件夹
2. 选择对应平台的 `.js` 文件
3. 复制内容到浏览器控制台执行

### 方法三：创建书签脚本 (Bookmarklet)

1. 在浏览器创建新书签
2. 将脚本内容压缩为一行，前面加上 `javascript:`
3. 粘贴到书签的 URL 字段
4. 点击书签即可导出

## 文件结构

```
ai-chat-exporter/
├── main.js              # 完整版（支持所有平台）
├── common.js            # 公共工具函数
├── README.md            # 说明文档
└── platforms/           # 各平台单独脚本
    ├── kimi.js
    ├── chatglm.js
    ├── doubao.js
    ├── chatgpt.js
    ├── deepseek.js
    ├── claude.js
    ├── gemini.js
    ├── tongyi-qianwen.js
    ├── qwen-chat.js
    └── grok.js
```

## 导出格式

导出的文件为纯文本格式 (`.txt`)，包含：
- 平台名称
- 导出时间
- 消息总数
- 每条消息的角色标识和内容

示例：
```
ChatGPT 对话导出
导出时间: 2025/12/18 10:30:00
共 10 条消息
==================================================

【User】 (#1):
你好，请介绍一下你自己

--------------------------------------------------

【ChatGPT】 (#2):
你好！我是 ChatGPT...

--------------------------------------------------
```

## 注意事项

1. 确保页面完全加载后再执行脚本
2. 如果对话很长，请先滚动到页面底部加载所有消息
3. 部分平台可能会更新页面结构，如遇问题请提交 Issue

## License

MIT License
