// ===== 实时多模态预警生成器 =====
// 基于 mockData.ts 的数据生成随机预警弹窗
import { mockStudents } from '../data/mockData';

// ── 异常行为模板库 ──────────────────────────────────────
const anomalyPatterns = [
  {
    type: '交互突降',
    message: (name: string, week: number) =>
      `实时多模态捕捉：监测到学生 ${name} 在第 ${week} 周交互行为频次突降 ${(30 + Math.floor(Math.random() * 40))}%，偏离基线 ${Math.floor(Math.random() * 20 + 10)}%，建议重点关注！`,
  },
  {
    type: '情绪焦虑',
    message: (name: string, week: number) =>
      `实时多模态捕捉：学生 ${name} 视频微表情分析检测到焦虑（frustrated）情绪占比升至 ${(35 + Math.floor(Math.random() * 30))}%，专注度降至 ${Math.floor(30 + Math.random() * 25)}%，建议课后沟通！`,
  },
  {
    type: '参与度下降',
    message: (name: string, week: number) =>
      `实时多模态捕捉：学生 ${name} 本周在线学习时长骤减 ${(20 + Math.floor(Math.random() * 30))}%，视频完播率仅 ${Math.floor(30 + Math.random() * 30)}%，可能存在学习动力问题！`,
  },
  {
    type: '讨论区异常',
    message: (name: string, week: number) =>
      `实时多模态捕捉：学生 ${name} 讨论区发言情感得分降至 ${(-0.5 + Math.random() * 0.3).toFixed(2)}，负面关键词出现频率增加 ${(2 + Math.floor(Math.random() * 5))} 倍，建议关注心理状态！`,
  },
  {
    type: '知识断层预警',
    message: (name: string, week: number) =>
      `实时多模态捕捉：学生 ${name} 第 ${week} 周测验得分 ${Math.floor(40 + Math.random() * 25)} 分，低于模块平均 ${(65 + Math.floor(Math.random() * 15))} 分，存在知识掌握断层风险！`,
  },
  {
    type: '长时间离线',
    message: (name: string, week: number) =>
      `实时多模态捕捉：学生 ${name} 已连续 ${(3 + Math.floor(Math.random() * 12))} 小时未登录平台，超出平时活跃时段 ${(2 + Math.floor(Math.random() * 5))} 小时，建议主动联系！`,
  },
  {
    type: '作业迟交',
    message: (name: string, week: number) =>
      `实时多模态捕捉：学生 ${name} 第 ${week} 周作业提交时间较截止期晚 ${(1 + Math.floor(Math.random() * 48))} 小时，且提交质量评分偏低，建议了解原因！`,
  },
  {
    type: '模态不一致',
    message: (name: string, week: number) =>
      `实时多模态捕捉：学生 ${name} 多模态一致性评分仅 ${Math.floor(30 + Math.random() * 30)}%，视频专注度高但交互频次低，行为模式异常，建议深入分析！`,
  },
];

// ── 告警级别 ────────────────────────────────────────────
const severityLevels = ['low', 'medium', 'high'] as const;

export interface RealtimeAlert {
  studentName: string;
  studentId: string;
  week: number;
  severity: typeof severityLevels[number];
  message: string;
  timestamp: string;
}

/**
 * 生成一条随机实时预警
 */
export function generateRandomAlert(): RealtimeAlert {
  const student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
  const pattern = anomalyPatterns[Math.floor(Math.random() * anomalyPatterns.length)];
  const week = Math.floor(Math.random() * 16) + 1;
  const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];

  return {
    studentName: student.name,
    studentId: student.id,
    week,
    severity,
    message: pattern.message(student.name, week),
    timestamp: new Date().toISOString(),
  };
}
