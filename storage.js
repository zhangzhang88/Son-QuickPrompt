(function (root) {
  const STORAGE_KEY = "qiaomuQuickPromptItems";
  const DEFAULTS_VERSION_KEY = "sonQuickPromptDefaultsVersion";
  const DEFAULTS_VERSION = 1;
  function getFromStorage(keys) {
    return chrome.storage.local.get(keys);
  }

  function setToStorage(values) {
    return chrome.storage.local.set(values);
  }

  function normalizeItem(item) {
    const now = new Date().toISOString();
    const normalized = {
      id: item.id || `prompt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: String(item.title || "").trim(),
      content: String(item.content || ""),
      favorite: Boolean(item.favorite),
      usageCount: Number.isFinite(Number(item.usageCount)) ? Number(item.usageCount) : 0,
      createdAt: item.createdAt || now,
      updatedAt: item.updatedAt || now
    };

    if (Array.isArray(item.steps)) {
      normalized.steps = item.steps.map((step) => typeof step === "string"
        ? { name: "", content: step }
        : { name: String(step?.name || "").trim(), content: String(step?.content || "") });
    }

    if (item.previewImage && (item.previewImage.thumbnailUrl || item.previewImage.fullUrl)) {
      normalized.previewImage = {
        thumbnailUrl: String(item.previewImage.thumbnailUrl || item.previewImage.fullUrl || ""),
        fullUrl: String(item.previewImage.fullUrl || item.previewImage.thumbnailUrl || ""),
        alt: String(item.previewImage.alt || item.title || "")
      };
    }

    if (item.source && typeof item.source === "object") {
      normalized.source = Object.assign({}, item.source);
    }

    return normalized;
  }

  async function ensureSeedData() {
    const result = await getFromStorage([STORAGE_KEY, DEFAULTS_VERSION_KEY]);
    const updates = {};
    let items = result[STORAGE_KEY];
    const needsDefaults = result[DEFAULTS_VERSION_KEY] !== DEFAULTS_VERSION;

    if (!Array.isArray(items)) {
      items = [];
    }

    let itemsChanged = !Array.isArray(result[STORAGE_KEY]);
    items = items.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return item;
      }

      if (!["category", "promptType", "shortcut", "tags"].some((key) => Object.prototype.hasOwnProperty.call(item, key))) {
        return item;
      }

      itemsChanged = true;
      const remainingItem = Object.assign({}, item);
      delete remainingItem.category;
      delete remainingItem.promptType;
      delete remainingItem.shortcut;
      delete remainingItem.tags;
      return remainingItem;
    });

    if (needsDefaults) {
      const response = await fetch(chrome.runtime.getURL("default-prompts.json"));
      if (!response.ok) {
        throw new Error("无法读取内置默认提示词。");
      }

      const payload = await response.json();
      if (!Array.isArray(payload.items)) {
        throw new Error("内置默认提示词格式无效。");
      }

      const existingIds = new Set(items.map((item) => item?.id).filter(Boolean));
      const missingItems = payload.items
        .filter((item) => item && item.id && !existingIds.has(item.id))
        .map(normalizeItem);

      if (missingItems.length > 0) {
        items = items.concat(missingItems);
        itemsChanged = true;
      }

      updates[DEFAULTS_VERSION_KEY] = DEFAULTS_VERSION;
    }

    if (itemsChanged) {
      updates[STORAGE_KEY] = items;
    }

    if (Object.keys(updates).length > 0) {
      await setToStorage(updates);
    }
  }

  async function getItems() {
    await ensureSeedData();
    const result = await getFromStorage(STORAGE_KEY);
    return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY].map(normalizeItem) : [];
  }

  async function saveItems(items) {
    const normalized = items.map(normalizeItem);
    await setToStorage({ [STORAGE_KEY]: normalized });
    return normalized;
  }

  async function upsertItem(item) {
    const items = await getItems();
    const normalized = normalizeItem(Object.assign({}, item, { updatedAt: new Date().toISOString() }));
    const existingIndex = items.findIndex((candidate) => candidate.id === normalized.id);

    if (existingIndex >= 0) {
      items[existingIndex] = Object.assign({}, items[existingIndex], normalized);
    } else {
      items.unshift(normalized);
    }

    return saveItems(items);
  }

  async function deleteItem(id) {
    const items = await getItems();
    return saveItems(items.filter((item) => item.id !== id));
  }

  async function recordUsage(id) {
    const items = await getItems();
    const now = new Date().toISOString();
    const nextItems = items.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return Object.assign({}, item, {
        usageCount: Number(item.usageCount || 0) + 1,
        lastUsedAt: now
      });
    });

    await saveItems(nextItems);
    return nextItems.find((item) => item.id === id) || null;
  }

  root.QuickPromptStore = {
    STORAGE_KEY,
    ensureSeedData,
    getItems,
    saveItems,
    upsertItem,
    deleteItem,
    recordUsage,
    normalizeItem
  };
})(globalThis);
