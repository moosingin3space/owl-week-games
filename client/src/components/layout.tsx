/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./header"
import "./layout.css"

const Layout : React.FC<{}> = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <div className="container mx-auto px-4 pt-3 bg-gray-200 h-full">
        <main>{children}</main>
        <footer className="mt-8 italic">
          © 2020-{new Date().getFullYear()} Nathan Moos, Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>.
          {` `}
          Source available on
          {` `}
          <a href="https://github.com/moosingin3space/owl-week-games">GitHub</a>.
        </footer>
      </div>
    </>
  )
}

export default Layout
