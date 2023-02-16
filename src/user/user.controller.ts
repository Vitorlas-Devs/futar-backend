import { Router, Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "./user.dto";
import UserNotFoundException from "../exceptions/UserNotFoundException";
import IdNotValidException from "../exceptions/IdNotValidException";
import HttpException from "../exceptions/HttpException";
import userModel from "./user.model";
import díjModel from "../díj/díj.model";
import { IUser, exampleUser } from "./user.interface";
import { Route } from "../types/postman";

export default class UserController implements IController {
    public path = "/users";
    public router = Router();
    private user = userModel;
    private díj = díjModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.routes.forEach((route: Route) => {
            const routerMethod = (this.router as any)[route.method];
            if (!routerMethod) {
                throw new Error(`Unsupported HTTP method: ${route.method}`);
            }
            routerMethod.call(this.router, route.path, route.localMiddleware, route.handler);
        });
    }

    private getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.user.find().then(users => {
                res.send(users);
            });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                // const userQuery = this.user.findById(id);
                // if (request.query.withDíjak === "true") {
                //     userQuery.populate("díjak").exec();
                // }
                const user = await this.user.findById(id).populate("díjak");
                if (user) {
                    res.send(user);
                } else {
                    next(new UserNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const userData: IUser = req.body;
                const user = await this.user.findByIdAndUpdate(id, userData, { new: true });
                if (user) {
                    res.send(user);
                } else {
                    next(new UserNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const successResponse = await this.user.findByIdAndDelete(id);
                if (successResponse) {
                    res.sendStatus(200);
                } else {
                    next(new UserNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getAllDíjakOfLoggedUser = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const id = req.user._id; // Stored user's ID in Cookie
            const díjak = await this.díj.find({ author: id });
            res.send(díjak);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getAllDíjakOfUserByID = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (Types.ObjectId.isValid(req.params.id)) {
                const id: string = req.params.id;
                const díjak = await this.díj.find({ author: id });
                res.send(díjak);
            } else {
                next(new IdNotValidException(req.params.id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    public routes = [
        {
            path: `${this.path}/díjak/:id`,
            method: "get",
            handler: this.getAllDíjakOfUserByID,
            localMiddleware: [authMiddleware],
            variable: [{ value: "1", description: "A user ID-ja aminek a díjait lekérdezzük" }],
        },
        {
            path: `${this.path}/díjak/`,
            method: "get",
            handler: this.getAllDíjakOfLoggedUser,
            localMiddleware: [authMiddleware],
        },
        {
            path: `${this.path}/:id`,
            method: "get",
            handler: this.getUserById,
            localMiddleware: [authMiddleware],
            variable: [{ value: "1", description: "A user ID-ja akit lekérdezzük" }],
        },
        {
            path: this.path,
            method: "get",
            handler: this.getAllUsers,
            localMiddleware: [authMiddleware],
        },
        {
            path: `${this.path}/:id`,
            method: "patch",
            handler: this.modifyUser,
            localMiddleware: [authMiddleware, validationMiddleware(CreateUserDto, true)],
            variable: [{ value: "1", description: "A user ID-ja akit módosítunk" }],
            body: exampleUser,
        },
        {
            path: `${this.path}/:id`,
            method: "delete",
            handler: this.deleteUser,
            localMiddleware: [authMiddleware],
            variable: [{ value: "1", description: "A user ID-ja akit törölünk" }],
        },
    ];
}
