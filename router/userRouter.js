const express = require('express');
const router = express.Router();
const { body , validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middlewares/authenticate');

/*
    @usage : to Register a User
    @url : /api/users/register
    @fields : name , email , password
    @method : POST
    @access : PUBLIC
 */
router.post('/register', [
    body('name').notEmpty().withMessage('Name is Required'),
    body('email').notEmpty().withMessage('Email is Required'),
    body('password').notEmpty().withMessage('Password is Required'),
] ,async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors : errors.array()});
    }
    try {
        let { name , email , password } = request.body;
        // check if the user is exits
        let user = await User.findOne({email : email});

        if(user){
            return response.status(401).json({errors : [{msg : 'User is Already Exists'}]});
        }

        // encode the password
        let salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password , salt);

        // avatar url
        let avatar = gravatar.url(email , {
            s : '300',
            r : 'pg',
            d : 'mm'
        });

        // insert the user into database
        user = new User({name , email , password , avatar});
        await user.save();
        response.status(200).json({msg : 'Registration is Success'});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : to Login a User
    @url : /api/users/login
    @fields : email , password
    @method : POST
    @access : PUBLIC
 */
router.post('/login' , [
    body('email').notEmpty().withMessage('Email is Required'),
    body('password').notEmpty().withMessage('Password is Required'),
],async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors : errors.array()});
    }
    try {
        let {email , password} = request.body;

        // check if the correct email
        let user = await User.findOne({email : email});

        if(!user){
            return response.status(401).json({errors : [{msg : 'Invalid Email'}]});
        }

        // check the passwords
        let isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return response.status(401).json({errors : [{msg : 'Invalid Password'}]});
        }

        // create a token and send to Client
        let payload = {
            user : {
                id : user.id,
                name : user.name
            }
        };
        jwt.sign(payload , process.env.JWT_SECRET_KEY, (error , token) => {
            if(error) throw error;
            response.status(200).json({
                msg : 'Login is Success',
                token : token
            });
        })
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage :  to get user Info
    @url : /api/users/me
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
router.get('/me', authenticate , async (request , response) => {
    try {
        let user = await User.findById(request.user.id).select('-password');
        response.status(200).json({
            user : user
        });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
})

module.exports = router;
