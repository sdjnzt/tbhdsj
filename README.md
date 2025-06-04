# 太白湖大数据平台

基于Vue.js开发的太白湖新区大数据可视化平台，提供区域状况洞察、数据分析等功能。

## 功能特点

- 区域状况实时监测
- 数据可视化展示
- 智能预警系统
- 实时动态更新
- 多维度数据分析

## 技术栈

- Vue.js
- Element UI
- ECharts
- 高德地图API

## 安装步骤

1. 克隆项目
```bash
git clone https://github.com/yourusername/taihu-data-platform.git
cd taihu-data-platform
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件，添加以下配置：
```
VUE_APP_AMAP_KEY=你的高德地图API密钥
```

4. 运行开发服务器
```bash
npm run serve
```

5. 构建生产版本
```bash
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
  └── App.vue        # 根组件
```

## 注意事项

1. 需要申请高德地图API密钥
2. 确保Node.js版本 >= 12.0.0
3. 建议使用npm 6.x以上版本

## 贡献指南

1. Fork 本仓库
2. 创建新的功能分支
3. 提交你的更改
4. 发起 Pull Request

## 许可证

MIT License 