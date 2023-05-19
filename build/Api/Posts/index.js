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
const jwt_1 = require("../../lib/auth/jwt");
const model_1 = __importDefault(require("../Users/model"));
const model_2 = __importDefault(require("./model"));
const model_3 = __importDefault(require("../Comments/model"));
const PostsRouter = express_1.default.Router();
PostsRouter.post("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield model_1.default.findById(userId);
        const Post = new model_2.default({
            text: req.body.text,
            user: userId,
            tags: req.body.tags
        });
        yield Post.save();
        res.send("Posted Succesfully");
    }
    catch (error) {
        next(error);
    }
}));
PostsRouter.get("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user._id;
        const user = yield model_1.default.findById(currentUserId);
        const Posts = yield model_2.default.find({ user: currentUserId })
            .populate("user", "name email avatar");
        if (Posts) {
            res.status(200).send(Posts);
        }
        else {
            res.send("Invalid user");
        }
    }
    catch (error) {
        next(error);
    }
}));
PostsRouter.get("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user._id;
        const currentPost = yield model_2.default.findById(req.params.id);
        if (currentPost) {
            const postId = currentPost._id;
            const comments = yield model_3.default.find({ post: postId });
            res.send(currentPost);
            // res.send(comments)
        }
        else {
            (0, http_errors_1.default)(404, `Post with id  ${req.params.id} not found`);
        }
    }
    catch (error) {
        next(error);
    }
}));
PostsRouter.put("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield model_2.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.send(updated);
    }
    catch (error) {
        next(error);
    }
}));
PostsRouter.delete("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield model_2.default.findByIdAndDelete(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
PostsRouter.get("/:id/comms", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield model_3.default.find({ post: req.params.id });
        res.send(comments);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = PostsRouter;
