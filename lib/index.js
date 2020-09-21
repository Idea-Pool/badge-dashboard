import { getMissingBadgeImages, processAssignments, validateConfig } from "./badge";
import { loadAllXLS } from "./xls";

/**
 * @typedef {object} BadgeLevel
 * @property {string} name
 * @property {number} n
 * @property {string} image
 */

/**
 * @typedef {object} Badge
 * @property {string} name
 * @property {number} [n]
 * @property {BadgeLevel[]} [levels]
 * @property {string} [image]
 */

/**
 * @typedef {object} BadgeAssignment
 * @property {number} date
 * @property {string} badge
 * @property {string} employeeId
 * @property {string} employeeUid
 * @property {string} employeeName
 */

/**
 * @typedef {object} DashboardGeneratorConfig
 * @property {string} input
 * @property {Badge[]} badges
 */

export class DashboardGenerator {
    constructor(config, root = process.cwd()) {
        console.log("Generator initialized");

        /** @type {DashboardGeneratorConfig} */
        this.config = config;
        /** @type {string} */
        this.root = root;
    }

    /** @returns {DashboardGenerator} */
    loadAssignments() {
        console.log(`Loading assignments from: ${this.config.input}`);

        /** @type {BadgeAssignment[]} */
        this.assignments = loadAllXLS(this.config.input);

        return this;
    }

    findMissingImages() {
        console.log("Finding missing images");

        /** @type {string[]} */
        this.missingImages = [
            ...getMissingBadgeImages(this.config.badges)
        ];

        console.log(`...found ${this.missingImages.length} missing image(s)`);
        if (this.missingImages.length) {
            this.missingImages.forEach((image, i) => {
                console.log(`   ${i + 1}: ${image}`);
            });
        }
    }

    /** @returns {DashboardGenerator} */
    processBadges() {
        console.log(`Processing ${this.assignments.length} assignments`);
        /** @type {Badge[]} */
        this.badges = processAssignments(
            this.assignments,
            validateConfig(this.config.badges, this.root)
        );

        return this;
    }
}