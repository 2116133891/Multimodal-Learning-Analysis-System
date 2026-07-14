// ===== 全局实时多模态预警定时器 =====
import { useEffect, useCallback } from 'react';
import { useToast } from './ToastManager';
import { generateRandomAlert } from '../utils/realtimeAlerts';

export default function RealtimeAlertTimer() {
  const { addToast } = useToast();

  const triggerRandomAlert = useCallback(() => {
    const alert = generateRandomAlert();

    // 根据严重程度选择 toast 类型
    const typeMap = {
      high: 'error' as const,
      medium: 'warning' as const,
      low: 'info' as const,
    };

    addToast({
      type: typeMap[alert.severity],
      title: alert.severity === 'high' ? '🚨 高危预警' : alert.severity === 'medium' ? '⚠️ 中度预警' : 'ℹ️ 实时捕捉',
      message: alert.message,
      duration: 5000,
    });
  }, [addToast]);

  useEffect(() => {
    // 初始延迟 5 秒后开始首次弹窗
    const initialDelay = setTimeout(() => {
      triggerRandomAlert();
    }, 5000);

    // 之后每隔 15~30 秒随机触发
    const scheduleNext = () => {
      const delay = 15000 + Math.floor(Math.random() * 16000); // 15~30s
      const timer = setTimeout(() => {
        triggerRandomAlert();
        scheduleNext();
      }, delay);
      return timer;
    };

    const nextTimer = scheduleNext();

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(nextTimer);
    };
  }, [triggerRandomAlert]);

  // 此组件不需要渲染任何 UI
  return null;
}
