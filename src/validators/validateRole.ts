import { Request, Response, NextFunction } from "express";

import { AccessError } from "../utils/errors";
import { Role } from "../models/user";

function validateRole(role: Role): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user)
            throw new Error("User is undefined.");

        const userData: any = req.user; // Чтобы TypeScript не выдавал ошибку

        if (userData.role & role)
            next();
        else {
            res.status(403).json({ errors: [
                new AccessError(
                    req.originalUrl,
                    "У вас недостаточно прав для доступа к указанному ресурсу."
                )
            ]});
        }
    };
}

export default validateRole;