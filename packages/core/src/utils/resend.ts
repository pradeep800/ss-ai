import { Config } from "sst/node/config";
import { Resend } from "resend";
export const resend = new Resend(Config.RESEND_API_KEY);
