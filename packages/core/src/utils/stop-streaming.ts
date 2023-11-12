import { ResponseStream } from "lambda-stream";

export function StopStreaming(responseStream: ResponseStream, message: string) {
  responseStream.write(message);
  responseStream.end();
}
