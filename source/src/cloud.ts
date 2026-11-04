import { createClient } from "@supabase/supabase-js";
import { defaults, emptyProgress, type Config, type Progress } from "./model";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const cloud =
  url && key && !url.includes("YOUR-") ? createClient(url, key) : null;
let identityPending: Promise<string> | null = null;
export function identity(): Promise<string> {
  if (!cloud) return Promise.reject(Error("尚未连接 Supabase；当前为本机预览"));
  if (identityPending) return identityPending;
  identityPending = (async () => {
    const {
      data: { session },
    } = await cloud!.auth.getSession();
    if (session) return session.user.id;
    const { data, error } = await cloud!.auth.signInAnonymously();
    if (error) throw error;
    return data.user!.id;
  })().finally(() => {
    identityPending = null;
  });
  return identityPending;
}
export async function getConfig() {
  if (!cloud) return defaults;
  const { data, error } = await cloud
    .from("site_content")
    .select("config")
    .eq("id", "published")
    .maybeSingle();
  if (error) throw error;
  return data?.config
    ? ({
        ...defaults,
        ...data.config,
        personal: { ...defaults.personal, ...data.config.personal },
      } as Config)
    : defaults;
}
export async function loadProgress() {
  if (!cloud) {
    try {
      return (
        JSON.parse(localStorage.getItem("starry-preview") || "null") ||
        emptyProgress
      );
    } catch {
      return emptyProgress;
    }
  }
  const id = await identity();
  const { data, error } = await cloud
    .from("journeys")
    .select("progress")
    .eq("user_id", id)
    .maybeSingle();
  if (error) throw error;
  const queued = localStorage.getItem(`starry-outbox-${id}`);
  if (queued) {
    try {
      const progress = JSON.parse(queued) as Progress;
      await saveProgress(progress);
      return progress;
    } catch {
      throw Error("存在未同步的互动记录。请恢复网络后点击页面底部重试。");
    }
  }
  return (data?.progress as Progress) || emptyProgress;
}
export async function saveProgress(progress: Progress) {
  if (!cloud) {
    localStorage.setItem("starry-preview", JSON.stringify(progress));
    return;
  }
  const id = await identity();
  const outboxKey = `starry-outbox-${id}`;
  const serialized = JSON.stringify(progress);
  localStorage.setItem(outboxKey, serialized);
  const { error } = await cloud
    .from("journeys")
    .upsert({ user_id: id, progress, updated_at: new Date().toISOString() });
  if (error) throw error;
  if (localStorage.getItem(outboxKey) === serialized)
    localStorage.removeItem(outboxKey);
}
export async function upload(file: File | Blob, admin = false) {
  if (!cloud) throw Error("连接云端后才可上传和保存媒体");
  if (file.size > 30 * 1024 * 1024) throw Error("单个文件不能超过 30 MB");
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "audio/mpeg",
      "audio/mp3",
    ].includes(file.type)
  )
    throw Error("请使用 JPG / PNG / WebP / MP3；HEIC 照片请先导出为 JPG");
  const id = await identity();
  const ext = file.type.includes("audio") ? "mp3" : file.type.split("/")[1];
  const bucket = admin ? "media" : "guest-media";
  const path = `${id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await cloud!.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return cloud!.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
export async function isAdmin() {
  if (!cloud) return false;
  const {data:{session}}=await cloud.auth.getSession();
  if(!session)return false;
  const { data, error } = await cloud.rpc("is_admin");
  if (error) throw error;
  return data === true;
}
export function download(blob: Blob, name: string) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 15000);
}
