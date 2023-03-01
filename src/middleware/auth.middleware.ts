import { NextFunction, Response } from "express";

import SessionExpiredException from "./../exceptions/SessionExpiredException";
import IRequestWithUser from "./../interfaces/requestWithUser.interface";
import ISession from "./../interfaces/session.interface";
import userModel from "./../user/user.model";

export default async function authMiddleware(req: IRequestWithUser, res: Response, next: NextFunction): Promise<void> {
    if (req.session.id && (req.session as ISession).user_id) {
        try {
            const user = await userModel.findById((req.session as ISession).user_id);
            if (user) {
                req.user = user;
                next();
            } else {
                next(new SessionExpiredException());
            }
        } catch (error) {
            next(new SessionExpiredException());
        }
    } else {
        next(new SessionExpiredException());
    }
}
