export default interface IDíj {
    _id?: number;
    minKm: number;
    maxKm: number;
    összeg: number;
}

export const exampleDíj: IDíj = {
    minKm: 100,
    maxKm: 110,
    összeg: 11000,
};
