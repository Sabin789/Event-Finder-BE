"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const CommentSchema = new Schema({
    text: { type: String, requiredL: true },
    user: { type: mongoose_1.default.Types.ObjectId, ref: "user", required: true },
    post: { type: mongoose_1.default.Types.ObjectId, ref: "post" },
    event: { type: mongoose_1.default.Types.ObjectId, ref: "event" }
}, { timestamps: true });
exports.default = model("Comment", CommentSchema);
