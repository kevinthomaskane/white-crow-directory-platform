import Typesense from 'typesense';

export function createTypesenseClient({
  host = 'localhost',
  port = 10,
  protocol = 'http',
  apiKey,
}: {
  host: string;
  port: number;
  protocol: string;
  apiKey: string;
}) {
  if (!apiKey) {
    throw new Error('TYPESENSE_API_KEY environment variable is required');
  }

  return new Typesense.Client({
    nodes: [{ host, port, protocol }],
    apiKey,
    connectionTimeoutSeconds: 5,
  });
}
