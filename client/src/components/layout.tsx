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

interface LayoutProps {
    scrollBody?: boolean
}

const Layout : React.FC<LayoutProps> = ({ scrollBody, children }) => {
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
      <div className="h-full layoutRoot">
        <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
        <main className={`container h-full mx-auto px-4 pt-3 bg-gray-200 ${scrollBody ? 'overflow-y-scroll' : 'overflow-y-hidden'}`}>
            {children}
        </main>
        <footer className="container mx-auto bg-gray-200 pt-8 italic">
          © 2020-{new Date().getFullYear()} Nathan Moos, Built with
          {` `}
          <a href="https://www.gatsbyjs.com">Gatsby</a>.
          {` `}
          Source available on
          {` `}
          <a href="https://github.com/moosingin3space/owl-week-games">GitHub</a>.
        </footer>
      </div>
  )
}

Layout.defaultProps = {
    scrollBody: true
}

export default Layout
