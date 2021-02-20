#!/bin/bash

lerna bootstrap
chmod +x  /Users/kamilafsar/Projects/samen/example/server/node_modules/.bin/samen
chmod +x /Users/kamilafsar/Projects/samen/example/client/node_modules/.bin/samen
npm run samen build