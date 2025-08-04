// 缓存名称（与测试页面中的一致）
const CACHE_NAME = 'pwa-cache-test-v1';

// 需要缓存的资源列表
const urlsToCache = [
    '/',  // 根路径
    'index.html' // 测试页面
];

// 安装事件：缓存资源
self.addEventListener('install', event => {
    console.log('Service Worker 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('正在缓存核心资源:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('所有核心资源已缓存');
                return self.skipWaiting();
            })
    );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', event => {
    console.log('Service Worker 激活');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('删除旧缓存:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截请求：使用缓存优先策略
self.addEventListener('fetch', event => {
    console.log('拦截请求:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('从缓存返回:', event.request.url);
                    return response;
                }
                
                console.log('从网络获取:', event.request.url);
                return fetch(event.request);
            })
    );
});
