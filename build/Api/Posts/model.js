"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const LikesSchema = new Schema({
    likes: {
        type: [String],
        default: [],
    },
});
function arrayLimit(val) {
    return val.length <= 5;
}
const PostModel = new Schema({
    text: { type: String, required: true },
    user: { type: mongoose_1.default.Types.ObjectId, ref: "user", required: true },
    tags: { type: [{ type: String }],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5'] },
    likes: {
        type: [{ type: String }]
    }
}, { timestamps: true });
exports.default = model("post", PostModel);
