// 缓存名称（与测试页面中的一致）
const CACHE_NAME = 'randnumber-pwa-v1';

// 需要缓存的资源列表
const urlsToCache = [
    '/SuiJiShu/',  // 根路径
    '/SuiJiShu/index.html', // 主页面
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' // 外部资源
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
// 在 activate 事件处理程序中添加以下内容：
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('删除旧缓存:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // 强制接管所有客户端
      return self.clients.matchAll({ type: 'window' }).then(windowClients => {
        windowClients.forEach(windowClient => {
          windowClient.navigate(windowClient.url);
        });
      });
    })
  );
});

// 拦截请求：智能缓存策略
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // 对同源资源使用缓存优先策略
    if (requestUrl.origin === location.origin) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('从缓存返回:', event.request.url);
                        return response;
                    }
                    return fetch(event.request);
                })
        );
    }
    // 对字体资源使用缓存优先并更新策略
    else if (requestUrl.href.includes('fontawesome')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // 如果缓存中有，直接返回
                    if (response) {
                        console.log('从缓存返回字体:', event.request.url);
                        return response;
                    }
                    
                    // 否则从网络获取并缓存
                    return fetch(event.request)
                        .then(networkResponse => {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                            return networkResponse;
                        });
                })
        );
    }
    // 其他请求直接访问网络
    else {
        event.respondWith(fetch(event.request));
    }
});
