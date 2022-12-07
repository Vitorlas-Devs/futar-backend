import { Request, Response, Router, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import adosavokModel from "./adosavok.model";
import HttpException from "../exceptions/HttpException";
import authMiddleware from "../middleware/auth.middleware";
import IAdosavok from "./adosavok.interface";
import utcakModel from "../utcak/utcak.model";
import validationMiddleware from "../middleware/validation.middleware";
import CreateAdosavokDto from "./adosavok.dto";

export default class adosavokController implements Controller {
    public path = "/api/adosavok";
    public router = Router();
    private adosavokM = adosavokModel;
    private utcakM = utcakModel;

    constructor() {
        this.router.get(this.path, this.getAll);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getById);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateAdosavokDto, false)], this.create);
        this.router.patch(`${this.path}/:id`, authMiddleware, this.modifyPATCH);
        this.router.put(`${this.path}/:id`, authMiddleware, this.modifyPUT);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.delete);
    }

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.adosavokM.find();
            res.send(data);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            const document = await this.adosavokM.findById(id);
            if (document) {
                res.send(document);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body: IAdosavok = req.body;
            const createdDocument = new this.adosavokM({
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
            const body: IAdosavok = req.body;
            const updatedDoc = await this.adosavokM.findByIdAndUpdate(id, body, { new: true, runValidators: true });
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
            const modificationResult = await this.adosavokM.replaceOne({ _id: id }, body, { runValidators: true });
            if (modificationResult.modifiedCount) {
                const updatedDoc = await this.adosavokM.findById(id);
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
            const isDocumentExists = await this.adosavokM.findById(id);
            if (isDocumentExists) {
                const hasRelation = await this.utcakM.findOne({ adosav: { $eq: id } });
                if (hasRelation) {
                    // can't delete:
                    // res.status(400).send({ message: `Document with id ${id} has relation(s), you can't delete!` });
                    next(new HttpException(400, `Document with id=${id} has relation(s), you can't delete!`));
                } else {
                    // try delete
                    const successResponse = await this.adosavokM.findByIdAndDelete(id);
                    if (successResponse) {
                        res.sendStatus(200);
                    } else {
                        res.status(404).send({ message: `Document with id=${id} not found!` });
                    }
                }
            } else {
                res.status(404).send({ message: `Document with id=${id} not found!` });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
