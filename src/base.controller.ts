import { Router } from "express";
import IController from "interfaces/controller.interface";
import { Route, RouteHandler } from "types/postman";

export default abstract class BaseController implements IController {
    public router = Router();
    public path: string;

    protected initializeRoutes() {
        this.routes.forEach(route => {
            // This is a hack to get the type of the router method.
            const routerMethod = route.method as keyof typeof this.router;
            // 1. route.method is a string, but we want to use it as a key of the router object.
            // 2. keyof typeof this.router returns a union type of the keys of the router object. In this case, it's "get" | "post" | "patch" | "delete".
            // 3. We use the union type to index the router object, and get the type of the method.

            if (!this.router[routerMethod]) {
                throw new Error(`Unsupported HTTP method: ${route.method}`);
            }

            // We're using the router method as a function so this.router[routerMethod] is a function, which we call with the arguments.
            (<RouteHandler>this.router[routerMethod])(route.path, route.localMiddleware || [], route.handler);
        });
    }

    protected abstract routes: Route<unknown>[];
}
