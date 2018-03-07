/*
 * The purpose of this library is to allow the developer to specify
 * or provide a function that can be used to identify the key to store
 * the metadata cache in localstorage
 * when using a function, the done callback should provide the key
 */
import _ from 'lodash';
import request from 'request';
import xmldom from 'xmldom';
import xmlbuilder from 'xmlbuilder';

const REQUEST_TIMEOUT = 2000;
const SI_XML = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body xmlns:vim25="urn:vim25">
    <vim25:RetrieveServiceContent>
      <vim25:_this type="ServiceInstance">ServiceInstance</vim25:_this>
    </vim25:RetrieveServiceContent>
  </soapenv:Body>
</soapenv:Envelope>`;
const tools = {
  lodash: _,
  request,
  xmldom,
  xmlbuilder,
};

export function defaultCacheKey(_tools, wsdl, done) {
  const url = wsdl.replace(/.wsdl.*$/, '');
  const headers = {
    'Content-Type': 'text/xml',
    'Content-Length': SI_XML.length,
  };

  request.post(
    { headers, url, body: SI_XML, timeout: REQUEST_TIMEOUT },
    (err, res, body) => {
      try {
        if (err) {
          return done(err);
        }
        const doc = new xmldom.DOMParser().parseFromString(body);
        const apiType = _.get(
          doc.getElementsByTagName('apiType'),
          '[0].textContent',
        );
        const apiVersion = _.get(
          doc.getElementsByTagName('apiVersion'),
          '[0].textContent',
        );
        if (apiType && apiVersion) {
          return done(null, `VMware-${apiType}-${apiVersion}`);
        }
        throw new Error('Unable to determine cache key');
      } catch (error) {
        return done(error, null);
      }
    },
  );
}

export default function cacheKey(key, wsdl, done) {
  if (_.isString(key)) {
    return done(null, key);
  } else if (_.isFunction(key)) {
    return key(tools, wsdl, done);
  }
  return defaultCacheKey(tools, wsdl, done);
}
