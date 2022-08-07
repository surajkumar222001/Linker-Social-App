const jwt  = require('jsonwebtoken');

let authenticate = async (request , response , next) => {
    let token = request.header('x-auth-token');
    if(!token){
        return response.status(401).json({msg : 'No Token Provided , Authentication Denied'})
    }
    try {
        let decoded = await jwt.verify(token , process.env.JWT_SECRET_KEY);
        request.user = decoded.user;
        next();
    }
    catch (error) {
       console.error(error);
       response.status(500).json({msg : 'Invalid Token'});
    }
};
module.exports = authenticate;
