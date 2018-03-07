import _ from 'lodash';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { createClient } from './soap';

const queryRx = /^(list|retrieve|query|has|find|does|recommended|get|browse|lookup|estimate|currenttime|sessionisactive|read)/i;

function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((accum, key) => {
      accum[key] = obj[key];
      return accum;
    }, {});
}

export function vSphereGraphQL(host) {
  return createClient(`https://${host}/sdk/vimService.wsdl`).then(client => {
    const queryFields = {};
    const mutationFields = {};
    const port = client.services.VimService.VimPort;
    _.forEach(port, (v, k) => {
      const operationFields = k.match(queryRx) ? queryFields : mutationFields;
      operationFields[k] = {
        type: GraphQLString,
      };
    });
    const query = new GraphQLObjectType({
      name: 'Query',
      fields: sortObjectKeys(queryFields),
    });
    const mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: sortObjectKeys(mutationFields),
    });

    return new GraphQLSchema({ query, mutation });
  });
}
