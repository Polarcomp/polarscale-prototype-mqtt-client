require('dotenv').config()
const mqtt = require('mqtt');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const url = process.env['INFLUX_URL'];
const token = process.env['INFLUX_TOKEN'];
const org = process.env['INFLUX_ORG'];
const bucket = process.env['INFLUX_BUCKET'];
const client = mqtt.connect('mqtt://broker.emqx.io');

const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket);

client.subscribe('testuser/#');
client.on('message', function (topic, payload) {
    console.log(topic, payload.toString());
    const data = JSON.parse(payload.toString());
    const point = new Point(data.point)
        .tag('device_type', data.device_type)
        .tag('device_id', data.device_id)
        .tag('user_id', data.user_id)
        .timestamp(data.timestamp)
        .floatField('weight', data.weight);
    writeApi.writePoint(point);
    writeApi.close().then(() => {
        console.log('Write finished');
    });
});