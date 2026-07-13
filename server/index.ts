// ===== 服务器入口 =====
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入数据
import {
  courseInfo, students, getAllLearningRecords,
  generateVitalityScores, generateSuggestions, generateAlerts,
  getDataQualityMetrics,
} from './data/mockData.js';
import {
  computeCourseState, computeVitalityScore, getWeeklyAggregates,
  aggregateByModuleWeek,
} from './data/fusionEngine.js';

const app = express();
app.use(cors());
app.use(express.json());

// ===== API 路由 =====

// 课程基本信息
app.get('/api/course', (_req, res) => {
  res.json(courseInfo);
});

// 学生列表
app.get('/api/students', (_req, res) => {
  res.json(students);
});

// 所有学习记录
app.get('/api/records', (req, res) => {
  const { type, week, moduleId, studentId } = req.query;
  let records = getAllLearningRecords();

  if (type) records = records.filter(r => r.type === type);
  if (week) records = records.filter(r => r.week === Number(week));
  if (moduleId) records = records.filter(r => r.moduleId === moduleId);
  if (studentId) records = records.filter(r => r.studentId === studentId);

  res.json(records);
});

// 数据质量指标
app.get('/api/data-quality', (_req, res) => {
  const records = getAllLearningRecords();
  res.json(getDataQualityMetrics(records));
});

// 周聚合数据
app.get('/api/weekly-aggregates', (_req, res) => {
  const records = getAllLearningRecords();
  res.json(getWeeklyAggregates(records));
});

// 课程状态（按模块和周）
app.get('/api/course-state/:moduleId/:week', (req, res) => {
  const { moduleId, week } = req.params;
  const records = getAllLearningRecords();
  const state = computeCourseState(records, moduleId, Number(week));

  // 填充模块名称
  const module = courseInfo.modules.find((m: any) => m.id === moduleId);
  if (module) state.moduleName = module.name;

  res.json(state);
});

// 生命力评分
app.get('/api/vitality', (_req, res) => {
  const records = getAllLearningRecords();
  const scores = generateVitalityScores();
  res.json(scores);
});

// 单周生命力（基于实时数据计算）
app.get('/api/vitality/week/:week', (req, res) => {
  const { week } = req.params;
  const records = getAllLearningRecords();
  const prevWeek = Number(week) > 1 ? Number(week) - 1 : 1;
  const prevRecords = records.filter(r => r.week === prevWeek);
  const prevScore = prevRecords.length > 0
    ? computeVitalityScore(prevRecords, prevWeek)
    : undefined as any;
  const score = computeVitalityScore(records, Number(week), prevScore);
  res.json(score);
});

// AI优化建议
app.get('/api/suggestions', (_req, res) => {
  res.json(generateSuggestions());
});

// 提交教师决策
app.post('/api/suggestions/:id/decision', (req, res) => {
  const { id } = req.params;
  const { status, teacherDecision } = req.body;

  if (!['accepted', 'rejected', 'modified'].includes(status)) {
    return res.status(400).json({ error: '无效的状态值' });
  }

  res.json({
    success: true,
    suggestionId: id,
    status,
    teacherDecision,
    message: '决策已记录',
  });
});

// 诊断告警
app.get('/api/alerts', (_req, res) => {
  res.json(generateAlerts());
});

// 按模块获取聚合数据
app.get('/api/module/:moduleId/week/:week', (req, res) => {
  const { moduleId, week } = req.params;
  const records = getAllLearningRecords();
  const agg = aggregateByModuleWeek(records, moduleId, Number(week));
  res.json(agg);
});

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 静态文件服务（生产环境）
const staticPath = path.join(__dirname, '../dist');
app.use(express.static(staticPath));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
