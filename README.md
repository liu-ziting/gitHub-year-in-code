# 🌌 GitHub Trace Soul - 2025 年度技术溯源

> **Trace Your Code Soul.** 深度解析 GitHub 每一行 Commit，接入 Mimo AI 大模型，生成专属开发者的赛博灵魂名片。

[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![AI](https://img.shields.io/badge/AI-Mimo--v2-red?logo=openai)](https://github.com/liu-ziting/)

---

## ✨ 项目特性

- 🧬 **技术基因解码**：多维度分析你的 GitHub 仓库，提取核心语言栈、Star 贡献及工程能力画像。
- 💀 **AI 灵魂锐评**：接入 Mimo AI (Xiaomi Mimo-v2)，生成犀利、幽默且精准的技术点评，直击开发者痛点。
- 🏷️ **年度热词提取**：基于全量代码贡献建模，生成极具个性的身份标签（如：深夜提交侠、Bug 狩猎者等）。
- 🖼️ **高保真海报导出**：支持一键生成 2K 高清分享海报，完美还原毛玻璃 (Backdrop-blur) 质感与响应式布局。
- ⚡ **极致交互体验**：基于 Vue 3 组合式 API + Tailwind CSS，全站毛玻璃 UI 设计，配合 Animate.css 实现丝滑过渡。

## 🛠️ 技术架构

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 7
- **样式处理**: Tailwind CSS (移动端优先响应式设计)
- **图像生成**: `html-to-image` (现代 SVG 渲染方案，完美支持现代 CSS 特性)
- **AI 引擎**: 通过 Cloudflare Workers 代理调用的 Mimo AI 模型
- **动效库**: Animate.css

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/liu-ziting/github-year-in-code.git
cd github-year-in-code
```

### 2. 安装依赖
```bash
npm install
```

### 3. 本地开发
```bash
npm run dev
```

### 4. 生产构建
```bash
npm run build
```

## 📦 项目结构

```text
src/
├── components/          # 核心组件
│   ├── LandingPage.vue  # 沉浸式首页
│   ├── ReportPage.vue   # 溯源报告展示页
│   ├── Toast.vue        # 统一通知弹窗
│   └── MarkdownText.vue # AI 内容渲染组件
├── types/               # TypeScript 类型定义
├── App.vue              # 主入口逻辑与状态管理
└── main.ts              # 应用挂载
```

## 📸 导出说明

项目已从 `html2canvas` 迁移至 `html-to-image`，解决了以下长期困扰前端截图的问题：
- ✅ 完美支持 `backdrop-filter: blur()` 毛玻璃效果。
- ✅ 完美支持 CSS Grid 栅格与 Gap 间距。
- ✅ 自动处理跨域图片加载。
- ✅ 针对移动端导出进行了宽度强制补丁（800px），确保海报排版美观。

## 🤝 贡献指南

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

**Proudly created by [liu-ziting](https://github.com/liu-ziting/)**  
*If you like this project, give it a ⭐!*
