const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name - virtuals dont persist in db and are calculated on the fly
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});

// Virtual for formatted date
AuthorSchema.virtual("date_of_birth_formatted").get(function() {
  return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
})
AuthorSchema.virtual("date_of_death_formatted").get(function() {
  return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
})
AuthorSchema.virtual("lifespan").get(function() {
  // use already formatted virtuals
  const birth = this.date_of_birth_formatted;
  const death = this.date_of_death_formatted;
  return birth || death ? `${birth} - ${death}` : 'N/A';
});



// Export model
module.exports = mongoose.model("Author", AuthorSchema);
