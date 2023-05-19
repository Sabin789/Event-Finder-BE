"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressServer = exports.httpServer = void 0;
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const http_errors_1 = __importDefault(require("http-errors"));
const errorHandlers_1 = require("./errorHandlers");
const Users_1 = __importDefault(require("./Api/Users"));
const googleOAuth_1 = __importDefault(require("./lib/auth/googleOAuth"));
const Posts_1 = __importDefault(require("./Api/Posts"));
const Comments_1 = __importDefault(require("./Api/Comments"));
const Events_1 = __importDefault(require("./Api/Events"));
const expressServer = (0, express_1.default)();
exports.expressServer = expressServer;
const httpServer = (0, http_1.createServer)(expressServer);
exports.httpServer = httpServer;
const socketioServer = new socket_io_1.Server(httpServer);
passport_1.default.use("google", googleOAuth_1.default);
const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOptions = {
    origin: (currentOrigin, corsNext) => {
        if (!currentOrigin || whiteList.includes(currentOrigin)) {
            corsNext(null, true);
        }
        else {
            corsNext((0, http_errors_1.default)(400, `This origin is not allowed! ${currentOrigin}`));
        }
    },
};
// socketioServer.on("connect", newConnectionHandler)
expressServer.use((0, cors_1.default)(corsOptions));
expressServer.use(express_1.default.json());
expressServer.use("/Users", Users_1.default);
expressServer.use("/Posts", Posts_1.default);
expressServer.use("/Comments", Comments_1.default);
expressServer.use("/Events", Events_1.default);
expressServer.use(errorHandlers_1.badRequestHandler);
expressServer.use(errorHandlers_1.unauthorizedErrorHnalder);
expressServer.use(errorHandlers_1.forbiddenHandler);
expressServer.use(errorHandlers_1.notFoundHandler);
expressServer.use(errorHandlers_1.genericErrorHandler);
