import { createClient } from "redis";
import { REDIS_URL } from "../config/env.config.js";

export const redisClinet = createClient({
  url: REDIS_URL,
});

export function redisConnect() {
  redisClinet
    .connect()
    .then(() => {
      console.log("redis connected successfully");
    })
    .catch((err) => {
      console.log("redis fail to connect ");
    });
}
