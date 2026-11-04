# A Little Starry Sky · 毛艺蓉的十九岁

React 19 + TypeScript + Vite + Canvas + HTML5 Audio + Supabase。11 月 9 日，19 岁，天蝎座。11 个互动的编号和顺序固定；首页另有原创星星邮差小兔、抱抱、19 张偏爱纸条、幸福存钱罐、月亮悄悄话和流星。

## 新增开场与游乐场

- 四段开场：女孩轻触手机 → 手机光门放大穿越 → 李雨桐在星空中祝毛艺蓉19岁生日快乐 → 邀请一同探索。使用分层SVG、镜头缩放、眨眼、挥手和粒子动画。人物是手绘卡通演绎，不是真人肖像或视频。
- 右上角始终可跳过；同一标签页的会话只自动展示一次，首页“重看雨桐的邀请”可以重播。后台“个性化”可修改邀请人署名。开场静音，不依赖自动播放音频。
- 11个环节各有流光入场、不同悬浮图案和粒子装饰；首次完成会绽放星光，原有成长、信封、天空融合、生日蜡烛等专属动画保留。系统开启减少动态效果时会降低装饰动画。
- 四个额外小游戏：2048可爱合合乐、接住19颗幸运星、六对回忆翻翻牌、11点天蝎座星轨连线。额外小游戏独立记录，不改变原有11关完成条件。
- 2048支持手机滑动、方向按钮、键盘、正确的单次合并规则、分数/最佳成绩、一步撤回、重开确认、2048通关后继续及无路可走判定。棋盘存入`results.game2048`；其他小游戏成绩存入`results.games`。已连接云端时沿用真实访客保存通道；未配置时仅本机预览保存。
- 2048数字2至1024对应2026年三丽鸥官方人气榜前十：布丁狗、大耳狗、帕恰狗、酷洛米、Hello Kitty、贝克鸭、美乐蒂、山姆企鹅、人鱼汉顿、双子星。角色采用自行绘制的SVG演绎，并有挥手、摇耳朵、眨眼等动作；非官方素材。榜单来源：https://corporate.sanrio.co.jp/news/20260628_01.html 。

## 当前交付状态

- 完整应用源码、Supabase SQL 迁移、GitHub Pages Actions、备份脚本已提供。
- 本机可运行；未填 Supabase 环境变量时明确显示“本机预览”，本机预览数据只保存在当前浏览器。管理员页面不提供本地模拟登录。
- **真实 Supabase 已接通，表结构已初始化，匿名访客登录已开启。**真实互动写入/读回、访客间读取与修改隔离、访客无法编辑/发布后台内容、真实图片上传/下载/删除均已验证。当前4173预览已构建为云端版本。管理员账号授权、正式内容发布、GitHub推送/部署和iPhone Safari真机验收尚未完成。
- 你提供的仓库是 https://github.com/3433761527-beep/sorpio_site 。原仓库包含一个本地存储版本和像素图片；本交付不删除或修改它们。
- 没有私人回忆照片、聊天截图或用户音乐被擅自填入。缺少素材的环节显示上传提示，生日歌未上传时无法吹蜡烛。
- 默认专属信件与纸条是可编辑初稿。建议把其中几张换成只有你们知道的真实细节。

## 本地启动

需要 Node.js **22.18 或更新版本**、pnpm 11.25.0。也可用当前受支持的 Node 24。

```sh
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的地址。生产构建与预览：

```sh
pnpm test
pnpm build
pnpm preview
```

`/admin/` 为独立后台路径；`/#admin` 也是后台入口。GitHub 项目 Pages 对应 `/sorpio_site/admin/`。Vite 构建会生成真实的 `admin/index.html` 和 `404.html`，刷新后台路径也有入口。不要直接双击 HTML 文件。

## Supabase 配置

1. 创建或选择你自己的 Supabase 项目。
2. 在 SQL Editor 中完整执行 `supabase/migrations/001_initial.sql` **一次**。
3. 在 Authentication 的设置中启用 **Anonymous Sign-Ins**，访客将得到自己的 Auth 用户 ID；这不是把所有人共享为数据库 `anon` 角色。
4. 在 Authentication → Users 中创建管理员邮箱账号，设置你自己的强密码。不要把密码写进前端或 GitHub 仓库。
5. 复制该账号的 UID，在 SQL Editor 执行：

```sql
insert into public.admins(user_id)
values ('这里填写实际管理员UID');
```

