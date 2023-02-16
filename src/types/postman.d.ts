import { Request, Response, NextFunction, RequestHandler } from "express";
import { Method } from "express-serve-static-core";

export type Variable = {
    key?: string;
    value: string;
    description: string;
};

export type Route<T> = {
    method: Method;
    path: string;
    handler: (req: Request, res: Response, next?: NextFunction) => Promise<void> | void;
    localMiddleware?: RequestHandler[];
    variable?: Variable[];
    body?: T;
};
