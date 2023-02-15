import App from "../../app";
import AuthenticationController from "../../authentication/authentication.controller";
import KiszállításController from "../kiszállítás.controller";
import request from "supertest";

let server: Express.Application;
let cookie: string | any;

beforeAll(async () => {
    // create server for test:
    server = new App([new AuthenticationController(), new KiszállításController()]).getServer();
    // get cookie for authentication
    const res = await request(server).post("/auth/login").send({
        email: "student001@jedlik.eu",
        password: "student001",
    });
    // set cookie
    cookie = res.headers["set-cookie"];
});

describe("test kiszállítások endpoints", () => {
    let id: string;

    it("GET /kiszallitasok", async () => {
        // get response with supertest-response:
        const response = await request(server).get("/kiszallitasok").set("Cookie", cookie);
        // check response with jest:
        expect(response.statusCode).toEqual(200);
        expect(response.body.count).toEqual(10); // basically 10
    });

    it("GET /kiszallitasok (missing cookie)", async () => {
        const response = await request(server).get("/kiszallitasok");
        expect(response.statusCode).toEqual(401);
        expect(response.body.message).toEqual("Session id missing or session has expired, please log in!");
    });

    it("GET /:offset/:limit/:order/:sort/:keyword? (search for 'keyword')", async () => {
        const response = await request(server).get("/kiszallitasok/0/5/discription/1/paradicsom").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.count).toEqual(2);
    });

    it("GET /:offset/:limit/:order/:sort/:keyword? (search for missing 'keyword')", async () => {
        const response = await request(server).get("/kiszallitasok/0/5/discription/1/goesiéhgesouihg").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.count).toEqual(0);
    });

    it("GET /:offset/:limit/:order/:sort/:keyword? (no last parameter 'keyword')", async () => {
        const response = await request(server).get("/kiszallitasok/0/5/discription/1").set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.count).toEqual(10);
    });

    it("GET /kiszallitasok/:id  (correct id)", async () => {
        id = "61dc03c0e397a1e9cf988b37";
        const response = await request(server).get(`/kiszallitasok/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
        expect(response.body.kiszállításName).toEqual("KELKÁPOSZTA FŐZELÉK");
    });

    it("GET /kiszallitasok/:id  (missing, but valid id)", async () => {
        id = "6367f3038ae13010a4c9ab49";
        const response = await request(server).get(`/kiszallitasok/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`Kiszállítás with id ${id} not found`);
    });

    it("GET /kiszallitasok/:id  (not valid object id)", async () => {
        id = "61dc03c0e397a1e9cf988b3";
        const response = await request(server).get(`/kiszallitasok/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });

    it("DELETE /kiszallitasok/:id  (not valid object id)", async () => {
        const response = await request(server).delete(`/kiszallitasok/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });

    it("PATCH /kiszallitasok/:id  (not valid object id)", async () => {
        const response = await request(server).patch(`/kiszallitasok/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`This ${id} id is not valid.`);
    });

    it("POST /kiszallitasok (with empty json object)", async () => {
        const response = await request(server).post("/kiszallitasok").set("Cookie", cookie);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual("kiszállításName must be a string,kiszállításName should not be empty, imageURL must be a string,imageURL must be an URL address,imageURL should not be empty, description must be a string,description should not be empty, ingredients should not be empty,ingredients must be an array");
    });

    it("POST /kiszallitasok", async () => {
        const response = await request(server)
            .post("/kiszallitasok")
            .set("Cookie", cookie)
            .send({
                kiszállításName: "Mock kiszállítás by Ányos",
                imageURL: "https://jedlik.eu/images/Jedlik-logo-2020-200.png",
                description: "I'll be deleted soon",
                ingredients: ["asa", "sas"],
            });
        id = response.body._id; // this document will be modified and deleted in the following 2 tests:
        expect(response.statusCode).toEqual(200);
    });

    it("PATCH /kiszallitasok/:id", async () => {
        const response = await request(server).patch(`/kiszallitasok/${id}`).set("Cookie", cookie).send({
            kiszállításName: "asdasd",
        });
        expect(response.statusCode).toEqual(200);
    });

    it("DELETE /kiszallitasok/:id", async () => {
        const response = await request(server).delete(`/kiszallitasok/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(200);
    });

    it("DELETE /kiszallitasok/:id (missing, but valid id)", async () => {
        id = "6367f3038ae13010a4c9ab49";
        const response = await request(server).delete(`/kiszallitasok/${id}`).set("Cookie", cookie);
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`Kiszállítás with id ${id} not found`);
    });

    it("PATCH /kiszallitasok/:id (missing, but valid id)", async () => {
        const response = await request(server).patch(`/kiszallitasok/${id}`).set("Cookie", cookie).send({
            kiszállításName: "asdasd",
        });
        expect(response.statusCode).toEqual(404);
        expect(response.body.message).toEqual(`Kiszállítás with id ${id} not found`);
    });
});
