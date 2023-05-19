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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validateEmail = function (email) {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
function arrayLimit(val) {
    return val.length <= 10;
}
const { Schema, model } = mongoose_1.default;
const ReportSchema = new Schema({
    reportedUserId: { type: mongoose_1.default.Types.ObjectId, required: true, ref: 'user' },
    reportingUserId: { type: mongoose_1.default.Types.ObjectId, required: true, ref: 'user' },
    reason: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now }
});
const UserModel = new Schema({
    name: { type: String, required: true },
    premiumPoints: { type: Number, default: 300 },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate: [validateEmail, "Please fill a valid email address"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ]
    },
    password: { type: String, required: true },
    avatar: {
        type: String,
        required: true,
        default: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
    },
    refreshToken: { type: String },
    googleID: { type: String },
    role: { type: String, required: true, enum: ["Admin", "Moderator", "User"], default: "User" },
    Premium: { type: Boolean, default: false },
    bio: { type: String },
    interestedIn: {
        type: [{ type: String }],
        validate: [arrayLimit, '{PATH} exceeds the limit of 10']
    },
    address: { type: String, required: true },
    followers: { type: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }] },
    following: { type: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }] },
    eventReqs: { type: [{ type: mongoose_1.default.Types.ObjectId, ref: "user" }] },
    reports: { type: [ReportSchema], default: [] },
    reportPoints: { type: Number, default: 0 },
    Bookmarks: { type: [{ type: mongoose_1.default.Types.ObjectId, ref: "event" }] }
}, { timestamps: true });
UserModel.pre("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const newUser = this;
        if (newUser.password && newUser.isModified("password")) {
            const password = newUser.password;
            const hashedPassword = yield bcrypt_1.default.hash(password, 13);
            newUser.password = hashedPassword;
        }
    });
});
UserModel.pre("findOneAndUpdate", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const update = this.getUpdate();
        if (update.password) {
            const password = update.password;
            const hashedPW = yield bcrypt_1.default.hash(password, 11);
            update.password = hashedPW;
        }
    });
});
UserModel.methods.toJSON = function () {
    const UserDoc = this;
    const UserObj = UserDoc.toObject();
    delete UserObj.password;
    delete UserObj.createdAt;
    delete UserObj.updatedAt;
    delete UserObj.__v;
    return UserObj;
};
UserModel.static("checkCredentials", function (email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findOne({ email });
        if (user) {
            const matchingPassword = yield bcrypt_1.default.compare(password, user.password);
            if (!matchingPassword)
                return null;
            return user;
        }
        else
            return null;
    });
});
const UsersModel = model("user", UserModel);
exports.default = UsersModel;
