<template>
  <div class="plan-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="plan-card">
          <div class="card-header">
            <i class="el-icon-document"></i>
            <span>预案总数</span>
          </div>
          <div class="card-body">
            <div class="card-value">24</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+3</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="plan-card">
          <div class="card-header">
            <i class="el-icon-s-claim"></i>
            <span>待审核</span>
          </div>
          <div class="card-body">
            <div class="card-value">5</div>
            <div class="card-footer">
              <span>较昨日</span>
              <span class="up">+2</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="plan-card">
          <div class="card-header">
            <i class="el-icon-s-check"></i>
            <span>已发布</span>
          </div>
          <div class="card-body">
            <div class="card-value">19</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+1</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="plan-card">
          <div class="card-header">
            <i class="el-icon-s-data"></i>
            <span>演练次数</span>
          </div>
          <div class="card-body">
            <div class="card-value">12</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+4</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>预案发布趋势</span>
          </div>
          <div ref="trendChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>预案类型分布</span>
          </div>
          <div ref="typeChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>预案列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建预案</el-button>
          </div>
          <el-table :data="planList" style="width: 100%">
            <el-table-column prop="code" label="预案编号" width="120"></el-table-column>
            <el-table-column prop="name" label="预案名称" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getPlanType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="100">
              <template slot-scope="scope">
                <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="creator" label="创建人" width="120"></el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
            <el-table-column label="操作" width="300">
              <template slot-scope="scope">
                <el-button size="mini" @click="handlePublish(scope.row)" v-if="scope.row.status === '待发布'">发布</el-button>
                <el-button size="mini" type="warning" @click="handleDrill(scope.row)" v-if="scope.row.status === '已发布'">演练</el-button>
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="success" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)" v-if="scope.row.status === '待发布'">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预案详情对话框 -->
    <el-dialog title="预案详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentPlan">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预案编号">{{ currentPlan.code }}</el-descriptions-item>
          <el-descriptions-item label="预案名称">{{ currentPlan.name }}</el-descriptions-item>
          <el-descriptions-item label="预案类型">{{ currentPlan.type }}</el-descriptions-item>
          <el-descriptions-item label="预案级别">{{ currentPlan.level }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">{{ currentPlan.status }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentPlan.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentPlan.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentPlan.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="预案描述" :span="2">{{ currentPlan.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="plan-content" style="margin-top: 20px">
          <h3>预案内容</h3>
          <el-steps direction="vertical" :active="currentPlan.steps.length">
            <el-step
              v-for="(step, index) in currentPlan.steps"
              :key="index"
              :title="step.title"
              :description="step.description">
            </el-step>
          </el-steps>
        </div>
      </div>
    </el-dialog>

    <!-- 创建预案对话框 -->
    <el-dialog title="创建预案" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="planForm" label-width="100px">
        <el-form-item label="预案名称">
          <el-input v-model="planForm.name" placeholder="请输入预案名称"></el-input>
        </el-form-item>
        <el-form-item label="预案类型">
          <el-select v-model="planForm.type" placeholder="请选择预案类型">
            <el-option label="自然灾害" value="自然灾害"></el-option>
            <el-option label="事故灾难" value="事故灾难"></el-option>
            <el-option label="公共卫生" value="公共卫生"></el-option>
            <el-option label="社会安全" value="社会安全"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预案级别">
          <el-select v-model="planForm.level" placeholder="请选择预案级别">
            <el-option label="特别重大" value="特别重大"></el-option>
            <el-option label="重大" value="重大"></el-option>
            <el-option label="较大" value="较大"></el-option>
            <el-option label="一般" value="一般"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预案描述">
          <el-input type="textarea" v-model="planForm.description" rows="4" placeholder="请输入预案描述"></el-input>
        </el-form-item>
        <el-form-item label="预案步骤">
          <div v-for="(step, index) in planForm.steps" :key="index" class="step-item">
            <el-input v-model="step.title" placeholder="步骤标题" style="width: 200px; margin-right: 10px"></el-input>
            <el-input v-model="step.description" placeholder="步骤描述" style="width: 400px"></el-input>
            <el-button type="danger" icon="el-icon-delete" circle @click="removeStep(index)" style="margin-left: 10px"></el-button>
          </div>
          <el-button type="primary" icon="el-icon-plus" @click="addStep" style="margin-top: 10px">添加步骤</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitPlan">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 预案演练对话框 -->
    <el-dialog title="预案演练" :visible.sync="drillDialogVisible" width="50%">
      <el-form :model="drillForm" label-width="100px">
        <el-form-item label="演练名称">
          <el-input v-model="drillForm.name" placeholder="请输入演练名称"></el-input>
        </el-form-item>
        <el-form-item label="演练时间">
          <el-date-picker
            v-model="drillForm.time"
            type="datetime"
            placeholder="选择演练时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="参与人员">
          <el-select v-model="drillForm.participants" multiple placeholder="请选择参与人员">
            <el-option label="张三" value="张三"></el-option>
            <el-option label="李四" value="李四"></el-option>
            <el-option label="王五" value="王五"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="演练说明">
          <el-input type="textarea" v-model="drillForm.description" rows="4" placeholder="请输入演练说明"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="drillDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDrill">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'EmergencyPlan',
  data() {
    return {
      planList: [
        {
          code: 'EP001',
          name: '太白湖区域暴雨应急预案',
          type: '自然灾害',
          level: '较大',
          status: '已发布',
          creator: '张三',
          createTime: '2024-01-15 10:00:00',
          updateTime: '2024-01-15 14:00:00',
          description: '针对太白湖区域暴雨天气的应急处置预案',
          steps: [
            {
              title: '预警发布',
              description: '气象部门发布暴雨预警信息'
            },
            {
              title: '应急响应',
              description: '启动应急响应机制，通知相关部门'
            },
            {
              title: '现场处置',
              description: '组织人员开展现场应急处置工作'
            }
          ]
        },
        {
          code: 'EP002',
          name: '城市道路积水应急预案',
          type: '事故灾难',
          level: '一般',
          status: '待发布',
          creator: '李四',
          createTime: '2024-01-20 09:00:00',
          updateTime: '2024-01-20 09:00:00',
          description: '针对城市道路积水情况的应急处置预案',
          steps: [
            {
              title: '情况报告',
              description: '发现积水情况及时报告'
            },
            {
              title: '现场处置',
              description: '组织人员开展排水工作'
            }
          ]
        }
      ],
      detailDialogVisible: false,
      createDialogVisible: false,
      drillDialogVisible: false,
      currentPlan: null,
      planForm: {
        name: '',
        type: '',
        level: '',
        description: '',
        steps: []
      },
      drillForm: {
        name: '',
        time: '',
        participants: [],
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
          text: '预案发布趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['预案数', '演练次数']
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: [
          {
            type: 'value',
            name: '预案数'
          },
          {
            type: 'value',
            name: '演练次数'
          }
        ],
        series: [
          {
            name: '预案数',
            type: 'bar',
            data: [2, 3, 2, 4, 3, 2]
          },
          {
            name: '演练次数',
            type: 'line',
            yAxisIndex: 1,
            data: [1, 2, 1, 3, 2, 1]
          }
        ]
      })

      // 初始化类型分布图表
      const typeChart = this.$echarts.init(this.$refs.typeChart)
      typeChart.setOption({
        title: {
          text: '预案类型分布'
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
    getPlanType(type) {
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
        '待发布': 'warning',
        '已发布': 'success',
        '已过期': 'info',
        '已作废': 'danger'
      }
      return types[status] || 'info'
    },
    handlePublish(row) {
      this.$message({
        message: `发布预案：${row.name}`,
        type: 'success'
      })
    },
    handleDrill(row) {
      this.currentPlan = row
      this.drillDialogVisible = true
    },
    handleDetail(row) {
      this.currentPlan = row
      this.detailDialogVisible = true
    },
    handleEdit(row) {
      this.$message({
        message: `编辑预案：${row.name}`,
        type: 'info'
      })
    },
    handleDelete(row) {
      this.$message({
        message: `删除预案：${row.name}`,
        type: 'warning'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    addStep() {
      this.planForm.steps.push({
        title: '',
        description: ''
      })
    },
    removeStep(index) {
      this.planForm.steps.splice(index, 1)
    },
    submitPlan() {
      this.$message({
        message: '预案创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    },
    submitDrill() {
      this.$message({
        message: '演练计划已创建',
        type: 'success'
      })
      this.drillDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-container {
  padding: 20px;
}

.plan-card {
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

.plan-content {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style> 