// Authors:
// Shane Oatman https://github.com/shoatman
// Sunil Bandla https://github.com/sunilbandla
// Daniel Dobalian https://github.com/danieldobalian

var express = require("express");
var morgan = require("morgan");
var passport = require("passport");
var BearerStrategy = require('passport-azure-ad').BearerStrategy;

/* Update these four variables with your values from the B2C portal */
var clientID = "d1566d6a-cd31-483a-9898-da339fb35e5b"; 
var b2cDomainHost = "lucnd.b2clogin.com";
var tenantIdGuid = "31150864-1afd-4b3c-b5c0-eb779fa0ae01";
var policyName = "B2C_1_lucnd";


var options = {
    identityMetadata: "https://" + b2cDomainHost + "/" + tenantIdGuid + "/" + policyName + "/v2.0/.well-known/openid-configuration/",

    clientID: clientID,
    policyName: policyName,
    isB2C: true,
    validateIssuer: false,
    loggingLevel: 'info',
    loggingNoPII: false,
    passReqToCallback: false
};

var bearerStrategy = new BearerStrategy(options,
    function (token, done) {
        // Send user info using the second argument
        done(null, {}, token);
    }
);

var app = express();
app.use(morgan('dev'));

app.use(passport.initialize());
passport.use(bearerStrategy);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/hello",
    passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        console.log(1)
        var claims = req.authInfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        
        if (claims) {
            // Service relies on the name claim.  
            res.status(200).json({'name': claims['given_name'] + " " + claims.family_name});
        } else {
            console.log("Invalid Scope, 403");
            res.status(403).json({'error': 'insufficient_scope'}); 
        }
    }
);

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on port " + port);
});
