const state = {
  items: [],
  selectedId: null,
  query: "",
  previewId: null,
};

const elements = {
  mainView: document.getElementById("mainView"),
  settingsPage: document.getElementById("settingsPage"),
  openSettingsButton: document.getElementById("openSettingsButton"),
  backToMainButton: document.getElementById("backToMainButton"),
  searchInput: document.getElementById("searchInput"),
  panelLayout: document.getElementById("panelLayout"),
  promptList: document.getElementById("promptList"),
  editorDialog: document.getElementById("editorDialog"),
  editorForm: document.getElementById("editorForm"),
  toast: document.getElementById("toast"),
  editorTitle: document.getElementById("editorTitle"),
  itemId: document.getElementById("itemId"),
  titleInput: document.getElementById("titleInput"),
  contentInput: document.getElementById("contentInput"),
  multiStepToggle: document.getElementById("multiStepToggle"),
  multiStepEditor: document.getElementById("multiStepEditor"),
  multiStepInputs: document.getElementById("multiStepInputs"),
  addStepButton: document.getElementById("addStepButton"),
  favoriteToggle: document.getElementById("favoriteToggle"),
  deleteButton: document.getElementById("deleteButton"),
  cancelButton: document.getElementById("cancelButton"),
  copyButton: document.getElementById("copyButton"),
  newItemButton: document.getElementById("newItemButton"),
  exportButton: document.getElementById("exportButton"),
  importInput: document.getElementById("importInput"),
  statusLine: document.getElementById("statusLine"),
  imagePreviewOverlay: document.getElementById("imagePreviewOverlay"),
  previewImage: document.getElementById("previewImage"),
  previewTitle: document.getElementById("previewTitle"),
  previewMeta: document.getElementById("previewMeta"),
  previewPrompt: document.getElementById("previewPrompt"),
  closePreviewButton: document.getElementById("closePreviewButton"),
  previewCopyButton: document.getElementById("previewCopyButton"),
  previewSourceLink: document.getElementById("previewSourceLink")
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function matchesQuery(item) {
  if (!state.query) {
    return true;
  }

  const haystack = [
    item.title,
    item.content
  ].join(" ").toLowerCase();

  return haystack.includes(state.query.toLowerCase());
}

function getVisibleItems() {
  return state.items
    .filter(matchesQuery)
    .sort((a, b) => {
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
}

function renderList() {
  const visibleItems = getVisibleItems();

  if (!visibleItems.length) {
    elements.promptList.innerHTML = `
      <div class="empty-state panel-empty">
        <strong>还没有匹配内容</strong>
        <span>新增一个 Prompt，或换个关键词搜索。</span>
      </div>
    `;
    return;
  }

  elements.promptList.innerHTML = visibleItems.map((item) => `
    <article class="prompt-card ${item.id === state.selectedId ? "is-selected" : ""}" data-id="${item.id}" title="${getPromptSteps(item).length ? "点击选择要复制的步骤" : "点击复制提示词"}">
      ${renderPreviewThumb(item)}
      <div class="prompt-main">
        <div class="prompt-title-row">
          <h2>${escapeHtml(item.title)}</h2>
          ${item.favorite ? '<span class="favorite-mark" title="收藏">★</span>' : ""}
        </div>
        ${getPromptSteps(item).length ? "" : `<p>${escapeHtml(item.content)}</p>`}
        ${renderStepCopies(item)}
      </div>
      <span class="card-copy-count" aria-hidden="true">${Number(item.usageCount) || 0}次</span>
      <button class="card-edit-button" data-edit-id="${item.id}" type="button" title="编辑" aria-label="编辑「${escapeHtml(item.title)}」">
        <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
      </button>
    </article>
  `).join("");
}

function renderPreviewThumb(item) {
  if (!item.previewImage || !item.previewImage.thumbnailUrl) {
    return "";
  }

  const alt = item.previewImage.alt || item.title;
  return `
    <button class="preview-thumb" type="button" data-preview-id="${item.id}" title="查看参考图" aria-label="查看「${escapeHtml(item.title)}」参考图">
      <img src="${escapeHtml(item.previewImage.thumbnailUrl)}" alt="${escapeHtml(alt)}" loading="lazy">
    </button>
  `;
}

function setFavorite(value) {
  const isFavorite = Boolean(value);
  elements.favoriteToggle.classList.toggle("is-active", isFavorite);
  elements.favoriteToggle.setAttribute("aria-pressed", String(isFavorite));
  elements.favoriteToggle.setAttribute("aria-label", isFavorite ? "取消收藏" : "收藏");
}

function isFavoriteSelected() {
  return elements.favoriteToggle.classList.contains("is-active");
}

function addStepInput(value = { name: "", content: "" }) {
  const index = elements.multiStepInputs.children.length;
  const stepValue = typeof value === "string" ? { name: "", content: value } : value;
  const step = document.createElement("div");
  step.className = "multi-step-input-row";
  step.innerHTML = `
    <label class="field">
      <span class="step-index">第 ${index + 1} 步</span>
      <input class="multi-step-name" type="text" placeholder="名称（可选）">
      <textarea class="multi-step-input" placeholder="录入这一步要复制的内容" required></textarea>
    </label>
    <button type="button" class="secondary-button remove-step-button" aria-label="删除第 ${index + 1} 步">删除</button>
  `;
  step.querySelector(".multi-step-name").value = stepValue.name || "";
  step.querySelector(".multi-step-input").value = stepValue.content || "";
  elements.multiStepInputs.append(step);
}

function updateMultiStepEditor() {
  const multiStep = elements.multiStepToggle.checked;
  elements.multiStepEditor.hidden = !multiStep;
  elements.contentInput.closest(".field-content").hidden = multiStep;
  elements.contentInput.required = !multiStep;
  elements.multiStepInputs.querySelectorAll(".multi-step-input").forEach((input) => {
    input.required = multiStep;
  });
}

function renumberStepInputs() {
  elements.multiStepInputs.querySelectorAll(".multi-step-input-row").forEach((row, index) => {
    row.querySelector(".step-index").textContent = `第 ${index + 1} 步`;
    row.querySelector("button").setAttribute("aria-label", `删除第 ${index + 1} 步`);
  });
}

function renderAll() {
  renderList();
}

function showSettings() {
  elements.mainView.hidden = true;
  elements.settingsPage.hidden = false;
}

function showMainView() {
  elements.settingsPage.hidden = true;
  elements.mainView.hidden = false;
}

function showEditor() {
  if (!elements.editorDialog.open) {
    elements.editorDialog.showModal();
  }
}

function hideEditor() {
  if (elements.editorDialog.open) {
    elements.editorDialog.close();
  }
}

function showImagePreview(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item || !item.previewImage) {
    return;
  }

  state.previewId = id;
  elements.previewImage.src = item.previewImage.fullUrl || item.previewImage.thumbnailUrl;
  elements.previewImage.alt = item.previewImage.alt || item.title;
  elements.previewTitle.textContent = item.title;
  elements.previewMeta.textContent = item.source?.sourceLabel || "";
  elements.previewPrompt.textContent = item.content;

  if (item.source?.url) {
    elements.previewSourceLink.href = item.source.url;
    elements.previewSourceLink.hidden = false;
  } else {
    elements.previewSourceLink.hidden = true;
    elements.previewSourceLink.removeAttribute("href");
  }

  elements.imagePreviewOverlay.hidden = false;
  elements.closePreviewButton.focus();
}

function hideImagePreview() {
  state.previewId = null;
  elements.imagePreviewOverlay.hidden = true;
  elements.previewImage.removeAttribute("src");
}

function setStatus(message) {
  elements.statusLine.textContent = message;
  if (message) {
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      elements.statusLine.textContent = "";
    }, 2200);
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 1600);
}

