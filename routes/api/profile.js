const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const passport = require('passport');
// Load Validation
const validateProfileFileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Profile Works' }));

/**
 * @route GET api/profile
 * @desc Get current users profile
 * @access Private
 */

 router.get('/', passport.authenticate('jwt', { session: false}), (req, res) => {
     const errors = {};

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then( profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch( err => res.status(404).json(err));
 });

 /**
  * @route POST
  * @desc Create user Profile
  * @access Private
  */
 router.post('/', passport.authenticate('jwt', { session: false}),
  (req, res) => {
      const { errors, isValid } = validateProfileFileInput(req.body);

    //   Check validation
    if(!isValid) {
        // Return any errors wuth 400 status
        return res.status(400).json(errors);
    }
    //   Get fields
    const profileFields = {};
    console.log(req.body.company);
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.handle) profileFields.company = req.body.company;
    if(req.body.handle) profileFields.website = req.body.website;
    if(req.body.handle) profileFields.location = req.body.location;
    if(req.body.handle) profileFields.bio = req.body.bio;
    if(req.body.handle) profileFields.status = req.body.status;
    if(req.body.handle) profileFields.githubusername = req.body.githubusername;
    // Skills - split into array
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
    // Social
    profileFields.social = {}
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile) {
                // Update If profile exists
                Profile.findOneAndUpdate(
                    { user: req.user.id},
                    { $set: profileFields },
                    { new: true }
                ).then(profile => res.json(profile));
            } else {
                // Create
                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile) {
                            errors.handle = 'That handle already exists';
                            res.status(400).json(errors);
                        }
                        // Create
                        // Save Profile
                        console.log(profileFields);
                        new Profile(profileFields).save().then(profile => res.json(profile));
                    })
            }
        })

   
});


/**
 * @route GET api/profile/handle/:handle
 * @desc Get profile by handle
 * @access Public
 */
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(errors));
});




/**
 * @route GET api/profile/user/:user_id
 * @desc Get profile by user ID
 * @access Public
 */
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});

/**
 * @route GET api/profile/all
 * @desc Get all profiles
 * @access Public
 */
router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles) {
            errors.noprofile = 'There are no profiles';
            return res.status(404).json(errors)
        }
        res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles'}));
})
/**
 * @route POST api/profile/experience
 * @desc Add experience to profile
 * @access Private
 */
router.post('/experience', passport.authenticate('jwt', { session: false}), (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if(isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to exp array
            profile.experience.unshift(newExp);
            profile.save().then(profile => res.json(profile));
        })
})
module.exports = router;
