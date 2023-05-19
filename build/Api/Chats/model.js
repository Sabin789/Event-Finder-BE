"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const messageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: "user" },
    content: {
        text: { type: String },
        media: { type: String },
    },
}, {
    timestamps: true,
});
const chatSchema = new Schema({
    members: [{ type: mongoose_1.default.Types.ObjectId, required: false, ref: "user" }],
    messages: [messageSchema]
});
const chatModel = model("chat", chatSchema);
exports.default = chatModel;
