import { google } from "googleapis";
import { Readable } from "stream";

function getDrive() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "http://localhost:3001/callback"
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ id: string; name: string }> {
  const drive = getDrive();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, name",
  });

  return { id: res.data.id!, name: res.data.name! };
}
