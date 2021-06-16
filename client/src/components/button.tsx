import React from "react"

type ButtonClickHandler = React.MouseEventHandler<HTMLButtonElement>;

type Props = {
    text: string,
    enabled?: boolean,
    onClick?: ButtonClickHandler,
}

const Button : React.FC<Props> = ({text, enabled, onClick}) => (
    <button className="bg-green-600 p-4 text-white hover:bg-green-200 hover:text-black disabled:bg-gray-400"
        disabled={enabled ? false : true}
        onClick={onClick}
    >
        {text}
    </button>
)

Button.defaultProps = {
    enabled: true,
}

export default Button
