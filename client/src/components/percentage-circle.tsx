import React from "react"

import * as styles from "./percentage-circle.module.css"

interface HasPercentage {
    percentage: number
}

const toDegree = (percentage: number) => (percentage/100.0)*180.0
const rotation = (degrees: number) => `rotate(${degrees}deg)`

const createRotation = (percentage: number) => ({ transform: rotation(toDegree(percentage)) })

const PercentageCircle: React.FC<HasPercentage> = ({percentage, children}) => (
    <div className={`bg-red-500 ${styles.circleWrap}`}>
        <div className={styles.circleMask} style={createRotation(percentage)}>
            <div style={createRotation(percentage)} className={`bg-green-400 ${styles.circleMaskFill}`}/>
        </div>

        <div className={styles.circleMask}>
            <div style={createRotation(percentage)} className={`bg-green-400 ${styles.circleMaskFill}`}/>
        </div>

        <div className={`${styles.insideCircle} ${children ? styles.hasChildren : ''}`}>
            {children}
            <span>
                {percentage}%
            </span>
        </div>
    </div>
)

export default PercentageCircle
