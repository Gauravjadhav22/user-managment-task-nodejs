"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatResponse = void 0;
const FormatResponse = ({ data = [], success = true, message = "", }) => {
    return {
        data,
        success,
        message,
    };
};
exports.FormatResponse = FormatResponse;
