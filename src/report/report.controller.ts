import { Router, Request, Response, NextFunction } from "express";
import IController from "../interfaces/controller.interface";
import userModel from "../user/user.model";
import HttpException from "../exceptions/HttpException";

export default class ReportController implements IController {
    public path = "/report";
    public router = Router();
    private user = userModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", (req: Request, res: Response) => {
            res.send("Hello World!");
        });
        this.router.get(`${this.path}`, this.generateReport);
    }

    private generateReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const usersByCities = await this.user.aggregate([
                {
                    $match: {
                        "address.city": {
                            $exists: true,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            city: "$address.city",
                        },
                        users: {
                            $push: {
                                _id: "$_id",
                                name: "$name",
                            },
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $lookup: {
                        from: "posts",
                        localField: "users._id",
                        foreignField: "author",
                        as: "articles",
                    },
                },
                {
                    $addFields: {
                        amountOfArticles: {
                            $size: "$articles",
                        },
                    },
                },
                {
                    $sort: {
                        amountOfArticles: 1,
                    },
                },
            ]);
            res.send({
                usersByCities,
            });
            next();
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
