var
    jwt = require('jsonwebtoken'),
    tokenSecret = "k528345ddsd0cbdff819e6635c82c9dd8x";
const bcrypt=require('bcrypt');
// Generates a token from supplied payload

module.exports.issue = function(payload) {
    /*payload.iat = Date.now();
    payload.exp = payload.iat+86400000;*/
    var final_payload={userid:payload};
    return jwt.sign(
        final_payload,
        tokenSecret, // Token Secret that we sign it with
        {
            expiresIn: 60*60
        }
    );
};
// Verifies token on a request
module.exports.verify = function(token, callback) {
    return jwt.verify(
        token, // The token to be verified
        tokenSecret, // Same token we used to sign
        {}, //  No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
        callback //Pass errors or decoded token to callback
    );
};

module.exports.generateHash=function(string){
    let ts=Date.now();
    return bcrypt.hashSync(string,ts);
};