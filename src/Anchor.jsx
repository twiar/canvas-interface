import React, { useRef } from "react";
import { Circle, Text, Group } from "react-konva";

function dragBounds(ref) {
	if (ref.current !== null) {
		return ref.current.getAbsolutePosition();
	}
	return {
		x: 0,
		y: 0,
	};
}

export function Anchor({
	x,
	y,
	id,
	onDragMove,
	onDragEnd,
	onDragStart,
	step,
	index,
	onClick,
	isActive,
}) {
	const SIZE = 100;
	const halfSize = SIZE / 2;
	let actualX;
	let actualY;
	if (step) {
		switch (index) {
			case 0:
				actualX = step.x;
				actualY = step.y + halfSize;
				break;
			case 1:
				actualX = step.x + halfSize;
				actualY = step.y;
				break;
			case 2:
				actualX = step.x + SIZE;
				actualY = step.y + halfSize;
				break;
			case 3:
				actualX = step.x + halfSize;
				actualY = step.y + SIZE;
				break;
			default:
		}
	}

	const textRef = useRef();
	const anchor = useRef(null);
	const addActiveAnchor = () => {
		onClick({
			x: x,
			y: y,
			id: id,
			onDragMove: onDragMove,
			onDragEnd: onDragEnd,
			onDragStart: onDragStart,
			index: index,
		});
	};

	return isActive ? (
		<Circle
			radius={10}
			fill="rgba(105, 210, 231, 1)"
			x={actualX}
			y={actualY}
			draggable
			onDragStart={(e) => onDragStart(e, id)}
			onDragMove={(e) => onDragMove(e, id)}
			onDragEnd={(e) => onDragEnd(e, id, index, actualX, actualY)}
			dragBoundFunc={() => dragBounds(anchor)}
			perfectDrawEnabled={false}
			ref={anchor}
		/>
	) : (
		<Group
			x={x}
			y={y}
			onClick={() => {
				addActiveAnchor();
			}}
			perfectDrawEnabled={false}
			ref={anchor}>
			<Circle radius={10} fill="rgba(105, 210, 231, 0.5)" />
			<Text
				text="+"
				ref={textRef}
				fontSize={25}
				padding={0}
				fill="#ffffff"
				lineHeight={0}
				width={15}
				height={15}
				x={-7}
				y={2}
			/>
		</Group>
	);
}
