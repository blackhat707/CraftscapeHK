import { createNestServer } from '../server/src/main';
let cachedServer;

export default async function handler(req, res) {
  if (!cachedServer) {
    cachedServer = await createNestServer();
  }
  return cachedServer(req, res);
}
