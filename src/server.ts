import http from "http";
import "dotenv/config";
import { manager } from "./helpers/manager.js";

const server = http.createServer((req, res) => {
  manager(req, res);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("Listening on http://127.0.0.1:" + PORT);
});


