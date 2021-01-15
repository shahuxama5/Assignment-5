const express = require("express");
const Sequelize = require("sequelize");

const router = express.Router();

//loading category model
var categoryModel = require("../models").Category;
var bookModel = require("../models").Book;
var optionModel = require('../models').Option;

var Op = Sequelize.Op; //To access the operators of sequelize for already exists data check.

router
  .route("/admin/add-book")
  .get(async function (req, res, next) {
    var categories = await categoryModel.findAll({
      where: {
        status: { [Op.eq]: "1" },
      },
    });
    var currency_data = await optionModel.findOne({
      where: {
        option_name: {
          [Op.eq]: "active_currency"
        }
      }
    })

    res.render("admin/add-book", { categories: categories, currency_data: currency_data });
  })
  .post(function (req, res, next) {
    if (!req.files) {
      req.flash("error", "Upload the image");
    }
    else {
      var image_attr = req.files.cover_image;

      var valid_images_extensions = ["image/jpg", "image/jpeg", "image/png"];
      if (valid_images_extensions.includes(image_attr.mimetype)) {

        image_attr.mv("./public/uploads/" + image_attr.name);
        bookModel
          .create({
            name: req.body.name,
            categoryId: req.body.dd_category,
            description: req.body.dd_description,
            amount: req.body.amount,
            cover_image: "/uploads/" + image_attr.name,
            author: req.body.author,
            status: req.body.status,
          })
          .then((status) => {
            if (status) {
              req.flash("success", "Book has been created");
            } else {
              req.flash("error", "Failed to create a book");
            }
            res.redirect("/admin/add-book");
          });
      } else {
        req.flash("error", "Invalid file selected");
        res.redirect("/admin/add-book");
      }
    }
  });
router.get("/admin/list-book", async function (req, res, next) {
  var books = await bookModel.findAll({
    include: {
      model: categoryModel,
      attributes: ['name']
    }
  });
  var currency_data = await optionModel.findOne({
    where: {
      option_name: {
        [Op.eq]: "active_currency"
      }
    }
  })
  res.render("admin/list-book", {
    books: books, currency_data: currency_data
  });
});

router.route('/admin/edit-book/:bookId').get(async function (req, res, next) {
  var book_data = await bookModel.findOne({
    where: {
      id: { [Op.eq]: req.params.bookId }
    }
  })

  var categories = await categoryModel.findAll({
    where: {
      status: { [Op.eq]: "1" },
    },
  });

  var currency_data = await optionModel.findOne({
    where: {
      option_name: {
        [Op.eq]: "active_currency"
      }
    }
  })

  res.render("admin/edit-book", {
    book: book_data, categories: categories, currency_data: currency_data
  })
}).post(function (req, res, next) {

  if (!req.files) {
    //not going to update cover_image
    bookModel
      .update({
        name: req.body.name,
        categoryId: req.body.dd_category,
        description: req.body.dd_description,
        amount: req.body.amount,

        author: req.body.author,
        status: req.body.status,
      }, {
        where: {
          id: {
            [Op.eq]: req.params.bookId
          }
        }
      }).then((data) => {
        console.log(data)
        if (data) {
          req.flash("success", "Book has been updated successfully")
        }
        else {
          req.flash("error", "Failed to update book")
        }
        res.redirect("/admin/edit-book/" + req.params.bookId)
      })
  }
  else {
    //going to update cover_image
    var image_attr = req.files.cover_image;

    var valid_images_extensions = ["image/jpg", "image/jpeg", "image/png"];
    if (valid_images_extensions.includes(image_attr.mimetype)) {

      image_attr.mv("./public/uploads/" + image_attr.name);
      bookModel
        .update({
          name: req.body.name,
          categoryId: req.body.dd_category,
          description: req.body.dd_description,
          amount: req.body.amount,
          cover_image: "/uploads/" + image_attr.name,
          author: req.body.author,
          status: req.body.status,
        }, {
          where: {
            id: {
              [Op.eq]: req.params.bookId
            }
          }
        })
        .then((status) => {
          if (status) {
            req.flash("success", "Book has been updated successfully");
          } else {
            req.flash("error", "Failed to update bookk");
          }
          res.redirect("/admin/edit-book/" + req.params.bookId);
        });
    } else {
      req.flash("error", "Invalid file selected");
      res.redirect("/admin/edit-book/" + req.params.bookId);
    }
  }
})

router.post("/admin/delete-book/:bookId", function (req, res, next) {

  bookModel.findOne({
    where: {
      id: {
        [Op.eq]: req.body.book_id
      }
    }
  }).then((data) => {

    if (data) {
      bookModel.destroy({
        where: {
          id: {
            [Op.eq]: req.body.book_id

          }
        }

      }).then((status) => {
        if (status) {
          req.flash("success", "Book has been deleted");
          res.redirect("/admin/list-book")
        }
        else {
          req.flash("error", "Failed to delete book");
          res.redirect("/admin/list-book")
        }
      })
    }
    else {
      req.flash("error", "Invalid Book Id");
      res.redirect("/admin/list-book")
    }
  })

})
module.exports = router;
//next parameter is for next route
