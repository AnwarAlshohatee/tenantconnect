const mongoose = require("mongoose");
const Meeting = require("../models/Meeting");

// READ: Show meetings for the logged-in user's building.
exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      building: req.user.building
    })
      .sort({ date: 1 })
      .populate("createdBy", "name");

    res.render("dashboard", {
      user: req.user,
      meetings
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to load meetings.");
  }
};

// Display the form for creating a meeting.
exports.showNewMeeting = (req, res) => {
  res.render("newMeeting", { error: null });
};

// CREATE: Save a new meeting.
exports.createMeeting = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !date ||
      !location?.trim() ||
      Number.isNaN(new Date(date).getTime())
    ) {
      return res.status(400).render("newMeeting", {
        error: "Please provide valid meeting information."
      });
    }

    await Meeting.create({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      location: location.trim(),

      // Take these from the authenticated user,
      // not from the submitted form.
      building: req.user.building,
      createdBy: req.user._id
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to create meeting.");
  }
};

// Display the edit form.
exports.showEditMeeting = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send("Meeting not found.");
    }

    const meeting = await Meeting.findOne({
      _id: req.params.id,
      building: req.user.building,
      createdBy: req.user._id
    });

    if (!meeting) {
      return res.status(404).send("Meeting not found.");
    }

    res.render("editMeeting", {
      meeting,
      error: null
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to load meeting.");
  }
};

// UPDATE: Edit only meetings owned by the logged-in user.
exports.updateMeeting = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send("Meeting not found.");
    }

    const { title, description, date, location } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !date ||
      !location?.trim() ||
      Number.isNaN(new Date(date).getTime())
    ) {
      return res.status(400).send("Please provide valid meeting information.");
    }

    const meeting = await Meeting.findOneAndUpdate(
      {
        _id: req.params.id,
        building: req.user.building,
        createdBy: req.user._id
      },
      {
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        location: location.trim()
      },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).send("Meeting not found.");
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to update meeting.");
  }
};

// DELETE: Remove only meetings owned by the logged-in user.
exports.deleteMeeting = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send("Meeting not found.");
    }

    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      building: req.user.building,
      createdBy: req.user._id
    });

    if (!meeting) {
      return res.status(404).send("Meeting not found.");
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to delete meeting.");
  }
};