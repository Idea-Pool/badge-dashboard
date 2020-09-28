/* eslint-disable no-case-declarations */
import { readFileSync, writeFileSync } from "fs";
import { join, resolve, extname, normalize } from "path";
import { getMissingBadgeImages, processAssignments, validateConfig } from "./badge";
import { resolvePath } from "./fs";
import { loadImage, getImages } from "./image";
import { collectProfiles, getMissingProfileImages } from "./profile";
import { loadAllXLS } from "./xls";

const prettify = require("pretty");
const ejs = require("ejs");
const uglifyJS = require("uglify-es");
const CleanCSS = require("clean-css");

ejs.fileLoader = filePath => {
    const content = readFileSync(filePath, "utf8");
    switch (extname(filePath)) {
        case ".js":
            const minifiedJS = uglifyJS.minify(content);
            if (minifiedJS.error) {
                throw minifiedJS.error;
            }
            return "<script>" + minifiedJS.code + "</script>";
        case ".css":
            const minifiedCSS = new CleanCSS({ level: 2 }).minify(content);
            if (minifiedCSS.errors && minifiedCSS.errors.length) {
                throw minifiedCSS.errors[0];
            }
            return "<style>" + minifiedCSS.styles + "</style>";
        default:
            return content;
    }
};

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
 * @property {string} [from]
 * @property {string[]} [blacklist]
 * @property {Profile[]} [assignments]
 */

/**
 * @typedef {object} BadgeAssignment
 * @property {number} date
 * @property {string} badge
 * @property {string} name
 * @property {string} from
 * @property {string} image
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
 * @property {string} title
 * @property {string} header
 * @property {string} background
 * @property {boolean} [ignoreMissingImages]
 * @property {boolean} [showUnassignedBadges]
 * @property {boolean} [showProfileImages]
 * @property {string[]} [blacklist]
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

        if (Array.isArray(this.config.blacklist)) {
            const blacklist = this.config.blacklist.map(name => name.toLowerCase());
            this.assignments = this.assignments.filter(({ name }) => !blacklist.includes(name.toLowerCase()));
        }

        /** @type {Profile[]} */
        this.profiles = collectProfiles(this.assignments, resolvePath(this.config.profileImages, this.root));
    }

    findMissingImages() {
        console.log("Finding missing images");

        /** @type {string[]} */
        this.missingImages = [...getMissingBadgeImages(this.config.badges, this.config.ignoreMissingImages)];
        if (this.config.showProfileImages) {
            this.missingImages.push(...getMissingProfileImages(this.profiles, this.config.ignoreMissingImages));
        }

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

        if (!this.config.showUnassignedBadges) {
            this.badges = this.badges.filter(badge => Array.isArray(badge.assignments) && badge.assignments.length);
        }
    }

    loadImages() {
        if (this.config.showProfileImages) {
            for (const profile of this.profiles) {
                profile.image = loadImage(profile.image);
            }
        }
        for (const badge of this.badges) {
            badge.image = loadImage(badge.image);
            if (this.config.showProfileImages) {
                for (const assignment of badge.assignments) {
                    assignment.image = this.profiles.find(({ name }) => name === assignment.name).image;
                }
            }
        }
    }

    render() {
        console.log("Rendering dashboard");

        const template = readFileSync(resolve("assets/template.ejs"), "utf-8");
        return ejs.render(template, {
            config: this.config,
            badges: this.badges,
            images: getImages(),
        }, { root: normalize(join(__dirname, "..", "assets")) });
    }

    renderAndSave() {
        if (!this.config.output) {
            throw new Error("Output file is not set!");
        }
        const html = prettify(this.render(), { ocd: true });
        let output = resolve(resolvePath(this.config.output, this.root));
        if (!/\.html$/.test(output)) {
            output = join(output, "badges.html");
        }
        console.log(`Saving dashboard to ${output}`);
        writeFileSync(output, html, "utf-8");
    }
}