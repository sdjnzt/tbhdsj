# 城市大数据平台

基于 Vue.js 和 Element UI 的城市大数据平台前端项目，提供异常监控、应急管理、数据质量管理等功能。

## 功能特点

- 异常监控管理：支持多业务领域监管，快速响应异常告警
- 应急管理：突发事件快速响应，数据整合与策略建议
- 数据质量管理：全面的数据质量检查与修正
- 数据标准管理：统一的数据标准规范
- 元数据管理：完整的数据元信息管理
- 数据融合管理：多源数据融合与统一视图
- 城市管理：城市基础设施实时监测

## 技术栈

- Vue.js 2.x
- Element UI
- Vuex
- Vue Router
- ECharts
- Axios

## 开发环境要求

- Node.js >= 12.0.0
- npm >= 6.0.0

## 安装和运行

```bash
# 安装依赖
npm install

# 开发环境运行
npm run serve

# 生产环境构建
npm run build
```

## 项目结构

```
src/
  ├── assets/        # 静态资源
  ├── components/    # 公共组件
  ├── views/         # 页面视图
  ├── router/        # 路由配置
  ├── store/         # Vuex状态管理
  ├── utils/         # 工具函数
  ├── App.vue        # 根组件
  └── main.js        # 入口文件
``` 