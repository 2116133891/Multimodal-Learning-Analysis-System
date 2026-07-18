// ===== AI API 扩展服务 =====
// 1. 智能排课建议 — 基于多模态数据分析的最优排课方案
// 2. 教学资源推荐 — 基于课程画像的资源智能匹配
// 3. 课堂行为预测 — 基于时序数据的未来趋势预测

// ── 环境变量读取 ─────────────────────────────────────────
function getEnvVar(key: string): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return ((import.meta as any).env as Record<string, string>)?.[key] || '';
  }
  return process.env[key] || '';
}

const RAW_API_KEY = getEnvVar('VITE_AI_API_KEY');
const RAW_BASE_URL = getEnvVar('VITE_AI_BASE_URL') || 'https://api.openai.com';

function buildApiUrl(baseUrl: string): string {
  const clean = baseUrl.replace(/\/+$/, '');
  if (clean.endsWith('/chat/completions')) return clean;
  if (clean.includes('/v1')) return `${clean}/chat/completions`;
  return `${clean}/v1/chat/completions`;
}

const API_URL = buildApiUrl(RAW_BASE_URL);

// ═══════════════════════════════════════════════════════════
//  1. 智能排课建议
// ═══════════════════════════════════════════════════════════

export interface ScheduleRecommendation {
  week: number;
  recommendedTime: string;
  recommendedDuration: number; // 分钟
  suggestedMethods: string[];
  rationale: string;
  confidence: number; // 0-1
  dataEvidence: string[];
}

export async function getSmartScheduleRecommendations(
  courseData: {
    vitalityScores: any[];
    alerts: any[];
    suggestions: any[];
    courseProfiles: any[];
  }
): Promise<ScheduleRecommendation[]> {
  const systemPrompt = `你是一位资深的课程排课优化专家。基于多模态数据分析，为高校课程提供智能排课建议。

请根据以下数据，分析每个教学模块的最佳排课方案：
- 课程生命力评分趋势
- 诊断告警
- AI优化建议
- 课程画像快照

输出格式为 JSON 数组，每个元素包含：
{
  "week": 周次,
  "recommendedTime": "建议时间段（如：周二上午第3-4节）",
  "recommendedDuration": 建议课时长度（分钟），
  "suggestedMethods": ["建议的教学方法"],
  "rationale": "排课理由",
  "confidence": 置信度（0-1）,
  "dataEvidence": ["数据依据"]
}`;

  const userMessage = `## 课程多模态数据摘要

### 生命力评分趋势（前8周 vs 后8周）
- 期初综合: ${courseData.vitalityScores[0]?.overall || 0}
- 期末综合: ${courseData.vitalityScores[courseData.vitalityScores.length - 1]?.overall || 0}
- 最低周: 第${courseData.vitalityScores.reduce((min, v) => v.overall < (min?.overall || 100) ? v : min, courseData.vitalityScores[0])?.week || '-'}周 (${courseData.vitalityScores.reduce((min, v) => v.overall < (min?.overall || 100) ? v : min, courseData.vitalityScores[0])?.overall || 0})

### 告警统计
- 总数: ${courseData.alerts.length}
- 严重: ${courseData.alerts.filter((a: any) => a.severity === 'high').length}

### 已采纳建议
- 总数: ${courseData.suggestions.filter((s: any) => s.status === 'accepted').length}

请基于以上数据分析并给出每模块的排课建议。`;

  return callAI(systemPrompt, userMessage).then(parseScheduleResponse);
}

// ═══════════════════════════════════════════════════════════
//  2. 教学资源推荐
// ═══════════════════════════════════════════════════════════

export interface ResourceRecommendation {
  moduleId: string;
  resourceName: string;
  resourceType: 'video' | 'article' | 'exercise' | 'case' | 'interactive';
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  estimatedImpact: number; // 0-100
}

export async function getResourceRecommendations(
  courseData: {
    courseProfiles: any[];
    alerts: any[];
    suggestions: any[];
  }
): Promise<ResourceRecommendation[]> {
  const systemPrompt = `你是一位教学资源推荐专家。基于课程画像数据，为教师推荐最需要的教学资源。

输出格式为 JSON 数组，每个元素包含：
{
  "moduleId": "模块ID",
  "resourceName": "推荐资源名称",
  "resourceType": "video/article/exercise/case/interactive",
  "priority": "high/medium/low",
  "rationale": "推荐理由",
  "estimatedImpact": 预估影响分（0-100）
}`;

  const latestProfile = courseData.courseProfiles[courseData.courseProfiles.length - 1];
  const userMessage = `## 当前课程画像快照
- 综合健康度: ${latestProfile?.overallHealth || 0}/100
- 健康等级: ${latestProfile?.healthGrade || 'N/A'}
- 风险标签: ${(latestProfile?.riskFlags || []).join('、') || '无'}

## 告警信息
${JSON.stringify(courseData.alerts.slice(0, 5), null, 2)}

## 待处理建议
${JSON.stringify(courseData.suggestions.filter((s: any) => s.status === 'pending').slice(0, 3), null, 2)}

请推荐最急需的教学资源。`;

  return callAI(systemPrompt, userMessage).then(parseResourceResponse);
}

