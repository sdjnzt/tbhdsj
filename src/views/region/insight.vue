<template>
  <div class="page-container">
    <!-- 公告栏 -->
    <el-alert
      class="dashboard-announcement"
      :title="'【区域动态】当前为太白湖新区区域状况洞察，数据为模拟演示，仅供参考。'"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />
    <el-alert
      class="dashboard-update"
      title="今日数据已全部更新"
      type="success"
      show-icon
      :closable="false"
      style="margin-bottom: 16px;"
    />
    <!-- 智能预警区块 -->
    <el-card class="warn-card" style="margin-bottom: 16px;">
      <div slot="header">
        <i class="el-icon-warning" style="color:#F56C6C;margin-right:6px;"></i>智能预警与建议
      </div>
      <ul>
        <li v-for="(item, idx) in warnings" :key="idx" :style="{color: item.level === '高' ? '#F56C6C' : '#E6A23C'}">
          <b v-if="item.level === '高'">[高]</b><b v-else>[中]</b> {{ item.text }}
        </li>
      </ul>
    </el-card>
    <div class="header-bar">
      <h2>区域状况洞察</h2>
      <div class="actions">
        <el-select v-model="selectedType" placeholder="选择数据类型" size="small" style="width: 140px; margin-right: 10px;">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" icon="el-icon-refresh" size="small" @click="refreshAll" style="margin-right: 10px;">刷新</el-button>
        <el-button type="primary" icon="el-icon-download" size="small" @click="exportReport">导出分析报告</el-button>
      </div>
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
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div class="chart-title">
            区域数据趋势
            <el-select v-model="trendType" size="mini" style="width: 120px; margin-left: 20px;" @change="updateTrendChart">
              <el-option label="人口" value="人口" />
              <el-option label="企业" value="企业" />
              <el-option label="环境优良率" value="环境优良率" />
              <el-option label="交通拥堵指数" value="交通拥堵指数" />
            </el-select>
          </div>
          <div ref="trendChart" style="height:320px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div class="chart-title">济宁市区域分布</div>
          <div id="mapContainer" style="height:320px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 实时动态区块 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="realtime-card">
          <div slot="header" class="clearfix">
            <span>区域实时动态</span>
            <el-button type="text" style="float: right;" @click="refreshRealtime">手动刷新</el-button>
          </div>
          <el-timeline style="max-height: 120px; overflow-y: auto;">
            <el-timeline-item
              v-for="(item, idx) in realtimeList"
              :key="idx"
              :timestamp="item.time"
              :color="item.color"
            >
              <span>{{ item.content }}</span>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:20px;">
      <div slot="header">
        区域数据明细
        <el-button type="text" style="float: right; color: #409EFF;" @click="refreshTable">刷新</el-button>
      </div>
      <el-table :data="filteredTableData" style="width:100%" row-class-name="dashboard-table-row">
        <el-table-column prop="type" label="数据类型" width="120" />
        <el-table-column prop="value" label="当前值" width="120" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column prop="trend" label="趋势" />
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
    // 只保留太白湖区数据
    const pop = 53, ent = 14642, env = 98.8, traffic = 1.59, med = 18, edu = 50;
    const popTrend = 0.3, entTrend = 0.4, envTrend = 0.3, trafficTrend = -0.1, medTrend = 0, eduTrend = 0;
    const statCards = [
      { title: '人口总数', value: `${pop}万`, trend: popTrend, icon: 'el-icon-user', footer: `环比+${popTrend}%` },
      { title: '企业数量', value: `${ent}家`, trend: entTrend, icon: 'el-icon-office-building', footer: `环比+${entTrend}%` },
      { title: '环境优良率', value: `${env}%`, trend: Math.abs(envTrend), icon: 'el-icon-s-flag', footer: `环比${envTrend > 0 ? '+' : ''}${envTrend.toFixed(1)}%` },
      { title: '交通拥堵指数', value: traffic, trend: trafficTrend, icon: 'el-icon-truck', footer: `环比${trafficTrend > 0 ? '+' : ''}${trafficTrend}` },
      { title: '医疗资源', value: `${med}家`, trend: medTrend, icon: 'el-icon-s-help', footer: `环比${medTrend > 0 ? '+1' : '0'}家` },
      { title: '教育资源', value: `${edu}所`, trend: eduTrend, icon: 'el-icon-s-management', footer: `环比${eduTrend > 0 ? '+1' : '0'}所` }
    ];
    const trendMap = {
      '人口': [51, 52, 52.5, 53, 53.5, 54],
      '企业': [14000, 14200, 14400, 14642, 14800, 15000],
      '环境优良率': [97.8, 98.2, 98.5, 98.8, 98.9, 99.0],
      '交通拥堵指数': [1.7, 1.65, 1.62, 1.59, 1.55, 1.52],
      '医疗资源': [16, 17, 17, 18, 18, 18],
      '教育资源': [48, 49, 50, 50, 50, 50]
    };
    const tableData = [
      { type: '人口', value: `${pop}万`, updateTime: `${dateStr} 08:00`, trend: '↑' },
      { type: '企业', value: `${ent}家`, updateTime: `${dateStr} 09:00`, trend: '↑' },
      { type: '环境', value: env >= 98 ? '优' : '良', updateTime: `${dateStr} 10:00`, trend: envTrend > 0 ? '↑' : '↓' },
      { type: '交通', value: traffic < 1.4 ? '畅通' : '一般', updateTime: `${dateStr} 11:00`, trend: trafficTrend < 0 ? '↓' : '↑' },
      { type: '医疗', value: `${med}家`, updateTime: `${dateStr} 12:00`, trend: medTrend > 0 ? '↑' : '→' },
      { type: '教育', value: `${edu}所`, updateTime: `${dateStr} 13:00`, trend: eduTrend > 0 ? '↑' : '→' }
    ];
    const warnings = [
      { level: '高', text: '企业增长率低于全市平均，建议加大招商引资力度。' },
      { level: '中', text: '交通拥堵指数略高，建议优化交通组织。' }
    ];
    const realtimeList = [
      { time: `${dateStr} 08:30`, content: `今日新增人口120人`, color: '#409EFF' },
      { time: `${dateStr} 09:10`, content: `新注册企业2家`, color: '#67C23A' },
      { time: `${dateStr} 10:20`, content: `新增医疗机构0家`, color: '#E6A23C' },
      { time: `${dateStr} 11:00`, content: `新增学校0所`, color: '#F56C6C' }
    ];
    return {
      selectedType: '',
      typeOptions: [
        { label: '全部', value: '' },
        { label: '人口', value: '人口' },
        { label: '企业', value: '企业' },
        { label: '环境', value: '环境' },
        { label: '交通', value: '交通' },
        { label: '用电', value: '用电' }
      ],
      statCards,
      trendMap,
      tableData,
      warnings,
      realtimeList,
      trendType: '人口',
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
    },
    handleCardClick(card) {
      this.$message({ message: `跳转到"${card.title}"相关业务页面（模拟）`, type: 'info' })
    },
    updateTrendChart() {
      if (!this.$refs.trendChart) return;
      const chart = echarts.init(this.$refs.trendChart);
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
      });
    },
    pushRealtime() {
      // 自动推送一条实时动态
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10)
      const timeStr = now.toTimeString().substr(0, 5)
      const types = [
        { content: `新增人口：${1000 + Math.floor(Math.random() * 200)}人`, color: '#409EFF' },
        { content: `新增企业：${2 + Math.floor(Math.random() * 3)}家`, color: '#67C23A' },
        { content: `新增医疗机构：${1 + Math.floor(Math.random() * 3)}家`, color: '#E6A23C' },
        { content: `新增学校：${1 + Math.floor(Math.random() * 3)}所`, color: '#F56C6C' }
      ]
      const idx = Math.floor(Math.random() * types.length)
      this.realtimeList.unshift({ time: `${dateStr} ${timeStr}`, ...types[idx] })
      if (this.realtimeList.length > 8) this.realtimeList.pop()
    },
    refreshRealtime() {
      this.pushRealtime()
      this.$message.success('区域实时动态已刷新')
    },
    refreshTable() {
      // 生成今天的模拟数据
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const pop = 52 + Math.floor(Math.random() * 8);
      const ent = 12000 + Math.floor(Math.random() * 4000);
      const env = (97 + Math.random() * 2).toFixed(1);
      const traffic = (1.2 + Math.random() * 0.5).toFixed(2);
      const med = 18 + Math.floor(Math.random() * 8);
      const edu = 45 + Math.floor(Math.random() * 10);
      const envTrend = (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.4);
      const trafficTrend = (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.1);
      const medTrend = Math.random() > 0.5 ? 1 : 0;
      const eduTrend = Math.random() > 0.5 ? 1 : 0;
      const timeArr = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];
      this.tableData = [
        { type: '人口', value: `${pop}万`, updateTime: `${dateStr} ${timeArr[0]}`, trend: '↑' },
        { type: '企业', value: `${ent}家`, updateTime: `${dateStr} ${timeArr[1]}`, trend: '↑' },
        { type: '环境', value: env >= 98 ? '优' : '良', updateTime: `${dateStr} ${timeArr[2]}`, trend: envTrend > 0 ? '↑' : '↓' },
        { type: '交通', value: traffic < 1.4 ? '畅通' : '一般', updateTime: `${dateStr} ${timeArr[3]}`, trend: trafficTrend < 0 ? '↓' : '↑' },
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
.page-container { padding: 20px; }
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.actions {
  display: flex;
  align-items: center;
}
.stat-card {
  text-align: center;
}
.stat-card .card-title {
  font-size: 15px;
  color: #888;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-card .card-title i {
  margin-right: 4px;
}
.stat-card .card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-card .main-value {
  font-size: 32px;
  font-weight: bold;
  color: #222;
  display: block;
  margin-bottom: 2px;
}
.trend-block {
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-top: 2px;
}
.trend-block .el-icon-caret-top {
  color: #67C23A;
  margin-right: 2px;
}
.trend-block .el-icon-caret-bottom {
  color: #F56C6C;
  margin-right: 2px;
}
.trend-up .trend-num {
  color: #67C23A;
}
.trend-down .trend-num {
  color: #F56C6C;
}
.trend-flat .trend-num {
  color: #909399;
}
.stat-card .card-footer {
  font-size: 13px;
  color: #aaa;
  margin-top: 6px;
}
.chart-title {
  font-size: 15px;
  color: #666;
  margin-bottom: 8px;
}
</style> 