import { createRouteHandler } from "uploadthing/server";
import { ourFileRouter } from "./core";

const handlers = createRouteHandler({
  router: ourFileRouter,
});

export { handlers as GET, handlers as POST };