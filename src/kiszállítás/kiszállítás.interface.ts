export default interface IKiszállítás {
    _id: number;
    nap: number;
    sorszám: number;
    megtettÚt: number;
    díj: number;
}

export const exampleKiszállítás: IKiszállítás = {
    _id: 1,
    nap: 1,
    sorszám: 1,
    megtettÚt: 1,
    díj: 1,
};
