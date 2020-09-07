import { options } from "yargs";
import { resolve, dirname } from "path";
import { existsSync } from "fs";
import { DashboardGenerator } from ".";

const { config } = options({
    config: {
        type: "string",
        required: true,
        description: "The configuration file (JSON)"
    },
}).help().argv;

/**
 * @param {string} configPath
 * @returns {DashboardGeneratorConfig}
 */
const loadConfig = configPath => {
    if (!existsSync(configPath)) {
        throw new Error(`Configuration file (${configPath}) does not exist!`);
    }
    return require(configPath);
};

export function run() {
    const configPath = resolve(config);
    const generatorConfig = loadConfig(configPath);
    const generator = new DashboardGenerator(generatorConfig, dirname(configPath));

    // Loading assignment data
    generator.loadAssignments();

    // Processing badges
    generator.processBadges();

    // Finding missing images
    generator.findMissingImages();

    // Loading images
    generator.loadImages();

    // Rendering template
    generator.renderAndSave();
}