"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericErrorHandler = exports.notFoundHandler = exports.forbiddenHandler = exports.unauthorizedErrorHnalder = exports.badRequestHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const badRequestHandler = (err, req, res, next) => {
    if (err.status = 400 || err instanceof mongoose_1.default.Error.ValidationError) {
        res.status(400).send({ message: err.message });
    }
    else {
        next();
    }
};
exports.badRequestHandler = badRequestHandler;
const unauthorizedErrorHnalder = (err, req, res, next) => {
    if (err.status === 401) {
        res.status(401).send({ message: err.message });
    }
    else {
        next();
    }
};
exports.unauthorizedErrorHnalder = unauthorizedErrorHnalder;
const forbiddenHandler = (err, req, res, next) => {
    if (err.status === 403) {
        res.status(403).send({ message: err.message });
    }
    else {
        next(err);
    }
};
exports.forbiddenHandler = forbiddenHandler;
const notFoundHandler = (err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).send({ message: err.message });
    }
    else {
        next(err);
    }
};
exports.notFoundHandler = notFoundHandler;
const genericErrorHandler = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({ message: "Server error, we'll fix it ASAP!" });
};
exports.genericErrorHandler = genericErrorHandler;
