const state = {
  items: [],
  query: "",
  filter: "all",
  previewId: null
};

const searchInput = document.getElementById("searchInput");
const promptList = document.getElementById("promptList");
const openSidePanel = document.getElementById("openSidePanel");
const manageButton = document.getElementById("manageButton");
const chips = Array.from(document.querySelectorAll(".chip"));
const imagePreviewOverlay = document.getElementById("imagePreviewOverlay");
const previewImage = document.getElementById("previewImage");
const previewTitle = document.getElementById("previewTitle");
const previewMeta = document.getElementById("previewMeta");
const previewPrompt = document.getElementById("previewPrompt");
const closePreviewButton = document.getElementById("closePreviewButton");
const previewCopyButton = document.getElementById("previewCopyButton");
const previewSourceLink = document.getElementById("previewSourceLink");

function matchesQuery(item, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    item.title,
    item.content
  ].join(" ").toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function getFilteredItems() {
  let items = state.items.slice();

  if (state.filter === "favorite") {
    items = items.filter((item) => item.favorite);
  }

  if (state.filter === "recent") {
    items = items.filter((item) => item.lastUsedAt).sort((a, b) => {
      return new Date(b.lastUsedAt || 0) - new Date(a.lastUsedAt || 0);
    });
  } else {
    items.sort((a, b) => {
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      return Number(b.usageCount || 0) - Number(a.usageCount || 0);
    });
  }

  return items.filter((item) => matchesQuery(item, state.query)).slice(0, 8);
}

function renderEmpty() {
  promptList.innerHTML = `
    <div class="empty-state">
      <strong>没有匹配内容</strong>
      <span>打开侧边栏新增 Prompt 或常用语。</span>
    </div>
  `;
}

function renderItems() {
  const items = getFilteredItems();

  if (!items.length) {
    renderEmpty();
    return;
  }

  promptList.innerHTML = items.map((item) => `
    <article class="prompt-card compact-card" data-id="${item.id}" title="${getPromptSteps(item).length ? "点击选择要复制的步骤" : ""}">
      ${renderPreviewThumb(item)}
      <div class="prompt-main">
        <div class="prompt-title-row">
          <h2>${escapeHtml(item.title)}</h2>
          ${item.favorite ? '<span class="favorite-mark" title="收藏">★</span>' : ""}
        </div>
        ${getPromptSteps(item).length ? "" : `<p>${escapeHtml(item.content)}</p>`}
        ${renderStepCopies(item)}
      </div>
      ${getPromptSteps(item).length
        ? '<button class="copy-button" data-open-steps>分步选择</button>'
        : `<button class="copy-button" data-copy-id="${item.id}">复制</button>`}
    </article>
  `).join("");
}

function getPromptSteps(item) {
  return Array.isArray(item.steps) ? item.steps : [];
}

function renderStepCopies(item) {
  const steps = getPromptSteps(item);
  if (!steps.length) return "";

  return `
    <details class="step-copy-details">
      <summary>分步复制（${steps.length} 步）</summary>
      <div class="step-copy-list">
        ${steps.map((step, index) => `
          <section class="step-copy-item">
            <div class="step-copy-heading">
              <h3>第 ${index + 1} 步${step.name ? `：${escapeHtml(step.name)}` : ""}</h3>
              <button type="button" class="step-copy-button" data-copy-step="${index}">复制本步</button>
            </div>
            <div class="step-copy-content">${escapeHtml(step.content)}</div>
          </section>
        `).join("")}
      </div>
    </details>
  `;
}

