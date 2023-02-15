import { NextFunction, Request, Response, Router } from "express";

import IController from "../interfaces/controller.interface";
import CreateKiszállításDto from "./kiszállítás.dto";
import HttpException from "../exceptions/HttpException";
import IdNotValidException from "../exceptions/IdNotValidException";
import IKiszállítás from "./kiszállítás.interface";
import KiszállításNotFoundException from "../exceptions/KiszállításNotFoundException";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import { Types } from "mongoose";
import authMiddleware from "../middleware/auth.middleware";
import kiszállításModel from "./kiszállítás.model";
import validationMiddleware from "../middleware/validation.middleware";

export default class KiszállításController implements IController {
    public path = "/kiszallitasok";
    public router = Router();
    private kiszállításM = kiszállításModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllKiszállítások);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getKiszállításById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, authMiddleware, this.getPaginatedKiszállítások);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateKiszállításDto, true)], this.modifyKiszállítás);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteKiszállítások);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateKiszállításDto)], this.createKiszállítás);
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
            let kiszállítások = [];
            let count = 0;
            if (req.params.keyword) {
                const myRegex = new RegExp(req.params.keyword, "i"); // i for case insensitive
                count = await this.kiszállításM.find({ $or: [{ kiszállításName: myRegex }, { description: myRegex }] }).count();
                kiszállítások = await this.kiszállításM
                    .find({ $or: [{ kiszállításName: myRegex }, { description: myRegex }] })
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
            const createdKiszállítás = new this.kiszállításM({
                ...kiszállításData,
            });
            const savedKiszállítás = await createdKiszállítás.save();
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
}
