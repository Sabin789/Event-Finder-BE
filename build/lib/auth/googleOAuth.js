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
const passport_google_oauth20_1 = require("passport-google-oauth20");
const model_1 = __importDefault(require("../../Api/Users/model"));
const tools_1 = require("./tools");
const { GOOGLE_ID, GOOGLE_SECRET, API_URL } = process.env;
const googleStrategy = new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_ID,
    clientSecret: GOOGLE_SECRET,
    callbackURL: `${API_URL}/googleRedirect`,
}, (_, __, profile, passportNext) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, given_name, family_name, sub, picture } = profile._json;
        const user = yield model_1.default.findOne({ email });
        if (user) {
            const accessToken = yield (0, tools_1.createAccessToken)({
                _id: user._id,
                email: user.email,
                role: user.role
            });
            passportNext(null, { accessToken });
        }
        else {
            const newUser = new model_1.default({
                name: given_name,
                surname: family_name,
                email,
                googleId: sub,
                avatar: picture,
                password: Math.random().toString(36).slice(-10), // generating a random password for those who sign up with Google
            });
            const createdUser = yield newUser.save();
            const accessToken = yield (0, tools_1.createAccessToken)({
                _id: createdUser._id,
                email: createdUser.email,
                role: createdUser.role
            });
            passportNext(null, { accessToken });
        }
    }
    catch (error) {
        passportNext(error);
    }
}));
exports.default = googleStrategy;
