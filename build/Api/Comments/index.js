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
const model_1 = __importDefault(require("./model"));
const CommentRouter = express_1.default.Router();
CommentRouter.post("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Comment = new model_1.default({
            text: req.body.text,
            user: req.user._id,
            event: req.body.event,
            post: req.body.post
        });
        yield Comment.save();
        const populatedComment = yield Comment
            .populate("user", "_id name email avatar");
        res.send(populatedComment);
    }
    catch (error) {
        next(error);
    }
}));
CommentRouter.put("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentComment = yield model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.send(currentComment);
    }
    catch (error) {
        next(error);
    }
}));
CommentRouter.delete("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield model_1.default.findByIdAndDelete(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = CommentRouter;
