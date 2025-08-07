"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAllNestedErrors = (error) => {
    if (error.constraints) {
        return Object.values(error.constraints).join(', ');
    }
    if (error.children && error.children.length > 0) {
        return error.children.map(getAllNestedErrors).join(', ');
    }
    return '';
};
const validationMiddleware = (type, value = 'body', skipMissingProperties = false, whitelist = true, forbidNonWhitelisted = true) => {
    return (req, res, next) => {
        // const dataToValidate =
        //   value === 'body' ? req.body :
        //     value === 'query' ? req.query :
        //       value === 'params' ? req.params :
        //         undefined;
        // 
        // console.log({ dataToValidate })
        // console.log({ query: req.query })
        next();
        // if (!dataToValidate) {
        //   return next(new HttpException(400, 'Invalid request target'));
        // }
        // const obj = plainToInstance(type, dataToValidate);
        // validate(obj, {
        //   skipMissingProperties,
        //   whitelist,
        //   forbidNonWhitelisted,
        // }).then((errors: ValidationError[]) => {
        //   if (errors.length > 0) {
        //     const message = errors.map(getAllNestedErrors).join(', ');
        //     next(new HttpException(400, message));
        //   } else {
        //     next();
        //   }
        // });
    };
};
exports.default = validationMiddleware;
//# sourceMappingURL=validation.middleware.js.map