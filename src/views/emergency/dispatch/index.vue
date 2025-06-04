<template>
  <div class="dispatch-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="dispatch-card">
          <div class="card-header">
            <i class="el-icon-warning"></i>
            <span>待处理事件</span>
          </div>
          <div class="card-body">
            <div class="card-value">12</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+3</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dispatch-card">
          <div class="card-header">
            <i class="el-icon-s-claim"></i>
            <span>处理中</span>
          </div>
          <div class="card-body">
            <div class="card-value">8</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+2</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dispatch-card">
          <div class="card-header">
            <i class="el-icon-s-check"></i>
            <span>已完成</span>
          </div>
          <div class="card-body">
            <div class="card-value">156</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+25</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="dispatch-card">
          <div class="card-header">
            <i class="el-icon-s-data"></i>
            <span>平均响应时间</span>
          </div>
          <div class="card-body">
            <div class="card-value">15分钟</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="down">-5分钟</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>事件处理趋势</span>
          </div>
          <div ref="trendChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>事件类型分布</span>
          </div>
          <div ref="typeChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>事件列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建事件</el-button>
          </div>
          <el-table :data="eventList" style="width: 100%">
            <el-table-column prop="id" label="事件编号" width="120"></el-table-column>
            <el-table-column prop="name" label="事件名称" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getEventType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="100">
              <template slot-scope="scope">
                <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="地点" width="150"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reporter" label="报告人" width="120"></el-table-column>
            <el-table-column prop="reportTime" label="报告时间" width="180"></el-table-column>
            <el-table-column prop="handler" label="处理人" width="120"></el-table-column>
            <el-table-column label="操作" width="250">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleDispatch(scope.row)" v-if="scope.row.status === '待处理'">派发</el-button>
                <el-button size="mini" type="success" @click="handleComplete(scope.row)" v-if="scope.row.status === '处理中'">完成</el-button>
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="warning" @click="handleTrack(scope.row)" v-if="scope.row.status === '处理中'">跟踪</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 事件详情对话框 -->
    <el-dialog title="事件详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentEvent">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="事件编号">{{ currentEvent.id }}</el-descriptions-item>
          <el-descriptions-item label="事件名称">{{ currentEvent.name }}</el-descriptions-item>
          <el-descriptions-item label="事件类型">{{ currentEvent.type }}</el-descriptions-item>
          <el-descriptions-item label="事件级别">{{ currentEvent.level }}</el-descriptions-item>
          <el-descriptions-item label="发生地点">{{ currentEvent.location }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">{{ currentEvent.status }}</el-descriptions-item>
          <el-descriptions-item label="报告人">{{ currentEvent.reporter }}</el-descriptions-item>
          <el-descriptions-item label="报告时间">{{ currentEvent.reportTime }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentEvent.handler }}</el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ currentEvent.handleTime }}</el-descriptions-item>
          <el-descriptions-item label="事件描述" :span="2">{{ currentEvent.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="event-timeline" style="margin-top: 20px">
          <h3>处理进度</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in currentEvent.timeline"
              :key="index"
              :type="activity.type"
              :timestamp="activity.timestamp">
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>

    <!-- 派发事件对话框 -->
    <el-dialog title="派发事件" :visible.sync="dispatchDialogVisible" width="50%">
      <el-form :model="dispatchForm" label-width="100px">
        <el-form-item label="处理人">
          <el-select v-model="dispatchForm.handler" placeholder="请选择处理人">
            <el-option label="张三" value="张三"></el-option>
            <el-option label="李四" value="李四"></el-option>
            <el-option label="王五" value="王五"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理优先级">
          <el-select v-model="dispatchForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="高"></el-option>
            <el-option label="中" value="中"></el-option>
            <el-option label="低" value="低"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input type="textarea" v-model="dispatchForm.instruction" rows="4" placeholder="请输入处理说明"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dispatchDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDispatch">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 创建事件对话框 -->
    <el-dialog title="创建事件" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="eventForm" label-width="100px">
        <el-form-item label="事件名称">
          <el-input v-model="eventForm.name" placeholder="请输入事件名称"></el-input>
        </el-form-item>
        <el-form-item label="事件类型">
          <el-select v-model="eventForm.type" placeholder="请选择事件类型">
            <el-option label="自然灾害" value="自然灾害"></el-option>
            <el-option label="事故灾难" value="事故灾难"></el-option>
            <el-option label="公共卫生" value="公共卫生"></el-option>
            <el-option label="社会安全" value="社会安全"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="事件级别">
          <el-select v-model="eventForm.level" placeholder="请选择事件级别">
            <el-option label="特别重大" value="特别重大"></el-option>
            <el-option label="重大" value="重大"></el-option>
            <el-option label="较大" value="较大"></el-option>
            <el-option label="一般" value="一般"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发生地点">
          <el-input v-model="eventForm.location" placeholder="请输入发生地点"></el-input>
        </el-form-item>
        <el-form-item label="事件描述">
          <el-input type="textarea" v-model="eventForm.description" rows="4" placeholder="请输入事件描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEvent">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'EmergencyDispatch',
  data() {
    return {
      eventList: [
        {
          id: 'EM001',
          name: '太白湖区域暴雨预警',
          type: '自然灾害',
          level: '较大',
          location: '太白湖区域',
          status: '处理中',
          reporter: '张三',
          reportTime: '2024-01-20 10:00:00',
          handler: '李四',
          handleTime: '2024-01-20 10:05:00',
          description: '太白湖区域出现强降雨，需要及时预警和防范',
          timeline: [
            {
              content: '事件报告',
              timestamp: '2024-01-20 10:00:00',
              type: 'primary'
            },
            {
              content: '事件派发',
              timestamp: '2024-01-20 10:05:00',
              type: 'success'
            },
            {
              content: '开始处理',
              timestamp: '2024-01-20 10:10:00',
              type: 'warning'
            }
          ]
        },
        {
          id: 'EM002',
          name: '城市道路积水',
          type: '事故灾难',
          level: '一般',
          location: '城市主干道',
          status: '待处理',
          reporter: '王五',
          reportTime: '2024-01-20 09:30:00',
          handler: '-',
          handleTime: '-',
          description: '城市主干道出现积水，影响交通',
          timeline: [
            {
              content: '事件报告',
              timestamp: '2024-01-20 09:30:00',
              type: 'primary'
            }
          ]
        }
      ],
      detailDialogVisible: false,
      dispatchDialogVisible: false,
      createDialogVisible: false,
      currentEvent: null,
      dispatchForm: {
        handler: '',
        priority: '',
        instruction: ''
      },
      eventForm: {
        name: '',
        type: '',
        level: '',
        location: '',
        description: ''
      }
    }
  },
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      // 初始化趋势图表
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      trendChart.setOption({
        title: {
          text: '事件处理趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['事件数', '处理率']
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: [
          {
            type: 'value',
            name: '事件数'
          },
          {
            type: 'value',
            name: '处理率',
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '事件数',
            type: 'bar',
            data: [20, 22, 25, 23, 24, 21, 25]
          },
          {
            name: '处理率',
            type: 'line',
            yAxisIndex: 1,
            data: [95, 96, 94, 97, 95, 96, 95]
          }
        ]
      })

      // 初始化类型分布图表
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
              { value: 40, name: '自然灾害' },
              { value: 30, name: '事故灾难' },
              { value: 20, name: '公共卫生' },
              { value: 10, name: '社会安全' }
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
    getEventType(type) {
      const types = {
        '自然灾害': 'danger',
        '事故灾难': 'warning',
        '公共卫生': 'info',
        '社会安全': 'primary'
      }
      return types[type] || 'info'
    },
    getLevelType(level) {
      const types = {
        '特别重大': 'danger',
        '重大': 'warning',
        '较大': 'info',
        '一般': 'primary'
      }
      return types[level] || 'info'
    },
    getStatusType(status) {
      const types = {
        '待处理': 'warning',
        '处理中': 'primary',
        '已完成': 'success',
        '已关闭': 'info'
      }
      return types[status] || 'info'
    },
    handleDispatch(row) {
      this.currentEvent = row
      this.dispatchDialogVisible = true
    },
    handleComplete(row) {
      this.$message({
        message: `完成事件：${row.name}`,
        type: 'success'
      })
    },
    handleDetail(row) {
      this.currentEvent = row
      this.detailDialogVisible = true
    },
    handleTrack(row) {
      this.$message({
        message: `跟踪事件：${row.name}`,
        type: 'info'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    submitDispatch() {
      this.$message({
        message: '事件派发成功',
        type: 'success'
      })
      this.dispatchDialogVisible = false
    },
    submitEvent() {
      this.$message({
        message: '事件创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.dispatch-container {
  padding: 20px;
}

.dispatch-card {
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    i {
      font-size: 20px;
      margin-right: 8px;
      color: #409EFF;
    }
    
    span {
      font-size: 16px;
      color: #606266;
    }
  }
  
  .card-body {
    .card-value {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 10px;
    }
    
    .card-footer {
      font-size: 14px;
      color: #909399;
      
      .up {
        color: #67C23A;
        margin-left: 5px;
      }
      
      .down {
        color: #F56C6C;
        margin-left: 5px;
      }
    }
  }
}

.box-card {
  margin-bottom: 20px;
}

.event-timeline {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}
</style> 