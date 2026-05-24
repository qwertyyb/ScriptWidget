import { useCodeMirror, EditorState, EditorView } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from './darkTheme';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './App.css';
import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { scriptWidgetCompletions } from './autoCompletion';
import { autocompletion } from "@codemirror/autocomplete";
import {
  setPeerDeps,
  disconnectPeer,
  startPeerHost,
  connectPeerTo,
  setOnStateChange,
  notifyFileListUpdate,
} from './peerSync';

export default function App() {
  const [count, setCount] = useState(0);
  const editor = useRef();
  const [readonly, setReadonly] = useState(false);
  const readOnlyRef = useRef(false);
  const viewRef = useRef(null);
  const fileNameRef = useRef('main.jsx');
  const bridgeRef = useRef(null);
  const saveTimerRef = useRef(null);
  const pendingSaveRef = useRef(null);

  const [fileTree, setFileTree] = useState([]);
  const [currentFile, setCurrentFile] = useState('main.jsx');
  const [binaryPreview, setBinaryPreview] = useState(null);

  const [peerEnabled, setPeerEnabled] = useState(true);
  const [peerState, setPeerState] = useState('idle');
  const [peerIdText, setPeerIdText] = useState('');
  const [connectInput, setConnectInput] = useState('');
  const [showConnectInput, setShowConnectInput] = useState(false);
  const [showPeerMenu, setShowPeerMenu] = useState(false);
  const bannerRef = useRef(null);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    readOnlyRef.current = readonly;
  }, [readonly]);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) {
      setBannerHeight(0);
      return;
    }
    setBannerHeight(el.offsetHeight);
    const ro = new ResizeObserver(() => {
      setBannerHeight(el.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [peerState, peerEnabled, showPeerMenu, showConnectInput]);

  const flatFiles = useMemo(() => {
    const result = [];
    const walk = (nodes) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          result.push(node);
        } else if (node.children) {
          walk(node.children);
        }
      }
    };
    walk(fileTree);
    return result;
  }, [fileTree]);

  const isDarkTheme = () => {
    const metas = document.getElementsByTagName("META");
    const meta = metas.length > 1 ? metas[1].content : '';
    return meta.includes("theme:dark") === true;
  }

  const getContent = useCallback(() => {
    const v = viewRef.current;
    if (!v) return '';
    return v.state.doc.toString();
  }, []);

  const setContent = useCallback((text) => {
    const v = viewRef.current;
    if (!v) return;
    const tr = v.state.update({ changes: { from: 0, to: v.state.doc.length, insert: text } });
    v.dispatch(tr);
  }, []);

  const insertContent = useCallback((text) => {
    const v = viewRef.current;
    if (!v) return;
    const start = v.state.selection.main.from;
    v.dispatch(v.state.update({ changes: { from: start, insert: text } }));
    v.dispatch(v.state.update({ selection: { anchor: start + text.length } }));
  }, []);

  const formatCode = useCallback(() => {
    const v = viewRef.current;
    if (!v) return;
    const code = v.state.doc.toString();
    const formatted = prettier.format(code, {
      parser: "babel",
      plugins: [parserBabel],
    });
    const tr = v.state.update({ changes: { from: 0, to: v.state.doc.length, insert: formatted } });
    v.dispatch(tr);
  }, []);

  const isBinaryFile = useCallback((name) => {
    const ext = (name || '').split('.').pop().toLowerCase();
    return ['png','jpg','jpeg','gif','webp','svg','ico','bmp','tiff','tif',
            'mp3','wav','aac','m4a','ogg','flac',
            'mp4','mov','avi','webm',
            'pdf','zip','gz','tar','ttf','otf','woff','woff2'].includes(ext);
  }, []);

  const getMimeType = useCallback((name) => {
    const ext = (name || '').split('.').pop().toLowerCase();
    const map = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon',
      bmp: 'image/bmp', tiff: 'image/tiff', tif: 'image/tiff',
      mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
      m4a: 'audio/mp4', ogg: 'audio/ogg', flac: 'audio/flac',
      mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo', webm: 'video/webm',
      pdf: 'application/pdf',
    };
    return map[ext] || 'application/octet-stream';
  }, []);

  const saveFile = useCallback((filePath, content, encoding) => {
    const bridge = bridgeRef.current;
    if (!bridge) return;
    bridge.callHandler('method_saveFile', {
      filePath: filePath,
      content: content,
      encoding: encoding || 'utf8',
    }, function (response) {
      if (response && response.result !== 'ok') {
        console.log('method_saveFile failed:', response.message);
      }
    });
  }, []);

  const switchFile = useCallback((relativePath) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      const content = getContent();
      const fileName = fileNameRef.current;
      if (pendingSaveRef.current !== content) {
        pendingSaveRef.current = content;
        saveFile(fileName, content);
      }
    }
    fileNameRef.current = relativePath;
    setCurrentFile(relativePath);
    pendingSaveRef.current = null;
    const bridge = bridgeRef.current;
    if (!bridge) return;
    const binary = isBinaryFile(relativePath);
    const encoding = binary ? 'base64' : 'utf8';
    bridge.callHandler('method_getFile', { filePath: relativePath, encoding }, function (response) {
      if (response && response.result === 'ok' && response.content !== undefined) {
        if (binary) {
          const mime = getMimeType(relativePath);
          setBinaryPreview({ content: response.content, mime, name: relativePath });
        } else {
          setBinaryPreview(null);
          setContent(response.content);
          pendingSaveRef.current = response.content;
        }
      }
    });
  }, [getContent, setContent, saveFile, isBinaryFile, getMimeType]);

  const debounceSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      const content = getContent();
      const fileName = fileNameRef.current;
      if (pendingSaveRef.current === content) return;
      pendingSaveRef.current = content;
      saveFile(fileName, content);
    }, 300);
  }, [getContent, saveFile]);

  const handleStartHost = useCallback(() => {
    startPeerHost((peerId) => {
      setPeerIdText(peerId || '');
    });
  }, []);

  const handleConnectTo = useCallback(() => {
    const trimmed = connectInput.trim();
    if (!trimmed) return;
    setShowConnectInput(false);
    setConnectInput('');
    connectPeerTo(trimmed, () => {}, () => {});
  }, [connectInput]);

  const handleDisconnect = useCallback(() => {
    disconnectPeer();
    setPeerIdText('');
  }, []);

  useEffect(() => {
    setOnStateChange((state) => {
      if (state === 'idle' || state === 'disconnected' || state === 'error') {
        setPeerState('idle');
        setReadonly(false);
        setPeerIdText('');
      } else if (state === 'connecting') {
        setPeerState('connecting');
      } else if (state === 'hosting') {
        setPeerState('hosting');
        setReadonly(true);
      } else if (state === 'connected') {
        setPeerState('connected');
        setReadonly(true);
      }
    });
  }, []);

  const debounceSaveRef = useRef(debounceSave);
  useEffect(() => {
    debounceSaveRef.current = debounceSave;
  }, [debounceSave]);

  const extensions = useMemo(() => {
    const items = [
      javascript({ jsx: true }),
      autocompletion({ override: [scriptWidgetCompletions] }),
      EditorView.lineWrapping,
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          viewRef.current = v.view;
          debounceSaveRef.current();
        }
      }),
      EditorState.readOnly.of(readonly),
    ];
    if (isDarkTheme()) {
      items.push(oneDark);
    }
    return items;
  }, [readonly]);

  const { setContainer, view } = useCodeMirror({
    container: editor.current,
    extensions,
    value: '',
  });

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const isBridgeValid = () => {
    if (window.webkit) return true;
    return false;
  }

  const setupWKWebViewJavascriptBridge = (callback) => {
    if (window.WKWebViewJavascriptBridge) {
      // eslint-disable-next-line no-undef
      return callback(WKWebViewJavascriptBridge);
    }
    if (window.WKWVJBCallbacks) {
      return window.WKWVJBCallbacks.push(callback);
    }
    if (window.webkit) {
      window.WKWVJBCallbacks = [callback];
      window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null)
    }
    console.log('Can not create valid bridge')
  }

  const initialize = () => {
    console.log('initialize');

    setupWKWebViewJavascriptBridge(function (bridge) {
      bridgeRef.current = bridge;

      setPeerDeps({
        getBridge: () => bridgeRef.current,
        getContent,
        setContent,
        saveFile,
        getFileName: () => fileNameRef.current,
        log: (t) => console.log('[peer]', t),
      });

      bridge.registerHandler('editor_insertValue', function (data, responseCallback) {
        if (readOnlyRef.current) {
          responseCallback({ result: 'failed', message: 'readonly' })
          return;
        }
        insertContent(data.value);
        responseCallback({ result: 'ok' })
      })
      bridge.registerHandler('editor_setReadonly', function (data, responseCallback) {
        let value = data.readonly;
        if (value === undefined) { value = false; }
        setReadonly(value)
        responseCallback({
          result: 'ok',
          'readonly': value
        });
      })
      bridge.registerHandler('editor_formatCode', function (data, responseCallback) {
        formatCode()
        responseCallback({
          result: 'ok',
        });
      })
      bridge.registerHandler('editor_loadFile', function (data, responseCallback) {
        const fileName = data.fileName || 'main.jsx';
        fileNameRef.current = fileName;
        setCurrentFile(fileName);
        pendingSaveRef.current = null;
        const enc = isBinaryFile(fileName) ? 'base64' : 'utf8';
        bridge.callHandler('method_getFile', { filePath: fileName, encoding: enc }, function (response) {
          if (response && response.result === 'ok' && response.content !== undefined) {
            setContent(response.content);
            pendingSaveRef.current = response.content;
          }
        });
        responseCallback({ result: 'ok' });
      })
      bridge.registerHandler('editor_updateFiles', function (data, responseCallback) {
        if (data && Array.isArray(data.files)) {
          setFileTree(data.files);
          notifyFileListUpdate(data.files);
        }
        if (responseCallback) responseCallback({ result: 'ok' });
      })
      bridge.registerHandler('editor_setPeerEnabled', function (data, responseCallback) {
        const enabled = data.enabled !== false;
        setPeerEnabled(enabled);
        if (!enabled) {
          disconnectPeer();
          setShowPeerMenu(false);
          setShowConnectInput(false);
          setPeerIdText('');
        }
        responseCallback({ result: 'ok', enabled });
      })

      bridge.callHandler('method_listFiles', {}, function (response) {
        if (response && response.result === 'ok' && Array.isArray(response.files)) {
          setFileTree(response.files);
        }
      });

      const initEnc = isBinaryFile(fileNameRef.current) ? 'base64' : 'utf8';
      bridge.callHandler('method_getFile', { filePath: fileNameRef.current, encoding: initEnc }, function (response) {
        if (response && response.result === 'ok' && response.content !== undefined) {
          setContent(response.content);
          pendingSaveRef.current = response.content;
        }
      });

      bridge.callHandler('event_editorReady', {}, function (response) { })
    })
  }

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current);
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContainer]);

  const renderPeerBanner = () => {
    if (!peerEnabled || peerState === 'idle') return null;

    if (peerState === 'connecting') {
      return (
        <div className="peer-banner">
          <span className="status-text">Connecting…</span>
        </div>
      );
    }
    if (peerState === 'hosting') {
      const editorUrl = `https://qwertyyb.github.io/JSWidget/editor/index.html?peer=${encodeURIComponent(peerIdText)}`;
      return (
        <div className="peer-panel">
          <div className="peer-panel-header">
            <span className="status-text">Waiting for PC…</span>
            <button className="btn-disconnect" onClick={handleDisconnect}>Stop</button>
          </div>
          <div className="peer-panel-hint">Open this link on your computer:</div>
          <div className="peer-panel-url-row">
            <span className="peer-panel-url">{editorUrl}</span>
            <button className="btn-action" onClick={() => {
              if (navigator.clipboard) navigator.clipboard.writeText(editorUrl);
            }}>Copy</button>
          </div>
          <div className="peer-panel-hint" style={{ marginTop: 6 }}>Peer ID:</div>
          <div className="peer-panel-url-row">
            <span className="peer-panel-url">{peerIdText}</span>
            <button className="btn-action" onClick={() => {
              if (navigator.clipboard) navigator.clipboard.writeText(peerIdText);
            }}>Copy</button>
          </div>
        </div>
      );
    }
    return (
      <div className="peer-banner">
        <span className="status-text">Remote editing active</span>
        <button className="btn-disconnect" onClick={handleDisconnect}>Disconnect</button>
      </div>
    );
  };

  const renderPeerControls = () => {
    if (!peerEnabled || peerState !== 'idle') return null;

    if (showConnectInput) {
      return (
        <div className="peer-banner disconnected">
          <input
            type="text"
            value={connectInput}
            onChange={e => setConnectInput(e.target.value)}
            placeholder="Paste Peer ID"
            style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: 'none', fontSize: 13 }}
            autoFocus
          />
          <button className="btn-connect" onClick={handleConnectTo}>Connect</button>
          <button className="btn-action" onClick={() => setShowConnectInput(false)}>Cancel</button>
        </div>
      );
    }

    if (showPeerMenu) {
      return (
        <div className="peer-banner disconnected">
          <span className="status-text">Remote Edit</span>
          <button className="btn-connect" onClick={() => { setShowPeerMenu(false); handleStartHost(); }}>Wait for PC</button>
          <button className="btn-action" onClick={() => { setShowPeerMenu(false); setShowConnectInput(true); }}>Enter PC ID</button>
          <button className="btn-disconnect" onClick={() => setShowPeerMenu(false)}>Cancel</button>
        </div>
      );
    }
    return null;
  };

  const bannerContent = renderPeerBanner() || renderPeerControls();

  if (isBridgeValid()) {
    return (
      <div className="editor-wrapper">
        {bannerContent && (
          <div ref={bannerRef} className="peer-fixed-wrapper">
            {bannerContent}
          </div>
        )}
        {bannerHeight > 0 && <div style={{ height: bannerHeight, flexShrink: 0 }} />}
        {flatFiles.length > 1 && (
          <div className="file-tabs">
            {flatFiles.map(f => (
              <button
                key={f.relativePath}
                className={'file-tab' + (currentFile === f.relativePath ? ' active' : '')}
                onClick={() => switchFile(f.relativePath)}
              >{f.relativePath}</button>
            ))}
          </div>
        )}
        <div className='editor' ref={editor} style={binaryPreview ? { display: 'none' } : undefined} />
        {binaryPreview && (
          <div className="binary-preview">
            {binaryPreview.mime.startsWith('image/') && (
              <img src={`data:${binaryPreview.mime};base64,${binaryPreview.content}`} alt={binaryPreview.name} />
            )}
            {binaryPreview.mime.startsWith('audio/') && (
              <audio controls src={`data:${binaryPreview.mime};base64,${binaryPreview.content}`} />
            )}
            {binaryPreview.mime.startsWith('video/') && (
              <video controls src={`data:${binaryPreview.mime};base64,${binaryPreview.content}`} />
            )}
            {!binaryPreview.mime.startsWith('image/') && !binaryPreview.mime.startsWith('audio/') && !binaryPreview.mime.startsWith('video/') && (
              <div className="binary-preview-fallback">{binaryPreview.name}</div>
            )}
          </div>
        )}
        {peerEnabled && peerState === 'idle' && !showPeerMenu && !showConnectInput && (
          <button
            className="fab-remote"
            onClick={() => setShowPeerMenu(true)}
            title="Remote editing"
          >⇄</button>
        )}
      </div>
    );
  } else {
    return <div className='app'>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}> Click me </button>
      <button onClick={() => setContent(`count = ${count}`)}> Set Content </button>
      <button onClick={() => setReadonly(true)}> Set Readonly </button>
      <button onClick={() => insertContent('</')}> insert content </button>
      <button onClick={() => formatCode()}> format </button>
      <div className='editor' ref={editor} />
    </div>
  }
}
