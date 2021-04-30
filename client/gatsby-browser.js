/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

// You can delete this file if you're not using it
const inspect = require('@xstate/inspect')

let inspector = null;
const inspectOptions = {
    iframe: false
};

exports.onClientEntry = () => {
    inspector = inspect.inspect();
}

exports.onPreRouteUpdate = () => {
    if (inspector) {
        inspector.disconnect();
        inspector = inspect.inspect();
    }
}
