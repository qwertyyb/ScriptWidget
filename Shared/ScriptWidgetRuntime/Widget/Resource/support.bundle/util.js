
class JSWidget {
    static createElement(tag, props, ...children) {
        return $element.createElement(tag, props, children);
    }

    /*
     short syntax for
     <>
         <text>1</text>
         <text>1</text>
     </>
     */
    static Fragment = "Fragment"
}

function $json(obj) {
    return JSON.stringify(obj)
}

function $type_of_object(obj) {
    return typeof obj
}

function __formatConsoleArg(arg) {
    if (arg === undefined) return "undefined";
    if (arg === null) return "null";
    if (arg instanceof Error) {
        return arg.stack || (arg.name ? arg.name + ": " + arg.message : String(arg));
    }
    const t = typeof arg;
    if (t === "object" || t === "function") {
        try {
            return $json(arg);
        } catch (e) {
            return String(arg);
        }
    }
    return String(arg);
}

function __formatConsoleArgs(args) {
    const parts = [];
    for (let i = 0; i < args.length; i++) {
        parts.push(__formatConsoleArg(args[i]));
    }
    return parts.join(" ");
}

function __wrapConsoleLevel(fn) {
    return function (...args) {
        fn(__formatConsoleArgs(args));
    };
}

$console = console = {
    log: __wrapConsoleLevel((s) => _consoleNative.log(s)),
    info: __wrapConsoleLevel((s) => _consoleNative.info(s)),
    warn: __wrapConsoleLevel((s) => _consoleNative.warn(s)),
    error: __wrapConsoleLevel((s) => _consoleNative.error(s)),
};

$file = {
    readString(path) {
        return _fileNative.readString(path);
    },
    writeString(path, content) {
        return _fileNative.writeStringFile(path, content);
    },
    remove(path) {
        return _fileNative.remove(path);
    },
    list(path) {
        return _fileNative.list(path);
    },
};