function markCopiedButton(button) {
  if (!button) {
    return;
  }

  const previousText = button.textContent;
  button.textContent = "已复制";
  button.classList.add("is-copied");
  window.clearTimeout(button.copyTimer);
  button.copyTimer = window.setTimeout(() => {
    button.textContent = previousText || "复制";
    button.classList.remove("is-copied");
  }, 1400);
}

function markCardCopied(card) {
  if (!card) {
    return;
  }

  card.classList.add("is-copied");
  window.clearTimeout(card.copyTimer);
  card.copyTimer = window.setTimeout(() => {
    card.classList.remove("is-copied");
  }, 650);
}

function resetForm() {
  state.selectedId = null;
  elements.editorTitle.textContent = "新增内容";
  elements.itemId.value = "";
  elements.titleInput.value = "";
  elements.contentInput.value = "";
  elements.multiStepToggle.checked = false;
  elements.multiStepInputs.innerHTML = "";
  addStepInput();
  addStepInput();
  updateMultiStepEditor();
  setFavorite(false);
  elements.deleteButton.disabled = true;
  showEditor();
  renderList();
  elements.titleInput.focus();
}

function selectItem(id) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) {
    return;
  }

  state.selectedId = id;
  elements.editorTitle.textContent = "编辑内容";
  elements.itemId.value = item.id;
  elements.titleInput.value = item.title;
  elements.contentInput.value = item.content;
  elements.multiStepToggle.checked = Array.isArray(item.steps) && item.steps.length > 0;
  elements.multiStepInputs.innerHTML = "";
  (item.steps?.length ? item.steps : [""]).forEach((step) => addStepInput(step));
  updateMultiStepEditor();
  setFavorite(item.favorite);
  elements.deleteButton.disabled = false;
  showEditor();
  renderList();
}

