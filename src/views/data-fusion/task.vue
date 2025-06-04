<template>
  <div class="task-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="task-card">
          <div class="card-header">
            <i class="el-icon-s-operation"></i>
            <span>任务总数</span>
          </div>
          <div class="card-body">
            <div class="card-value">25</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+3</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="task-card">
          <div class="card-header">
            <i class="el-icon-s-claim"></i>
            <span>运行中</span>
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
        <el-card shadow="hover" class="task-card">
          <div class="card-header">
            <i class="el-icon-s-check"></i>
            <span>成功率</span>
          </div>
          <div class="card-body">
            <div class="card-value">95.8%</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+1.2%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="task-card">
          <div class="card-header">
            <i class="el-icon-s-data"></i>
            <span>数据量</span>
          </div>
          <div class="card-body">
            <div class="card-value">1.2TB</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+0.3TB</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>任务执行趋势</span>
          </div>
          <div ref="trendChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>任务类型分布</span>
          </div>
          <div ref="typeChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>任务列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建任务</el-button>
          </div>
          <el-table :data="taskList" style="width: 100%">
            <el-table-column prop="id" label="任务ID" width="120"></el-table-column>
            <el-table-column prop="name" label="任务名称" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTaskType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="数据源" width="150"></el-table-column>
            <el-table-column prop="target" label="目标系统" width="150"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="200">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.progress" :status="getProgressStatus(scope.row.progress)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="handleStart(scope.row)" v-if="scope.row.status === '未开始'">开始</el-button>
                <el-button size="mini" type="warning" @click="handlePause(scope.row)" v-if="scope.row.status === '运行中'">暂停</el-button>
                <el-button size="mini" type="danger" @click="handleStop(scope.row)" v-if="['运行中', '已暂停'].includes(scope.row.status)">停止</el-button>
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务详情对话框 -->
    <el-dialog title="任务详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentTask">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
          <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ currentTask.type }}</el-descriptions-item>
          <el-descriptions-item label="数据源">{{ currentTask.source }}</el-descriptions-item>
          <el-descriptions-item label="目标系统">{{ currentTask.target }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">{{ currentTask.status }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentTask.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentTask.endTime }}</el-descriptions-item>
          <el-descriptions-item label="数据量">{{ currentTask.dataSize }}</el-descriptions-item>
          <el-descriptions-item label="处理速度">{{ currentTask.speed }}</el-descriptions-item>
        </el-descriptions>
        <div ref="detailChart" style="height: 300px; margin-top: 20px"></div>
      </div>
    </el-dialog>

    <!-- 创建任务对话框 -->
    <el-dialog title="创建任务" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name"></el-input>
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="taskForm.type" placeholder="请选择任务类型">
            <el-option label="数据同步" value="数据同步"></el-option>
            <el-option label="数据转换" value="数据转换"></el-option>
            <el-option label="数据清洗" value="数据清洗"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据源">
          <el-select v-model="taskForm.source" placeholder="请选择数据源">
            <el-option label="MySQL" value="MySQL"></el-option>
            <el-option label="Oracle" value="Oracle"></el-option>
            <el-option label="PostgreSQL" value="PostgreSQL"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标系统">
          <el-select v-model="taskForm.target" placeholder="请选择目标系统">
            <el-option label="数据仓库" value="数据仓库"></el-option>
            <el-option label="数据湖" value="数据湖"></el-option>
            <el-option label="分析系统" value="分析系统"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行计划">
          <el-radio-group v-model="taskForm.schedule">
            <el-radio label="立即执行">立即执行</el-radio>
            <el-radio label="定时执行">定时执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="执行时间" v-if="taskForm.schedule === '定时执行'">
          <el-date-picker
            v-model="taskForm.executeTime"
            type="datetime"
            placeholder="选择执行时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitTask">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DataFusionTask',
  data() {
    return {
      taskList: [
        {
          id: 'TASK001',
          name: '用户数据同步',
          type: '数据同步',
          source: 'MySQL',
          target: '数据仓库',
          status: '运行中',
          progress: 75,
          startTime: '2024-01-20 10:00:00',
          endTime: '2024-01-20 11:00:00',
          dataSize: '500GB',
          speed: '100MB/s'
        },
        {
          id: 'TASK002',
          name: '订单数据转换',
          type: '数据转换',
          source: 'Oracle',
          target: '数据湖',
          status: '已完成',
          progress: 100,
          startTime: '2024-01-20 09:00:00',
          endTime: '2024-01-20 09:30:00',
          dataSize: '200GB',
          speed: '150MB/s'
        },
        {
          id: 'TASK003',
          name: '日志数据清洗',
          type: '数据清洗',
          source: 'PostgreSQL',
          target: '分析系统',
          status: '未开始',
          progress: 0,
          startTime: '-',
          endTime: '-',
          dataSize: '1TB',
          speed: '-'
        }
      ],
      detailDialogVisible: false,
      createDialogVisible: false,
      currentTask: null,
      taskForm: {
        name: '',
        type: '',
        source: '',
        target: '',
        schedule: '立即执行',
        executeTime: null
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
          text: '任务执行趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['任务数', '成功率']
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: [
          {
            type: 'value',
            name: '任务数'
          },
          {
            type: 'value',
            name: '成功率',
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '任务数',
            type: 'bar',
            data: [20, 22, 25, 23, 24, 21, 25]
          },
          {
            name: '成功率',
            type: 'line',
            yAxisIndex: 1,
            data: [94, 95, 96, 95, 96, 95, 96]
          }
        ]
      })

      // 初始化类型分布图表
      const typeChart = this.$echarts.init(this.$refs.typeChart)
      typeChart.setOption({
        title: {
          text: '任务类型分布'
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
              { value: 40, name: '数据同步' },
              { value: 30, name: '数据转换' },
              { value: 20, name: '数据清洗' },
              { value: 10, name: '其他任务' }
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
    getTaskType(type) {
      const types = {
        '数据同步': 'primary',
        '数据转换': 'success',
        '数据清洗': 'warning'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '运行中': 'success',
        '已完成': 'info',
        '未开始': 'warning',
        '已暂停': 'warning',
        '失败': 'danger'
      }
      return types[status] || 'info'
    },
    getProgressStatus(progress) {
      if (progress === 100) return 'success'
      if (progress === 0) return 'exception'
      return ''
    },
    handleStart(row) {
      this.$message({
        message: `开始任务：${row.name}`,
        type: 'success'
      })
    },
    handlePause(row) {
      this.$message({
        message: `暂停任务：${row.name}`,
        type: 'warning'
      })
    },
    handleStop(row) {
      this.$message({
        message: `停止任务：${row.name}`,
        type: 'info'
      })
    },
    handleDetail(row) {
      this.currentTask = row
      this.detailDialogVisible = true
      this.$nextTick(() => {
        this.initDetailChart()
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    submitTask() {
      this.$message({
        message: '任务创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    },
    initDetailChart() {
      const detailChart = this.$echarts.init(this.$refs.detailChart)
      detailChart.setOption({
        title: {
          text: '任务执行详情'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['处理速度', '数据量']
        },
        xAxis: {
          type: 'category',
          data: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30']
        },
        yAxis: [
          {
            type: 'value',
            name: '处理速度',
            axisLabel: {
              formatter: '{value}MB/s'
            }
          },
          {
            type: 'value',
            name: '数据量',
            axisLabel: {
              formatter: '{value}GB'
            }
          }
        ],
        series: [
          {
            name: '处理速度',
            type: 'line',
            data: [100, 105, 98, 110, 95, 100, 105]
          },
          {
            name: '数据量',
            type: 'line',
            yAxisIndex: 1,
            data: [100, 200, 300, 400, 500, 600, 700]
          }
        ]
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.task-container {
  padding: 20px;
}

.task-card {
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
</style> 