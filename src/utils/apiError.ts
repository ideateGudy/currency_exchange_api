

export class customApiError extends Error {
  public statusCode: number;
  public message: string;
  public isOperational: boolean;


  constructor( message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
}