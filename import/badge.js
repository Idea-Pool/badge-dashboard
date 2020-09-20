import { resolve, dirname, normalize } from "path";
import { existsSync } from "fs";

/**
 * @typedef {object} BadgeLevel
 * @property {string} name
 * @property {number} n
 * @property {string} image
 */

/**
 * @typedef {object} AssignedTo
* @property {string} employeeId
* @property {string} employeeUid
* @property {string} employeeName
* @property {number} n
 */

/**
 * @typedef {object} Badge
 * @property {string} name
 * @property {number} [n]
 * @property {BadgeLevel[]} [levels]
 * @property {string} [image]
 * @property {AssignedTo[]} [assignments]
 */

/**
 * @param {string} file 
 * @returns {BadgeLevel[]}
 */
const loadJSON = (file) => {
    file = resolve(file);
    if (!existsSync(file)) {
        throw new Error(`File (${file}) does not exist!`);
    }
    try {
        return require(file);
    } catch (e) {
        throw new Error(`File (${file}) is not a JSON file!\n` + e.stack);
    }
};

const resolveImage = (image, root) => normalize(resolve(image.replace(/\{config\}/ig, root)));

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
        badgeLevel.image = resolveImage(badgeLevel.image, root);
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
        badge.image = resolveImage(badge.image, root);
    }
    if (Array.isArray(badge.levels)) {
        for (const level of badge.levels) {
            validateBadgeLevel(level, root);
        }
    }
};

/**
 * @param {string} file The path to the badge configuration file (JSON)
 * @returns {Badge[]}
 */
export const loadBadgeConfig = (file) => {
    const badges = loadJSON(file);
    if (!Array.isArray(badges) || !badges.length) {
        throw new Error(`Badges configuration is not valid: ${JSON.stringify(badges)}`);
    }
    const root = dirname(resolve(file));
    for (const badge of badges) {
        validateBadge(badge, root);
    }
    return badges;
};

/**
 * 
 * @param {Badge[]} badges 
 * @param {string} root 
 * @returns {string[]}
 */
export const getMissingBadgeImages = (badges) => {
    const missing = [];
    for (const badge of badges) {
        if (!existsSync(badge.image)) {
            missing.push(badge.image);
        }
        for (const level of badge.levels) {
            if (!existsSync(level.image)) {
                missing.push(level.image);
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