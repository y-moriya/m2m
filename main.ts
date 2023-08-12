import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const app = new Hono();

app.post("/", async (c) => {
  const xMisskeyHookSecret = c.req.header("x-misskey-hook-secret");
  const secret = Deno.env.get("MISSKEY_HOOK_SECRET");
  if (xMisskeyHookSecret == secret) {
    const json = await c.req.json();
    console.log(json);
    const note = json.body.note as Note;
    if (note.channelId == null) {
      console.log("channelId is null");
      return c.json({ result: "channelId is null" }, 200);
    } else if (note.channelId != null) {
      console.log("post to mastodon");
      const res = await postToMastodon(
        note.text! + ` from:BackspaceKey#${note.channel!.name}`,
        note.cw,
      );
      console.log(res);
      if (res.status != 200) {
        return c.json({ result: "ng" }, 400);
      } else {
        return c.json({ result: "ok" }, 200);
      }
    }
  } else {
    return c.json({ result: "ng" }, 400);
  }
});

async function postToMastodon(
  text: string,
  cw: string | null,
) {
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
      spoiler_text: cw,
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
  channel: Channel | null;
  channelId: string | null;
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

interface Channel {
  id: string;
  name: string;
  color: string;
}

Deno.serve(app.fetch);
