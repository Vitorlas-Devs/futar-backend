import { config } from "dotenv";
import App from "./app";
import AuthenticationController from "./authentication/authentication.controller";
import UserController from "./user/user.controller";
import utcakController from "./utcak/utcak.controller";
import adosavokController from "./adosavok/adosavok.controller";

config(); // Read and set variables from .env file.

const app = new App([new AuthenticationController(), new UserController(), new utcakController(), new adosavokController()]);

app.listen();
