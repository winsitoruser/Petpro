declare module 'winston-logstash-transport' {
  import Transport from 'winston-transport';
  
  export interface LogstashTransportOptions extends Transport.TransportStreamOptions {
    host?: string;
    port?: number;
    node_name?: string;
    localhost?: string;
    pid?: number;
    max_connect_retries?: number;
    timeout_connect_retries?: number;
    ssl_enable?: boolean;
    ssl_key?: string;
    ssl_cert?: string;
    ca?: string;
    ssl_passphrase?: string;
    rejectUnauthorized?: boolean;
  }

  export class LogstashTransport extends Transport {
    constructor(options?: LogstashTransportOptions);
  }
}
