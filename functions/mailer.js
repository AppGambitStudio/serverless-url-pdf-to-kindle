const 
AWS         = require('aws-sdk'),
config      = require('../config/' + process.env.STAGE + '.json'),
path        = require('path'),
nodemailer  = require('nodemailer');

const ses   = new AWS.SES({
    region: config.ses_region
});
var s3      = new AWS.S3();

const getS3File = (bucket, key) => {
    return new Promise(function (resolve, reject) {
        s3.getObject(
            {
                Bucket: bucket,
                Key: key
            },
            function (err, data) {
                if (err) return reject(err);
                else return resolve(data);
            }
        );
    })
}

module.exports.handler = (event, context, callback) => {
    console.log('Send email', event.Records[0].s3);
    
    const reqData = event.Records[0].s3;

    getS3File(reqData.bucket.name, reqData.object.key)
    .then((fileData) => {
        
        var mailOptions = {
            from: config.email_sender,
            to: config.kindle_email,
            subject: reqData.object.key,
            text: reqData.object.key,
            attachments: [
                {
                    filename: reqData.object.key,
                    content: fileData.Body,
                    contentType: 'application/pdf'
                }
            ]
        };

        var transporter = nodemailer.createTransport({
            SES: ses
        });

        // send email
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
                console.log('Error sending email');
                callback();
            } else {
                console.log('Email sent successfully');
                callback();
            }
        });
    });    
};