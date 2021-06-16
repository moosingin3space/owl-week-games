import React, { useRef, useEffect } from "react";
import Button from "./button";

interface GaugeProps {
    yellowThresh: number
    greenThresh: number

    buttonLabel: string

    onStopped?: (pointing: number) => void
}

const COLOR_RED = "#f03e3e";
const COLOR_YELLOW = "#ffdd00";
const COLOR_GREEN = "#30b32d";
const COLOR_GRAY = "#666666";
const COLOR_BLACK = "#000000";

function angle(ratio: number): number {
    return -Math.PI + ratio * Math.PI/2;
}

const Gauge: React.FC<GaugeProps> = ({yellowThresh, greenThresh, buttonLabel, onStopped}) => {
    const currentAngle = useRef(1);
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas : HTMLCanvasElement = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        let currentAngleVel = 0.10;
        let lastUpdateTime = Date.now();
        const targetFrameRate = 30.0 / 1000;
        let animationId: number;
        const update = () => {
            const currentUpdateTime = Date.now();
            const deltaT = currentUpdateTime - lastUpdateTime;
            lastUpdateTime = currentUpdateTime;
            currentAngle.current += currentAngleVel * targetFrameRate * deltaT;
            if (currentAngle.current >= 2) {
                currentAngleVel *= -1;
                currentAngle.current = 2;
            }
            if (currentAngle.current <= 0) {
                currentAngleVel *= -1;
                currentAngle.current = 0;
            }
        };

        const paint = (ctx: CanvasRenderingContext2D) => {
            const lineWidth = canvas.width * 0.10;
            const strokeWidth = canvas.height * 0.05;
            const radius = canvas.width / 2 - lineWidth;
            const overshoot = 0.15;

            const w = canvas.width / 2;
            const h = canvas.height * (1 - 1.5*overshoot);

            // draw colored zones
            ctx.lineCap = "butt";
            ctx.save();
            ctx.translate(w, h);
            ctx.lineWidth = lineWidth;
            // red zone
            ctx.strokeStyle = COLOR_RED;
            ctx.beginPath();
            ctx.arc(0, 0, radius, angle(-overshoot), angle(yellowThresh), false);
            ctx.stroke();
            // yellow zone
            ctx.strokeStyle = COLOR_YELLOW;
            ctx.beginPath();
            ctx.arc(0, 0, radius, angle(yellowThresh), angle(greenThresh), false);
            ctx.stroke();
            // green zone
            ctx.strokeStyle = COLOR_GREEN;
            ctx.beginPath();
            ctx.arc(0, 0, radius, angle(greenThresh), angle(2-greenThresh), false);
            ctx.stroke();
            // other yellow zone
            ctx.strokeStyle = COLOR_YELLOW;
            ctx.beginPath();
            ctx.arc(0, 0, radius, angle(2-greenThresh), angle(2-yellowThresh), false);
            ctx.stroke();
            // other red zone
            ctx.strokeStyle = COLOR_RED;
            ctx.beginPath();
            ctx.arc(0, 0, radius, angle(2-yellowThresh), angle(2+overshoot), false);
            ctx.stroke();

            ctx.restore();

            // draw arrow
            ctx.save();
            ctx.translate(w, h);
            ctx.beginPath();
            ctx.fillStyle = COLOR_BLACK;
            ctx.arc(0, 0, strokeWidth, 0, Math.PI * 2, false);
            ctx.fill();

            const pointerLength = 1.05 * radius;
            const theta = angle(currentAngle.current);
            const pointerX = Math.round(pointerLength * Math.cos(theta));
            const pointerY = Math.round(pointerLength * Math.sin(theta));

            const startX = Math.round(strokeWidth * Math.cos(theta - Math.PI / 2));
            const startY = Math.round(strokeWidth * Math.sin(theta - Math.PI / 2));
            const endX = Math.round(strokeWidth * Math.cos(theta + Math.PI / 2));
            const endY = Math.round(strokeWidth * Math.sin(theta + Math.PI / 2));

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(pointerX, pointerY);
            ctx.lineTo(endX, endY);
            ctx.fill();

            ctx.restore();
        };

        const animationFunc = () => {
            update();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            paint(ctx);
            animationId = window.requestAnimationFrame(animationFunc);
        };

        animationId = window.requestAnimationFrame(animationFunc);

        return () => window.cancelAnimationFrame(animationId);
    });

    return (
        <>
            <canvas width={800} height={500} style={{maxWidth: "100%"}} ref={canvasRef}/>
            <Button text={buttonLabel} onClick={() => {
                if (onStopped) {
                    let angle = currentAngle.current;
                    if (angle > 1) {
                        angle = 2 - angle;
                    }
                    onStopped(angle);
                }
            }}/>
        </>
    );
};

export default Gauge
