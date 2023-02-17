import { Router, Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import IController from "../interfaces/controller.interface";
import authMiddleware from "../middleware/auth.middleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "./user.dto";
import UserNotFoundException from "../exceptions/UserNotFoundException";
import IdNotValidException from "../exceptions/IdNotValidException";
import HttpException from "../exceptions/HttpException";
import userModel from "./user.model";
import IUser, { exampleUser } from "./user.interface";
import { Route, RouteHandler } from "../types/postman";

export default class UserController implements IController {
    public path = "/users";
    public router = Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.routes.forEach(route => {
            const routerMethod = route.method as keyof typeof this.router;
            if (!this.router[routerMethod]) {
                throw new Error(`Unsupported HTTP method: ${route.method}`);
            }
            (<RouteHandler>this.router[routerMethod])(route.path, route.localMiddleware, route.handler);
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
                const user = await this.user.findById(id);
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

    public routes: Route<IUser>[] = [
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
