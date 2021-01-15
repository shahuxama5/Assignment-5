const express = require("express");

const Sequelize = require('sequelize')
var Op = Sequelize.Op;

var optionModel = require('../models').Option;
var daysModel = require('../models').DaySetting;

const router = express.Router();

router.route("/admin/currency-settings").get(async function (req, res, next) {

  var currency_data = await optionModel.findOne({
    where: {
      option_name: {
        [Op.eq]: "active_currency"
      }
    }
  })

  res.render("admin/currency-settings", { currency_data: currency_data });
}).post(function (req, res, next) {
  //checking for the key
  optionModel.findOne({
    where: {
      option_name: {
        [Op.eq]: "active_currency"
      }
    }
  }).then((data) => {
    if (data) {
      //already we have that key
      optionModel.update({
        option_value: req.body.dd_currency
      }, {
        where: {
          option_name: {
            [Op.eq]: "active_currency"
          }
        }
      }).then((status) => {
        if (status) {
          req.flash("success", "Currency settings updated")

        } else {
          req.flash("error", "Failed to update currency settings")
        }
        res.redirect("/admin/currency-settings")

      })
    }
    else {
      //we dont have
      optionModel.create({
        option_name: "active_currency",
        option_value: req.body.dd_currency
      }).then((status) => {
        if (status) {
          req.flash("success", "Currency settings saved")

        } else {
          req.flash("error", "Failed to save currency settings")
        }
        res.redirect("/admin/currency-settings")
      })
    }
  })
});

router.route("/admin/day-settings").get(async function (req, res, next) {

  var days = await daysModel.findAll();

  res.render("admin/day-settings", { days: days });
}).post(function (req, res, next) {

  daysModel.findOne({
    where: {
      total_days: {
        [Op.eq]: req.body.day_count
      }
    }
  }).then((data) => {
    if (data) {
      req.flash("error", "Days already exists")
      res.redirect("/admin/day-settings")
    }
    else {
      daysModel.create({
        total_days: req.body.day_count
      }).then((status) => {
        if (status) {
          //data has been saved
          req.flash("success", "Data has been saved")
        }
        else {
          //when no data is saved
          req.flash("error", "Failed to save data")
        }

        res.redirect("/admin/day-settings")
      })

    }
  })
});
router.post("/admin/delete-days/:dayID", function (req, res, next) {
  daysModel.destroy({
    where: { id: { [Op.eq]: req.params.dayID } }
  }).then((data) => {
    if (data) {
      //data has been deleted
      req.flash("success", "Data has been deleted")
    }
    else {
      req.flash("error", "Failed to delete data")
    }
    res.redirect('/admin/day-settings')
  })
})
module.exports = router;
