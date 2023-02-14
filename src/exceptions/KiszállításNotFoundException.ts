import HttpException from "./HttpException";

export default class KiszállításNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Kiszállítás with id ${id} not found`);
    }
}
