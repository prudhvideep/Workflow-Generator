import React from "react";
import { Handle, Position } from "reactflow";
import {
  FaWhatsapp,
  FaCommentDots,
  FaEnvelope,
  FaRobot,
  FaUserTie,
  FaPhoneAlt,
} from "react-icons/fa";

function CustomNode({ data, selected }) {
  const nodeTypes = {
    message: {
      icon: <FaCommentDots />,
      label: "SMS",
      bgColor: "bg-indigo-300",
    },
    whatsapp: {
      icon: <FaWhatsapp />,
      label: "WhatsApp",
      bgColor: "bg-green-300",
    },
    botCall: {
      icon: <FaRobot />,
      label: "Bot Call",
      bgColor: "bg-purple-300",
    },
    email: { icon: <FaEnvelope />, label: "Email", bgColor: "bg-orange-300" },
    fieldAgent: {
      icon: <FaUserTie />,
      label: "Field Agent",
      bgColor: "bg-red-300",
    },
    teleCall: {
      icon: <FaPhoneAlt />,
      label: "Tele Call",
      bgColor: "bg-stone-300",
    },
  };

  const { icon, label, bgColor } =
    nodeTypes[data.nodeType] || nodeTypes.message;

  return (
    <div
      className={`w-40 shadow-xl rounded-md bg-white ${
        selected ? "border-solid border-2 rounded-md border-indigo-500" : ""
      }`}
    >
      <div className="flex flex-col border rounded-lg shadow-lg overflow-hidden bg-white transition-all duration-200">
        <div
          className={`flex justify-center items-center max-h-max px-2 py-1 text-center text-black text-xs font-bold rounded-t-md ${bgColor}`}
        >
          <div className="mr-1">{icon}</div>
          <div className="">{label}</div>
        </div>
        <div className={`px-3 py-2 space-x-1 break-words`}>
          <div
            className="text-xs font-normal text-slate-500 bg-inherit"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {data.info || "Click to Edit //"}
          </div>
        </div>
      </div>

      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-1 rounded-full bg-slate-500"
      />
      <Handle
        id="b"
        type="source"
        position={Position.Right}
        className="w-1 rounded-full bg-gray-500"
      />
    </div>
  );
}

export default CustomNode;
