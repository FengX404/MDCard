# MDCard 功能路线图

## 近期规划

### 排版系统

- [x] **结构化版式骨架** — 参考 Editorial/Swiss 视觉系统，6 套版式（editorial-default / magazine / prose + swiss-minimal / card / poster），每套定义 typography + visual 元数据与 CSS class
- [x] **主题色彩打磨** — 精炼 10 套调色板（5 暗色 + 5 亮色），WCAG AA 4.5:1 对比度合规
- [ ] **版式微调** — 支持用户逐版式微调字号、字重、装饰线等细节参数

### 内容增强

- [ ] **自动图源集成** — 对接 Unsplash / Pexels API，根据文章标题/关键词自动检索配图候选

### 移动端

- [ ] **移动端 Web 界面** — 适配手机屏幕的编辑与预览体验

## 中期探索

- [ ] **MCP 功能集成** — 提供 MCP Server，让 AI agent 可以直接调用卡片生成能力（Markdown → 图片）

## 远期

- [ ] **Obsidian / Notion 插件** — 笔记工具中一键导出卡片
- [ ] **REST API** — Markdown + 配置 → 图片 URL
