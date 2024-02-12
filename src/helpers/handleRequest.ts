import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import { isUserObject, responder } from "./helper.js";

export const postUser = (
  req: IncomingMessage,
  res: ServerResponse,
  USERS: USER[]
): Promise<USER[]> => {
  return new Promise((resolve, reject) => {
    let body: string = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const newUser: USER = JSON.parse(body);
        if (isUserObject(newUser)) {
          newUser.id = randomUUID();
          const updatedUsers = [...USERS, newUser];
          responder(res, 201, "Created successfully!", newUser);
          resolve(updatedUsers);
        } else {
          responder(res, 400, "Invalid input!", null);
          resolve(USERS);
        }
      } catch (error) {
        responder(res, 400, "Invalid input!", null);
        reject(error);
      }
    });
    req.on("error", (error) => {
      responder(res, 400, "Invalid input!", null);
      reject(error);
    });
  });
};

export const putUser = (
  req: IncomingMessage,
  res: ServerResponse,
  foundUser: USER
) => {
  let data: string = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("error", () => {
    responder(res, 400, "Invalid input!", null);
  });
  req.on("end", () => {
    let body: PUT_USER = JSON.parse(data);
    foundUser.age = body.age || foundUser.age;
    foundUser.hobbies = body.hobbies || foundUser.hobbies;
    foundUser.username = body.username || foundUser.username;

    responder(res, 200, "Changed successfully!", foundUser);
  });
};

export const deleteUser = (
  res: ServerResponse,
  USERS: USER[],
  userId: string
) => {
  USERS = USERS.filter((u) => u.id !== userId);
  responder(res, 204, "Removed successfully!", null);
  return USERS;
};
