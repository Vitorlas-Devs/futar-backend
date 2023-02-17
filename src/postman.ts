import KiszállításController from "./kiszállítás/kiszállítás.controller";
import DíjController from "./díj/díj.controller";
import UserController from "./user/user.controller";
import AuthenticationController from "./authentication/authentication.controller";
import { Route } from "./types/postman";

export default class PostmanCollectionCreator {
    public collectionString: string;

    constructor() {
        this.createCollection();
    }

    private collection = {
        info: {
            _postman_id: "12ec885d-0aa9-453d-9729-7f75305c835f",
            name: "Futár",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            _exporter_id: "23370412",
        },
        item: <any>[],
    };

    public createCollection() {
        const controllers = [new DíjController(), new KiszállításController(), new UserController(), new AuthenticationController()];
        controllers.forEach(controller => {
            const controllerName = controller.constructor.name.replace("Controller", "");
            const controllerItem = {
                name: controllerName,
                item: <any>[],
            };
            controller.routes.forEach((route: Route<unknown>) => {
                const { method, path, variable, handler, body } = route;
                const { name } = handler;
                const requestName = name.replace(/([a-z])([A-Z])|^./g, (match, p1, p2) => {
                    return p1 ? p1 + " " + p2 : match.toUpperCase();
                });
                const params = path.replace(/\?/g, "");
                const variables = (variable || []).map((v, i) => {
                    const { value, description } = v;
                    const key = [...params.matchAll(/:[a-z]+/g)].map(m => m[0].replace(":", ""))[i];
                    return { key, value, description };
                });
                const bodyRaw = route.body ? JSON.stringify(body, (key, value) => (key === "_id" ? undefined : value), 4) : "";

                const routeItem = {
                    name: requestName,
                    request: {
                        method: method,
                        header: <any>[],
                        body: {
                            mode: "raw",
                            raw: bodyRaw,
                            options: {
                                raw: {
                                    language: "json",
                                },
                            },
                        },
                        url: {
                            raw: "http://localhost:5000" + path,
                            protocol: "http",
                            host: ["localhost"],
                            port: "5000",
                            path: params.split("/"),
                            variable: variables,
                        },
                    },
                    response: <any>[],
                };
                controllerItem.item.push(routeItem);
            });

            this.collection.item.push(controllerItem);
        });
        this.collectionString = JSON.stringify(this.collection, null, 2);
    }
}