function getFormItem() {
  const existingItem = state.items.find((item) => item.id === elements.itemId.value);
  const steps = elements.multiStepToggle.checked
    ? Array.from(elements.multiStepInputs.querySelectorAll(".multi-step-input-row"), (row) => ({
      name: row.querySelector(".multi-step-name").value.trim(),
      content: row.querySelector(".multi-step-input").value.trim()
    }))
    : [];
  const content = elements.multiStepToggle.checked
    ? steps.map((step, index) => `第 ${index + 1} 步${step.name ? `：${step.name}` : ""}\n${step.content}`).join("\n\n")
    : elements.contentInput.value;
  return window.QuickPromptStore.normalizeItem({
    id: elements.itemId.value || undefined,
    title: elements.titleInput.value,
    content,
    steps,
    favorite: isFavoriteSelected(),
    createdAt: existingItem?.createdAt,
    previewImage: existingItem?.previewImage,
    source: existingItem?.source
  });
}

function validateItem(item) {
  if (!item.title) {
    elements.titleInput.focus();
    setStatus("请填写标题。");
    return false;
  }

  if (!item.content.trim() || (elements.multiStepToggle.checked && item.steps.some((step) => !step.content))) {
    (elements.multiStepToggle.checked
      ? elements.multiStepInputs.querySelector(".multi-step-input")
      : elements.contentInput).focus();
    setStatus(elements.multiStepToggle.checked ? "请填写每一步的内容。" : "请填写内容。");
    return false;
  }

  return true;
}

async function saveCurrentItem(event) {
  event.preventDefault();
  const item = getFormItem();
  if (!validateItem(item)) {
    return;
  }

  const beforeIds = new Set(state.items.map((candidate) => candidate.id));
  state.items = await window.QuickPromptStore.upsertItem(item);
  const savedItem = state.items.find((candidate) => candidate.id === item.id)
    || state.items.find((candidate) => !beforeIds.has(candidate.id))
    || state.items[0];
  state.selectedId = savedItem ? savedItem.id : null;
  renderAll();
  setStatus("已保存。");
  hideEditor();
  showToast("已保存");
}

async function deleteCurrentItem() {
  if (!state.selectedId) {
    return;
  }

  const item = state.items.find((candidate) => candidate.id === state.selectedId);
  if (!item || !window.confirm(`删除「${item.title}」？`)) {
    return;
  }

  await window.QuickPromptStore.deleteItem(item.id);
  state.items = await window.QuickPromptStore.getItems();
  state.selectedId = null;
  renderAll();
  setStatus("已删除。");
  hideEditor();
  showToast("已删除");
}

async function copyCurrentItem() {
  const item = elements.itemId.value
    ? state.items.find((candidate) => candidate.id === elements.itemId.value)
    : getFormItem();

  if (!item || !item.content) {
    setStatus("没有可复制的内容。");
    return;
  }

  try {
    await navigator.clipboard.writeText(item.content);
    if (item.id) {
      await window.QuickPromptStore.recordUsage(item.id);
      state.items = await window.QuickPromptStore.getItems();
      renderAll();
    }
    setStatus("已复制。");
    showToast("已复制");
  } catch (error) {
    setStatus("复制失败。");
    showToast("复制失败");
  }
}

async function copyItemById(id, button) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) {
    return;
  }

  try {
    await navigator.clipboard.writeText(item.content);
    markCopiedButton(button);
    markCardCopied(button ? button.closest(".prompt-card") : elements.promptList.querySelector(`[data-id="${CSS.escape(id)}"]`));
    await window.QuickPromptStore.recordUsage(item.id);
    state.items = await window.QuickPromptStore.getItems();
    renderAll();
    markCardCopied(elements.promptList.querySelector(`[data-id="${CSS.escape(id)}"]`));
    setStatus("已复制。");
    showToast(`已复制：${item.title}`);
  } catch (error) {
    setStatus("复制失败。");
    showToast("复制失败");
  }
}

