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
exports.newConnectionHandler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const model_1 = __importDefault(require("../Api/Chats/model"));
const mongoose_1 = __importDefault(require("mongoose"));
let onlineUserList = [];
let newRoom;
let displayedMessages = [];
const newConnectionHandler = (socket) => {
    console.log(`New userJoined their id is ${socket.id}`);
    socket.emit("Welcome", socket.id);
    socket.on("setUser", (data) => {
        console.log("hello");
        const { token } = data;
        const secret = process.env.JWT_SECRET;
        console.log(token);
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err) {
                console.log("Token verification failed:", err);
            }
            else {
                onlineUserList.push({
                    email: decoded.email,
                    _id: decoded._id,
                    socketId: socket.id,
                });
                console.log(onlineUserList);
            }
        });
    });
    socket.on("join-room", (room) => {
        console.log(room);
        newRoom = room;
        console.log(newRoom);
        socket.join(room);
    });
    socket.on("outgoing-msg", ({ room, message }) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(room);
        const chatRoomId = new mongoose_1.default.Types.ObjectId(room);
        socket.to(String(chatRoomId)).emit(message, {
            room: room,
            message: {
                sender: String,
                content: {
                    text: String,
                },
            },
        });
        console.log(message);
        yield model_1.default.findByIdAndUpdate(String(chatRoomId), { $push: { messages: message } }, { new: true, runValidators: true });
        let messageout = yield model_1.default.findById(String(chatRoomId));
        socket.emit("incoming-msg", messageout);
    }));
    socket.on("incoming-msg", ({ room }) => __awaiter(void 0, void 0, void 0, function* () {
        const chatRoomId = new mongoose_1.default.Types.ObjectId(room);
        const chat = yield model_1.default.findById(String(chatRoomId));
        displayedMessages.push(chat === null || chat === void 0 ? void 0 : chat.messages);
        socket.emit(displayedMessages);
    }));
    socket.on("disconnect", () => {
        onlineUserList = onlineUserList.filter((a) => a.socketId !== socket.id);
        socket.broadcast.emit("updateOnlineUsersList", onlineUserList);
        console.log(`User with socketId of ${socket.id} disconnected`);
        console.log(onlineUserList);
    });
};
exports.newConnectionHandler = newConnectionHandler;
