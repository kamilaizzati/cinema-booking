const Studio = require("../models/Studio");

// GET ALL STUDIOS
exports.getStudios = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    const studios = await Studio.find(query)
      .populate("cinema");

    res.status(200).json({
      success: true,
      count: studios.length,
      data: studios,
    });

  } catch (error) {
    next(error);
  }
};

// GET STUDIO BY ID
exports.getStudioById = async (req, res, next) => {
  try {

    const studio = await Studio.findById(req.params.id)
      .populate("cinema");

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.status(200).json({
      success: true,
      data: studio,
    });


  } catch (error) {
    next(error);
  }
};

// CREATE STUDIO
exports.createStudio = async (req, res, next) => {
  try {

    const studio = await Studio.create(req.body);

    res.status(201).json({
      success: true,
      data: studio,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// UPDATE STUDIO
exports.updateStudio = async (req, res, next) => {
  try {

    const studio = await Studio.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );


    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }


    res.status(200).json({
      success: true,
      data: studio,
    });


  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

// DELETE STUDIO
exports.deleteStudio = async (req, res, next) => {
  try {

    const studio = await Studio.findByIdAndDelete(req.params.id);

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });


  } catch (error) {
    next(error);
  }
};