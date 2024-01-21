const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt');
const Plan = require('../schemas/PlanSchema');


app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/newtrip", (req, res, next) => {

    res.status(200).render("planPage.pug");
})

router.post("/newtrip", async (req, res, next) => {

    var username = req.body.username.trim();
    var country = req.body.country.trim();
    var password = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password) 
    {
        var user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .catch((error) => {
            console.log(error);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render("register.pug", payload);
        });

        if(user == null) 
        {
            // No user found

            var data = req.body;

            //Hash password
            //2^10 = 1024 iterations
            //const saltRounds = 10;
            data.password = await bcrypt.hash(password, 10)

            User.create(data)
            .then((user) => {
                req.session.user = user;
                return res.redirect("/");
            })
        }
        else 
        {
            // User found
            if (email == user.email) {
                payload.errorMessage = "Email already in use.";
            }
            else {
                payload.errorMessage = "Username already in use.";
            }
            res.status(200).render("register.pug", payload);
        }
        
        

    }
    else 
    {
        payload.errorMessage = "Make sure each field has a valid value.";
        res.status(200).render("register", payload);
    }
})

module.exports = router;