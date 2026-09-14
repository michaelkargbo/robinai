// Vercel Serverless Function entrypoint
// All /api/* requests are routed here by vercel.json

import app from "../server.js";

export default function handler(req, res) {
  // Let the Express app handle the request
  return app(req, res);
}
