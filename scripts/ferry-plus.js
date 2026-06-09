// ==UserScript==
// @name         ferry-plus
// @namespace    http://tampermonkey.net/
// @version      2026-04-14
// @description  try to take over the world!
// @author       You
// @match        https://iesi-oa.ikkem.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ikkem.com
// @grant        none
// ==/UserScript==

const getBaseHeaders = async () => {
    const token = await cookieStore.get("Admin-Token");
    return {
        "authorization": "Bearer " + token.value,
    };
}

// --- API Helpers ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchAllTemplates = async (onProgress, onDetailProgress) => {
    // Fetch Templates List
    if (onProgress) onProgress(0);
    const templateList = await getTemplateList(onProgress);

    const templates = [];
    // Fetch Template Details
    for (let i = 0; i < templateList.length; i++) {
        if (onDetailProgress) onDetailProgress(templateList[i].name, i, templateList.length);
        const detail = await getTemplateDetail(templateList[i].id);
        if (detail.code === 200) {
            templates.push(detail.data);
        } else {
            console.error("Failed template detail", templateList[i]);
        }
        await delay(50);
    }
    return templates;
};

const fetchAllProcesses = async (onProgress, onDetailProgress) => {
    // Fetch Processes List
    if (onProgress) onProgress(0);
    const processList = await getProcessList(onProgress);

    const processes = [];
    // Fetch Process Details
    for (let i = 0; i < processList.length; i++) {
        if (onDetailProgress) onDetailProgress(processList[i].name, i, processList.length);
        const detail = await getProcessDetail(processList[i].id);
        if (detail.code === 200) {
            processes.push(detail.data);
        } else {
            console.error("Failed process detail", processList[i]);
        }
        await delay(50);
    }
    return processes;
};

const updateTemplate = async (data) => {
    const payload = { ...data };
    delete payload.create_time;
    delete payload.creator;
    delete payload.update_time;
    delete payload.create_name;
    delete payload.create_user;

    const response = await fetch(`/api/v1/tpl`, {
        method: 'PUT',
        headers: {
            ...await getBaseHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await response.json();
};

const updateProcess = async (data) => {
    const payload = { ...data };
    delete payload.create_time;
    delete payload.creator;
    delete payload.update_time;
    delete payload.create_name;
    delete payload.create_user;

    const response = await fetch(`/api/v1/process`, {
        method: 'PUT',
        headers: {
            ...await getBaseHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    return await response.json();
};

const getTemplateList = async (onProgress) => {
    let page = 1;
    let totalPage = 1;
    let allData = [];
    do {
        if (onProgress) onProgress(page);
        const response = await fetch(`/api/v1/tpl?page=${page}&per_page=10`, { headers: await getBaseHeaders() });
        const res = await response.json();
        if (res.code !== 200) throw new Error(res.msg || "获取模板列表失败");

        if (res.data && res.data.data) {
            allData = allData.concat(res.data.data);
            totalPage = res.data.total_page;
        } else {
            break;
        }
        page++;
    } while (page <= totalPage);
    return allData;
};

const getTemplateDetail = async (id) => {
    const response = await fetch(`/api/v1/tpl/details?template_id=${id}`, { headers: await getBaseHeaders()});
    return await response.json();
};

const getProcessList = async (onProgress) => {
    let page = 1;
    let totalPage = 1;
    let allData = [];
    do {
        if (onProgress) onProgress(page);
        const response = await fetch(`/api/v1/process?page=${page}&per_page=10`, { headers: await getBaseHeaders()});
        const res = await response.json();
        if (res.code !== 200) throw new Error(res.msg || "获取流程列表失败");

        if (res.data && res.data.data) {
            allData = allData.concat(res.data.data);
            totalPage = res.data.total_page;
        } else {
            break;
        }
        page++;
    } while (page <= totalPage);
    return allData;
};

const getProcessDetail = async (id) => {
    const response = await fetch(`/api/v1/process/details?processId=${id}`, { headers: await getBaseHeaders()});
    return await response.json();
};

// --- UI Components ---
const createStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        #ferry-tools-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .ferry-tool-btn {
            padding: 8px 12px;
            background: #1890ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        .ferry-tool-btn:hover {
            background: #40a9ff;
        }
        .ferry-tool-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        #ferry-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #ferry-modal {
            background: white;
            padding: 20px;
            border-radius: 8px;
            min-width: 600px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: relative;
        }
        #ferry-modal-close {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            color: #999;
            cursor: pointer;
            border: none;
            background: none;
            line-height: 1;
            padding: 0;
            font-weight: bold;
        }
        #ferry-modal-close:hover {
            color: #333;
        }
        #ferry-modal-msg {
            margin-bottom: 20px;
            font-size: 16px;
            color: #333;
            margin-top: 10px;
        }
        #ferry-modal-body {
            text-align: left;
            margin-bottom: 15px;
            max-height: 400px;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
};

