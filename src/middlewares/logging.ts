import type { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `[${new Date().toISOString()}] METHOD: "${req.method}" ENDPOINT: "${req.originalUrl}" STATUS_CODE: "${res.statusCode}" DURATION: "${duration}ms"`;
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    if (res.statusCode >= 400) {
      console.error("URL:", fullUrl);
      console.error(logMessage);
    } else {
      console.log("URL:", fullUrl);
      console.log(logMessage);
    }
  });

  next();
};