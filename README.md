# 🌌 GitHub 2025 年度总结 - AI 深度分析

> **GitHub 2025 Year in Code.** 结合 AI 大模型深度解析你的 GitHub 年度数据，生成专属开发者的赛博灵魂名片与代码报告。

[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?logo=chart.js)](https://www.chartjs.org/)
[![AI](https://img.shields.io/badge/AI-Mimo--v2-red?logo=openai)](https://github.com/liu-ziting/)

---

## ✨ 项目特性

-   🧬 **多维数据建模**：不仅是 Star 统计。通过对仓库元数据、活跃周期、协作频率及关注度分布的深度挖掘，构建完整的开发者数字画像。
-   📊 **可视化数据引擎**：集成 `Chart.js`，动态渲染技术栈占比环形图与项目影响力阶梯图，让技术沉淀一目了然。
-   🏆 **2025 年度之最**：自动捕捉年度“明星项目”、“高产仓库”、“协作中心”及“活跃巅峰”，复盘过去一年的高光时刻。
-   💀 **AI 灵魂锐评**：接入 Mimo AI (Xiaomi Mimo-v2)，针对技术栈偏好生成犀利且幽默的深度点评，挖掘代码背后的“性格基因”。
-   👑 **全球影响力排名**：基于 Stars 与 Followers 的多权重复合算法，给出更具参考价值的 Universal Rank 全球排名。
-   🖼️ **高清海报导出**：基于 `html-to-image` 方案，完美还原 Backdrop-blur 毛玻璃质感，一键生成 2K 赛博风格分享海报。

## 🛠️ 技术架构

-   **核心框架**: Vue 3 (Composition API)
-   **构建工具**: Vite 7
-   **可视化**: Chart.js (高性能 HTML5 Canvas 图表库)
-   **样式方案**: Tailwind CSS (移动端优先响应式设计)
-   **截图引擎**: `html-to-image` (现代 SVG 渲染方案，完美支持 CSS 高级特性)
-   **AI 代理**: 通过 Cloudflare Workers 代理调用的 Mimo AI API

## 🛡️ 安全与隐私

### 1. Cloudflare Workers 中转机制

为了保护 AI 接口密钥（API Key）不暴露在前端代码中，本项目采用 **Cloudflare Workers** 作为中间件：

-   **密钥隐藏**：AI 服务的 API Key 安全地存储在 Worker 环境变量中，前端仅与加密后的 Worker 地址通信。
-   **高可用设计**：Worker 内部集成了“主备自动切换”逻辑。当主接口（如小米 Mimo-v2）触发频率限制（HTTP 429）时，会自动无感切换至备用接口（如智谱 GLM-4），确保分析流程不中断。
-   **CORS 保护**：通过 Worker 统一处理跨域请求，并可根据需要配置域名白名单。

### 2. GitHub Token 安全

-   **内存存储**：用户输入的 GitHub Token 仅存储在浏览器的运行时内存中，不会持久化到 LocalStorage 或 Cookie。
-   **直连 GitHub**：所有涉及 GitHub 数据（REST/GraphQL）的请求均由浏览器直连 GitHub 官方服务器，不经过任何第三方中转。

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
├── components/          # 核心 UI 组件
│   ├── LandingPage.vue  # 沉浸式首页 (Glassmorphism 设计)
│   ├── ReportPage.vue   # 年度总结报告页 (可视化图表 + AI 解析)
│   ├── AboutPage.vue    # 项目初衷与捐赠说明
│   ├── Toast.vue        # 统一状态反馈通知
│   └── MarkdownText.vue # AI 流式内容渲染
├── types/               # TypeScript 类型定义 (UserData 核心模型)
├── App.vue              # 核心业务逻辑、API 调度与状态管理
└── main.ts              # 应用入口
```

## 📸 技术细节与优化

-   **毛玻璃适配**：解决了 `html2canvas` 无法渲染 `backdrop-filter` 的痛点，改用 `html-to-image` 确保导出效果与 UI 1:1 还原。
-   **设计规范**：报告页面采用“一级标题英文 + 二级标题中文”的标准设计规范，平衡科技感与易读性。
-   **性能优化**：对 GitHub API 调用进行了全量异步递归处理，并针对图表实例进行了自动销毁管理，防止内存泄漏。
-   **排名逻辑**：算法公式 `Score = Stars * 1.5 + Followers * 2`，分级更科学，避免了低权重导致的排名虚高。

---

**Proudly created by [liu-ziting](https://github.com/liu-ziting/)**  
_If you like this project, give it a ⭐!_
