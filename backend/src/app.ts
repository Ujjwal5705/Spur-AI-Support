import { errorHandler } from "./middleware/error.middleware.js";
import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/chat", chatRoutes);

app.use(errorHandler);

export default app;