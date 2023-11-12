import Openai from "openai";
import { Config } from "sst/node/config";
export const openai = new Openai({ apiKey: Config.OPENAI_KEYS });
