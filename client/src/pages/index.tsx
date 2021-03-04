import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage : React.FC<{}> = () => (
  <Layout>
    <SEO title="Home" />
    <h1 className="text-lg mb-2">Choose a game:</h1>
    <p>
        <Link to="/patronus-quiz">Patronus Quiz</Link>
    </p>
    <p>
        <Link to="/dueling-club">Dueling Club</Link>
    </p>
  </Layout>
)

export default IndexPage
