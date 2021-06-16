#!/bin/sh

# This script is intended to be invoked from the root of the project. While
# today, it is trivial, it may grow.

cd client
npm install
npx gatsby build
