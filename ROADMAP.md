# MDCard 功能路线图

## 近期规划

### 排版系统

- [x] **结构化版式骨架** — 参考 Editorial/Swiss 视觉系统，6 套版式（editorial-default / magazine / prose + swiss-minimal / card / poster），每套定义 typography + visual 元数据与 CSS class
- [x] **主题色彩打磨** — 精炼 10 套调色板（5 暗色 + 5 亮色），WCAG AA 4.5:1 对比度合规

### 内容增强

- [ ] **自动图源集成** — 对接 Unsplash / Pexels API，根据文章标题/关键词自动检索配图候选

### 移动端

- [x] **移动端 Web 界面** — 适配手机屏幕的编辑与预览体验

## 中期探索

- [ ] **MCP 功能集成** — 独立项目 [MDCard-MCP](https://github.com/FengX404/MDCard-MCP)（private），HTTP Streamable 传输。Claude Code skill 独立项目 [MDCard-Skill](https://github.com/FengX404/MDCard-Skill)（private），提供 `/mdcard` 斜杠命令。

## 远期

- [ ] **Obsidian / Notion 插件** — 笔记工具中一键导出卡片
- [ ] **REST API** — Markdown + 配置 → 图片 URL
