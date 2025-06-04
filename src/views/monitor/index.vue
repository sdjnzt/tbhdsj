<template>
  <div class="monitor-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>异常监控概览</span>
            <el-button style="float: right; padding: 3px 0" type="text">刷新</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">总告警数</div>
                <div class="stat-value">{{ monitorStats.totalAlerts }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">已处理告警</div>
                <div class="stat-value">{{ monitorStats.resolvedAlerts }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">待处理告警</div>
                <div class="stat-value">{{ monitorStats.pendingAlerts }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>业务领域监控</span>
          </div>
          <div ref="domainChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>告警趋势</span>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>最新告警列表</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="alerts" style="width: 100%">
            <el-table-column prop="time" label="时间" width="180"></el-table-column>
            <el-table-column prop="domain" label="业务领域" width="120"></el-table-column>
            <el-table-column prop="level" label="告警级别" width="120">
              <template slot-scope="scope">
                <el-tag :type="getAlertLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="告警内容"></el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleProcess(scope.row)">处理</el-button>
                <el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Monitor',
  data() {
    return {
      alerts: [
        {
          time: '2024-01-20 10:30:00',
          domain: '交通',
          level: '严重',
          content: '主干道交通信号灯系统异常',
          status: '待处理'
        },
        {
          time: '2024-01-20 10:25:00',
          domain: '环保',
          level: '警告',
          content: '空气质量监测站数据异常',
          status: '处理中'
        },
        {
          time: '2024-01-20 10:20:00',
          domain: '能源',
          level: '一般',
          content: '变电站负载率过高',
          status: '已处理'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['monitorStats'])
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化业务领域监控图表
      const domainChart = this.$echarts.init(this.$refs.domainChart)
      domainChart.setOption({
        title: {
          text: '各领域告警分布'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: 35, name: '交通' },
              { value: 25, name: '环保' },
              { value: 20, name: '能源' },
              { value: 15, name: '水务' },
              { value: 5, name: '安防' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })

      // 初始化告警趋势图表
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      trendChart.setOption({
        title: {
          text: '告警趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [5, 3, 2, 8, 12, 15, 10, 7],
            type: 'line',
            smooth: true
          }
        ]
      })
    },
    getAlertLevelType(level) {
      const types = {
        '严重': 'danger',
        '警告': 'warning',
        '一般': 'info'
      }
      return types[level] || 'info'
    },
    getStatusType(status) {
      const types = {
        '待处理': 'danger',
        '处理中': 'warning',
        '已处理': 'success'
      }
      return types[status] || 'info'
    },
    handleProcess(row) {
      this.$message({
        message: `正在处理告警：${row.content}`,
        type: 'info'
      })
    },
    handleDetail(row) {
      this.$message({
        message: `查看告警详情：${row.content}`,
        type: 'info'
      })
    }
  }
}
</script>

<style scoped>
.monitor-container {
  padding: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.box-card {
  margin-bottom: 20px;
}
</style> 