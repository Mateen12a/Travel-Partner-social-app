const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const TripItem = require('../schemas/tripItem')
const Trip = require('../schemas/trip');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/createItem/:id', async (req, res, next) => {
	try {
		// find the trip
		const foundTrip = await Trip.findById(req.params.id)
		// create the trip item
		const newTripItem = {
			description: req.body.description,
			chosenList: req.body.chosenList,
			done:req.body.done
		}
		const createdTripItem = await TripItem.create(newTripItem);

		// conditionals as to where to put it in
		if(req.body.chosenList == 'itemsToPlan') {
			foundTrip.itemsToPlan.push(createdTripItem)
			await foundTrip.save()

		} else if(req.body.chosenList == 'plannedItems') {
			foundTrip.plannedItems.push(createdTripItem)
			await foundTrip.save()

		} else if(req.body.chosenList == 'suggestedItems'){
			foundTrip.suggestedItems.push(createdTripItem)
			await foundTrip.save()

		} else {
			res.send('error')
		}

		// bring it back to the home page
		res.redirect('/trips/tripHomePage/' + foundTrip._id)
	}	
	catch(err) {
		next(err)
	}
})
router.post('/update/:id', async (req, res, next) => {
	try {
		// find the trip
		const foundTrip = await Trip.findById(req.params.id)
		// create the trip item
		const newTripItem = {
			done: req.body.done
		}
		const updateTripItem = await TripItem.findOneAndUpdate({done: " "},newTripItem );
console.log(updateTripItem)
		// conditionals as to where to put it in.
		res.redirect('/trips/tripHomePage/' + foundTrip._id)
	}	
	catch(err) {
		next(err)
	}
})
// getting the edit page
// make a route for the user to edit an item on the list
router.get('/:id/tripItemEdit', async (req, res, next) => {
	try {
		const foundItem = await TripItem.findById(req.params.id); 
		foundItem.description = req.body.description
		res.render('trips/tripItemEdit.ejs', {
			foundItem: foundItem
		})
	}
	catch(err) {
		next(err)
	}
})

// editing actual item
router.put('/:id', async (req, res, next) => {
	try {
		// find the trip that coorelates to the specific item that was clicked on
		const foundTrip = await Trip.findOne({
			$or: [{
				'itemsToPlan': req.params.id
			},
			{
				'plannedItems': req.params.id
			},
			{
				'suggestedItems': req.params.id
			}]
		})
		// find the items
		const updatedItem = await TripItem.findById(req.params.id);
		// update the description
		updatedItem.description = req.body.description
		// save it -- we are mutating a document
		await updatedItem.save();
		// redirect
		res.redirect('/trips/tripHomePage/' + foundTrip._id);
	}
	catch(err) {
		next(err)
	}
})

// delete route
router.delete('/:id', async (req, res, next) => {
	try {
		const foundTrip = await Trip.findOne({
			$or: [{
				'itemsToPlan': req.params.id
			},
			{
				'plannedItems': req.params.id
			},
			{
				'suggestedItems': req.params.id
			}]
		})
		const deleteTripItem = await TripItem.findByIdAndRemove(req.params.id);
		res.redirect('/trips/tripHomePage/' + foundTrip._id)
	}
	catch(err) {
		next(err)
	}
})

module.exports = router;