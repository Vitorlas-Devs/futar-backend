export interface IDíj {
    _id: number;
    minKm: number;
    maxKm: number;
    összeg: number;
}

export const exampleDíj: IDíj = {
    _id: 1,
    minKm: 0,
    maxKm: 100,
    összeg: 1000,
};
