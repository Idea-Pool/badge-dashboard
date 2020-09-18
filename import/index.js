/* eslint-disable no-unused-vars */
import { options } from "yargs";
import { getMissingBadgeImages, loadBadgeConfig } from "./badge";
import { loadXLS } from "./xls";

const args = options({
    input: {
        type: "string",
        required: true,
        description: "The input XLS file"
    },
    badges: {
        type: "string",
        required: true,
        default: "badges.json",
        description: "The configuration file of the badges (JSON)"
    },
    images: {
        type: "string",
        required: true,
        default: "images",
        description: "The folder, where the profile images are stored"
    },
    "ignore-missing-images": {
        type: "boolean",
        default: true,
        description: "Whether the missing badge/profile images should be ignored"
    },
}).help().argv;
const { input, badges: badgesConfig, images, ignoreMissingImages } = args;

const assignment = loadXLS(input);
const badges = loadBadgeConfig(badgesConfig);
const missingImages = getMissingBadgeImages(badges);

console.log({ missingImages });