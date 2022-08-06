import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Text, Group } from "react-konva";
import { Border } from "./Border";
import { Anchor } from "./Anchor";

const App = () => {
	const [selectedStep, setSelectedStep] = useState(null);
	const [connectionPreview, setConnectionPreview] = useState(null);
	const [connections, setConnections] = useState([]);
	const [detectedAnchor, setDetectedAnchor] = useState(null);
	const initSteps = [
		{
			x: 50,
			y: 50,
			colour: "#b9d7d9",
			anchors: [],
		},
		{
			x: 200,
			y: 200,
			colour: "#b9d7d9",
			anchors: [],
		},
		{
			x: 400,
			y: 50,
			colour: "#b9d7d9",
			anchors: [],
		},
	];
	const [steps, setSteps] = useState(initSteps);
	const [activeCallback, setActiveCallback] = useState(false);

	useEffect(() => {
		setActiveCallback(false);
	}, [activeCallback]);

	const SIZE = 100;
	let activeAnchor = {};

	function createConnectionPoints(source, destination) {
		return [source.x, source.y, destination.x, destination.y];
	}

	function anchorIntersection(anchIndex, anchX, anchY, posX, posY) {
		// console.log(anchIndex);
		// console.log(anchX > posX);
		// console.log(anchX < posX);
		// console.log(anchY > posY);
		// console.log(anchY < posY);
		return !(anchX - 20 > posX || anchX + 20 < posX || anchY - 20 > posY || anchY + 20 < posY);
	}

	function hasIntersection(position, step, key) {
		if (step.anchors.length > 0) {
			return step.anchors.some((anch) => {
				if (anchorIntersection(anch.index, anch.x, anch.y, position.x, position.y)) {
					// console.log(1);
					activeAnchor = { id: key, x: anch.x, y: anch.y, index: anch.index };
					// console.log(activeAnchor);
					return true;
				}
			});
		} else {
			return false;
		}
	}

	function detectConnection(position, id, steps) {
		const intersectingStep = Object.keys(steps).find((key) => {
			return key !== id && hasIntersection(position, steps[key], key);
		});
		if (intersectingStep) {
			return intersectingStep;
		}
		return null;
	}

	function getMousePos(e) {
		const position = e.target.position();
		const stage = e.target.getStage();
		const pointerPosition = stage.getPointerPosition();
		return {
			x: pointerPosition.x - position.x,
			y: pointerPosition.y - position.y,
		};
	}

	function handleSelection(id) {
		if (selectedStep === id) {
			setSelectedStep(null);
		} else {
			setSelectedStep(id);
		}
	}

	function handleStepDrag(e, key) {
		const position = e.target.position();
		setSteps({
			...steps,
			[key]: {
				...steps[key],
				...position,
			},
		});
	}

	function handleAnchorDragStart(e, id, index) {
		const position = e.target.position();
		setConnectionPreview(
			<Line
				x={position.x}
				y={position.y}
				points={createConnectionPoints(position, position)}
				stroke="#69d2e7"
				strokeWidth={2}
			/>,
		);
	}

	function handleAnchorDragMove(e, id) {
		const position = e.target.position();
		const mousePos = getMousePos(e);
		setConnectionPreview(
			<Line
				x={position.x}
				y={position.y}
				points={createConnectionPoints({ x: 0, y: 0 }, mousePos)}
				stroke="#69d2e7"
				strokeWidth={2}
			/>,
		);
	}

	function handleAnchorDragEnd(e, id, index, x, y) {
		setConnectionPreview(null);
		const stage = e.target.getStage();
		const mousePos = stage.getPointerPosition();
		const connectionTo = detectConnection(mousePos, id, steps);
		const toAnchor = activeAnchor;
		// console.log(connectionTo);
		// console.log(activeAnchor);
		if (connectionTo !== null && toAnchor !== null) {
			setConnections([
				...connections,
				{
					to: toAnchor,
					from: { id, index, x, y },
				},
			]);
			activeAnchor = {};
		}
	}

	const callbackAnchor = (data) => {
		let updateSteps = steps;
		updateSteps[data.id].anchors.push(data);
		setSteps(updateSteps);
		return setActiveCallback(true);
	};

	const stepObjs = Object.keys(steps).map((key) => {
		const { x, y, colour } = steps[key];
		return (
			<Group
				key={key}
				x={x}
				y={y}
				onClick={() => handleSelection(key)}
				draggable
				onDragMove={(e) => handleStepDrag(e, key)}>
				<Rect width={SIZE} height={SIZE} fill={colour} perfectDrawEnabled={false} />
				<Text text={key} fill="#ffffff" fontSize={60} x={SIZE / 3} y={SIZE / 4} />
			</Group>
		);
	});

	const activeAnchors = Object.keys(steps).map((key) => {
		const { anchors } = steps[key];
		return anchors.map((position) => (
			<Anchor
				key={`${position.id}-anchor-${position.index}`}
				id={position.id}
				step={steps[position.id]}
				index={position.index}
				x={position.x}
				y={position.y}
				onDragEnd={(e) =>
					handleAnchorDragEnd(e, position.id, position.index, position.x, position.y)
				}
				onDragMove={handleAnchorDragMove}
				onDragStart={handleAnchorDragStart}
				isActive={true}
			/>
		));
	});
	const connectionObjs = connections.map((connection) => {
		const anchorFromStep = connection.from;
		const anchorToStep = connection.to;
		const fromStep = steps[connection.from.id];
		const toStep = steps[connection.to.id];

		let fromStartX = 0;
		let fromStartY = 0;
		let toStartX = 0;
		let toStartY = 0;

		// console.log(anchorFromStep);

		switch (anchorFromStep.index) {
			case 0:
				fromStartX = fromStartX - SIZE / 2;
				break;
			case 1:
				fromStartY = fromStartY - SIZE / 2;
				break;
			case 2:
				fromStartX = fromStartX + SIZE / 2;
				break;
			case 3:
				fromStartY = fromStartY + SIZE / 2;
				break;
			default:
		}

		switch (anchorToStep.index) {
			case 0:
				toStartX = toStartX - SIZE / 2;
				break;
			case 1:
				toStartY = toStartY - SIZE / 2;
				break;
			case 2:
				toStartX = toStartX + SIZE / 2;
				break;
			case 3:
				toStartY = toStartY + SIZE / 2;
				break;
			default:
		}

		const points = createConnectionPoints(
			{
				x: fromStartX,
				y: fromStartY,
			},
			{
				x: toStep.x - fromStep.x + toStartX,
				y: toStep.y - fromStep.y + toStartY,
			},
		);
		// console.log(points);
		return (
			<Line
				x={fromStep.x + SIZE / 2}
				y={fromStep.y + SIZE / 2}
				points={points}
				stroke="#69d2e7"
				strokeWidth={2}
			/>
		);
	});
	const borders =
		selectedStep !== null ? (
			<Border id={selectedStep} step={steps[selectedStep]} getActiveAnchors={callbackAnchor} />
		) : null;

	return (
		<Stage width={window.innerWidth} height={window.innerHeight}>
			<Layer>
				{stepObjs}
				{borders}
				{connectionObjs}
				{connectionPreview}
				{activeAnchors}
				<Text text={activeCallback} opacity={0} />
			</Layer>
		</Stage>
	);
};

export default App;
