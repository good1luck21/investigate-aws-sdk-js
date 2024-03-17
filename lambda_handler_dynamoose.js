// import dynamoose from 'dynamoose';
const dynamoose = require('dynamoose');

// Assuming AWS credentials are set through environment variables or IAM role
dynamoose.aws.sdk.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

// Define a schema that matches your DynamoDB table structure
const testSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true // Ensure this is the correct primary key attribute
    },
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
});

// Create a model that links to your DynamoDB table named 'test'
const TestModel = dynamoose.model('tests', testSchema);

const lambdaHandler = async (event, context) => {
    try {
        if (event.queryMethod === 'createItem') {
            // Create a new item in the table
            await TestModel.create({ id: '1', body: 'test' });
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Item created' }),
                headers: {
                    'Content-Type': 'application/json',
                }
            };
        } else if (event.queryMethod === 'getItems') {
            // Perform a scan operation to retrieve all items from the table
            const data = await TestModel.scan().exec();
            // Format the response with an appropriate status code and body
            return {
                statusCode: 200,
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                }
            };
        }
    } catch (error) {
        console.error(error);
        // Handle any errors that occurred during scan operation
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
            headers: {
                'Content-Type': 'application/json',
            }
        };
    }
};

module.exports = { lambdaHandler };