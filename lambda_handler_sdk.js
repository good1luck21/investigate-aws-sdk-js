const AWS = require('aws-sdk')
AWS.config.update(
    {
        region: 'ap-northeast-1',
    }
)
const dynamoDB = new AWS.DynamoDB()

const params = {
  TableName: 'users',
  AttributeDefinitions: [
    { AttributeName: 'user_id', AttributeType: 'N' },     // number
    { AttributeName: 'created_at', AttributeType: 'S' },  // string
    { AttributeName: 'post_id', AttributeType: 'N' }      // number
  ],
  KeySchema: [
    { AttributeName: 'user_id', KeyType: 'HASH' },     // Partition key
    { AttributeName: 'created_at', KeyType: 'RANGE' }  // Sort key
  ],
  LocalSecondaryIndexes: [
    {
      IndexName: 'post_local_index',
      Projection: {
        ProjectionType: 'ALL' // 射影される属性 > 全て
      },
      KeySchema: [
        { AttributeName: 'user_id', KeyType: 'HASH' },
        { AttributeName: 'post_id', KeyType: 'RANGE' }
      ]
    }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'post_global_index',
      Projection: {
        ProjectionType: 'ALL'
      },
      KeySchema: [
        { AttributeName: 'post_id', KeyType: 'HASH' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 10,
    WriteCapacityUnits: 10
  }
}

const lambdaHandler = (event, context) => {
    if(event.queryMethod === 'createTable') {
        dynamoDB.createTable(params, (err, data) => {
        if (err) {
            console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2))
        } else {
            console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2))
        }
        })
    } else if(event.queryMethod === 'deleteTable') {
        dynamoDB.deleteTable({ TableName: 'users' }, (err, data) => {
        if (err) {
            console.error('Unable to delete table. Error JSON:', JSON.stringify(err, null, 2))
        } else {
            console.log('Deleted table. Table description JSON:', JSON.stringify(data, null, 2))
        }
        })
    } else if (event.queryMethod === 'insertData') {
        const params = {
            TableName: 'users',
            Item: {
                'user_id': { N: '1' },
                'created_at': { S: '2021-01-01' },
                'post_id': { N: '1' }
            }
        }
        dynamoDB.putItem(params, (err, data) => {
            if (err) {
                console.error('Unable to insert data. Error JSON:', JSON.stringify(err, null, 2))
            } else {
                console.log('Inserted data. Table description JSON:', JSON.stringify(data, null, 2))
            }
        })
    } else if (event.queryMethod === 'scanData') {
        const params = {
            TableName: 'users',
        }
        dynamoDB.scan(params, (err, data) => {
            if (err) {
                console.error('Unable to scan data. Error JSON:', JSON.stringify(err, null, 2))
            } else {
                console.log('Scanned data. Table description JSON:', JSON.stringify(data, null, 2))
            }
        })
    }
};

module.exports = { lambdaHandler }