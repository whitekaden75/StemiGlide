import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const port = process.env.PORT || env.port;

app.listen(port, () => {
  console.log(`StemiGlide API listening on port ${port}`);
});