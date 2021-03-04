import { Link } from "gatsby"
import React from "react"

type Props = {
    siteTitle: string
}

const Header : React.FC<Props> = ({ siteTitle }) => (
  <header className="bg-indigo-700">
    <div className="container mx-auto p-4">
      <h1 className="text-3xl m-0">
        <Link
          to="/"
          className="text-white no-underline"
        >
          {siteTitle}
        </Link>
      </h1>
    </div>
  </header>
)

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
