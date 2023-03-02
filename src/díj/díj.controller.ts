import { NextFunction, Request, Response } from "express";

import BaseController from "../base.controller";
import DíjNotFoundException from "../exceptions/DíjNotFoundException";
import HttpException from "../exceptions/HttpException";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import roleCheckMiddleware from "../middleware/roleCheckMiddleware";
import validationMiddleware from "../middleware/validation.middleware";
import { Route } from "../types/postman";
import CreateDíjDto from "./díj.dto";
import IDíj, { exampleDíj } from "./díj.interface";
import díjModel from "./díj.model";

export default class DíjController extends BaseController {
    public path = "/dij";
    private díj = díjModel;

    constructor() {
        super();
        this.initializeRoutes();
    }

    private getAllDíj = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.díj.countDocuments();
            const díjak = await this.díj.find();
            res.send({ count, díjak });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedDíjak = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            const keyword = parseInt(req.params.keyword);
            let díjak = [];
            let count = 0;
            if (keyword) {
                count = await this.díj.find({ $or: [{ _id: keyword }, { minKm: keyword }, { minKm: keyword }, { összeg: keyword }] }).count();
                díjak = await this.díj
                    .find({ $or: [{ _id: keyword }, { minKm: keyword }, { minKm: keyword }, { összeg: keyword }] })
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.díj.countDocuments();
                díjak = await this.díj
                    .find({})
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.send({ count: count, díjak: díjak });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getDíjById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const díj = await this.díj.findById(id);
            if (díj) {
                res.send(díj);
            } else {
                next(new DíjNotFoundException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyDíj = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const díjData: IDíj = req.body;
            const options = { new: true, runValidators: true };
            const díj = await this.díj.findByIdAndUpdate(id, díjData, options);
            if (díj) {
                res.send(díj);
            } else {
                next(new DíjNotFoundException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private createDíj = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const díjData: IDíj = req.body;
            const lastDíj = await this.díj.findOne().sort({ _id: -1 });
            díjData._id = lastDíj ? lastDíj._id + 1 : 1;
            const savedDíj = await this.díj.create(díjData);
            const count = await this.díj.countDocuments();
            res.send({ count: count, díj: savedDíj });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteDíj = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const successResponse = await this.díj.findByIdAndDelete(id);
            if (successResponse) {
                res.sendStatus(200);
            } else {
                next(new DíjNotFoundException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    public routes: Route<IDíj>[] = [
        {
            path: this.path,
            method: "get",
            handler: this.getAllDíj,
            localMiddleware: [authMiddleware],
        },
        {
            path: `${this.path}/:id`,
            method: "get",
            handler: this.getDíjById,
            localMiddleware: [authMiddleware],
            variable: [{ value: "1", description: "Díj ID-ja amit lekérünk" }],
        },
        {
            path: `${this.path}/:offset/:limit/:order/:sort/:keyword?`,
            method: "get",
            handler: this.getPaginatedDíjak,
            localMiddleware: [authMiddleware],
            variable: [
                { value: "0", description: "Hányadik rekordtól kezdjük?" },
                { value: "10", description: "Lekért rekordok száma" },
                { value: "összeg", description: "Melyik mező szerint rendezzük?" },
                { value: "1", description: "1: növekvő, -1: csökkenő" },
                { value: "", description: "Keresési kulcsszó" },
            ],
        },
        {
            path: `${this.path}/:id`,
            method: "patch",
            handler: this.modifyDíj,
            localMiddleware: [authMiddleware, validationMiddleware(CreateDíjDto, true)],
            variable: [{ value: "1", description: "Díj ID-ja amit módosítunk" }],
            body: exampleDíj,
        },
        {
            path: `${this.path}/:id`,
            method: "delete",
            handler: this.deleteDíj,
            localMiddleware: [authMiddleware, roleCheckMiddleware(["admin"])],
            variable: [{ value: "1", description: "Díj ID-ja amit törlünk" }],
        },
        {
            path: this.path,
            method: "post",
            handler: this.createDíj,
            localMiddleware: [authMiddleware, roleCheckMiddleware(["admin"]), validationMiddleware(CreateDíjDto)],
            body: exampleDíj,
        },
    ];
}
