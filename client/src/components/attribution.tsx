import React from "react"

export type AttributionProps = {
    name: string,
    url: string,
    author: {
        name: string,
        url: string,
    },
    license: {
        name: string,
        url: string,
    },
    modifications?: string,
}

const Attribution : React.FC<AttributionProps> = (props) => (
    <p className="text-xs">
        <a href={props.url}>{props.name}</a>
        {` by `}
        <a href={props.author.url}>{props.author.name}</a>
        {` is licensed under `}
        <a href={props.license.url}>{props.license.name}</a>.
        { props.modifications ? <span className="italic">{` `}{props.modifications}.</span> : ``}
    </p>
)

export default Attribution
