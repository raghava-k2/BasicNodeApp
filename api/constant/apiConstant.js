const dummyUser = { userId: 29, role: 'ADMIN' };

const TIME_CONSTANT = {
    DATA_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss'
}

const FILE_PATH = {
    GCP_TEMP_LOCATION: '/tmp/gcp/',
    STANDARD_CONTROL_LOCATION: '/tmp/standardControl/',
    FILES_TEMP_LOCATION: '/tmp/files/'
}

const FILE_UPLOAD = {
    INPROGRESS: 'INPROGRESS',
    ERROR: 'ERROR',
    SUCCESS: 'SUCCESS'
}

module.exports = { dummyUser, TIME_CONSTANT, FILE_PATH, FILE_UPLOAD };