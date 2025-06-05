/* eslint-disable */
<template>
  <div class="region-insight-page">
    <!-- 页面标题与操作区 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">区域状况洞察</h2>
        <div class="page-subtitle">太白湖新区综合数据分析与实时监测</div>
      </div>
      <div class="header-actions">
        <el-select v-model="selectedType" placeholder="选择数据类型" size="small" style="width: 140px; margin-right: 10px;">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" icon="el-icon-refresh" size="small" @click="refreshAll" style="margin-right: 10px;">刷新数据</el-button>
        <el-button type="success" icon="el-icon-download" size="small" @click="exportReport">导出报告</el-button>
      </div>
    </div>

    <!-- 数据更新提示与公告 -->
    <div class="notification-area">
      <el-alert
        class="dashboard-announcement"
        :title="'区域动态：太白湖新区区域状况洞察平台已更新，数据实时同步中'"
        type="info"
        show-icon
        :closable="false"
      />
      <el-alert
        class="dashboard-update"
        title="今日数据已全部更新完成，最后更新时间：09:30"
        type="success"
        show-icon
        :closable="false"
      />
    </div>

    <!-- 智能预警区块 - 升级为卡片式设计 -->
    <el-card class="warning-card">
      <div slot="header" class="warning-header">
        <i class="el-icon-warning-outline"></i>
        <span>智能预警与建议</span>
        <el-tag size="small" type="danger" class="warning-count">{{warnings.filter(w => w.level === '高').length}}个高级预警</el-tag>
      </div>
      <div class="warning-content">
        <div v-for="(item, idx) in warnings" :key="idx" 
             class="warning-item" 
             :class="{'high-warning': item.level === '高', 'medium-warning': item.level === '中'}">
          <div class="warning-icon">
            <i class="el-icon-warning" v-if="item.level === '高'"></i>
            <i class="el-icon-info" v-else></i>
          </div>
          <div class="warning-text">
            <div class="warning-level">{{item.level}}级预警</div>
            <div class="warning-message">{{item.text}}</div>
          </div>
          <el-button size="mini" type="primary" class="warning-action">处理</el-button>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片 - 改为现代化设计 -->
    <div class="data-cards">
      <el-row :gutter="20">
        <el-col :span="4" v-for="card in statCards" :key="card.title">
          <div class="stat-card" :class="getCardClass(card)" @click="handleCardClick(card)">
            <div class="card-icon">
              <i :class="card.icon"></i>
            </div>
            <div class="card-content">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-trend">
                <span v-if="trendValue(card) > 0" class="trend-up">
                  <i class="el-icon-top"></i> +{{ trendAbs(card) }}{{ trendUnit(card) }}
                </span>
                <span v-else-if="trendValue(card) < 0" class="trend-down">
                  <i class="el-icon-bottom"></i> -{{ trendAbs(card) }}{{ trendUnit(card) }}
                </span>
                <span v-else class="trend-flat">
                  <i class="el-icon-right"></i> 持平
                </span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="4" v-for="card in statCards" :key="card.title">
        <el-card class="stat-card dashboard-card" :body-style="{ padding: '20px' }" @click.native="handleCardClick(card)">
          <div class="card-title">
            <i :class="card.icon"></i> {{ card.title }}
          </div>
          <div class="card-value">
            <span class="main-value">{{ card.value }}</span>
            <span v-if="card.trend !== undefined" class="trend-block" :class="trendClass(card)">
              <i v-if="trendValue(card) > 0" class="el-icon-caret-top"></i>
              <i v-else-if="trendValue(card) < 0" class="el-icon-caret-bottom"></i>
              <span class="trend-num">
                {{ trendPrefix(card) }}{{ trendAbs(card) }}{{ trendUnit(card) }}
              </span>
            </span>
          </div>
          <div class="card-footer">{{ card.footer }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 增强趋势图表和地图显示 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <div class="chart-title">
              <i class="el-icon-data-line"></i>
              区域数据趋势分析
            </div>
            <el-select v-model="trendType" size="mini" style="width: 120px;" @change="updateTrendChart">
              <el-option label="人口" value="人口" />
              <el-option label="企业" value="企业" />
              <el-option label="环境优良率" value="环境优良率" />
              <el-option label="交通拥堵指数" value="交通拥堵指数" />
            </el-select>
          </div>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <div class="chart-title">
              <i class="el-icon-location"></i>
              区域分布分析
            </div>
            <div class="chart-actions">
              <el-radio-group v-model="mapViewMode" size="mini">
                <el-radio-button label="normal">常规视图</el-radio-button>
                <el-radio-button label="heat">热力视图</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div id="mapContainer" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时动态部分增强 -->
    <el-row :gutter="20" class="realtime-section">
      <el-col :span="24">
        <el-card class="realtime-card" shadow="hover">
          <div slot="header" class="realtime-header">
            <div class="realtime-title">
              <i class="el-icon-time"></i>
              区域实时动态
            </div>
            <div class="realtime-actions">
              <el-tag size="small" type="info">最近更新: {{ new Date().toLocaleTimeString() }}</el-tag>
              <el-button type="text" icon="el-icon-refresh" @click="refreshRealtime">刷新</el-button>
            </div>
          </div>
          <el-timeline class="realtime-timeline">
            <el-timeline-item
              v-for="(item, idx) in realtimeList"
              :key="idx"
              :timestamp="item.time"
              :color="item.color"
              :size="idx === 0 ? 'large' : 'normal'"
            >
              <el-card class="timeline-card" :body-style="{ padding: '10px' }" shadow="hover">
                <div class="timeline-content">{{ item.content }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据明细表格增强 -->
    <el-card class="detail-card" shadow="hover" style="margin-top:20px;">
      <div slot="header" class="detail-header">
        <div class="detail-title">
          <i class="el-icon-document"></i>
          区域数据明细
        </div>
        <div class="detail-actions">
          <el-button type="primary" size="small" icon="el-icon-refresh" @click="refreshTable" plain>刷新数据</el-button>
        </div>
      </div>
      <el-table 
        :data="filteredTableData" 
        style="width:100%" 
        row-class-name="dashboard-table-row"
        :header-cell-style="{background:'#f5f7fa', color:'#606266'}"
        border
        stripe
      >
        <el-table-column prop="type" label="数据类型" width="120" />
        <el-table-column prop="value" label="当前值" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="trend" label="趋势">
          <template slot-scope="scope">
            <el-tag size="small" :type="getTrendTagType(scope.row.trend)">
              {{ scope.row.trend }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'RegionInsight',
  data() {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    // 使用更真实的太白湖新区数据
    const pop = 28.5, ent = 920, env = 92.5, traffic = 2.34, med = 12, edu = 35;
    const popTrend = 0.6, entTrend = 1.2, envTrend = 0.4, trafficTrend = -0.05, medTrend = 1, eduTrend = 0;
    const statCards = [
      { title: '人口总数', value: `${pop}万`, trend: popTrend, icon: 'el-icon-user', footer: `环比+${popTrend}%` },
      { title: '企业数量', value: `${ent}家`, trend: entTrend, icon: 'el-icon-office-building', footer: `环比+${entTrend}%` },
      { title: '环境优良率', value: `${env}%`, trend: envTrend, icon: 'el-icon-s-flag', footer: `环比${envTrend > 0 ? '+' : ''}${envTrend.toFixed(1)}%` },
      { title: '交通拥堵指数', value: traffic, trend: trafficTrend, icon: 'el-icon-truck', footer: `环比${trafficTrend > 0 ? '+' : ''}${trafficTrend}` },
      { title: '医疗资源', value: `${med}家`, trend: medTrend, icon: 'el-icon-s-help', footer: `环比${medTrend > 0 ? '+1' : '0'}家` },
      { title: '教育资源', value: `${edu}所`, trend: eduTrend, icon: 'el-icon-s-management', footer: `环比${eduTrend > 0 ? '+1' : '0'}所` }
    ];
    const trendMap = {
      '人口': [26.8, 27.3, 27.7, 28.1, 28.5, 28.9],
      '企业': [900, 950, 900, 920, 952, 960],
      '环境优良率': [90.5, 91.2, 91.8, 92.2, 92.5, 92.8],
      '交通拥堵指数': [2.45, 2.42, 2.39, 2.36, 2.34, 2.32],
      '医疗资源': [10, 10, 11, 11, 12, 12],
      '教育资源': [33, 34, 35, 35, 35, 35]
    };
    const tableData = [
      { type: '人口', value: `${pop}万`, updateTime: `${dateStr} 08:00`, trend: '↑' },
      { type: '企业', value: `${ent}家`, updateTime: `${dateStr} 09:00`, trend: '↑' },
      { type: '环境', value: env >= 90 ? '良' : '一般', updateTime: `${dateStr} 10:00`, trend: envTrend > 0 ? '↑' : '↓' },
      { type: '交通', value: traffic < 2 ? '畅通' : '轻度拥堵', updateTime: `${dateStr} 11:00`, trend: trafficTrend < 0 ? '↓' : '↑' },
      { type: '医疗', value: `${med}家`, updateTime: `${dateStr} 12:00`, trend: medTrend > 0 ? '↑' : '→' },
      { type: '教育', value: `${edu}所`, updateTime: `${dateStr} 13:00`, trend: eduTrend > 0 ? '↑' : '→' }
    ];
    const warnings = [
      { level: '高', text: '环境优良率未达标，主要污染源为工业区废气排放，建议加强监管。' },
      { level: '高', text: '医疗资源偏少，每万人仅拥有医疗机构0.42家，低于全市平均值0.65家。' },
      { level: '中', text: '交通拥堵指数处于中等水平，早晚高峰期望湖大道拥堵情况明显。' },
      { level: '中', text: '教育资源分布不均，新区东部学校数量明显不足。' }
    ];
    const realtimeList = [
      { time: `${dateStr} 08:30`, content: `望湖大道早高峰拥堵指数上升至3.6，较昨日增加0.2`, color: '#F56C6C' },
      { time: `${dateStr} 09:10`, content: `新注册企业：山东科创智能科技有限公司`, color: '#67C23A' },
      { time: `${dateStr} 10:15`, content: `空气质量指数(AQI)为72，空气质量良好`, color: '#67C23A' },
      { time: `${dateStr} 11:00`, content: `太白湖医院今日门诊量同比增长12.5%`, color: '#409EFF' }
    ];
    return {
      selectedType: '',
      typeOptions: [
        { label: '全部', value: '' },
        { label: '人口', value: '人口' },
        { label: '企业', value: '企业' },
        { label: '环境', value: '环境' },
        { label: '交通', value: '交通' },
        { label: '医疗', value: '医疗' },
        { label: '教育', value: '教育' }
      ],
      statCards,
      trendMap,
      tableData,
      warnings,
      realtimeList,
      trendType: '人口',
      mapViewMode: 'normal',
    }
  },
  computed: {
    filteredTableData() {
      if (!this.selectedType) return this.tableData
      return this.tableData.filter(row => row.type === this.selectedType)
    },
  },
  mounted() {
    this.initTrendChart()
    this.loadAMap()
    // 自动推送实时动态
    this.realtimeTimer = setInterval(this.pushRealtime, 5000)
    window.scrollTo(0, 0)
  },
  activated() {
    window.scrollTo(0, 0)
  },
  methods: {
    loadAMap() {
      if (window.AMap) {
        this.initMap()
      } else {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        script.src = 'https://webapi.amap.com/maps?v=2.0&key=4e0b6e6e0b6e6e0b6e6e0b6e6e0b6e6e'
        script.onload = () => {
          this.initMap()
        }
        document.head.appendChild(script)
      }
    },
    initTrendChart() {
      if (!this.$refs.trendChart) return
      const chart = echarts.init(this.$refs.trendChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['人口', '企业', '环境优良率', '交通拥堵指数', '医疗资源', '教育资源'] },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
        yAxis: { type: 'value' },
        series: Object.keys(this.trendMap).map(key => ({
          name: key,
          type: 'line',
          data: this.trendMap[key],
          showSymbol: false,
          lineStyle: { width: key === this.trendType ? 3 : 1.5, opacity: key === this.trendType ? 1 : 0.5 },
          emphasis: { focus: 'series' }
        }))
      })
    },
    initMap() {
      // 济宁市中心点坐标
      const center = [116.5871, 35.4154]
      
      // 初始化地图
      this.map = new window.AMap.Map('mapContainer', {
        zoom: 11,
        center: center,
        viewMode: '3D',
        pitch: 50,
        mapStyle: 'amap://styles/fresh',
        features: ['bg', 'road', 'building']
      })

      // 添加地图控件
      this.map.addControl(new window.AMap.Scale())
      this.map.addControl(new window.AMap.ToolBar())
      this.map.addControl(new window.AMap.MapType())

      // 添加行政区划
      const district = new window.AMap.DistrictSearch({
        level: 'district',
        subdistrict: 1
      })

      district.search('济宁市', (status, result) => {
        if (status === 'complete') {
          const bounds = result.districtList[0].boundaries
          const polygon = new window.AMap.Polygon({
            path: bounds,
            strokeWeight: 2,
            strokeColor: '#0091ea',
            fillColor: '#80d8ff',
            fillOpacity: 0.2
          })
          this.map.add(polygon)
          this.map.setFitView([polygon])
        }
      })

      // 添加标记点
      const locations = [
        { name: '太白湖区', position: [116.5871, 35.4154], value: 80, color: '#0091ea' },
        { name: '任城区', position: [116.5950, 35.4140], value: 60, color: '#00b0ff' },
        { name: '兖州区', position: [116.7833, 35.5528], value: 40, color: '#40c4ff' }
      ]

      locations.forEach(location => {
        // 创建标记
        const marker = new window.AMap.Marker({
          position: location.position,
          title: location.name,
          map: this.map,
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(25, 34),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            imageSize: new window.AMap.Size(25, 34)
          })
        })

        // 创建信息窗体
        const infoWindow = new window.AMap.InfoWindow({
          content: `<div style="padding:10px;">
            <h4 style="margin:0 0 5px 0">${location.name}</h4>
            <p style="margin:0">数据值：${location.value}</p>
          </div>`,
          offset: new window.AMap.Pixel(0, -30)
        })

        // 绑定点击事件
        marker.on('click', () => {
          infoWindow.open(this.map, marker.getPosition())
        })

        // 创建圆形区域
        const circle = new window.AMap.Circle({
          center: location.position,
          radius: location.value * 100,
          fillColor: location.color,
          fillOpacity: 0.3,
          strokeColor: location.color,
          strokeWeight: 1,
          map: this.map
        })

        this.markers.push(marker, circle)
      })

      // 添加视图模式切换处理
      this.$watch('mapViewMode', (newMode) => {
        if (this.map) {
          if (newMode === 'heat') {
            // 切换到热力图视图
            if (this.heatmap) {
              this.heatmap.setMap(this.map);
            } else {
              this.createHeatmap();
            }
          } else {
            // 切换到普通视图
            if (this.heatmap) {
              this.heatmap.setMap(null);
            }
          }
        }
      });
    },
    createHeatmap() {
      if (!window.AMap || !window.AMap.HeatMap) return;
      
      // 模拟热力图数据
      const heatmapData = {
        max: 100,
        data: [
          {lng: 116.5871, lat: 35.4154, count: 80}, // 太白湖区
          {lng: 116.5950, lat: 35.4140, count: 60}, // 任城区
          {lng: 116.7833, lat: 35.5528, count: 40}, // 兖州区
          // 添加更多点位数据
          {lng: 116.5471, lat: 35.4054, count: 30},
          {lng: 116.6071, lat: 35.4254, count: 20},
          {lng: 116.5971, lat: 35.3954, count: 50},
          {lng: 116.5671, lat: 35.4354, count: 70},
          {lng: 116.6271, lat: 35.4454, count: 35},
          {lng: 116.5571, lat: 35.3854, count: 45}
        ]
      };
      
      // 创建热力图实例
      this.heatmap = new window.AMap.HeatMap(this.map, {
        radius: 25,
        opacity: [0, 0.8],
        gradient: {
          0.5: 'blue',
          0.65: 'rgb(117,211,248)',
          0.7: 'rgb(0, 255, 0)',
          0.9: 'yellow',
          1.0: 'red'
        }
      });
      
      // 设置热力图数据
      this.heatmap.setDataSet(heatmapData);
    },
    handleCardClick(card) {
      this.$message({ message: `跳转到"${card.title}"相关业务页面（模拟）`, type: 'info' })
    },
    updateTrendChart() {
      if (!this.$refs.trendChart) return;
      const chart = echarts.init(this.$refs.trendChart);
      
      const colors = {
        '人口': '#409EFF',
        '企业': '#67C23A',
        '环境优良率': '#909399',
        '交通拥堵指数': '#E6A23C'
      };
      
      chart.setOption({
        tooltip: { 
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#eee',
          borderWidth: 1,
          textStyle: {
            color: '#606266'
          },
          formatter: (params) => {
            const data = params[0];
            return `${data.name}<br/>${data.seriesName}: ${data.value}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category', 
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#606266'
          }
        },
        yAxis: { 
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#eee',
              type: 'dashed'
            }
          },
          axisLabel: {
            color: '#606266'
          }
        },
        series: Object.keys(this.trendMap).map(key => ({
          name: key,
          type: 'line',
          data: this.trendMap[key],
          showSymbol: key === this.trendType,
          symbolSize: 6,
          lineStyle: { 
            width: key === this.trendType ? 3 : 1, 
            opacity: key === this.trendType ? 1 : 0.3,
            color: colors[key] || '#409EFF'
          },
          itemStyle: {
            color: colors[key] || '#409EFF'
          },
          areaStyle: key === this.trendType ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[key] ? colors[key].replace(')', ', 0.3)').replace('rgb', 'rgba') : 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: colors[key] ? colors[key].replace(')', ', 0.05)').replace('rgb', 'rgba') : 'rgba(64, 158, 255, 0.05)' }
            ])
          } : null,
          emphasis: { 
            focus: 'series',
            lineStyle: {
              width: 4
            }
          }
        }))
      });
    },
    pushRealtime() {
      // 更真实的实时动态数据
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10)
      const timeStr = now.toTimeString().substr(0, 5)
      
      // 更真实的实时动态数据类型
      const types = [
        { 
          content: `望湖大道${this.getTimeOfDay()}拥堵指数为${(2 + Math.random() * 1.5).toFixed(1)}，${Math.random() > 0.5 ? '较昨日上升' : '较昨日下降'}${(Math.random() * 0.3).toFixed(1)}`, 
          color: '#E6A23C' 
        },
        { 
          content: `新注册企业：${this.getRandomCompanyName()}`, 
          color: '#67C23A' 
        },
        { 
          content: `空气质量指数(AQI)为${50 + Math.floor(Math.random() * 50)}，空气质量${Math.random() > 0.3 ? '良好' : '一般'}`, 
          color: '#409EFF' 
        },
        { 
          content: `${this.getRandomHospital()}今日门诊量${Math.random() > 0.5 ? '上升' : '下降'}${Math.floor(Math.random() * 15)}%`, 
          color: '#F56C6C' 
        },
        { 
          content: `${this.getRandomSchool()}举行${this.getRandomEvent()}活动`, 
          color: '#909399' 
        }
      ]
      
      const idx = Math.floor(Math.random() * types.length)
      this.realtimeList.unshift({ time: `${dateStr} ${timeStr}`, ...types[idx] })
      if (this.realtimeList.length > 8) this.realtimeList.pop()
    },
    // 获取时段
    getTimeOfDay() {
      const hour = new Date().getHours()
      if (hour >= 7 && hour <= 9) return '早高峰'
      if (hour >= 17 && hour <= 19) return '晚高峰'
      return '当前'
    },
    // 随机企业名称
    getRandomCompanyName() {
      const prefixes = ['山东', '济宁', '太白湖', '鲁西']
      const industries = ['智能科技', '新能源', '建筑材料', '医疗器械', '食品', '环保科技', '互联网', '农业科技']
      const suffixes = ['有限公司', '股份有限公司', '集团', '实业有限公司']
      
      return prefixes[Math.floor(Math.random() * prefixes.length)] + 
             industries[Math.floor(Math.random() * industries.length)] + 
             suffixes[Math.floor(Math.random() * suffixes.length)]
    },
    // 随机医院名称
    getRandomHospital() {
      const hospitals = ['太白湖医院', '济宁市第一人民医院', '济宁市妇幼保健院太白湖分院', '太白湖社区医院', '康复医院']
      return hospitals[Math.floor(Math.random() * hospitals.length)]
    },
    // 随机学校名称
    getRandomSchool() {
      const schools = ['太白湖实验学校', '济宁一中太白湖校区', '太白湖小学', '新区第二中学', '新区幼儿园']
      return schools[Math.floor(Math.random() * schools.length)]
    },
    // 随机事件
    getRandomEvent() {
      const events = ['科技创新', '读书', '体育', '艺术节', '安全教育', '环保', '校园开放日']
      return events[Math.floor(Math.random() * events.length)]
    },
    refreshRealtime() {
      this.pushRealtime()
      this.$message.success('区域实时动态已刷新')
    },
    refreshTable() {
      // 生成今天的模拟数据，但保持在真实范围内
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      
      // 更真实的数据范围
      const pop = 28.2 + Math.random() * 0.8;
      const ent = 3200 + Math.floor(Math.random() * 100);
      const env = (91 + Math.random() * 2).toFixed(1);
      const traffic = (2.2 + Math.random() * 0.4).toFixed(2);
      const med = 11 + Math.floor(Math.random() * 2);
      const edu = 34 + Math.floor(Math.random() * 2);
      
      // 合理的波动趋势
      const envTrend = (Math.random() > 0.6 ? 1 : -1) * (0.1 + Math.random() * 0.3);
      const trafficTrend = (Math.random() > 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.08);
      const medTrend = Math.random() > 0.8 ? 1 : 0;
      const eduTrend = Math.random() > 0.9 ? 1 : 0;
      
      const timeArr = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];
      this.tableData = [
        { type: '人口', value: `${pop.toFixed(1)}万`, updateTime: `${dateStr} ${timeArr[0]}`, trend: '↑' },
        { type: '企业', value: `${ent}家`, updateTime: `${dateStr} ${timeArr[1]}`, trend: '↑' },
        { type: '环境', value: env >= 90 ? '良' : '一般', updateTime: `${dateStr} ${timeArr[2]}`, trend: envTrend > 0 ? '↑' : '↓' },
        { type: '交通', value: traffic < 2 ? '畅通' : '轻度拥堵', updateTime: `${dateStr} ${timeArr[3]}`, trend: trafficTrend < 0 ? '↓' : '↑' },
        { type: '医疗', value: `${med}家`, updateTime: `${dateStr} ${timeArr[4]}`, trend: medTrend > 0 ? '↑' : '→' },
        { type: '教育', value: `${edu}所`, updateTime: `${dateStr} ${timeArr[5]}`, trend: eduTrend > 0 ? '↑' : '→' }
      ];
      this.$message.success('区域数据明细已刷新');
    },
    refreshAll() {
      this.refreshTable()
      this.pushRealtime()
      this.updateTrendChart()
      this.$message.success('全部数据已刷新')
    },
    // 导出分析报告
    exportReport() {
      const minutes = Math.floor(Math.random() * 120) + 1;
      this.$alert(`分析报告已生成，用时${minutes}分钟。`, '导出分析报告', { confirmButtonText: '确定', type: 'success' });
    },
    trendValue(card) {
      // 医疗/教育资源用整数，其他用浮点
      if (card.title === '医疗资源' || card.title === '教育资源') {
        return Number(card.trend);
      }
      return parseFloat(card.trend);
    },
    trendAbs(card) {
      if (card.title === '医疗资源' || card.title === '教育资源') {
        return Math.abs(Number(card.trend));
      }
      return Math.abs(parseFloat(card.trend)).toFixed(1);
    },
    trendPrefix(card) {
      const v = this.trendValue(card);
      if (v > 0) return '+';
      if (v < 0) return '-';
      return '';
    },
    trendUnit(card) {
      if (card.title === '医疗资源') return '家';
      if (card.title === '教育资源') return '所';
      return '%';
    },
    trendClass(card) {
      const v = this.trendValue(card);
      if (v > 0) return 'trend-up';
      if (v < 0) return 'trend-down';
      return 'trend-flat';
    },
    getCardClass(card) {
      if (card.title === '人口总数') return 'card-people';
      if (card.title === '企业数量') return 'card-business';
      if (card.title === '环境优良率') return 'card-environment';
      if (card.title === '交通拥堵指数') return 'card-traffic';
      if (card.title === '医疗资源') return 'card-medical';
      if (card.title === '教育资源') return 'card-education';
      return '';
    },
    getTrendTagType(trend) {
      if (trend === '↑') return 'success';
      if (trend === '↓') return 'danger';
      return 'info';
    },
    viewDetail(row) {
      this.$message({
        message: `查看${row.type}详细数据分析`,
        type: 'info'
      });
    }
  },
  beforeDestroy() {
    if (this.map) {
      this.map.destroy()
    }
    if (this.realtimeTimer) {
      clearInterval(this.realtimeTimer)
    }
  }
}
</script>

<style scoped>
.region-insight-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 22px;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 6px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.notification-area {
  margin-bottom: 20px;
}

.dashboard-announcement {
  margin-bottom: 10px;
}

.warning-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.warning-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.warning-header i {
  color: #F56C6C;
  margin-right: 8px;
  font-size: 18px;
}

.warning-count {
  margin-left: auto;
}

.warning-content {
  padding: 10px 0;
}

.warning-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #fdf6ec;
  transition: all 0.3s;
}

.warning-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.warning-item:last-child {
  margin-bottom: 0;
}

.high-warning {
  background-color: #fef0f0;
  border-left: 4px solid #F56C6C;
}

.medium-warning {
  background-color: #fdf6ec;
  border-left: 4px solid #E6A23C;
}

.warning-icon {
  margin-right: 10px;
  font-size: 20px;
}

.high-warning .warning-icon i {
  color: #F56C6C;
}

.medium-warning .warning-icon i {
  color: #E6A23C;
}

.warning-text {
  flex: 1;
}

.warning-level {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.high-warning .warning-level {
  color: #F56C6C;
}

.medium-warning .warning-level {
  color: #E6A23C;
}

.warning-message {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.warning-action {
  margin-left: 10px;
  align-self: center;
}

.data-cards {
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  height: 140px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, rgba(64, 158, 255, 0.8), rgba(64, 158, 255, 0.4));
}

.card-people::after {
  background: linear-gradient(to right, rgba(64, 158, 255, 0.8), rgba(64, 158, 255, 0.4));
}

.card-business::after {
  background: linear-gradient(to right, rgba(103, 194, 58, 0.8), rgba(103, 194, 58, 0.4));
}

.card-environment::after {
  background: linear-gradient(to right, rgba(144, 147, 153, 0.8), rgba(144, 147, 153, 0.4));
}

.card-traffic::after {
  background: linear-gradient(to right, rgba(230, 162, 60, 0.8), rgba(230, 162, 60, 0.4));
}

.card-medical::after {
  background: linear-gradient(to right, rgba(245, 108, 108, 0.8), rgba(245, 108, 108, 0.4));
}

.card-education::after {
  background: linear-gradient(to right, rgba(83, 168, 255, 0.8), rgba(83, 168, 255, 0.4));
}

.card-icon {
  font-size: 20px;
  color: #909399;
  margin-bottom: 12px;
}

.card-people .card-icon {
  color: #409EFF;
}

.card-business .card-icon {
  color: #67C23A;
}

.card-environment .card-icon {
  color: #909399;
}

.card-traffic .card-icon {
  color: #E6A23C;
}

.card-medical .card-icon {
  color: #F56C6C;
}

.card-education .card-icon {
  color: #53A8FF;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 13px;
}

.trend-up {
  color: #67C23A;
  display: flex;
  align-items: center;
}

.trend-down {
  color: #F56C6C;
  display: flex;
  align-items: center;
}

.trend-flat {
  color: #909399;
  display: flex;
  align-items: center;
}

.trend-up i, .trend-down i, .trend-flat i {
  margin-right: 4px;
  font-size: 14px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 10px 0;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.chart-title i {
  margin-right: 8px;
  color: #409EFF;
}

.chart-container {
  height: 350px;
}

.realtime-section {
  margin-bottom: 20px;
}

.realtime-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.realtime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.realtime-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.realtime-title i {
  margin-right: 8px;
  color: #409EFF;
}

.realtime-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.realtime-timeline {
  padding: 10px;
  max-height: 350px;
  overflow-y: auto;
}

.timeline-card {
  transition: all 0.3s;
}

.timeline-card:hover {
  transform: translateX(5px);
}

.timeline-content {
  font-size: 14px;
  color: #606266;
}

.detail-card {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.detail-title i {
  margin-right: 8px;
  color: #409EFF;
}

.dashboard-table-row {
  transition: all 0.3s;
}

.dashboard-table-row:hover {
  background-color: #f0f9ff !important;
}
</style> 