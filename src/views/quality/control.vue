<template>
  <div class="quality-page">
    <!-- 顶部标题与操作区 -->
    <div class="quality-header">
      <div class="left-area">
        <div class="main-title">数据质量把控</div>
        <div class="sub-title">质量监测、异常分析、数据治理</div>
      </div>
      <div class="right-area">
        <el-input placeholder="搜索数据指标" v-model="search" size="small" prefix-icon="el-icon-search" class="search-input" clearable />
        <el-button-group>
          <el-button icon="el-icon-refresh" @click="refresh">刷新</el-button>
          <el-button icon="el-icon-download" @click="exportData">导出</el-button>
          <el-button icon="el-icon-setting" @click="showRuleConfig">规则配置</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 质量指标卡片组 -->
    <div class="card-section">
      <el-row :gutter="16">
        <el-col :span="4" v-for="(card, index) in qualityCards" :key="index">
          <div class="stat-card" :class="getCardClass(card)">
            <div class="stat-icon"><i :class="getCardIcon(card)"></i></div>
            <div class="stat-content">
              <div class="stat-title">{{ card.title }}</div>
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-trend" :class="trendClass(card)">
                <i v-if="card.trend>0" class="el-icon-caret-top"></i>
                <i v-else-if="card.trend<0" class="el-icon-caret-bottom"></i>
                <span>{{ card.trend>0?'+':'' }}{{ card.trend }}%</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据质量图表区 -->
    <div class="chart-section">
      <el-row :gutter="16">
        <el-col :span="16">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span>数据质量趋势</span>
              <el-radio-group v-model="trendTimeRange" size="mini">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="quarter">本季度</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="qualityTrendChart" style="height:280px;"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="chart-card" shadow="hover">
            <div slot="header" class="chart-header">
              <span>质量问题分布</span>
            </div>
            <div ref="qualityAnomalyChart" style="height:280px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 治理与分析区 -->
    <div class="govern-section">
      <el-row :gutter="16">
        <el-col :span="16">
          <el-card class="table-card" shadow="hover">
            <div slot="header" class="table-header">
              <span>数据质量异常列表</span>
              <div class="table-actions">
                <el-button size="mini" type="primary" icon="el-icon-magic-stick" @click="autoFixAll">智能修正</el-button>
                <el-button size="mini" type="success" icon="el-icon-check" @click="batchHandle">批量处理</el-button>
              </div>
            </div>
            <el-table :data="filteredAnomalyList" stripe border :header-cell-style="tableHeaderStyle">
              <el-table-column type="selection" width="40"/>
              <el-table-column prop="metric" label="指标" width="110"/>
              <el-table-column prop="value" label="当前值" width="90"/>
              <el-table-column prop="threshold" label="阈值" width="90"/>
              <el-table-column prop="source" label="数据来源" width="100"/>
              <el-table-column prop="status" label="状态" width="80">
                <template slot-scope="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="mini">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="检测时间" width="150"/>
              <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                  <el-button size="mini" @click="viewAnomaly(scope.row)">详情</el-button>
                  <el-button size="mini" type="primary" @click="handleAnomaly(scope.row)" :disabled="scope.row.status==='已处理'">处理</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" circle @click="ignoreAnomaly(scope.row)" :disabled="scope.row.status==='已处理'"></el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[10, 20, 30, 50]"
                :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredAnomalyList.length">
              </el-pagination>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="intel-card" shadow="hover">
            <div slot="header" class="intel-header">
              <span>智能分析报告</span>
              <el-tag size="mini" type="info">实时更新</el-tag>
            </div>
            <div class="intel-content">
              <div class="score-section">
                <div class="score-circle">
                  <span class="score-value">{{ overallScore }}</span>
                  <span class="score-unit">分</span>
                </div>
                <div class="score-desc">数据质量评分</div>
              </div>
              <div class="intel-divider"></div>
              <div class="intel-items">
                <div v-for="(intel, idx) in intelCards" :key="idx" class="intel-item">
                  <i :class="intel.icon" class="intel-icon"></i>
                  <div class="intel-info">
                    <div class="intel-title">{{ intel.title }}</div>
                    <div class="intel-desc">{{ intel.desc }}</div>
                  </div>
                </div>
              </div>
              <div class="intel-footer">
                <el-button type="text" icon="el-icon-document">生成完整报告</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 异常详情弹窗 -->
    <el-dialog :visible.sync="anomalyDialogVisible" width="500px" :title="anomalyDetail.metric + '详情'" center class="custom-dialog">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <div class="detail-content">
            <div class="detail-item">
              <span class="item-label">指标名称：</span>
              <span class="item-value">{{ anomalyDetail.metric }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">当前值：</span>
              <span class="item-value">{{ anomalyDetail.value }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">阈值：</span>
              <span class="item-value">{{ anomalyDetail.threshold }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">检测时间：</span>
              <span class="item-value">{{ anomalyDetail.time }}</span>
            </div>
            <div class="detail-item">
              <span class="item-label">处理措施：</span>
              <span class="item-value">{{ anomalyDetail.action || '——' }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="治理建议" name="suggest">
          <div class="suggest-content">
            <div class="suggest-item" v-for="(item, idx) in anomalySuggestions" :key="idx">
              <div class="suggest-icon"><i class="el-icon-info"></i></div>
              <div class="suggest-text">{{ item }}</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="anomalyDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleInDialog">处理异常</el-button>
      </span>
    </el-dialog>

    <!-- 规则配置弹窗 -->
    <el-dialog :visible.sync="ruleConfigVisible" width="800px" title="数据质量规则配置" center class="custom-dialog">
      <el-tabs v-model="ruleConfigTab">
        <el-tab-pane label="规则列表" name="rules">
          <div class="rule-toolbar">
            <el-input placeholder="搜索规则" v-model="ruleSearch" size="small" prefix-icon="el-icon-search" class="rule-search" clearable />
            <el-button type="primary" size="small" @click="addRule">新增规则</el-button>
          </div>
          <el-table :data="filteredRules" stripe border :header-cell-style="tableHeaderStyle">
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="metric" label="监控指标" />
            <el-table-column prop="threshold" label="阈值" width="100">
              <template slot-scope="scope">
                {{ scope.row.threshold }}{{ scope.row.unit }}
              </template>
            </el-table-column>
            <el-table-column prop="source" label="数据源" width="120" />
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.active" @change="toggleRule(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button size="mini" @click="editRule(scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" @click="deleteRule(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="监控设置" name="settings">
          <el-form :model="monitorSettings" label-width="120px" class="monitor-form">
            <el-form-item label="监控频率">
              <el-select v-model="monitorSettings.frequency" placeholder="选择监控频率">
                <el-option label="5分钟" value="5min" />
                <el-option label="15分钟" value="15min" />
                <el-option label="30分钟" value="30min" />
                <el-option label="1小时" value="1hour" />
                <el-option label="6小时" value="6hour" />
                <el-option label="12小时" value="12hour" />
                <el-option label="24小时" value="24hour" />
              </el-select>
            </el-form-item>
            <el-form-item label="通知方式">
              <el-checkbox-group v-model="monitorSettings.notifyMethods">
                <el-checkbox label="email">邮件</el-checkbox>
                <el-checkbox label="sms">短信</el-checkbox>
                <el-checkbox label="wechat">微信</el-checkbox>
                <el-checkbox label="system">系统通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="通知级别">
              <el-radio-group v-model="monitorSettings.notifyLevel">
                <el-radio label="all">所有异常</el-radio>
                <el-radio label="critical">仅严重异常</el-radio>
                <el-radio label="none">不通知</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="自动处理">
              <el-switch v-model="monitorSettings.autoFix" />
              <span class="form-tip">启用后系统将自动处理可修复的异常</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ruleConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRuleConfig">保存配置</el-button>
      </span>
    </el-dialog>

    <!-- 规则编辑弹窗 -->
    <el-dialog :visible.sync="ruleEditVisible" width="600px" :title="isNewRule ? '新增规则' : '编辑规则'" center class="custom-dialog">
      <el-form :model="currentRule" label-width="100px" class="rule-form">
        <el-form-item label="规则名称">
          <el-input v-model="currentRule.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="监控指标">
          <el-select v-model="currentRule.metric" placeholder="选择监控指标">
            <el-option label="数据完整性" value="数据完整性" />
            <el-option label="数据准确性" value="数据准确性" />
            <el-option label="数据一致性" value="数据一致性" />
            <el-option label="数据及时性" value="数据及时性" />
            <el-option label="数据可用性" value="数据可用性" />
            <el-option label="元数据完整性" value="元数据完整性" />
            <el-option label="数据标准符合率" value="数据标准符合率" />
            <el-option label="字段唯一性" value="字段唯一性" />
            <el-option label="数据冗余率" value="数据冗余率" />
            <el-option label="数据格式一致性" value="数据格式一致性" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值">
          <el-input-number v-model="currentRule.thresholdValue" :min="0" :max="100" />
          <el-select v-model="currentRule.unit" style="width: 80px; margin-left: 10px;">
            <el-option label="%" value="%" />
            <el-option label="个" value="个" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据源">
          <el-select v-model="currentRule.source" placeholder="选择数据源">
            <el-option label="人口数据" value="人口数据" />
            <el-option label="企业数据" value="企业数据" />
            <el-option label="环境数据" value="环境数据" />
            <el-option label="交通数据" value="交通数据" />
            <el-option label="医疗数据" value="医疗数据" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="currentRule.active" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="ruleEditVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'QualityControl',
  data() {
    // 扩展异常数据，增加更多字段
    const anomalyList = [
      { metric: '数据完整性', value: '85%', threshold: '90%', status: '异常', time: '2025-06-04 09:10', action: '数据源连接异常，已修复。', source: '人口数据' },
      { metric: '数据准确性', value: '92%', threshold: '95%', status: '异常', time: '2025-06-04 08:50', action: '数据校验失败，已重新校验。', source: '企业数据' },
      { metric: '数据一致性', value: '88%', threshold: '90%', status: '异常', time: '2025-06-03 17:30', action: '数据同步延迟，已同步。', source: '环境数据' },
      { metric: '数据及时性', value: '95%', threshold: '95%', status: '正常', time: '2025-06-03 15:20', action: '——', source: '交通数据' },
      { metric: '数据可用性', value: '90%', threshold: '90%', status: '正常', time: '2025-06-03 14:10', action: '——', source: '医疗数据' },
      { metric: '元数据完整性', value: '88%', threshold: '95%', status: '异常', time: '2025-06-03 13:20', action: '——', source: '企业数据' },
      { metric: '数据标准符合率', value: '91%', threshold: '95%', status: '异常', time: '2025-06-03 12:30', action: '——', source: '人口数据' },
      { metric: '字段唯一性', value: '98%', threshold: '99%', status: '异常', time: '2025-06-02 16:40', action: '——', source: '环境数据' },
      { metric: '数据冗余率', value: '3.2%', threshold: '5%', status: '正常', time: '2025-06-02 14:50', action: '——', source: '交通数据' },
      { metric: '数据格式一致性', value: '93%', threshold: '95%', status: '异常', time: '2025-06-02 11:30', action: '——', source: '医疗数据' }
    ]
    
    return {
      search: '',
      qualityCards: [
        { title: '数据完整性', value: '85%', trend: -0.5, type: 'completeness' },
        { title: '数据准确性', value: '92%', trend: 0.2, type: 'accuracy' },
        { title: '数据一致性', value: '88%', trend: -0.3, type: 'consistency' },
        { title: '数据及时性', value: '95%', trend: 0.1, type: 'timeliness' },
        { title: '数据可用性', value: '90%', trend: 0.0, type: 'availability' },
        { title: '综合质量分', value: '90.0', trend: 0.5, type: 'overall' }
      ],
      anomalyList,
      intelCards: [
        { title: '数据质量诊断', desc: '数据完整性指标下降，建议检查数据源连接。', icon: 'el-icon-warning-outline' },
        { title: '治理方向建议', desc: '建议优先提升数据完整性和准确性指标。', icon: 'el-icon-s-opportunity' },
        { title: '趋势分析', desc: '近期数据准确性指标上升，数据质量整体向好。', icon: 'el-icon-data-line' }
      ],
      anomalyDialogVisible: false,
      anomalyDetail: {},
      activeTab: 'basic',
      anomalySuggestions: [
        '检查数据源连接配置，确保连接稳定性',
        '增加数据校验规则，提高数据准确性',
        '优化数据同步频率，减少数据一致性问题',
        '建议配置自动清洗流程，处理异常数据'
      ],
      trendTimeRange: 'week',
      currentPage: 1,
      pageSize: 10,
      overallScore: 90,

      // 规则配置相关数据
      ruleConfigVisible: false,
      ruleConfigTab: 'rules',
      ruleSearch: '',
      rules: [
        { id: 1, name: '人口数据完整性规则', metric: '数据完整性', threshold: '90', unit: '%', source: '人口数据', active: true },
        { id: 2, name: '企业数据准确性规则', metric: '数据准确性', threshold: '95', unit: '%', source: '企业数据', active: true },
        { id: 3, name: '环境数据一致性规则', metric: '数据一致性', threshold: '90', unit: '%', source: '环境数据', active: true },
        { id: 4, name: '交通数据及时性规则', metric: '数据及时性', threshold: '95', unit: '%', source: '交通数据', active: true },
        { id: 5, name: '医疗数据可用性规则', metric: '数据可用性', threshold: '90', unit: '%', source: '医疗数据', active: true },
        { id: 6, name: '企业元数据完整性规则', metric: '元数据完整性', threshold: '95', unit: '%', source: '企业数据', active: true },
        { id: 7, name: '人口数据标准符合率规则', metric: '数据标准符合率', threshold: '95', unit: '%', source: '人口数据', active: true },
        { id: 8, name: '环境数据字段唯一性规则', metric: '字段唯一性', threshold: '99', unit: '%', source: '环境数据', active: true },
        { id: 9, name: '交通数据冗余率规则', metric: '数据冗余率', threshold: '5', unit: '%', source: '交通数据', active: true },
        { id: 10, name: '医疗数据格式一致性规则', metric: '数据格式一致性', threshold: '95', unit: '%', source: '医疗数据', active: true }
      ],
      monitorSettings: {
        frequency: '1hour',
        notifyMethods: ['email', 'system'],
        notifyLevel: 'critical',
        autoFix: false
      },
      ruleEditVisible: false,
      currentRule: {},
      isNewRule: false
    }
  },
  computed: {
    filteredAnomalyList() {
      if (!this.search) return this.anomalyList
      return this.anomalyList.filter(e => 
        e.metric.includes(this.search) || 
        e.source.includes(this.search) ||
        e.status.includes(this.search)
      )
    },
    filteredRules() {
      if (!this.ruleSearch) return this.rules
      return this.rules.filter(r => 
        r.name.includes(this.ruleSearch) || 
        r.metric.includes(this.ruleSearch) || 
        r.source.includes(this.ruleSearch)
      )
    }
  },
  mounted() {
    this.initQualityTrendChart()
    this.initQualityAnomalyChart()
  },
  methods: {
    refresh() {
      this.$message.success('数据已刷新')
    },
    exportData() {
      this.$message.success('导出成功')
    },
    viewAnomaly(row) {
      this.anomalyDetail = row
      this.anomalyDialogVisible = true
    },
    handleAnomaly(row) {
      row.status = '已处理'
      this.$message.success('异常已处理')
    },
    ignoreAnomaly(row) {
      row.status = '已忽略'
      this.$message.info('已忽略该异常')
    },
    handleInDialog() {
      this.handleAnomaly(this.anomalyDetail)
      this.anomalyDialogVisible = false
    },
    trendClass(card) {
      if (card.trend > 0) return 'trend-up'
      if (card.trend < 0) return 'trend-down'
      return 'trend-flat'
    },
    getStatusType(status) {
      if (status === '正常') return 'success'
      if (status === '异常') return 'danger'
      if (status === '已处理') return 'success'
      if (status === '已忽略') return 'info'
      return 'info'
    },
    getCardClass(card) {
      return 'card-' + card.type
    },
    getCardIcon(card) {
      const icons = {
        completeness: 'el-icon-files',
        accuracy: 'el-icon-aim',
        consistency: 'el-icon-connection',
        timeliness: 'el-icon-time',
        availability: 'el-icon-s-platform',
        overall: 'el-icon-s-data'
      }
      return icons[card.type] || 'el-icon-data-analysis'
    },
    autoFixAll() {
      // 自动修正所有异常
      const count = this.anomalyList.filter(item => item.status === '异常').length
      this.anomalyList.forEach(item => {
        if (item.status === '异常') {
          item.status = '已处理'
          item.action = '智能修正系统自动处理'
        }
      })
      this.$message.success(`已自动修正 ${count} 项异常`)
    },
    batchHandle() {
      this.$message.info('批量处理功能')
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    tableHeaderStyle() {
      return {
        'background-color': '#f5f7fa',
        'color': '#606266',
        'font-weight': 'bold'
      }
    },
    initQualityTrendChart() {
      this.$nextTick(()=>{
        const chart = echarts.init(this.$refs.qualityTrendChart)
        chart.setOption({
          tooltip: { trigger: 'axis' },
          legend: { 
            data: ['完整性', '准确性', '一致性', '综合得分'],
            right: 10,
            top: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: { 
            type: 'category', 
            data: ['5-29', '5-30', '5-31', '6-1', '6-2', '6-3', '6-4'],
            axisLine: {
              lineStyle: {
                color: '#dcdfe6'
              }
            }
          },
          yAxis: { 
            type: 'value',
            axisLine: {
              show: false
            },
            splitLine: {
              lineStyle: {
                color: '#ebeef5'
              }
            }
          },
          series: [
            {
              name: '完整性',
              type: 'line',
              smooth: true,
              data: [85, 84, 83, 84, 85, 84, 85],
              itemStyle: { color: '#409EFF' }
            },
            {
              name: '准确性',
              type: 'line',
              smooth: true,
              data: [91, 91, 92, 92, 93, 92, 92],
              itemStyle: { color: '#67C23A' }
            },
            {
              name: '一致性',
              type: 'line',
              smooth: true,
              data: [87, 88, 88, 89, 88, 89, 88],
              itemStyle: { color: '#E6A23C' }
            },
            {
              name: '综合得分',
              type: 'line',
              smooth: true,
              data: [88, 89, 90, 91, 90, 89, 90],
              lineStyle: {
                width: 3,
                type: 'dashed'
              },
              itemStyle: { color: '#F56C6C' }
            }
          ]
        })
      })
    },
    initQualityAnomalyChart() {
      this.$nextTick(()=>{
        const chart = echarts.init(this.$refs.qualityAnomalyChart)
        chart.setOption({
          tooltip: { trigger: 'item' },
          legend: { 
            orient: 'vertical', 
            left: 'left',
            top: 'center'
          },
          series: [
            {
              name: '质量问题分布',
              type: 'pie',
              radius: '70%',
              center: ['60%', '50%'],
              data: [
                { value: 3, name: '数据完整性', itemStyle: { color: '#409EFF' } },
                { value: 2, name: '数据准确性', itemStyle: { color: '#67C23A' } },
                { value: 1, name: '数据一致性', itemStyle: { color: '#E6A23C' } },
                { value: 2, name: '数据标准', itemStyle: { color: '#F56C6C' } },
                { value: 1, name: '其他', itemStyle: { color: '#909399' } }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              label: {
                formatter: '{b}: {d}%'
              }
            }
          ]
        })
      })
    },
    showRuleConfig() {
      this.ruleConfigVisible = true
    },
    saveRuleConfig() {
      this.$message.success('规则配置已保存')
      this.ruleConfigVisible = false
    },
    toggleRule(rule) {
      this.$message.success(`${rule.name}已${rule.active ? '启用' : '禁用'}`)
    },
    addRule() {
      this.isNewRule = true
      this.currentRule = {
        name: '',
        metric: '',
        thresholdValue: 90,
        unit: '%',
        source: '',
        active: true
      }
      this.ruleEditVisible = true
    },
    editRule(rule) {
      this.isNewRule = false
      this.currentRule = {
        id: rule.id,
        name: rule.name,
        metric: rule.metric,
        thresholdValue: parseFloat(rule.threshold),
        unit: rule.unit,
        source: rule.source,
        active: rule.active
      }
      this.ruleEditVisible = true
    },
    deleteRule(rule) {
      this.$confirm('确定要删除该规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.rules = this.rules.filter(r => r.id !== rule.id)
        this.$message.success('规则已删除')
      }).catch(() => {})
    },
    saveRule() {
      if (!this.currentRule.name || !this.currentRule.metric || !this.currentRule.source) {
        this.$message.warning('请填写完整规则信息')
        return
      }
      
      const ruleData = {
        id: this.currentRule.id || this.rules.length + 1,
        name: this.currentRule.name,
        metric: this.currentRule.metric,
        threshold: this.currentRule.thresholdValue.toString(),
        unit: this.currentRule.unit,
        source: this.currentRule.source,
        active: this.currentRule.active
      }
      
      if (this.isNewRule) {
        this.rules.push(ruleData)
        this.$message.success('规则已添加')
      } else {
        const index = this.rules.findIndex(r => r.id === ruleData.id)
        if (index !== -1) {
          this.rules.splice(index, 1, ruleData)
        }
        this.$message.success('规则已更新')
      }
      
      this.ruleEditVisible = false
    }
  }
}
</script>

<style scoped>
.quality-page {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

/* 顶部标题与操作区 */
.quality-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.main-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}
.sub-title {
  margin-top: 4px;
  font-size: 14px;
  color: #909399;
}
.search-input {
  width: 220px;
  margin-right: 12px;
}

/* 统计卡片区 */
.card-section {
  margin-bottom: 20px;
}
.stat-card {
  height: 100px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  align-items: center;
  background: white;
  transition: all 0.3s;
  border-top: 3px solid #dcdfe6;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
.card-completeness { border-top-color: #409EFF; }
.card-accuracy { border-top-color: #67C23A; }
.card-consistency { border-top-color: #E6A23C; }
.card-timeliness { border-top-color: #F56C6C; }
.card-availability { border-top-color: #909399; }
.card-overall { border-top-color: #9254de; }

.stat-icon {
  width: 48px;
  height: 48px;
  background: #f2f6fc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #409EFF;
}
.card-completeness .stat-icon { color: #409EFF; background: #ecf5ff; }
.card-accuracy .stat-icon { color: #67C23A; background: #f0f9eb; }
.card-consistency .stat-icon { color: #E6A23C; background: #fdf6ec; }
.card-timeliness .stat-icon { color: #F56C6C; background: #fef0f0; }
.card-availability .stat-icon { color: #909399; background: #f4f4f5; }
.card-overall .stat-icon { color: #9254de; background: #f9f0ff; }

.stat-content {
  flex: 1;
}
.stat-title {
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
  display: flex;
  align-items: center;
}
.trend-up { color: #67C23A; }
.trend-down { color: #F56C6C; }
.trend-flat { color: #909399; }

/* 图表区域 */
.chart-section {
  margin-bottom: 20px;
}
.chart-card {
  border: none;
  border-radius: 4px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 治理区域 */
.govern-section {
  margin-bottom: 20px;
}
.table-card, .intel-card {
  border: none;
  border-radius: 4px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  padding: 10px 0;
  text-align: right;
}

/* 智能分析卡片 */
.intel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.score-section {
  text-align: center;
  padding: 20px 0;
}
.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #9254de);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto 10px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}
.score-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
}
.score-unit {
  font-size: 14px;
  margin-top: 2px;
}
.score-desc {
  font-size: 14px;
  color: #606266;
}
.intel-divider {
  height: 1px;
  background: #ebeef5;
  margin: 15px 0;
}
.intel-items {
  padding: 0 10px;
}
.intel-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}
.intel-icon {
  margin-right: 10px;
  font-size: 18px;
  color: #F56C6C;
  margin-top: 2px;
}
.intel-info {
  flex: 1;
}
.intel-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}
.intel-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}
.intel-footer {
  text-align: center;
  margin-top: 15px;
}

/* 弹窗样式 */
.custom-dialog >>> .el-dialog__header {
  text-align: center;
  padding: 15px;
  background: #f5f7fa;
}
.detail-content, .suggest-content {
  padding: 10px;
}
.detail-item {
  margin-bottom: 12px;
  display: flex;
}
.item-label {
  width: 90px;
  color: #909399;
}
.item-value {
  flex: 1;
  color: #303133;
}
.suggest-item {
  display: flex;
  margin-bottom: 12px;
}
.suggest-icon {
  color: #409EFF;
  margin-right: 10px;
  font-size: 16px;
}
.suggest-text {
  flex: 1;
  line-height: 1.5;
}

/* 规则配置弹窗样式 */
.rule-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.rule-search {
  width: 220px;
}
.monitor-form {
  padding: 20px;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

/* 规则编辑弹窗样式 */
.rule-form {
  padding: 20px;
}
</style> 