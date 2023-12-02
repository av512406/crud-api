const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-southeast-2'
});

const dynamoDBTable = 'users'
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userPath = '/users' ;

exports.handler = async (event) => {
  // TODO implement
  let response ;
  console.log(event);
  switch (event.httpMethod) {
    case 'POST':
      response = await saveUser(JSON.parse(event.body));
      break ;
    case  'GET' :
      response = await getUsers() ;
      break;
    case  'PUT':
      const requestBody = JSON.parse(event.body);
      response = await updateUser(requestBody.id , requestBody.updateKey , requestBody.updateValue);
      break;
    case 'DELETE':
      response = await deleteUser(JSON.parse(event.body).id) ;
      break ;
    
    default:
      response = buildResponse(404,'404 not found');
  }
  return response;
};

async function deleteUser(id){
  const params = {
    TableName : dynamoDBTable , 
    Key : {
      'id' : id
    },
    returnValues : "ALL_OLD"
  }
  return await dynamodb.delete(params).promise().then( response => {
    const body = {
      Operation : 'DELETE' , 
      Message : 'SUCCESS' ,
      Item : response 
    }
    return buildResponse(200, body) ;
  },(error) => {
    console.log(error) ;
  })
}

async function updateUser(id , updateKey , updateValue){
  const params = {
    TableName : dynamoDBTable,
    Key :{
      'id' : id 
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues : {
      ':value' : updateValue
    },
    returnValues : 'UPDATED_NEW'
  }
  return await dynamodb.update(params).promise().then( response => {
    const body = {
      Operation : 'UPDATE' ,
      Message: 'SUCCESS' , 
      Item : response
    }
    return buildResponse(200 , body) ;
  }, (error) => {
    console.log(error) ;
  })
  
}

async function getUsers() {
  const params = {
    TableName : dynamoDBTable
  }
  const allUsers = await dynamodb.scan(params).promise();
  const body = {
    users: allUsers
  }
  return buildResponse(200, body) ;
}

async function saveUser(requestBody){
  const params = {
    TableName : dynamoDBTable ,
    Item : requestBody
  }
  return await dynamodb.put(params).promise().then(() => {
    const body = {
      Operation : 'SAVE',
      Message: 'SUCCESS' ,
      Item : requestBody
    }
    return buildResponse(200 , body) ;
  }, (error) => {
    console.log(error);
  })
}

function buildResponse(statuscode ,body){
  return {
    statusCode : statuscode,
    headers : {
      'Content-Type': 'application/json'
    },
    body : JSON.stringify(body)
  }
}