function openStepSelection(card) {
  const details = card.querySelector(".step-copy-details");
  if (!details) return;
  details.open = true;
  details.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function renderPreviewThumb(item) {
  if (!item.previewImage || !item.previewImage.thumbnailUrl) {
    return "";
  }

  const alt = item.previewImage.alt || item.title;
  return `
    <button class="preview-thumb compact-thumb" type="button" data-preview-id="${item.id}" title="查看参考图" aria-label="查看「${escapeHtml(item.title)}」参考图">
      <img src="${escapeHtml(item.previewImage.thumbnailUrl)}" alt="${escapeHtml(alt)}" loading="lazy">
    </button>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function copyItem(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) {
    return;
  }

  await navigator.clipboard.writeText(item.content);
  await window.QuickPromptStore.recordUsage(id);
  state.items = await window.QuickPromptStore.getItems();
  renderItems();
}

async function copyStep(id, stepIndex, button) {
  const item = state.items.find((candidate) => candidate.id === id);
  const step = item && getPromptSteps(item)[stepIndex];
  if (!item || !step) return;

  try {
    await navigator.clipboard.writeText(step.content);
    const previousText = button.textContent;
    button.textContent = "已复制";
    button.classList.add("is-copied");
    window.clearTimeout(button.copyTimer);
    button.copyTimer = window.setTimeout(() => {
      button.textContent = previousText;
      button.classList.remove("is-copied");
    }, 1400);
    const updatedItem = await window.QuickPromptStore.recordUsage(id);
    if (updatedItem) {
      state.items = state.items.map((candidate) => candidate.id === id ? updatedItem : candidate);
    }
  } catch (error) {
    window.alert("复制失败，请检查剪贴板权限后重试。");
  }
}

function showImagePreview(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item || !item.previewImage) {
    return;
  }

  state.previewId = id;
  previewImage.src = item.previewImage.fullUrl || item.previewImage.thumbnailUrl;
  previewImage.alt = item.previewImage.alt || item.title;
  previewTitle.textContent = item.title;
  previewMeta.textContent = item.source?.sourceLabel || "";
  previewPrompt.textContent = item.content;

  if (item.source?.url) {
    previewSourceLink.href = item.source.url;
    previewSourceLink.hidden = false;
  } else {
    previewSourceLink.hidden = true;
    previewSourceLink.removeAttribute("href");
  }

  imagePreviewOverlay.hidden = false;
  closePreviewButton.focus();
}

function hideImagePreview() {
  state.previewId = null;
  imagePreviewOverlay.hidden = true;
  previewImage.removeAttribute("src");
}

async function openPanel() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab && tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    } else {
      await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    }
  } catch (error) {
    window.open(chrome.runtime.getURL("sidepanel.html"));
  }
}

async function init() {
  await window.QuickPromptStore.ensureSeedData();
  state.items = await window.QuickPromptStore.getItems();
  renderItems();
}

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  renderItems();
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    state.filter = chip.dataset.filter;
    chips.forEach((candidate) => candidate.classList.toggle("is-active", candidate === chip));
    renderItems();
  });
});

promptList.addEventListener("click", (event) => {
  const stepButton = event.target.closest("[data-copy-step]");
  if (stepButton) {
    event.stopPropagation();
    copyStep(stepButton.closest("[data-id]").dataset.id, Number(stepButton.dataset.copyStep), stepButton);
    return;
  }

  const previewButton = event.target.closest("[data-preview-id]");
  if (previewButton) {
    event.stopPropagation();
    showImagePreview(previewButton.dataset.previewId);
    return;
  }

  const openStepsButton = event.target.closest("[data-open-steps]");
  if (openStepsButton) {
    event.stopPropagation();
    openStepSelection(openStepsButton.closest("[data-id]"));
    return;
  }

  const button = event.target.closest("[data-copy-id]");
  if (button) {
    copyItem(button.dataset.copyId);
    return;
  }

  const card = event.target.closest("[data-id]");
  if (card) {
    if (event.target.closest("summary")) return;
    const item = state.items.find((candidate) => candidate.id === card.dataset.id);
    if (item && getPromptSteps(item).length) openStepSelection(card);
  }
});

openSidePanel.addEventListener("click", openPanel);
manageButton.addEventListener("click", openPanel);
closePreviewButton.addEventListener("click", hideImagePreview);
previewCopyButton.addEventListener("click", () => {
  if (state.previewId) {
    copyItem(state.previewId);
  }
});
imagePreviewOverlay.addEventListener("click", (event) => {
  if (event.target === imagePreviewOverlay) {
    hideImagePreview();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !imagePreviewOverlay.hidden) {
    hideImagePreview();
  }
});

init();
