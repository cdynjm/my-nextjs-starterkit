// app/api/admin/upload/route.ts
import { NextRequest } from "next/server";
import { IncomingForm, Files } from "formidable";
import fs from "fs";
import { Readable } from "stream";
import path from "path";
import type { Readable as ReadableType } from "stream";
import type { IncomingMessage } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = "./public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const toNodeRequest = (req: Request): IncomingMessage => {
  const nodeStream = new Readable({
    async read() {
      if (!req.body) {
        this.push(null);
        return;
      }
      const reader = (req.body as ReadableStream<Uint8Array>).getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          this.push(Buffer.from(value));
        }
        this.push(null);
      } catch (err) {
        this.destroy(err as Error);
      }
    }
  }) as ReadableType & Partial<IncomingMessage>;

  nodeStream.headers = Object.fromEntries(req.headers.entries());
  nodeStream.method = req.method;
  nodeStream.url = req.url ?? "";

  return nodeStream as IncomingMessage;
};

const parseForm = (req: Request): Promise<{ files: Files }> => {
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  return new Promise((resolve, reject) => {
    form.parse(toNodeRequest(req), (err, _fields, files) => {
      if (err) return reject(err);
      resolve({ files });
    });
  });
};

export async function POST(req: NextRequest) {
  try {
    const { files } = await parseForm(req);

    const file = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar;

     const filename = path.basename(file?.filepath || "");
    const fileUrl = `/uploads/${filename}`;

    return new Response(JSON.stringify({ url: fileUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
