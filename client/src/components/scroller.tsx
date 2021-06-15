import React from "react"
import { useInView } from "react-intersection-observer"

import * as styles from "./scroller.module.css"

interface ScrollerProps {
    className?: string
    style?: React.CSSProperties
    topThreshold?: number
    bottomThreshold?: number
}

const Scroller: React.FC<ScrollerProps> = ({className, style, topThreshold, bottomThreshold, children}) => {
    const { ref: topRef, inView: topInView } = useInView({
        initialInView: true,
        threshold: topThreshold || 0.5,
    });
    const { ref: bottomRef, inView: bottomInView } = useInView({
        threshold: bottomThreshold || 0.5,
    });

    const numChildren = React.Children.count(children);
    const taggedChildren = React.Children.map(children, (child, index) => {
        if (index == 0) {
            return <div ref={topRef}>{child}</div>;
        }
        if (index == numChildren-1) {
            return <div ref={bottomRef}>{child}</div>;
        }
        return child;
    });

    return (
        <div className={styles.scrollParent}>
            <div className={`${styles.scrollBox} ${className ? className : ''}`} style={style}>
                {taggedChildren}
            </div>
            {topInView ? null : <div className={styles.scrollUpIcon} aria-hidden={true}/>}
            {bottomInView ? null : <div className={styles.scrollDownIcon} aria-hidden={true}/>}
        </div>
    );
}

export default Scroller;
