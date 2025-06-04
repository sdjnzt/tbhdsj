<template>
  <div class="regulation-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <span class="page-title">综合监管管控</span>
      <el-input placeholder="搜索对象/告警/事件" v-model="search" size="small" style="width:220px;margin-right:12px;" clearable />
      <el-button icon="el-icon-refresh" @click="refresh">刷新</el-button>
      <el-button icon="el-icon-download" @click="exportData">导出</el-button>
      <el-button icon="el-icon-check" type="success" @click="batchDeal" :disabled="!selectedAlarms.length">批量处置</el-button>
    </div>
    <!-- 统计卡片区 -->
    <el-row :gutter="16" class="overview-row">
      <el-col :span="4" v-for="card in overviewCards" :key="card.title">
        <el-card>
          <div class="overview-title">{{ card.title }}</div>
          <div class="overview-value">{{ card.value }}</div>
          <div class="overview-trend" :class="trendClass(card)">
            <i v-if="card.trend>0" class="el-icon-caret-top"></i>
            <i v-else-if="card.trend<0" class="el-icon-caret-bottom"></i>
            <span>{{ card.trend>0?'+':'' }}{{ card.trend }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 数据可视化区 -->
    <el-row :gutter="16" style="margin-top:16px;">
      <el-col :span="8">
        <el-card>
          <div slot="header">监管对象分布</div>
          <div ref="distChart" style="height:200px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div slot="header">告警趋势</div>
          <div ref="alarmTrendChart" style="height:200px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div slot="header">处置效率分析</div>
          <div ref="efficiencyChart" style="height:200px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 智能分析区 -->
    <el-row :gutter="16" style="margin-top:16px;">
      <el-col :span="8" v-for="intel in intelCards" :key="intel.title">
        <el-card>
          <div class="intel-title"><i :class="intel.icon" style="margin-right:6px;color:#409EFF;"></i>{{ intel.title }}</div>
          <div class="intel-desc">{{ intel.desc }}</div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 告警列表 -->
    <el-card style="margin-top:16px;">
      <div slot="header">异常告警列表</div>
      <el-table :data="filteredAlarmList" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="type" label="告警类型"/>
        <el-table-column prop="desc" label="描述"/>
        <el-table-column prop="object" label="对象"/>
        <el-table-column prop="level" label="级别"/>
        <el-table-column prop="time" label="发生时间"/>
        <el-table-column prop="status" label="状态"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleDeal(scope.row)" :disabled="scope.row.status==='已处置'">处置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 监管对象明细表 -->
    <el-card style="margin-top:16px;">
      <div slot="header">监管对象明细</div>
      <el-table :data="filteredObjectList" stripe>
        <el-table-column prop="name" label="对象名称"/>
        <el-table-column prop="industry" label="行业"/>
        <el-table-column prop="region" label="区域"/>
        <el-table-column prop="risk" label="风险等级"/>
        <el-table-column prop="status" label="状态"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewObject(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 事件流/动态 -->
    <el-card style="margin-top:16px;">
      <div slot="header">监管事件流</div>
      <el-timeline>
        <el-timeline-item
          v-for="(item, idx) in eventList"
          :key="idx"
          :timestamp="item.time"
          :color="item.color"
        >
          <span>{{ item.content }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>
    <!-- 对象详情弹窗 -->
    <el-dialog :visible.sync="objectDialogVisible" width="420px" :title="objectDetail.name">
      <div v-if="objectDetail">
        <p><b>行业：</b>{{ objectDetail.industry }}</p>
        <p><b>区域：</b>{{ objectDetail.region }}</p>
        <p><b>风险等级：</b>{{ objectDetail.risk }}</p>
        <p><b>状态：</b>{{ objectDetail.status }}</p>
        <p><b>简介：</b>{{ objectDetail.desc }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

function randomPick(arr) { return arr[Math.floor(Math.random()*arr.length)] }

export default {
  name: 'IntegrationMonitor',
  data() {
    // 真实业务模拟数据
    const regions = [
      '太白湖街道',
      '南阳湖街道',
      '孔庄街道',
      '新城街道',
      '太白湖旅游度假区',
      '太白湖高新技术产业园区',
      '太白湖现代农业示范区'
    ]
    const industries = ['医疗卫生','教育培训','制造业','现代服务业','交通运输','生态环保','文旅文创']
    const objectList = [
      { name: '太白湖新区第一人民医院', industry: '医疗卫生', region: '太白湖街道', risk: '中', status: '正常', desc: '区域内主要医疗机构' },
      { name: '太白湖实验小学', industry: '教育培训', region: '新城街道', risk: '低', status: '正常', desc: '区域重点小学，学生1200人' },
      { name: '太白湖高新企业A公司', industry: '制造业', region: '太白湖高新技术产业园区', risk: '高', status: '重点关注', desc: '智能装备制造，去年产值2亿元' },
      { name: '南阳湖污水处理厂', industry: '生态环保', region: '南阳湖街道', risk: '中', status: '异常', desc: '负责南阳湖片区污水处理' },
      { name: '太白湖旅游度假区游客中心', industry: '文旅文创', region: '太白湖旅游度假区', risk: '低', status: '正常', desc: '年接待游客超50万人次' },
      { name: '孔庄社区卫生服务中心', industry: '医疗卫生', region: '孔庄街道', risk: '低', status: '正常', desc: '基层医疗卫生服务机构' },
      { name: '太白湖现代农业示范园', industry: '现代服务业', region: '太白湖现代农业示范区', risk: '中', status: '正常', desc: '集现代农业、观光、科普于一体' },
      { name: '新城公交枢纽站', industry: '交通运输', region: '新城街道', risk: '中', status: '异常', desc: '区域交通运输枢纽' },
      { name: '太白湖高新企业B公司', industry: '制造业', region: '太白湖高新技术产业园区', risk: '高', status: '重点关注', desc: '新能源设备制造' },
      { name: '南阳湖小学', industry: '教育培训', region: '南阳湖街道', risk: '低', status: '正常', desc: '南阳湖片区重点小学' }
    ]
    const alarmList = [
      { type: '数据异常', desc: '医院数据接口异常', object: '太白湖新区第一人民医院', region: '太白湖街道', level: '高', responseTime: 6, status: '未处置', time: '2025-06-04 09:10' },
      { type: '合规告警', desc: '企业环保年检逾期', object: '太白湖高新企业A公司', region: '太白湖高新技术产业园区', level: '高', responseTime: 8, status: '已处置', time: '2025-06-04 08:50' },
      { type: '风险预警', desc: '污水处理厂排放超标', object: '南阳湖污水处理厂', region: '南阳湖街道', level: '中', responseTime: 7, status: '未处置', time: '2025-06-03 17:30' },
      { type: '数据异常', desc: '学校学生信息缺失', object: '太白湖实验小学', region: '新城街道', level: '低', responseTime: 5, status: '已处置', time: '2025-06-03 15:20' },
      { type: '系统异常', desc: '游客中心监控系统离线', object: '太白湖旅游度假区游客中心', region: '太白湖旅游度假区', level: '中', responseTime: 4, status: '未处置', time: '2025-06-03 14:10' },
      { type: '数据异常', desc: '公交枢纽站车辆GPS异常', object: '新城公交枢纽站', region: '新城街道', level: '中', responseTime: 3, status: '未处置', time: '2025-06-02 10:30' },
      { type: '合规告警', desc: '企业安全生产台账缺失', object: '太白湖高新企业B公司', region: '太白湖高新技术产业园区', level: '高', responseTime: 9, status: '未处置', time: '2025-06-02 09:50' },
      { type: '风险预警', desc: '农业示范园农药使用超标', object: '太白湖现代农业示范园', region: '太白湖现代农业示范区', level: '中', responseTime: 7, status: '已处置', time: '2025-06-01 16:10' },
      { type: '数据异常', desc: '社区卫生服务中心报表异常', object: '孔庄社区卫生服务中心', region: '孔庄街道', level: '低', responseTime: 2, status: '已处置', time: '2025-06-01 11:20' },
      { type: '数据异常', desc: '小学学生健康档案缺失', object: '南阳湖小学', region: '南阳湖街道', level: '低', responseTime: 3, status: '未处置', time: '2025-06-01 10:10' }
    ]
    return {
      search: '',
      overviewCards: [
        { title: '监管对象总数', value: 1280, trend: 2.1 },
        { title: '异常告警数', value: 32, trend: -1.5 },
        { title: '处置完成率', value: '96.5%', trend: 0.8 },
        { title: '数据合规率', value: '98.2%', trend: 0.3 },
        { title: '重点对象数', value: 120, trend: 1.2 },
        { title: '今日新增告警', value: 5, trend: 0.0 }
      ],
      alarmList,
      objectList,
      eventList: [
        { time: '2025-06-04 09:20', content: '完成对高风险企业的专项检查', color: '#67C23A' },
        { time: '2025-06-04 08:55', content: '处置数据异常告警1条', color: '#409EFF' },
        { time: '2025-06-03 17:40', content: '发现企业年报合规问题', color: '#E6A23C' },
        { time: '2025-06-03 15:30', content: '完成对人口数据异常的核查', color: '#67C23A' }
      ],
      intelCards: [
        { title: '高发异常分析', desc: '本月高风险对象集中在制造业和互联网行业。', icon: 'el-icon-warning-outline' },
        { title: '处置瓶颈诊断', desc: '部分异常处置超时，建议优化流程。', icon: 'el-icon-timer' },
        { title: '智能合规建议', desc: '建议加强对重点区域企业的合规监管。', icon: 'el-icon-s-opportunity' }
      ],
      selectedAlarms: [],
      objectDialogVisible: false,
      objectDetail: {}
    }
  },
  computed: {
    filteredAlarmList() {
      if (!this.search) return this.alarmList
      return this.alarmList.filter(a => a.desc.includes(this.search)||a.object.includes(this.search)||a.type.includes(this.search))
    },
    filteredObjectList() {
      if (!this.search) return this.objectList
      return this.objectList.filter(o => o.name.includes(this.search)||o.industry.includes(this.search)||o.region.includes(this.search))
    }
  },
  mounted() {
    this.initDistChart()
    this.initAlarmTrendChart()
    this.initEfficiencyChart()
  },
  methods: {
    refresh() {
      this.$message.success('数据已刷新')
    },
    exportData() {
      this.$message.success('导出成功（模拟）')
    },
    batchDeal() {
      this.selectedAlarms.forEach(a=>a.status='已处置')
      this.$message.success('批量处置完成')
    },
    handleDeal(row) {
      row.status = '已处置'
      this.$message.success('告警已处置')
    },
    handleSelectionChange(val) {
      this.selectedAlarms = val
    },
    viewObject(row) {
      this.objectDetail = row
      this.objectDialogVisible = true
    },
    trendClass(card) {
      if (card.trend > 0) return 'trend-up'
      if (card.trend < 0) return 'trend-down'
      return 'trend-flat'
    },
    initDistChart() {
      this.$nextTick(()=>{
        const chart = echarts.init(this.$refs.distChart)
        chart.setOption({
          tooltip: { trigger: 'item' },
          legend: { top: '5%', left: 'center' },
          series: [
            {
              name: '对象分布',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              label: { show: false, position: 'center' },
              emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
              labelLine: { show: false },
              data: [
                { value: 520, name: '企业' },
                { value: 320, name: '人口' },
                { value: 210, name: '重点场所' },
                { value: 120, name: '高风险对象' },
                { value: 110, name: '其他' }
              ]
            }
          ]
        })
      })
    },
    initAlarmTrendChart() {
      this.$nextTick(()=>{
        const chart = echarts.init(this.$refs.alarmTrendChart)
        chart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['5-29', '5-30', '5-31', '6-1', '6-2', '6-3', '6-4'] },
          yAxis: { type: 'value' },
          series: [
            {
              name: '告警数',
              type: 'bar',
              data: [5, 8, 6, 10, 7, 12, 9],
              itemStyle: { color: '#409EFF' }
            }
          ]
        })
      })
    },
    initEfficiencyChart() {
      this.$nextTick(()=>{
        const chart = echarts.init(this.$refs.efficiencyChart)
        chart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['5-29', '5-30', '5-31', '6-1', '6-2', '6-3', '6-4'] },
          yAxis: { type: 'value' },
          series: [
            {
              name: '处置效率',
              type: 'line',
              data: [80, 85, 90, 88, 92, 95, 96],
              itemStyle: { color: '#67C23A' }
            }
          ]
        })
      })
    }
  }
}
</script>

<style scoped>
.regulation-page {
  padding: 24px 24px 32px 24px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 18px;
}
.page-title {
  font-size: 22px;
  font-weight: bold;
  color: #222;
  margin-right: 18px;
}
.overview-row {
  margin-bottom: 12px;
}
.overview-title {
  font-size: 15px;
  color: #888;
  margin-bottom: 4px;
}
.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
.overview-trend {
  font-size: 14px;
  margin-top: 2px;
  color: #909399;
}
.trend-up {
  color: #67C23A;
}
.trend-down {
  color: #F56C6C;
}
.trend-flat {
  color: #909399;
}
.intel-title {
  font-size: 16px;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px;
}
.intel-desc {
  font-size: 14px;
  color: #666;
}
</style> 