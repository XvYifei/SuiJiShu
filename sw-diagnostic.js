// 基础 Service Worker 示例
self.addEventListener('install', event => {
  console.log('Service Worker 安装成功');
});

self.addEventListener('activate', event => {
  console.log('Service Worker 激活成功');
});

self.addEventListener('fetch', event => {
  // 基础 fetch 处理
});
