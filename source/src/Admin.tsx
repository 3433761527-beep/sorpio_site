import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  Trash2,
  Eye,
  LogOut,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cloud, isAdmin, upload, download } from "./cloud";
import { names, validateConfig, type Config, type Media } from "./model";
export default function Admin({
  config,
  onPublished,
  exit,
}: {
  config: Config;
  onPublished: (c: Config) => void;
  exit: () => void;
}) {
  const [authorized, setAuthorized] = useState(false),
    [checking, setChecking] = useState(true),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState(0),
    [draft, setDraft] = useState<Config>(structuredClone(config)),
    [json, setJson] = useState(""),
    [rows, setRows] = useState<
      {
        user_id: string;
        progress: { completed: number[]; results: Record<string, unknown> };
        updated_at: string;
      }[]
    >([]);
  function change(fn: (c: Config) => void) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }
  async function verify() {
    try {
      const ok = await isAdmin();
      setAuthorized(ok);
      if (ok) {
        const { data, error } = await cloud!
          .from("site_content")
          .select("config")
          .eq("id", "draft")
          .maybeSingle();
        if (error) throw error;
        if (data) setDraft(data.config);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    void verify();
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!cloud) return;
    setBusy(true);
    try {
      const { error } = await cloud.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!(await isAdmin())) {
        await cloud.auth.signOut();
        throw Error("此账号未被授予管理员权限");
      }
      setPassword("");
      await verify();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(publish: boolean) {
    setBusy(true);
    try {
      validateConfig(draft);
      const { error } = publish
        ? await cloud!.rpc("publish_content", { payload: draft })
        : await cloud!.from("site_content").upsert({
            id: "draft",
            config: draft,
            updated_at: new Date().toISOString(),
          });
      if (error) throw error;
      if (publish) onPublished(structuredClone(draft));
      setMessage(
        publish
          ? "已发布。访客重新打开或刷新后可获取最新内容。"
          : "草稿已保存到云端，尚未发布。",
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function fileUpload(
    file: File | undefined,
    set: (url: string) => void,
  ) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await upload(file, true);
      set(url);
      setMessage("素材已上传。请保存草稿或发布。");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function mediaField(
    title: string,
    url: string,
    set: (v: string) => void,
    audio = false,
  ) {
    return (
      <label className="field">
        {title}
        <div className="upload-row">
          <input
            value={url}
            onChange={(e) => set(e.target.value)}
            placeholder="HTTPS 媒体地址，或上传文件"
          />
          <label className="upload-btn">
            <Upload size={15} /> 上传
            <input
              type="file"
              disabled={busy}
              accept={
                audio ? "audio/mpeg,.mp3" : "image/jpeg,image/png,image/webp"
              }
              onChange={(e) => {
                void fileUpload(e.target.files?.[0], set);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {url &&
          (audio ? (
            <audio controls src={url} preload="none" />
          ) : (
            <img className="admin-thumbnail" src={url} alt={title} />
          ))}
      </label>
    );
  }
  function field(
    label: string,
    value: string,
    set: (v: string) => void,
    multiline = false,
  ) {
    return (
      <label className="field">
        {label}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => set(e.target.value)}
            rows={7}
          />
        ) : (
          <input value={value} onChange={(e) => set(e.target.value)} />
        )}
      </label>
    );
  }
  function gallery(key: "memories" | "chats") {
    const arr = draft[key];
    return (
      <>
        <p className="muted">
          按展示顺序排列。上传后可逐张编辑标题与描述，聊天截图始终保留原始图片。
        </p>
        {arr.map((m, i) => (
          <div className="admin-card" key={m.id}>
            {mediaField(`图片 ${i + 1}`, m.url, (v) =>
              change((c) => {
                c[key][i].url = v;
              }),
            )}
            {field("标题", m.title, (v) =>
              change((c) => {
                c[key][i].title = v;
              }),
            )}
            {field(
              "描述",
              m.description,
              (v) =>
                change((c) => {
                  c[key][i].description = v;
                }),
              true,
            )}
            <div className="actions">
              <button
                disabled={!i}
                onClick={() =>
                  change((c) => {
                    [c[key][i - 1], c[key][i]] = [c[key][i], c[key][i - 1]];
                  })
                }
              >
                <ChevronUp size={15} /> 上移
              </button>
              <button
                disabled={i === arr.length - 1}
                onClick={() =>
                  change((c) => {
                    [c[key][i + 1], c[key][i]] = [c[key][i], c[key][i + 1]];
                  })
                }
              >
                <ChevronDown size={15} /> 下移
              </button>
              <button
                onClick={() =>
                  change((c) => {
                    c[key].splice(i, 1);
                  })
                }
              >
                <Trash2 size={15} /> 移除此项
              </button>
            </div>
          </div>
        ))}
        <button
          className="secondary"
          onClick={() =>
            change((c) =>
              c[key].push({
                id: crypto.randomUUID(),
                url: "",
                title: "",
                description: "",
              }),
            )
          }
        >
          ＋ 添加一张图片
        </button>
        <label className="upload-btn">
          批量上传
          <input
            type="file"
            multiple
            disabled={busy}
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = "";
              setBusy(true);
              try {
                const added: Media[] = [];
                for (const file of files) {
                  const url = await upload(file, true);
                  added.push({
                    id: crypto.randomUUID(),
                    url,
                    title: file.name,
                    description: "",
                  });
                }
                change((c) => {
                  c[key].push(...added);
                });
                setMessage("批量上传成功，请发布。");
              } catch (e) {
                setMessage((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </>
    );
  }
  async function loadData() {
    setBusy(true);
    try {
      const { data, error } = await cloud!
        .from("journeys")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setRows(data || []);
      setMessage("已读取互动数据。");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const panels: ReactNode[] = [
    <>
      {field("歌曲名称", draft.music.title, (v) =>
        change((c) => {
          c.music.title = v;
        }),
      )}
      {mediaField(
        "背景音乐 MP3",
        draft.music.url,
        (v) =>
          change((c) => {
            c.music.url = v;
          }),
        true,
      )}
      {mediaField("歌曲封面", draft.music.cover, (v) =>
        change((c) => {
          c.music.cover = v;
        }),
      )}
    </>,
    <>
      {field("彩蛋关键词", draft.egg.keyword, (v) =>
        change((c) => {
          c.egg.keyword = v;
        }),
      )}
      {field(
        "隐藏祝福",
        draft.egg.text,
        (v) =>
          change((c) => {
            c.egg.text = v;
          }),
        true,
      )}
      {mediaField(
        "彩蛋音效 MP3（留空使用原创合成音）",
        draft.egg.sound,
        (v) =>
          change((c) => {
            c.egg.sound = v;
          }),
        true,
      )}
    </>,
    <>
      {draft.colors.map((x, i) => (
        <div className="color-edit" key={i}>
          <input
            type="color"
            value={x.hex}
            onChange={(e) =>
              change((c) => {
                c.colors[i].hex = e.target.value;
              })
            }
            aria-label={`颜色 ${i + 1}`}
          />
          <input
            aria-label={`颜色名称 ${i + 1}`}
            value={x.name}
            onChange={(e) =>
              change((c) => {
                c.colors[i].name = e.target.value;
              })
            }
          />
          <button
            aria-label="移除颜色"
            disabled={draft.colors.length <= 3}
            onClick={() =>
              change((c) => {
                c.colors.splice(i, 1);
              })
            }
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          change((c) => c.colors.push({ name: "新颜色", hex: "#b3a0d4" }))
        }
      >
        ＋ 添加颜色
      </button>
    </>,
    <>
      {field("动画结束祝福", draft.growth.blessing, (v) =>
        change((c) => {
          c.growth.blessing = v;
        }),
      )}
      <label className="field">
        动画时长（6–120 秒）
        <input
          type="number"
          min="6"
          max="120"
          value={draft.growth.seconds}
          onChange={(e) =>
            change((c) => {
              c.growth.seconds = +e.target.value;
            })
          }
        />
      </label>
      <label className="field">
        像素女孩衣服颜色
        <input
          type="color"
          value={draft.growth.dress}
          onChange={(e) =>
            change((c) => {
              c.growth.dress = e.target.value;
            })
          }
        />
      </label>
    </>,
    <>
      {mediaField("拼图照片", draft.puzzle.url, (v) =>
        change((c) => {
          c.puzzle.url = v;
        }),
      )}
      <label className="field">
        允许的碎片数（逗号分隔，4–144）
        <input
          defaultValue={draft.puzzle.allowed.join(",")}
          onChange={(e) =>
            change((c) => {
              c.puzzle.allowed = e.target.value.split(/[,，]/).map(Number);
            })
          }
        />
        <small>
          支持任意整数；系统按因数生成矩形网格。素数会生成单行拼图。
        </small>
      </label>
      {field("完成后的祝福", draft.puzzle.message, (v) =>
        change((c) => {
          c.puzzle.message = v;
        }),
      )}
    </>,
    <>
      <p className="muted">
        仅支持整数加减，使用 {"{prev}"}{" "}
        代入上一题答案。保存与发布时验证每一步，最终结果必须为 19。
      </p>
      {draft.math.map((q, i) => (
        <div className="admin-card" key={i}>
          {field(`第 ${i + 1} 题`, q.expression, (v) =>
            change((c) => {
              c.math[i].expression = v;
            }),
          )}
          <label className="field">
            正确答案
            <input
              type="number"
              value={q.answer}
              onChange={(e) =>
                change((c) => {
                  c.math[i].answer = +e.target.value;
                })
              }
            />
          </label>
          {field("错误提示", q.hint, (v) =>
            change((c) => {
              c.math[i].hint = v;
            }),
          )}
          <button
            disabled={draft.math.length <= 1}
            onClick={() =>
              change((c) => {
                c.math.splice(i, 1);
              })
            }
          >
            <Trash2 size={15} /> 删除此题
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          change((c) =>
            c.math.push({
              expression: "{prev} + 3 - 3",
              answer: 19,
              hint: "加了多少，就再减去多少。",
            }),
          )
        }
      >
        ＋ 添加题目
      </button>
    </>,
    gallery("memories"),
    <>
      {mediaField("你拍摄的天空", draft.sky, (v) =>
        change((c) => {
          c.sky = v;
        }),
      )}
      <p className="muted">
        访客上传的天空和合成结果将保存到 guest-media，并关联访客记录。
      </p>
    </>,
    gallery("chats"),
    <>
      {field("信件标题", draft.letter.title, (v) =>
        change((c) => {
          c.letter.title = v;
        }),
      )}
      {field(
        "信件正文",
        draft.letter.body,
        (v) =>
          change((c) => {
            c.letter.body = v;
          }),
        true,
      )}
      <label className="upload-btn">
        从 TXT 导入正文
        <input
          type="file"
          accept=".txt,text/plain"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              const text = await f.text();
              change((c) => {
                c.letter.body = text;
              });
            }
          }}
        />
      </label>
      {mediaField("信件原图（可选）", draft.letter.image, (v) =>
        change((c) => {
          c.letter.image = v;
        }),
      )}
      <label className="field">
        字体
        <select
          value={draft.letter.font}
          onChange={(e) =>
            change((c) => {
              c.letter.font = e.target.value;
            })
          }
        >
          <option value="serif">衬线体</option>
          <option value="sans-serif">无衬线体</option>
          <option value="cursive">手写体（设备支持时）</option>
        </select>
      </label>
      <label className="field">
        信封颜色
        <input
          type="color"
          value={draft.letter.envelope}
          onChange={(e) =>
            change((c) => {
              c.letter.envelope = e.target.value;
            })
          }
        />
      </label>
    </>,
    <>
      <p className="muted">
        请按歌曲顺序上传已剪好的合法 MP3
        片段。每次轻点只播放一段，必须结束后才能播放下一段；全部结束才解锁蜡烛。
      </p>
      {draft.birthday.segments.map((s, i) => (
        <div className="admin-card" key={s.id}>
          {field(`片段 ${i + 1} 名称`, s.title, (v) =>
            change((c) => {
              c.birthday.segments[i].title = v;
            }),
          )}
          {mediaField(
            "MP3 片段",
            s.url,
            (v) =>
              change((c) => {
                c.birthday.segments[i].url = v;
              }),
            true,
          )}
          <div className="actions">
            <button
              disabled={!i}
              onClick={() =>
                change((c) => {
                  [c.birthday.segments[i - 1], c.birthday.segments[i]] = [
                    c.birthday.segments[i],
                    c.birthday.segments[i - 1],
                  ];
                })
              }
            >
              上移
            </button>
            <button
              disabled={i === draft.birthday.segments.length - 1}
              onClick={() =>
                change((c) => {
                  [c.birthday.segments[i + 1], c.birthday.segments[i]] = [
                    c.birthday.segments[i],
                    c.birthday.segments[i + 1],
                  ];
                })
              }
            >
              下移
            </button>
            <button
              onClick={() =>
                change((c) => {
                  c.birthday.segments.splice(i, 1);
                })
              }
            >
              删除
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() =>
          change((c) =>
            c.birthday.segments.push({
              id: crypto.randomUUID(),
              url: "",
              title: `片段 ${c.birthday.segments.length + 1}`,
              description: "",
            }),
          )
        }
      >
        ＋ 添加歌曲片段
      </button>
      {field("最终祝福", draft.birthday.message, (v) =>
        change((c) => {
          c.birthday.message = v;
        }),
      )}
    </>,
  ];
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <button onClick={exit}>
          <ArrowLeft size={16} /> 返回星空
        </button>
        <span>THE KEEPER OF THE STARS</span>
        {authorized && (
          <button
            onClick={async () => {
              await cloud!.auth.signOut();
              setAuthorized(false);
            }}
          >
            退出 <LogOut size={15} />
          </button>
        )}
      </header>
      <div className="admin-title">
        <span className="eyebrow">A LITTLE STARRY SKY</span>
        <h1>星空管理室</h1>
        <p>把想说的话，认真藏进每一颗星星里。</p>
      </div>
      {!cloud ? (
        <div className="admin-login">
          <h3>尚未连接云端</h3>
          <p>
            请按项目 README 配置 Supabase
            URL、公钥和数据库迁移。这里不会使用本地密码模拟管理员认证。
          </p>
          <button className="primary" onClick={exit}>
            返回预览
          </button>
        </div>
      ) : checking ? (
        <p className="centered">正在验证管理员身份…</p>
      ) : !authorized ? (
        <form className="admin-login" onSubmit={(e) => void login(e)}>
          <label className="field">
            管理员邮箱
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            密码
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy}>
            登录管理室 <ArrowRight size={15} />
          </button>
        </form>
      ) : (
        <div className="admin-layout">
          <aside>
            <button
              className={tab === 13 ? "active" : ""}
              onClick={() => setTab(13)}
            >
              ♡ 毛艺蓉专属设置
            </button>
            {names.map((name, i) => (
              <button
                key={name}
                className={tab === i ? "active" : ""}
                onClick={() => setTab(i)}
              >
                <small>{String(i + 1).padStart(2, "0")}</small>
                {name}
              </button>
            ))}
            <button
              className={tab === 11 ? "active" : ""}
              onClick={() => {
                setTab(11);
                void loadData();
              }}
            >
              互动数据与备份
            </button>
            <button
              className={tab === 12 ? "active" : ""}
              onClick={() => {
                setJson(JSON.stringify(draft, null, 2));
                setTab(12);
              }}
            >
              高级配置 JSON
            </button>
          </aside>
          <section className="admin-editor">
            <h2>
              {names[tab] ||
                (tab === 11
                  ? "互动数据与备份"
                  : tab === 13
                    ? "专属心意与幸福纸条"
                    : "高级配置")}
            </h2>
            {tab < 11 ? (
              panels[tab]
            ) : tab === 13 ? (
              <>
                {field(
                  "礼物主人的名字",
                  (draft.personal || config.personal).name,
                  (v) =>
                    change((c) => {
                      c.personal = {
                        ...(c.personal || config.personal),
                        name: v,
                      };
                    }),
                )}
                {field(
                  "开场邀请人的名字",
                  draft.personal.senderName || "李雨桐",
                  (v) =>
                    change((c) => {
                      c.personal.senderName = v;
                    }),
                )}
                {field(
                  "你想认真说给她听的话",
                  (draft.personal || config.personal).dedication,
                  (v) =>
                    change((c) => {
                      c.personal = {
                        ...(c.personal || config.personal),
                        dedication: v,
                      };
                    }),
                  true,
                )}
                {field(
                  "偏爱小纸条（每行一张，可换成只有你们知道的细节）",
                  (draft.personal || config.personal).notes.join("\n"),
                  (v) =>
                    change((c) => {
                      c.personal = {
                        ...(c.personal || config.personal),
                        notes: v.split("\n"),
                      };
                    }),
                  true,
                )}
                <p className="muted">
                  首页的抱抱、纸条收藏和幸福存钱罐独立保存，不改变 11
                  颗生日星星的探索进度。写下真实的小细节，会让心意更专属。
                </p>
                <label className="field">
                  <span>
                    <input
                      type="checkbox"
                      checked={draft.personal.gamesEnabled !== false}
                      onChange={(e) =>
                        change((c) => {
                          c.personal.gamesEnabled = e.target.checked;
                        })
                      }
                    />{" "}
                    开启小兔星星游乐场
                  </span>
                  <small>
                    包含2048可爱合合乐、接住幸运星、回忆翻翻牌和星轨连连看，成绩在互动数据中查看。
                  </small>
                </label>
              </>
            ) : tab === 12 ? (
              <>
                <textarea
                  className="json-editor"
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  spellCheck={false}
                />
                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(json);
                      validateConfig(parsed);
                      setDraft(parsed);
                      setMessage("配置已导入编辑区，请保存或发布。");
                    } catch (e) {
                      setMessage((e as Error).message);
                    }
                  }}
                >
                  应用 JSON 到草稿
                </button>
              </>
            ) : (
              <>
                <div className="actions">
                  <button disabled={busy} onClick={() => void loadData()}>
                    刷新数据
                  </button>
                  <button
                    onClick={() =>
                      download(
                        new Blob(
                          [
                            JSON.stringify(
                              { config: draft, journeys: rows },
                              null,
                              2,
                            ),
                          ],
                          { type: "application/json" },
                        ),
                        "starry-backup.json",
                      )
                    }
                  >
                    <Download size={15} /> 导出数据备份
                  </button>
                </div>
                <p className="muted">
                  备份包含互动记录与媒体链接。完整媒体备份请使用项目中的
                  backup.mjs 脚本。
                </p>
                {rows.map((row) => (
                  <div className="admin-card" key={row.user_id}>
                    <small>{row.user_id}</small>
                    <p>
                      已点亮 {row.progress.completed.length} / 11 ·{" "}
                      {new Date(row.updated_at).toLocaleString()}
                    </p>
                    <pre>{JSON.stringify(row.progress.results, null, 2)}</pre>
                    {Object.entries(
                      (
                        row.progress.results["6"] as
                          | { notes?: Record<string, string> }
                          | undefined
                      )?.notes || {},
                    ).map(([photoId, note]) => (
                      <div className="note-admin" key={photoId}>
                        <p>
                          <b>
                            {draft.memories.find((m) => m.id === photoId)
                              ?.title || photoId}
                          </b>
                          <br />
                          {note}
                        </p>
                        <button
                          onClick={async () => {
                            const text = prompt(
                              "编辑这条感受；留空会移除",
                              note,
                            );
                            if (text === null) return;
                            const progress = structuredClone(row.progress);
                            const notes = (
                              progress.results["6"] as {
                                notes: Record<string, string>;
                              }
                            ).notes;
                            if (text.trim()) notes[photoId] = text.trim();
                            else delete notes[photoId];
                            const { error } = await cloud!
                              .from("journeys")
                              .update({
                                progress,
                                updated_at: new Date().toISOString(),
                              })
                              .eq("user_id", row.user_id);
                            if (error) setMessage(error.message);
                            else void loadData();
                          }}
                        >
                          编辑或移除感受
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={async () => {
                        if (!confirm("永久删除此访客的所有互动记录？")) return;
                        const { error } = await cloud!
                          .from("journeys")
                          .delete()
                          .eq("user_id", row.user_id);
                        if (error) setMessage(error.message);
                        else void loadData();
                      }}
                    >
                      删除访客记录
                    </button>
                  </div>
                ))}
              </>
            )}
            {tab !== 11 && (
              <div className="admin-save">
                <button disabled={busy} onClick={() => void save(false)}>
                  <Save size={15} /> 保存草稿
                </button>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => void save(true)}
                >
                  保存并发布 <ArrowRight size={15} />
                </button>
              </div>
            )}
            <button className="subtle" onClick={exit}>
              <Eye size={15} /> 查看已发布网站
            </button>
          </section>
        </div>
      )}
      {message && (
        <div className="admin-message" role="status">
          <p>{message}</p>
          <button onClick={() => setMessage("")} aria-label="关闭提示">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
