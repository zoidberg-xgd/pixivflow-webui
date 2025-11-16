import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pixivflow.webui',
  appName: 'PixivFlow',
  webDir: 'dist',
  server: {
    // 开发时可以配置为本地服务器
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  ios: {
    // iOS 特定配置
    scheme: 'PixivFlow',
    // 允许 HTTP 连接（开发时）
    // allowsLinkPreview: false,
  },
  android: {
    allowMixedContent: true,
    // 允许应用访问网络内容
    // 如果您的后端 API 使用 HTTP (非 HTTPS),这个设置很重要
    webContentsDebuggingEnabled: true, // 开发时启用,生产环境可关闭
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      // 签名配置将从 android/keystore.properties 读取
    },
  },
};

export default config;

