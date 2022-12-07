import { Request, Response, Router, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import IUtcak from "./utcak.interface";
import utcakModel from "./utcak.model";
import HttpException from "../exceptions/HttpException";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUtcakDto from "./utcak.dto";

export default class utcakController implements Controller {
    public path = "/api/utcak";
    public router = Router();
    private utcakM = utcakModel;

    constructor() {
        this.router.get(this.path, this.getAll);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, authMiddleware, this.getPaginatedUtcak);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateUtcakDto, false)], this.create);
        this.router.patch(`${this.path}/:id`, authMiddleware, this.modifyPATCH);
        this.router.put(`${this.path}/:id`, authMiddleware, this.modifyPUT);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.delete);
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.utcakM.find().populate("adosav", "-_id");
            res.send(data);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const document = await this.utcakM.findById(id);
            if (document) {
                res.send(document);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedUtcak = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            let utcak = [];
            let count = 0;
            if (req.params.keyword) {
                const regex = new RegExp(req.params.keyword, "i"); // i for case insensitive
                count = await this.utcakM.find({ $or: [{ utca: { $regex: regex } }, { hazszam: { $regex: regex } }] }).count();
                utcak = await this.utcakM
                    .find({ $or: [{ utca: { $regex: regex } }, { hazszam: { $regex: regex } }] })
                    .populate("adosav", "-_id")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.utcakM.countDocuments();
                utcak = await this.utcakM
                    .find({})
                    .populate("adosav", "-_id")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.send({ count: count, utcak: utcak });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body: IUtcak = req.body;
            const createdDocument = new this.utcakM({
                ...body,
            });
            const savedDocument = await createdDocument.save();
            res.send(savedDocument);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyPATCH = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const body: IUtcak = req.body;
            const updatedDoc = await this.utcakM.findByIdAndUpdate(id, body, { new: true, runValidators: true });
            if (updatedDoc) {
                res.send(updatedDoc);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyPUT = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const body = req.body;
            const modificationResult = await this.utcakM.replaceOne({ _id: id }, body, { runValidators: true });
            if (modificationResult.modifiedCount) {
                const updatedDoc = await this.utcakM.findById(id).populate("adosav", "-_id");
                res.send(updatedDoc);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const successResponse = await this.utcakM.findByIdAndDelete(id);
            if (successResponse) {
                res.sendStatus(200);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
