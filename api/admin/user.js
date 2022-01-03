const express = require('express');
const router = express.Router();
const Users = require('../../model/users');
const dayjs = require('dayjs');
const bcrypt = require('bcryptjs');
const UsersUseCases = require('../../model/usersUseCase');
const Usecases = require('../../model/usecases');
const { Op } = require('sequelize');
const { isUserAuthenticated } = require('../middleware/auth');

router.get('/', isUserAuthenticated, (req, res) => {
    const query = prepareAndGetQuery(req, ['client']);
    Users.findAndCountAll(query).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        console.log('error fetching Users table : ', err);
        res.status(500).send(err);
    });
});

router.get('/:userId', isUserAuthenticated, (req, res) => {
    const { userId } = req.params;
    Users.findOne({
        where: { userId },
        attributes: { exclude: ['password'] }
    }).then(data => {
        res.status(200).send(data);
    }).catch(error => {
        console.log('error fetching the User details :', error);
        res.status(500).send(error);
    });
});

router.get('/menu/:userId', isUserAuthenticated, (req, res) => {
    const { userId } = req.params;
    Users.findOne({
        where: { userId }, include: [{ model: Usecases, as: 'uuseCase' }],
        attributes: { exclude: ['password', 'name', 'email'] }
    }).then(data => {
        res.status(200).send(data);
    }).catch(error => {
        console.log('error fetching the menu :', error);
        res.status(500).send(error);
    });
});

router.get('/menu/:userId/:cloudId', isUserAuthenticated, (req, res) => {
    const { userId, cloudId } = req.params;
    Users.findOne({
        where: { userId, [`$uuseCase.cloudId$`]: cloudId },
        include: [
            {
                model: Usecases, as: 'uuseCase',
                include: [{
                    model: Usecases, as: 'useCase'
                }]
            }
        ],
        attributes: { exclude: ['password', 'name', 'email', 'passwordExpiry'] }
    }).then(data => {
        res.status(200).send(data);
    }).catch(error => {
        console.log('error fetching the menu :', error);
        res.status(500).send(error);
    });
});

router.get('/access/route/:userId', isUserAuthenticated, (req, res) => {
    const { userId } = req.params;
    const { uipath } = req.query;
    Users.count({
        where: { userId, [`$uuseCase.UIRoute$`]: uipath },
        include: [
            {
                model: Usecases, as: 'uuseCase',
                include: [{
                    model: Usecases, as: 'useCase'
                }]
            }
        ]
    }).then((count) => {
        if (count > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(403);
        }
    }).catch(error => {
        console.log('error fetching the user menu route :', error);
        res.status(500).send(error);
    });
});

router.get('/find/all', isUserAuthenticated, (req, res) => {
    Users.findAll({ attributes: ['userId', 'name'] }).then((data) => {
        res.status(200).send(data);
    }).catch(error => {
        console.log('error fetching the users list:', error);
        res.status(500).send(error);
    });
});

router.post('/menu/:userId', isUserAuthenticated, async (req, res) => {
    const { userId } = req.params;
    try {
        await UsersUseCases.destroy({ where: { userId: parseInt(userId) } });
        await UsersUseCases.bulkCreate(req.body);
        res.sendStatus(200);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/', (req, res) => {
    Users.findOne({ where: { name: `${req.body.name}` } }).then(user => {
        if (user) {
            res.status(400).send('UserName already exist');
        } else {
            const { name, password, email } = req.body;
            const hash = bcrypt.hashSync(password, 8);
            const passwordExpiry = dayjs().add(3, 'month');
            const user = { name, password: hash, email, role: 'USER', clientId: 0, passwordExpiry, isFirstTimeLoggedIn: 0 };
            Users.create(user).then(() => {
                res.sendStatus(200);
            }).catch(err => {
                console.log('Error insterting into Users :', err);
                res.status(500).send(err);
            });
        }
    }).catch(err => {
        console.log('Error fetchng user details :', err);
        res.status(500).send(err);
    });
});

router.put('/:userId', isUserAuthenticated, (req, res) => {
    const { userId } = req.params;
    Users.findOne({
        where: {
            name: `${req.body.name}`,
            userId: { [Op.ne]: userId }
        }
    }).then(user => {
        if (user) {
            res.status(400).send('UserName already exist');
        } else {
            if (req.body.password) {
                const hash = bcrypt.hashSync(req.body.password, 8);
                req.body.password = hash;
                req.body.passwordExpiry = dayjs().add(3, 'month');
            }
            Users.update(req.body, { where: { userId } }).then(data => {
                res.sendStatus(200);
            }).catch(err => {
                console.log('error updating Users table :', err);
                res.status(500).send(err);
            });
        }
    }).catch(err => {
        console.log('Error fetchng user details :', err);
        res.status(500).send(err);
    });
});

router.put('/changepwd/:userId', isUserAuthenticated, (req, res) => {
    const { userId } = req.params;
    const { currentPassword, confirmPassword } = req.body;
    Users.findOne({ where: { userId } }).then(data => {
        if (!data || !bcrypt.compareSync(currentPassword, data.password)) {
            res.status(400).send('Incorrect Current Password');
        } else {
            const lastLoggedIn = new Date();
            const password = bcrypt.hashSync(confirmPassword, 8);
            Users.update({
                lastLoggedIn, password, passwordExpiry: dayjs().add(3, 'month')
            }, { where: { userId } }).then(() => {
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

router.delete('/:userId', isUserAuthenticated, (req, res) => {
    const { userId } = req.params;
    Users.destroy({ where: { userId: parseInt(userId) } }).then(() => {
        res.sendStatus(200);
    }).catch(err => {
        console.log('error deleting record from Users table :', err);
        res.status(500).send(err);
    });
});

module.exports = router;