6. 项目根目录复制 `.env.example` 为 `.env.local`，填入项目 URL 与 **publishable/anon 公钥**。前端不需要 service_role/secret key，也不应使用它们。
7. 本地开发时 `VITE_BASE_PATH=/`，重新启动开发服务。部署到给定仓库时 Actions 会设置 `/sorpio_site/`。
8. 打开 `/admin/`，使用第 4 步创建的账号登录。无默认密码。没有 `admins` 表授权的用户无法管理内容。
9. 上传素材，保存草稿，再“保存并发布”。新访客或刷新页面会直接读取 `site_content` 的 `published` 配置，不需要每次重新部署前端。

数据表：

| 表 / 存储桶 | 用途 | 权限 |
|---|---|---|
| `admins` | 管理员白名单 | 用户只能查询自己的行；只能由项目所有者在 SQL 中授权 |
| `site_content` | `draft` / `published` 两份配置 | 访客只读已发布配置，管理员可写 |
| `journeys` | 词语、配色、完成状态、感受、天空地址、愿望、收藏和幸福瞬间 | 访客仅读写自己的行，管理员可查看、修改与删除 |
| `media` | 管理员照片和 MP3 | 仅管理员可上传与管理 |
| `guest-media` | 访客天空原图与合成图 | 访客仅可上传到自己的 UID 目录 |

两类媒体桶使用公共可访问地址，以供静态网站展示；持有媒体链接的人可以读取文件。数据库中的个人互动记录受 RLS 隔离。该实现适合通过链接分享的生日礼物，**不提供照片链接的收件人身份保密**。若要限制图片读取，需要另行改为私有桶和短期签名 URL。

### 访客身份与保存

同一浏览器的 Supabase 会话会恢复自己的进度。不同设备、清理浏览器数据或隐私浏览会得到不同访客身份；当前没有实现跨设备的访客账号绑定。云端不可用时不会假报“已保存”，底部会显示错误并提供重试；待同步记录保留在按访客 UID 区分的本地 outbox 中。

编号探索与完成互动分开记录：按 01→11 点击后留下淡紫色微光并开启下一颗，真正完成后变成金色。已探索的环节可重复打开。首页附加惊喜不计入 11 关完成数量。

## 管理员上传与编辑

- 通用文件限制：单文件 30 MB；图片 JPG、PNG、WebP；音频 MP3。iPhone 若返回 HEIC，请先另存为 JPG。
- 01 音乐：上传 MP3、封面，编辑歌曲名。播放器支持播放、暂停、拖动进度；iPhone 的实际音量由设备音量键控制。
- 02 心情：收礼者填写三个输入框。关键词默认“幸福”；匹配前会正规化全角字符并去除中文空格、Unicode 标点。管理员可以更改关键词、祝福与音效。没有音效文件时使用原创合成提示音。
- 03 配色：至少三种不重复颜色，访客须选择恰好三种。结果保存并影响蛋糕环节的光晕与表面颜色。
- 04 成长：原创 Canvas 像素角色连续绘制、步态与身体比例连续变化，配合六个年龄阶段的环境细节和粒子。可编辑服装颜色、总时长及结束祝福；按要求保留“你成为了1岁的大人”。
- 05 拼图：上传照片，允许难度默认 9、16、25、36。逗号分隔编辑自定义 4–144 片。系统按因数生成矩形网格；例如 12 片为 3×4，素数会成为单行细条，建议选合数以便在手机上操作。访客可拖动交换或依次轻点两块；支持键盘 Enter/空格、预览、打乱、重新开始和实时完成判断。
- 06 数学：多道整数加减题，`{prev}` 代入上一题答案。前端验证每题，发布 RPC 也验证最终结果等于 19。默认中间结果为 12→27→8，直到最后一题才揭晓 19；不使用 eval。
- 07 回忆：批量上传、逐张改标题和描述、排序、替换、移除展示项。访客可滑动、放大、为各照片保存感受。后台“互动数据与备份”可查看、编辑或移除感受。
- 08 天空：管理员先上传自己的天空；访客选择自己的照片。Canvas 执行 cover 裁切、对角线透明度渐变、色调叠加与星光绘制，生成全新 1200×1600 JPEG。支持重新制作、保存到设备和把两张访客媒体上传云端。
- 09 聊天：上传原始截图，按顺序组成手机式回忆时间轴，可滑动和放大；不会重写原图内容。
- 10 信件：可编辑文本、导入 UTF-8 TXT，或上传信件图片。可设标题、字体和信封颜色。CSS 3D 封口打开→信纸抽出→展开→文字渐现；长信可滚动。
- 11 生日：按顺序添加已剪好的合法 MP3 片段，可以上下调整。每次轻点背景只播放当前一段，播放时不能启动下一段；只有 `ended` 事件才推进。下一片段预加载；所有片段结束才出现愿望输入和吹蜡烛按钮。电话等中断暂停后可继续；网络错误可重载当前片段。吹灭后才启用背景点击烟花，并保留两句最终祝福。每次重新打开环节可重新体验，不会跳过歌曲锁。
- 专属设置：修改收礼者姓名、专属留言和偏爱小纸条。抱抱次数、收藏和幸福瞬间独立写入访客结果。

