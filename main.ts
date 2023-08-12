import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const app = new Hono();

app.post("/", async (c) => {
  const xMisskeyHookSecret = c.req.header("x-misskey-hook-secret");
  const secret = Deno.env.get("MISSKEY_HOOK_SECRET");
  if (xMisskeyHookSecret == secret) {
    const json = await c.req.json();
    console.log(json);
    return c.json({ result: "ok" }, 200);
  } else {
    return c.json({ result: "ng" }, 400);
  }
});

async function postToMastodon(text: string) {
  const url = Deno.env.get("MASTODON_SERVER_URL");
  const token = Deno.env.get("MASTODON_ACCESS_TOKEN");
  const res = await fetch(url + "/api/v1/statuses", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: text,
    }),
  });
  return res;
}

interface Note {
  id: string;
  createdAt: string;
  text: string | null;
  cw: string | null;
  user: User;
  userId: string;
  visibility: string;
}

interface User {
  id: string;
  createdAt: string;
  username: string;
  host: string | null;
  name: string;
  onlineStatus: string;
  avatarUrl: string;
  avatarBlurhash: string;
}

Deno.serve(app.fetch);
