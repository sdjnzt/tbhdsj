<template>
  <div class="emergency-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>应急态势概览</span>
            <el-button style="float: right; padding: 3px 0" type="text">刷新</el-button>
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">当前应急事件</div>
                <div class="stat-value">{{ emergencyData.events.length }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">平均响应时间</div>
                <div class="stat-value">{{ emergencyData.responseTime }}分钟</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">数据整合完成率</div>
                <div class="stat-value">98%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">策略建议生成率</div>
                <div class="stat-value">95%</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>应急事件地图</span>
          </div>
          <div ref="mapChart" style="height: 400px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>事件类型分布</span>
          </div>
          <div ref="typeChart" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>应急事件列表</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="events" style="width: 100%">
            <el-table-column prop="time" label="发生时间" width="180"></el-table-column>
            <el-table-column prop="type" label="事件类型" width="120"></el-table-column>
            <el-table-column prop="location" label="发生地点" width="180"></el-table-column>
            <el-table-column prop="level" label="事件等级" width="120">
              <template slot-scope="scope">
                <el-tag :type="getEventLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="处理状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="事件描述"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleProcess(scope.row)">处理</el-button>
                <el-button size="mini" type="primary" @click="handleStrategy(scope.row)">策略</el-button>
                <el-button size="mini" type="text" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 策略建议对话框 -->
    <el-dialog title="应急策略建议" :visible.sync="strategyDialogVisible" width="60%">
      <div v-if="currentEvent">
        <h3>{{ currentEvent.type }} - {{ currentEvent.location }}</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(strategy, index) in strategies"
            :key="index"
            :timestamp="strategy.time"
            :type="strategy.type">
            {{ strategy.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="strategyDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleStrategyConfirm">确认执行</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Emergency',
  data() {
    return {
      events: [
        {
          time: '2024-01-20 10:30:00',
          type: '交通事故',
          location: '市中心十字路口',
          level: '重大',
          status: '处理中',
          description: '多车相撞事故，造成交通拥堵'
        },
        {
          time: '2024-01-20 10:25:00',
          type: '火灾',
          location: '商业区购物中心',
          level: '紧急',
          status: '待处理',
          description: '商场发生火灾，需要紧急疏散'
        },
        {
          time: '2024-01-20 10:20:00',
          type: '暴雨',
          location: '城市东部',
          level: '一般',
          status: '已处理',
          description: '强降雨导致部分道路积水'
        }
      ],
      strategyDialogVisible: false,
      currentEvent: null,
      strategies: [
        {
          time: '10:35',
          type: 'primary',
          content: '启动应急预案，组织相关部门联动'
        },
        {
          time: '10:36',
          type: 'success',
          content: '调派救援力量前往现场'
        },
        {
          time: '10:37',
          type: 'warning',
          content: '发布交通管制措施'
        },
        {
          time: '10:38',
          type: 'info',
          content: '启动医疗救援预案'
        }
      ]
    }
  },
  computed: {
    ...mapState(['emergencyData'])
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化地图图表
      const mapChart = this.$echarts.init(this.$refs.mapChart)
      mapChart.setOption({
        title: {
          text: '应急事件分布'
        },
        tooltip: {
          trigger: 'item'
        },
        visualMap: {
          min: 0,
          max: 100,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true
        },
        series: [
          {
            type: 'map',
            map: 'city',
            label: {
              show: true
            },
            data: [
              { name: '市中心', value: 80 },
              { name: '商业区', value: 60 },
              { name: '居民区', value: 40 },
              { name: '工业区', value: 20 }
            ]
          }
        ]
      })

      // 初始化事件类型分布图表
      const typeChart = this.$echarts.init(this.$refs.typeChart)
      typeChart.setOption({
        title: {
          text: '事件类型分布'
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
              { value: 35, name: '交通事故' },
              { value: 25, name: '火灾' },
              { value: 20, name: '自然灾害' },
              { value: 15, name: '公共卫生' },
              { value: 5, name: '其他' }
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
    },
    getEventLevelType(level) {
      const types = {
        '紧急': 'danger',
        '重大': 'warning',
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
        message: `正在处理事件：${row.description}`,
        type: 'info'
      })
    },
    handleStrategy(row) {
      this.currentEvent = row
      this.strategyDialogVisible = true
    },
    handleDetail(row) {
      this.$message({
        message: `查看事件详情：${row.description}`,
        type: 'info'
      })
    },
    handleStrategyConfirm() {
      this.$message({
        message: '策略已确认执行',
        type: 'success'
      })
      this.strategyDialogVisible = false
    }
  }
}
</script>

<style scoped>
.emergency-container {
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