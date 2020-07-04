'use strict'

const express = require('express');
const generalController = require('../controllers/generalController');
const api = express();
const authentication = require('../middlewares/authenticated');

api.post('', authentication.ensureAuth, generalController.commands);

module.exports = api;