import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage : React.FC<{}> = () => (
  <Layout>
    <SEO title="404: Not found" />
    <h1 className="text-3xl mb-2">404: Not Found</h1>
    <p>Why not start <Link to="/">at the beginning</Link>?</p>
  </Layout>
)

export default NotFoundPage
