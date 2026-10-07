const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT должно быть целым числом от 1 до 65535.');
}
export const config = { port };
