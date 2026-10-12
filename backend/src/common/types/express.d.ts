import 'express';

declare module 'express' {
  export interface Request {
    traceId: string;
    startTime?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      traceId: string;
      startTime?: number;
    }
  }
}
