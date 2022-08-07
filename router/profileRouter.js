const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const authenticate = require('../middlewares/authenticate');
const {body , validationResult} = require('express-validator');

/*
    @usage : Get a Profile
    @url : /api/profiles/me
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
router.get('/me' , authenticate,  async (request , response) => {
    try {
        let profile = await Profile.findOne({user : request.user.id}).populate('user' , ['name' ,'avatar']);
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found'}]});
        }
        response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Create a Profile
    @url : /api/profiles/
    @fields : company , website , location , designation , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method : POST
    @access : PRIVATE
 */
router.post('/', [
    body('company').notEmpty().withMessage('Company is Required'),
    body('website').notEmpty().withMessage('Website is Required'),
    body('location').notEmpty().withMessage('Location is Required'),
    body('designation').notEmpty().withMessage('Designation is Required'),
    body('skills').notEmpty().withMessage('Skills is Required'),
    body('bio').notEmpty().withMessage('Bio is Required'),
    body('githubUserName').notEmpty().withMessage('GithubUserName is Required'),
    body('youtube').notEmpty().withMessage('Youtube is Required'),
    body('facebook').notEmpty().withMessage('Facebook is Required'),
    body('linkedin').notEmpty().withMessage('Linkedin is Required'),
    body('twitter').notEmpty().withMessage('Twitter is Required'),
    body('instagram').notEmpty().withMessage('Instagram is Required')
], authenticate , async(request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return  response.status(401).json({errors : errors.array()});
    }
    try {
        let {company , website , location , designation , skills , bio , githubUserName ,
            youtube , facebook , twitter , linkedin , instagram} = request.body;

        let profileObj = {};
        profileObj.user = request.user.id; // id gets from Token
        if(company) profileObj.company = company;
        if(website) profileObj.website = website;
        if(location) profileObj.location = location;
        if(designation) profileObj.designation = designation;
        if(skills) profileObj.skills = skills.toString().split(',').map(skill => skill.trim());
        if(bio) profileObj.bio = bio;
        if(githubUserName) profileObj.githubUserName = githubUserName;

        // social Obj
        profileObj.social = {};
        if(youtube) profileObj.social.youtube = youtube;
        if(facebook) profileObj.social.facebook = facebook;
        if(twitter) profileObj.social.twitter = twitter;
        if(linkedin) profileObj.social.linkedin = linkedin;
        if(instagram) profileObj.social.instagram = instagram;

        // insert to db
        let profile = new Profile(profileObj);
        profile = await profile.save();
        response.status(200).json({
            msg : 'Profile is Created Successfully',
            profile : profile
        });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Update Profile
    @url : /api/profiles/
    @fields : company , website , location , designation , skills , bio , githubUsername, youtube , facebook , twitter , linkedin , instagram
    @method : PUT
    @access : PRIVATE
 */
router.put('/', [
    body('company').notEmpty().withMessage('Company is Required'),
    body('website').notEmpty().withMessage('Website is Required'),
    body('location').notEmpty().withMessage('Location is Required'),
    body('designation').notEmpty().withMessage('Designation is Required'),
    body('skills').notEmpty().withMessage('Skills is Required'),
    body('bio').notEmpty().withMessage('Bio is Required'),
    body('githubUserName').notEmpty().withMessage('GithubUserName is Required'),
    body('youtube').notEmpty().withMessage('Youtube is Required'),
    body('facebook').notEmpty().withMessage('Facebook is Required'),
    body('linkedin').notEmpty().withMessage('Linkedin is Required'),
    body('twitter').notEmpty().withMessage('Twitter is Required'),
    body('instagram').notEmpty().withMessage('Instagram is Required')
], authenticate , async(request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return  response.status(401).json({errors : errors.array()});
    }
    try {
        let {company , website , location , designation , skills , bio , githubUserName ,
            youtube , facebook , twitter , linkedin , instagram} = request.body;

        // check if profile exists
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(401).json({errors : [{msg : 'No Profile Found'}]});
        }

        let profileObj = {};
        profileObj.user = request.user.id; // id gets from Token
        if(company) profileObj.company = company;
        if(website) profileObj.website = website;
        if(location) profileObj.location = location;
        if(designation) profileObj.designation = designation;
        if(skills) profileObj.skills = skills.toString().split(',').map(skill => skill.trim());
        if(bio) profileObj.bio = bio;
        if(githubUserName) profileObj.githubUserName = githubUserName;

        // social Obj
        profileObj.social = {};
        if(youtube) profileObj.social.youtube = youtube;
        if(facebook) profileObj.social.facebook = facebook;
        if(twitter) profileObj.social.twitter = twitter;
        if(linkedin) profileObj.social.linkedin = linkedin;
        if(instagram) profileObj.social.instagram = instagram;

        // update to db
        profile = await Profile.findOneAndUpdate({user : request.user.id} , {
            $set : profileObj
        } , {new : true});

        response.status(200).json({
            msg : 'Profile is Updated Successfully',
            profile : profile
        });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});



/*
    @usage : GET Profile of a user
    @url : /api/profiles/users/:userId
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
router.get('/users/:userId' , async (request , response) => {
    try {
        let userId = request.params.userId;
        let profile = await Profile.findOne({user : userId}).populate('user' , ['name' , 'avatar']);
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found for this user'}]});
        }
        response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : DELETE Profile , userInfo , posts of a user
    @url : /api/profiles/users/:userId
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/users/:userId' , authenticate , async (request , response) => {
    try {
        let userId = request.params.userId;
        let profile = await Profile.findOne({user : userId});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found for this user'}]});
        }
        // delete the profile
        profile = await profile.findOneAndRemove({user : userId});

        // check if user exists
        let user = await User.findOne({_id : userId});
        if(!user){
            return response.status(400).json({errors : [{msg : 'No User Found'}]});
        }
        await User.findOneAndRemove({user : userId});
        // TODO delete the post of a user
        response.status(200).json({msg : 'Account is Deleted'});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Add Experience of a profile
    @url : /api/profiles/experience/
    @fields : title , company , location , from , to , current , description
    @method : PUT
    @access : PRIVATE
 */
router.put('/experience' , [
    body('title').notEmpty().withMessage('Title is Required'),
    body('company').notEmpty().withMessage('Company is Required'),
    body('location').notEmpty().withMessage('Location is Required'),
    body('from').notEmpty().withMessage('From is Required'),
    body('description').notEmpty().withMessage('Description is Required'),
], authenticate , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return  response.status(401).json({errors : errors.array()});
    }
    try {
        let {title , company, location , from , description , to , current} = request.body;
        let newExperience = {
            title : title,
            company : company,
            location : location,
            from : from,
            description : description,
            to : to ? to : ' ',
            current : current ? current : false
        };
        // get profile of a user
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile is Found'}]});
        }
        profile.experience.unshift(newExperience);
        profile = await profile.save();
        response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Delete an Experience of a profile
    @url : /api/profiles/experience/:expId
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/experience/:expId', authenticate , async (request , response) => {
    try {
        let experienceID = request.params.expId;

        // check if profile is exists
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile is Found'}]});
        }
        let removableIndex = profile.experience.map(exp => exp._id).indexOf(experienceID);
        if(removableIndex !== -1){
            profile.experience.splice(removableIndex , 1);
            profile = await profile.save();
            response.status(200).json({
                msg : 'Experience is Deleted',
                profile : profile
            });
        }
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : ADD Education of a profile
    @url : /api/profiles/education/
    @fields : school , degree , fieldOfStudy , from , to , current , description
    @method : PUT
    @access : PRIVATE
 */
router.put('/education' , [
    body('school').notEmpty().withMessage('School is Required'),
    body('degree').notEmpty().withMessage('Degree is Required'),
    body('fieldOfStudy').notEmpty().withMessage('FieldOfStudy is Required'),
    body('from').notEmpty().withMessage('From is Required'),
    body('description').notEmpty().withMessage('Description is Required'),
], authenticate , async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return  response.status(401).json({errors : errors.array()});
    }
    try {
        let {school , degree, fieldOfStudy , from , description , to , current} = request.body;
        let newEducation = {
            school : school,
            degree : degree,
            fieldOfStudy : fieldOfStudy,
            from : from,
            description : description,
            to : to ? to : ' ',
            current : current ? current : false
        };
        // get profile of a user
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile is Found'}]});
        }
        profile.education.unshift(newEducation);
        profile = await profile.save();
        response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Delete an Education of a profile
    @url : /api/profiles/education/:eduId
    @fields : no-fields
    @method : DELETE
    @access : PRIVATE
 */
router.delete('/education/:eduId', authenticate , async (request , response) => {
    try {
        let educationID = request.params.eduId;

        // check if profile is exists
        let profile = await Profile.findOne({user : request.user.id});
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile is Found'}]});
        }
        let removableIndex = profile.education.map(edu => edu._id).indexOf(educationID);
        if(removableIndex !== -1){
            profile.education.splice(removableIndex , 1);
            profile = await profile.save();
            response.status(200).json({
                msg : 'Education is Deleted',
                profile : profile
            });
        }
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*
    @usage : Get all Profiles
    @url : /api/profiles/all
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
router.get('/all', async (request , response) => {
    try {
        let profiles = await Profile.find().populate('user' , ['name' , 'avatar']);
        if(!profiles){
            return response.status(400).json({errors : [{msg : 'No Profiles Found'}]})
        }
        response.status(200).json({profiles : profiles});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
})

/*
    @usage : GET Profile of a user with Profile Id
    @url : /api/profiles/:profileId
    @fields : no-fields
    @method : GET
    @access : PUBLIC
 */
router.get('/:profileId' , async (request , response) => {
    try {
        let profileId = request.params.profileId;
        let profile = await Profile.findById(profileId).populate('user' , ['name' , 'avatar']);
        if(!profile){
            return response.status(400).json({errors : [{msg : 'No Profile Found for this user'}]});
        }
        response.status(200).json({profile : profile});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

module.exports = router;
