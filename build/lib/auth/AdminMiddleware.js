"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnlyMiddleware = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const adminOnlyMiddleware = (req, res, next) => {
    if (req.user.role === "Admin") {
        next();
    }
    else {
        next((0, http_errors_1.default)(403, "Admins only endpoint!"));
    }
};
exports.adminOnlyMiddleware = adminOnlyMiddleware;
