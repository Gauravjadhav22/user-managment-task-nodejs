"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor({ success = false, message, status = 200, data = [] }) {
        super(message);
        this.status = status;
        this.success = success;
        this.data = data;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.default = CustomError;
