require('dotenv').config()
const mqtt = require('mqtt');
const express = require('express');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const PORT = process.env.PORT || 3030;

const app = express();

// Environment Variables
const url = process.env['INFLUX_URL'];
const token = process.env['INFLUX_TOKEN'];
const org = process.env['INFLUX_ORG'];
const bucket = process.env['INFLUX_BUCKET'];

// Configcure clients
const client = mqtt.connect('mqtt://broker.emqx.io');
const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket);

/* MQTT CLient */
client.subscribe('testuser/#');
client.on('message', function (topic, payload) {
    const data = JSON.parse(payload.toString());
    const point = new Point(data.point)
        .tag('device_type', data.device_type)
        .tag('device_id', data.device_id)
        .tag('user_id', data.user_id)
        .timestamp(data.timestamp)
        .floatField('weight', data.weight);
    writeApi.writePoint(point);
});

app.get('/', async(req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});