import { IRouterMatcher, RequestHandler, RequestHandler, Router } from "express";
import { Method } from "express-serve-static-core";

type Variable = {
    key?: string;
    value: string;
    description: string;
};

type PathParams = string | RegExp | Array<string | RegExp>;

export type RouteHandler = ((path: PathParams, ...handlers: RequestHandler[]) => Router) & IRouterMatcher<Router>;

export type Route<T> = {
    method: Method;
    path: string;
    handler: RequestHandler;
    localMiddleware?: RequestHandler[];
    variable?: Variable[];
    body?: T;
};
