import { Router, Request, Response, NextFunction } from "express";

import IController from "../interfaces/controller.interface";
import CreateKiszállításDto from "./kiszállítás.dto";
import HttpException from "../exceptions/HttpException";
import IKiszállítás, { exampleKiszállítás } from "../kiszállítás/kiszállítás.interface";
import KiszállításNotFoundException from "../exceptions/KiszállításNotFoundException";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import kiszállításModel from "./kiszállítás.model";
import validationMiddleware from "../middleware/validation.middleware";
import { Route, RouteHandler } from "../types/postman";

export default class KiszállításController implements IController {
    public path = "/kiszallitasok";
    public router = Router();
    private kiszállításM = kiszállításModel;

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
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
            (<RouteHandler>this.router[routerMethod])(route.path, route.localMiddleware, route.handler);
        });
    }

    private getAllKiszállítások = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.kiszállításM.countDocuments();
            const kiszállítások = await this.kiszállításM.find().populate("díj", "-_id");
            res.send({ count: count, kiszállítások: kiszállítások });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedKiszállítások = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            const keyword = parseInt(req.params.keyword);
            let kiszállítások = [];
            let count = 0;
            if (keyword) {
                count = await this.kiszállításM.find({ $or: [{ _id: keyword }, { nap: keyword }, { sorszám: keyword }, { megtettÚt: keyword }] }).count();
                kiszállítások = await this.kiszállításM
                    .find({ $or: [{ _id: keyword }, { nap: keyword }, { sorszám: keyword }, { megtettÚt: keyword }] })
                    .populate("díj", "-_id")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.kiszállításM.countDocuments();
                kiszállítások = await this.kiszállításM
                    .find({})
                    .populate("díj", "-_id")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.send({ count: count, kiszállítások: kiszállítások });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getKiszállításById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const kiszállítás = await this.kiszállításM.findById(id).populate("díj", "-_id");
            if (kiszállítás) {
                res.send(kiszállítás);
            } else {
                next(new KiszállításNotFoundException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyKiszállítás = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const kiszállításData: IKiszállítás = req.body;
            const kiszállítás = await this.kiszállításM.findByIdAndUpdate(id, kiszállításData, { new: true });
            if (kiszállítás) {
                res.send(kiszállítás);
            } else {
                next(new KiszállításNotFoundException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private createKiszállítás = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const kiszállításData: IKiszállítás = req.body;
            const lastKiszállítás = await this.kiszállításM.findOne().sort({ _id: -1 });
            kiszállításData._id = lastKiszállítás ? lastKiszállítás._id + 1 : 1;
            const savedKiszállítás = await this.kiszállításM.create(kiszállításData);
            await savedKiszállítás.populate("díj", "-_id");
            res.send(savedKiszállítás);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteKiszállítások = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const successResponse = await this.kiszállításM.findByIdAndDelete(id);
            if (successResponse) {
                res.sendStatus(200);
            } else {
                next(new KiszállításNotFoundException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    public routes: Route<IKiszállítás>[] = [
        {
            path: this.path,
            method: "get",
            handler: this.getAllKiszállítások,
            localMiddleware: [authMiddleware],
        },
        {
            path: `${this.path}/:id`,
            method: "get",
            handler: this.getKiszállításById,
            localMiddleware: [authMiddleware],
            variable: [{ value: "1", description: "Kiszállítás ID-ja amit lekérünk" }],
        },
        {
            path: `${this.path}/:offset/:limit/:order/:sort/:keyword?`,
            method: "get",
            handler: this.getPaginatedKiszállítások,
            localMiddleware: [authMiddleware],
            variable: [
                { value: "0", description: "Hányadik rekordtól kezdjük?" },
                { value: "10", description: "Lekért rekordok száma" },
                { value: "sorszám", description: "Melyik mező szerint rendezzük?" },
                { value: "1", description: "1: növekvő, -1: csökkenő" },
                { value: "", description: "Keresési kulcsszó" },
            ],
        },
        {
            path: `${this.path}/:id`,
            method: "patch",
            handler: this.modifyKiszállítás,
            localMiddleware: [authMiddleware, validationMiddleware(CreateKiszállításDto, true)],
            variable: [{ value: "1", description: "Kiszállítás ID-ja amit módosítunk" }],
            body: exampleKiszállítás,
        },
        {
            path: `${this.path}/:id`,
            method: "delete",
            handler: this.deleteKiszállítások,
            localMiddleware: [authMiddleware],
            variable: [{ value: "1", description: "Kiszállítás ID-ja amit törlünk" }],
        },
        {
            path: this.path,
            method: "post",
            handler: this.createKiszállítás,
            localMiddleware: [authMiddleware, validationMiddleware(CreateKiszállításDto)],
            body: exampleKiszállítás,
        },
    ];
}