async function copyStepById(id, stepIndex, button) {
  const item = state.items.find((candidate) => candidate.id === id);
  const step = item && getPromptSteps(item)[stepIndex];
  if (!item || !step) return;

  try {
    await navigator.clipboard.writeText(step.content);
    markCopiedButton(button);
    const updatedItem = await window.QuickPromptStore.recordUsage(item.id);
    if (updatedItem) {
      state.items = state.items.map((candidate) => candidate.id === item.id ? updatedItem : candidate);
      const usageCount = button.closest(".prompt-card")?.querySelector(".card-copy-count");
      if (usageCount) usageCount.textContent = `${Number(updatedItem.usageCount) || 0}次`;
    }
    setStatus("已复制本步。");
    showToast(`已复制第 ${stepIndex + 1} 步${step.name ? `：${step.name}` : ""}`);
  } catch (error) {
    setStatus("复制失败。");
    showToast("复制失败");
  }
}

function exportData() {
  const payload = {
    app: "儿子快捷提示词",
    version: 1,
    exportedAt: new Date().toISOString(),
    items: state.items
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `son-quickprompt-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importData(file) {
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const incomingItems = Array.isArray(parsed) ? parsed : parsed.items;

    if (!Array.isArray(incomingItems)) {
      throw new Error("JSON 中没有 items 数组。");
    }

    const existingById = new Map(state.items.map((item) => [item.id, item]));
    incomingItems.map(window.QuickPromptStore.normalizeItem).forEach((item) => {
      existingById.set(item.id, item);
    });

    await window.QuickPromptStore.saveItems(Array.from(existingById.values()));
    state.items = await window.QuickPromptStore.getItems();
    renderAll();
    setStatus("导入完成。");
    showToast("导入完成");
  } catch (error) {
    setStatus(`导入失败：${error.message}`);
    showToast("导入失败");
  } finally {
    elements.importInput.value = "";
  }
}

async function init() {
  await window.QuickPromptStore.ensureSeedData();
  state.items = await window.QuickPromptStore.getItems();
  renderAll();
  hideEditor();
}

elements.searchInput.addEventListener("input", () => {
  state.query = elements.searchInput.value.trim();
  renderList();
});

elements.promptList.addEventListener("click", (event) => {
  const stepButton = event.target.closest("[data-copy-step]");
  if (stepButton) {
    event.stopPropagation();
    copyStepById(stepButton.closest("[data-id]").dataset.id, Number(stepButton.dataset.copyStep), stepButton);
    return;
  }

  const previewButton = event.target.closest("[data-preview-id]");
  if (previewButton) {
    event.stopPropagation();
    showImagePreview(previewButton.dataset.previewId);
    return;
  }

  const editButton = event.target.closest("[data-edit-id]");
  if (editButton) {
    event.stopPropagation();
    selectItem(editButton.dataset.editId);
    return;
  }

  const card = event.target.closest("[data-id]");
  if (card) {
    if (event.target.closest("summary")) return;
    const item = state.items.find((candidate) => candidate.id === card.dataset.id);
    if (item && getPromptSteps(item).length) {
      openStepSelection(card);
      return;
    }
    copyItemById(card.dataset.id);
  }
});

elements.multiStepToggle.addEventListener("change", () => {
  if (elements.multiStepToggle.checked && !elements.multiStepInputs.children.length) {
    addStepInput();
    addStepInput();
  }
  updateMultiStepEditor();
});

elements.addStepButton.addEventListener("click", () => {
  addStepInput();
  updateMultiStepEditor();
  elements.multiStepInputs.lastElementChild.querySelector("textarea").focus();
});

elements.multiStepInputs.addEventListener("click", (event) => {
  if (!event.target.closest(".remove-step-button")) return;
  event.target.closest(".multi-step-input-row").remove();
  renumberStepInputs();
});

elements.openSettingsButton.addEventListener("click", showSettings);
elements.backToMainButton.addEventListener("click", showMainView);
elements.editorForm.addEventListener("submit", saveCurrentItem);
elements.deleteButton.addEventListener("click", deleteCurrentItem);
elements.cancelButton.addEventListener("click", hideEditor);
elements.copyButton.addEventListener("click", copyCurrentItem);
elements.newItemButton.addEventListener("click", resetForm);
elements.favoriteToggle.addEventListener("click", () => {
  setFavorite(!isFavoriteSelected());
});
elements.exportButton.addEventListener("click", exportData);
elements.importInput.addEventListener("change", () => importData(elements.importInput.files[0]));
elements.closePreviewButton.addEventListener("click", hideImagePreview);
elements.previewCopyButton.addEventListener("click", () => {
  if (state.previewId) {
    copyItemById(state.previewId, elements.previewCopyButton);
  }
});
elements.imagePreviewOverlay.addEventListener("click", (event) => {
  if (event.target === elements.imagePreviewOverlay) {
    hideImagePreview();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.imagePreviewOverlay.hidden) {
    hideImagePreview();
    return;
  }

});

init();
