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
const http_errors_1 = __importDefault(require("http-errors"));
const passport_1 = __importDefault(require("passport"));
const AdminMiddleware_1 = require("../../lib/auth/AdminMiddleware");
const jwt_1 = require("../../lib/auth/jwt");
const tools_1 = require("../../lib/auth/tools");
const cloudinary_1 = require("../../lib/cloudinary");
const model_1 = __importDefault(require("./model"));
// import { Request, Response, NextFunction } from "express";
const model_2 = __importDefault(require("../Posts/model"));
const model_3 = __importDefault(require("../Events/model"));
const ModeratorMiddleware_1 = require("../../lib/auth/ModeratorMiddleware");
const UserRouter = express_1.default.Router();
UserRouter.post("/me/avatar", cloudinary_1.avatarUploader, jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        yield model_1.default.findByIdAndUpdate(req.user._id, {
            avatar: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path,
        });
        res.send({ avatarURL: (_b = req.file) === null || _b === void 0 ? void 0 : _b.path });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
UserRouter.get("/googleLogin", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
UserRouter.get("/googleRedirect", passport_1.default.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
}), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.redirect(`${process.env.FE_DEV_URL}/app?accessToken=${req.user.accessToken}`);
        console.log(req.user);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.get("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield model_1.default.find();
        res.send(users);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.get("/me", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.default.findById(req.user._id);
        res.send(user);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.get("/me/posts", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
        const user = yield model_1.default.findById(userId);
        const tags = user === null || user === void 0 ? void 0 : user.interestedIn;
        const posts = yield model_2.default.find({
            tags: { $in: tags }
        }).populate("user", "name avatar email");
        res.send(posts);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.get("/me/events", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
        const user = yield model_1.default.findById(userId);
        const tags = user === null || user === void 0 ? void 0 : user.interestedIn;
        const posts = yield model_3.default.find({
            tags: { $in: tags }
        }).populate("user", "_id name email avatar eventReqs");
        res.send(posts);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.put("/me", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield model_1.default.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true, runValidators: true });
        res.send(updatedUser);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/premium", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const user = yield model_1.default.findById((_e = req.user) === null || _e === void 0 ? void 0 : _e._id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        else {
            if (user.Premium === true) {
                return res.send("User has already bought the premium status");
            }
            else if (user.premiumPoints < 300) {
                return res.send("Not enough premium points");
            }
            else {
                user.premiumPoints -= 300;
            }
            user.Premium = true;
            // save changes to database
            yield user.save();
            res.send({ message: "User updated successfully" });
        }
    }
    catch (error) {
        next(error);
    }
}));
//Normal Routes
UserRouter.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const exists = yield model_1.default.findOne({ email: req.body.email });
        if (exists) {
            res.status(409).send(`Email ${req.body.email} already in use`);
        }
        else {
            const newUser = new model_1.default(req.body);
            const user = yield newUser.save();
            res.status(201).send("User created successfully");
        }
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role } = req.body;
        const user = yield model_1.default.checkCredentials(email, password);
        if (user) {
            const payload = { _id: user._id, email: user.email, role: user.role };
            const accessToken = yield (0, tools_1.createAccessToken)(payload);
            const refreshToken = yield (0, tools_1.createRefreshToken)(payload);
            res.send({ user, accessToken, refreshToken });
        }
        else {
            next((0, http_errors_1.default)(401, "Creditentials are not okay!"));
        }
    }
    catch (error) {
        next(error);
    }
}));
//Admin/Moderator Routes
UserRouter.get("/", jwt_1.JWTTokenAuth, AdminMiddleware_1.adminOnlyMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield model_1.default.find({
            _id: { $ne: req.user._id },
        });
        res.send(users);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.get("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield model_1.default.findById(req.params.id);
        if (User) {
            res.send(User);
        }
        else {
            (0, http_errors_1.default)(404, `User with id  ${req.params.id} not found`);
        }
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.put("/:id", jwt_1.JWTTokenAuth, AdminMiddleware_1.adminOnlyMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.send(updated);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.delete("/:id", jwt_1.JWTTokenAuth, AdminMiddleware_1.adminOnlyMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield model_1.default.findByIdAndDelete(req.params.id);
        if (deleted) {
            res.status(204).send();
        }
    }
    catch (error) {
        next(error);
    }
}));
// Follow Unfollow
UserRouter.put("/:id/FollowUnfollow", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f._id;
        const follower = yield model_1.default.findById(userId);
        const followed = yield model_1.default.findById(req.params.id);
        if (!(follower === null || follower === void 0 ? void 0 : follower.following.includes(req.params.id.toString()))) {
            yield model_1.default.findByIdAndUpdate(userId, { $push: { following: req.params.id } }, { new: true, runValidators: true });
            yield model_1.default.findByIdAndUpdate(req.params.id, { $push: { followers: userId } }, { new: true, runValidators: true });
            const newFollower = yield model_1.default.findById(userId);
            res.send(newFollower);
        }
        else {
            yield model_1.default.findByIdAndUpdate(userId, { $pull: { following: req.params.id } }, { new: true, runValidators: true });
            yield model_1.default.findByIdAndUpdate(req.params.id, { $pull: { followers: userId } }, { new: true, runValidators: true });
            const newFollower = yield model_1.default.findById(userId);
            res.send(newFollower);
        }
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/:id/likeUnlikePost", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const userId = (_g = req.user) === null || _g === void 0 ? void 0 : _g._id;
        const user = yield model_1.default.findById(userId);
        const post = yield model_2.default.findById(req.params.id);
        if (!(post === null || post === void 0 ? void 0 : post.likes.includes(user === null || user === void 0 ? void 0 : user._id))) {
            yield model_2.default.findByIdAndUpdate(req.params.id, {
                $push: { likes: user === null || user === void 0 ? void 0 : user._id },
            }, { new: true, runValidators: true });
            res.send("liked");
        }
        else {
            yield model_2.default.findByIdAndUpdate(req.params.id, {
                $pull: { likes: user === null || user === void 0 ? void 0 : user._id },
            }, { new: true, runValidators: true });
            res.send("unliked");
        }
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/:id/likeUnlikeEvent", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const userId = (_h = req.user) === null || _h === void 0 ? void 0 : _h._id;
        const user = yield model_1.default.findById(userId);
        const event = yield model_3.default.findById(req.params.id);
        if (!(event === null || event === void 0 ? void 0 : event.likes.includes(user === null || user === void 0 ? void 0 : user._id))) {
            yield model_3.default.findByIdAndUpdate(req.params.id, { $push: { likes: user === null || user === void 0 ? void 0 : user._id } }, { new: true, runValidators: true });
        }
        else {
            yield model_3.default.findByIdAndUpdate(req.params.id, { $pull: { likes: user === null || user === void 0 ? void 0 : user._id } }, { new: true, runValidators: true });
        }
        const updatedEvent = yield model_3.default.findById(req.params.id);
        const likesCount = (updatedEvent === null || updatedEvent === void 0 ? void 0 : updatedEvent.likes.length) || 0; // get the updated likes count
        res.send(updatedEvent);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.delete("/me/session", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield model_1.default.findByIdAndUpdate(req.user._id, {
            refreshToken: "",
        });
        res.send(user);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/:id/joinLeave", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        const userId = (_j = req.user) === null || _j === void 0 ? void 0 : _j._id;
        const user = yield model_1.default.findById(userId);
        const event = yield model_3.default.findById(req.params.id);
        const members = event === null || event === void 0 ? void 0 : event.members;
        const eventUserId = event === null || event === void 0 ? void 0 : event.user;
        const eventUser = yield model_1.default.findById(eventUserId);
        if ((user === null || user === void 0 ? void 0 : user._id.toString()) !== (eventUserId === null || eventUserId === void 0 ? void 0 : eventUserId.toString())) {
            if (!(event === null || event === void 0 ? void 0 : event.Private)) {
                if (!(members === null || members === void 0 ? void 0 : members.includes(user === null || user === void 0 ? void 0 : user._id))) {
                    yield model_3.default.findByIdAndUpdate(req.params.id, { $push: { members: user === null || user === void 0 ? void 0 : user._id } }, { new: true, runValidators: true });
                    res.send(event);
                }
                else {
                    yield model_3.default.findByIdAndUpdate(req.params.id, { $pull: { members: user === null || user === void 0 ? void 0 : user._id } }, { new: true, runValidators: true });
                    res.send(event);
                }
            }
            else {
                if (!(members === null || members === void 0 ? void 0 : members.includes(user === null || user === void 0 ? void 0 : user._id))) {
                    if (!(eventUser === null || eventUser === void 0 ? void 0 : eventUser.eventReqs.includes(user === null || user === void 0 ? void 0 : user._id))) {
                        yield model_1.default.findByIdAndUpdate(eventUserId, { $push: { eventReqs: user === null || user === void 0 ? void 0 : user._id } }, { new: true, runValidators: true });
                        res.send(user === null || user === void 0 ? void 0 : user._id);
                    }
                    else {
                        yield model_1.default.findByIdAndUpdate(eventUserId, { $pull: { eventReqs: user === null || user === void 0 ? void 0 : user._id } }, { new: true, runValidators: true });
                        res.send(event);
                    }
                }
                else {
                    res.send("You are already a member of this event ");
                }
            }
        }
        else {
            res.send("You cannot add yourself");
        }
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/:id/accept/:uid", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    try {
        const userId = (_k = req.user) === null || _k === void 0 ? void 0 : _k._id;
        const user = yield model_1.default.findById(userId);
        const event = yield model_3.default.findById(req.params.id);
        if (user === null || user === void 0 ? void 0 : user.eventReqs.includes(req.params.uid)) {
            yield model_1.default.findByIdAndUpdate(userId, { $pull: { eventReqs: req.params.uid } }, { new: true, runValidators: true });
            yield model_3.default.findByIdAndUpdate(req.params.id, { $push: { members: req.params.uid } }, { new: true, runValidators: true });
            res.send("accepted");
        }
        else {
            res.send("nothing to accept");
        }
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/:id/decline/:uid", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    try {
        const userId = (_l = req.user) === null || _l === void 0 ? void 0 : _l._id;
        const user = yield model_1.default.findById(userId);
        const event = yield model_3.default.findById(req.params.id);
        if (user === null || user === void 0 ? void 0 : user.eventReqs.includes(req.params.uid)) {
            yield model_1.default.findByIdAndUpdate(userId, { $pull: { eventReqs: req.params.uid } }, { new: true, runValidators: true });
            yield model_3.default.findByIdAndUpdate(req.params.id, { $pull: { members: req.params.uid } }, { new: true, runValidators: true });
            res.send("decline");
        }
        else {
            res.send("nothing to decline");
        }
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post('/:id/reportUser', jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    try {
        const reportingUserId = (_m = req.user) === null || _m === void 0 ? void 0 : _m._id;
        const reportedUserId = req.params.id;
        const { reason } = req.body;
        const reportedUser = yield model_1.default.findById(reportedUserId);
        if (!reportedUser) {
            return res.status(404).send('Reported user not found');
        }
        if (reportingUserId === reportedUserId) {
            res.send("You cannot report yourself");
        }
        const newReport = {
            reportedUserId,
            reportingUserId,
            reason
        };
        yield model_1.default.findByIdAndUpdate(reportedUserId, {
            $push: { reports: newReport }
        });
        res.send('User reported successfully');
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.get("/moderator/reportedUsers", jwt_1.JWTTokenAuth, ModeratorMiddleware_1.moderatorOnlyMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield model_1.default.find({ reports: { $exists: true, $not: { $size: 0 } } });
        res.send(users);
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.post("/:id/ban", jwt_1.JWTTokenAuth, ModeratorMiddleware_1.moderatorOnlyMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _o;
    try {
        const reporterId = (_o = req.user) === null || _o === void 0 ? void 0 : _o._id;
        const user = yield model_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        // Add a report point to the user's account
        user.reportPoints = (user.reportPoints || 0) + 1;
        // Check if the user has more than 3 report points
        if (user.reportPoints > 3) {
            yield model_1.default.findByIdAndDelete(user._id);
            return res.send("User deleted");
        }
        yield user.save();
        res.send("Report added to user account");
    }
    catch (error) {
        next(error);
    }
}));
UserRouter.get("/me/reqs", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield model_1.default.findById(userId).populate("eventReqs", "_id name email");
        if (user) {
            res.send(user.eventReqs);
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = UserRouter;
