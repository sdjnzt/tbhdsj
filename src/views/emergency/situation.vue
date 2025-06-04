<template>
  <div class="emergency-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <span class="page-title">应急态势掌控</span>
      <el-input placeholder="搜索事件/地点/类型" v-model="search" size="small" style="width:220px;margin-right:12px;" clearable />
      <el-button icon="el-icon-plus" type="primary" @click="reportDialogVisible=true">事件上报</el-button>
      <el-button icon="el-icon-refresh" @click="refresh">刷新</el-button>
      <el-button icon="el-icon-download" @click="exportData">导出</el-button>
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
          <div slot="header">事件类型分布</div>
          <div ref="typeChart" style="height:200px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div slot="header">事件趋势</div>
          <div ref="trendChart" style="height:200px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div slot="header">响应效率分析</div>
          <div ref="efficiencyChart" style="height:200px;"></div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 智能分析区 -->
    <el-row :gutter="16" style="margin-top:16px;">
      <el-col :span="8" v-for="intel in intelCards" :key="intel.title">
        <el-card>
          <div class="intel-title"><i :class="intel.icon" style="margin-right:6px;color:#F56C6C;"></i>{{ intel.title }}</div>
          <div class="intel-desc">{{ intel.desc }}</div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 应急事件列表 -->
    <el-card style="margin-top:16px;">
      <div slot="header">应急事件列表</div>
      <el-table :data="filteredEventList" stripe>
        <el-table-column prop="type" label="事件类型"/>
        <el-table-column prop="desc" label="描述"/>
        <el-table-column prop="location" label="发生地点"/>
        <el-table-column prop="level" label="级别">
          <template slot-scope="scope">
            <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responseTime" label="响应时间(分钟)"/>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="发生时间"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="viewEvent(scope.row)">详情</el-button>
            <el-button size="mini" type="success" @click="handleDeal(scope.row)" :disabled="scope.row.status==='已处置'">处置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 事件流/动态 -->
    <el-card style="margin-top:16px;">
      <div slot="header">应急事件流</div>
      <el-timeline>
        <el-timeline-item
          v-for="(item, idx) in eventTimeline"
          :key="idx"
          :timestamp="item.time"
          :color="item.color"
        >
          <span>{{ item.content }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>
    <!-- 事件详情弹窗 -->
    <el-dialog :visible.sync="eventDialogVisible" width="420px" :title="eventDetail.type+'详情'">
      <div v-if="eventDetail">
        <p><b>描述：</b>{{ eventDetail.desc }}</p>
        <p><b>发生地点：</b>{{ eventDetail.location }}</p>
        <p><b>级别：</b>{{ eventDetail.level }}</p>
        <p><b>响应时间：</b>{{ eventDetail.responseTime }} 分钟</p>
        <p><b>状态：</b>{{ eventDetail.status }}</p>
        <p><b>发生时间：</b>{{ eventDetail.time }}</p>
        <p><b>处置措施：</b>{{ eventDetail.action || '——' }}</p>
      </div>
    </el-dialog>
    <!-- 事件上报弹窗 -->
    <el-dialog :visible.sync="reportDialogVisible" width="420px" title="事件上报">
      <el-form :model="reportForm" :rules="reportRules" ref="reportForm" label-width="90px">
        <el-form-item label="事件类型" prop="type">
          <el-select v-model="reportForm.type" placeholder="请选择事件类型">
            <el-option v-for="item in eventTypes" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="reportForm.desc" type="textarea" :rows="2" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="发生地点" prop="location">
          <el-select v-model="reportForm.location" placeholder="请选择地点">
            <el-option v-for="item in locations" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="reportForm.level" placeholder="请选择级别">
            <el-option v-for="item in levels" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="发生时间" prop="time">
          <el-date-picker v-model="reportForm.time" type="datetime" placeholder="选择时间" style="width:100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="reportDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitReport">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EmergencySituation',
  data() {
    const locations = [
      '太白湖街道','南阳湖街道','孔庄街道','新城街道','太白湖旅游度假区','太白湖高新技术产业园区','太白湖现代农业示范区'
    ]
    const eventTypes = ['火灾','交通事故','医疗急救','自然灾害','公共卫生','危险品泄漏']
    const levels = ['Ⅰ级(特别重大)','Ⅱ级(重大)','Ⅲ级(较大)','Ⅳ级(一般)']
    const eventList = [
      { type: '火灾', desc: '新城街道居民楼发生火灾，已疏散居民。', location: '新城街道', level: 'Ⅱ级(重大)', responseTime: 6, status: '已处置', time: '2025-06-04 09:10', action: '消防队及时扑救，未造成人员伤亡。' },
      { type: '交通事故', desc: '南阳湖街道发生多车追尾事故。', location: '南阳湖街道', level: 'Ⅲ级(较大)', responseTime: 7, status: '已处置', time: '2025-06-04 08:50', action: '交警、120现场处置，交通已恢复。' },
      { type: '医疗急救', desc: '太白湖街道一工地工人突发疾病。', location: '太白湖街道', level: 'Ⅳ级(一般)', responseTime: 4, status: '已处置', time: '2025-06-03 17:30', action: '120及时送医，已脱离危险。' },
      { type: '自然灾害', desc: '孔庄街道出现短时强降雨，部分道路积水。', location: '孔庄街道', level: 'Ⅲ级(较大)', responseTime: 8, status: '已处置', time: '2025-06-03 15:20', action: '排水部门及时排涝，交通基本恢复。' },
      { type: '公共卫生', desc: '太白湖旅游度假区出现疑似食物中毒事件。', location: '太白湖旅游度假区', level: 'Ⅱ级(重大)', responseTime: 5, status: '处置中', time: '2025-06-03 14:10', action: '疾控中心已介入调查。' },
      { type: '危险品泄漏', desc: '高新技术产业园区一企业发生危险品泄漏。', location: '太白湖高新技术产业园区', level: 'Ⅰ级(特别重大)', responseTime: 9, status: '已处置', time: '2025-06-02 10:30', action: '应急队伍及时封控，未造成环境污染。' },
      { type: '火灾', desc: '南阳湖街道一仓库发生火灾。', location: '南阳湖街道', level: 'Ⅳ级(一般)', responseTime: 3, status: '已处置', time: '2025-06-02 09:50', action: '火势及时扑灭，无人员伤亡。' },
      { type: '交通事故', desc: '太白湖街道公交站发生交通事故。', location: '太白湖街道', level: 'Ⅳ级(一般)', responseTime: 2, status: '已处置', time: '2025-06-01 16:10', action: '交警现场处置，交通已恢复。' },
      { type: '医疗急救', desc: '孔庄街道一老人突发疾病。', location: '孔庄街道', level: 'Ⅲ级(较大)', responseTime: 5, status: '已处置', time: '2025-06-01 11:20', action: '120及时送医，已脱离危险。' },
      { type: '自然灾害', desc: '太白湖现代农业示范区遭遇大风天气。', location: '太白湖现代农业示范区', level: 'Ⅳ级(一般)', responseTime: 4, status: '已处置', time: '2025-06-01 10:10', action: '农业部门已发布预警，未造成损失。' }
    ]
    return {
      search: '',
      overviewCards: [
        { title: '今日应急事件数', value: 3, trend: 0.0 },
        { title: '已处置事件数', value: 8, trend: 1.2 },
        { title: '待处置事件数', value: 1, trend: -0.5 },
        { title: '平均响应时间', value: '5.4分钟', trend: -0.2 },
        { title: '处置成功率', value: '97.8%', trend: 0.6 },
        { title: '重点事件数', value: 2, trend: 0.0 }
      ],
      eventList,
      eventTimeline: [
        { time: '2025-06-04 09:20', content: '完成新城街道火灾应急处置', color: '#F56C6C' },
        { time: '2025-06-04 08:55', content: '南阳湖街道交通事故已恢复通行', color: '#409EFF' },
        { time: '2025-06-03 17:40', content: '高新园区危险品泄漏已安全处置', color: '#E6A23C' },
        { time: '2025-06-03 15:30', content: '孔庄街道强降雨积水已排除', color: '#67C23A' }
      ],
      intelCards: [
        { title: '高发事件分析', desc: '本月火灾和交通事故高发，重点关注新城街道和南阳湖街道。', icon: 'el-icon-warning-outline' },
        { title: '响应瓶颈诊断', desc: '部分自然灾害响应时间偏长，建议加强应急演练。', icon: 'el-icon-timer' },
        { title: '智能应急建议', desc: '建议加强对旅游度假区食品安全巡查。', icon: 'el-icon-s-opportunity' }
      ],
      eventTypes,
      locations,
      levels,
      eventDialogVisible: false,
      eventDetail: {},
      reportDialogVisible: false,
      reportForm: {
        type: '', desc: '', location: '', level: '', time: ''
      },
      reportRules: {
        type: [{ required: true, message: '请选择事件类型', trigger: 'change' }],
        desc: [{ required: true, message: '请填写描述', trigger: 'blur' }],
        location: [{ required: true, message: '请选择地点', trigger: 'change' }],
        level: [{ required: true, message: '请选择级别', trigger: 'change' }],
        time: [{ required: true, message: '请选择时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    filteredEventList() {
      if (!this.search) return this.eventList
      return this.eventList.filter(e => e.desc.includes(this.search)||e.location.includes(this.search)||e.type.includes(this.search))
    }
  },
  mounted() {
    this.initTypeChart()
    this.initTrendChart()
    this.initEfficiencyChart()
  },
  methods: {
    refresh() {
      this.$message.success('数据已刷新')
    },
    exportData() {
      this.$message.success('导出成功（模拟）')
    },
    viewEvent(row) {
      this.eventDetail = row
      this.eventDialogVisible = true
    },
    handleDeal(row) {
      row.status = '已处置'
      this.$message.success('事件已处置')
    },
    trendClass(card) {
      if (card.trend > 0) return 'trend-up'
      if (card.trend < 0) return 'trend-down'
      return 'trend-flat'
    },
    getLevelType(level) {
      if (level.includes('Ⅰ级')) return 'danger'
      if (level.includes('Ⅱ级')) return 'warning'
      if (level.includes('Ⅲ级')) return 'info'
      return 'success'
    },
    getStatusType(status) {
      if (status === '已处置') return 'success'
      if (status === '处置中') return 'warning'
      return 'info'
    },
    submitReport() {
      this.$refs.reportForm.validate(valid => {
        if (!valid) return
        const newEvent = {
          ...this.reportForm,
          responseTime: Math.floor(Math.random()*8)+2,
          status: '待处置',
          action: '',
          time: this.reportForm.time instanceof Date ? this.reportForm.time.toLocaleString() : this.reportForm.time
        }
        this.eventList.unshift(newEvent)
        this.eventTimeline.unshift({
          time: newEvent.time,
          content: `${newEvent.location}${newEvent.type}事件已上报`,
          color: '#F56C6C'
        })
        this.reportDialogVisible = false
        this.$message.success('事件上报成功')
        this.$refs.reportForm.resetFields()
      })
    },
    initTypeChart() {
      this.$nextTick(()=>{
        const chart = echarts.init(this.$refs.typeChart)
        chart.setOption({
          tooltip: { trigger: 'item' },
          legend: { top: '5%', left: 'center' },
          series: [
            {
              name: '事件类型分布',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              label: { show: false, position: 'center' },
              emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
              labelLine: { show: false },
              data: [
                { value: 3, name: '火灾' },
                { value: 2, name: '交通事故' },
                { value: 2, name: '医疗急救' },
                { value: 2, name: '自然灾害' },
                { value: 1, name: '公共卫生' },
                { value: 1, name: '危险品泄漏' }
              ]
            }
          ]
        })
      })
    },
    initTrendChart() {
      this.$nextTick(()=>{
        const chart = echarts.init(this.$refs.trendChart)
        chart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: ['5-29', '5-30', '5-31', '6-1', '6-2', '6-3', '6-4'] },
          yAxis: { type: 'value' },
          series: [
            {
              name: '事件数',
              type: 'line',
              data: [2, 3, 1, 4, 2, 3, 3],
              itemStyle: { color: '#F56C6C' }
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
              name: '平均响应时间',
              type: 'bar',
              data: [6.2, 5.8, 5.5, 5.2, 5.0, 4.8, 5.4],
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
.emergency-page {
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
  color: #F56C6C;
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
  color: #F56C6C;
  margin-bottom: 4px;
}
.intel-desc {
  font-size: 14px;
  color: #666;
}
</style> 