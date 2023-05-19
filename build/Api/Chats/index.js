"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../../lib/auth/jwt");
const socket_io_1 = require("socket.io");
const model_1 = __importDefault(require("./model"));
const chatRouter = express_1.default.Router();
chatRouter.post("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sender = req.user._id;
        const recipient = req.body.recipient;
        const exists = yield model_1.default.findOne({
            members: { $in: [sender, recipient] },
        });
        if (exists) {
            console.log(req.user._id);
            res.status(200).send(exists);
        }
        else {
            const newChat = yield model_1.default.create({
                members: [sender, recipient],
                messages: [],
            });
            res.status(201).send(newChat);
        }
    }
    catch (error) {
        next(error);
    }
}));
const io = new socket_io_1.Server();
