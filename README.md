# 多模态学习分析课程管理系统

基于湖北省教育科学规划课题「基于多模态学习分析的高校课程动态优化与持续改进机制研究」开发的课程管理系统演示平台。

## 系统概述

本系统实现了文档中描述的五大研究内容：

1. **多模态数据采集** — 学习行为、学习过程、学习成果、教师评价、课程反馈五种数据类型
2. **数据融合引擎** — 将异构数据归一化为统一的课程状态表征
3. **动态诊断面板** — 实时可视化课程健康度、参与度、知识掌握度
4. **AI决策支持** — 自动生成优化建议，教师审批决策，人机协同
5. **持续改进闭环** — 课程生命力五维评估（课堂活力、创造力、学习感知、资源延续、课程进化）

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **图表**: Apache ECharts (echarts-for-react)
- **状态管理**: Zustand
- **后端**: Express 5 (Node.js)
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 启动后端服务器（端口 3001）
npm run dev:backend

# 启动前端开发服务器（端口 5173）
npm run dev:frontend
```

或者使用 concurrently 同时启动：

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 页面说明

### 系统总览 — 课程基本信息、健康度评分、关键指标、生命力趋势
### 数据采集 — 五类数据录入、模拟数据生成、数据质量概览
### 数据融合 — 模块融合进度、目标达成度、五维融合雷达图
### 动态诊断 — 告警列表、参与度趋势、知识掌握度、薄弱点识别
### AI决策支持 — 优化建议卡片、数据证据、教师审批流
### 课程生命力 — 五维雷达图、分数详情、16周趋势
### 持续改进闭环 — 闭环流程图、改进统计、历史时间线

## 项目结构

```
multimodal-course-system/
├── server/                    # 后端
│   ├── index.ts              # Express 服务器 + API 路由
│   └── data/
│       ├── mockData.ts       # 模拟数据生成
│       └── fusionEngine.ts   # 数据融合引擎
├── src/                     # 前端
│   ├── types/               # TypeScript 类型定义
│   ├── services/            # API 服务层
│   ├── hooks/               # React Hooks (Zustand store)
│   ├── components/          # 可复用组件
│   └── pages/               # 页面组件
├── vite.config.ts           # Vite 配置（含 API 代理）
├── package.json
└── README.md
```
