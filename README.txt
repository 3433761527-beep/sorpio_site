星空生日网站（iPhone Safari 适配）

文件：
- index.html：网站入口
- assets/growth-voxel.png：成长星辰像素风视觉图
- assets/reference-photo.jpg：用户提供的人物参考照片（仅供本地编辑参考，不会自动公开展示）

本地预览：解压后用浏览器打开 index.html。推荐使用 VS Code Live Server 或 Python http.server。

免费发布：
1. 在 GitHub 创建 Public 仓库，例如 scorpio-birthday。
2. 上传 index.html 和 assets 文件夹到仓库根目录。
3. Settings -> Pages -> Deploy from a branch -> main -> /(root) -> Save。
4. 等待 GitHub Pages 发布，网址通常为 https://你的GitHub用户名.github.io/scorpio-birthday/ 。

重要限制：这是纯静态网站。访客提交的心情、留言、天空照片只在当前会话展示，不会自动传回给站长；要实现跨设备保存/管理员账号权限/远程内容更新，需要接入后端数据库和身份认证。网页里的编辑入口仅用于本机准备内容，不是安全的权限系统。上传音乐/照片需要作为网站资源一并部署，不能只保存在你的本地浏览器。
