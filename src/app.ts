import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "./lib/utils.ts";

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
