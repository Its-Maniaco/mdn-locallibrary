const express = require("express");
const router = express.Router();

/*
router.get("/about", function (req, res, next) {
    // About is a db schema, and below is a db query
   About.find({}).exec((err, queryResults) => {
    if (err) {
        return next(err)
    }
    res.render("about_view", { title: "About", list: queryResults })
   }) 
});
*/

// This is alternate to above
// Import the module
const asyncHandler = require("express-async-handler");

exports.get(
  "/about",
  asyncHandler(async (req, res, next) => {
    const successfulResult = await About.find({}).exec();
    res.render("about_view", { title: "About", list: successfulResult });
  }),
);
