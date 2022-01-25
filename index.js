const { isUserAuthenticated, getSession } = require('./api/middleware/auth');
const express = require('express')
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json({ limit: '10mb' }))
app.set('trust proxy', 1);
app.use(cookieParser());
app.use(session(getSession()));
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const config = require('config');

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(advancedFormat);
dayjs.tz.setDefault('Asia/Kolkata');

const login = require('./api/login/login')
app.use('/', login)

const requestSummary = require('./api/dashboard/requestSummary');
app.use('/request', isUserAuthenticated, requestSummary);

const client = require('./api/admin/client');
app.use('/client', isUserAuthenticated, client);

const usecase = require('./api/admin/usecase');
app.use('/usecase', isUserAuthenticated, usecase);

const cloud = require('./api/admin/cloud');
app.use('/cloud', isUserAuthenticated, cloud);

const cloudConnectionDB = require('./api/admin/cloudConnectionsDB');
app.use('/cloudConnectionDB', isUserAuthenticated, cloudConnectionDB);

const User = require('./api/admin/user');
app.use('/user', User);

const requestDetailsInfo = require('./api/dashboard/requestDetailsInfo');
app.use('/requestDetail', isUserAuthenticated, requestDetailsInfo);

const requestLog = require('./api/dashboard/requestSummaryLog');
app.use('/requestLog', isUserAuthenticated, requestLog);

const requestStats = require('./api/dashboard/requestStats');
app.use('/requestStats', isUserAuthenticated, requestStats);

const standardControl = require('./api/admin/standardControl');
app.use('/standardControl', isUserAuthenticated, standardControl);

const fileUpload = require('./api/file/file');
app.use('/file', isUserAuthenticated, fileUpload);

app.listen(process.env.PORT || 3001, () => {
    console.log('config files picked :', config.util.getConfigSources().reduce((a, c) => {
        a += `${c.name}\n`
        return a;
    }, ''));
});

