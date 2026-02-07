"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tutorial_controller_1 = require("../controllers/tutorial.controller");
const router = express_1.default.Router();
router.get("/", tutorial_controller_1.getTutorials);
router.post("/", tutorial_controller_1.createTutorial);
router.put("/:id", tutorial_controller_1.updateTutorial);
router.delete("/:id", tutorial_controller_1.deleteTutorial);
exports.default = router;
