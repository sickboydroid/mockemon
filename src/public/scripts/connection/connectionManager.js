import { setup } from "./signallingHelper";

export async function connect(socket) {
  await setup(socket);
}
