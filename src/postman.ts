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
        // Create a collection of controllers.
        const controllers = [new DíjController(), new KiszállításController(), new UserController(), new AuthenticationController()];

        controllers.forEach(controller => {
            // This code gets the name of the controller by removing the word "Controller"
            // from the end of the constructor name. For example, if the constructor name
            // is "UserController", the controller name will be "User".
            const controllerName = controller.constructor.name.replace("Controller", "");

            // This function is used to add an item to the controller's item list.
            // The controller's name is passed in as a parameter.
            const controllerItem = {
                name: controllerName,
                item: <any>[],
            };

            controller.routes.forEach((route: Route<unknown>) => {
                // destructure the route object to get the method, path, variable, handler, and body
                const { method, path, variable, handler, body } = route;

                // destructure the handler object to get the name
                const { name } = handler;

                // this code converts camelCase to sentence case
                const requestName = name.replace(/([a-z])([A-Z])|^./g, (match, p1, p2) => {
                    return p1 ? p1 + " " + p2 : match.toUpperCase();
                });

                // This code removes the question mark from the path, returning only the parameters.
                // For example, if the path is "/api/user/:id?", the params will be "/api/user/:id".
                // This is necessary because Postman does not support optional parameters.
                const params = path.replace(/\?/g, "");

                // This code creates the variables array for the Postman route, which are in the path.
                const variables = (variable || []).map((v, i) => {
                    // It maps through the variable array and returns an object with the value, description, and key
                    const { value, description } = v;

                    // The key is created by mapping through the matchAll method on params and replacing the colons with an empty string
                    const key = [...params.matchAll(/:[a-z]+/g)].map(m => m[0].replace(":", ""))[i];

                    return { key, value, description };
                });

                // The following code converts the body object to a string, then stores it in the bodyRaw variable.
                // It is used by the response object to display the body of the request.
                // Also note that the _id property is removed from the body object.
                const bodyRaw = route.body ? JSON.stringify(body, (key, value) => (key === "_id" ? undefined : value), 4) : "";

                // This code is used to generate the route item for the postman collection.
                // It will create a route item that contains the name, request, and response of a request.
                // It will create the request for the route item by taking in the name, method, path, body, and params.
                // It will also create the variables for the request by taking in the path.
                // It will then create the route item with the route name, request, and response.
                // The route item will be returned.
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
                // This code adds the route item to the controller item.
                controllerItem.item.push(routeItem);
            });
            // This code adds the folder to the collection.
            this.collection.item.push(controllerItem);
        });
        this.collectionString = JSON.stringify(this.collection, null, 2);
    }
}
