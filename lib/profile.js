import { resolve, join, normalize } from "path";
import { existsSync } from "fs";

const BLANK_PROFILE = resolve("assets/profile.png");

const toImageName = name => name.replace(/\W/g, " ").trim().replace(/\s+/g, " ").replace(/\s+/g, "_") + ".png";

/**
 * @param {BadgeAssignment[]} assignments 
 * @param {string} profileRoot
 * @returns {Profile[]}
 */
export const collectProfiles = (assignments, profileRoot) => {
    process.stdout.write("Collecting profiles");
    const names = Array.from(new Set(assignments.map(a => a.employeeName)));
    const profiles = names.map(name => ({
        name,
        image: normalize(join(profileRoot, toImageName(name))),
    }));
    console.log(`, ${profiles.length} individual profiles found`);
    return profiles;
};

export const getMissingProfileImages = (profiles, setBlanks = false) => {
    const missingImages = [];
    for (const profile of profiles) {
        if (!existsSync(profile.image)) {
            missingImages.push(profile.image);
            if (setBlanks) {
                profile.image = BLANK_PROFILE;
            }
        }
    }
    return missingImages;
};