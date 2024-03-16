const flow = ([init, ...args]: ((...params: any) => any)[]) => <T extends unknown>(...param: T[]): T => {
    let res = init(...param);
    args.forEach((i) => {
        res = i(res);
    });
    return res;
}

export default flow;