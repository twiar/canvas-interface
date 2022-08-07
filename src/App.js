import React, { useCallback, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Text, Group } from "react-konva";
import { Border } from "./Border";
import { Anchor } from "./Anchor";

const App = () => {
	const [selectedStep, setSelectedStep] = useState(null);
	const [connectionPreview, setConnectionPreview] = useState(null);
	const [connections, setConnections] = useState([]);
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
	let activeAnchor = null;

	function createConnectionPoints(source, destination) {
		return [source.x, source.y, destination.x, destination.y];
	}

	function isClosedAnchors(objId, index) {
		return Boolean(
			connections.some((connections) => {
				return (
					(connections.from.index === index && connections.from.id === objId) ||
					(connections.to.index === index && connections.to.id === objId)
				);
			}),
		);
	}

	function deleteConnections(objId, index) {
		let updateConnections = connections;
		updateConnections = updateConnections.filter((connection) => {
			return !(
				(connection.from.id === objId && connection.from.index === index) ||
				(connection.to.id === objId && connection.to.index === index)
			);
		});
		setConnections(updateConnections);
		return setActiveCallback(true);
	}

	function checkWrongConnections() {
		let updateConnections = connections;
		let checkSteps;
		if (Array.isArray(steps)) {
			checkSteps = steps;
		} else {
			checkSteps = Object.values(steps);
		}
		updateConnections = updateConnections.filter((connection) =>
			checkSteps.some((step) => {
				if (step.anchors) {
					return step.anchors.some(
						(anch) =>
							(connection.from.id === anch.id && connection.from.index === anch.index) ||
							(connection.to.id === anch.id && connection.to.index === anch.index),
					);
				} else {
					return false;
				}
			}),
		);
		if (updateConnections.length !== connections.length) {
			setConnections(updateConnections);
		}
	}

	function checkCorrectAnchorPosition(objId, anchIndex, anchX, anchY) {
		switch (anchIndex) {
			case 0:
				anchX = anchX + SIZE / 2;
				break;
			case 1:
				anchY = anchY + SIZE / 2;
				break;
			case 2:
				anchX = anchX - SIZE / 2;
				break;
			case 3:
				anchY = anchY - SIZE / 2;
				break;
			default:
		}

		if (Object.values(steps)[objId].x !== anchX || Object.values(steps)[objId].y !== anchY) {
			anchX = Object.values(steps)[objId].x + SIZE / 2;
			anchY = Object.values(steps)[objId].y + SIZE / 2;
		}

		switch (anchIndex) {
			case 0:
				anchX = anchX - SIZE / 2;
				break;
			case 1:
				anchY = anchY - SIZE / 2;
				break;
			case 2:
				anchX = anchX + SIZE / 2;
				break;
			case 3:
				anchY = anchY + SIZE / 2;
				break;
			default:
		}

		return [anchX, anchY];
	}

	function anchorIntersection(objId, anchIndex, anchX, anchY, posX, posY) {
		const anchPos = checkCorrectAnchorPosition(objId, anchIndex, anchX, anchY);
		anchX = anchPos[0];
		anchY = anchPos[1];
		if (!isClosedAnchors(objId, anchIndex)) {
			return !(anchX - 20 > posX || anchX + 20 < posX || anchY - 20 > posY || anchY + 20 < posY);
		}
	}

	function hasIntersection(position, step, key) {
		if (step.anchors.length > 0) {
			return step.anchors.some((anch) => {
				if (anchorIntersection(key, anch.index, anch.x, anch.y, position.x, position.y)) {
					activeAnchor = { id: key, x: anch.x, y: anch.y, index: anch.index };
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
		if (isClosedAnchors(id, index)) {
			activeAnchor = null;
		}
		if (connectionTo !== null && activeAnchor !== null) {
			setConnections([
				...connections,
				{
					to: activeAnchor,
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
		return setActiveCallback(!activeCallback);
	};

	const callbackDeleteAnchor = (data) => {
		let updateSteps = steps;
		updateSteps[data.id].anchors = updateSteps[data.id].anchors.filter((anchor) => {
			if (anchor.index !== data.index) {
				return true;
			} else {
				deleteConnections(data.id, anchor.index);
				return false;
			}
		});
		setSteps(updateSteps);
		checkWrongConnections();
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
				onDragEnd={(e) =>
					handleAnchorDragEnd(e, position.id, position.index, position.x, position.y)
				}
				onDragMove={handleAnchorDragMove}
				onDragStart={handleAnchorDragStart}
				onDelete={callbackDeleteAnchor}
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

		return (
			<Line
				key={`${connection.from.id}-${anchorFromStep.index}-${fromStartX}${fromStartY}-${anchorToStep.index}-${toStartX}${toStartY}-${connection.to.id}`}
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
