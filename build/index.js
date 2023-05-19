"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = require("./server");
const port = process.env.PORT || 3001;
mongoose_1.default.connect(process.env.MONGO_DEV);
mongoose_1.default.connection.on("connected", () => {
    server_1.httpServer.listen(port, () => {
        console.log("Succesfully connected to mongo");
    });
});
