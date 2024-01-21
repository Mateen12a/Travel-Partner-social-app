const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const countrySchema = mongoose.Schema({
    name: {
        type: String,
    },
    capital:  {
        type: String,
    },
    flag: {
        type: String,
    },
    population: {
        type: String,
    },
    timezones: {
        type: String,
    },
    currencies: {
        type: String,
    },
    alpha2Code: {
        type: String,
    }
});
const flightSchema = mongoose.Schema({
    airline: {
        type: String,
    },
    time: {
        type: String,
    },
    flightNo: {
        type: String,
    },
    airport: {
        type: String,
    },
    price: {
        type: Number,
        minimum: 0
    }
})
const accommodationSchema = mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    price:  {
        type: Number,
        minimum: 0
    }
})
const budgetSchema = mongoose.Schema({
    allocated: {
        type: Number,
        minimum: 0
    },
    actual: {
        type: Number,
        minimum: 0
    }
});
const PlanSchema = new Schema({
        username: { type: String, required: true},
        country: {
            type: countrySchema,
            required: true,
        },
        goingWith: {
            type: String
        },
        outBoundDate: {
            type: String
        },
        inBoundDate:{
            type: String,
        },
        flight: {
            type: flightSchema,
            required: []
            },
        accommodation: {
            type: accommodationSchema,
            required: [],
        },
        budget: {
            type: budgetSchema,
            required: true,
        },
        completed: {
            type: Boolean
        }
});

var Plan = mongoose.model('Plan', PlanSchema);
module.exports = Plan;
