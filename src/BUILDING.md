# Building the application with Sencha Cmd

## Prerequisites

* Sencha Cmd v6.2 (works at least with 6.2.2.36)
* does NOT work with at least Sencha Cmd 6.6
* git
* node, npm
* Ext 6.2

## Install Ext 6.2

* just extract an ext package into `src/ext`

## Initialize the submodules, install dev packages

* `git submodule update --init --recursive`
* `cd src`
* `npm install`

## Initialize the Sencha setup

* `cd src`
* `sencha app install`

## Development

* `cd src`
* sencha app watch

The application now runs at http://localhost:1841

In order to get (almost) everything to work locally, it is advised to reverse
proxy everything into a single host and adapt the `appContext.json` accordingly.
For nginx the following snippets might be useful:

```
location / {
  proxy_pass http://127.0.0.1:1841;
}

location /ogc {
  proxy_set_header Authorization "Basic base64encodedcredentialshere";
  proxy_set_header Origin "";
  proxy_pass http://local-geoserver-installation/ogc;
}
location /geonetwork {
  proxy_set_header Authorization "Basic base64encodedcredentialshere";
  proxy_pass http://local-gnos-installation/geonetwork;
}
```

This is necessary because:

* authorization works different in production (Shibboleth) and the client does not have the credentials
* access to certain resources (Geoserver REST API, GNOS REST API) needs everything on the same domain
* extracting the CSRF token for GNOS needs access to iframe cookies

## Production

* have a look at the `.gitlab-ci.yml` on how to produce a production build
