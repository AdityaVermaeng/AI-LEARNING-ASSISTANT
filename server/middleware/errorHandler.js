const errorHandler=(err,req,res,next)=>{
	let statuscode=err.statuscode ||500;
	let message=err.message || "Server Error";


//Monngoose bad object
if(err.name==="CastError"){
	message="Resource not found";
	statuscode=404;
}

//Mongoose duplicate key
if(err.code===11000){
	const field=Object.keys(err.keyVlaue)[0];
	message=`${field} already exists`;
	statuscode=400;
}

//Mongoose validation error
if(err.name==="ValidationError"){
	message=Object.values(err.errors).map((val)=>val.message).join(", ");
	statuscode=400;
}



//Multer file size error
if(err.code==="LIMIT_FILE_SIZE"){
	message="File size exceeds the maximum limit of 10MB";
	statuscode=400;
}


//JWT errors
if(err.name==="JsonWebTokenError"){
	message="Invalid token";
	statuscode=401;
}
if(err.name==="TokenExpiredError"){
	message="Token expired";
	statuscode=401;
}
console.error("Error: ",{
	message:err.message,
	stack:process.env.NODE_ENV==='development' ? err.stack :undefined
});

res.status(statuscode).json({
	success:false,
	error:message,
	statusCode,
	...(process.env.NODE_ENV==='development' && {stack:err.stack})
});
};

export default errorHandler;
