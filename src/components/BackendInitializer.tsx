/**
 * Backend Initializer Component
 * 在 Android 上启动嵌入式 Node.js 后端
 */

import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Spin, Alert, Progress } from 'antd';
import { nodejsBridge, BackendStatus } from '../services/nodejsBridge';

interface BackendInitializerProps {
  children: React.ReactNode;
  onReady?: () => void;
}

export const BackendInitializer: React.FC<BackendInitializerProps> = ({ 
  children, 
  onReady 
}) => {
  const [status, setStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    initializeBackend();
  }, []);

  const initializeBackend = async () => {
    // 非 Android 平台直接就绪
    if (platform !== 'android') {
      setStatus('ready');
      onReady?.();
      return;
    }

    try {
      console.log('[BackendInitializer] Starting backend initialization...');
      setProgress(10);

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      // 初始化后端
      await nodejsBridge.initialize();
      
      clearInterval(progressInterval);
      setProgress(100);

      console.log('[BackendInitializer] Backend initialized successfully');
      setStatus('ready');
      onReady?.();
    } catch (err) {
      console.error('[BackendInitializer] Backend initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setStatus('initializing');
    setError(null);
    setProgress(0);
    initializeBackend();
  };

  // 非 Android 平台或已就绪,直接渲染子组件
  if (status === 'ready') {
    return <>{children}</>;
  }

  // 初始化中
  if (status === 'initializing') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        background: '#f0f2f5',
      }}>
        <Spin size="large" />
        <h2 style={{ marginTop: '20px', marginBottom: '10px' }}>
          正在启动 PixivFlow...
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          首次启动需要初始化后端服务,请稍候
        </p>
        <Progress 
          percent={progress} 
          style={{ width: '300px', maxWidth: '80%' }}
          status="active"
        />
        <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
          {progress < 30 && '正在启动 Node.js 运行时...'}
          {progress >= 30 && progress < 60 && '正在加载后端模块...'}
          {progress >= 60 && progress < 90 && '正在启动 API 服务器...'}
          {progress >= 90 && '即将完成...'}
        </p>
      </div>
    );
  }

  // 错误状态
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      padding: '20px',
      background: '#f0f2f5',
    }}>
      <Alert
        message="后端启动失败"
        description={
          <div>
            <p>{error}</p>
            <p style={{ marginTop: '10px', fontSize: '12px' }}>
              可能的原因:
            </p>
            <ul style={{ fontSize: '12px', paddingLeft: '20px' }}>
              <li>后端代码未正确打包</li>
              <li>Node.js 运行时初始化失败</li>
              <li>端口 3001 被占用</li>
            </ul>
          </div>
        }
        type="error"
        showIcon
        style={{ maxWidth: '500px', marginBottom: '20px' }}
      />
      <button
        onClick={handleRetry}
        style={{
          padding: '10px 30px',
          fontSize: '16px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        重试
      </button>
    </div>
  );
};

export default BackendInitializer;

