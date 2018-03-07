import cli from 'commander';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { vSphereGraphQL } from '../index';

cli
  .version('0.1.0')
  .option('-h --host <hostname>', 'vCenter host')
  .option('-u --username <username>', 'Username')
  .option('-p --password <password>', 'Password')
  .option('-s --session <sessionId>', 'Session ID')
  .option('--port <port>', 'Server Port', parseInt)
  .option('-i --insecure', 'Insecure')
  .parse(process.argv);

const PORT = cli.port || 8080;

if (cli.insecure) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

vSphereGraphQL(cli.host)
  .then(schema => {
    const app = express();
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        graphiql: true,
      }),
    );

    app.listen(PORT, err => {
      if (err) {
        process.stderr.write(err.message + '\n');
        process.exit(1);
      }
      process.stdout.write(`Started GraphQL vSphere server on ${PORT}\n`);
    });
  })
  .catch(console.error); // eslint-disable-line
