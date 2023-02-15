import KiszállításController from "./kiszállítás/kiszállítás.controller";
import DíjController from "./díj/díj.controller";

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
        const controllers = [new DíjController(), new KiszállításController()];
        controllers.forEach(controller => {
            const controllerName = controller.constructor.name.replace("Controller", "");
            const controllerItem = {
                name: controllerName,
                item: <any>[],
            };
            controller.routes.forEach(route => {
                const routeItem = {
                    name: route.method + " " + route.path,
                    request: {
                        method: route.method,
                        header: <any>[],
                        body: {
                            mode: "raw",
                            raw: "",
                        },
                        url: {
                            raw: "http://localhost:5000" + route.path,
                            protocol: "http",
                            host: ["localhost"],
                            port: "5000",
                            path: [route.path],
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
