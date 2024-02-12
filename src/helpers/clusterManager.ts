import { ServerResponse, IncomingMessage } from "http";
import { deleteUser, postUser, putUser } from "./handleRequest.js";
import { isValidUUID, responder } from "./helper.js";

export const clusterManager = async (
  req: IncomingMessage,
  res: ServerResponse,
  USERS: USER[]
): Promise<USER[]> => {
  try {
    if (req.url?.startsWith("/api")) {
      if (req.url === "/api") {
        switch (req.method) {
          case "GET":
            responder(res, 200, "OK", USERS);
            break;
          case "POST":
            USERS = await postUser(req, res, USERS);
            break;
          default:
            responder(res, 404, "Operation failed!", null);
        }
      } else {
        let requestUrl: string = req.url;
        const userId: string = requestUrl.split("/")[2];
        if (!isValidUUID(userId)) {
          responder(res, 400, "UserId is not valid!", null);
        } else {
          let foundUser: USER | undefined = USERS.find((u) => u.id === userId);
          if (foundUser) {
            switch (req.method) {
              case "GET":
                responder(res, 200, "OK", foundUser);
                break;
              case "PUT":
                putUser(req, res, foundUser);
                break;
              case "DELETE":
                USERS = deleteUser(res, USERS, userId);
                break;
              default:
                responder(res, 404, "Operation failed!", null);
            }
          } else {
            responder(res, 404, "User not found!", null);
          }
        }
      }
    } else {
      responder(res, 404, "The resource you requested could not found!", null);
    }
  } catch {
    responder(res, 500, "Server error!", null);
  }
  return USERS;
};
