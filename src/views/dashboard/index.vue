<template>
  <div class="dashboard-container">
    <!-- 公告栏 -->
    <el-alert
      class="dashboard-announcement"
      title="【平台公告】太白湖新区大数据平台将于本周六凌晨进行系统维护，届时部分功能可能受影响，请提前做好准备。"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />

    <!-- 平台简介 -->
    <el-card class="intro-card" :body-style="{ padding: '20px' }">
      <div class="intro-header">
        <h2>太白湖一体化大数据平台</h2>
<!--        <p class="intro-desc">实现全域数据的"通、治、存、管、用"，打造全县统一的大数据体系，支撑太白湖"领导驾驶舱、一网通办、一网统管"全场景业务应用</p>-->
        <div class="intro-stats">
          <div class="stat-item">
            <span class="label">数据总量</span>
            <span class="value">1.2TB</span>
          </div>
          <div class="stat-item">
            <span class="label">接入系统</span>
            <span class="value">10个</span>
          </div>
          <div class="stat-item">
            <span class="label">覆盖部门</span>
            <span class="value">14个</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 刷新按钮 -->
    <div class="refresh-bar">
      <el-button type="primary" icon="el-icon-refresh" size="small" @click="refreshData" :loading="loading">
        刷新数据
      </el-button>
      <span class="last-update">最后更新：{{ lastUpdateTime }}</span>
    </div>

    <!-- 核心指标 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6" v-for="(item, index) in coreMetrics" :key="index">
        <el-card shadow="hover" class="dashboard-card" :body-style="{ padding: '20px' }" @click.native="handleMetricClick(item)">
          <div class="card-header">
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
          </div>
          <div class="card-body">
            <div class="card-value">{{ item.value }}</div>
            <div class="card-footer">
              <span>{{ item.compare }}</span>
              <span :class="item.trend > 0 ? 'up' : item.trend < 0 ? 'down' : ''">
                {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}{{ item.unit }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 业务指标 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6" v-for="(item, index) in businessMetrics" :key="index">
        <el-card shadow="hover" class="dashboard-card" :body-style="{ padding: '20px' }" @click.native="handleMetricClick(item)">
          <div class="card-header">
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
          </div>
          <div class="card-body">
            <div class="card-value">{{ item.value }}</div>
            <div class="card-footer">
              <span>{{ item.label }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>系统运行趋势</span>
            <div class="header-right">
              <el-select v-model="trendBizType" size="small" style="width: 120px; margin-right: 10px;" @change="updateTrendChart">
                <el-option label="系统运行" value="system"></el-option>
                <el-option label="API调用" value="api"></el-option>
                <el-option label="数据接入" value="access"></el-option>
              </el-select>
              <el-radio-group v-model="trendTimeRange" size="small" @change="updateTrendChart">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
              <el-tooltip content="点击图表可查看详细数据" placement="top">
                <i class="el-icon-info"></i>
              </el-tooltip>
            </div>
          </div>
          <div ref="trendChart" style="height: 350px" @click="showTrendDetail"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>告警分布</span>
            <el-radio-group v-model="alarmTimeRange" size="small" style="margin-left: 10px;" @change="updateAlarmChart">
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
            <el-tooltip content="鼠标悬停可查看详细数据" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div ref="alarmChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时动态区块 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="realtime-card">
          <div slot="header" class="clearfix">
            <span>实时动态</span>
            <el-button type="text" style="float: right;" @click="refreshRealtime">手动刷新</el-button>
          </div>
          <el-timeline style="max-height: 220px; overflow-y: auto;">
            <el-timeline-item
              v-for="(item, idx) in realtimeList"
              :key="idx"
              :timestamp="item.time"
              :color="item.color"
            >
              <span>{{ item.content }}</span>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>最近告警</span>
            <el-button style="float: right; padding: 3px 0; color: #409EFF;" type="text" @click="viewAllAlarms">查看全部</el-button>
            <el-button style="float: right; padding: 3px 0; margin-right: 10px;" type="text" @click="refreshAlarms">刷新</el-button>
          </div>
          <el-table 
            :data="recentAlarms" 
            style="width: 100%" 
            :max-height="300"
            v-loading="loading"
            element-loading-text="加载中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.8)"
            row-class-name="dashboard-table-row"
          >
            <el-table-column prop="time" label="时间" width="160"></el-table-column>
            <el-table-column prop="type" label="类型" width="110">
              <template slot-scope="scope">
                <el-tag :type="getAlarmType(scope.row.type)" effect="plain">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)" effect="plain">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>待处理任务</span>
            <el-button style="float: right; padding: 3px 0; color: #409EFF;" type="text" @click="viewAllTasks">查看全部</el-button>
            <el-button style="float: right; padding: 3px 0; margin-right: 10px;" type="text" @click="refreshTasks">刷新</el-button>
          </div>
          <el-table 
            :data="pendingTasks" 
            style="width: 100%" 
            :max-height="300"
            v-loading="loading"
            element-loading-text="加载中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.8)"
            row-class-name="dashboard-table-row"
          >
            <el-table-column prop="name" label="任务名称" width="160"></el-table-column>
            <el-table-column prop="type" label="类型" width="110">
              <template slot-scope="scope">
                <el-tag :type="getTaskType(scope.row.type)" effect="plain">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="deadline" label="截止时间" width="160"></el-table-column>
            <el-table-column prop="priority" label="优先级" width="80">
              <template slot-scope="scope">
                <el-tag :type="getPriorityType(scope.row.priority)" effect="plain">{{ scope.row.priority }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图详情对话框 -->
    <el-dialog
      title="系统运行趋势详情"
      :visible.sync="trendDetailVisible"
      width="80%"
      :before-close="handleTrendDetailClose"
    >
      <div ref="trendDetailChart" style="height: 400px"></div>
      <div class="trend-detail-stats">
        <div class="stat-item" v-for="(item, index) in trendDetailStats" :key="index">
          <span class="label">{{ item.label }}</span>
          <span class="value">{{ item.value }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    const today = new Date();
    // 最近告警
    const types = ['系统告警', '业务告警', '安全告警', '性能告警', '其他告警'];
    const contents = ['数据库连接异常', 'API响应超时', '磁盘空间不足', '数据标准不一致', '异常登录尝试', '数据同步延迟', 'CPU使用率过高', '内存泄漏预警'];
    const statuses = ['未处理', '处理中', '已处理'];
    const recentAlarms = Array.from({ length: 6 }).map((_, i) => {
      const t = new Date(today.getTime() - i * 15 * 60000);
      const dateStr = t.toISOString().slice(0, 10);
      const timeStr = t.toTimeString().substr(0, 8);
      return {
        time: `${dateStr} ${timeStr}`,
        type: types[Math.floor(Math.random() * types.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      }
    });
    // 待处理任务
    const taskTypes = ['日常任务', '维护任务', '安全任务', '融合任务', '标准任务', '录入任务'];
    const taskNames = ['数据质量检查', '系统维护', '安全审计', '数据融合处理', '标准文档更新', '元数据录入', 'API接口测试', '数据修正'];
    const priorities = ['高', '中', '低'];
    const pendingTasks = Array.from({ length: 6 }).map((_, i) => {
      const t = new Date(today.getTime() + (i + 1) * 12 * 3600 * 1000);
      const dateStr = t.toISOString().slice(0, 10);
      const timeStr = t.toTimeString().substr(0, 8);
      return {
        name: taskNames[Math.floor(Math.random() * taskNames.length)],
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        deadline: `${dateStr} ${timeStr}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)]
      }
    });
    return {
      loading: false,
      lastUpdateTime: new Date().toLocaleString(),
      timer: null,
      trendTimeRange: 'day',
      trendDetailVisible: false,
      trendBizType: 'system',
      alarmTimeRange: 'today',
      announcement: '【平台公告】太白湖新区大数据平台将于本周六凌晨进行系统维护，届时部分功能可能受影响，请提前做好准备。',
      realtimeList: [
        { time: '10:30:12', content: '新接入数据源"人口库"', color: '#409EFF' },
        { time: '10:29:50', content: 'API调用"getUserInfo"成功', color: '#67C23A' },
        { time: '10:29:20', content: '数据修正任务完成，修正率99.2%', color: '#E6A23C' },
        { time: '10:28:55', content: '应急事件"道路积水"已处理', color: '#F56C6C' },
        { time: '10:28:30', content: '新接入数据源"企业库"', color: '#409EFF' }
      ],
      realtimeTimer: null,
      coreMetrics: [
        {
          title: '告警总数',
          value: '12',
          icon: 'el-icon-warning',
          compare: '较昨日',
          trend: 2,
          unit: ''
        },
        {
          title: '应急事件',
          value: '3',
          icon: 'el-icon-s-opportunity',
          compare: '较昨日',
          trend: -1,
          unit: ''
        },
        {
          title: '数据质量',
          value: '98.5%',
          icon: 'el-icon-s-data',
          compare: '较昨日',
          trend: 0.5,
          unit: '%'
        },
        {
          title: '设施状态',
          value: '96.8%',
          icon: 'el-icon-s-platform',
          compare: '较昨日',
          trend: 1.2,
          unit: '%'
        }
      ],
      businessMetrics: [
        {
          title: '一网通办',
          value: '98.2%',
          icon: 'el-icon-s-claim',
          label: '办结率'
        },
        {
          title: '一网统管',
          value: '95.5%',
          icon: 'el-icon-s-management',
          label: '覆盖率'
        },
        {
          title: '数据标准',
          value: '98%',
          icon: 'el-icon-s-marketing',
          label: '符合率'
        },
        {
          title: '数据融合',
          value: '95%',
          icon: 'el-icon-s-cooperation',
          label: '成功率'
        }
      ],
      recentAlarms,
      pendingTasks,
      trendDetailStats: [
        { label: '平均CPU使用率', value: '65%' },
        { label: '平均内存使用率', value: '70%' },
        { label: '平均磁盘使用率', value: '78%' },
        { label: '峰值时间', value: '12:00' }
      ],
      trendChartData: {
        system: {
          day: {
            legend: ['CPU使用率', '内存使用率', '磁盘使用率'],
            x: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            y: [
              [45, 52, 48, 65, 75, 70, 60, 55],
              [60, 65, 58, 70, 80, 75, 65, 60],
              [75, 78, 76, 80, 82, 80, 78, 75]
            ]
          },
          week: {
            legend: ['CPU使用率', '内存使用率', '磁盘使用率'],
            x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            y: [
              [55, 60, 62, 65, 70, 68, 66],
              [65, 68, 70, 72, 75, 73, 70],
              [78, 80, 81, 82, 83, 82, 80]
            ]
          },
          month: {
            legend: ['CPU使用率', '内存使用率', '磁盘使用率'],
            x: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
            y: [
              [50, 55, 60, 65, 70, 68, 66],
              [60, 65, 70, 75, 80, 78, 75],
              [75, 78, 80, 82, 85, 83, 80]
            ]
          }
        },
        api: {
          day: {
            legend: ['API调用量', '成功率'],
            x: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            y: [
              [120, 150, 180, 200, 220, 210, 190, 170],
              [98, 97, 99, 98, 99, 97, 98, 99]
            ]
          },
          week: {
            legend: ['API调用量', '成功率'],
            x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            y: [
              [800, 900, 950, 1000, 1100, 1050, 980],
              [98, 98, 99, 97, 98, 97, 98]
            ]
          },
          month: {
            legend: ['API调用量', '成功率'],
            x: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
            y: [
              [3000, 3500, 4000, 4200, 4500, 4300, 4100],
              [98, 98, 99, 98, 99, 97, 98]
            ]
          }
        },
        access: {
          day: {
            legend: ['数据接入量'],
            x: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            y: [
              [20, 25, 30, 35, 40, 38, 36, 32]
            ]
          },
          week: {
            legend: ['数据接入量'],
            x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            y: [
              [120, 130, 140, 150, 160, 155, 148]
            ]
          },
          month: {
            legend: ['数据接入量'],
            x: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
            y: [
              [500, 600, 700, 800, 900, 850, 820]
            ]
          }
        }
      },
      alarmChartData: {
        today: [
          { value: 10, name: '系统告警' },
          { value: 8, name: '业务告警' },
          { value: 6, name: '安全告警' },
          { value: 4, name: '性能告警' },
          { value: 2, name: '其他告警' }
        ],
        week: [
          { value: 35, name: '系统告警' },
          { value: 25, name: '业务告警' },
          { value: 20, name: '安全告警' },
          { value: 15, name: '性能告警' },
          { value: 5, name: '其他告警' }
        ],
        month: [
          { value: 120, name: '系统告警' },
          { value: 90, name: '业务告警' },
          { value: 60, name: '安全告警' },
          { value: 40, name: '性能告警' },
          { value: 20, name: '其他告警' }
        ]
      }
    }
  },
  mounted() {
    this.initCharts()
    // 启动定时器，每秒更新时间
    this.timer = setInterval(() => {
      this.lastUpdateTime = new Date().toLocaleString();
    }, 1000);
    // 启动实时动态模拟
    this.realtimeTimer = setInterval(this.pushRealtime, 4000);
  },
  beforeDestroy() {
    // 组件销毁时清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.realtimeTimer) {
      clearInterval(this.realtimeTimer);
    }
  },
  methods: {
    refreshData() {
      this.loading = true
      // 模拟数据刷新
      setTimeout(() => {
        this.loading = false
        this.lastUpdateTime = new Date().toLocaleString()
        this.$message.success('数据刷新成功')
        this.updateTrendChart()
        this.updateAlarmChart()
      }, 1000)
    },
    initCharts() {
      this.updateTrendChart()
      this.updateAlarmChart()
      // 监听窗口大小变化，重绘图表
      window.addEventListener('resize', () => {
        this.$echarts.init(this.$refs.trendChart).resize()
        this.$echarts.init(this.$refs.alarmChart).resize()
      })
    },
    updateTrendChart() {
      // 根据业务维度和时间范围更新趋势图数据
      const chart = this.$echarts.init(this.$refs.trendChart)
      const { legend, x, y } = this.trendChartData[this.trendBizType][this.trendTimeRange]
      const series = legend.map((name, idx) => ({
        name,
        type: 'line',
        smooth: true,
        data: y[idx],
        areaStyle: { opacity: 0.1 },
        emphasis: { focus: 'series' }
      }))
      // 优化标题
      let mainTitle = ''
      if (this.trendBizType === 'system') mainTitle = '系统运行趋势'
      else if (this.trendBizType === 'api') mainTitle = 'API调用趋势'
      else if (this.trendBizType === 'access') mainTitle = '数据接入趋势'
      chart.setOption({
        title: {
          text: '',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } }
        },
        legend: { data: legend },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: x },
        yAxis: { type: 'value', axisLabel: { formatter: '{value}' } },
        series
      })
    },
    updateAlarmChart() {
      // 根据时间范围更新告警分布数据
      const chart = this.$echarts.init(this.$refs.alarmChart)
      chart.setOption({
        title: {
          text: '告警分布',
          left: 'center',
          top: 10,
          textStyle: { fontSize: 16 }
        },
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
        legend: {
          orient: 'horizontal',
          left: 'center',
          top: 'bottom',
          data: ['系统告警', '业务告警', '安全告警', '性能告警', '其他告警']
        },
        series: [
          {
            name: '告警类型',
            type: 'pie',
            radius: ['50%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: '20', fontWeight: 'bold' } },
            labelLine: { show: false },
            data: this.alarmChartData[this.alarmTimeRange]
          }
        ]
      })
    },
    showTrendDetail() {
      this.trendDetailVisible = true
      this.$nextTick(() => {
        const detailChart = this.$echarts.init(this.$refs.trendDetailChart)
        // 设置更详细的趋势图数据
        detailChart.setOption({
          // ... 详细的图表配置
        })
      })
    },
    handleTrendDetailClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    viewAllAlarms() {
      this.$message.info('查看全部告警')
    },
    viewAllTasks() {
      this.$message.info('查看全部任务')
    },
    getAlarmType(type) {
      const types = {
        '系统告警': 'danger',
        '业务告警': 'warning',
        '安全告警': 'info'
      }
      return types[type] || 'info'
    },
    getStatusType(status) {
      const types = {
        '未处理': 'danger',
        '处理中': 'warning',
        '已处理': 'success'
      }
      return types[status] || 'info'
    },
    getTaskType(type) {
      const types = {
        '日常任务': 'primary',
        '维护任务': 'success',
        '安全任务': 'warning'
      }
      return types[type] || 'info'
    },
    getPriorityType(priority) {
      const types = {
        '高': 'danger',
        '中': 'warning',
        '低': 'info'
      }
      return types[priority] || 'info'
    },
    handleMetricClick(item) {
      // 模拟跳转到业务模块
      this.$message({
        message: `跳转到"${item.title || item.label}"业务模块（模拟）`,
        type: 'info'
      });
      // 实际可用 this.$router.push(...) 跳转
    },
    pushRealtime() {
      // 随机生成一条实时动态
      const now = new Date();
      const time = now.toTimeString().substr(0, 8);
      const types = [
        { content: '新接入数据源"人口库"', color: '#409EFF' },
        { content: 'API调用"getUserInfo"成功', color: '#67C23A' },
        { content: '数据修正任务完成，修正率99.2%', color: '#E6A23C' },
        { content: '应急事件"道路积水"已处理', color: '#F56C6C' },
        { content: '新接入数据源"企业库"', color: '#409EFF' },
        { content: 'API调用"updateData"失败', color: '#F56C6C' },
        { content: '数据标准文档已更新', color: '#909399' },
        { content: '元数据录入完成', color: '#67C23A' }
      ];
      const idx = Math.floor(Math.random() * types.length);
      this.realtimeList.unshift({ time, ...types[idx] });
      if (this.realtimeList.length > 10) this.realtimeList.pop();
    },
    refreshRealtime() {
      this.pushRealtime();
      this.$message.success('实时动态已刷新');
    },
    refreshAlarms() {
      // 随机生成模拟告警数据，日期为今天
      const types = ['系统告警', '业务告警', '安全告警', '性能告警', '其他告警']
      const contents = ['数据库连接异常', 'API响应超时', '磁盘空间不足', '数据标准不一致', '异常登录尝试', '数据同步延迟', 'CPU使用率过高', '内存泄漏预警']
      const statuses = ['未处理', '处理中', '已处理']
      const today = new Date()
      this.recentAlarms = Array.from({ length: 6 }).map((_, i) => {
        const t = new Date(today.getTime() - i * 15 * 60000)
        const dateStr = t.toISOString().slice(0, 10)
        const timeStr = t.toTimeString().substr(0, 8)
        return {
          time: `${dateStr} ${timeStr}`,
          type: types[Math.floor(Math.random() * types.length)],
          content: contents[Math.floor(Math.random() * contents.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        }
      })
      this.$message.success('告警数据已刷新')
    },
    refreshTasks() {
      // 随机生成模拟任务数据，日期为今天或未来
      const types = ['日常任务', '维护任务', '安全任务', '融合任务', '标准任务', '录入任务']
      const names = ['数据质量检查', '系统维护', '安全审计', '数据融合处理', '标准文档更新', '元数据录入', 'API接口测试', '数据修正']
      const priorities = ['高', '中', '低']
      const today = new Date()
      this.pendingTasks = Array.from({ length: 6 }).map((_, i) => {
        const t = new Date(today.getTime() + (i + 1) * 12 * 3600 * 1000)
        const dateStr = t.toISOString().slice(0, 10)
        const timeStr = t.toTimeString().substr(0, 8)
        return {
          name: names[Math.floor(Math.random() * names.length)],
          type: types[Math.floor(Math.random() * types.length)],
          deadline: `${dateStr} ${timeStr}`,
          priority: priorities[Math.floor(Math.random() * priorities.length)]
        }
      })
      this.$message.success('任务数据已刷新')
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.intro-card {
  margin-bottom: 20px;
  
  .intro-header {
    text-align: center;
    
    h2 {
      margin: 0 0 10px;
      font-size: 24px;
      color: #303133;
    }
    
    .intro-desc {
      margin: 0 0 20px;
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }

    .intro-stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 20px;

      .stat-item {
        text-align: center;

        .label {
          display: block;
          font-size: 14px;
          color: #909399;
          margin-bottom: 5px;
        }

        .value {
          font-size: 20px;
          font-weight: bold;
          color: #303133;
        }
      }
    }
  }
}

.refresh-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;

  .last-update {
    font-size: 14px;
    color: #909399;
  }
}

.dashboard-card {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }

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
  
  .el-card__header {
    padding: 15px 20px;

    .header-right {
      float: right;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}

.trend-detail-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;

  .stat-item {
    text-align: center;

    .label {
      display: block;
      font-size: 14px;
      color: #909399;
      margin-bottom: 5px;
    }

    .value {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
    }
  }
}

.dashboard-announcement {
  margin-bottom: 20px;
}

.realtime-card {
  .el-card__header {
    padding: 15px 20px;
  }
  .el-timeline {
    margin-top: 10px;
  }
}

.dashboard-table-row {
  font-size: 15px;
  height: 48px;
}
</style> 