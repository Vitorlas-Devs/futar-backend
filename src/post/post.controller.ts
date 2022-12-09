import { Router, Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import PostNotFoundException from "../exceptions/PostNotFoundException";
import IdNotValidException from "../exceptions/IdNotValidException";
import HttpException from "../exceptions/HttpException";
import IController from "../interfaces/controller.interface";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import authMiddleware from "../middleware/auth.middleware";
import roleCheckMiddleware from "../middleware/roleCheckMiddleware";
import validationMiddleware from "../middleware/validation.middleware";
import CreatePostDto from "./post.dto";
import IPost from "./post.interface";
import postModel from "./post.model";

export default class PostController implements IController {
    public path = "/posts";
    public router = Router();
    private post = postModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, [authMiddleware, roleCheckMiddleware(["admin"])], this.getAllPosts);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getPostById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, [authMiddleware, roleCheckMiddleware(["admin"])], this.getPaginatedPosts);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreatePostDto, true)], this.modifyPost);
        this.router.delete(`${this.path}/:id`, [authMiddleware, roleCheckMiddleware(["admin"])], this.deletePost);
        this.router.post(this.path, [authMiddleware, roleCheckMiddleware(["admin"]), validationMiddleware(CreatePostDto)], this.createPost);
    }

    private getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const posts = await this.post.find().populate("author", "-password");
            const count = await this.post.countDocuments();
            const posts = await this.post.find();
            res.send({ count: count, posts: posts });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            let posts = [];
            let count = 0;
            if (req.params.keyword && req.params.keyword != "") {
                const myRegex = new RegExp(req.params.keyword, "i"); // i for case insensitive
                count = await this.post.find({ $or: [{ title: myRegex }, { content: myRegex }] }).count();
                posts = await this.post
                    .find({ $or: [{ title: myRegex }, { content: myRegex }] })
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.post.countDocuments();
                posts = await this.post
                    .find({})
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.send({ count: count, posts: posts });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPostById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const post = await this.post.findById(id).populate("author", "-password");
                if (post) {
                    res.send(post);
                } else {
                    next(new PostNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const postData: IPost = req.body;
                const post = await this.post.findByIdAndUpdate(id, postData, { new: true });
                if (post) {
                    res.send(post);
                } else {
                    next(new PostNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private createPost = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const postData: IPost = req.body;
            const createdPost = new this.post({
                ...postData,
                author: req.user._id,
            });
            const savedPost = await createdPost.save();
            await savedPost.populate("author", "-password");
            const count = await this.post.countDocuments();
            res.send({ count: count, post: savedPost });
            // res.send(savedPost);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deletePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const successResponse = await this.post.findByIdAndDelete(id);
                if (successResponse) {
                    // const count = await this.post.countDocuments();
                    // res.send({ count: count, status: 200 });
                    res.sendStatus(200);
                } else {
                    next(new PostNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
