import React from "react";
import { Line } from "react-konva";
import { Anchor } from "./Anchor";

const SIZE = 100;

const points = [0, 0, SIZE, 0, SIZE, SIZE, 0, SIZE, 0, 0];

function getAnchorPoints(x, y) {
	const halfSize = SIZE / 2;
	return [
		{
			x: x,
			y: y + halfSize,
		},
		{
			x: x + halfSize,
			y: y,
		},
		{
			x: x + SIZE,
			y: y + halfSize,
		},
		{
			x: x + halfSize,
			y: y + SIZE,
		},
	];
}

export function Border({ step, id, getActiveAnchors }) {
	const { x, y } = step;
	const anchorPoints = getAnchorPoints(x, y);
	// console.log(anchorPoints);

	const pullActiveAnchors = (data) => {
		getActiveAnchors(data);
	};

	const anchors = anchorPoints.map((position, index) => {
		return (
			<Anchor
				key={`anchor-${index}`}
				id={id}
				x={position.x}
				y={position.y}
				index={index}
				onClick={pullActiveAnchors}
			/>
		);
	});
	return (
		<>
			<Line
				x={x}
				y={y}
				points={points}
				stroke="rgba(105, 210, 231, 0.5)"
				strokeWidth={2}
				perfectDrawEnabled={false}
			/>
			{anchors}
		</>
	);
}
