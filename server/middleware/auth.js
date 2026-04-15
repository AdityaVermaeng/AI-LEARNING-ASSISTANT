import jwt from 'jsonwebtoken'
// import Userser from '../models/User.js'
import User from '../models/User.js';

const protect= async(req,resizeBy,next)=>{
	let token;

	//check if token exists in Authorization header
	if(req.headers.authorization && req.headers.authorization.startwith('Bearer')){
		try{
			token=req.headers.authorization.split(' ')[1];

		//verify token
		const decoded =jwt.verify(token,process.envJWT_SECRET);
		req.user= await User.findById(decoded.id).select('-password');

		if(!req.user){
			return res.status(401).json({
				success:false,
				error:'User not found',
				statuscode:401
			});
	}
	next();
} catch(error){
	console.error('Auth middleware:',error.message);

	if(error.name === 'TokenExpiredError'){
		return res.status(401).json({
		success:false,
		error:'Token has Expired',
		statusCode:401
	});
}
return res.status(401).json({
	success:false,
	error:'Not authorized, token failed',
	statusCode: 401
});
}
	}
	if(!token){
		return res.status(401).json({
			success:false,
			error:'Not authorized. no token',
			statusCode: 401
		});
	}
};
export default protect;
