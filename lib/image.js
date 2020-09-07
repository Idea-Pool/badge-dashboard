import { readFileSync } from "fs";
import { extname } from "path";
import { encode } from "image-data-uri";

const md5 = require("md5");

const images = {};

export const loadImage = (path) => {
    const id = md5(path);
    if (id in images) {
        return id;
    }
    const content = readFileSync(path);
    const mediaType = extname(path).replace(/^\./, "").toUpperCase();
    images[id] = encode(content, mediaType);
    return id;
};

export const getImages = () => images;