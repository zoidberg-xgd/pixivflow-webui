/**
 * Node.js Bridge Service
 * 用于在 Android 上启动和管理 Node.js 后端
 */

import { Capacitor } from '@capacitor/core';

export interface BackendStatus {
  ready: boolean;
  url: string;
  platform: string;
  error?: string;
}

// Node.js 消息类型定义
export interface NodeJSMessage {
  type?: string;
  data?: unknown;
  [key: string]: unknown;
}

export class NodeJSBridge {
  private static instance: NodeJSBridge;
  private backendReady = false;
  private backendUrl = 'http://127.0.0.1:3000';
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): NodeJSBridge {
    if (!NodeJSBridge.instance) {
      NodeJSBridge.instance = new NodeJSBridge();
    }
    return NodeJSBridge.instance;
  }

  /**
   * 初始化 Node.js 后端 (仅在 Android 上)
   */
  async initialize(): Promise<void> {
    // 避免重复初始化
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    const platform = Capacitor.getPlatform();
    
    console.log(`[NodeJSBridge] Platform: ${platform}`);

    // 只在 Android 上启动 Node.js
    if (platform !== 'android') {
      console.log('[NodeJSBridge] Not on Android, using external backend');
      // 在非 Android 平台,使用环境变量或默认后端
      this.backendUrl = this.getExternalBackendUrl();
      this.backendReady = true;
      return;
    }

    try {
      console.log('[NodeJSBridge] Starting Node.js backend...');

      // 动态导入 nodejs-mobile-capacitor（可选依赖，仅在Android上需要）
      // @ts-ignore - 可选依赖，类型声明在 src/types/nodejs-mobile-capacitor.d.ts
      const { NodeJS } = await import('nodejs-mobile-capacitor');
      
      // 设置消息监听器
      NodeJS.channel.addListener('message', (msg: string | NodeJSMessage) => {
        console.log('[NodeJSBridge] Message from backend:', msg);
        
        if (msg === 'backend-ready' || (typeof msg === 'object' && msg.type === 'ready')) {
          this.backendReady = true;
          console.log('[NodeJSBridge] Backend is ready!');
        }
      });

      // 启动 Node.js (main.js 是入口文件)
      await NodeJS.start('main.js');
      console.log('[NodeJSBridge] Node.js started');

      // 等待后端就绪
      await this.waitForBackend(30000);
      
      console.log('[NodeJSBridge] Backend initialized successfully');
    } catch (error) {
      console.error('[NodeJSBridge] Failed to start Node.js backend:', error);
      throw new Error(`Backend initialization failed: ${error}`);
    }
  }

  /**
   * 等待后端启动
   */
  private async waitForBackend(timeout = 30000): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 500;
    
    console.log('[NodeJSBridge] Waiting for backend to be ready...');

    while (!this.backendReady) {
      // 检查超时
      if (Date.now() - startTime > timeout) {
        throw new Error('Backend startup timeout');
      }
      
      // 尝试连接后端健康检查端点
      try {
        const response = await fetch(`${this.backendUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        
        if (response.ok) {
          this.backendReady = true;
          console.log('[NodeJSBridge] Backend health check passed');
          return;
        }
      } catch (e) {
        // 继续等待
        console.log('[NodeJSBridge] Backend not ready yet, retrying...');
      }
      
      // 等待后再次检查
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }

  /**
   * 获取外部后端 URL (非 Android 平台)
   */
  private getExternalBackendUrl(): string {
    // 优先使用环境变量
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }

    // 开发模式
    if (import.meta.env.DEV) {
      const port = import.meta.env.VITE_DEV_API_PORT || '3000';
      return `http://localhost:${port}`;
    }

    // 生产模式,使用当前域名
    return window.location.origin;
  }

  /**
   * 检查后端是否就绪
   */
  isBackendReady(): boolean {
    return this.backendReady;
  }

  /**
   * 获取后端 URL
   */
  getBackendUrl(): string {
    return this.backendUrl;
  }

  /**
   * 获取后端状态
   */
  getStatus(): BackendStatus {
    return {
      ready: this.backendReady,
      url: this.backendUrl,
      platform: Capacitor.getPlatform(),
    };
  }

  /**
   * 向后端发送消息 (仅 Android)
   */
  async sendMessage(message: string | NodeJSMessage): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      console.warn('[NodeJSBridge] sendMessage only works on Android');
      return;
    }

    try {
      // @ts-ignore - 可选依赖，类型声明在 src/types/nodejs-mobile-capacitor.d.ts
      const { NodeJS } = await import('nodejs-mobile-capacitor');
      NodeJS.channel.send(message);
    } catch (error) {
      console.error('[NodeJSBridge] Failed to send message:', error);
    }
  }

  /**
   * 重启后端 (仅 Android)
   */
  async restart(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      console.warn('[NodeJSBridge] restart only works on Android');
      return;
    }

    console.log('[NodeJSBridge] Restarting backend...');
    this.backendReady = false;
    this.initializationPromise = null;
    
    await this.initialize();
  }
}

// 导出单例实例
export const nodejsBridge = NodeJSBridge.getInstance();

