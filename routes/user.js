const express = require("express");
const Sequelize = require('sequelize')

const router = express.Router();

var userModel = require("../models").User;
var Op = Sequelize.Op; //To access the operators of sequelize for already exists data check.

router.route("/admin/add-user").get(function (req, res, next) {
  res.render("admin/add-user");
}).post(function (req, res, next) {


  userModel.findOne({
    where: {
      email: {
        [Op.eq]: req.body.email
      }
    }
  }).then((data) => {
    if (data) {
      //if email already exists
      req.flash("error", 'Email already exists')
      res.redirect("/admin/add-user")

    }
    else {
      //if email already not exists
      userModel.create({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        gender: req.body.dd_gender,
        address: req.body.address,
        status: req.body.status
      }).then((data) => {

        if (data) {
          req.flash("success", 'User added successfully')
          res.redirect("/admin/add-user")
        }
        else {
          req.flash("error", 'Failed to create user')
          res.redirect("/admin/add-user")
        }
      })
    }
  })



})

router.get("/admin/list-user", async function (req, res, next) {


  var user_data = await userModel.findAll()
  res.render("admin/list-user", { users: user_data });
});


router.route("/admin/edit-user/:userId").get(async function (req, res, next) {
  var userdata = await userModel.findOne({
    where: {
      id: { [Op.eq]: req.params.userId }
    }
  })
  res.render("admin/edit-user", { user: userdata })
}).post(function (req, res, next) {
  userModel.update({
    name: req.body.name,
    mobile: req.body.mobile,
    gender: req.body.dd_gender,
    address: req.body.address,
    status: req.body.status

  }, {
    where: {
      id: {
        [Op.eq]: req.params.userId
      }
    }
  }).then((status) => {
    if (status) {
      req.flash("success", 'User updated successfully')

    } else {
      req.flash("error", "Failed to update user")
    }
    res.redirect("/admin/edit-user/" + req.params.userId)
  })
})


router.post("/admin/delete-user/:userId", function (req, res, next) {

  userModel.findOne({
    where: {
      id: {
        [Op.eq]: req.body.user_id
      }
    }
  }).then((data) => {

    if (data) {
      userModel.destroy({
        where: {
          id: {
            [Op.eq]: req.body.user_id

          }
        }

      }).then((status) => {
        if (status) {
          req.flash("success", "User has been deleted");
          res.redirect("/admin/list-user")
        }
        else {
          req.flash("error", "Failed to delete user");
          res.redirect("/admin/list-user")
        }
      })
    }
    else {
      req.flash("error", "Invalid User Id");
      res.redirect("/admin/list-user")
    }
  })


})
module.exports = router;
//next parameter is for next route
