import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export default function Chat() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      setMessages(msgs);
    });

    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: newMsg,
      sender: auth.currentUser.email,
      timestamp: new Date(),
    });
    setNewMsg("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-violet-600 text-white py-3 text-center text-xl font-bold">
        Chat
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-xs ${
              m.sender === auth.currentUser.email
                ? "bg-violet-500 text-white self-end ml-auto"
                : "bg-white text-gray-800"
            }`}
          >
            <p>{m.text}</p>
            <span className="text-xs opacity-60">{m.sender}</span>
          </div>
        ))}
      </div>

      <div className="flex p-3 bg-white border-t">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="flex-1 border p-2 rounded-lg mr-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
