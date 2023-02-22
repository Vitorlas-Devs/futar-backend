import KiszállításController from "./kiszállítás/kiszállítás.controller";
import DíjController from "./díj/díj.controller";
import UserController from "./user/user.controller";
import AuthenticationController from "./authentication/authentication.controller";
import { Route } from "./types/postman";

export default class PostmanCollectionCreator {
    public collectionString: string;

    // ██████╗  ██████╗ ███████╗████████╗███╗   ███╗ █████╗ ███╗   ██╗
    // ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝████╗ ████║██╔══██╗████╗  ██║
    // ██████╔╝██║   ██║███████╗   ██║   ██╔████╔██║███████║██╔██╗ ██║
    // ██╔═══╝ ██║   ██║╚════██║   ██║   ██║╚██╔╝██║██╔══██║██║╚██╗██║
    // ██║     ╚██████╔╝███████║   ██║   ██║ ╚═╝ ██║██║  ██║██║ ╚████║ ╔══ Creator
    // ╚═╝      ╚═════╝ ╚══════╝   ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝═╝
    //
    // Notes:
    // ``````
    // × The Postman collection is created from the controllers and their routes.
    // × Every controller has to have a routes array.
    // × All of the variables are postman path variables. Query parameters we didn't touch.
    // × Postman allows to create examples for the requests. We don't.
    // × Fun fact: GPT stands for "Generative Postman Tools".

    constructor() {
        this.createCollection();
    }

    // initialize the collection object
    private collection = {
        info: {
            name: "Futár",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        item: <any>[],
    };

    public createCollection() {
        // Create a collection of controllers.
        const controllers = [new DíjController(), new KiszállításController(), new UserController(), new AuthenticationController()];

        controllers.forEach(controller => {
            // This code gets the name of the controller by removing the word "Controller"
            // from the end of the constructor name. For example, if the constructor name
            // is "UserController", the controller name will be "User", duh.
            const controllerName = controller.constructor.name.replace("Controller", "");

            // This is an empty folder.
            // The name of the folder is the controller's name.
            const collectionFolder = {
                name: controllerName,
                item: <any>[],
            };

            controller.routes.forEach((route: Route<unknown>) => {
                // destructure the route object to get the method, path, variable, handler, and body
                const { method, path, variable, handler, body } = route;

                // destructure the handler object too 🙄
                const { name } = handler;

                // this code converts "camelCase" to "sentence case"
                const requestName = name.replace(/([a-z])([A-Z])|^./g, (match, p1, p2) => {
                    return p1 ? p1 + " " + p2 : match.toUpperCase();
                });

                // This code removes the question mark from the path, returning only the parameters.
                // For example, if the path is "/api/user/:id?", the params will be "/api/user/:id".
                // This is necessary because Postman does not support optional parameters, and thinks they are query parameters.
                const params = path.replace(/\?/g, "");

                // This code creates the variables object from the path.
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
                // It will create a route item that contains the name, request, and body.
                // It will also create path variables for the request from the path.
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

                // This code adds the route item to the folder.
                collectionFolder.item.push(routeItem);
            });

            // This code adds the folder to the collection.
            this.collection.item.push(collectionFolder);
        });

        this.collectionString = JSON.stringify(this.collection, null, 2);
    }
}
