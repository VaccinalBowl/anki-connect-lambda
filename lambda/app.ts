import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import fetch from 'node-fetch';




export const lambdaHandler = async (event) => {
    console.log(event);
    console.log("####################################");
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1')
    const data = await response.json();
    console.log(data);
    console.log("####################################");
    return "Done"
};
