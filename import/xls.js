import { resolve } from "path";
import { existsSync } from "fs";
import { readFile, utils } from "xlsx";

const FIELD_EMPLOYEE_ID = "To: employee id";
const FIELD_EMPLOYEE_UID = "To: uid";
const FIELD_EMPLOYEE_NAME = "To: full name";
const FIELD_DATE = "Date";
const FIELD_BADGE = "Badge";

const resolveFile = (file) => {
    file = resolve(file);
    if (!existsSync(file)) {
        throw new Error(`File (${file}) does not exist!`);
    }
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
 * @typedef {object} BadgeAssignment
 * @property {number} date
 * @property {string} badge
 * @property {string} employeeId
 * @property {string} employeeUid
 * @property {string} employeeName
 */

/**
 * @param {object} row The row from the worksheet
 * @returns {BadgeAssignment}
 */
const cleanRow = (row) => ({
    date: Date.parse(row[FIELD_DATE]),
    badge: row[FIELD_BADGE],
    employeeId: row[FIELD_EMPLOYEE_ID],
    employeeUid: row[FIELD_EMPLOYEE_UID],
    employeeName: row[FIELD_EMPLOYEE_NAME],
});

/**
 * @param {string} file The path of the XLS
 * @returns {BadgeAssignment[]}
 */
export const loadXLS = (file) => {
    file = resolveFile(file);
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
    return data;
};