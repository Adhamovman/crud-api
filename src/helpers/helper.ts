import { ServerResponse } from "http";

export const responder = (
  res: ServerResponse,
  statusCode: number,
  message: string,
  data: any
) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ statusCode, message, data }));
};

export function isUserObject(USER: USER): boolean {
  return (
    typeof USER.username === "string" &&
    typeof USER.age === "number" &&
    Array.isArray(USER.hobbies)
  );
}
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}