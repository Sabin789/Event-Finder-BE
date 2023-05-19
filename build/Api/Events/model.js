"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
function arrayLimit(val) {
    return val.length <= 10;
}
const EventModel = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [{ type: String }],
        validate: [arrayLimit, '{PATH} exceeds the limit of 10'] },
    Picture: { type: String },
    ActiveStatus: { type: Boolean, default: true },
    Private: { type: Boolean, default: false },
    user: { type: mongoose_1.default.Types.ObjectId, ref: "user", required: true },
    members: { type: [{ type: String }] },
    limit: { type: Number },
    likes: { type: [{ type: String }] },
    date: { type: Date, required: true },
    time: { type: String }
}, { timestamps: true });
exports.default = model("event", EventModel);
