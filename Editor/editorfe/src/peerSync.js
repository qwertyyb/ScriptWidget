/**
 * PeerJS session for JSWidget remote editing (multi-file).
 * Saves go through WKWebViewJavascriptBridge `method_saveFile`.
 */
import Peer from "peerjs";

let peer = null;
let conn = null;
let deps = null;
let onStateChange = null;

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "turn:81.71.162.5:3478", username: "coturn", credential: "coturn" },
  { urls: "turn:81.71.162.5:3478?transport=tcp", username: "coturn", credential: "coturn" },
];

const PEER_OPTIONS = {
  debug: 3,
  config: { iceServers: ICE_SERVERS },
};

function notifyState(state) {
  if (onStateChange) onStateChange(state);
}

export function setOnStateChange(cb) {
  onStateChange = cb;
}

export function setPeerDeps(d) {
  deps = d;
}

function log(msg) {
  console.log('[peerSync]', msg);
  if (deps && deps.log) deps.log(msg);
}

export function disconnectPeer() {
  if (conn) {
    try { conn.close(); } catch (_) {}
  }
  if (peer) {
    try { peer.destroy(); } catch (_) {}
  }
  peer = null;
  conn = null;
  notifyState('idle');
}

function pushFileList() {
  if (!conn || !deps) return;
  const bridge = deps.getBridge ? deps.getBridge() : null;
  if (!bridge) return;
  bridge.callHandler('method_listFiles', {}, function (response) {
    if (response && response.result === 'ok' && Array.isArray(response.files)) {
      try {
        conn.send({ method: "push_file_list", params: { files: response.files } });
      } catch (e) {
        log("push_file_list error: " + e.message);
      }
    }
  });
}

export function notifyFileListUpdate(files) {
  if (!conn) return;
  try {
    conn.send({ method: "update_file_list", params: { files } });
  } catch (e) {
    log("update_file_list error: " + e.message);
  }
}

function handleGetFile(data, c) {
  const bridge = deps && deps.getBridge ? deps.getBridge() : null;
  if (!bridge) {
    try { c.send({ id: data.id, result: { error: "no bridge" } }); } catch (_) {}
    return;
  }
  const filePath = data.params && data.params.filePath;
  if (!filePath) {
    try { c.send({ id: data.id, result: { error: "missing filePath" } }); } catch (_) {}
    return;
  }
  const encoding = data.params && data.params.encoding;
  const params = { filePath };
  if (encoding) params.encoding = encoding;
  bridge.callHandler('method_getFile', params, function (response) {
    if (response && response.result === 'ok') {
      try {
        c.send({ id: data.id, result: { content: response.content, fileName: filePath, encoding: response.encoding } });
      } catch (_) {}
    } else {
      try {
        c.send({ id: data.id, result: { error: (response && response.message) || "read failed" } });
      } catch (_) {}
    }
  });
}

function handleSaveContent(data, c) {
  const content = data.params.content;
  const fileName = data.params.fileName || (deps.getFileName ? deps.getFileName() : "main.jsx");
  const encoding = data.params.encoding || 'utf8';
  if (!deps) {
    log("save_content: no deps");
    return;
  }
  if (encoding === 'utf8' && fileName === (deps.getFileName ? deps.getFileName() : "main.jsx")) {
    deps.setContent(content);
  }
  if (deps.saveFile) {
    deps.saveFile(fileName, content, encoding);
  }
  try {
    c.send({ id: data.id, result: { success: true } });
  } catch (_) {}
}

function handleListFiles(data, c) {
  const bridge = deps && deps.getBridge ? deps.getBridge() : null;
  if (!bridge) {
    try { c.send({ id: data.id, result: { error: "no bridge" } }); } catch (_) {}
    return;
  }
  bridge.callHandler('method_listFiles', {}, function (response) {
    if (response && response.result === 'ok' && Array.isArray(response.files)) {
      try {
        c.send({ id: data.id, result: { files: response.files } });
      } catch (_) {}
    } else {
      try {
        c.send({ id: data.id, result: { error: "list failed" } });
      } catch (_) {}
    }
  });
}

function handleRemoveFile(data, c) {
  const bridge = deps && deps.getBridge ? deps.getBridge() : null;
  if (!bridge) {
    try { c.send({ id: data.id, result: { error: "no bridge" } }); } catch (_) {}
    return;
  }
  const filePath = data.params && data.params.filePath;
  if (!filePath) {
    try { c.send({ id: data.id, result: { error: "missing filePath" } }); } catch (_) {}
    return;
  }
  bridge.callHandler('method_removeFile', { filePath }, function (response) {
    if (response && response.result === 'ok') {
      try { c.send({ id: data.id, result: { success: true } }); } catch (_) {}
    } else {
      try { c.send({ id: data.id, result: { error: (response && response.message) || "delete failed" } }); } catch (_) {}
    }
  });
}

function attachConn(c) {
  conn = c;
  c.on("data", (data) => {
    log("received data: " + JSON.stringify(data).slice(0, 200));
    if (!data || typeof data !== "object") return;
    if (data.method === "save_content" && data.params && typeof data.params.content === "string") {
      handleSaveContent(data, c);
    }
    if (data.method === "get_file" && data.params) {
      handleGetFile(data, c);
    }
    if (data.method === "list_files") {
      handleListFiles(data, c);
    }
    if (data.method === "remove_file" && data.params) {
      handleRemoveFile(data, c);
    }
  });
  c.on("close", () => {
    log("connection closed by remote");
    conn = null;
    notifyState('disconnected');
  });
  c.on("error", (err) => {
    log("connection error: " + (err && err.message));
  });
}

function pushCurrentScript() {
  if (!conn || !deps) return;
  const content = deps.getContent();
  const fileName = deps.getFileName ? deps.getFileName() : "main.jsx";
  log("pushing script to remote, length=" + content.length);
  try {
    conn.send({ method: "push_content", params: { content, fileName } });
  } catch (e) {
    log("push error: " + e.message);
  }
}

export function startPeerHost(onPeerId) {
  disconnectPeer();
  log("starting peer host...");
  notifyState('connecting');
  peer = new Peer(PEER_OPTIONS);
  peer.on("open", (id) => {
    log("host peer open, id=" + id);
    notifyState('hosting');
    if (onPeerId) onPeerId(id);
  });
  peer.on("connection", (c) => {
    log("incoming connection from remote");
    attachConn(c);
    c.on("open", () => {
      log("connection open, pushing script and file list");
      notifyState('connected');
      pushCurrentScript();
      pushFileList();
    });
  });
  peer.on("error", (err) => {
    log("peer error: " + (err && err.message));
    notifyState('error');
  });
}

export function connectPeerTo(remotePeerId, onOpen, onError) {
  disconnectPeer();
  log("connecting to remote peer: " + remotePeerId);
  notifyState('connecting');
  peer = new Peer(PEER_OPTIONS);
  peer.on("open", () => {
    log("local peer open, now connecting to " + remotePeerId);
    const c = peer.connect(remotePeerId, { reliable: true });
    attachConn(c);
    c.on("open", () => {
      log("connected to remote peer, pushing script and file list");
      notifyState('connected');
      pushCurrentScript();
      pushFileList();
      if (onOpen) onOpen();
    });
    c.on("error", (err) => {
      log("connection error: " + (err && err.message));
      if (onError) onError(err);
    });
  });
  peer.on("error", (err) => {
    log("peer error: " + (err && err.message));
    notifyState('error');
    if (onError) onError(err);
  });
}
