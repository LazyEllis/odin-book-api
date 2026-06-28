import type { RequestHandler } from "express";

export const sendCatchAllMessage: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
};