// ═══════════════════════════════════════════════════════════
//  3. 课堂行为预测
// ═══════════════════════════════════════════════════════════

export interface BehaviorPrediction {
  week: number;
  predictedEngagement: number; // 0-100
  riskOfDecline: boolean;
  predictedIssues: string[];
  earlyWarningSignals: string[];
  confidence: number;
}

export async function predictClassroomBehavior(
  courseData: {
    vitalityScores: any[];
    courseProfiles: any[];
    multimodalFeatures: any[];
  }
): Promise<BehaviorPrediction[]> {
  const systemPrompt = `你是一位课堂行为预测专家。基于历史多模态数据趋势，预测未来几周的课程状态。

使用时间序列分析和模式识别，预测每门课程的：
- 综合投入度
- 是否出现下降风险
- 可能的预警问题
- 早期预警信号

输出格式为 JSON 数组。`;

  const latestScores = courseData.vitalityScores.slice(-4);
  const userMessage = `## 最近4周生命力评分
${JSON.stringify(latestScores, null, 2)}

## 最近4周课程画像
${JSON.stringify(courseData.courseProfiles.slice(-4).map(p => ({ week: p.week, health: p.overallHealth, grade: p.healthGrade, risks: p.riskFlags })), null, 2)}

请预测未来4周（第${courseData.vitalityScores.length + 1}周到第${courseData.vitalityScores.length + 4}周）的趋势。`;

  return callAI(systemPrompt, userMessage).then(parsePredictionResponse);
}

// ═══════════════════════════════════════════════════════════
//  通用 AI 调用
// ═══════════════════════════════════════════════════════════

async function callAI(systemPrompt: string, userMessage: string): Promise<any> {
  const apiKey = RAW_API_KEY?.trim();
  if (!apiKey) {
    // 未配置 API，返回模拟数据
    return generateMockAIData();
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || '';

    // 尝试解析 JSON 响应
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  } catch {
    return generateMockAIData();
  }
}

function generateMockAIData(): any[] {
  // 降级：返回合理的模拟数据
  return [
    { week: 17, predictedEngagement: 82, riskOfDecline: false, predictedIssues: [], earlyWarningSignals: [], confidence: 0.85 },
    { week: 18, predictedEngagement: 84, riskOfDecline: false, predictedIssues: [], earlyWarningSignals: [], confidence: 0.78 },
    { week: 19, predictedEngagement: 79, riskOfDecline: true, predictedIssues: ['期末倦怠期可能出现'], earlyWarningSignals: ['参与度开始波动'], confidence: 0.72 },
    { week: 20, predictedEngagement: 75, riskOfDecline: true, predictedIssues: ['期末考核压力增大'], earlyWarningSignals: ['互动频次下降'], confidence: 0.65 },
  ];
}

function parseScheduleResponse(data: any): ScheduleRecommendation[] {
  return data || [
    { week: 5, recommendedTime: '周二上午第3-4节', recommendedDuration: 90, suggestedMethods: ['案例教学', '小组讨论'], rationale: '第5周为造型与构图模块起始，学生需要充分的实践时间', confidence: 0.82, dataEvidence: ['第4周末期参与度下降至62分'] },
    { week: 10, recommendedTime: '周四下午第5-6节', recommendedDuration: 90, suggestedMethods: ['翻转课堂', '项目驱动'], rationale: '风格探索模块需要更灵活的课堂组织形式', confidence: 0.78, dataEvidence: ['讨论区风格探索话题增长40%'] },
  ];
}

function parseResourceResponse(data: any): ResourceRecommendation[] {
  return data || [
    { moduleId: 'm2', resourceName: '透视基础微课视频系列', resourceType: 'video', priority: 'high', rationale: '第6周造型模块学生困惑表情占比高', estimatedImpact: 85 },
    { moduleId: 'm3', resourceName: '后印象派艺术家案例库', resourceType: 'case', priority: 'high', rationale: '第10周预习数据异常，完播率骤降', estimatedImpact: 80 },
    { moduleId: 'm1', resourceName: '色彩搭配互动练习工具', resourceType: 'interactive', priority: 'medium', rationale: '基础模块需要更多实践资源', estimatedImpact: 65 },
  ];
}

function parsePredictionResponse(data: any): BehaviorPrediction[] {
  return data || [
    { week: 17, predictedEngagement: 82, riskOfDecline: false, predictedIssues: [], earlyWarningSignals: [], confidence: 0.85 },
    { week: 18, predictedEngagement: 84, riskOfDecline: false, predictedIssues: [], earlyWarningSignals: [], confidence: 0.78 },
    { week: 19, predictedEngagement: 79, riskOfDecline: true, predictedIssues: ['期末倦怠期可能出现'], earlyWarningSignals: ['参与度开始波动'], confidence: 0.72 },
    { week: 20, predictedEngagement: 75, riskOfDecline: true, predictedIssues: ['期末考核压力增大'], earlyWarningSignals: ['互动频次下降'], confidence: 0.65 },
  ];
}
