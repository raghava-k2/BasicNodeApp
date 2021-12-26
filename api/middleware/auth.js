const config = require('config');
const { dummyUser } = require('../constant/apiConstant');
const secretKey = 'cd188e64-660f-11ec-90d6-0242ac120003';

isUserAuthenticated = (req, res, next) => {
    const isSessionRequired = config.get('session.enable');
    if (!isSessionRequired) {
        req.session.user = dummyUser;
        next();
    } else if (req.session?.user && isSessionRequired) {
        next();
    } else {
        res.sendStatus(401);
    }
}

getSession = () => {
    const maxAge = config.get('session.timeout');
    const secret = secretKey;
    return {
        secret,
        saveUninitialized: false,
        cookie: { maxAge, secure: false, sameSite: true },
        resave: false, rolling: true
    }
};

module.exports = { isUserAuthenticated, getSession }