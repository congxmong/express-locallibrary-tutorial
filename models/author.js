var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function () {
  return this.first_name + ' ' + this.family_name;
});

// Virtual for author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function () {
  if(this.date_of_death){
    return this.date_of_birth ? (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString() : 0;  
  } else {
    return this.date_of_birth ? ((new Date()).getYear() - this.date_of_birth.getYear()).toString() : 0;
  }
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

AuthorSchema.virtual('date_of_birth_formatted').get(function(){
  return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
});

AuthorSchema.virtual('date_of_death_formatted').get(function(){
  return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
});

AuthorSchema.virtual('date_of_birth_formattedEU').get(function(){
  return this.date_of_birth ? moment(this.date_of_birth).format('DD/MM/YYYY') : '';
});

AuthorSchema.virtual('date_of_death_formattedEU').get(function(){
  return this.date_of_death ? moment(this.date_of_death).format('DD/MM/YYYY') : '';
});

//Export model
module.exports = mongoose.model('Author', AuthorSchema);