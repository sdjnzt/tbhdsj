<template>
  <div class="standard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="standard-card">
          <div class="card-header">
            <i class="el-icon-document"></i>
            <span>标准总数</span>
          </div>
          <div class="card-body">
            <div class="card-value">128</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+15</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="standard-card">
          <div class="card-header">
            <i class="el-icon-time"></i>
            <span>待审核</span>
          </div>
          <div class="card-body">
            <div class="card-value">32</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="down">-8</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="standard-card">
          <div class="card-header">
            <i class="el-icon-success"></i>
            <span>已发布</span>
          </div>
          <div class="card-body">
            <div class="card-value">96</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+23</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="standard-card">
          <div class="card-header">
            <i class="el-icon-data-analysis"></i>
            <span>覆盖率</span>
          </div>
          <div class="card-body">
            <div class="card-value">85%</div>
            <div class="card-footer">
              <span>较上月</span>
              <span class="up">+5%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>标准发布趋势</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
          </div>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>标准类型分布</span>
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
            <span>标准列表</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="handleCreate">创建标准</el-button>
          </div>
          <el-table :data="standardList" style="width: 100%">
            <el-table-column prop="code" label="标准编号" width="120"></el-table-column>
            <el-table-column prop="name" label="标准名称" width="180"></el-table-column>
            <el-table-column prop="type" label="标准类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getStandardType(scope.row.type)">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="标准级别" width="100">
              <template slot-scope="scope">
                <el-tag :type="getLevelType(scope.row.level)">{{ scope.row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
            <el-table-column prop="creator" label="创建人" width="120"></el-table-column>
            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" type="info" @click="handleDetail(scope.row)">详情</el-button>
                <el-button size="mini" type="success" @click="handlePublish(scope.row)">发布</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 标准详情对话框 -->
    <el-dialog title="标准详情" :visible.sync="detailDialogVisible" width="70%">
      <div v-if="currentStandard">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标准编号">{{ currentStandard.code }}</el-descriptions-item>
          <el-descriptions-item label="标准名称">{{ currentStandard.name }}</el-descriptions-item>
          <el-descriptions-item label="标准类型">{{ currentStandard.type }}</el-descriptions-item>
          <el-descriptions-item label="标准级别">{{ currentStandard.level }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentStandard.status }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentStandard.createTime }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ currentStandard.creator }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentStandard.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="标准描述" :span="2">{{ currentStandard.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="standard-content" style="margin-top: 20px">
          <h3>标准内容</h3>
          <el-table :data="currentStandard.content" border style="width: 100%">
            <el-table-column prop="field" label="字段名称" width="180"></el-table-column>
            <el-table-column prop="type" label="数据类型" width="120"></el-table-column>
            <el-table-column prop="length" label="长度" width="100"></el-table-column>
            <el-table-column prop="nullable" label="是否可空" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.nullable ? 'info' : 'danger'">
                  {{ scope.row.nullable ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="字段描述"></el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 发布标准对话框 -->
    <el-dialog title="发布标准" :visible.sync="publishDialogVisible" width="50%">
      <el-form :model="publishForm" label-width="100px">
        <el-form-item label="发布说明">
          <el-input type="textarea" v-model="publishForm.description" rows="4" placeholder="请输入发布说明"></el-input>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker
            v-model="publishForm.effectiveTime"
            type="datetime"
            placeholder="选择生效时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="publishDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitPublish">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 创建标准对话框 -->
    <el-dialog title="创建标准" :visible.sync="createDialogVisible" width="70%">
      <el-form :model="standardForm" label-width="100px">
        <el-form-item label="标准名称">
          <el-input v-model="standardForm.name" placeholder="请输入标准名称"></el-input>
        </el-form-item>
        <el-form-item label="标准类型">
          <el-select v-model="standardForm.type" placeholder="请选择标准类型">
            <el-option label="数据标准" value="data"></el-option>
            <el-option label="技术标准" value="technical"></el-option>
            <el-option label="管理标准" value="management"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标准级别">
          <el-select v-model="standardForm.level" placeholder="请选择标准级别">
            <el-option label="国家级" value="national"></el-option>
            <el-option label="省级" value="provincial"></el-option>
            <el-option label="市级" value="municipal"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标准描述">
          <el-input type="textarea" v-model="standardForm.description" rows="4" placeholder="请输入标准描述"></el-input>
        </el-form-item>
        <el-form-item label="标准内容">
          <el-button type="primary" size="small" @click="addField">添加字段</el-button>
          <el-table :data="standardForm.content" border style="width: 100%; margin-top: 10px">
            <el-table-column prop="field" label="字段名称" width="180">
              <template slot-scope="scope">
                <el-input v-model="scope.row.field" placeholder="请输入字段名称"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="数据类型" width="120">
              <template slot-scope="scope">
                <el-select v-model="scope.row.type" placeholder="请选择">
                  <el-option label="字符串" value="string"></el-option>
                  <el-option label="数字" value="number"></el-option>
                  <el-option label="日期" value="date"></el-option>
                  <el-option label="布尔" value="boolean"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="length" label="长度" width="100">
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.length" :min="1" :max="1000"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column prop="nullable" label="是否可空" width="100">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.nullable"></el-switch>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="字段描述">
              <template slot-scope="scope">
                <el-input v-model="scope.row.description" placeholder="请输入字段描述"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="danger" size="mini" @click="removeField(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitStandard">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'QualityStandard',
  data() {
    return {
      standardList: [
        {
          code: 'STD001',
          name: '数据采集标准',
          type: '数据标准',
          level: '市级',
          status: '待审核',
          createTime: '2024-01-15 10:00:00',
          creator: '张三',
          updateTime: '2024-01-15 10:00:00',
          description: '定义数据采集的规范和标准',
          content: [
            {
              field: 'id',
              type: 'string',
              length: 32,
              nullable: false,
              description: '唯一标识'
            },
            {
              field: 'name',
              type: 'string',
              length: 100,
              nullable: false,
              description: '名称'
            }
          ]
        },
        {
          code: 'STD002',
          name: '数据处理标准',
          type: '技术标准',
          level: '省级',
          status: '已发布',
          createTime: '2024-01-14 15:30:00',
          creator: '李四',
          updateTime: '2024-01-15 09:00:00',
          description: '定义数据处理的规范和标准',
          content: [
            {
              field: 'process_id',
              type: 'string',
              length: 32,
              nullable: false,
              description: '处理ID'
            },
            {
              field: 'process_type',
              type: 'string',
              length: 50,
              nullable: false,
              description: '处理类型'
            }
          ]
        }
      ],
      detailDialogVisible: false,
      publishDialogVisible: false,
      createDialogVisible: false,
      currentStandard: null,
      publishForm: {
        description: '',
        effectiveTime: ''
      },
      standardForm: {
        name: '',
        type: '',
        level: '',
        description: '',
        content: []
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
        values: [30, 25, 35, 40, 35, 30, 28]
      }

      trendChart.setOption({
        title: {
          text: '标准发布趋势'
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
          name: '标准数量'
        },
        series: [
          {
            name: '标准数量',
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
        { value: 45, name: '数据标准' },
        { value: 35, name: '技术标准' },
        { value: 20, name: '管理标准' }
      ]

      typeChart.setOption({
        title: {
          text: '标准类型分布'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: ['数据标准', '技术标准', '管理标准']
        },
        series: [
          {
            name: '标准类型',
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
    getStandardType(type) {
      const types = {
        '数据标准': 'primary',
        '技术标准': 'success',
        '管理标准': 'warning'
      }
      return types[type] || 'info'
    },
    getLevelType(level) {
      const types = {
        '国家级': 'danger',
        '省级': 'warning',
        '市级': 'info'
      }
      return types[level] || 'info'
    },
    getStatusType(status) {
      const types = {
        '待审核': 'warning',
        '已发布': 'success',
        '已过期': 'info'
      }
      return types[status] || 'info'
    },
    handleRefresh() {
      this.initTrendChart()
      this.initTypeChart()
    },
    handleDetail(row) {
      this.currentStandard = row
      this.detailDialogVisible = true
    },
    handlePublish(row) {
      this.currentStandard = row
      this.publishDialogVisible = true
    },
    handleDelete(row) {
      this.$message({
        message: `删除标准：${row.name}`,
        type: 'warning'
      })
    },
    handleCreate() {
      this.createDialogVisible = true
    },
    addField() {
      this.standardForm.content.push({
        field: '',
        type: 'string',
        length: 50,
        nullable: true,
        description: ''
      })
    },
    removeField(index) {
      this.standardForm.content.splice(index, 1)
    },
    submitPublish() {
      this.$message({
        message: '标准发布成功',
        type: 'success'
      })
      this.publishDialogVisible = false
    },
    submitStandard() {
      this.$message({
        message: '标准创建成功',
        type: 'success'
      })
      this.createDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.standard-container {
  padding: 20px;
}

.standard-card {
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

.standard-content {
  h3 {
    margin-bottom: 15px;
    font-weight: 500;
    color: #303133;
  }
}
</style> 