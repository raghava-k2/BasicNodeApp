const express = require("express");
const bcrypt = require('bcryptjs');
const Users = require("../../model/users");
const router = express.Router();
const config = require('config');
const { dummyUser } = require("../../api/constant/apiConstant");

router.get('/isAlive', (req, res) => {
	const isSessionRequired = config.get('session.enable');
	if (!isSessionRequired) {
		return res.status(200).send(dummyUser);
	} else if (req.session?.user) {
		const user = { ...req.session.user };
		delete user.password;
		res.status(200).send(user);
	} else {
		res.status(401).send('Session Expired');
	}
});

router.post('/login', function (req, res) {
	const { username, password } = req.body
	Users.findByUserName(username).then(data => {
		if (!data || !bcrypt.compareSync(password, data.password)) {
			res.sendStatus(401);
		} else {
			const { userId } = data;
			const lastLoggedIn = new Date();
			Users.update({ lastLoggedIn }, { where: { userId } }).then(() => {
				req.session.regenerate(() => {
					req.session.user = data;
					res.sendStatus(200);
				});
			}).catch(err => {
				console.error(err);
				res.status(500).send('Failed to update user last logged in date');
			});
		}
	}).catch(err => {
		console.error(err);
		res.status(500).send('Failed to fetch user data');
	});
});

router.delete('/logout', (req, res) => {
	req.session.destroy(() => { });
	res.clearCookie('connect.sid');
	res.sendStatus(204);
})
module.exports = router
