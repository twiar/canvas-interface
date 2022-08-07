import React, { useCallback, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Text, Group } from "react-konva";
import { Html } from "react-konva-utils";
import { Border } from "./Border";
import { Anchor } from "./Anchor";
import "./App.css";

const App = () => {
	const [selectedStep, setSelectedStep] = useState(null);
	const [connectionPreview, setConnectionPreview] = useState(null);
	const [connections, setConnections] = useState(
		localStorage.getItem("connections") !== null
			? JSON.parse(localStorage.getItem("connections"))
			: [],
	);
	const initSteps =
		localStorage.getItem("steps") !== null
			? JSON.parse(localStorage.getItem("steps"))
			: [
					{
						id: 0,
						x: Math.random() * 0.75 * window.innerWidth,
						y: Math.random() * 0.75 * window.innerHeight,
						colour: "#b9d7d9",
						anchors: [],
					},
					{
						id: 1,
						x: Math.random() * 0.75 * window.innerWidth,
						y: Math.random() * 0.75 * window.innerHeight,
						colour: "#b9d7d9",
						anchors: [],
					},
					{
						id: 2,
						x: Math.random() * 0.75 * window.innerWidth,
						y: Math.random() * 0.75 * window.innerHeight,
						colour: "#b9d7d9",
						anchors: [],
					},
			  ];
	const [steps, setSteps] = useState(initSteps);
	const [activeCallback, setActiveCallback] = useState(false);
	const [deleteBtnPressed, setDeleteBtnPressed] = useState(false);
	const [showDeleteBtn, setShowDeleteBtn] = useState(false);
	const [showInfo, setShowInfo] = useState(
		localStorage.getItem("showInfo") !== null ? JSON.parse(localStorage.getItem("showInfo")) : true,
	);

	useEffect(() => {
		setActiveCallback(false);
	}, [activeCallback]);

	useEffect(() => {
		document.addEventListener("keydown", removeSelectedStep, true);
		return () => {
			document.removeEventListener("keydown", removeSelectedStep, true);
		};
	}, [selectedStep]);

	const SIZE = 100;
	let activeAnchor = null;

	// Functions to manipulate count of objects

	function createConnectionPoints(source, destination) {
		return [source.x, source.y, destination.x, destination.y];
	}

	function deleteConnections(objId, objIndex) {
		let updateConnections = connections;
		updateConnections = updateConnections.filter((connection) => {
			return !(
				(connection.from.id === objId && connection.from.index === objIndex) ||
				(connection.to.id === objId && connection.to.index === objIndex)
			);
		});
		setConnections(updateConnections);
		return setActiveCallback(!activeCallback);
	}

	const callbackAnchor = (data) => {
		let updateSteps = steps;
		let foundedStep = updateSteps.find((step) => step.id == data.id);
		const isCopy = foundedStep.anchors.find((anchor) => anchor.index === data.index);
		if (!isCopy) {
			updateSteps.find((step) => {
				if (step.id == data.id) {
					step.anchors.push(data);
				}
			});
		}
		setSteps(updateSteps);
		return setActiveCallback(!activeCallback);
	};

	const callbackDeleteAnchor = (data) => {
		let updateSteps = steps;
		updateSteps.find((step) => {
			if (step.id == data.id) {
				step.anchors = step.anchors.filter((anchor) => {
					if (anchor.index !== data.index) {
						return true;
					} else {
						deleteConnections(data.id, data.index);
						return false;
					}
				});
			}
		});
		setDeleteBtnPressed(data.deleteBtnPressed);
		setShowDeleteBtn(false);
		setSteps(updateSteps);
		checkWrongConnections("anchor", updateSteps);
	};

	const addStep = () => {
		let updateSteps = steps;
		updateSteps.push({
			id: steps.length > 0 ? steps[steps.length - 1].id + 1 : 0,
			x: Math.random() * 0.75 * window.innerWidth,
			y: Math.random() * 0.75 * window.innerHeight,
			colour: "#b9d7d9",
			anchors: [],
		});
		setSteps(updateSteps);
		return setActiveCallback(!activeCallback);
	};

	const removeStep = () => {
		let updateSteps = steps;
		if (updateSteps.length > 0) {
			updateSteps.pop();
		}
		setSteps(updateSteps);
		setSelectedStep(null);
		checkWrongConnections("step", updateSteps);
	};

	const removeSelectedStep = (e) => {
		if (e.key === "Delete" && selectedStep) {
			let updateSteps = steps;

			updateSteps = updateSteps.filter((step) => step.id != selectedStep);
			checkWrongConnections("step", updateSteps);
			setSteps(updateSteps);
			setSelectedStep(null);
		}
	};

	const removeAllSteps = () => {
		localStorage.setItem("connections", null);
		localStorage.setItem("steps", null);
		setSelectedStep(null);
		setSteps([]);
	};

	// Functions to correct render objects

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

	function checkWrongConnections(type, typeSteps) {
		let updateConnections = connections;
		if (type === "anchor") {
			updateConnections = updateConnections.filter((connection) => {
				let connectionFromStep = typeSteps.find((step) => step.id == connection.from.id);
				let connectionToStep = typeSteps.find((step) => step.id == connection.to.id);
				let connectionFromAnchor = connectionFromStep.anchors.find(
					(anch) => anch.index == connection.from.index,
				);
				let connectionToAnchor = connectionToStep.anchors.find(
					(anch) => anch.index == connection.to.index,
				);
				return connectionFromStep && connectionToStep && connectionFromAnchor && connectionToAnchor;
			});
		}
		if (type === "step") {
			updateConnections = updateConnections.filter((connection) => {
				let connectionFromStep = typeSteps.find((step) => step.id == connection.from.id);
				let connectionToStep = typeSteps.find((step) => step.id == connection.to.id);
				return connectionFromStep && connectionToStep;
			});
		}
		if (updateConnections.length !== connections.length) {
			setConnections(updateConnections);
		}
		return setActiveCallback(!activeCallback);
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

		let correctStep = steps.find((step) => step.id == objId);

		if (correctStep.x !== anchX || correctStep.y !== anchY) {
			anchX = correctStep.x + SIZE / 2;
			anchY = correctStep.y + SIZE / 2;
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
		const intersectingStep = steps.find((step) => {
			return step.id !== id && hasIntersection(position, step, step.id);
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

	function handleStepDrag(e, id) {
		const position = e.target.position();
		let updateSteps = steps;
		updateSteps.find((step) => {
			if (step.id == id) {
				step.x = position.x;
				step.y = position.y;
			}
		});
		setSteps(updateSteps);
		return setActiveCallback(!activeCallback);
	}

	function handleAnchorDragStart(e) {
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

	function handleAnchorDragMove(e) {
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

	function changeSelectToAnchor(value, anchorSelected) {
		if (!anchorSelected) {
			setShowDeleteBtn(true);
		} else {
			setShowDeleteBtn(false);
		}
		setSelectedStep(value);
	}

	// Objects

	const stepObjs = steps.map((step, index) => {
		const x = step.x;
		const y = step.y;
		const colour = step.colour;
		const id = step.id;
		return (
			<Group
				key={`${id}-${index}`}
				x={x}
				y={y}
				onClick={() => handleSelection(id)}
				draggable
				onDragMove={(e) => handleStepDrag(e, id)}>
				<Rect
					key={`${id}-${index}`}
					width={SIZE}
					height={SIZE}
					fill={colour}
					perfectDrawEnabled={false}
					shadowColor="rgba(55, 160, 181, 0.3)"
					shadowBlur={10}
				/>
				<Text
					text={id}
					fill="#ffffff"
					fontSize={40}
					fontFamily="'Inter'"
					fontVariant="700"
					x={0}
					y={0}
					lineHeight={2.5}
					width={SIZE}
					align="center"
				/>
			</Group>
		);
	});

	const activeAnchors = steps.map((step) => {
		const anchors = step.anchors;
		return anchors.map((position) => (
			<Anchor
				key={`${position.id}-anchor-${position.index}-${position.x}-${position.y}`}
				id={position.id}
				step={steps.find((step) => step.id == position.id)}
				index={position.index}
				onDragEnd={(e) =>
					handleAnchorDragEnd(e, position.id, position.index, position.x, position.y)
				}
				onDragMove={handleAnchorDragMove}
				onDragStart={handleAnchorDragStart}
				onDelete={callbackDeleteAnchor}
				isActive={true}
				changeSelect={changeSelectToAnchor}
				deleteBtnPressed={deleteBtnPressed}
			/>
		));
	});

	const connectionObjs = connections.map((connection) => {
		const anchorFromStep = connection.from;
		const anchorToStep = connection.to;
		const fromStep = steps.find((step) => step.id == connection.from.id);
		const toStep = steps.find((step) => step.id == connection.to.id);

		if (!toStep || !fromStep) {
			return <></>;
		}

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
			<Border
				key={selectedStep}
				id={selectedStep}
				step={steps.find((step) => step.id == selectedStep)}
				getActiveAnchors={callbackAnchor}
			/>
		) : null;

	// Save to localStorage
	localStorage.setItem("steps", JSON.stringify(steps));
	steps.length > 0 && localStorage.setItem("connections", JSON.stringify(connections));
	localStorage.setItem("showInfo", JSON.stringify(showInfo));

	// Render

	return (
		<Stage width={window.innerWidth} height={window.innerHeight}>
			<Layer>
				{stepObjs}
				{borders}
				{connectionObjs}
				{connectionPreview}
				{activeAnchors}
				<Text text={activeCallback} opacity={0} />
				<Html>
					<div className="flex">
						<button onClick={addStep} className="inc-btn">
							<span className="plus">+</span>
						</button>
						<span className="count">{steps.length}</span>
						<button onClick={removeStep} className="inc-btn">
							<span className="minus">-</span>
						</button>
					</div>
					<div className="flex column">
						<button onClick={removeAllSteps} className="remove-all">
							Очистить всё
						</button>
						{showDeleteBtn && (
							<button onClick={() => setDeleteBtnPressed(true)} className="remove-all">
								Удалить выбранные розетки
							</button>
						)}
					</div>
					{showInfo && (
						<div className="info">
							<button className="close" onClick={() => setShowInfo(false)}>
								<span>✖</span>
							</button>
							<ul>
								<li>Кликните по квадрату, чтобы его выделить.</li>
								<li>
									Для создания розетки, нажмите на любой появившийся вариант из четырёх при
									выделении квадрата.
								</li>
								<li>На появившуюся розетку можно нажать, чтобы выделить её для удаления.</li>
								<li>Удерживайте розетку, чтобы построить путь до другой.</li>
								<li>Чтобы перетащить квадрат, удерживайте курсор на нём.</li>
							</ul>
						</div>
					)}
				</Html>
			</Layer>
		</Stage>
	);
};

export default App;
