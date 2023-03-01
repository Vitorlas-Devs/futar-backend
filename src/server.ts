import App from "./app";
import AuthenticationController from "./authentication/authentication.controller";
import DíjController from "./díj/díj.controller";
import KiszállításController from "./kiszállítás/kiszállítás.controller";
import ReportController from "./report/report.controller";
import UserController from "./user/user.controller";

const app = new App([new DíjController(), new AuthenticationController(), new UserController(), new ReportController(), new KiszállításController()]);

app.listen();
