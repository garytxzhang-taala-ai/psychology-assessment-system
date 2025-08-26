# 心理测评系统

一个基于ACE动机理论的学生心理测评系统，支持学生和家长双重视角的测评分析。

## 功能特性

### 🎯 核心功能
- **双重测评**：支持学生自评和家长评价
- **ACE理论分析**：基于自主性(Autonomy)、胜任感(Competence)、参与度(Engagement)三个维度
- **动机类型识别**：智能识别学生的学习动机类型
- **AI专家评价**：集成大模型生成个性化的专家建议
- **可视化报告**：雷达图、对比分析等多种数据可视化

### 🎨 用户体验
- **响应式设计**：支持桌面端和移动端
- **现代化UI**：采用Tailwind CSS设计，界面美观易用
- **实时聊天**：AI深度解读功能，支持个性化对话
- **报告导出**：支持PDF格式报告导出
- **历史记录**：完整的测评历史管理

## 技术栈

- **前端框架**：Next.js 14 (React 18)
- **样式框架**：Tailwind CSS
- **图表库**：Recharts
- **AI集成**：OpenAI API
- **数据存储**：本地JSON文件存储
- **PDF生成**：jsPDF + html2canvas

## 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd 心理测评
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env.local` 文件并添加以下配置：
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
```

4. 启动开发服务器
```bash
npm run dev
```

5. 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── chat/              # AI聊天页面
│   ├── questionnaire/     # 问卷页面
│   ├── results/           # 结果页面
│   └── ...
├── components/            # React组件
│   ├── AIExpertEvaluation.tsx
│   ├── RadarChart.tsx
│   └── ...
├── data/                  # 数据文件
│   ├── questions.ts       # 问卷题目
│   ├── motivationTypes.ts # 动机类型定义
│   └── suggestions.ts     # 建议模板
├── utils/                 # 工具函数
│   ├── aiService.ts       # AI服务
│   └── database.ts        # 数据库操作
└── types/                 # TypeScript类型定义
```

## 使用说明

### 1. 用户注册/登录
- 支持学生和家长两种角色
- 简单的用户信息录入

### 2. 问卷测评
- 学生完成自我评价问卷
- 家长完成对学生的评价问卷
- 基于ACE理论的科学题目设计

### 3. 结果分析
- 查看个人详细报告
- 对比学生与家长的认知差异
- 获取个性化的成长建议

### 4. AI深度解读
- 与AI专家进行个性化对话
- 获取针对性的教育建议
- 解答具体的教育问题

## 部署说明

### Vercel部署（推荐）
1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 自动部署完成

### 其他平台
- 支持任何支持Next.js的托管平台
- 确保配置正确的环境变量

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：
- 创建 Issue
- 发送邮件至项目维护者

---

**注意**：本系统仅供教育和研究使用，不能替代专业的心理咨询服务。如需专业心理健康支持，请咨询合格的心理健康专家。