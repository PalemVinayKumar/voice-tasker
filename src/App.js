// File: src/App.js (Offline Version - No Firebase)
import React, { useState, useEffect } from "react";
import * as chrono from 'chrono-node';


export default function App() {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);
    scheduleAllReminders(savedTasks);
  }, []);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  const scheduleAllReminders = (taskList) => {
    taskList.forEach((task) => {
      const time = new Date(task.time).getTime() - Date.now();
      if (time > 0) {
        setTimeout(() => remindTask(task.text), time);
      }
    });
  };

  const remindTask = (text) => {
    const msg = new SpeechSynthesisUtterance(`Reminder: ${text}`);
    window.speechSynthesis.speak(msg);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Task Reminder", { body: text });
    }
  };

  const handleAddTask = () => {
    const parsed = chrono.parse(input)[0];
    const taskText = parsed ? input.replace(parsed.text, "") : input;
    const taskTime = parsed ? parsed.start.date() : null;

    if (!taskTime) {
      alert("Please include a time in your task, like 'at 6 PM'.");
      return;
    }

    const newTask = { text: taskText.trim(), time: taskTime.toISOString() };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    remindTask(taskText);
    alert("Task saved ✅");
    setInput("");
  };

  const handleVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setInput(voiceText);
    };
    recognition.start();
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">🎙️ VoiceTasker (Offline)</h1>

      <div className="mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., Remind me to call mom at 6 PM"
          className="w-full p-3 rounded-lg text-black"
        />
        <div className="mt-2 flex gap-3">
          <button
            onClick={handleAddTask}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
          >
            Add Task
          </button>
          <button
            onClick={handleVoiceInput}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
          >
            🎤 Speak
          </button>
        </div>
      </div>

      <h2 className="text-xl mb-3 font-semibold">📝 Your Tasks</h2>
      <ul>
        {tasks.map((task, index) => (
          <li key={index} className="mb-2">
            <span className="text-green-400">{task.text}</span>
            <br />
            <span className="text-sm text-gray-400">
              {new Date(task.time).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
