const express = require("express");
const router = express.Router();

const meetingController = require("../controllers/meetingController");
const { requireAuth } = require("../middleware/authMiddleware");

// Protect all meeting routes.
router.use(requireAuth);

// READ
router.get("/dashboard", meetingController.getMeetings);

// CREATE
router.get("/meetings/new", meetingController.showNewMeeting);
router.post("/meetings", meetingController.createMeeting);

// UPDATE
router.get("/meetings/:id/edit", meetingController.showEditMeeting);
router.post("/meetings/:id/edit", meetingController.updateMeeting);

// DELETE
router.post("/meetings/:id/delete", meetingController.deleteMeeting);

module.exports = router;