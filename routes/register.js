const express = require("express");
const Sequelize = require("sequelize")
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')

var registeredUsersModel = require('../models').Registered_Users

const router = express.Router();

var Op = Sequelize.Op;


router.post("/api/users", function (req, res, next) {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ msg: "Please enter all fields" })
    }

    //checking for existing user
    registeredUsersModel.findOne({
        where:
        {
            email:
                { [Op.eq]: email }
        }
    }).then((status) => {
        if (status) {
            return res.json({ msg: "User already exists" })
        }
        else {
            //if email already not exists
            registeredUsersModel.create({
                name: name,
                email: email,
                password: bcrypt.hashSync('123456', 10)
            })
                .then((user) => {
                    if (user) {

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
                    else {
                        return res.json({ msg: "Failed to create user" })
                    }
                })
        }
    })
})

// router.get("/admin/register-user", function (req, res, next) {

//     res.render("register")

// })

module.exports = router;