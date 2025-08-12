import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';

import HttpException from '@exceptions/HttpException';

const getAllNestedErrors = (error: ValidationError): string => {
  if (error.constraints) {
    return Object.values(error.constraints).join(', ');
  }
  if (error.children && error.children.length > 0) {
    return error.children.map(getAllNestedErrors).join(', ');
  }
  return '';
};

const validationMiddleware = (
  type: any,
  value: 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {

  console.log("type======>", type);
  console.log("value======>", value);
  return (req, res, next) => {

    const dataToValidate =
      value === 'body' ? req.body :
        value === 'query' ? req.query :
          value === 'params' ? req.params :
            undefined;

    console.log("dataToValidate======>", dataToValidate);
    if (!dataToValidate) {
      return next(new HttpException(400, 'Invalid request target'));
    }

    const obj = plainToInstance(type, dataToValidate);

    validate(obj, {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map(getAllNestedErrors).join(', ');
        next(new HttpException(400, message));
      } else {
        next();
      }
    });
  };
};

export default validationMiddleware;
