// Authenticates the user

/* Authentication header check from request
Currently always moves to next function  */
const AuthUser = (req, res, next) => (next());

export default AuthUser;
