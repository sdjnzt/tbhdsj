<template>
  <div class="fusion-integration">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">数据融合集成</h2>
        <div class="page-desc">融合多源异构数据，提供一致性视图，实现数据共享和协同分析。</div>
      </div>
      <div class="header-right">
        <el-input placeholder="搜索融合数据" v-model="searchQuery" prefix-icon="el-icon-search" class="search-input" clearable />
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus" @click="showAddFusionTask">新建融合任务</el-button>
          <el-button type="success" icon="el-icon-view" @click="viewDataRelations">关系预览</el-button>
          <el-button icon="el-icon-refresh" @click="refreshData">刷新</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card card-primary">
            <div class="stat-icon"><i class="el-icon-s-data"></i></div>
            <div class="stat-content">
              <div class="stat-label">融合数据量</div>
              <div class="stat-value">320万</div>
              <div class="stat-trend"><span class="trend-up">+12%</span> 同比</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-success">
            <div class="stat-icon"><i class="el-icon-s-check"></i></div>
            <div class="stat-content">
              <div class="stat-label">融合准确率</div>
              <div class="stat-value">97%</div>
              <div class="stat-trend"><span class="trend-up">+1.5%</span> 环比</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-warning">
            <div class="stat-icon"><i class="el-icon-time"></i></div>
            <div class="stat-content">
              <div class="stat-label">平均生成时效</div>
              <div class="stat-value">45分钟</div>
              <div class="stat-trend"><span class="trend-down">-10分钟</span> 优化</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card card-info">
            <div class="stat-icon"><i class="el-icon-connection"></i></div>
            <div class="stat-content">
              <div class="stat-label">源系统数量</div>
              <div class="stat-value">15</div>
              <div class="stat-trend"><span class="trend-up">+2</span> 本季度</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 内容区 -->
    <div class="content-section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="融合数据管理" name="data">
          <div class="filter-bar">
            <el-select v-model="typeFilter" placeholder="数据类型" clearable>
              <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态" clearable>
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="text" icon="el-icon-refresh" @click="resetFilters">重置筛选</el-button>
          </div>
          
          <el-table :data="filteredTableData" style="width:100%" border stripe>
            <el-table-column prop="name" label="数据名称" min-width="150">
              <template slot-scope="scope">
                <el-link type="primary" @click="viewDataDetail(scope.row)">{{ scope.row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="source" label="数据来源" width="120" />
            <el-table-column prop="type" label="数据类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getTypeTagClass(scope.row.type)" size="medium">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="accuracy" label="准确率" width="100">
              <template slot-scope="scope">
                <el-progress :percentage="parseInt(scope.row.accuracy)" :color="getQualityColor(parseInt(scope.row.accuracy))"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="generateTime" label="生成时效" width="120" />
            <el-table-column prop="updateTime" label="更新时间" width="140" />
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusTagClass(scope.row.status)" size="medium">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" @click="editFusionData(scope.row)">编辑</el-button>
                <el-button size="mini" type="success" @click="refreshFusionData(scope.row)">刷新</el-button>
                <el-button size="mini" type="danger" @click="deleteFusionData(scope.row)">删除</el-button>
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
        
        <el-tab-pane label="融合关系分析" name="relations">
          <div class="relation-toolbar">
            <el-select v-model="selectedData" placeholder="选择融合数据" style="width: 220px;" @change="generateRelations">
              <el-option
                v-for="item in tableData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <div class="toolbar-actions">
              <el-radio-group v-model="relationType" size="small" @change="generateRelations">
                <el-radio-button label="source">数据源</el-radio-button>
                <el-radio-button label="target">目标端</el-radio-button>
                <el-radio-button label="both">全部</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          
          <div class="relation-container">
            <div class="no-data" v-if="!selectedData">
              <i class="el-icon-connection"></i>
              <p>请选择融合数据以查看数据关系</p>
            </div>
            <div ref="relationChart" class="relation-chart" v-else></div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 融合数据详情对话框 -->
    <el-dialog :visible.sync="detailVisible" width="70%" :title="currentData.name + ' - 融合数据详情'" center>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="数据名称">{{ currentData.name }}</el-descriptions-item>
        <el-descriptions-item label="数据来源">{{ currentData.source }}</el-descriptions-item>
        <el-descriptions-item label="数据类型">{{ currentData.type }}</el-descriptions-item>
        <el-descriptions-item label="准确率">{{ currentData.accuracy }}</el-descriptions-item>
        <el-descriptions-item label="生成时效">{{ currentData.generateTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentData.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentData.status }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ currentData.owner }}</el-descriptions-item>
        <el-descriptions-item label="描述信息" :span="2">{{ currentData.description }}</el-descriptions-item>
      </el-descriptions>
      
      <el-tabs style="margin-top: 20px;">
        <el-tab-pane label="数据结构">
          <el-table :data="currentFields" border>
            <el-table-column prop="name" label="字段名称" />
            <el-table-column prop="type" label="数据类型" width="120" />
            <el-table-column prop="source" label="来源字段" />
            <el-table-column prop="description" label="描述" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="关联关系">
          <div ref="detailRelationChart" style="height: 300px;"></div>
        </el-tab-pane>
        <el-tab-pane label="数据质量">
          <el-table :data="qualityRecords" border>
            <el-table-column prop="date" label="检测日期" width="120" />
            <el-table-column prop="completeness" label="完整性" width="120">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.completeness" :color="getQualityColor(scope.row.completeness)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="accuracy" label="准确性" width="120">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.accuracy" :color="getQualityColor(scope.row.accuracy)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="consistency" label="一致性" width="120">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.consistency" :color="getQualityColor(scope.row.consistency)"></el-progress>
              </template>
            </el-table-column>
            <el-table-column prop="issues" label="问题数" width="100" />
            <el-table-column prop="status" label="处理状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '已处理' ? 'success' : 'warning'" size="mini">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog :visible.sync="editVisible" width="600px" :title="isNewData ? '新建融合任务' : '编辑融合数据'" center>
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="数据名称">
          <el-input v-model="editForm.name" placeholder="请输入数据名称" />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-input v-model="editForm.source" placeholder="请输入数据来源" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="editForm.type" placeholder="请选择数据类型">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="融合策略" v-if="isNewData">
          <el-select v-model="editForm.strategy" placeholder="请选择融合策略">
            <el-option label="联邦查询" value="联邦查询" />
            <el-option label="ETL抽取" value="ETL抽取" />
            <el-option label="实时同步" value="实时同步" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="责任人">
          <el-input v-model="editForm.owner" placeholder="请输入责任人" />
        </el-form-item>
        <el-form-item label="描述信息">
          <el-input type="textarea" v-model="editForm.description" rows="4" placeholder="请输入描述信息" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFusionData">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import * as echarts from 'echarts'

export default {
  name: 'FusionIntegration',
  data() {
    return {
      searchQuery: '',
      typeFilter: '',
      statusFilter: '',
      activeTab: 'data',
      currentPage: 1,
      pageSize: 10,
      
      typeOptions: [
        { value: '人口数据', label: '人口数据' },
        { value: '企业数据', label: '企业数据' },
        { value: '环境数据', label: '环境数据' },
        { value: '交通数据', label: '交通数据' },
        { value: '医疗数据', label: '医疗数据' }
      ],
      
      statusOptions: [
        { value: '已完成', label: '已完成' },
        { value: '同步中', label: '同步中' },
        { value: '待更新', label: '待更新' },
        { value: '已失效', label: '已失效' }
      ],
      
      selectedData: null,
      relationType: 'both',
      
      detailVisible: false,
      currentData: {},
      currentFields: [],
      qualityRecords: [],
      
      editVisible: false,
      isNewData: false,
      editForm: {
        name: '',
        source: '',
        type: '',
        strategy: '',
        status: '',
        owner: '',
        description: ''
      },
      
      tableData: [
        { 
          id: 1,
          name: '人口融合数据', 
          source: '公安+卫健', 
          type: '人口数据',
          accuracy: '98%', 
          generateTime: '30分钟',
          updateTime: '2025-05-30',
          owner: '张云峰',
          status: '已完成',
          description: '整合公安部门和卫健部门的人口数据，形成统一人口视图'
        },
        { 
          id: 2,
          name: '企业融合数据', 
          source: '工商+税务', 
          type: '企业数据',
          accuracy: '95%', 
          generateTime: '50分钟',
          updateTime: '2025-05-29',
          owner: '李静怡',
          status: '已完成',
          description: '整合工商、税务部门的企业信息，提供完整企业画像'
        },
        { 
          id: 3,
          name: '环境融合数据', 
          source: '环保+气象', 
          type: '环境数据',
          accuracy: '97%', 
          generateTime: '40分钟',
          updateTime: '2025-05-30',
          owner: '王建国',
          status: '已完成',
          description: '融合环保和气象数据，支持环境综合分析和预警'
        },
        { 
          id: 4,
          name: '交通融合数据', 
          source: '交通+公安', 
          type: '交通数据',
          accuracy: '94%', 
          generateTime: '45分钟',
          updateTime: '2025-05-28',
          owner: '刘明远',
          status: '同步中',
          description: '融合交通部门和公安部门的交通数据，支持交通综合分析'
        },
        { 
          id: 5,
          name: '医疗融合数据', 
          source: '卫健+医保', 
          type: '医疗数据',
          accuracy: '96%', 
          generateTime: '60分钟',
          updateTime: '2025-05-27',
          owner: '陈晓华',
          status: '待更新',
          description: '整合医疗机构和医保数据，提供医疗服务分析'
        }
      ]
    }
  },
  computed: {
    filteredTableData() {
      if (!this.searchQuery && !this.typeFilter && !this.statusFilter) return this.tableData;
      return this.tableData.filter(item => {
        const matchSearch = !this.searchQuery || 
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (item.source && item.source.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        const matchType = !this.typeFilter || item.type === this.typeFilter;
        const matchStatus = !this.statusFilter || item.status === this.statusFilter;
        
        return matchSearch && matchType && matchStatus;
      });
    }
  },
  mounted() {
    if (this.activeTab === 'relations' && this.selectedData) {
      this.$nextTick(() => {
        this.generateRelations();
      });
    }
  },
  methods: {
    showAddFusionTask() {
      this.isNewData = true;
      this.editForm = {
        name: '',
        source: '',
        type: '',
        strategy: '联邦查询',
        status: '待更新',
        owner: '',
        description: ''
      };
      this.editVisible = true;
    },
    
    viewDataRelations() {
      this.activeTab = 'relations';
      this.$message.success('正在分析数据融合关系');
      this.$nextTick(() => {
        if (this.selectedData) {
          this.generateRelations();
        }
      });
    },
    
    refreshData() {
      this.$message.success('数据已刷新');
    },
    
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
        '人口数据': 'primary',
        '企业数据': 'success',
        '环境数据': 'info',
        '交通数据': 'warning',
        '医疗数据': 'danger'
      };
      return map[type] || 'info';
    },
    
    getStatusTagClass(status) {
      const map = {
        '已完成': 'success',
        '同步中': 'primary',
        '待更新': 'warning',
        '已失效': 'danger'
      };
      return map[status] || 'info';
    },
    
    getQualityColor(value) {
      if (value >= 90) return '#67C23A';
      if (value >= 75) return '#E6A23C';
      return '#F56C6C';
    },
    
    viewDataDetail(row) {
      this.currentData = row;
      
      // 模拟字段数据
      this.currentFields = [
        { name: 'person_id', type: 'varchar(32)', source: '公安.身份证号/卫健.个人编号', description: '人员唯一标识' },
        { name: 'name', type: 'varchar(50)', source: '公安.姓名/卫健.姓名', description: '姓名' },
        { name: 'gender', type: 'char(1)', source: '公安.性别', description: '性别' },
        { name: 'birthday', type: 'date', source: '公安.出生日期', description: '出生日期' },
        { name: 'id_number', type: 'varchar(18)', source: '公安.身份证号', description: '身份证号' },
        { name: 'address', type: 'varchar(200)', source: '公安.住址', description: '住址' },
        { name: 'phone', type: 'varchar(15)', source: '卫健.联系电话', description: '联系电话' },
        { name: 'medical_id', type: 'varchar(32)', source: '卫健.医保编号', description: '医保编号' }
      ];
      
      // 模拟质量检测记录
      this.qualityRecords = [
        { date: '2025-06-01', completeness: 98, accuracy: 95, consistency: 97, issues: 12, status: '已处理' },
        { date: '2025-05-25', completeness: 96, accuracy: 94, consistency: 95, issues: 18, status: '已处理' },
        { date: '2025-05-18', completeness: 95, accuracy: 92, consistency: 93, issues: 22, status: '已处理' },
        { date: '2025-05-11', completeness: 93, accuracy: 91, consistency: 92, issues: 28, status: '已处理' }
      ];
      
      this.detailVisible = true;
      
      this.$nextTick(() => {
        this.initDetailRelationChart();
      });
    },
    
    editFusionData(row) {
      this.isNewData = false;
      this.editForm = {
        id: row.id,
        name: row.name,
        source: row.source,
        type: row.type,
        status: row.status,
        owner: row.owner,
        description: row.description
      };
      this.editVisible = true;
    },
    
    deleteFusionData(row) {
      this.$confirm('确定要删除此融合数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData = this.tableData.filter(item => item.id !== row.id);
        this.$message.success('融合数据已删除');
      }).catch(() => {});
    },
    
    refreshFusionData(row) {
      this.$message({
        message: `正在刷新数据：${row.name}`,
        type: 'info'
      });
      setTimeout(() => {
        this.$message.success('数据刷新成功');
      }, 1500);
    },
    
    saveFusionData() {
      if (!this.editForm.name || !this.editForm.source) {
        this.$message.warning('请填写完整的融合数据信息');
        return;
      }
      
      const fusionData = {
        id: this.editForm.id || Date.now(),
        name: this.editForm.name,
        source: this.editForm.source,
        type: this.editForm.type,
        accuracy: '96%',
        generateTime: '45分钟',
        updateTime: new Date().toISOString().split('T')[0],
        owner: this.editForm.owner,
        status: this.editForm.status,
        description: this.editForm.description
      };
      
      if (this.isNewData) {
        this.tableData.unshift(fusionData);
        this.$message.success('融合任务已创建');
      } else {
        const index = this.tableData.findIndex(item => item.id === fusionData.id);
        if (index !== -1) {
          this.tableData.splice(index, 1, fusionData);
        }
        this.$message.success('融合数据已更新');
      }
      
      this.editVisible = false;
    },
    
    getDataName(id) {
      const data = this.tableData.find(item => item.id === id);
      return data ? data.name : '';
    },
    
    generateRelations() {
      if (!this.selectedData) return;
      
      this.$nextTick(() => {
        // 初始化关系图
        const chart = echarts.init(this.$refs.relationChart);
        
        // 模拟关系数据
        const nodes = [
          { id: 'node0', name: this.getDataName(this.selectedData), category: 0, symbolSize: 50 },
          { id: 'node1', name: '公安人口数据', category: 1, symbolSize: 40 },
          { id: 'node2', name: '卫健人口数据', category: 1, symbolSize: 40 },
          { id: 'node3', name: '医保数据', category: 1, symbolSize: 35 },
          { id: 'node4', name: '人口分析应用', category: 2, symbolSize: 35 },
          { id: 'node5', name: '政务服务系统', category: 2, symbolSize: 35 },
          { id: 'node6', name: '医疗服务系统', category: 2, symbolSize: 30 }
        ];
        
        const links = [
          { source: 'node1', target: 'node0', value: '数据源' },
          { source: 'node2', target: 'node0', value: '数据源' },
          { source: 'node3', target: 'node0', value: '数据源' },
          { source: 'node0', target: 'node4', value: '使用方' },
          { source: 'node0', target: 'node5', value: '使用方' },
          { source: 'node0', target: 'node6', value: '使用方' }
        ];
        
        const categories = [
          { name: '融合数据' },
          { name: '数据源' },
          { name: '使用方' }
        ];
        
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              if (params.dataType === 'edge') {
                return params.data.value;
              }
              return params.data.name;
            }
          },
          legend: [{
            data: categories.map(function(a) {
              return a.name;
            })
          }],
          series: [{
            type: 'graph',
            layout: 'force',
            data: nodes,
            links: links,
            categories: categories,
            roam: true,
            label: {
              show: true,
              position: 'right'
            },
            force: {
              repulsion: 100,
              edgeLength: [80, 120]
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 8],
            edgeLabel: {
              show: true,
              formatter: function(params) {
                return params.data.value;
              },
              fontSize: 12
            },
            lineStyle: {
              opacity: 0.9,
              width: 2,
              curveness: 0
            }
          }]
        };
        
        chart.setOption(option);
        
        // 自适应窗口大小
        window.addEventListener('resize', function() {
          chart.resize();
        });
      });
    },
    
    initDetailRelationChart() {
      this.$nextTick(() => {
        if (!this.$refs.detailRelationChart) return;
        
        const chart = echarts.init(this.$refs.detailRelationChart);
        
        // 简化的关系图，针对当前查看的数据
        const option = {
          tooltip: {},
          series: [{
            type: 'graph',
            layout: 'force',
            data: [
              { id: 'detail0', name: this.currentData.name, symbolSize: 50, category: 0 },
              { id: 'detail1', name: '数据源1', symbolSize: 30, category: 1 },
              { id: 'detail2', name: '数据源2', symbolSize: 30, category: 1 },
              { id: 'detail3', name: '使用方1', symbolSize: 30, category: 2 },
              { id: 'detail4', name: '使用方2', symbolSize: 30, category: 2 }
            ],
            links: [
              { source: 'detail1', target: 'detail0' },
              { source: 'detail2', target: 'detail0' },
              { source: 'detail0', target: 'detail3' },
              { source: 'detail0', target: 'detail4' }
            ],
            categories: [
              { name: '当前' },
              { name: '源系统' },
              { name: '目标系统' }
            ],
            roam: true,
            label: {
              show: true
            },
            force: {
              repulsion: 80
            }
          }]
        };
        
        chart.setOption(option);
      });
    }
  },
  watch: {
    activeTab(newVal) {
      if (newVal === 'relations' && this.selectedData) {
        this.$nextTick(() => {
          this.generateRelations();
        });
      }
    }
  }
}
</script>
<style scoped>
.fusion-integration {
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

.card-info {
  border-left: 4px solid #909399;
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

.card-info .stat-icon {
  background: #f4f4f5;
  color: #909399;
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
.content-section {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 表格操作区 */
.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.filter-bar .el-select {
  margin-right: 16px;
  width: 150px;
}

/* 分页 */
.pagination-container {
  margin-top: 16px;
  text-align: right;
}

/* 关系分析相关样式 */
.relation-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.relation-container {
  height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  position: relative;
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.no-data i {
  font-size: 48px;
  color: #dcdfe6;
  margin-bottom: 10px;
}

.no-data p {
  color: #909399;
  font-size: 14px;
}

.relation-chart {
  width: 100%;
  height: 100%;
}
</style> 