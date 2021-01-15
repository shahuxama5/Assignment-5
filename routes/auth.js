const express = require("express");
const Sequelize = require("sequelize")
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')

var registeredUsersModel = require('../models').Registered_Users

const router = express.Router();

var Op = Sequelize.Op;


router.post("/api/auth", function (req, res, next) {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: "Please enter all fields" })
    }

    //checking for existing user
    registeredUsersModel.findOne({
        where:
        {
            email:
                { [Op.eq]: email }
        }
    }).then((user) => {
        if (!user) {
            return res.json({ msg: "User not exists" })
        }
        else {
            //it will return boolean
            bcrypt.compare(password, user.password).then(isMatch => {
                if (!isMatch) {
                    res.status(400).json({ msg: "Invalid credentials" })
                }
                else {
                    jwt.sign(
                        { id: user.id }, config.get('jwtSecret'), (err, token) => {
                            if (err) throw err;
                            res.json({
                                token,
                                user: {
                                    id: user.name,
                                    email: user.email,
                                    password: user.password
                                }
                            })
                        })
                }
            })
        }
    })
})

// router.get("/admin/register-user", function (req, res, next) {

//     res.render("register")

// })

module.exports = router;