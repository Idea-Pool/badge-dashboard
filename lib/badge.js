import { existsSync } from "fs";
import { resolve } from "path";
import { resolvePath } from "./fs";

const BLANK_BADGE = resolve("assets/badge.png");

/**
 * @typedef {object} AssignedTo
 * @property {string} name
 * @property {number} n
 */

const validateBadgeLevel = (badgeLevel, root) => {
    if (typeof badgeLevel !== "object") {
        throw new Error(`Badge level configuration is not valid, not object: ${JSON.stringify(badgeLevel)}!`);
    }
    if (typeof badgeLevel.name !== "string") {
        throw new Error(`Badge level configuration is not valid, missing name: ${JSON.stringify(badgeLevel)}!`);
    }
    if (typeof badgeLevel.n !== "number" || badgeLevel.n <= 0) {
        throw new Error(`Badge level configuration is not valid, invalid amount (n): ${JSON.stringify(badgeLevel)}!`);
    }
    if (typeof badgeLevel.image !== "string") {
        throw new Error(`Badge level configuration is not valid, missing image: ${JSON.stringify(badgeLevel)}!`);
    } else {
        badgeLevel.image = resolvePath(badgeLevel.image, root);
    }
};

const validateBadge = (badge, root) => {
    if (typeof badge !== "object") {
        throw new Error(`Badge configuration is not valid, not object: ${JSON.stringify(badge)}!`);
    }
    if (typeof badge.name !== "string") {
        throw new Error(`Badge configuration is not valid, missing name: ${JSON.stringify(badge)}!`);
    }
    if (typeof badge.image !== "string") {
        throw new Error(`Badge configuration is not valid, missing image: ${JSON.stringify(badge)}!`);
    } else {
        badge.image = resolvePath(badge.image, root);
    }
    if (Array.isArray(badge.levels)) {
        for (const level of badge.levels) {
            validateBadgeLevel(level, root);
        }
    }
};

/**
 * @param {Badge[]} badges The initial badge config
 * @param {string} [root=cwd]
 * @returns {Badge[]}
 */
export const validateConfig = (badges, root = process.cwd()) => {
    if (!Array.isArray(badges) || !badges.length) {
        throw new Error(`Badges configuration is not valid: ${JSON.stringify(badges)}`);
    }
    for (const badge of badges) {
        validateBadge(badge, root);
    }
    return badges;
};

/**
 * 
 * @param {Badge[]} badges 
 * @param {boolean} [setBlanks = false]
 * @returns {string[]}
 */
export const getMissingBadgeImages = (badges, setBlanks = false) => {
    const missing = [];
    for (const badge of badges) {
        if (!existsSync(badge.image)) {
            missing.push(badge.image);
            if (setBlanks) {
                badge.image = BLANK_BADGE;
            }
        }
        if (Array.isArray(badge.levels)) {
            for (const level of badge.levels) {
                if (!existsSync(level.image)) {
                    missing.push(level.image);
                    if (setBlanks) {
                        level.image = BLANK_BADGE;
                    }
                }
            }
        }
    }
    return missing;
};

const isMatchingAssignment = (badge, assignment) => {
    if (assignment.badge.toLowerCase() !== badge.name.toLowerCase()) {
        return false;
    }
    if (badge.from && assignment.from.toLowerCase() !== badge.from.toLowerCase()) {
        return false;
    }
    return true;
};

/**
 * @param {BadgeAssignment[]} assignments
 * @param {Badge[]} badges
 */
export const processAssignments = (assignments, badges) => {
    const allBadges = [];
    const assignedTo = {};
    for (const badge of badges) {
        const badgeAssignments = {};
        for (const assignment of assignments) {
            const { name } = assignment;
            if (isMatchingAssignment(badge, assignment)) {
                if (!(name in badgeAssignments)) {
                    badgeAssignments[name] = 0;
                }
                badgeAssignments[name]++;
                if (!(name in assignedTo)) {
                    assignedTo[name] = { name };
                }
            }
        }
        const newBadge = { name: badge.name, image: badge.image, assignments: [] };
        delete newBadge.levels;
        if (Array.isArray(badge.levels) && badge.levels.length) {
            allBadges.push(newBadge);

            badge.levels.sort((b1, b2) => b2.n - b1.n);
            const levelBadges = [];
            for (const level of badge.levels) {
                const levelBadge = { name: level.name, image: level.image, n: level.n, assignments: [] };
                for (const name in badgeAssignments) {
                    const n = badgeAssignments[name];
                    if (n >= level.n) {
                        levelBadge.assignments.push({
                            ...assignedTo[name],
                            n,
                        });
                        badgeAssignments[name] = 0;
                    }
                }
                levelBadge.assignments.sort((a1, a2) => a2.n - a1.n);
                levelBadges.push(levelBadge);
            }
            levelBadges.reverse();
            allBadges.push(...levelBadges);
            for (const name in badgeAssignments) {
                const n = badgeAssignments[name];
                if (typeof n === "number" && n) {
                    newBadge.assignments.push({
                        ...assignedTo[name],
                        n,
                    });
                }
            }
        } else {
            for (const name in badgeAssignments) {
                newBadge.assignments.push({
                    ...assignedTo[name],
                    n: badgeAssignments[name],
                });
            }
            allBadges.push(newBadge);
        }
        newBadge.assignments.sort((a1, a2) => a2.n - a1.n);
    }
    return allBadges;
};