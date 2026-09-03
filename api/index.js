import app from "../server.js";

// Vercel Serverless Function entrypoint
export default function handler(req, res) {
  return app(req, res);
}
