import { existsSync } from "fs";
import { resolve } from "path";
import { resolvePath } from "./fs";

const BLANK_BADGE = resolve("assets/badge.png");

/**
 * @typedef {object} AssignedTo
 * @property {string} employeeId
 * @property {string} employeeUid
 * @property {string} employeeName
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
        for (const level of badge.levels) {
            if (!existsSync(level.image)) {
                missing.push(level.image);
                if (setBlanks) {
                    level.image = BLANK_BADGE;
                }
            }
        }
    }
    return missing;
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
            const { badge: assignedBadge, employeeId, employeeName, employeeUid } = assignment;
            if (assignedBadge.toLowerCase() === badge.name.toLowerCase()) {
                if (!(employeeId in badgeAssignments)) {
                    badgeAssignments[employeeId] = 0;
                }
                badgeAssignments[employeeId]++;
                if (!(employeeId in assignedTo)) {
                    assignedTo[employeeId] = { employeeId, employeeName, employeeUid };
                }
            }
        }
        const newBadge = { name: badge.name, image: badge.image, assignments: [] };
        delete newBadge.levels;
        if (badge.levels && badge.levels.length) {
            allBadges.push(newBadge);

            badge.levels.sort((b1, b2) => b2.n - b1.n);
            const levelBadges = [];
            for (const level of badge.levels) {
                const levelBadge = { name: level.name, image: level.image, n: level.n, assignments: [] };
                for (const employeeId in badgeAssignments) {
                    const n = badgeAssignments[employeeId];
                    if (n >= level.n) {
                        levelBadge.assignments.push({
                            ...assignedTo[employeeId],
                            n,
                        });
                        badgeAssignments[employeeId] = 0;
                    }
                }
                levelBadge.assignments.sort((a1, a2) => a2.n - a1.n);
                levelBadges.push(levelBadge);
            }
            levelBadges.reverse();
            allBadges.push(...levelBadges);
            for (const employeeId in badgeAssignments) {
                const n = badgeAssignments[employeeId];
                if (typeof n === "number" && n) {
                    newBadge.assignments.push({
                        ...assignedTo[employeeId],
                        n,
                    });
                }
            }
        } else {
            for (const employeeId in badgeAssignments) {
                newBadge.assignments.push({
                    ...assignedTo[employeeId],
                    n: badgeAssignments[employeeId],
                });
            }
            allBadges.push(newBadge);
        }
        newBadge.assignments.sort((a1, a2) => a2.n - a1.n);
    }
    return allBadges;
};