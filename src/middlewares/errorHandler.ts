import type { Request, Response, NextFunction } from 'express';
import config from '../config/config.ts';
import { customApiError } from '../utils/apiError.ts';

// interface AppError extends Error {
//   status?: number;
//   details?: any;
// }

const nodeEnv = config.NODE_ENV || 'development';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) =>{
  console.error(`[Error] ${err.message}`);


  if (err instanceof customApiError) {
        res.status(err.status || 500).json({
            status: "error",
            message: err.message,
            stack: nodeEnv === "development" ? err.stack : undefined,
        });
        return;
    }

  const status = err.status || 500;
  const response: Record<string, any> = {
    error:
      status === 400
        ? 'Validation failed'
        : status === 404
        ? 'Country not found'
        : status === 503
        ? 'External data source unavailable'
        : 'Internal server error',
  };

  if (err.details) response['details'] = err.details;

  if (nodeEnv === 'development') {
    response['stack'] = err.stack;
  }

  res.status(status).json(response);
}








// import type { Request, Response, NextFunction } from "express";
// import { customApiError } from "../utils/apiError.ts";

// export const errorHandler = (
//     err: any,
//     req: Request,
//     res: Response,
//     next: NextFunction
// ): void => {
//     let statusCode = err.statusCode || 500;
//     let message = err.message || "Internal Server Error";
//     const environment = process.env.NODE_ENV || "production";

//     if (err instanceof customApiError) {
//         res.status(statusCode).json({
//             status: "error",
//             message,
//             stack: environment === "development" ? err.stack : undefined,
//         });
//         return;
//     }

//     res.status(statusCode || 500).json({
//         code: err.code,
//         status: "error",
//         message : message || "Internal Server Error",
//         stack: environment === "development" ? err.stack : undefined,
//     });
// };
