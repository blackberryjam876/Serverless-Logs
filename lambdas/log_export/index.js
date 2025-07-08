const AWS = require('aws-sdk');
const cloudwatchlogs = new AWS.CloudWatchLogs();
const s3 = new AWS.S3();

const RAW_BUCKET = process.env.RAW_BUCKET_NAME;
const LOG_GROUP = process.env.LOG_GROUP_NAME;

exports.handler = async (event) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    try {
        const params = {
            logGroupName: LOG_GROUP,
            startTime: oneHourAgo,
            endTime: now,
            filterPattern: '',
            interleaved: true
        };
        const data = await cloudwatchlogs.filterLogEvents(params).promise();
        const records = data.events.map(evt => ({
            timestamp: evt.timestamp,
            message: evt.message,
            logStream: evt.logStreamName,
        }));
        const key = `logs/${LOG_GROUP}/${Date.now()}.json`;
        await s3.putObject({
            Bucket: RAW_BUCKET,
            Key: key,
            Body: JSON.stringify(records),
            ContentType: 'application/json'
        }).promise();
        console.log(`Wrote ${records.length} events to s3://${RAW_BUCKET}/${key}`);
    } catch (err) {
        console.error(err);
        throw err;
    }
};
