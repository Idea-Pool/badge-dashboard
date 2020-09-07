import { resolve } from "path";
import { readFile, utils } from "xlsx";
import { sync } from "glob";

const FIELD_NAME = "To: full name";
const FIELD_FROM = "From: email";
const FIELD_DATE = "Date";
const FIELD_BADGE = "Badge";

const resolveFile = (file) => {
    file = resolve(file);
    if (!/\.xlsx?$/i.test(file)) {
        throw new Error(`File (${file}) is not an Excel file!`);
    }
    return file;
};

const readHeader = (ws) => {
    const header = [];
    const r = 0;
    for (let c = 0; ; ++c) {
        const cell = ws[utils.encode_cell({ c, r })];
        if (!cell || !cell.w) {
            break;
        }
        header.push(cell.w);
    }
    return header;
};

const readRow = (ws, header, r) => {
    const row = {};
    for (let c = 0; c < header.length; ++c) {
        const cell = ws[utils.encode_cell({ c, r })];
        if (!c && (!cell || !cell.w)) {
            return null;
        }
        row[header[c]] = cell.w;
    }
    return row;
};

/**
 * @param {object} row The row from the worksheet
 * @returns {BadgeAssignment}
 */
const cleanRow = (row) => ({
    date: Date.parse(row[FIELD_DATE]),
    badge: row[FIELD_BADGE],
    name: row[FIELD_NAME],
    from: row[FIELD_FROM],
});

/**
 * @param {string} pattern The path of the XLS file(s)
 * @returns {BadgeAssignment[]}
 */
export const loadAllXLS = (pattern) => {
    console.log(`Loading assignments from: ${pattern}`);
    const files = sync(pattern.replace(/\\/g, "/"), { dot: true });
    if (!files.length) {
        throw new Error(`There is no matching input file (${pattern})!`);
    }
    const allData = [];
    for (const file of files) {
        allData.push(...loadXLS(file));
    }
    return allData;
};

/**
 * @param {string} file The path of the XLS
 * @returns {BadgeAssignment[]}
 */
export const loadXLS = (file) => {
    file = resolveFile(file);
    console.log(` - Loading ${file}`);
    const wb = readFile(file, {
        cellFormula: false,
        cellHTML: false,
    });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const header = readHeader(ws);
    const data = [];
    for (let r = 1; ; ++r) {
        const row = readRow(ws, header, r);
        if (!row) {
            break;
        }
        data.push(cleanRow(row));
    }
    console.log(`   -> found ${data.length} assignment`);
    return data;
};