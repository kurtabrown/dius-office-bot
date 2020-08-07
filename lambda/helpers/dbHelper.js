var AWS = require("aws-sdk");
AWS.config.update({region: "ap-southeast-2"});
const tableName = "office_bot_visitors";

var dbHelper = function () { };
var docClient = new AWS.DynamoDB.DocumentClient();

dbHelper.prototype.addVisitor = (firstname, officelocation) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Item: {
              'officelocation' : officelocation,
              'firstname': firstname
            }
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log("Unable to insert =>", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.getVisitor = (firstname) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            ProjectionExpression: "#officelocation, firstname",
            FilterExpression: "#firstname = :firstname",
            ExpressionAttributeNames: {
                "#firstname": "firstname"
            },
            ExpressionAttributeValues: {
                ":firstname": firstname
            }
        }
        docClient.scan(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            resolve(data.Items)
            
        })
    });
}

dbHelper.prototype.getVisitors = (officelocation) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            ProjectionExpression: "#officelocation, firstname",
            FilterExpression: "#officelocation = :officelocation",
            ExpressionAttributeNames: {
                "#officelocation": "officelocation"
            },
            ExpressionAttributeValues: {
                ":officelocation": officelocation
            }
        }
        docClient.scan(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            resolve(data.Items)
            
        })
    });
}

dbHelper.prototype.removeVisitor = (firstname, officelocation) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                "officelocation": officelocation,
                "firstname": firstname
            },
            ConditionExpression: "attribute_exists(officelocation)"
        }
        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log(JSON.stringify(err));
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            resolve()
        })
    });
}

module.exports = new dbHelper();