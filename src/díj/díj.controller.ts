import { Router, Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import DíjNotFoundException from "../exceptions/DíjNotFoundException";
import IdNotValidException from "../exceptions/IdNotValidException";
import HttpException from "../exceptions/HttpException";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import roleCheckMiddleware from "../middleware/roleCheckMiddleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreateDíjDto from "./díj.dto";
import IDíj from "./díj.interface";
import díjModel from "./díj.model";

export default class DíjController implements IController {
    public path = "/díj";
    public router = Router();
    private díj = díjModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, [authMiddleware, roleCheckMiddleware(["admin"])], this.getAllDíj);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getDíjById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, [authMiddleware, roleCheckMiddleware(["admin"])], this.getPaginatedDíjs);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateDíjDto, true)], this.modifyDíj);
        this.router.delete(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["admin"])], this.deleteDíj);
        this.router.post(this.path, [authMiddleware, roleCheckMiddleware(["admin"]), validationMiddleware(CreateDíjDto)], this.createDíj);
    }

    private getAllDíj = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const díjak = await this.díj.find().populate("author", "-password");
            const count = await this.díj.countDocuments();
            const díjak = await this.díj.find();
            res.send({ count: count, díjak: díjak });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedDíjs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            let díjak = [];
            let count = 0;
            if (req.params.keyword && req.params.keyword != "") {
                const myRegex = new RegExp(req.params.keyword, "i"); // i for case insensitive
                count = await this.díj.find({ $or: [{ title: myRegex }, { content: myRegex }] }).count();
                díjak = await this.díj
                    .find({ $or: [{ title: myRegex }, { content: myRegex }] })
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
            if (Types.ObjectId.isValid(id)) {
                const díj = await this.díj.findById(id).populate("author", "-password");
                if (díj) {
                    res.send(díj);
                } else {
                    next(new DíjNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyDíj = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const díjData: IDíj = req.body;
                const díj = await this.díj.findByIdAndUpdate(id, díjData, { new: true });
                if (díj) {
                    res.send(díj);
                } else {
                    next(new DíjNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private createDíj = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const díjData: IDíj = req.body;
            const createdDíj = new this.díj({
                ...díjData,
                author: req.user._id,
            });
            const savedDíj = await createdDíj.save();
            await savedDíj.populate("author", "-password");
            const count = await this.díj.countDocuments();
            res.send({ count: count, díj: savedDíj });
            // res.send(savedDíj);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteDíj = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const successResponse = await this.díj.findByIdAndDelete(id);
                if (successResponse) {
                    // const count = await this.díj.countDocuments();
                    // res.send({ count: count, status: 200 });
                    res.sendStatus(200);
                } else {
                    next(new DíjNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
