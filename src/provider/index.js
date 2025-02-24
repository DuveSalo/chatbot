import { MetaProvider as Provider } from "@builderbot/provider-meta";
import { createProvider } from "@builderbot/bot";
import { config } from "../config/index.js";

export const provider = createProvider(Provider, {
  jwtToken: config.jwtToken,
  numberId: config.numberId,
  verifyToken: config.verifyToken,
  version: config.version,
});
