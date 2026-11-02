A Little Starry Sky — 11个互动环节生日网站

文件：
- index.html：网站主体
- manifest.json：PWA基础配置
- sw.js：基础离线缓存

部署到现有 GitHub 仓库：
1. 解压此 ZIP。
2. 将 index.html、manifest.json、sw.js 上传到仓库 3433761527-beep/sorpio_site 的 main 分支根目录。
3. 若 GitHub 提示 index.html 已存在，选择替换。
4. 确认 Settings -> Pages -> Deploy from a branch -> main -> /(root)。
5. 等待 Actions 完成后访问：
   https://3433761527-beep.github.io/sorpio_site/

编辑后台：
点击网页右上角“编辑后台”。上传的媒体文件和访客互动记录目前保存在当前浏览器的 IndexedDB/localStorage 中。
重要限制：GitHub Pages 是静态托管，本版本尚未接入云数据库和安全管理员身份验证，因此本地上传的媒体不会自动同步到其他设备。要实现跨设备同步、后台远程发布和访客数据集中管理，需要配置 Supabase 等云端服务。