上传替换文件采用新路径，不覆盖其他访客文件。相册“移除此项”只移除展示引用，旧媒体保留供恢复；需要永久清理时在 Supabase Storage 中删除不再使用的文件。

## 发布到你的 GitHub Pages

建议先建分支，保留原站回退版本。

1. 在已授权登录 GitHub 的电脑上 clone `3433761527-beep/sorpio_site`。
2. 将本源码目录的文件复制到仓库根目录，包含 `.github`、`.gitignore`、`supabase` 等目录；不要复制 `node_modules`、`.env.local`。保留原仓库的 `assets` 和 `growth-voxel.png`。
3. 在仓库 Settings → Secrets and variables → Actions → **Variables** 设置：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 在 Settings → Pages，把 Source 改为 **GitHub Actions**。原站是从 main 根目录发布的方式，新版需要切换为 Actions。
5. 提交并推送 main（或先审阅分支后合并）。仓库附带的 `.github/workflows/deploy.yml` 会安装锁定依赖、运行测试、构建、上传 Pages 产物并部署。
6. 查看 Actions 中的部署结果。**只有成功后**，新版才会出现在：
   - 网站：`https://3433761527-beep.github.io/sorpio_site/`
   - 后台：`https://3433761527-beep.github.io/sorpio_site/admin/`

以上地址是目标路径，不表示本次已经部署。当前未提供 GitHub 写入授权、Supabase 项目或用户媒体，尚不能完成真正上线。

参考：[Vite 静态部署](https://vite.dev/guide/static-deploy)、[Supabase 匿名登录](https://supabase.com/docs/guides/auth/auth-anonymous)、[Storage 访问控制](https://supabase.com/docs/guides/storage/security/access-control)。

## 备份与恢复

后台可导出配置与互动 JSON。完整备份可在本地设置以下环境变量后运行脚本：

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_ADMIN_EMAIL
SUPABASE_ADMIN_PASSWORD
```

```sh
node scripts/backup.mjs ./backups/birthday
```

密码只存在本地环境中，**禁止以 VITE_ 为密码变量前缀**。脚本使用普通管理员登录和 RLS，不需要 service_role。它分页导出两张业务表，并递归下载两个存储桶中的全部媒体与路径清单。

恢复到同一项目：保留原媒体路径重新上传；在 SQL Editor 中按 JSON 的原 user_id 恢复 `journeys`，按 id 恢复 `site_content`。跨项目恢复还需要迁移 Auth 身份、重新授予管理员、替换配置和互动记录中的媒体项目域名。当前未提供一键跨项目恢复工具。

## iPhone 与验收

布局使用 viewport-fit、安全区域和 44px 左右的触摸目标。所有重要操作可轻点，不依赖鼠标悬停；拼图支持 Pointer Events，照片支持文件选择，音频由真实用户手势播放。PWA 包含 manifest、PNG 主屏幕图标与 service worker；已发布配置从云端读取，HTML 和数据库请求不做 cache-first 缓存。

已运行的测试、使用的隔离接口及未完成项目请看 `ACCEPTANCE.md`。**没有使用 iPhone 真机，不能声称 iPhone Safari 已通过。**

## 代码位置

| 文件 | 负责内容 |
|---|---|
| `src/App.tsx` | 旅程状态、顺序探索、保存队列与弹窗 |
| `src/StarMap.tsx` | 天蝎座星图、点亮、月亮与流星 |
| `src/Stages.tsx` | 其余 10 个环节、拼图、合成、播放器和蛋糕状态 |
| `src/Growth.tsx` | 连续像素成长动画 |
| `src/Happiness.tsx` | 原创邮差小兔、纸条、拥抱和幸福存钱罐 |
| `src/Admin.tsx` | 独立管理员界面 |
| `src/cloud.ts` | Supabase Auth、数据库与对象存储 |
| `src/model.ts` | 默认内容、类型和数学/配置校验 |
| `src/*.css` | 响应式、动画及减少动态效果的适配 |
| `supabase/migrations/001_initial.sql` | 数据库、权限与发布 RPC |
| `scripts/backup.mjs` | 数据和完整媒体备份 |

原创 SVG 邮差小兔和代码动画借鉴柔软、圆润、可爱的视觉气质，没有直接复制三丽鸥角色。
