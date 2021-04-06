import React, {CSSProperties} from "react"

interface HasPercentage {
    percentage: number
}

const circleWrap : CSSProperties = {
    margin: "50px auto",
    width: 150,
    height: 150,
    borderRadius: "50%",
}

const circleBasic : CSSProperties = {
    width: 150,
    height: 150,
    position: "absolute",
    borderRadius: "50%",
}

const circleMask : CSSProperties = Object.assign({}, circleBasic, {
    clip: "rect(0px, 150px, 150px, 75px)",
})

const circleMaskFill : CSSProperties = Object.assign({}, circleBasic, {
    clip: "rect(0px, 75px, 150px, 0px)",
})

const insideCircle: CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "#fff",
    lineHeight: "120px",
    textAlign: "center",
    marginTop: 15,
    marginLeft: 15,
    position: "absolute",
    zIndex: 100,
    fontWeight: 700,
    fontSize: "2em",
}

const toDegree = (percentage: number) => (percentage/100.0)*180.0
const rotation = (degrees: number) => `rotate(${degrees}deg)`

const createMaskFull = (percentage: number) => Object.assign({}, circleMask, { transform: rotation(toDegree(percentage)) })
const createMaskFill = (percentage: number) => Object.assign({}, circleMaskFill, { transform: rotation(toDegree(percentage)) })

const PercentageCircle: React.FC<HasPercentage> = ({percentage}) => (
    <div style={circleWrap} className="bg-red-500">
        <div>
            <div style={createMaskFull(percentage)}>
                <div style={createMaskFill(percentage)} className="bg-green-400"/>
            </div>

            <div style={circleMask}>
                <div style={createMaskFill(percentage)} className="bg-green-400"/>
            </div>

            <div style={insideCircle}>
                {percentage}%
            </div>
        </div>
    </div>
)

export default PercentageCircle
