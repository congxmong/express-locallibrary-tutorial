var Author = require('../models/author');
var Book = require('../models/book');

var async = require('async');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author list');

    Author.find().sort([['family_name', 'ascending']]).exec(function (err, list_authors){
    	if(err){ return next(err); }

    	res.render('author_list', {title: 'Author List', author_list: list_authors});
    });
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);

    async.parallel({
    	author: function(callback){
    		Author.findById(req.params.id).exec(callback);
    	},

    	author_books: function(callback){
    		Book.find({'author': req.params.id }).exec(callback);
    	},
    }, function(err, results){
    	if(err){ return next(err); }

    	if(results.author==null){
    		var err = new Error('Author not found');
    		err.status = 404;
    		return next(err);
    	}

    	res.render('author_detail', {title: 'Author Detail', author: results.author, author_books: results.author_books });
    });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author create GET');

    res.render('author_form', {title: 'Create Author'});
};

// Handle Author create on POST.
// exports.author_create_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author create POST');
// };

exports.author_create_post = [
    // Validate that all fields is not empty
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize (trim and escape) all fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Create an author object with escaped and trimmed data
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
            }
        );

        if(!errors.isEmpty()){
            // There are errors. Render the form again with sanitized values/error messages
            res.render('author_form', {title: 'Create Author', author: author, errors: errors.array()});
            return;
        } else {
            // Data from form is valid
            // Check if Author already exists
            Author.findOne({'first_name': req.body.first_name, 'family_name': req.body.family_name}).exec( function(err, found_author){
                if(err){ return next(err); }

                if(found_author){
                    // Author exists, redirect to its detail page
                    res.redirect(found_author.url);
                } else {
                    author.save(function(err){
                        if(err){ return next(err); }

                        // Author saved. Redirect to author detail page
                        res.redirect(author.url);
                    });
                }
            });
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author delete GET');

    async.parallel({
        author: function(callback){
            Author.findById(req.params.id).exec(callback);
        },
        authors_books: function(callback){
            Book.find({'author': req.params.id}).exec(callback);
        },
    }, function(err, results){
        if(err){ return next(err); }

        if(results.author==null){
            res.redirect('/catalog/authors');
        }

        res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});
    });
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author delete POST');

    async.parallel({
        author: function(callback){
            Author.findById(req.body.authorid).exec(callback);
        },
        authors_books: function(callback){
            Book.find({'author': req.body.authorid}).exec(callback);
        },
    }, function(err, results){
        if(err){ return next(err); }

        if(results.authors_books.length > 0){
            res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});
            return;
        } else {
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err){
                if(err) { return next(err); }

                res.redirect('/catalog/authors');
            });
        }
    });
};

// Display Author update form on GET.
exports.author_update_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: Author update GET');

    async.parallel({
        author: function(callback){
            Author.findById(req.params.id).exec(callback);
        },
    }, function(err, results){
        if(err){ return next(err); }

        res.render('author_form', {title: 'Update Author', author: results.author });
    });
};

// Handle Author update on POST.
// exports.author_update_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: Author update POST');
// };

exports.author_update_post = [
    // Validate that all fields is not empty
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize (trim and escape) all fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // process request after validation and sanitization
    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req);

        // create object with escaped/trimmed data and old id
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id,
            }
        );

        if(!errors.isEmpty()){
            res.render('author_form', {title: 'Update Author', author: author, errors: errors.array() });
        } else {
            // data form is valid. Update the record
            Author.findByIdAndUpdate(req.params.id, author, {}, function(err, theauthor){
                if(err){ return next(err); }

                res.redirect(theauthor.url);
            });
        }
    }
];