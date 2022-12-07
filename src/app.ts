import favicon from "serve-favicon";
import path from "path";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";
import morgan from "morgan";

export default class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen(): void {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    public getServer(): express.Application {
        return this.app;
    }

    private initializeMiddlewares() {
        try {
            this.app.use(favicon(path.join(__dirname, "../favicon.ico")));
        } catch (error) {
            console.log(error.message);
        }
        this.app.use(express.json());
        this.app.use(cookieParser());

        // set and use cors
        // const myCorsOptions: cors.CorsOptions = {
        //     origin: ["https://epitmenyado.netlify.app", "http://localhost:8080", "http://127.0.0.1:8080"],
        //     allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie", "Cache-Control", "Content-Language", "Expires", "Last-Modified", "Pragma"],
        //     exposedHeaders: ["Set-Cookie"],
        //     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        //     credentials: true,
        // };
        const myCorsOptions: cors.CorsOptions = {
            origin: ["https://epitmenyado.netlify.app", "http://localhost:8080", "http://127.0.0.1:8080"],
            credentials: true,
        };
        this.app.use(cors(myCorsOptions));

        // trust first proxy (If you have your node.js behind a proxy and are using secure: true,
        // you need to set "trust proxy" in express)
        this.app.set("trust proxy", 1);

        // Logger:
        if (process.env.NODE_ENV === "development") this.app.use(morgan(":method :url status=:status :date[iso] rt=:response-time ms"));
        if (process.env.NODE_ENV === "deployment") this.app.use(morgan("tiny"));
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach(controller => {
            this.app.use("/", controller.router);
        });
    }

    private connectToTheDatabase() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH, MONGO_DB } = process.env;
        // Connect to MongoDB Atlas, create database if not exist::
        mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}${MONGO_DB}?retryWrites=true&w=majority`, err => {
            if (err) {
                console.log("Unable to connect to the server. Please start MongoDB.");
            }
        });

        mongoose.connection.on("error", error => {
            console.log(`Mongoose error message: ${error.message}`);
        });
        mongoose.connection.on("connected", () => {
            console.log("Connected to MongoDB server.");
        });
    }
}
