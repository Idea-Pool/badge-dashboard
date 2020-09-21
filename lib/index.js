import { render } from "ejs";
import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { getMissingBadgeImages, processAssignments, validateConfig } from "./badge";
import { resolvePath } from "./fs";
import { collectProfiles, getMissingProfileImages } from "./profile";
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
 * @typedef {object} Profile
 * @property {string} name
 * @property {string} image
 */

/**
 * @typedef {object} DashboardGeneratorConfig
 * @property {string} input
 * @property {Badge[]} badges
 * @property {string} profileImages
 * @property {boolean} [ignoreMissingImages]
 * @property {string} title
 * @property {string} header
 * @property {string} background
 */

export class DashboardGenerator {
    constructor(config, root = process.cwd()) {
        console.log("Generator initialized");

        /** @type {DashboardGeneratorConfig} */
        this.config = config;

        /** @type {string} */
        this.root = root;

        if (typeof this.config.profileImages !== "string") {
            throw new Error(`Configuration profileImages is not correct (${this.config.profileImages})!`);
        }
    }

    loadAssignments() {
        /** @type {BadgeAssignment[]} */
        this.assignments = loadAllXLS(resolvePath(this.config.input, this.root));

        /** @type {Profile[]} */
        this.profiles = collectProfiles(this.assignments, resolvePath(this.config.profileImages, this.root));
    }

    findMissingImages() {
        console.log("Finding missing images");

        /** @type {string[]} */
        this.missingImages = [
            ...getMissingBadgeImages(this.config.badges, this.config.ignoreMissingImages),
            ...getMissingProfileImages(this.profiles, this.config.ignoreMissingImages),
        ];

        console.log(`-> found ${this.missingImages.length} missing image(s)`);
        if (this.missingImages.length) {
            this.missingImages.forEach((image, i) => {
                console.log(` ${i + 1}: ${image}`);
            });
            if (!this.config.ignoreMissingImages) {
                throw new Error("Images are missing!");
            }
        }
    }

    processBadges() {
        console.log(`Processing ${this.assignments.length} assignments`);

        /** @type {Badge[]} */
        this.badges = processAssignments(
            this.assignments,
            validateConfig(this.config.badges, this.root)
        );
    }

    render() {
        console.log("Rendering dashboard");

        const template = readFileSync(resolve("assets/template.ejs"), "utf-8");
        return render(template, {
            title: this.config.title,
            header: this.config.header,
            background: this.config.background,
        });
    }

    renderAndSave() {
        if (!this.config.output) {
            throw new Error("Output file is not set!");
        }
        const html = this.render();
        let output = resolve(resolvePath(this.config.output, this.root));
        if (!/\.html$/.test(output)) {
            output = join(output, "badges.html");
        }
        console.log(`Saving dashboard to ${output}`);
        writeFileSync(output, html, "utf-8");
    }
}