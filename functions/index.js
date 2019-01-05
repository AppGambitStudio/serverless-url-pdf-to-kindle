const 
serverless  = require('serverless-http'),
express     = require('express'),
bodyParser  = require('body-parser'),
config      = require('../config/' + process.env.STAGE + '.json'),
_           = require('lodash'),
AWS         = require('aws-sdk');

const app         = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sqs = new AWS.SQS({});

app.post('/', (req, res) => {
    const { url, title  } = req.body;

    title = title.replace(' ' , '_');
    
    if(!url) {
        res.send(400);
        return;
    }else{
        var params = {
            MessageBody: JSON.stringify({url, title}),
            QueueUrl: config.sqs_url
        };
        sqs.sendMessage(params, (err, data) => {
            if(err){
                console.log(err);
                res.send(500);
            }else{
                console.log('Message Sent');
            }
            res.send(200);       
        });
    }    
});

module.exports.handler = serverless(app);