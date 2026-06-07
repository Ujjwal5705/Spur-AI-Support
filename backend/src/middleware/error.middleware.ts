import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Global Error Caught:", err.stack || err.message);

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }

  res.status(500).json({ error: "Something went wrong on the server" });
}