const express = require("express");

const Sequelize = require("sequelize")

var categoryModel = require("../models").Category;
var userModel = require("../models").User;
var bookModel = require("../models").Book;
var issueBookModel = require("../models").IssueBook;
var daysModel = require('../models').DaySetting;

var Op = Sequelize.Op;

const router = express.Router();

router.route("/admin/issue-a-book").get(async function (req, res, next) {


  var days = await daysModel.findAll(
    { where: { status: '1' } }
  )

  var categories = await categoryModel.findAll({
    where: {
      status: { [Op.eq]: '1' }
    }
  })

  var users = await userModel.findAll({
    where: {
      status: { [Op.eq]: '1' }
    }
  })


  res.render("admin/issue-a-book", {
    categories: categories, users: users, days: days
  });

}).post(async function (req, res, next) {

  var is_book_issued = await issueBookModel.count({
    where: {
      userId:
      {
        [Op.eq]: req.body.dd_user

      },
      bookId:
      {
        [Op.eq]: req.body.dd_book
      },
      is_returned:
      {
        [Op.eq]: '0'
      }
    }

  })
  if (is_book_issued > 0) {
    console.log("is_book_issued", is_book_issued)
    req.flash("error", "This Book has been already issued to this user")
    res.redirect("/admin/issue-a-book")
  }
  else {
    var count_books = await issueBookModel.count({
      where: {
        userId: {
          [Op.eq]: req.body.dd_user
        },
        is_returned:
        {
          [Op.eq]: "0"
        }
      }
    })
    if (count_books >= 2) {
      req.flash("error", "Maximum books allowed for each user equals to 2")
      res.redirect("/admin/issue-a-book")

    }
    else {
      issueBookModel.create({
        categoryId: req.body.dd_category,
        bookId: req.body.dd_book,
        userId: req.body.dd_user,
        days_issued: req.body.dd_days
      }).then((status) => {
        if (status) {
          req.flash("success", 'Book has been issued successfully')
        }
        else {
          req.flash("error", 'Failed to issue Book')
        }
        res.redirect("/admin/list-issue-book")
      })
    }
  }

});

router.get("/admin/list-issue-book", async function (req, res, next) {

  var issueList = await issueBookModel.findAll({
    include: [
      { model: categoryModel, attributes: ['name'] },
      { model: bookModel, attributes: ['name'] },
      { model: userModel, attributes: ['name', 'email'] }
    ],
    attributes: ["days_issued", "issued_date"],
    where: {
      is_returned: { [Op.eq]: '0' }
    }
  })

  // res.json(issueList)
  res.render("admin/issue-history", { list: issueList });
});

router.post("/admin/category-list-book", async function (req, res, next) {
  var category_id = req.body.cat_id;

  var books = await bookModel.findAll({
    where: {
      categoryId: {
        [Op.eq]: category_id
      }
    }
  })

  return res.json({ status: 1, books: books });

})

module.exports = router;
//next parameter is for next route
