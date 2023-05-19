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
const model_2 = __importDefault(require("../Comments/model"));
const model_3 = __importDefault(require("../Users/model"));
const cloudinary_1 = require("../../lib/cloudinary");
const http_errors_1 = __importDefault(require("http-errors"));
const EventRouter = express_1.default.Router();
EventRouter.post("/", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const user = yield model_3.default.findById(userId);
    try {
        if (user === null || user === void 0 ? void 0 : user.Premium) {
            const newEvent = new model_1.default({
                name: req.body.name,
                address: req.body.address,
                description: req.body.description,
                tags: req.body.tags,
                Picture: req.body.Picture,
                Private: req.body.Private,
                user: userId,
                limit: req.body.limit,
                date: req.body.date,
                time: req.body.time
            });
            yield newEvent.save();
            res.status(201).send(newEvent);
        }
        else {
            res.send("Only premium users can post events");
        }
    }
    catch (error) {
        next(error);
    }
}));
EventRouter.get("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield model_1.default.findById(req.params.id).populate("user", "_id name email avatar");
        if (event) {
            res.send(event);
        }
        else {
            (0, http_errors_1.default)(404, "No event with this id");
        }
    }
    catch (error) {
        next(error);
    }
}));
EventRouter.get("/:id/user", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield model_1.default.findById(req.params.id);
        //  .populate("user", "name email Avatar").exec();
        //   res.send(event);
        const userId = event === null || event === void 0 ? void 0 : event.user;
        const user = yield model_3.default.findById(userId);
        res.send(user);
    }
    catch (error) {
        next(error);
    }
}));
EventRouter.put("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("user", "_id name avatar email");
        res.send(updated);
    }
    catch (error) {
        next(error);
    }
}));
EventRouter.delete("/:id", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event = yield model_1.default.findByIdAndDelete(req.params.id);
        const events = yield model_1.default.find();
        res.status(204).send(events);
    }
    catch (error) {
        next(error);
    }
}));
EventRouter.get("/:id/comms", jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield model_2.default.find({ event: req.params.id })
            .populate("user", "_id name email avatar");
        res.send(comments);
    }
    catch (error) {
        next(error);
    }
}));
EventRouter.post("/:id/picture", cloudinary_1.EventPictureUploader, jwt_1.JWTTokenAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        yield model_1.default.findByIdAndUpdate(req.params.id, {
            Picture: (_b = req.file) === null || _b === void 0 ? void 0 : _b.path,
        });
        res.send({ Picture: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = EventRouter;
