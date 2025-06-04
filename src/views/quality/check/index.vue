<template>
  <div class="check-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="check-card">
          <div class="card-header">
            <i class="el-icon-s-data"></i>
            <span>检查总数</span>
          </div>
          <div class="card-body">
            <div class="card-value">256</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+28</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="check-card">
          <div class="card-header">
            <i class="el-icon-warning"></i>
            <span>异常数</span>
          </div>
          <div class="card-body">
            <div class="card-value">45</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="down">-12</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="check-card">
          <div class="card-header">
            <i class="el-icon-success"></i>
            <span>合格率</span>
          </div>
          <div class="card-body">
            <div class="card-value">82%</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+5%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="check-card">
          <div class="card-header">
            <i class="el-icon-time"></i>
            <span>平均耗时</span>
          </div>
          <div class="card-body">
            <div class="card-value">15分钟</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="down">-3分钟</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>检查趋势</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>异常类型分布</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
          </div>
          <div ref="typeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>检查列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建检查</el-button>
          </div>
          <el-table :data="checkList" style="width: 100%">
            <el-table-column prop="id" label="检查ID" width="120"></el-table-column>
            <el-table-column prop="name" label="检查名称" width="180"></el-table-column>
            <el-table-column prop="type" label="检查类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getCheckType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="检查对象" width="150"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="检查结果" width="100">
              <template slot-scope="scope">
                <el-tag :type="getResultType(scope.row.result)">{{ scope.row.result }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="handler" label="处理人" width="120"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="success" @click="handleProcess(scope.row)">处理</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 检查详情对话框 -->
    <el-dialog title="检查详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentCheck">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="检查ID">{{ currentCheck.id }}</el-descriptions-item>
          <el-descriptions-item label="检查名称">{{ currentCheck.name }}</el-descriptions-item>
          <el-descriptions-item label="检查类型">{{ currentCheck.type }}</el-descriptions-item>
          <el-descriptions-item label="检查对象">{{ currentCheck.target }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentCheck.status }}</el-descriptions-item>
          <el-descriptions-item label="检查结果">{{ currentCheck.result }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentCheck.createTime }}</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentCheck.handler }}</el-descriptions-item>
          <el-descriptions-item label="检查描述" :span="2">{{ currentCheck.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="check-content" style="margin-top: 20px">
          <h3>检查项</h3>
          <el-table :data="currentCheck.items" border style="width: 100%">
            <el-table-column prop="name" label="检查项名称" width="180"></el-table-column>
            <el-table-column prop="type" label="检查类型" width="120"></el-table-column>
            <el-table-column prop="result" label="检查结果" width="100">
              <template slot-scope="scope">
                <el-tag :type="getResultType(scope.row.result)">{{ scope.row.result }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="检查说明"></el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 处理检查对话框 -->
    <el-dialog title="处理检查" :visible.sync="processDialogVisible" width="50%">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-select v-model="processForm.method" placeholder="请选择处理方式">
            <el-option label="自动处理" value="auto"></el-option>
            <el-option label="手动处理" value="manual"></el-option>
            <el-option label="忽略" value="ignore"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input type="textarea" v-model="processForm.description" rows="4" placeholder="请输入处理说明"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="processDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitProcess">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 创建检查对话框 -->
    <el-dialog title="创建检查" :visible.sync="createDialogVisible" width="70%">
      <el-form :model="checkForm" label-width="100px">
        <el-form-item label="检查名称">
          <el-input v-model="checkForm.name" placeholder="请输入检查名称"></el-input>
        </el-form-item>
        <el-form-item label="检查类型">
          <el-select v-model="checkForm.type" placeholder="请选择检查类型">
            <el-option label="完整性检查" value="completeness"></el-option>
            <el-option label="准确性检查" value="accuracy"></el-option>
            <el-option label="一致性检查" value="consistency"></el-option>
            <el-option label="及时性检查" value="timeliness"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="检查对象">
          <el-select v-model="checkForm.target" placeholder="请选择检查对象">
            <el-option label="数据表" value="table"></el-option>
            <el-option label="数据字段" value="field"></el-option>
            <el-option label="数据记录" value="record"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="检查描述">
          <el-input type="textarea" v-model="checkForm.description" rows="4" placeholder="请输入检查描述"></el-input>
        </el-form-item>
        <el-form-item label="检查项">
          <el-button type="primary" size="small" @click="addItem">添加检查项</el-button>
          <el-table :data="checkForm.items" border style="width: 100%; margin-top: 10px">
            <el-table-column prop="name" label="检查项名称" width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name" placeholder="请输入检查项名称"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="检查类型" width="120">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择">
                  <el-option label="完整性" value="completeness"></el-option>
                  <el-option label="准确性" value="accuracy"></el-option>
                  <el-option label="一致性" value="consistency"></el-option>
                  <el-option label="及时性" value="timeliness"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="检查说明">
              <template slot-scope="scope">
                <el-input v-model="scope.row.description" placeholder="请输入检查说明"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="danger" size="mini" @click="removeItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCheck">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'QualityCheck',
  data() {
    return {
      checkList: [
        {
          id: 'CHK001',
          name: '数据完整性检查',
          type: '完整性检查',
          target: '用户信息表',
          status: '待处理',
          result: '异常',
          createTime: '2024-01-15 10:00:00',
          handler: '',
          description: '检查用户信息表的完整性',
          items: [
            {
              name: '必填字段检查',
              type: '完整性',
              result: '异常',
              description: '检查必填字段是否为空'
            },
            {
              name: '字段长度检查',
              type: '完整性',
              result: '正常',
              description: '检查字段长度是否符合要求'
            }
          ]
        },
        {
          id: 'CHK002',
          name: '数据准确性检查',
          type: '准确性检查',
          target: '订单信息表',
          status: '处理中',
          result: '正常',
          createTime: '2024-01-15 09:30:00',
          handler: '李四',
          description: '检查订单信息的准确性',
          items: [
            {
              name: '金额计算检查',
              type: '准确性',
              result: '正常',
              description: '检查订单金额计算是否准确'
            },
            {
              name: '日期格式检查',
              type: '准确性',
              result: '正常',
              description: '检查日期格式是否正确'
            }
          ]
        }
      ],
      detailDialogVisible: false,
      processDialogVisible: false,
      createDialogVisible: false,
      currentCheck: null,
      processForm: {
        method: '',
        description: ''
      },
      checkForm: {
        name: '',
        type: '',
        target: '',
        description: '',
        items: []
      }
    }
  },
  mounted() {
    this.initTrendChart()
    this.initTypeChart()
  },
  methods: {
    initTrendChart() {
      const trendChart = this.$echarts.init(this.$refs.trendChart)
      const data = {
        dates: ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日'],
        values: [35, 30, 40, 45, 40, 35, 32]
      }

      trendChart.setOption({
        title: {
          text: '检查趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.dates
        },
        yAxis: {
          type: 'value',
          name: '检查数量'
        },
        series: [
          {
            name: '检查数量',
            type: 'line',
            data: data.values,
            smooth: true,
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            }
          }
        ]
      })
    },
    initTypeChart() {
      const typeChart = this.$echarts.init(this.$refs.typeChart)
      const data = [
        { value: 40, name: '完整性异常' },
        { value: 30, name: '准确性异常' },
        { value: 20, name: '一致性异常' },
        { value: 10, name: '及时性异常' }
      ]

      typeChart.setOption({
        title: {
          text: '异常类型分布'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['完整性异常', '准确性异常', '一致性异常', '及时性异常']
        },
        series: [
          {
            name: '异常类型',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      })
    },
    getCheckType(type) {
      const types = {
        '完整性检查': 'primary',
        '准确性检查': 'success',
        '一致性检查': 'warning',
        '及时性检查': 'info'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '待处理': 'warning',
        '处理中': 'primary',
        '已完成': 'success',
        '已忽略': 'info'
      }
      return types[status] || 'info'
    },
    getResultType(result) {
      const types = {
        '正常': 'success',
        '异常': 'danger',
        '警告': 'warning'
      }
      return types[result] || 'info'
    },
    handleRefresh() {
      this.initTrendChart()
      this.initTypeChart()
    },
    handleDetail(row) {
      this.currentCheck = row
      this.detailDialogVisible = true
    },
    handleProcess(row) {
      this.currentCheck = row
      this.processDialogVisible = true
    },
    handleDelete(row) {
      this.$message({
        message: `删除检查：${row.name}`,
        type: 'warning'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    addItem() {
      this.checkForm.items.push({
        name: '',
        type: 'completeness',
        description: ''
      })
    },
    removeItem(index) {
      this.checkForm.items.splice(index, 1)
    },
    submitProcess() {
      this.$message({
        message: '检查处理成功',
        type: 'success'
      })
      this.processDialogVisible = false
    },
    submitCheck() {
      this.$message({
        message: '检查创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.check-container {
  padding: 20px;
}

.check-card {
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

.check-content {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}
</style> 