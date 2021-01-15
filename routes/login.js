const express = require("express");
const Sequelize = require("sequelize")
const bcrypt = require('bcrypt')

var adminModel = require('../models').Admin

var Op = Sequelize.Op;

const { redirectHome, redirectLogin } = require("../middleware/redirect")

const router = express.Router();

router.route("/admin/login").get(redirectHome, function (req, res, next) {

    res.render("login");
}).post(function (req, res, next) {

    adminModel.findOne({
        where: {
            email: {
                [Op.eq]: req.body.email
            }
        }
    }).then((user) => {
        if (user) {
            //means we have data
            bcrypt.compare(req.body.password, user.password, function (error, result) {
                if (result) {
                    //user has data
                    req.session.isLoggedIn = true;
                    req.session.userId = user.id;
                    console.log(req.session)
                    res.redirect("/admin")
                }
                else {
                    req.flash("error", "Invalid login details")
                    res.redirect("/admin/login")
                }
            })
        }
        else {
            //means we have no data
            req.flash("error", "User not found")
            res.redirect('/admin/login')
        }
    })

});

router.get("/admin/register", function (req, res, next) {
    adminModel.create({
        name: "Hamza",
        email: "hamza123@gmail.com",
        password: bcrypt.hashSync('123456', 0)
    }).then((data) => {
        if (data) {
            res.json({
                status: 1,
                message: "Admin created successfully"
            })
        } else {
            res.json({
                status: 0,
                message: "Failed to create admin"
            })
        }
    })
})

router.get("/admin/logout", redirectLogin, function (req, res, next) {

    req.session.destroy((error) => {
        if (error) {
            res.redirect("/admin")
            console.log(req.session)
        }
        console.log("Session variables :", req.session)
        res.redirect('/admin/login')
    })
})

module.exports = router;
//next parameter is for next route
