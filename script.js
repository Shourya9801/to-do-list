const taskInput = document.getElementById("taskInput");
const dueInput = document.getElementById("dueInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const darkToggle = document.getElementById("darkToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const dueText = task.due
      ? `<div class="due">⏰ Due: ${new Date(task.due).toLocaleString()}</div>`
      : "";

    li.innerHTML = `
      <div>
        <span contenteditable="true" onblur="editTask(${index}, this.innerText)">${task.text}</span>
        ${dueText}
      </div>
      <div class="task-buttons">
        <button onclick="toggleComplete(${index})">✅</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
  const taskText = taskInput.value.trim();
  const dueDate = dueInput.value ? new Date(dueInput.value).toISOString() : null;

  if (taskText !== "") {
    tasks.push({ text: taskText, due: dueDate, completed: false });
    taskInput.value = "";
    dueInput.value = "";
    renderTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTasks();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  renderTasks();
}

function editTask(index, newText) {
  tasks[index].text = newText.trim();
  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

// ✅ Sortable Drag & Drop
new Sortable(taskList, {
  animation: 150,
  onEnd: function (evt) {
    const movedItem = tasks.splice(evt.oldIndex, 1)[0];
    tasks.splice(evt.newIndex, 0, movedItem);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
  }
});

// 🌙 Dark Mode
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", darkToggle.checked);
});

window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    darkToggle.checked = true;
  }
  renderTasks();
  startReminderCheck();
});

// 🔔 Reminder system: alerts if task is due
function startReminderCheck() {
  setInterval(() => {
    const now = new Date().toISOString();
    tasks.forEach((task, index) => {
      if (
        task.due &&
        !task.completed &&
        new Date(task.due) <= new Date(now) &&
        !task.alerted
      ) {
        alert(`⏰ Reminder: Task "${task.text}" is due now!`);
        task.alerted = true;
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }
    });
  }, 60000); // check every minute
}
