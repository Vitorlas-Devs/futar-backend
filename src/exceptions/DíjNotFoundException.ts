import HttpException from "./HttpException";

export default class DíjNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Díj with id ${id} not found`);
    }
}
