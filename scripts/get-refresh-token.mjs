import { google } from "googleapis";
import http from "http";
import url from "url";

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3001/callback";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/drive"],
});

console.log("\n📋 Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n⏳ Waiting...\n");

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === "/callback" && parsed.query.code) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h2>✅ Done! Go back to the terminal.</h2>");
    server.close();

    const { tokens } = await oauth2Client.getToken(String(parsed.query.code));
    console.log("✅ Refresh token:\n");
    console.log(tokens.refresh_token);
    console.log("\nSend this token to Claude.\n");
  }
});

server.listen(3001);
