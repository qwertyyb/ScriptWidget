(function () {
  // ── i18n ──
  const I18N = {
    en: {
      home_desc: 'Edit scripts on your phone from the computer',
      card_connect_title: 'Connect to Phone',
      card_connect_desc: 'Tap "Wait for PC" in the app, copy the Peer ID, then paste it below',
      card_wait_title: 'Wait for Phone',
      card_wait_desc: 'Generate a Peer ID, then tap "Enter PC ID" in the app and paste it',
      placeholder_peer_id: 'Paste Peer ID',
      btn_connect: 'Connect',
      btn_create: 'Create Connection',
      btn_back: '← Back',
      status_waiting: 'Waiting for phone to connect…',
      status_connecting: 'Connecting…',
      btn_copy: 'Copy',
      btn_copied: 'Copied',
      conn_connected: 'Connected',
      conn_disconnected: 'Disconnected',
      sync_synced: 'Synced',
      sync_dirty: 'Unsynced',
      sync_error: 'Sync Failed',
      btn_save: 'Save to Phone',
      btn_disconnect: 'Disconnect',
      overlay_title: 'Connection Lost',
      overlay_desc: 'The phone has closed the connection',
      btn_go_home: 'Back to Home',
      alert_connect_fail: 'Connection failed: ',
      alert_create_fail: 'Creation failed: ',
      file_tree_title: 'Files',
      btn_upload: 'Upload',
      btn_cancel: 'Cancel',
      upload_title: 'Upload Files',
      upload_save_as: 'Save as:',
      upload_drop_hint: 'Drop files here to upload',
      confirm_delete_file: 'Delete "{name}"?',
      confirm_delete_dir: 'Delete folder "{name}" and all its contents?',
    },
    zh: {
      home_desc: '在电脑上编辑手机中的脚本',
      card_connect_title: '连接到手机',
      card_connect_desc: '在手机 App 内选择「等待电脑连接」，复制 Peer ID 后粘贴到下方',
      card_wait_title: '等待手机连接',
      card_wait_desc: '生成一个 Peer ID，在手机 App 内选择「输入电脑 ID」并粘贴此 ID',
      placeholder_peer_id: '粘贴 Peer ID',
      btn_connect: '连接',
      btn_create: '创建连接',
      btn_back: '← 返回',
      status_waiting: '等待手机连接…',
      status_connecting: '正在连接…',
      btn_copy: '复制',
      btn_copied: '已复制',
      conn_connected: '已连接',
      conn_disconnected: '已断开',
      sync_synced: '已同步',
      sync_dirty: '未同步',
      sync_error: '同步失败',
      btn_save: '保存到手机',
      btn_disconnect: '断开',
      overlay_title: '连接已断开',
      overlay_desc: '手机端已关闭连接',
      btn_go_home: '返回主页',
      alert_connect_fail: '连接失败: ',
      alert_create_fail: '创建失败: ',
      file_tree_title: '文件',
      btn_upload: '上传',
      btn_cancel: '取消',
      upload_title: '上传文件',
      upload_save_as: '保存为:',
      upload_drop_hint: '拖拽文件到此处上传',
      confirm_delete_file: '确定删除「{name}」？',
      confirm_delete_dir: '确定删除文件夹「{name}」及其所有内容？',
    },
  };

  function detectLang() {
    const saved = localStorage.getItem('sw_editor_lang');
    if (saved && I18N[saved]) return saved;
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('zh')) return 'zh';
    return 'en';
  }

  let currentLang = detectLang();

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    langToggle.textContent = currentLang === 'zh' ? '中文' : 'EN';
  }

  const langToggle = document.getElementById('lang-toggle');
  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('sw_editor_lang', currentLang);
    applyI18n();
    refreshDynamicText();
    renderFileTree();
  });

  // ── DOM refs ──
  const homePanel = document.getElementById('home-panel');
  const waitPanel = document.getElementById('wait-panel');
  const connectingPanel = document.getElementById('connecting-panel');
  const editorPanel = document.getElementById('editor-panel');
  const disconnectedOverlay = document.getElementById('disconnected-overlay');

  const inputPeerId = document.getElementById('input-peer-id');
  const btnConnect = document.getElementById('btn-connect');
  const btnCreate = document.getElementById('btn-create');
  const btnBackWait = document.getElementById('btn-back-wait');
  const btnBackConnecting = document.getElementById('btn-back-connecting');
  const peerIdText = document.getElementById('peer-id-text');
  const btnCopyId = document.getElementById('btn-copy-id');
  const qrWrap = document.getElementById('qr-wrap');

  const connIndicator = document.getElementById('conn-indicator');
  const connLabel = document.getElementById('conn-label');
  const btnSave = document.getElementById('btn-save');
  const btnDisconnect = document.getElementById('btn-disconnect');
  const syncStatus = document.getElementById('sync-status');
  const syncDot = document.getElementById('sync-dot');
  const syncLabel = document.getElementById('sync-label');
  const editorRoot = document.getElementById('editor-root');
  const fileTree = document.getElementById('file-tree');
  const btnGoHome = document.getElementById('btn-go-home');

  const fileUploadInput = document.getElementById('file-upload-input');
  const uploadDialog = document.getElementById('upload-dialog');
  const uploadFileList = document.getElementById('upload-file-list');
  const btnUploadCancel = document.getElementById('btn-upload-cancel');
  const btnUploadConfirm = document.getElementById('btn-upload-confirm');

  let peer = null;
  let conn = null;
  let monacoEditor = null;
  let rpcId = 1;
  let lastSyncedContent = '';
  let currentSyncState = 'synced';
  let currentConnState = 'connected';

  let fileList = [];
  let currentFileName = 'main.jsx';
  let pendingRpcCallbacks = {};
  let pendingUploadFiles = [];

  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'turn:81.71.162.5:3478', username: 'coturn', credential: 'coturn' },
    { urls: 'turn:81.71.162.5:3478?transport=tcp', username: 'coturn', credential: 'coturn' },
  ];
  const PEER_OPTIONS = { debug: 3, config: { iceServers: ICE_SERVERS } };

  function refreshDynamicText() {
    syncLabel.textContent = t('sync_' + currentSyncState);
    connLabel.textContent = t('conn_' + currentConnState);
  }

  function showPage(page) {
    [homePanel, waitPanel, connectingPanel, editorPanel].forEach(p => p.classList.add('hidden'));
    page.classList.remove('hidden');
  }

  function setSyncState(state) {
    currentSyncState = state;
    syncStatus.className = 'sync-status ' + state;
    syncDot.className = 'sync-dot ' + state;
    syncLabel.textContent = t('sync_' + state);
  }

  function cleanupPeer() {
    if (conn) { try { conn.close(); } catch (_) {} }
    if (peer) { try { peer.destroy(); } catch (_) {} }
    peer = null;
    conn = null;
    pendingRpcCallbacks = {};
  }

  function goHome() {
    cleanupPeer();
    disconnectedOverlay.classList.add('hidden');
    uploadDialog.classList.add('hidden');
    showPage(homePanel);
    btnSave.disabled = true;
    qrWrap.innerHTML = '';
    peerIdText.textContent = '';
    inputPeerId.value = '';
    lastSyncedContent = '';
    fileList = [];
    currentFileName = 'main.jsx';
    pendingUploadFiles = [];
    renderFileTree();
  }

  function onConnected() {
    currentConnState = 'connected';
    showPage(editorPanel);
    connIndicator.className = 'conn-indicator connected';
    connLabel.textContent = t('conn_connected');
    btnSave.disabled = false;
  }

  function onDisconnectedByRemote() {
    conn = null;
    currentConnState = 'disconnected';
    btnSave.disabled = true;
    connIndicator.className = 'conn-indicator disconnected';
    connLabel.textContent = t('conn_disconnected');
    disconnectedOverlay.classList.remove('hidden');
  }

  // ── File tree ──
  let collapsedDirs = {};

  function renderFileTree() {
    fileTree.innerHTML = '';
    if (fileList.length === 0) return;

    const title = document.createElement('div');
    title.className = 'file-tree-title';
    title.textContent = t('file_tree_title');
    fileTree.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'file-tree-list';
    renderTreeNodes(fileList, list, 0);
    fileTree.appendChild(list);

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'file-tree-upload-btn';
    uploadBtn.textContent = '+ ' + t('btn_upload');
    uploadBtn.addEventListener('click', () => fileUploadInput.click());
    fileTree.appendChild(uploadBtn);
  }

  function createDeleteBtn(node) {
    const btn = document.createElement('button');
    btn.className = 'file-tree-delete';
    btn.textContent = '×';
    btn.title = 'Delete';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isDir = node.type === 'directory';
      const msgKey = isDir ? 'confirm_delete_dir' : 'confirm_delete_file';
      const msg = t(msgKey).replace('{name}', node.name);
      if (!confirm(msg)) return;
      if (isDir && node.children) {
        const allFiles = [];
        const collect = (nodes) => {
          nodes.forEach(n => {
            if (n.type === 'file') allFiles.push(n.relativePath);
            else if (n.children) collect(n.children);
          });
        };
        collect(node.children);
        allFiles.forEach(f => removeFile(f));
      }
      removeFile(node.relativePath);
      if (!isDir && node.relativePath === currentFileName) {
        hideBinaryPreview();
        if (monacoEditor) bootMonaco('', 'main.jsx');
        currentFileName = 'main.jsx';
      }
    });
    return btn;
  }

  function renderTreeNodes(nodes, parentEl, depth) {
    nodes.forEach(node => {
      if (node.type === 'directory') {
        const isCollapsed = !!collapsedDirs[node.relativePath];
        const li = document.createElement('li');
        li.className = 'file-tree-dir';
        li.style.paddingLeft = (14 + depth * 16) + 'px';

        const toggle = document.createElement('span');
        toggle.className = 'file-tree-toggle' + (isCollapsed ? ' collapsed' : '');
        toggle.textContent = '▶';
        li.appendChild(toggle);

        const icon = document.createElement('span');
        icon.className = 'file-tree-icon';
        icon.textContent = isCollapsed ? '📁' : '📂';
        li.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'file-tree-name';
        name.textContent = node.name;
        li.appendChild(name);

        li.appendChild(createDeleteBtn(node));

        li.addEventListener('click', () => {
          collapsedDirs[node.relativePath] = !collapsedDirs[node.relativePath];
          renderFileTree();
        });
        parentEl.appendChild(li);

        if (!isCollapsed && node.children && node.children.length > 0) {
          renderTreeNodes(node.children, parentEl, depth + 1);
        }
      } else {
        const li = document.createElement('li');
        li.className = 'file-tree-item' + (node.relativePath === currentFileName ? ' active' : '');
        li.style.paddingLeft = (14 + depth * 16) + 'px';

        const icon = document.createElement('span');
        icon.className = 'file-tree-icon';
        icon.textContent = getFileIcon(node.name);
        li.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'file-tree-name';
        name.textContent = node.name;
        li.appendChild(name);

        if (node.name !== 'main.jsx') {
          li.appendChild(createDeleteBtn(node));
        }

        li.addEventListener('click', () => switchToFile(node.relativePath));
        parentEl.appendChild(li);
      }
    });
  }

  function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'jsx' || ext === 'js') return '📜';
    if (ext === 'json') return '📋';
    if (ext === 'css') return '🎨';
    if (ext === 'html' || ext === 'htm') return '🌐';
    if (ext === 'md' || ext === 'markdown') return '📝';
    if (['png','jpg','jpeg','gif','webp','svg','ico'].includes(ext)) return '🖼';
    return '📄';
  }

  function isBinaryFile(name) {
    const ext = (name || '').split('.').pop().toLowerCase();
    return ['png','jpg','jpeg','gif','webp','svg','ico','bmp','tiff','tif',
            'mp3','wav','aac','m4a','ogg','flac',
            'mp4','mov','avi','webm',
            'pdf','zip','gz','tar','ttf','otf','woff','woff2'].includes(ext);
  }

  function getMimeType(name) {
    const ext = (name || '').split('.').pop().toLowerCase();
    const map = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon',
      bmp: 'image/bmp', tiff: 'image/tiff', tif: 'image/tiff',
      mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
      m4a: 'audio/mp4', ogg: 'audio/ogg', flac: 'audio/flac',
      mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo', webm: 'video/webm',
    };
    return map[ext] || 'application/octet-stream';
  }

  function showBinaryPreview(base64, fileName) {
    editorRoot.style.display = 'none';
    let preview = document.getElementById('binary-preview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'binary-preview';
      preview.className = 'binary-preview';
      editorRoot.parentNode.appendChild(preview);
    }
    preview.innerHTML = '';
    preview.style.display = '';
    const mime = getMimeType(fileName);
    if (mime.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = 'data:' + mime + ';base64,' + base64;
      img.alt = fileName;
      preview.appendChild(img);
    } else if (mime.startsWith('audio/')) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = 'data:' + mime + ';base64,' + base64;
      preview.appendChild(audio);
    } else if (mime.startsWith('video/')) {
      const video = document.createElement('video');
      video.controls = true;
      video.src = 'data:' + mime + ';base64,' + base64;
      preview.appendChild(video);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'binary-preview-fallback';
      fallback.textContent = fileName;
      preview.appendChild(fallback);
    }
  }

  function hideBinaryPreview() {
    editorRoot.style.display = '';
    const preview = document.getElementById('binary-preview');
    if (preview) preview.style.display = 'none';
  }

  function switchToFile(relativePath) {
    if (relativePath === currentFileName) return;
    if (monacoEditor && currentSyncState === 'dirty') {
      sendSave();
    }
    currentFileName = relativePath;
    renderFileTree();
    requestFile(relativePath);
  }

  function requestFile(filePath) {
    if (!conn) return;
    const id = rpcId++;
    setSyncState('synced');
    pendingRpcCallbacks[id] = 'get_file';
    const encoding = isBinaryFile(filePath) ? 'base64' : 'utf8';
    conn.send({ id, method: 'get_file', params: { filePath, encoding } });
  }

  function requestFileList() {
    if (!conn) return;
    const id = rpcId++;
    pendingRpcCallbacks[id] = 'list_files';
    conn.send({ id, method: 'list_files' });
  }

  function removeFile(filePath) {
    if (!conn) return;
    const id = rpcId++;
    pendingRpcCallbacks[id] = 'remove_file';
    conn.send({ id, method: 'remove_file', params: { filePath } });
  }

  // ── Upload ──
  function isTextFile(name) {
    const ext = name.split('.').pop().toLowerCase();
    return ['js','jsx','ts','tsx','json','txt','md','markdown','csv','xml','html','htm','css','yaml','yml','svg'].includes(ext);
  }

  function openUploadDialog(files) {
    if (!files || files.length === 0) return;
    pendingUploadFiles = Array.from(files).map(f => ({
      file: f,
      savePath: f.name,
    }));
    renderUploadDialog();
    uploadDialog.classList.remove('hidden');
  }

  function renderUploadDialog() {
    uploadFileList.innerHTML = '';
    pendingUploadFiles.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'upload-file-row';

      const preview = document.createElement('div');
      preview.className = 'upload-file-preview';
      if (item.file.type && item.file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(item.file);
        preview.appendChild(img);
      } else {
        const icon = document.createElement('span');
        icon.className = 'upload-file-icon';
        icon.textContent = getFileIcon(item.file.name);
        preview.appendChild(icon);
      }
      row.appendChild(preview);

      const info = document.createElement('div');
      info.className = 'upload-file-info';

      const originalName = document.createElement('div');
      originalName.className = 'upload-file-original';
      originalName.textContent = item.file.name;
      const size = document.createElement('span');
      size.className = 'upload-file-size';
      size.textContent = formatSize(item.file.size);
      originalName.appendChild(size);
      info.appendChild(originalName);

      const label = document.createElement('label');
      label.className = 'upload-file-label';
      label.textContent = t('upload_save_as');
      info.appendChild(label);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'upload-file-path';
      input.value = item.savePath;
      input.addEventListener('input', (e) => {
        pendingUploadFiles[idx].savePath = e.target.value;
      });
      info.appendChild(input);

      row.appendChild(info);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'upload-file-remove';
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', () => {
        pendingUploadFiles.splice(idx, 1);
        if (pendingUploadFiles.length === 0) {
          uploadDialog.classList.add('hidden');
        } else {
          renderUploadDialog();
        }
      });
      row.appendChild(removeBtn);

      uploadFileList.appendChild(row);
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function executeUpload() {
    if (!conn) return;
    const items = pendingUploadFiles.slice();
    pendingUploadFiles = [];
    uploadDialog.classList.add('hidden');

    let remaining = items.length;
    items.forEach(item => {
      const reader = new FileReader();
      reader.onload = () => {
        const id = rpcId++;
        let content, encoding;
        if (isTextFile(item.savePath)) {
          content = reader.result;
          encoding = 'utf8';
        } else {
          const dataUrl = reader.result;
          content = dataUrl.split(',')[1] || '';
          encoding = 'base64';
        }
        pendingRpcCallbacks[id] = 'save_content';
        conn.send({ id, method: 'save_content', params: { content, fileName: item.savePath, encoding } });
        remaining--;
        if (remaining <= 0) {
          setTimeout(() => requestFileList(), 300);
        }
      };
      if (isTextFile(item.savePath)) {
        reader.readAsText(item.file);
      } else {
        reader.readAsDataURL(item.file);
      }
    });
  }

  fileUploadInput.addEventListener('change', () => {
    if (fileUploadInput.files.length > 0) {
      openUploadDialog(fileUploadInput.files);
    }
    fileUploadInput.value = '';
  });

  btnUploadCancel.addEventListener('click', () => {
    pendingUploadFiles = [];
    uploadDialog.classList.add('hidden');
  });

  btnUploadConfirm.addEventListener('click', executeUpload);

  // Drag and drop on editor body
  const editorBody = document.querySelector('.editor-body');
  if (editorBody) {
    let dragCounter = 0;
    editorBody.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      editorBody.classList.add('drag-over');
    });
    editorBody.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        editorBody.classList.remove('drag-over');
      }
    });
    editorBody.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    editorBody.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      editorBody.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        openUploadDialog(e.dataTransfer.files);
      }
    });
  }

  // ── Monaco ──
  function loadMonacoTypes() {
    return fetch('./jswidget.d.ts').then(r => r.text());
  }

  function getMonacoTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs';
  }

  function getMonacoLanguage(fileName) {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'jsx' || ext === 'tsx') return 'typescript';
    if (ext === 'js' || ext === 'ts') return 'typescript';
    if (ext === 'json') return 'json';
    if (ext === 'css') return 'css';
    if (ext === 'html' || ext === 'htm') return 'html';
    if (ext === 'md' || ext === 'markdown') return 'markdown';
    return 'plaintext';
  }

  function bootMonaco(initialValue, fileName) {
    lastSyncedContent = initialValue || '';
    const lang = getMonacoLanguage(fileName || currentFileName);
    if (monacoEditor) {
      const oldModel = monacoEditor.getModel();
      const newUri = monaco.Uri.parse('file:///' + (fileName || currentFileName));
      const newModel = monaco.editor.createModel(initialValue || '', lang, newUri);
      monacoEditor.setModel(newModel);
      if (oldModel) oldModel.dispose();
      setSyncState('synced');
      return;
    }
    const vsPath = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs';
    require.config({ paths: { vs: vsPath } });
    require(['vs/editor/editor.main'], () => {
      const widgetCompilerOptions = {
        allowNonTsExtensions: true,
        allowJs: true,
        strict: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        jsxFactory: 'JSWidget.createElement',
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        lib: ['es2020'],
        noLib: false,
        moduleDetection: monaco.languages.typescript.ModuleDetectionKind?.Force ?? 3,
      };
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions(widgetCompilerOptions);
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions(widgetCompilerOptions);
      loadMonacoTypes().then(dts => {
        monaco.languages.typescript.typescriptDefaults.addExtraLib(dts, 'file:///jswidget.d.ts');
      }).catch(() => {});

      const modelUri = monaco.Uri.parse('file:///' + (fileName || currentFileName));
      const model = monaco.editor.createModel(initialValue || '', lang, modelUri);
      monacoEditor = monaco.editor.create(editorRoot, {
        model,
        theme: getMonacoTheme(),
        automaticLayout: true,
        quickSuggestions: { other: true, comments: false, strings: true },
      });
      monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => sendSave());

      monacoEditor.onDidChangeModelContent((e) => {
        const current = monacoEditor.getValue();
        setSyncState(current === lastSyncedContent ? 'synced' : 'dirty');

        for (const change of e.changes) {
          const txt = change.text;
          if (txt === '"' || txt === "'" || txt === '""' || txt === "''") {
            setTimeout(() => {
              monacoEditor.trigger('quote', 'editor.action.triggerSuggest', {});
            }, 100);
            break;
          }
        }
      });

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (monacoEditor) {
          monaco.editor.setTheme(e.matches ? 'vs-dark' : 'vs');
        }
      });

      setSyncState('synced');
    });
  }

  function sendSave() {
    if (!conn || !monacoEditor) return;
    const id = rpcId++;
    const content = monacoEditor.getValue();
    pendingRpcCallbacks[id] = 'save_content';
    conn.send({ id, method: 'save_content', params: { content, fileName: currentFileName } });
  }

  btnSave.addEventListener('click', sendSave);

  function handleData(data) {
    if (!data || typeof data !== 'object') return;

    if (data.method === 'push_content' && data.params && typeof data.params.content === 'string') {
      currentFileName = data.params.fileName || 'main.jsx';
      bootMonaco(data.params.content, currentFileName);
      renderFileTree();
      onConnected();
    }

    if (data.method === 'push_file_list' && data.params && Array.isArray(data.params.files)) {
      fileList = data.params.files;
      renderFileTree();
    }

    if (data.method === 'update_file_list' && data.params && Array.isArray(data.params.files)) {
      fileList = data.params.files;
      renderFileTree();
    }

    if (data.id && pendingRpcCallbacks[data.id] === 'get_file' && data.result) {
      delete pendingRpcCallbacks[data.id];
      if (data.result.error) {
        console.error('get_file failed:', data.result.error);
        return;
      }
      const fn = data.result.fileName || currentFileName;
      currentFileName = fn;
      if (data.result.encoding === 'base64' || isBinaryFile(fn)) {
        showBinaryPreview(data.result.content, fn);
      } else {
        hideBinaryPreview();
        bootMonaco(data.result.content, fn);
      }
      renderFileTree();
    }

    if (data.id && pendingRpcCallbacks[data.id] === 'save_content' && data.result) {
      delete pendingRpcCallbacks[data.id];
      if (data.result.success) {
        lastSyncedContent = monacoEditor ? monacoEditor.getValue() : '';
        setSyncState('synced');
      } else {
        setSyncState('error');
      }
    }

    if (data.id && pendingRpcCallbacks[data.id] === 'remove_file' && data.result) {
      delete pendingRpcCallbacks[data.id];
      if (data.result.error) {
        console.error('remove_file failed:', data.result.error);
      }
      setTimeout(() => requestFileList(), 200);
    }

    if (data.id && pendingRpcCallbacks[data.id] === 'list_files' && data.result) {
      delete pendingRpcCallbacks[data.id];
      if (Array.isArray(data.result.files)) {
        fileList = data.result.files;
        renderFileTree();
      }
    }

    if (!data.id && data.result && typeof data.result === 'object' && 'success' in data.result) {
      if (data.result.success) {
        lastSyncedContent = monacoEditor ? monacoEditor.getValue() : '';
        setSyncState('synced');
      } else {
        setSyncState('error');
      }
    }
  }

  function attachConn(c) {
    conn = c;
    c.on('data', handleData);
    c.on('close', onDisconnectedByRemote);
    c.on('error', (e) => console.error('conn error', e));
  }

  btnConnect.addEventListener('click', () => {
    const id = inputPeerId.value.trim();
    if (!id) return;
    showPage(connectingPanel);
    peer = new Peer(PEER_OPTIONS);
    peer.on('open', () => {
      const c = peer.connect(id, { reliable: true });
      attachConn(c);
      c.on('open', () => {});
    });
    peer.on('error', (e) => {
      alert(t('alert_connect_fail') + (e && e.message));
      goHome();
    });
  });

  btnCreate.addEventListener('click', () => {
    showPage(waitPanel);
    peer = new Peer(PEER_OPTIONS);
    peer.on('open', (id) => {
      peerIdText.textContent = id;
      const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(id);
      const img = document.createElement('img');
      img.src = qrUrl;
      img.alt = 'Peer ID QR';
      qrWrap.innerHTML = '';
      qrWrap.appendChild(img);
    });
    peer.on('connection', (c) => {
      attachConn(c);
      c.on('open', () => {});
    });
    peer.on('error', (e) => {
      alert(t('alert_create_fail') + (e && e.message));
      goHome();
    });
  });

  btnCopyId.addEventListener('click', () => {
    const id = peerIdText.textContent;
    if (id && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      btnCopyId.textContent = t('btn_copied');
      setTimeout(() => { btnCopyId.textContent = t('btn_copy'); }, 1500);
    }
  });

  btnBackWait.addEventListener('click', goHome);
  btnBackConnecting.addEventListener('click', goHome);
  btnDisconnect.addEventListener('click', goHome);
  btnGoHome.addEventListener('click', goHome);

  const params = new URLSearchParams(window.location.search);
  const peerFromUrl = params.get('peer');
  if (peerFromUrl) {
    inputPeerId.value = peerFromUrl;
    btnConnect.click();
  }

  applyI18n();
})();
