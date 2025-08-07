import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to parse JSON strings from multipart/form-data requests.
 * Use before validation middleware.
 */
// export const parseJsonFieldsMiddleware = (fieldsToParse: string[]) => {
//     console.log("req.body==========>");
//     return (req: Request, res: Response, next: NextFunction) => {
//         try {
//             console.log("req.body==========>1");
//             for (const field of fieldsToParse) {
//                 const value = req.body[field];
//                 if (typeof value === 'string') {
//                     req.body[field] = JSON.parse(value);
//                 }
//             }
//             console.log(req.body);
//         } catch (error) {
//             return res.status(400).json({ message: `Invalid JSON in one of the fields: ${error.message}` });
//         }
//         next();
//     };
// }

export const parseJsonFieldsMiddleware = (fieldsToParse: string[]) => (req, res, next) => {
    console.log('[parseJsonFields] Middleware called',req);
    console.log('[parseJsonFields] fieldsToParse:', fieldsToParse);
    console.log('[parseJsonFields] req.body at start:', req.body);
    try {
        let ranLoop = false;
        for (const field of fieldsToParse) {
            ranLoop = true;
            let value = req.body[field];
            console.log(`[parseJsonFields] Raw value for field '${field}':`, value, 'Type:', typeof value);
            if (typeof value === 'string') {
                // Remove extra wrapping quotes if present (e.g., '"string"' -> 'string')
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                // Try to parse JSON, fallback to string if parsing fails
                try {
                    req.body[field] = JSON.parse(value);
                    console.log(`[parseJsonFields] Parsed value for field '${field}':`, req.body[field], 'Type:', typeof req.body[field]);
                } catch (err) {
                    // If it's not valid JSON, leave as string
                    req.body[field] = value;
                    console.log(`[parseJsonFields] Could not parse field '${field}', using string value.`);
                }
            }
        }
        console.log('[parseJsonFields] Final req.body after parsing:', req.body);
        next();
    } catch (error) {
        return res.status(400).json({ message: `Invalid JSON in one of the fields: ${error.message}` });
    }
};