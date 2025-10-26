

export class customApiError extends Error {
  public status?: number;
  public message: string;
  public isOperational: boolean;
  public details?: any;

  constructor( message: string, statusCode: number) {
    super(message);
    this.status = statusCode;
    this.isOperational = true;
    this.message = message;
    this.details = undefined;
    Error.captureStackTrace(this, this.constructor);
  }
}