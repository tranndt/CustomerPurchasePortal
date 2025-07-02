const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviews = new Schema({
	id: {
    type: Number,
    required: true,
	},
	name: {
    type: String,
    required: true
  },
  product_id: {
    type: Number,
    required: true,
  },
  product_name: {
    type: String,
    required: true
  },
  review: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  purchase: {
    type: Boolean,
    required: true
  },
  purchase_date: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    required: false,
    default: "neutral"
  }
});

module.exports = mongoose.model('reviews', reviews);
