/* eslint-disable no-unused-vars */
import { options } from "yargs";
import { getMissingBadgeImages, loadBadgeConfig, processAssignments } from "./badge";
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
console.log(`Assignments loaded: ${assignment.length}`);
console.log();

const badges = loadBadgeConfig(badgesConfig);
console.log(`Badges loaded: ${badges.length}`);
console.log();

const missingImages = getMissingBadgeImages(badges);
if (missingImages.length) {
    console.log("Missing badge images:");
    missingImages.forEach((image, i) => {
        console.log(`${i + 1}. ${image}`);
    });
    console.log();
}

const processedBadges = processAssignments(assignment, badges);
console.log("Badge assignments:");
for (const badge of processedBadges) {
    console.log(` - ${badge.name}${badge.n ? ` (${badge.n}+)` : ""}`);
    for (const assignedTo of badge.assignments) {
        console.log(`   - ${assignedTo.employeeName}: ${assignedTo.n}`);
    }
}