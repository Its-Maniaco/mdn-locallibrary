const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { name } = require("ejs");
const genre = require("../models/genre");


// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({name: 1}).exec()
  res.render('genre_list', {
      title: "Genre List",
      genre_list: allGenres,
  })
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  console.log({
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });

  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" , genre:{}, errors: {}});
};

// Handle Genre create on POST.
// Array of middlewares
exports.genre_create_post = [
  // Validate and santitize name field
  body("name", "Genre must have atleast 3 characters.") // id, error thrown
    .trim()
    .isLength({min: 3})
    .escape(), //transforms special HTML characters as text

    // Request handler to process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // get validation error from request
        const errors = validationResult(req);

        // create a genre object with escaped and trimmed data
        const genre = new Genre( {name: req.body.name} )

        if (!errors.isEmpty()) {
          // if errors, re-render
          res.render("genre_form", {
            title: "Create genre",
            genre: genre,
            errors: errors.array(),
          });
          return;
        } else {
          // check if genre already exists
          const genreExists = await Genre.findOne({ name: req.body.name })
                                          .collation({locale: "en", strength: 2}) // case insensitive search
                                          .exec();
          if (genreExists) {
            res.redirect(genreExists.url);
          } else {
            await genre.save();
            res.redirect(genre.url);
          }
        }
    }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  // get all Books in parallel
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre: req.params.id}).exec(), // dont confuse this id with const genre
    // this one is model's field.
  ])

  // no result
  if (genre === null) res.redirect("/catalog/genres");
  // esle render page
  res.render("genre_delete", {
    title: "Genre Delete",
    genre: genre,
    books: genre_books,
    genre_books: {},
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre: req.params.id}).exec(),
  ]);

  // render as above if books of genre present
  if (genre_books.length>0) {
    res.render("genre_delete", {
      title: "Genre Delete",
      genre: genre,
      genre_books: genre_books,
    });
    return;
  } else {
    Genre.findByIdAndDelete(req.body.genreid);
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
