import { resolve, normalize } from "path";

export const resolvePath = (path, root) => {
    return normalize(resolve(path.replace(/\{config\}/ig, root)));
};
