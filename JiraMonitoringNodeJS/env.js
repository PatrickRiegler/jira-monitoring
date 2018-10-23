let aws_environment_variables = {};
for(let key in process.env ){
    if ( 0 === key.indexOf('AWS')) 
      aws_environment_variables[key] = process.env[key];
}
console.log(`AWS Environment vars: \n`, aws_environment_variables);

exports.handler = (event, context, callback)=>{
    callback(null,'Finished');
};
