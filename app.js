const navLinks = document.querySelectorAll(".nav-link[data-view]");
const views = document.querySelectorAll(".view");
const sidebar = document.querySelector(".sidebar");
const modal = document.getElementById("task-modal");
const toast = document.querySelector(".toast");

function showView(id) {
  views.forEach((view) => view.classList.toggle("active", view.id === id));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === id));
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach((link) => link.addEventListener("click", () => showView(link.dataset.view)));
document.querySelectorAll("[data-view-link]").forEach((link) =>
  link.addEventListener("click", () => showView(link.dataset.viewLink)),
);
document.querySelector(".mobile-menu").addEventListener("click", () => sidebar.classList.toggle("open"));

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelectorAll(".task-check").forEach((button) => {
  button.addEventListener("click", () => {
    const task = button.closest(".task");
    const complete = task.classList.toggle("completed");
    task.classList.remove("review");
    button.textContent = complete ? "✓" : "";
    const status = task.querySelector(".status");
    if (status) {
      status.textContent = complete ? "Gotowe" : "Do zrobienia";
      status.className = `status ${complete ? "done" : "todo"}`;
    }
    notify(complete ? "Brawo! Zadanie oznaczone jako gotowe ✨" : "Zadanie wróciło na listę.");
  });
});

document.querySelector(".approve").addEventListener("click", () => {
  document.querySelector(".approval-panel").innerHTML = '<div class="panel-heading"><div><h2>Do zatwierdzenia</h2><p>Wszystko sprawdzone!</p></div><span class="counter">✓</span></div><div class="comeback"><span>🌟</span><p><strong>Dobra robota!</strong><br>Zosia otrzymała 15 punktów.</p></div>';
  const reviewTask = document.querySelector(".task.review");
  reviewTask?.querySelector(".task-check").click();
  notify("Zadanie zatwierdzone. Punkty przyznane!");
});
document.querySelector(".reject").addEventListener("click", () => notify("Poproś Zosię o ponowne wykonanie zadania."));

document.querySelectorAll("[data-open-modal]").forEach((button) =>
  button.addEventListener("click", () => {
    modal.hidden = false;
    modal.querySelector("input").focus();
  }),
);
document.querySelector(".modal-close").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.hidden = true;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") modal.hidden = true;
});
document.getElementById("task-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const title = data.get("title");
  const points = data.get("points");
  const task = document.createElement("article");
  task.className = "task";
  task.innerHTML = `<button class="task-check" aria-label="Oznacz jako wykonane"></button><span class="task-emoji mint">🌱</span><div class="task-copy"><strong>${title.replace(/[<>]/g, "")}</strong><small>${data.get("time")} · Nowa rutyna</small></div><span class="points">+${points} pkt</span><span class="status todo">Do zrobienia</span>`;
  document.getElementById("task-list").appendChild(task);
  modal.hidden = true;
  event.currentTarget.reset();
  notify("Nowa rutyna została dodana 🌱");
});

const heatmap = document.getElementById("heatmap");
Array.from({ length: 126 }, (_, index) => {
  const cell = document.createElement("i");
  const level = (index * 7 + index % 11) % 5;
  if (level > 1) cell.className = `l${Math.min(level - 1, 3)}`;
  heatmap.appendChild(cell);
});
