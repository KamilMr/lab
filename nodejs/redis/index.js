import { createClient } from "redis";

/*Much more examples is [here](https://redis.io/docs/latest/develop/connect/clients/nodejs/)*/ 

/*Basic usage of redis*/
(async () => {
  const client = createClient();

  client.on("error", (err) => console.log("Cli error: ", err));

  await client.connect();

  await client.set("info", "Some lost data");
  const value = await client.get("info");

  console.log(value);
})();
