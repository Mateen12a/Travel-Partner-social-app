const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const Trip = require('../schemas/trip.js');
const TripItem = require('../schemas/tripItem.js')
const User = require('../schemas/UserSchema.js');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
// rendering create trip page
router.get('/createTripPlan', (req, res) => {
	const foundUser = req.session.username;
	const foundTrip = Trip.findById(req.params.id)
	res.render('trips/createTripPlan.ejs')
});

// this method creates new items to the list
router.get('/addNewItem/:id', async (req, res, next) => {
	try {
		// find the actual trip
		const foundTrip = await Trip.findById(req.params.id);
		// the foundTrip now is saved within the current session of the user
		req.session.savedTrip = foundTrip;
		// render the home page for the actual trip for user
		res.render('trips/tripHomePage.ejs', {
			// the saved trip is now the saved session of the user
			savedTrip: req.session.savedTrip
		})
	}
	catch(err) {
		next(err)
	}
})

router.get('/tripHomePage/:id', async(req, res, next) => {
	try {
		const foundTrip = await Trip.findById(req.params.id)
		.populate({
			path: 'itemsToPlan'
		})
		.populate({
			path: 'plannedItems'
		})
		.populate({
			path: 'suggestedItems'
		})
		.populate(
			'members'
		)
		.exec()
		res.render('trips/tripHomePage.ejs', {
			savedTrip: foundTrip,
		})
	} catch(err){
		next(err)
	}
})	

// post route
// This creates a new Trip
router.post('/tripHomePage', async (req, res, next) => {
	try {
		// create a trip
		const createdTrip =  await Trip.create(req.body);
		// get the destination
		createdTrip.destination = req.body.destination;
		// get the members name
		createdTrip.member = req.body.member;
		// get the start date 
		createdTrip.startDate = req.body.startDate;
		// get the end date that the user entered
		createdTrip.returnDate  = req.body.returnDate;
		// get the description that the user entered
		createdTrip.description = req.body.description;
		// save the trip
		const savedTrip = await createdTrip.save();
		//this saves the trip to the session to be accessed later from a different route
		req.session.savedTrip = savedTrip;
		res.redirect('/trips/tripHomePage/' + createdTrip._id)
	}
	catch(err) {
		next(err)
	}
});

router.get('/savedTrips', async(req, res, next) => {
	try {
		// find the all trips
		const foundTrips = await Trip.find({})
		res.render('trips/tripIndex.ejs', {
			foundTrips: foundTrips
		})
	} catch(err){
		next(err)
	}
})

//edit route
// this is editing the trip as a whole
router.get('/:id/tripEdit', async(req, res, next) => {
	try {
		// find the trip first
		const foundTrip = await Trip.findById(req.params.id)
		// render the edit page with the trip that correlates accordingly
		res.render('trips/tripEdit.ejs', {
			trip: foundTrip
		})
	} catch(err){
		next(err)
	}
})

// update route
// this is updating the trip
router.put('/:id', async(req, res, next) => {
	try {
		const updateTrip = await Trip.findById(req.params.id)
		updateTrip.destination = req.body.destination
		updateTrip.startdate = req.body.startDate;
		updateTrip.returnDate = req.body.returnDate;
		updateTrip.description = req.body.description;
		// save the trip because we are mutating the document
		await updateTrip.save();

		res.redirect('/trips/tripHomePage')
	} catch(err){
		next(err)
	}
})

// new route
// this created a new list item to be added to the page
router.get('/createList', (req, res) => {
	// the saved trip has the information of the saved session of the user
    res.render('trips/newList.ejs', {
    	savedTrip: req.session.savedTrip
    });
});

//delete route
router.delete('/:id', (req, res) => {
	// find the id of the trip and delete it
    Trip.deleteOne({_id: req.params.id}, (err, result) => {
        if(err){
            res.send(err)
        } else {
        	// bring them back to the home page
            res.redirect('/');

        }
    })
});


// ADDING MEMBERS
// new route
// this created a new member to be added to the home page
router.get('/addMembers', (req, res) => {
	let messageToShow = ""

	if(req.session.message) {
		messageToShow = req.session.message
		req.session.message = "" 
	} 
	// the saved trip has the information of the saved session of the user
    res.render('trips/addMembers.ejs', {
    	message: messageToShow,
    	savedTrip: req.session.savedTrip
    });
});

// creating a member and adding it to the page
router.post('/addMembers/:id', async (req, res, next) => {
	try {
		// find the trip
		const foundTrip = await Trip.findById(req.params.id)
	
		// find the user by the username from the form
		const newMember = await User.findOne({username: req.body.username})

		// if the username that the user entered does not exist
		if(newMember === null) {
			// show this message
			req.session.message = "User not found!"
			res.redirect('/trips/tripHomePage/' + foundTrip._id)
		} else {			
			// add the new member to the members array
			foundTrip.members.push(newMember);
	
			// save the foundTrip, because you added a new member to its members array
			await foundTrip.save()
	
			res.redirect('/trips/tripHomePage/' + foundTrip._id)
		}
	}	
	catch(err) {
		next(err)
	}
});

// show route for each member

// first we need to find a member by their id
router.get('/:id/showMember', async (req, res, next) => {
	try {
		const foundMember = await User.findById(req.params.id)
		res.render('trips/memberDelete.ejs', {
			foundMember: foundMember
		})
	}
	catch(err) {
		next(err)
	}
});

// delete route for member
router.delete('/member/:memberId/:tripId', async (req, res, next) => {
	try {
		// find the trip
		const foundTrip = await Trip.findById(req.params.tripId)
		
		let memberIndex = -1

		// loop through members
		for(let i = 0; i < foundTrip.members.length; i++){
			// if these two match -- the one that is clicked on
			if(foundTrip.members[i] == req.params.memberId){

				memberIndex = i

			} else {
				console.log('they dont');
			}
		}

		foundTrip.members.splice(memberIndex, 1);
		await foundTrip.save()


		res.redirect('/trips/tripHomePage/' + foundTrip._id);
	}
	catch(err) {
		next(err)
	}
});
async function getPayload(username, userLoggedIn) {
    var user = await User.findOne({ username: username })


    if(user == null) {

        user = await User.findById(username);

        if (user == null) {
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }
    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn), //Required for Following/Followers, but returns hash password atm.
        profileUser: user
    }
}
// route to show all the trips that user is apart of
router.get('/showAllMyTrips/', async (req, res, next) => {
	try {
		// var payload = await getPayload(req.params.username, req.session.user);
		const user = await User.findById(req.session.user)
		if (user == null || user== undefined ){res.redirect('/')}
		const foundUser = user.username
		const foundTrips = await Trip.find({})
		if(foundUser == undefined || foundUser == null ){
			res.redirect('/')
		}else{
		res.render('trips/showAllMyTrips.ejs', {
			foundTrips: foundTrips,
			foundUser: foundUser
		})
	}
		console.log(foundTrips)
		console.log(foundUser)
	}
	catch(err) {
		next(err)
	}
});

module.exports = router;