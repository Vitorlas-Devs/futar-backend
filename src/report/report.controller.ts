import { Request, Response, Router } from "express";

import IController from "../interfaces/controller.interface";

export default class ReportController implements IController {
    public path = "/report";
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", (req: Request, res: Response) => {
            res.send("Hello Futár!");
        });
    }
}
