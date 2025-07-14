import { Server } from './shared/modules/server/server.config';

function main(): Promise<void> {
  return new Server().setup();
}
void main();
