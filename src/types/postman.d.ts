import { Request, Response, NextFunction, RequestHandler } from "express";
import IDíj from "díj/díj.interface";
import IUser from "user/user.interface";
import IKiszállítás from "kiszállítás/kiszállítás.interface";

export type Variable = {
    key?: string;
    value: string;
    description: string;
};

export type Route = {
    method: string;
    path: string;
    handler: (req: Request, res: Response, next?: NextFunction) => Promise<void> | void;
    localMiddleware?: RequestHandler[];
    variable?: Variable[];
    body?: IDíj | IUser | IKiszállítás;
};
