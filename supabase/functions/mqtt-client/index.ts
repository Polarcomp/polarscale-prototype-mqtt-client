// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { Client } from 'https://deno.land/x/mqtt/deno/mod.ts'; // Deno (ESM)
import { InfluxDB, Point } from 'https://unpkg.com/@influxdata/influxdb-client-browser/dist/index.browser.mjs';

const influxParameters = {
  url: Deno.env.get('INFLUX_URL'),
  token: Deno.env.get('INFLUX_TOKEN'),
  org: Deno.env.get('ORG_ID'),
  bucket: Deno.env.get('INFLUX_BUCKET')
}

const writeApi = new InfluxDB({ url: influxParameters.url, token: influxParameters.token }).getWriteApi(influxParameters.org, influxParameters.bucket);

const client = new Client({ url: 'mqtt://broker.emqx.io' }); // Deno and Node.js

await client.connect();

await client.subscribe('testuser1/#');

client.on('message', (topic: String, payload: Uint8Array) => {
  console.log(topic, payload);
  /*
  const point = new Point('weight_measurement')
    .tag('device_type', 'ESP32_scale')
    .tag('device_id', 'id_1')
    .tag('user_id', 'test-user1')
    .floatField('weight', 42.0);
  writeApi.writePoint(point);
  writeApi.close().then(() => {
    console.log('Write finished');
  })
  */
});

await client.publish('testuser1/id_1', 'aaa');

//await client.disconnect();

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
