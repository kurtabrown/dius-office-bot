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
            console.log("addVisitor succeeded:", JSON.stringify(data));
            resolve(data);
        });
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
            console.log("getVisitors succeeded:", JSON.stringify(data, null, 2));
            resolve(data.Items)
            
        })
    });
}

dbHelper.prototype.removeAllVisitorsFromOffice = (officelocation) => { 
    console.log('Inside removeVisitors');
    const scanParams = {
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
    docClient.scan(scanParams, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            return reject(JSON.stringify(err, null, 2))
        } 
        else {
            data.Items.forEach(function(obj,i){
                var params = {
                    TableName: tableName,
                    Key: {
                        "officelocation": officelocation,
                        "firstname": obj.firstname
                    },
                };
                docClient.delete(params, function(del_err, del_data) {
                    if (del_err) {
                        console.error("Error deleting item. Error JSON:", JSON.stringify(del_err, null, 2));
                    }
                    else {
                        console.log("removeAllVisitorsFromOffice succeeded:", JSON.stringify(del_data, null, 2));
                    }
                });
            });
        }
    });
}

dbHelper.prototype.removeVisitorFromOffice = (firstname, officelocation) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                "officelocation": officelocation,
                "firstname": firstname
            },
        }
        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log("removeVisitorFromOffice succeeded:", JSON.stringify(data, null, 2));
            resolve()
        })
    });
}

function buildKey(obj){
    var hashKey = "id";
    var rangeKey = null;
    var key = {};
    key[hashKey] = obj[hashKey]
    if(rangeKey){
        key[rangeKey] = obj[rangeKey];
    }
    return key;
}
 
module.exports = new dbHelper();