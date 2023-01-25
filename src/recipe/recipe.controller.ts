import { NextFunction, Request, Response, Router } from "express";

import IController from "../interfaces/controller.interface";
import CreateRecipeDto from "./recipe.dto";
import HttpException from "../exceptions/HttpException";
import IdNotValidException from "../exceptions/IdNotValidException";
import IRecipe from "./recipe.interface";
import RecipeNotFoundException from "../exceptions/RecipeNotFoundException";
import IRequestWithUser from "../interfaces/requestWithUser.interface";
import { Types } from "mongoose";
import authMiddleware from "../middleware/auth.middleware";
import recipeModel from "./recipe.model";
import validationMiddleware from "../middleware/validation.middleware";

export default class RecipeController implements IController {
    public path = "/recipes";
    public router = Router();
    private recipeM = recipeModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, authMiddleware, this.getAllRecipes);
        this.router.get(`${this.path}/:id`, authMiddleware, this.getRecipeById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, authMiddleware, this.getPaginatedRecipes);
        this.router.patch(`${this.path}/:id`, [authMiddleware, validationMiddleware(CreateRecipeDto, true)], this.modifyRecipe);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.deleteRecipes);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateRecipeDto)], this.createRecipe);
    }

    private getAllRecipes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const count = await this.recipeM.countDocuments();
            const recipes = await this.recipeM.find();
            res.send({ count: count, recipes: recipes });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getPaginatedRecipes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            let recipes = [];
            let count = 0;
            if (req.params.keyword) {
                const myRegex = new RegExp(req.params.keyword, "i"); // i for case insensitive
                count = await this.recipeM.find({ $or: [{ recipeName: myRegex }, { description: myRegex }] }).count();
                recipes = await this.recipeM
                    .find({ $or: [{ recipeName: myRegex }, { description: myRegex }] })
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.recipeM.countDocuments();
                recipes = await this.recipeM
                    .find({})
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.send({ count: count, recipes: recipes });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const recipe = await this.recipeM.findById(id).populate("author", "-password");
                if (recipe) {
                    res.send(recipe);
                } else {
                    next(new RecipeNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private modifyRecipe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const recipeData: IRecipe = req.body;
                const recipe = await this.recipeM.findByIdAndUpdate(id, recipeData, { new: true });
                if (recipe) {
                    res.send(recipe);
                } else {
                    next(new RecipeNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private createRecipe = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const recipeData: IRecipe = req.body;
            const createdRecipe = new this.recipeM({
                ...recipeData,
                author: req.user._id,
            });
            const savedRecipe = await createdRecipe.save();
            await savedRecipe.populate("author", "-password");
            res.send(savedRecipe);
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };

    private deleteRecipes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;
            if (Types.ObjectId.isValid(id)) {
                const successResponse = await this.recipeM.findByIdAndDelete(id);
                if (successResponse) {
                    res.sendStatus(200);
                } else {
                    next(new RecipeNotFoundException(id));
                }
            } else {
                next(new IdNotValidException(id));
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
