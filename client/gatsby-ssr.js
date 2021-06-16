/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */

const React = require('react')

exports.onRenderBody = ({ setHeadComponents, setPostBodyComponents }) => {
    setHeadComponents([
        <script key="analytics" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "9ee8b92699f54957b53f50fd88eed035"}`} defer/>
    ]);
    setPostBodyComponents(<iframe key="inspector" className="w-full hidden" style={{
        height: '500px',
        position: 'absolute',
        bottom: 0,
        zIndex: 1000,
    }} data-xstate="data-xstate"/>);
}