const showModal = (msg, showCancel = false, contentHtml = null) => {
    let overlay = document.getElementById('ferry-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ferry-modal-overlay';
        overlay.innerHTML = `
            <div id="ferry-modal">
                <button id="ferry-modal-close">&times;</button>
                <div id="ferry-modal-msg"></div>
                <div id="ferry-modal-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('ferry-modal-close').onclick = () => {
            overlay.remove();
        };
    }

    document.getElementById('ferry-modal-msg').innerText = msg;
    const body = document.getElementById('ferry-modal-body');
    body.innerHTML = contentHtml || '';

    return {
        setMsg: (m) => document.getElementById('ferry-modal-msg').innerText = m,
        setBody: (h) => body.innerHTML = h,
        overlay: overlay
    };
};

const hideModal = () => {
    const overlay = document.getElementById('ferry-modal-overlay');
    if (overlay) overlay.remove();
};

const getDiffNodes = (oldObj, newObj, path = "") => {
    let diffs = [];
    if (oldObj === newObj) return [];
    if (oldObj === null || newObj === null || typeof oldObj !== 'object' || typeof newObj !== 'object') {
        return [`*: ${path}: ${JSON.stringify(oldObj)} → ${JSON.stringify(newObj)}`];
    }

    const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    for (const key of keys) {
        const currentPath = path ? `${path}.${key}` : key;
        const oldVal = oldObj[key];
        const newVal = newObj[key];

        if (oldVal === undefined) {
             diffs.push(`+ ${currentPath}: ${JSON.stringify(newVal)}`);
        } else if (newVal === undefined) {
             diffs.push(`- ${currentPath}: ${JSON.stringify(oldVal)}`);
        } else if (typeof oldVal === 'object' && oldVal !== null && typeof newVal === 'object' && newVal !== null) {
             diffs = diffs.concat(getDiffNodes(oldVal, newVal, currentPath));
        } else if (oldVal !== newVal) {
             diffs.push(`*: ${currentPath}: ${JSON.stringify(oldVal)} → ${JSON.stringify(newVal)}`);
        }
    }
    return diffs;
};

const renderDiffTable = (changes, containerId, updateFunc, typeLabel) => {
    const container = document.getElementById(containerId);
    if (changes.length === 0) {
            container.innerHTML = "<p>没有发现变化。</p>";
            return;
    }

    let html = `
        <table style="width:100%; border-collapse: collapse; font-size: 12px;">
            <thead>
                <tr style="background:#f0f0f0;">
                    <th style="border:1px solid #ddd; padding:5px;">${typeLabel}名称</th>
                    <th style="border:1px solid #ddd; padding:5px;">操作</th>
                </tr>
            </thead>
            <tbody>
    `;

    changes.forEach((c, idx) => {
        const rowId = `${containerId}-row-${idx}`;
        const detailRowId = `${containerId}-detail-row-${idx}`;
        const diffContentId = `${containerId}-diff-content-${idx}`;

        html += `
            <tr id="${rowId}">
                <td style="border:1px solid #ddd; padding:5px;">${c.name}</td>
                    <td style="border:1px solid #ddd; padding:5px;">
                    <button class="ferry-tool-btn detail-btn" data-idx="${idx}" data-detail-id="${detailRowId}" data-diff-id="${diffContentId}" style="padding: 2px 5px; font-size: 12px; background: #faaad14;">详情</button>
                    <button class="ferry-tool-btn save-btn" data-idx="${idx}" style="padding: 2px 5px; font-size: 12px;">保存</button>
                    </td>
            </tr>
            <tr id="${detailRowId}" style="display:none; background: #fafafa;">
                <td colspan="2" style="border:1px solid #ddd; padding:10px;">
                    <pre style="white-space: pre-wrap; margin:0; font-family: monospace; color: #555; max-height: 300px; overflow-y:auto;" id="${diffContentId}"></pre>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    // Save Buttons
    const saveBtns = container.querySelectorAll('.save-btn');
    saveBtns.forEach(btn => {
        btn.onclick = async (e) => {
            const idx = e.target.getAttribute('data-idx');
            const item = changes[idx];
            const btnEl = e.target;

            btnEl.innerText = "保存中...";
            btnEl.disabled = true;

            try {
                const res = await updateFunc(item.newData);
                if (res.code === 200) {
                    btnEl.innerText = "已保存";
                    btnEl.style.background = "#52c41a";
                } else {
                    throw new Error(res.msg);
                }
            } catch(err) {
                btnEl.innerText = "重试";
                btnEl.disabled = false;
                alert("保存失败: " + err.message);
            }
        };
    });

    // Detail Buttons
    const detailBtns = container.querySelectorAll('.detail-btn');
    detailBtns.forEach(btn => {
            btn.onclick = (e) => {
            const idx = e.target.getAttribute('data-idx');
            const detailRowId = e.target.getAttribute('data-detail-id');
            const diffContentId = e.target.getAttribute('data-diff-id');

            const item = changes[idx];
            const row = document.getElementById(detailRowId);

            if (row.style.display === 'none') {
                const diffs = getDiffNodes(item.oldData, item.newData);
                document.getElementById(diffContentId).innerText = diffs.join('\n');
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
            };
    });
};

const handleBatchReplace = async ({ title, typeLabel, idPrefix, fetchData, updateItem }) => {
    const modal = showModal("正在初始化...", true);
    let allData = [];

    const startReplaceFlow = () => {
        const formHtml = `
            <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-direction: column;">
                <div>
                    <label>查找:</label>
                    <input type="text" id="${idPrefix}-find-input" style="width: 100%; padding: 5px;" placeholder="请输入文本">
                </div>
                <div>
                    <label>替换:</label>
                    <input type="text" id="${idPrefix}-replace-input" style="width: 100%; padding: 5px;">
                </div>
                <button id="${idPrefix}-preview-btn" class="ferry-tool-btn">预览更改</button>
            </div>
            <div id="${idPrefix}-diff-result"></div>
        `;
        modal.setBody(formHtml);
        modal.setMsg(title);

        document.getElementById(`${idPrefix}-preview-btn`).onclick = () => {
            const findStr = document.getElementById(`${idPrefix}-find-input`).value;
            const replaceStr = document.getElementById(`${idPrefix}-replace-input`).value;
            if (!findStr) return alert("请输入查找内容");

            doPreview(findStr, replaceStr);
        };
    };

    const doPreview = (findStr, replaceStr) => {
        const changes = [];
        const oldJson = JSON.stringify(allData);

        // Use string replacement
         let newJson = oldJson.replaceAll(findStr, replaceStr);

         if (oldJson === newJson) {
             document.getElementById(`${idPrefix}-diff-result`).innerHTML = "<p>没有发现任何匹配项或无需更改。</p>";
             return;
         }

         const newDataList = JSON.parse(newJson);

         // Compare
         for(let i=0; i<allData.length; i++) {
             const oldItem = allData[i];
             const newItem = newDataList[i];
             if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                 changes.push({
                     name: oldItem.name,
                     id: oldItem.id,
                     oldData: oldItem,
                     newData: newItem
                 });
             }
         }

         renderDiffTable(changes, `${idPrefix}-diff-result`, updateItem, typeLabel);
    };

    try {
        allData = await fetchData(
            (p) => modal.setMsg(`正在获取${typeLabel}列表 (第 ${p} 页)...`),
            (name, i, total) => modal.setMsg(`正在获取${typeLabel}详情: ${name} (${i+1}/${total})...`)
        );

        startReplaceFlow();
    } catch (e) {
        console.error(e);
        modal.setMsg("初始化失败: " + e.message);
    }
};

const handleBatchTemplateReplace = () => handleBatchReplace({
    title: "批量模板替换",
    typeLabel: "模板",
    idPrefix: "tpl",
    fetchData: fetchAllTemplates,
    updateItem: updateTemplate
});

const handleBatchProcessReplace = () => handleBatchReplace({
    title: "批量流程替换",
    typeLabel: "流程",
    idPrefix: "proc",
    fetchData: fetchAllProcesses,
    updateItem: updateProcess
});

const handleBackup = async () => {
    showModal("开始备份...", false);

    try {
        // Fetch Templates
        showModal(`正在获取模板列表...`);
        const templates = await fetchAllTemplates(
             (p) => showModal(`正在获取模板列表 (第 ${p} 页)...`),
             (name, i, total) => showModal(`正在获取模板详情: ${name} (${i+1}/${total})...`)
        );

        const processes = [];

        // Fetch Processes List
        showModal(`正在获取流程列表...`);
        const processList = await getProcessList((p) => showModal(`正在获取流程列表 (第 ${p} 页)...`));

        // Fetch Process Details
        for (let i = 0; i < processList.length; i++) {
            showModal(`正在获取流程详情: ${processList[i].name} (${i+1}/${processList.length})...`);
            const detail = await getProcessDetail(processList[i].id);
            if (detail.code === 200) {
                processes.push(detail.data);
            } else {
                console.error("Failed process detail", processList[i]);
            }
            await delay(50);
        }

        // Export
        const backup = { templates, processes };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        a.download = `ferry-backup-${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showModal("备份完成！", true);

    } catch (e) {
        console.error(e);
        showModal("备份失败: " + e.message, true);
    }
};

const createToolbar = () => {
    if (document.getElementById('ferry-tools-panel')) return;

    createStyles();
    const panel = document.createElement('div');
    panel.id = 'ferry-tools-panel';

    const btns = [
        { name: '批量模板文本替换', action: handleBatchTemplateReplace },
        { name: '批量流程文本替换', action: handleBatchProcessReplace },
        { name: '备份', action: handleBackup },
        { name: '还原备份', action: () => alert('功能开发中...') }
    ];

    btns.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'ferry-tool-btn';
        btn.innerText = b.name;
        btn.onclick = b.action;
        panel.appendChild(btn);
    });

    document.body.appendChild(panel);
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToolbar);
} else {
    createToolbar();
}

