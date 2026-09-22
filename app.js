import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

const activeChildId = import.meta.env.VITE_SUPABASE_CHILD_ID;
const navLinks = document.querySelectorAll(".nav-link[data-view]");
const views = document.querySelectorAll(".view");
const sidebar = document.querySelector(".sidebar");
const modal = document.getElementById("task-modal");
const toast = document.querySelector(".toast");
const taskList = document.getElementById("task-list");

function showView(id) {
  views.forEach((view) => view.classList.toggle("active", view.id === id));
  navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === id));
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

function routineIcon(icon) {
  const icons = { bed: "🛏️", teeth: "🪥", backpack: "🎒", book: "📖", toys: "🧸", plant: "🌱" };
  return icons[icon] || "🌱";
}

function renderTask(log) {
  const routine = log.routines || log.routine;
  const completed = log.status === "COMPLETED";
  const review = log.status === "AWAITING_APPROVAL";
  const statusLabel = completed ? "Gotowe" : review ? "Do akceptacji" : "Do zrobienia";
  const statusClass = completed ? "done" : review ? "waiting" : "todo";
  const cssClass = completed ? " completed" : review ? " review" : "";
  const task = document.createElement("article");
  task.className = `task${cssClass}`;
  task.dataset.logId = log.id;
  task.innerHTML = `
    <button class="task-check" aria-label="Zmień status zadania">${completed ? "✓" : review ? "⌛" : ""}</button>
    <span class="task-emoji mint">${routineIcon(routine.icon_name)}</span>
    <div class="task-copy"><strong>${escapeHtml(routine.title)}</strong><small>${escapeHtml(routine.time_of_day || "Rutyna")} · ${escapeHtml(routine.deadline || "dzisiaj")}</small></div>
    <span class="points">+${Number(routine.points_reward) || 0} pkt</span>
    <span class="status ${statusClass}">${statusLabel}</span>`;
  bindTaskButton(task.querySelector(".task-check"));
  return task;
}

async function loadTodayTasks() {
  if (!supabase) return;
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("routine_logs")
    .select("id,status,target_date,routines(id,title,icon_name,points_reward,time_of_day,deadline)")
    .eq("child_id", activeChildId)
    .eq("target_date", today)
    .order("created_at");

  if (error) {
    console.error("Nie udało się pobrać zadań:", error.message);
    notify("Tryb offline — pokazujemy zapisane zadania.");
    return;
  }
  if (!data?.length) return;
  taskList.replaceChildren(...data.map(renderTask));
}

async function updateTask(button) {
  const task = button.closest(".task");
  const complete = !task.classList.contains("completed");
  const previousClass = task.className;
  setTaskAppearance(task, complete);

  if (supabase && task.dataset.logId) {
    const { error } = await supabase
      .from("routine_logs")
      .update({ status: complete ? "COMPLETED" : "PENDING", completed_at: complete ? new Date().toISOString() : null })
      .eq("id", task.dataset.logId);
    if (error) {
      task.className = previousClass;
      setTaskAppearance(task, previousClass.includes("completed"));
      notify("Nie udało się zapisać zmiany. Spróbuj ponownie.");
      return;
    }
  }
  notify(complete ? "Brawo! Zadanie oznaczone jako gotowe ✨" : "Zadanie wróciło na listę.");
}

function setTaskAppearance(task, complete) {
  task.classList.toggle("completed", complete);
  task.classList.remove("review");
  task.querySelector(".task-check").textContent = complete ? "✓" : "";
  const status = task.querySelector(".status");
  status.textContent = complete ? "Gotowe" : "Do zrobienia";
  status.className = `status ${complete ? "done" : "todo"}`;
}

function bindTaskButton(button) {
  button.addEventListener("click", () => updateTask(button));
}

navLinks.forEach((link) => link.addEventListener("click", () => showView(link.dataset.view)));
document.querySelectorAll("[data-view-link]").forEach((link) => link.addEventListener("click", () => showView(link.dataset.viewLink)));
document.querySelector(".mobile-menu").addEventListener("click", () => sidebar.classList.toggle("open"));
document.querySelectorAll(".task-check").forEach(bindTaskButton);

document.querySelector(".approve").addEventListener("click", async () => {
  const reviewTask = document.querySelector(".task.review");
  if (supabase && reviewTask?.dataset.logId) {
    const { error } = await supabase.from("routine_logs").update({ status: "COMPLETED", approved_at: new Date().toISOString() }).eq("id", reviewTask.dataset.logId);
    if (error) return notify("Nie udało się zatwierdzić zadania.");
  }
  document.querySelector(".approval-panel").innerHTML = '<div class="panel-heading"><div><h2>Do zatwierdzenia</h2><p>Wszystko sprawdzone!</p></div><span class="counter">✓</span></div><div class="comeback"><span>🌟</span><p><strong>Dobra robota!</strong><br>Zosia otrzymała 15 punktów.</p></div>';
  if (reviewTask) setTaskAppearance(reviewTask, true);
  notify("Zadanie zatwierdzone. Punkty przyznane!");
});
document.querySelector(".reject").addEventListener("click", () => notify("Poproś Zosię o ponowne wykonanie zadania."));

document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", () => {
  modal.hidden = false;
  modal.querySelector("input").focus();
}));
document.querySelector(".modal-close").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (event) => { if (event.target === modal) modal.hidden = true; });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.hidden = true; });

document.getElementById("task-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const routine = {
    family_id: import.meta.env.VITE_SUPABASE_FAMILY_ID,
    assigned_child_id: activeChildId,
    title: data.get("title"),
    icon_name: "plant",
    points_reward: Number(data.get("points")),
    time_of_day: data.get("time"),
    requires_photo: data.get("proof") === "on",
  };

  if (supabase) {
    const { error } = await supabase.from("routines").insert(routine);
    if (error) return notify("Nie udało się dodać rutyny.");
  } else {
    taskList.appendChild(renderTask({ id: crypto.randomUUID(), status: "PENDING", routines: routine }));
  }
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

if (!isSupabaseConfigured) {
  console.info("Sprout działa w trybie demo. Skonfiguruj zmienne VITE_SUPABASE_*.");
} else if (activeChildId) {
  loadTodayTasks();
} else {
  console.warn("Brak VITE_SUPABASE_CHILD_ID — pozostawiono dane demonstracyjne.");
}
