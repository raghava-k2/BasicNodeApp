const CryptoJS = require("crypto-js");

const encrypt = (inputString, symmetricSecreteKey) => {
    return CryptoJS.AES.encrypt(inputString, symmetricSecreteKey).toString();
}


const decrypt = (encryptedString, symmetricSecreteKey) => {
    const bytes = CryptoJS.AES.decrypt(encryptedString, symmetricSecreteKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encrypt, decrypt };