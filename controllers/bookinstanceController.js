var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance list');

    BookInstance.find().populate('book').populate('author').exec(function (err, list_bookinstances){
    	if(err){ return next(err); }

    	res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances});
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);

    async.parallel({
    	bookinstance: function(callback){
    		BookInstance.findById(req.params.id).populate('book').exec(callback);
    	},
    }, function(err, results){
    	if(err){ return next(err); }

    	if(results.bookinstance==null){
    		var err = new Error('Book copy not found');
    		err.status = 404;
    		return next(err);
    	}

    	res.render('bookinstance_detail', {title: 'BookInstance Detail', bookinstance: results.bookinstance });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance create GET');

    var status_list = ['Maintenance', 'Available', 'Loaned', 'Reserved'];

    Book.find({},'title').exec(function(err,books){
        if(err) { return next(err); }

        res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, status_list: status_list });
    });
};

// Handle BookInstance create on POST.
// exports.bookinstance_create_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: BookInstance create POST');
// };

exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance delete GET');

    async.parallel({
        bookinstance: function(callback){
            BookInstance.findById(req.params.id).exec(callback);
        },
    }, function(err, results){
        if(err){ return next(err); }

        res.render('bookinstance_delete', {title: 'Delete BookInstance', bookinstance: results.bookinstance});
    });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance delete POST');

    async.parallel({
        bookinstance: function(callback){
            BookInstance.findById(req.body.bookinstanceid).exec(callback);
        },
    }, function(err, results){
        if(err){ return next(err); }

        BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err){
            if(err) { return next(err); }

            res.redirect('/catalog/bookinstances');
        });
    });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    // res.send('NOT IMPLEMENTED: BookInstance update GET');

    var status_list = ['Maintenance', 'Available', 'Loaned', 'Reserved'];

    async.parallel({
        bookinstance: function(callback){
            BookInstance.findById(req.params.id).exec(callback);
        },
        book_list: function(callback){
            Book.find({},'title').exec(callback);
        },
    }, function(err, results){
        if(err){ return next(err); }

        res.render('bookinstance_form', {title: 'Update BookInstance', bookinstance: results.bookinstance, book_list:results.book_list, status_list: status_list});
    });
};

// Handle bookinstance update on POST.
// exports.bookinstance_update_post = function(req, res) {
//     res.send('NOT IMPLEMENTED: BookInstance update POST');
// };

exports.bookinstance_update_post = [
    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    // process request after validation and sanitization
    (req, res, next) => {
        //Extract the validation errors from a request
        const errors = validationResult(req);

        // create object with escaped/trimmed data and old id
        var bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                due_back: req.body.due_back,
                status: req.body.status,
                _id: req.params.id,
            }
        );

        if(!errors.isEmpty()){
            async.parallel({
                book_list: function(callback){
                    Book.find(callback);
                },
            }, function(err, results){
                if(err){ return next(err); }

                res.render('bookinstance_form', {title: 'Update BookInstance', book_list: results.book_list, bookinstance: bookinstance, errors: errors.array() });
            });

            return;
        } else {
            // data form is valid. Update the record
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err, thebookinstance){
                if(err){ return next(err); }

                res.redirect(thebookinstance.url);
            });
        }
    }
];