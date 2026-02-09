const viewTitle = document.getElementById("view-title");
const viewSubtitle = document.getElementById("view-subtitle");
const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

const viewCopy = {
  dashboard: {
    title: "Workspace dashboard",
    subtitle: "Track the newest insights, top risks, and active initiatives.",
  },
  sources: {
    title: "Sources & metadata",
    subtitle: "Ingest knowledge, tag signals, and track citation coverage.",
  },
  ask: {
    title: "Ask with citations",
    subtitle: "Answers include source links, author, and date.",
  },
  insights: {
    title: "Insight cards",
    subtitle: "AI drafts; humans approve and enrich the evidence.",
  },
  hypotheses: {
    title: "Discovery backlog",
    subtitle: "Score hypotheses and compare initiatives with RICE.",
  },
  prd: {
    title: "PRD builder",
    subtitle: "Draft requirements from insights, decisions, and constraints.",
  },
  status: {
    title: "Status & reporting",
    subtitle: "Generate weekly updates with risks and asks.",
  },
};

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");

    const viewId = link.dataset.view;
    views.forEach((view) => view.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");

    viewTitle.textContent = viewCopy[viewId].title;
    viewSubtitle.textContent = viewCopy[viewId].subtitle;
  });
});

const askButton = document.getElementById("ask-button");
const questionInput = document.getElementById("question-input");
const answerText = document.getElementById("answer-text");
const answerCard = document.getElementById("answer-card");

const answerLibrary = [
  {
    query: "shipping",
    answer:
      "Shipping fee ambiguity is the most cited blocker for new mobile buyers.",
    sources: [
      "Interview 12 · Sep 12 · R. Patel",
      "Support tickets · Sep 10 · M. Singh",
    ],
  },
  {
    query: "promo",
    answer:
      "Users notice the promo code field late, causing discount frustration.",
    sources: [
      "Usability test 7 · Sep 08 · UX Team",
      "Session replay · Sep 06 · Analytics",
    ],
  },
];

askButton.addEventListener("click", () => {
  const question = questionInput.value.toLowerCase();
  const match = answerLibrary.find((item) => question.includes(item.query));

  if (!match) {
    answerText.textContent = "I don't know — no cited sources found.";
    answerCard.querySelector(".citations").innerHTML = "";
    return;
  }

  answerText.textContent = match.answer;
  const citations = match.sources
    .map(
      (source) =>
        `<div class="citation"><span>${source}</span><a href="#">Source link</a></div>`
    )
    .join("");
  answerCard.querySelector(".citations").innerHTML = citations;
});

const statusOutput = document.getElementById("status-output");
const statusButtons = document.querySelectorAll(".chip");

const statusTemplates = {
  executive:
    "Highlights: Shipping estimator cleared legal. Decision log updated.\nRisks & Asks: Need analyst to monitor margin guardrails.\nNext: Launch 20% experiment and review weekly.",
  stakeholder:
    "Highlights: Discovery backlog reordered based on new evidence.\nRisks & Asks: Confirm estimator accuracy with ops team.\nNext: Share PRD v2 and align on rollout plan.",
  team:
    "Highlights: PRD draft ready, experiment instrumentation in progress.\nRisks & Asks: Data coverage gap on Android sessions.\nNext: Finish QA checklist, prep launch comms.",
};

statusOutput.textContent = statusTemplates.executive;

statusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    statusButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const template = statusTemplates[button.dataset.status];
    statusOutput.textContent = template;
  });
});
