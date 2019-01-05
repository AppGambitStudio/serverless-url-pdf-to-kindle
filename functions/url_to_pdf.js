const 
AWS         = require('aws-sdk'),
config      = require('../config/' + process.env.STAGE + '.json'),
path        = require('path');

const s3 = new AWS.S3({});

module.exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const req = JSON.parse(event.Records[0].body);

    process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];    
    const phantomjsPath = path.join(__dirname, '../node_modules/phantomjs-prebuilt/bin/phantomjs');    

    // prepare PhantomJS
    const conversion = require("phantom-html-to-pdf")({
        phantomPath: phantomjsPath
    });

    conversion({
        url: req.url
    }, (err, pdf) => {
        if(err){
            console.log('Conversion error', err);
            return callback();
        }else{
            var params = {
                Body: pdf.stream, 
                Bucket: config.s3_bucket, 
                Key: req.title + ".pdf"
            };

            s3.upload(params, (err, data) => {
                if (err) console.log('S3 upload error', err, err.stack);
                callback();
            });            
        }
    });
}