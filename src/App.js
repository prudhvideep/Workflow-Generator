import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  MiniMap,
  Controls,
  Background,
  MarkerType,
} from "reactflow";
import "reactflow/dist/base.css";

//import { v4 as uuidv4 } from 'uuid';
import Sidebar from "./component/Sidebar.js";
import CustomNode from "./component/nodes/CustomNode.js";
import StartNode from "./component/nodes/StartNode.js";
import EndNode from "./component/nodes/EndNode.js";
import WaitNode from "./component/nodes/WaitNode.js";
import ToolBar from "./component/ToolBar.js";
import DecisionNode from "./component/nodes/DecisionNode.js";

// Key for local storage
//const flowKey = "flow-key";

// Define nodeTypes outside the component
const nodeTypes = {
  email: CustomNode,
  sms: CustomNode,
  whatsapp: CustomNode,
  botCall: CustomNode,
  fieldAgent: CustomNode,
  teleCall: CustomNode,
  start: StartNode,
  end: EndNode,
  wait: WaitNode,
  decision: DecisionNode,
};

// Initial node setup
const initialNodes = [];

let id = 0;

// Function for generating unique IDs for nodes
const getId = () => `node_${id++}`;

const App = () => {
  // States and hooks setup
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [nodeName, setNodeName] = useState("");
  const [nodeInfo, setNodeInfo] = useState("");
  const [nodeInfoVar, setNodeInfoVar] = useState("");
  const [nodeVariables, setNodeVariables] = useState({});
  const [nodeExpressions, setNodeExpressions] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);
  const nodeCountsRef = useRef({
    sms: 0,
    whatsapp: 0,
    email: 0,
    botCall: 0,
    fieldAgent: 0,
    teleCall: 0,
    wait: 0,
  });
  const [errorMessage, setErrorMessage] = useState("Error: Something went wrong!"); 

  //Constants
  const EDGE_COLOR = "#b1b1b7";
  const EDGE_COMPLETED_COLOR = "#4f46e5"; 
  const ARROW_SIZE = 16;
  const EDGE_SELECTED_COLOR = "#555";



  // Update nodes data when nodeName or selectedElements changes
  useEffect(() => {
    if (selectedElements.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedElements[0]?.id) {
            node.data = {
              ...node.data,
              label: nodeName,
              info: nodeInfo,
              infoVar: nodeInfoVar,
              variables: nodeVariables,
              expressions: nodeExpressions,
            };
          }
          return node;
        })
      );
    } else {
      setNodeName("");
      setNodeInfo("");
      setNodeInfoVar("");
      setNodeVariables({});
      setNodeExpressions({});
    }
  }, [nodeName, nodeInfo, nodeInfoVar, selectedElements, setNodes]);

  // Highlight completed nodes
  useEffect(() => {
    if (completedTasks.length > 0) {
      const completedNodeIds = completedTasks.map(task => task.taskKey);

      setEdges((eds) =>
        eds.map((edge) => {
          const isCompleted = completedNodeIds.includes(edge.source) && completedNodeIds.includes(edge.target);
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: isCompleted ? EDGE_COMPLETED_COLOR : EDGE_COLOR,
              transition: "all 0.3s ease",
              opacity: isCompleted ? 1 : 0.5,
            },
            animated: isCompleted,
            markerEnd: {
              ...edge.markerEnd,
              color: isCompleted ? EDGE_COMPLETED_COLOR : EDGE_COLOR,
            },
          };
        })
      );
    }
  }, [completedTasks, setNodes, setEdges]);
  
  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    
    setSelectedElements([node]);
    setNodeName(node.data.label);
    setNodeInfo(node.data.info);
    setNodeInfoVar(node.data.infoVar);
    setNodeVariables(node.data.variables);
    setNodeExpressions(node.data.expressions);
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
  }, []);

  // Setup viewport
  // const { setViewport } = useReactFlow();

  // Handle edge connection
  const onConnect = useCallback(
    (params) => {
      console.log("Edge created: ", params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const customMarker = {
    type: MarkerType.Arrow,
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    color: EDGE_COLOR,
    strokeWidth: 2,
    markerUnits: "strokeWidth",
    orient: "auto",
  };

  //Edge default option
  const defaultEdgeOptions = {
    type: "smoothstep",
    animated: false,
    style: {
      stroke: EDGE_COLOR,
      transition: "stroke 0.3s ease",
    },
    markerEnd: customMarker,
  };

  //Handle edge click
  const onEdgeClick = useCallback(
    (event, edge) => {
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id,
          style: {
            ...e.style,
            stroke: e.id === edge.id ? EDGE_SELECTED_COLOR : EDGE_COLOR,
          },
          markerEnd: {
            ...e.markerEnd,
            color: e.id === edge.id ? EDGE_SELECTED_COLOR : EDGE_COLOR,
          },
        }))
      );
    },
    [setEdges]
  );

  // Enable drop effect on drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop event to add a new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeObjStr = event.dataTransfer.getData("application/reactflow");
      const nodeObj = JSON.parse(nodeObjStr);
      const type = nodeObj.type;
      const nodeActionType = nodeObj.nodeActionType;

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const getNodeName = (nodeType) => {
        nodeCountsRef.current[nodeType] =
          (nodeCountsRef.current[nodeType] || 0) + 1;
        const count = nodeCountsRef.current[nodeType];
        return `${nodeType}#${count}`;
      };

      const newNode = {
        id: getId(),
        type: `${type}`,
        nodeActionType: `${nodeActionType}`,
        position,
        data: {
          name: `${getNodeName(type)}`,
          label: `${type}`,
          nodeType: type,
          info: "",
          infoVar: "",
          decisionNode: {},
          variables: {},
          expressions: {},
        },
      };

      console.log("Node created: ", newNode);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const rfStyle = {
    backgroundColor: "#ffffff",
  };

  return (
    <div className="flex flex-row min-h-screen lg:flex-row">
      <div className="flex-grow h-screen" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={rfStyle}
          onNodeClick={onNodeClick}
          onPaneClick={() => {
            setSelectedElements([]);
            setNodes((nodes) =>
              nodes.map((n) => ({
                ...n,
                selected: false,
              }))
            );

            setEdges((eds) =>
              eds.map((e) => ({
                ...e,
                selected: false,
                style: {
                  ...e.style,
                  stroke: EDGE_COLOR,
                },
                markerEnd: {
                  ...e.markerEnd,
                  color: EDGE_COLOR,
                },
              }))
            );
          }}
          fitView
          proOptions={{ hideAttribution: true }}
          snapToGrid={true}
          deleteKeyCode={["Backspace", "Delete"]}
          selectionKeyCode={["Control", "Meta"]}
        >
          <Background variant="dots" gap={12} size={1} />
          <Controls />
          <MiniMap zoomable pannable />
          <Panel>
            <ToolBar
              nodes={nodes}
              edges={edges}
              completedTasks={completedTasks}
              setCompletedTasks={setCompletedTasks}
            />
          </Panel>
        </ReactFlow>
      </div>

      <Sidebar
        nodes={nodes}
        setNodes={setNodes}
        edges={edges}
        setEdges={setEdges}
        nodeName={nodeName}
        setNodeName={setNodeName}
        nodeInfo={nodeInfo}
        setNodeInfo={setNodeInfo}
        nodeInfoVar={nodeInfoVar}
        setNodeInfoVar={setNodeInfoVar}
        nodeVariables={nodeVariables}
        setNodeVariables={setNodeVariables}
        nodeExpressions={nodeExpressions}
        setNodeExpressions={setNodeExpressions}
        selectedNode={selectedElements[0]}
        setSelectedElements={setSelectedElements}
      />
    </div>
  );
};

// Wrap App with ReactFlowProvider
function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
