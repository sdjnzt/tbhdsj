<template>
  <div class="standard-coordination">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据规范统筹</h2>
        <div class="page-desc">统一数据标准，提升数据质量</div>
      </div>
      <div class="header-right">
        <el-input placeholder="搜索标准名称" v-model="searchQuery" prefix-icon="el-icon-search" class="search-input" clearable />
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus" @click="showAddStandard">新增标准</el-button>
          <el-button type="success" icon="el-icon-upload2" @click="importStandards">导入</el-button>
          <el-button icon="el-icon-download" @click="exportStandards">导出</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card card-primary">
            <div class="stat-icon"><i class="el-icon-s-grid"></i></div>
            <div class="stat-content">
              <div class="stat-label">标准总数</div>
              <div class="stat-value">32</div>
              <div class="stat-trend"><span class="trend-up">+2</span> 本月</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-success">
            <div class="stat-icon"><i class="el-icon-data-analysis"></i></div>
            <div class="stat-content">
              <div class="stat-label">覆盖率</div>
              <div class="stat-value">97%</div>
              <div class="stat-trend"><span class="trend-up">+5%</span> 同比</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-warning">
            <div class="stat-icon"><i class="el-icon-time"></i></div>
            <div class="stat-content">
              <div class="stat-label">更新时效</div>
              <div class="stat-value">3天</div>
              <div class="stat-trend"><span class="trend-down">-1天</span> 优化</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-danger">
            <div class="stat-icon"><i class="el-icon-warning-outline"></i></div>
            <div class="stat-content">
              <div class="stat-label">待处理问题</div>
              <div class="stat-value">5</div>
              <div class="stat-trend"><span class="trend-down">-2</span> 本周</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 标签页 -->
    <div class="content-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="标准管理" name="standards">
          <div class="filter-bar">
            <el-select v-model="typeFilter" placeholder="标准类型" clearable>
              <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="text" icon="el-icon-refresh" @click="resetFilters">重置筛选</el-button>
          </div>
          
          <el-table :data="filteredTableData" style="width:100%" border stripe>
            <el-table-column prop="name" label="标准名称" min-width="150">
              <template slot-scope="scope">
                <el-link type="primary" @click="viewStandardDetail(scope.row)">{{ scope.row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTypeTagClass(scope.row.type)" size="medium">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="coverage" label="覆盖率" width="120">
              <template slot-scope="scope">
                <el-progress :percentage="parseInt(scope.row.coverage)" :color="getCoverageColor(scope.row.coverage)" />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusTagClass(scope.row.status)" size="medium">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="owner" label="责任人" width="120" />
            <el-table-column prop="lastUpdate" label="最近更新时间" width="160" />
            <el-table-column label="操作" width="240" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" @click="editStandard(scope.row)">编辑</el-button>
                <el-button size="mini" type="success" @click="publishStandard(scope.row)" :disabled="scope.row.status === '已发布'">发布</el-button>
                <el-button size="mini" type="danger" @click="deleteStandard(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredTableData.length"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="指标概览" name="metrics">
          <div class="charts-container">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card shadow="hover" class="chart-card">
                  <div slot="header">标准类型分布</div>
                  <div ref="typeChart" style="height: 300px;"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card shadow="hover" class="chart-card">
                  <div slot="header">覆盖率趋势</div>
                  <div ref="coverageChart" style="height: 300px;"></div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="24">
                <el-card shadow="hover" class="chart-card">
                  <div slot="header">标准更新历史</div>
                  <div ref="updateChart" style="height: 300px;"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 标准详情对话框 -->
    <el-dialog :visible.sync="detailVisible" width="70%" :title="currentStandard.name" center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="标准名称">{{ currentStandard.name }}</el-descriptions-item>
        <el-descriptions-item label="标准类型">{{ currentStandard.type }}</el-descriptions-item>
        <el-descriptions-item label="覆盖率">{{ currentStandard.coverage }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentStandard.status }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ currentStandard.owner }}</el-descriptions-item>
        <el-descriptions-item label="最近更新时间">{{ currentStandard.lastUpdate }}</el-descriptions-item>
        <el-descriptions-item label="标准描述" :span="2">{{ currentStandard.description || '暂无描述' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-tabs style="margin-top: 20px;">
        <el-tab-pane label="字段定义">
          <el-table :data="currentStandard.fields || []" border>
            <el-table-column prop="name" label="字段名称" />
            <el-table-column prop="type" label="数据类型" width="120" />
            <el-table-column prop="required" label="是否必填" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.required ? 'danger' : 'info'" size="mini">
                  {{ scope.row.required ? '必填' : '选填' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="字段描述" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="应用系统">
          <el-table :data="currentStandard.systems || []" border>
            <el-table-column prop="name" label="系统名称" />
            <el-table-column prop="status" label="应用状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '已应用' ? 'success' : 'warning'" size="mini">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="应用日期" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 新增/编辑标准对话框 -->
    <el-dialog :visible.sync="editVisible" width="600px" :title="isNewStandard ? '新增标准' : '编辑标准'" center>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="标准名称">
          <el-input v-model="editForm.name" placeholder="请输入标准名称" />
        </el-form-item>
        <el-form-item label="标准类型">
          <el-select v-model="editForm.type" placeholder="请选择标准类型">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="覆盖率">
          <el-input-number v-model="editForm.coverageValue" :min="0" :max="100" :step="1" /> %
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任人">
          <el-input v-model="editForm.owner" placeholder="请输入责任人" />
        </el-form-item>
        <el-form-item label="标准描述">
          <el-input type="textarea" v-model="editForm.description" rows="4" placeholder="请输入标准描述" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStandard">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'StandardCoordination',
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      statusFilter: '',
      activeTab: 'standards',
      currentPage: 1,
      pageSize: 10,
      
      typeOptions: [
        { value: '结构', label: '结构标准' },
        { value: '内容', label: '内容标准' },
        { value: '质量', label: '质量标准' },
        { value: '安全', label: '安全标准' },
        { value: '交换', label: '交换标准' }
      ],
      
      statusOptions: [
        { value: '草稿', label: '草稿' },
        { value: '待审核', label: '待审核' },
        { value: '已发布', label: '已发布' },
        { value: '已废弃', label: '已废弃' }
      ],
      
      tableData: [
        { 
          id: 1,
          name: '人口数据标准', 
          type: '结构', 
          coverage: '100%', 
          status: '已发布',
          owner: '张明轩',
          lastUpdate: '2025-05-30',
          description: '太白湖人口数据标准规范，包含人口基本信息、人口变动信息等',
          fields: [
            { name: 'personId', type: 'String', required: true, description: '人员唯一标识' },
            { name: 'name', type: 'String', required: true, description: '姓名' },
            { name: 'gender', type: 'Integer', required: true, description: '性别' }
          ],
          systems: [
            { name: '人口管理系统', status: '已应用', date: '2025-04-01' },
            { name: '社区服务系统', status: '未应用', date: '-' }
          ]
        },
        { 
          id: 2,
          name: '企业数据标准', 
          type: '内容', 
          coverage: '95%', 
          status: '已发布',
          owner: '刘伟峰',
          lastUpdate: '2025-05-30',
          description: '太白湖企业数据标准规范，包含企业基本信息、资质信息等',
          fields: [
            { name: 'companyId', type: 'String', required: true, description: '企业唯一标识' },
            { name: 'companyName', type: 'String', required: true, description: '企业名称' },
            { name: 'regCapital', type: 'Decimal', required: false, description: '注册资本' }
          ],
          systems: [
            { name: '企业服务平台', status: '已应用', date: '2025-04-15' },
            { name: '市场监管系统', status: '已应用', date: '2025-05-01' }
          ]
        },
        { 
          id: 3,
          name: '环境数据标准', 
          type: '结构', 
          coverage: '97%', 
          status: '已发布',
          owner: '陈晓静',
          lastUpdate: '2025-05-30',
          description: '太白湖环境数据标准规范，包含环境监测数据、污染源数据等',
          fields: [
            { name: 'monitorId', type: 'String', required: true, description: '监测点位ID' },
            { name: 'monitorName', type: 'String', required: true, description: '监测点位名称' },
            { name: 'pm25', type: 'Decimal', required: true, description: 'PM2.5浓度' }
          ],
          systems: [
            { name: '环境监测系统', status: '已应用', date: '2025-03-20' }
          ]
        },
        { 
          id: 4,
          name: '交通数据标准', 
          type: '交换', 
          coverage: '92%', 
          status: '待审核',
          owner: '杨宏达',
          lastUpdate: '2025-05-29',
          description: '太白湖交通数据标准规范，包含道路信息、车辆信息等'
        },
        { 
          id: 5,
          name: '医疗数据标准', 
          type: '安全', 
          coverage: '88%', 
          status: '草稿',
          owner: '林婉如',
          lastUpdate: '2025-05-28',
          description: '太白湖医疗数据标准规范，包含医疗机构、医疗服务等信息'
        }
      ],
      
      detailVisible: false,
      currentStandard: {},
      
      editVisible: false,
      isNewStandard: false,
      editForm: {
        name: '',
        type: '',
        coverageValue: 90,
        status: '',
        owner: '',
        description: ''
      }
    }
  },
  computed: {
    filteredTableData() {
      return this.tableData.filter(item => {
        const matchSearch = !this.searchQuery || 
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (item.owner && item.owner.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        const matchType = !this.typeFilter || item.type === this.typeFilter;
        const matchStatus = !this.statusFilter || item.status === this.statusFilter;
        
        return matchSearch && matchType && matchStatus;
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.activeTab === 'metrics') {
        this.initCharts();
      }
    });
  },
  methods: {
    resetFilters() {
      this.searchQuery = '';
      this.typeFilter = '';
      this.statusFilter = '';
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
    },
    
    getTypeTagClass(type) {
      const map = {
        '结构': 'primary',
        '内容': 'success',
        '质量': 'warning',
        '安全': 'danger',
        '交换': 'info'
      };
      return map[type] || 'info';
    },
    
    getStatusTagClass(status) {
      const map = {
        '草稿': 'info',
        '待审核': 'warning',
        '已发布': 'success',
        '已废弃': 'danger'
      };
      return map[status] || 'info';
    },
    
    getCoverageColor(coverage) {
      const value = parseInt(coverage);
      if (value >= 95) return '#67C23A';
      if (value >= 85) return '#E6A23C';
      return '#F56C6C';
    },
    
    viewStandardDetail(row) {
      this.currentStandard = row;
      this.detailVisible = true;
    },
    
    editStandard(row) {
      this.isNewStandard = false;
      this.editForm = {
        id: row.id,
        name: row.name,
        type: row.type,
        coverageValue: parseInt(row.coverage),
        status: row.status,
        owner: row.owner,
        description: row.description || ''
      };
      this.editVisible = true;
    },
    
    showAddStandard() {
      this.isNewStandard = true;
      this.editForm = {
        name: '',
        type: '',
        coverageValue: 90,
        status: '草稿',
        owner: '',
        description: ''
      };
      this.editVisible = true;
    },
    
    saveStandard() {
      if (!this.editForm.name || !this.editForm.type) {
        this.$message.warning('请填写完整的标准信息');
        return;
      }
      
      const standardData = {
        id: this.editForm.id || Date.now(),
        name: this.editForm.name,
        type: this.editForm.type,
        coverage: this.editForm.coverageValue + '%',
        status: this.editForm.status,
        owner: this.editForm.owner,
        lastUpdate: new Date().toISOString().split('T')[0],
        description: this.editForm.description
      };
      
      if (this.isNewStandard) {
        this.tableData.unshift(standardData);
        this.$message.success('标准已添加');
      } else {
        const index = this.tableData.findIndex(item => item.id === standardData.id);
        if (index !== -1) {
          this.tableData.splice(index, 1, standardData);
        }
        this.$message.success('标准已更新');
      }
      
      this.editVisible = false;
    },
    
    publishStandard(row) {
      row.status = '已发布';
      row.lastUpdate = new Date().toISOString().split('T')[0];
      this.$message.success(`${row.name}已发布`);
    },
    
    deleteStandard(row) {
      this.$confirm('确定要删除此标准吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData = this.tableData.filter(item => item.id !== row.id);
        this.$message.success('标准已删除');
      }).catch(() => {});
    },
    
    importStandards() {
      this.$message.success('标准导入功能');
    },
    
    exportStandards() {
      this.$message.success('标准导出功能');
    },
    
    initCharts() {
      this.$nextTick(() => {
        // 标准类型分布图
        const typeChart = echarts.init(this.$refs.typeChart);
        typeChart.setOption({
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            data: ['结构标准', '内容标准', '质量标准', '安全标准', '交换标准']
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
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 12, name: '结构标准' },
                { value: 8, name: '内容标准' },
                { value: 6, name: '质量标准' },
                { value: 4, name: '安全标准' },
                { value: 2, name: '交换标准' }
              ]
            }
          ]
        });
        
        // 覆盖率趋势图
        const coverageChart = echarts.init(this.$refs.coverageChart);
        coverageChart.setOption({
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['整体覆盖率', '结构标准', '内容标准']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
          },
          yAxis: {
            type: 'value',
            min: 70
          },
          series: [
            {
              name: '整体覆盖率',
              type: 'line',
              stack: '总量',
              data: [80, 82, 85, 89, 93, 97],
              lineStyle: {
                width: 3
              }
            },
            {
              name: '结构标准',
              type: 'line',
              stack: '总量',
              data: [85, 87, 90, 94, 98, 100]
            },
            {
              name: '内容标准',
              type: 'line',
              stack: '总量',
              data: [75, 78, 82, 85, 90, 95]
            }
          ]
        });
        
        // 标准更新历史图
        const updateChart = echarts.init(this.$refs.updateChart);
        updateChart.setOption({
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['新增标准', '更新标准', '废弃标准']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: ['1月', '2月', '3月', '4月', '5月', '6月']
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: '数量',
              min: 0,
              interval: 2
            }
          ],
          series: [
            {
              name: '新增标准',
              type: 'bar',
              data: [3, 2, 5, 4, 6, 2]
            },
            {
              name: '更新标准',
              type: 'bar',
              data: [5, 7, 8, 10, 12, 8]
            },
            {
              name: '废弃标准',
              type: 'bar',
              data: [1, 0, 2, 1, 0, 1]
            }
          ]
        });
      });
    }
  },
  watch: {
    activeTab(newVal) {
      if (newVal === 'metrics') {
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    }
  }
}
</script>

<style scoped>
.standard-coordination {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面标题样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.search-input {
  width: 220px;
  margin-right: 16px;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.card-primary {
  border-left: 4px solid #409EFF;
}

.card-success {
  border-left: 4px solid #67C23A;
}

.card-warning {
  border-left: 4px solid #E6A23C;
}

.card-danger {
  border-left: 4px solid #F56C6C;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #409EFF;
}

.card-primary .stat-icon {
  background: #ecf5ff;
  color: #409EFF;
}

.card-success .stat-icon {
  background: #f0f9eb;
  color: #67C23A;
}

.card-warning .stat-icon {
  background: #fdf6ec;
  color: #E6A23C;
}

.card-danger .stat-icon {
  background: #fef0f0;
  color: #F56C6C;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  color: #909399;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

/* 内容区样式 */
.content-tabs {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.filter-bar .el-select {
  margin-right: 16px;
  width: 150px;
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
}

/* 图表样式 */
.chart-card {
  margin-bottom: 20px;
}

/* 表单样式 */
.el-form-item {
  margin-bottom: 20px;
}
</style> 