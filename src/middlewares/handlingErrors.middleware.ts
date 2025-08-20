import { NextFunction, Request, Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
const handlingErrors = (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    const statusCode: number = error.httpCode || error.status || StatusCodes.INTERNAL_SERVER_ERROR;
    const message: string = error.message || getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR);
    console.log(JSON.stringify(error))
    res.status(statusCode).json({ message });
  } catch (err) {
    next(err);
  }
};

export default handlingErrors;
