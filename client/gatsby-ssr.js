/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */

const React = require('react')

exports.onRenderBody = ({ setPostBodyComponents }) => {
    setPostBodyComponents(<iframe key="inspector" className="w-full" style={{
        height: '500px',
        position: 'absolute',
        bottom: 0,
        visibility: 'hidden',
    }} data-xstate="data-xstate"/>);
}
