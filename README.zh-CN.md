# 🃏 MDCard

将 Markdown 变成精美的分享卡片。

输入 Markdown，选择主题，导出图片——适合技术分享、读书笔记、观点卡片、社交平台长图等场景。

MDCard 采用毛玻璃 (Glassmorphism) 设计语言，支持深色 / 浅色 / 跟随系统三种外观，提供 10 款精选配色主题和四种常见画幅，排版细节可逐项自定义。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/rouguangruye/MDCard/actions/workflows/ci.yml/badge.svg)](https://github.com/rouguangruye/MDCard/actions/workflows/ci.yml)

**[在线演示](https://mdcard.rouguang.top/)**

其他语言：[English](./README.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko.md) | [日本語](./README.ja.md)

## 功能

- **Markdown 智能分页** — 自动按行边界分页，不截断文字，支持 `---` 强制分页
- **10 款主题配色** — 一键切换，涵盖深色与浅色风格，全部通过 WCAG AA 对比度验证
- **四种画幅** — 3:4 竖版 / 9:16 长图 / 1:1 方形 / 16:9 宽屏
- **深色 / 浅色 / 跟随系统** — 三种外观模式，右上角一键切换
- **毛玻璃界面** — Glassmorphism 设计语言
- **自定义排版** — 标题、正文字号、行高、间距、边框均可调
- **水印** — 可自定义水印文字，留空关闭
- **配置分享** — 一键生成配置链接，他人打开即可复现样式
- **ZIP 批量导出** — 超过 2 张图片时自动打包为 ZIP 下载

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

构建产物输出到 `dist/` 目录。

## Docker 部署

### 方式一：docker-compose（推荐）

```bash
docker-compose up -d
```

访问 http://localhost:8080

### 方式二：手动构建

```bash
docker build -t mdcard:latest .
docker run -d -p 8080:80 --name mdcard mdcard:latest
```

### 方式三：使用预构建镜像

```bash
docker run -d -p 8080:80 --name mdcard ghcr.io/rouguangruye/mdcard:latest
```

> 如果你 fork 了项目并自行构建推送，将 `rouguangruye` 替换为你的 GitHub 用户名。

## 使用说明

1. 在左侧编辑器输入 Markdown 内容
2. 点击工具栏「样式」按钮打开右侧设置面板
3. 选择主题或自定义颜色、排版、间距
4. 点击 PNG / JPG 按钮导出图片

### 分页

- 内容超出单页高度时自动分页，在行边界处切割，不会截断文字
- 使用 `---`（三个横杠）独占一行可强制分页

### 导出

- 1~2 张图片：逐张下载
- 3 张及以上：自动打包为 ZIP 压缩包下载

### 外观模式

工具栏右上角三个按钮：

| 按钮 | 说明 |
|------|------|
| 🌙 | 深色模式 |
| ☀️ | 浅色模式 |
| 🖥 | 跟随系统 |

选择会持久化到 localStorage。

### 配置分享

点击设置面板中「分享配置」按钮，当前样式配置会被编码到 URL hash 中，复制链接后他人打开即可复现完全相同的样式设置。

## 技术栈

- [Vite](https://vitejs.dev/) — 构建工具
- [marked](https://marked.js.org/) — Markdown 解析
- [dom-to-image-more](https://github.com/1904labs/dom-to-image-more) — DOM 转图片
- [JSZip](https://stuk.github.io/jszip/) — ZIP 打包

## 项目结构

```
src/
├── index.html            # 入口页面
├── styles/
│   └── main.css          # 全局样式 & 主题变量
└── app/
    ├── main.js            # 应用入口 & 事件绑定
    ├── config.js          # 格式 & 默认值定义
    ├── palettes.js        # 10 款主题配色数据
    ├── settings.js        # 设置读写 & CSS 变量映射
    ├── paginator.js       # Markdown 分页算法
    ├── renderer.js        # dom-to-image-more 渲染 & 下载
    └── toast.js           # Toast 通知
```

## 参与贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解指南。

## 关注作者

- 博客：[blog.rouguang.top](https://blog.rouguang.top/)
- 小红书：[@揉光入野](https://www.xiaohongshu.com/user/profile/1043817685)

## License

[MIT](LICENSE)
