import cluster from "cluster";
import http, { IncomingMessage, ServerResponse } from "http";
import os from "os";
import { clusterManager } from "./helpers/clusterManager.js";

const numCPUs = os.cpus().length;
let USERS: USER[] = [];

try {
  const createWorkerServer = (): http.Server => {
    return http.createServer(async (req, res) => {
      USERS = await clusterManager(req, res, USERS);
    });
  };
  const sendUsersToWorkers = (USERS: USER[]) => {
    for (const id in cluster.workers) {
      cluster.workers[id]?.send({ type: "users", USERS });
    }
  };

  if (cluster.isPrimary) {
    const balancer = http.createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        const workers = cluster.workers;
        if (workers) {
          const workerValues = Object.values(workers);
          if (workerValues.length > 0) {
            const worker = workerValues.shift();
            if (worker) {
              const message = { type: "request", req: req };
              worker.send(message, (error: Error | null) => {
                if (error) {
                  console.error("Error sending message to worker:", error);
                  res.writeHead(500, { "Content-Type": "text/plain" });
                  res.end("Internal Server Error");
                }
              });
            }
          } else {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("No workers available");
          }
        } else {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Cluster workers not available");
        }
      }
    );

    balancer.listen(4000);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("message", (worker, message) => {
      console.log(
        `Received message from worker ${worker.id}: ${JSON.stringify(message)}`
      );
    });
  } else {
    const workerServer = createWorkerServer();
    workerServer.listen(4000 + (cluster.worker?.id ?? 0), () => {
      console.log(
        `Worker ${cluster.worker?.id} listening on port ${
          4000 + (cluster.worker?.id ?? 0)
        }`
      );
    });

    cluster.on("message", (_, message) => {
      if (message.type === "request") {
        workerServer.emit("request", message.req, message.res);
      } else if (message.type === "users") {
        sendUsersToWorkers(USERS);
      }
    });
  }
} catch (err) {
  console.log(err);
}
