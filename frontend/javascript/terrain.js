// This code implements the `-sMODULARIZE` settings by taking the generated
// JS program code (INNER_JS_CODE) and wrapping it in a factory function.

// Single threaded MINIMAL_RUNTIME programs do not need access to
// document.currentScript, so a simple export declaration is enough.
var createModule = (() => {
  // When MODULARIZE this JS may be executed later,
  // after document.currentScript is gone, so we save it.
  // In EXPORT_ES6 mode we can just use 'import.meta.url'.
  var _scriptName = globalThis.document?.currentScript?.src;
  return async function(moduleArg = {}) {
    var moduleRtn;

(function() {
  function a(c) {
    c = c.split("-")[0];
    for (c = c.split(".").slice(0, 3); 3 > c.length;) {
      c.push("00");
    }
    c = c.map(d => d.padStart(2, "0"));
    return c.join("");
  }
  var b = "undefined" !== typeof process && process.Db?.node ? a(process.Db.node) : 2147483647;
  if (2147483647 > b) {
    throw Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
  }
  if (2147483647 > b) {
    throw Error(`This emscripten-generated code requires node v${"214748.36.47"} (detected v${[b / 10000 | 0, (b / 100 | 0) % 100, b % 100].join(".")})`);
  }
  b = "undefined" !== typeof navigator && navigator.userAgent?.includes("Safari/") && navigator.userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/) ? a(navigator.userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/)[1]) : 2147483647;
  if (150000 > b) {
    throw Error(`This emscripten-generated code requires Safari v${"15.0.0"} (detected v${b})`);
  }
  b = "undefined" !== typeof navigator && navigator.userAgent?.match(/Firefox\/(\d+(?:\.\d+)?)/) ? parseFloat(navigator.userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/)[1]) : 2147483647;
  if (79 > b) {
    throw Error(`This emscripten-generated code requires Firefox v79 (detected v${b})`);
  }
  b = "undefined" !== typeof navigator && navigator.userAgent?.match(/Chrome\/(\d+(?:\.\d+)?)/) ? parseFloat(navigator.userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/)[1]) : 2147483647;
  if (85 > b) {
    throw Error(`This emscripten-generated code requires Chrome v85 (detected v${b})`);
  }
})();
var n = moduleArg, aa = "", ba;
try {
  aa = (new URL(".", _scriptName)).href;
} catch {
}
if (!globalThis.window && !globalThis.WorkerGlobalScope) {
  throw Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
}
ba = async a => {
  q(!ca(a), "readAsync does not work with file:// URLs");
  a = await fetch(a, {credentials:"same-origin"});
  if (a.ok) {
    return a.arrayBuffer();
  }
  throw Error(a.status + " : " + a.url);
};
var da = console.log.bind(console), r = console.error.bind(console);
q(!0, "worker environment detected but not enabled at build time.  Add `worker` to `-sENVIRONMENT` to enable.");
q(!0, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");
q(!0, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
globalThis.WebAssembly || r("no native wasm support detected");
var ea = !1;
function q(a, b) {
  a || u("Assertion failed" + (b ? ": " + b : ""));
}
var ca = a => a.startsWith("file://");
function fa() {
  if (!ea) {
    var a = ha();
    0 == a && (a += 4);
    var b = w[a >> 2], c = w[a + 4 >> 2];
    34821223 == b && 2310721022 == c || u(`Stack overflow! Stack cookie has been overwritten at ${ia(a)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ia(c)} ${ia(b)}`);
    1668509029 != w[0] && u("Runtime error: The application has corrupted its heap memory area (address zero)!");
  }
}
var ja = new Int16Array(1), ka = new Int8Array(ja.buffer);
ja[0] = 25459;
115 === ka[0] && 99 === ka[1] || u("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
function x(a) {
  return () => q(!1, `call to '${a}' via reference taken before Wasm module initialization`);
}
function y(a) {
  Object.getOwnPropertyDescriptor(n, a) && u(`\`Module.${a}\` was supplied but \`${a}\` not included in INCOMING_MODULE_JS_API`);
}
function la(a) {
  Object.getOwnPropertyDescriptor(n, a) || Object.defineProperty(n, a, {configurable:!0, get() {
    var b = `'${a}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    "FS_createPath" !== a && "FS_createDataFile" !== a && "FS_createPreloadedFile" !== a && "FS_preloadFile" !== a && "FS_unlink" !== a && "addRunDependency" !== a && "FS_createLazyFile" !== a && "FS_createDevice" !== a && "removeRunDependency" !== a || (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
    u(b);
  }});
}
var ma, na, A, C, E, oa, G, w, pa, qa, ra, sa, ta = !1;
function ua() {
  var a = va.buffer;
  A = new Int8Array(a);
  E = new Int16Array(a);
  n.HEAPU8 = C = new Uint8Array(a);
  oa = new Uint16Array(a);
  G = new Int32Array(a);
  w = new Uint32Array(a);
  pa = new Float32Array(a);
  qa = new Float64Array(a);
  ra = new BigInt64Array(a);
  sa = new BigUint64Array(a);
}
q(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set, "JS engine does not provide full typed array support");
function u(a) {
  a = "Aborted(" + a + ")";
  r(a);
  ea = !0;
  a = new WebAssembly.RuntimeError(a);
  na?.(a);
  throw a;
}
function wa(a, b) {
  return (...c) => {
    q(ta, `native function \`${a}\` called before runtime initialization`);
    var d = xa[a];
    q(d, `exported native function \`${a}\` not found`);
    q(c.length <= b, `native function \`${a}\` called with ${c.length} args but expects ${b}`);
    return d(...c);
  };
}
var ya;
async function za(a) {
  try {
    var b = await ba(a);
    return new Uint8Array(b);
  } catch {
  }
  throw "both async and sync fetching of the wasm failed";
}
async function Aa(a, b) {
  try {
    var c = await za(a);
    return await WebAssembly.instantiate(c, b);
  } catch (d) {
    r(`failed to asynchronously prepare wasm: ${d}`), ca(a) && r(`warning: Loading from a file URI (${a}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`), u(d);
  }
}
async function Ba(a) {
  var b = ya;
  try {
    var c = fetch(b, {credentials:"same-origin"});
    return await WebAssembly.instantiateStreaming(c, a);
  } catch (d) {
    r(`wasm streaming compile failed: ${d}`), r("falling back to ArrayBuffer instantiation");
  }
  return Aa(b, a);
}
class Ca {
  name="ExitStatus";
  constructor(a) {
    this.message = `Program terminated with exit(${a})`;
    this.status = a;
  }
}
var ia = a => {
  q("number" === typeof a, `ptrToString expects a number, got ${typeof a}`);
  return "0x" + (a >>> 0).toString(16).padStart(8, "0");
}, Da = a => {
  Da.Ea || (Da.Ea = {});
  Da.Ea[a] || (Da.Ea[a] = 1, r(a));
};
class Ea {
  constructor(a) {
    this.m = a - 24;
  }
}
var Fa = 0, I = () => {
  q(void 0 != Ga);
  var a = G[+Ga >> 2];
  Ga += 4;
  return a;
}, Ha = (a, b) => {
  for (var c = 0, d = a.length - 1; 0 <= d; d--) {
    var e = a[d];
    "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
  }
  if (b) {
    for (; c; c--) {
      a.unshift("..");
    }
  }
  return a;
}, Ia = a => {
  var b = "/" === a.charAt(0), c = "/" === a.slice(-1);
  (a = Ha(a.split("/").filter(d => !!d), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}, Ja = a => {
  var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
  a = b[0];
  b = b[1];
  if (!a && !b) {
    return ".";
  }
  b &&= b.slice(0, -1);
  return a + b;
}, Ka = () => a => crypto.getRandomValues(a), La = a => {
  (La = Ka())(a);
}, Ma = (...a) => {
  for (var b = "", c = !1, d = a.length - 1; -1 <= d && !c; d--) {
    c = 0 <= d ? a[d] : "/";
    if ("string" != typeof c) {
      throw new TypeError("Arguments to path.resolve must be strings");
    }
    if (!c) {
      return "";
    }
    b = c + "/" + b;
    c = "/" === c.charAt(0);
  }
  b = Ha(b.split("/").filter(e => !!e), !c).join("/");
  return (c ? "/" : "") + b || ".";
}, Na = globalThis.TextDecoder && new TextDecoder(), Oa = (a, b, c, d) => {
  c = b + c;
  if (d) {
    return c;
  }
  for (; a[b] && !(b >= c);) {
    ++b;
  }
  return b;
}, Pa = (a, b = 0, c, d) => {
  c = Oa(a, b, c, d);
  if (16 < c - b && a.buffer && Na) {
    return Na.decode(a.subarray(b, c));
  }
  for (d = ""; b < c;) {
    var e = a[b++];
    if (e & 128) {
      var f = a[b++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | f);
      } else {
        var g = a[b++] & 63;
        224 == (e & 240) ? e = (e & 15) << 12 | f << 6 | g : (240 != (e & 248) && Da("Invalid UTF-8 leading byte " + ia(e) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), e = (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63);
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}, Qa = [], Ra = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
  }
  return b;
}, Sa = (a, b, c, d) => {
  q("string" === typeof a, `stringToUTF8Array expects a string (got ${typeof a})`);
  if (!(0 < d)) {
    return 0;
  }
  var e = c;
  d = c + d - 1;
  for (var f = 0; f < a.length; ++f) {
    var g = a.codePointAt(f);
    if (127 >= g) {
      if (c >= d) {
        break;
      }
      b[c++] = g;
    } else if (2047 >= g) {
      if (c + 1 >= d) {
        break;
      }
      b[c++] = 192 | g >> 6;
      b[c++] = 128 | g & 63;
    } else if (65535 >= g) {
      if (c + 2 >= d) {
        break;
      }
      b[c++] = 224 | g >> 12;
      b[c++] = 128 | g >> 6 & 63;
      b[c++] = 128 | g & 63;
    } else {
      if (c + 3 >= d) {
        break;
      }
      1114111 < g && Da("Invalid Unicode code point " + ia(g) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
      b[c++] = 240 | g >> 18;
      b[c++] = 128 | g >> 12 & 63;
      b[c++] = 128 | g >> 6 & 63;
      b[c++] = 128 | g & 63;
      f++;
    }
  }
  b[c] = 0;
  return c - e;
}, Ta = a => {
  var b = Array(Ra(a) + 1);
  a = Sa(a, b, 0, b.length);
  b.length = a;
  return b;
}, Ua = [];
function Va(a, b) {
  Ua[a] = {input:[], output:[], T:b};
  Wa(a, Xa);
}
var Xa = {open(a) {
  var b = Ua[a.node.ra];
  if (!b) {
    throw new J(43);
  }
  a.s = b;
  a.seekable = !1;
}, close(a) {
  a.s.T.ka(a.s);
}, ka(a) {
  a.s.T.ka(a.s);
}, read(a, b, c, d) {
  if (!a.s || !a.s.T.Ka) {
    throw new J(60);
  }
  for (var e = 0, f = 0; f < d; f++) {
    try {
      var g = a.s.T.Ka(a.s);
    } catch (k) {
      throw new J(29);
    }
    if (void 0 === g && 0 === e) {
      throw new J(6);
    }
    if (null === g || void 0 === g) {
      break;
    }
    e++;
    b[c + f] = g;
  }
  e && (a.node.X = Date.now());
  return e;
}, write(a, b, c, d) {
  if (!a.s || !a.s.T.Ba) {
    throw new J(60);
  }
  try {
    for (var e = 0; e < d; e++) {
      a.s.T.Ba(a.s, b[c + e]);
    }
  } catch (f) {
    throw new J(29);
  }
  d && (a.node.K = a.node.G = Date.now());
  return e;
}}, Ya = {Ka() {
  a: {
    if (!Qa.length) {
      var a = null;
      globalThis.window?.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
      if (!a) {
        a = null;
        break a;
      }
      Qa = Ta(a);
    }
    a = Qa.shift();
  }
  return a;
}, Ba(a, b) {
  null === b || 10 === b ? (da(Pa(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ka(a) {
  0 < a.output?.length && (da(Pa(a.output)), a.output = []);
}, lb() {
  return {Hb:25856, Jb:5, Gb:191, Ib:35387, Fb:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
}, mb() {
  return 0;
}, nb() {
  return [24, 80];
}}, Za = {Ba(a, b) {
  null === b || 10 === b ? (r(Pa(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ka(a) {
  0 < a.output?.length && (r(Pa(a.output)), a.output = []);
}}, $a = () => {
  u("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
}, L = {N:null, S() {
  return L.createNode(null, "/", 16895, 0);
}, createNode(a, b, c, d) {
  if (24576 === (c & 61440) || 4096 === (c & 61440)) {
    throw new J(63);
  }
  L.N || (L.N = {dir:{node:{U:L.l.U, R:L.l.R, ca:L.l.ca, qa:L.l.qa, Ta:L.l.Ta, ta:L.l.ta, Ua:L.l.Ua, Da:L.l.Da, sa:L.l.sa}, stream:{M:L.j.M}}, file:{node:{U:L.l.U, R:L.l.R}, stream:{M:L.j.M, read:L.j.read, write:L.j.write, Aa:L.j.Aa, Ra:L.j.Ra}}, link:{node:{U:L.l.U, R:L.l.R, ga:L.l.ga}, stream:{}}, Ga:{node:{U:L.l.U, R:L.l.R}, stream:ab}});
  c = bb(a, b, c, d);
  M(c.mode) ? (c.l = L.N.dir.node, c.j = L.N.dir.stream, c.h = {}) : 32768 === (c.mode & 61440) ? (c.l = L.N.file.node, c.j = L.N.file.stream, c.v = 0, c.h = null) : 40960 === (c.mode & 61440) ? (c.l = L.N.link.node, c.j = L.N.link.stream) : 8192 === (c.mode & 61440) && (c.l = L.N.Ga.node, c.j = L.N.Ga.stream);
  c.X = c.K = c.G = Date.now();
  a && (a.h[b] = c, a.X = a.K = a.G = c.X);
  return c;
}, Ob(a) {
  return a.h ? a.h.subarray ? a.h.subarray(0, a.v) : new Uint8Array(a.h) : new Uint8Array(0);
}, l:{U(a) {
  var b = {};
  b.Kb = 8192 === (a.mode & 61440) ? a.id : 1;
  b.Qb = a.id;
  b.mode = a.mode;
  b.Sb = 1;
  b.uid = 0;
  b.Pb = 0;
  b.ra = a.ra;
  M(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.v : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.X = new Date(a.X);
  b.K = new Date(a.K);
  b.G = new Date(a.G);
  b.Za = 4096;
  b.Eb = Math.ceil(b.size / b.Za);
  return b;
}, R(a, b) {
  for (var c of ["mode", "atime", "mtime", "ctime"]) {
    null != b[c] && (a[c] = b[c]);
  }
  void 0 !== b.size && (b = b.size, a.v != b && (0 == b ? (a.h = null, a.v = 0) : (c = a.h, a.h = new Uint8Array(b), c && a.h.set(c.subarray(0, Math.min(b, a.v))), a.v = b)));
}, ca() {
  throw new J(44);
}, qa(a, b, c, d) {
  return L.createNode(a, b, c, d);
}, Ta(a, b, c) {
  try {
    var d = cb(b, c);
  } catch (f) {
  }
  if (d) {
    if (M(a.mode)) {
      for (var e in d.h) {
        throw new J(55);
      }
    }
    db(d);
  }
  delete a.parent.h[a.name];
  b.h[c] = a;
  a.name = c;
  b.G = b.K = a.parent.G = a.parent.K = Date.now();
}, ta(a, b) {
  delete a.h[b];
  a.G = a.K = Date.now();
}, Ua(a, b) {
  var c = cb(a, b), d;
  for (d in c.h) {
    throw new J(55);
  }
  delete a.h[b];
  a.G = a.K = Date.now();
}, Da(a) {
  return [".", "..", ...Object.keys(a.h)];
}, sa(a, b, c) {
  a = L.createNode(a, b, 41471, 0);
  a.link = c;
  return a;
}, ga(a) {
  if (40960 !== (a.mode & 61440)) {
    throw new J(28);
  }
  return a.link;
}}, j:{read(a, b, c, d, e) {
  var f = a.node.h;
  if (e >= a.node.v) {
    return 0;
  }
  a = Math.min(a.node.v - e, d);
  q(0 <= a);
  if (8 < a && f.subarray) {
    b.set(f.subarray(e, e + a), c);
  } else {
    for (d = 0; d < a; d++) {
      b[c + d] = f[e + d];
    }
  }
  return a;
}, write(a, b, c, d, e, f) {
  q(!(b instanceof ArrayBuffer));
  b.buffer === A.buffer && (f = !1);
  if (!d) {
    return 0;
  }
  a = a.node;
  a.K = a.G = Date.now();
  if (b.subarray && (!a.h || a.h.subarray)) {
    if (f) {
      return q(0 === e, "canOwn must imply no weird position inside the file"), a.h = b.subarray(c, c + d), a.v = d;
    }
    if (0 === a.v && 0 === e) {
      return a.h = b.slice(c, c + d), a.v = d;
    }
    if (e + d <= a.v) {
      return a.h.set(b.subarray(c, c + d), e), d;
    }
  }
  f = e + d;
  var g = a.h ? a.h.length : 0;
  g >= f || (f = Math.max(f, g * (1048576 > g ? 2.0 : 1.125) >>> 0), 0 != g && (f = Math.max(f, 256)), g = a.h, a.h = new Uint8Array(f), 0 < a.v && a.h.set(g.subarray(0, a.v), 0));
  if (a.h.subarray && b.subarray) {
    a.h.set(b.subarray(c, c + d), e);
  } else {
    for (f = 0; f < d; f++) {
      a.h[e + f] = b[c + f];
    }
  }
  a.v = Math.max(a.v, e + d);
  return d;
}, M(a, b, c) {
  1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.v);
  if (0 > b) {
    throw new J(28);
  }
  return b;
}, Aa(a, b, c, d, e) {
  if (32768 !== (a.node.mode & 61440)) {
    throw new J(43);
  }
  a = a.node.h;
  if (e & 2 || !a || a.buffer !== A.buffer) {
    d = !0;
    e = $a();
    if (!e) {
      throw new J(48);
    }
    if (a) {
      if (0 < c || c + b < a.length) {
        a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
      }
      A.set(a, e);
    }
  } else {
    d = !1, e = a.byteOffset;
  }
  return {m:e, Ya:d};
}, Ra(a, b, c, d) {
  L.j.write(a, b, 0, d, c, !1);
  return 0;
}}}, eb = (a, b) => {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}, N = (a, b, c) => {
  q("number" == typeof a, `UTF8ToString expects a number (got ${typeof a})`);
  return a ? Pa(C, a, b, c) : "";
}, fb = {EPERM:63, ENOENT:44, ESRCH:71, EINTR:27, EIO:29, ENXIO:60, E2BIG:1, ENOEXEC:45, EBADF:8, ECHILD:12, EAGAIN:6, EWOULDBLOCK:6, ENOMEM:48, EACCES:2, EFAULT:21, ENOTBLK:105, EBUSY:10, EEXIST:20, EXDEV:75, ENODEV:43, ENOTDIR:54, EISDIR:31, EINVAL:28, ENFILE:41, EMFILE:33, ENOTTY:59, ETXTBSY:74, EFBIG:22, ENOSPC:51, ESPIPE:70, EROFS:69, EMLINK:34, EPIPE:64, EDOM:18, ERANGE:68, ENOMSG:49, EIDRM:24, ECHRNG:106, EL2NSYNC:156, EL3HLT:107, EL3RST:108, ELNRNG:109, EUNATCH:110, ENOCSI:111, EL2HLT:112, 
EDEADLK:16, ENOLCK:46, EBADE:113, EBADR:114, EXFULL:115, ENOANO:104, EBADRQC:103, EBADSLT:102, EDEADLOCK:16, EBFONT:101, ENOSTR:100, ENODATA:116, ETIME:117, ENOSR:118, ENONET:119, ENOPKG:120, EREMOTE:121, ENOLINK:47, EADV:122, ESRMNT:123, ECOMM:124, EPROTO:65, EMULTIHOP:36, EDOTDOT:125, EBADMSG:9, ENOTUNIQ:126, EBADFD:127, EREMCHG:128, ELIBACC:129, ELIBBAD:130, ELIBSCN:131, ELIBMAX:132, ELIBEXEC:133, ENOSYS:52, ENOTEMPTY:55, ENAMETOOLONG:37, ELOOP:32, EOPNOTSUPP:138, EPFNOSUPPORT:139, ECONNRESET:15, 
ENOBUFS:42, EAFNOSUPPORT:5, EPROTOTYPE:67, ENOTSOCK:57, ENOPROTOOPT:50, ESHUTDOWN:140, ECONNREFUSED:14, EADDRINUSE:3, ECONNABORTED:13, ENETUNREACH:40, ENETDOWN:38, ETIMEDOUT:73, EHOSTDOWN:142, EHOSTUNREACH:23, EINPROGRESS:26, EALREADY:7, EDESTADDRREQ:17, EMSGSIZE:35, EPROTONOSUPPORT:66, ESOCKTNOSUPPORT:137, EADDRNOTAVAIL:4, ENETRESET:39, EISCONN:30, ENOTCONN:53, ETOOMANYREFS:141, EUSERS:136, EDQUOT:19, ESTALE:72, ENOTSUP:138, ENOMEDIUM:148, EILSEQ:25, EOVERFLOW:61, ECANCELED:11, ENOTRECOVERABLE:56, 
EOWNERDEAD:62, ESTRPIPE:135}, gb = async a => {
  var b = await ba(a);
  q(b, `Loading data file "${a}" failed (no arrayBuffer).`);
  return new Uint8Array(b);
}, hb = 0, ib = null, jb = {}, kb = null, lb = a => {
  hb--;
  q(a, "removeRunDependency requires an ID");
  q(jb[a]);
  delete jb[a];
  0 == hb && (null !== kb && (clearInterval(kb), kb = null), ib && (a = ib, ib = null, a()));
}, mb = a => {
  hb++;
  q(a, "addRunDependency requires an ID");
  q(!jb[a]);
  jb[a] = 1;
  null === kb && globalThis.setInterval && (kb = setInterval(() => {
    if (ea) {
      clearInterval(kb), kb = null;
    } else {
      var b = !1, c;
      for (c in jb) {
        b || (b = !0, r("still waiting on run dependencies:")), r(`dependency: ${c}`);
      }
      b && r("(end of list)");
    }
  }, 10000));
}, nb = [], ob = async(a, b) => {
  if ("undefined" != typeof Browser) {
    var c = Browser;
    w[c.m + 16 >> 2] = 0;
    w[c.m + 4 >> 2] = void 0;
    w[c.m + 8 >> 2] = void 0;
  }
  for (var d of nb) {
    if (d.canHandle(b)) {
      return q("AsyncFunction" === d.handle.constructor.name, "Filesystem plugin handlers must be async functions (See #24914)"), d.handle(a, b);
    }
  }
  return a;
}, pb = null, qb = {}, rb = [], sb = 1, tb = null, ub = !1, vb = !0, J = class extends Error {
  name="ErrnoError";
  constructor(a) {
    super(ta ? N(wb(a)) : "");
    this.L = a;
    for (var b in fb) {
      if (fb[b] === a) {
        this.code = b;
        break;
      }
    }
  }
}, xb = class {
  H={};
  node=null;
  get object() {
    return this.node;
  }
  set object(a) {
    this.node = a;
  }
  get flags() {
    return this.H.flags;
  }
  set flags(a) {
    this.H.flags = a;
  }
  get position() {
    return this.H.position;
  }
  set position(a) {
    this.H.position = a;
  }
}, yb = class {
  l={};
  j={};
  ea=null;
  constructor(a, b, c, d) {
    a ||= this;
    this.parent = a;
    this.S = a.S;
    this.id = sb++;
    this.name = b;
    this.mode = c;
    this.ra = d;
    this.X = this.K = this.G = Date.now();
  }
  get read() {
    return 365 === (this.mode & 365);
  }
  set read(a) {
    a ? this.mode |= 365 : this.mode &= -366;
  }
  get write() {
    return 146 === (this.mode & 146);
  }
  set write(a) {
    a ? this.mode |= 146 : this.mode &= -147;
  }
  get pb() {
    return M(this.mode);
  }
  get ob() {
    return 8192 === (this.mode & 61440);
  }
};
function zb(a, b = {}) {
  if (!a) {
    throw new J(44);
  }
  b.wa ?? (b.wa = !0);
  "/" === a.charAt(0) || (a = "//" + a);
  var c = 0;
  a: for (; 40 > c; c++) {
    a = a.split("/").filter(k => !!k);
    for (var d = pb, e = "/", f = 0; f < a.length; f++) {
      var g = f === a.length - 1;
      if (g && b.parent) {
        break;
      }
      if ("." !== a[f]) {
        if (".." === a[f]) {
          if (e = Ja(e), d === d.parent) {
            a = e + "/" + a.slice(f + 1).join("/");
            c--;
            continue a;
          } else {
            d = d.parent;
          }
        } else {
          e = Ia(e + "/" + a[f]);
          try {
            d = cb(d, a[f]);
          } catch (k) {
            if (44 === k?.L && g && b.tb) {
              return {path:e};
            }
            throw k;
          }
          !d.ea || g && !b.wa || (d = d.ea.root);
          if (40960 === (d.mode & 61440) && (!g || b.va)) {
            if (!d.l.ga) {
              throw new J(52);
            }
            d = d.l.ga(d);
            "/" === d.charAt(0) || (d = Ja(e) + "/" + d);
            a = d + "/" + a.slice(f + 1).join("/");
            continue a;
          }
        }
      }
    }
    return {path:e, node:d};
  }
  throw new J(32);
}
function Ab(a) {
  for (var b;;) {
    if (a === a.parent) {
      return a = a.S.Qa, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
    }
    b = b ? `${a.name}/${b}` : a.name;
    a = a.parent;
  }
}
function Bb(a, b) {
  for (var c = 0, d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % tb.length;
}
function db(a) {
  var b = Bb(a.parent.id, a.name);
  if (tb[b] === a) {
    tb[b] = a.Z;
  } else {
    for (b = tb[b]; b;) {
      if (b.Z === a) {
        b.Z = a.Z;
        break;
      }
      b = b.Z;
    }
  }
}
function cb(a, b) {
  var c = M(a.mode) ? (c = Cb(a, "x")) ? c : a.l.ca ? 0 : 2 : 54;
  if (c) {
    throw new J(c);
  }
  for (c = tb[Bb(a.id, b)]; c; c = c.Z) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return a.l.ca(a, b);
}
function bb(a, b, c, d) {
  q("object" == typeof a);
  a = new yb(a, b, c, d);
  b = Bb(a.parent.id, a.name);
  a.Z = tb[b];
  return tb[b] = a;
}
function M(a) {
  return 16384 === (a & 61440);
}
function Db(a) {
  var b = ["r", "w", "rw"][a & 3];
  a & 512 && (b += "w");
  return b;
}
function Cb(a, b) {
  if (vb) {
    return 0;
  }
  if (!b.includes("r") || a.mode & 292) {
    if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) {
      return 2;
    }
  } else {
    return 2;
  }
  return 0;
}
function Eb(a, b) {
  if (!M(a.mode)) {
    return 54;
  }
  try {
    return cb(a, b), 20;
  } catch (c) {
  }
  return Cb(a, "wx");
}
function Fb(a) {
  a = rb[a];
  if (!a) {
    throw new J(8);
  }
  return a;
}
function Gb(a, b = -1) {
  q(-1 <= b);
  a = Object.assign(new xb(), a);
  if (-1 == b) {
    a: {
      for (b = 0; 4096 >= b; b++) {
        if (!rb[b]) {
          break a;
        }
      }
      throw new J(33);
    }
  }
  a.C = b;
  return rb[b] = a;
}
function Hb(a, b = -1) {
  a = Gb(a, b);
  a.j?.Mb?.(a);
  return a;
}
function Ib(a, b) {
  var c = null?.j.R, d = c ? null : a;
  c ??= a.l.R;
  if (!c) {
    throw new J(63);
  }
  c(d, b);
}
var ab = {open(a) {
  a.j = qb[a.node.ra].j;
  a.j.open?.(a);
}, M() {
  throw new J(70);
}};
function Wa(a, b) {
  qb[a] = {j:b};
}
function Jb(a, b) {
  if ("string" == typeof a) {
    throw a;
  }
  var c = "/" === b, d = !b;
  if (c && pb) {
    throw new J(10);
  }
  if (!c && !d) {
    var e = zb(b, {wa:!1});
    b = e.path;
    e = e.node;
    if (e.ea) {
      throw new J(10);
    }
    if (!M(e.mode)) {
      throw new J(54);
    }
  }
  b = {type:a, Tb:{}, Qa:b, sb:[]};
  a = a.S(b);
  a.S = b;
  b.root = a;
  c ? pb = a : e && (e.ea = b, e.S && e.S.sb.push(b));
}
function Kb(a, b, c) {
  var d = zb(a, {parent:!0}).node;
  a = a && a.match(/([^\/]+|\/)\/*$/)[1];
  if (!a) {
    throw new J(28);
  }
  if ("." === a || ".." === a) {
    throw new J(20);
  }
  var e = Eb(d, a);
  if (e) {
    throw new J(e);
  }
  if (!d.l.qa) {
    throw new J(63);
  }
  return d.l.qa(d, a, b, c);
}
function Lb(a, b = 438) {
  return Kb(a, b & 4095 | 32768, 0);
}
function O(a) {
  return Kb(a, 16895, 0);
}
function Mb(a, b, c) {
  "undefined" == typeof c && (c = b, b = 438);
  return Kb(a, b | 8192, c);
}
function Nb(a, b) {
  if (!Ma(a)) {
    throw new J(44);
  }
  var c = zb(b, {parent:!0}).node;
  if (!c) {
    throw new J(44);
  }
  b = b && b.match(/([^\/]+|\/)\/*$/)[1];
  var d = Eb(c, b);
  if (d) {
    throw new J(d);
  }
  if (!c.l.sa) {
    throw new J(63);
  }
  c.l.sa(c, b, a);
}
function Ob(a) {
  var b = zb(a, {parent:!0}).node;
  if (!b) {
    throw new J(44);
  }
  a = a && a.match(/([^\/]+|\/)\/*$/)[1];
  var c = cb(b, a);
  a: {
    try {
      var d = cb(b, a);
    } catch (f) {
      d = f.L;
      break a;
    }
    var e = Cb(b, "wx");
    d = e ? e : M(d.mode) ? 31 : 0;
  }
  if (d) {
    throw new J(d);
  }
  if (!b.l.ta) {
    throw new J(63);
  }
  if (c.ea) {
    throw new J(10);
  }
  b.l.ta(b, a);
  db(c);
}
function Pb(a, b) {
  a = "string" == typeof a ? zb(a, {va:!0}).node : a;
  Ib(a, {mode:b & 4095 | a.mode & -4096, G:Date.now(), Lb:void 0});
}
function Qb(a, b, c = 438) {
  if ("" === a) {
    throw new J(44);
  }
  if ("string" == typeof b) {
    var d = {r:0, "r+":2, w:577, "w+":578, a:1089, "a+":1090}[b];
    if ("undefined" == typeof d) {
      throw Error(`Unknown file open mode: ${b}`);
    }
    b = d;
  }
  c = b & 64 ? c & 4095 | 32768 : 0;
  if ("object" == typeof a) {
    d = a;
  } else {
    var e = a.endsWith("/");
    var f = zb(a, {va:!(b & 131072), tb:!0});
    d = f.node;
    a = f.path;
  }
  f = !1;
  if (b & 64) {
    if (d) {
      if (b & 128) {
        throw new J(20);
      }
    } else {
      if (e) {
        throw new J(31);
      }
      d = Kb(a, c | 511, 0);
      f = !0;
    }
  }
  if (!d) {
    throw new J(44);
  }
  8192 === (d.mode & 61440) && (b &= -513);
  if (b & 65536 && !M(d.mode)) {
    throw new J(54);
  }
  if (!f && (e = d ? 40960 === (d.mode & 61440) ? 32 : M(d.mode) && ("r" !== Db(b) || b & 576) ? 31 : Cb(d, Db(b)) : 44)) {
    throw new J(e);
  }
  if (b & 512 && !f) {
    e = d;
    e = "string" == typeof e ? zb(e, {va:!0}).node : e;
    if (M(e.mode)) {
      throw new J(31);
    }
    if (32768 !== (e.mode & 61440)) {
      throw new J(28);
    }
    if (a = Cb(e, "w")) {
      throw new J(a);
    }
    Ib(e, {size:0, timestamp:Date.now()});
  }
  b = Gb({node:d, path:Ab(d), flags:b & -131713, seekable:!0, position:0, j:d.j, Cb:[], error:!1});
  b.j.open && b.j.open(b);
  f && Pb(d, c & 511);
  return b;
}
function Rb(a) {
  if (null === a.C) {
    throw new J(8);
  }
  a.xa && (a.xa = null);
  try {
    a.j.close && a.j.close(a);
  } catch (b) {
    throw b;
  } finally {
    rb[a.C] = null;
  }
  a.C = null;
}
function Sb(a, b, c) {
  if (null === a.C) {
    throw new J(8);
  }
  if (!a.seekable || !a.j.M) {
    throw new J(70);
  }
  if (0 != c && 1 != c && 2 != c) {
    throw new J(28);
  }
  a.position = a.j.M(a, b, c);
  a.Cb = [];
}
function Tb(a, b, c, d, e, f) {
  q(0 <= c);
  if (0 > d || 0 > e) {
    throw new J(28);
  }
  if (null === a.C) {
    throw new J(8);
  }
  if (0 === (a.flags & 2097155)) {
    throw new J(8);
  }
  if (M(a.node.mode)) {
    throw new J(31);
  }
  if (!a.j.write) {
    throw new J(28);
  }
  a.seekable && a.flags & 1024 && Sb(a, 0, 2);
  var g = "undefined" != typeof e;
  if (!g) {
    e = a.position;
  } else if (!a.seekable) {
    throw new J(70);
  }
  b = a.j.write(a, b, c, d, e, f);
  g || (a.position += b);
  return b;
}
function Ub(a, b) {
  a = "string" == typeof a ? a : Ab(a);
  for (b = b.split("/").reverse(); b.length;) {
    var c = b.pop();
    if (c) {
      var d = Ia(a + "/" + c);
      try {
        O(d);
      } catch (e) {
        if (20 != e.L) {
          throw e;
        }
      }
      a = d;
    }
  }
  return d;
}
function Vb(a, b, c, d) {
  a = Ia(("string" == typeof a ? a : Ab(a)) + "/" + b);
  return Lb(a, eb(c, d));
}
function Wb(a, b, c, d, e, f) {
  var g = b;
  a && (a = "string" == typeof a ? a : Ab(a), g = b ? Ia(a + "/" + b) : a);
  a = eb(d, e);
  g = Lb(g, a);
  if (c) {
    if ("string" == typeof c) {
      b = Array(c.length);
      d = 0;
      for (e = c.length; d < e; ++d) {
        b[d] = c.charCodeAt(d);
      }
      c = b;
    }
    Pb(g, a | 146);
    b = Qb(g, 577);
    Tb(b, c, 0, c.length, 0, f);
    Rb(b);
    Pb(g, a);
  }
}
function Xb(a, b, c, d) {
  a = Ia(("string" == typeof a ? a : Ab(a)) + "/" + b);
  b = eb(!!c, !!d);
  Xb.Pa ?? (Xb.Pa = 64);
  var e = Xb.Pa++ << 8 | 0;
  Wa(e, {open(f) {
    f.seekable = !1;
  }, close() {
    d?.buffer?.length && d(10);
  }, read(f, g, k, l) {
    for (var m = 0, h = 0; h < l; h++) {
      try {
        var p = c();
      } catch (t) {
        throw new J(29);
      }
      if (void 0 === p && 0 === m) {
        throw new J(6);
      }
      if (null === p || void 0 === p) {
        break;
      }
      m++;
      g[k + h] = p;
    }
    m && (f.node.X = Date.now());
    return m;
  }, write(f, g, k, l) {
    for (var m = 0; m < l; m++) {
      try {
        d(g[k + m]);
      } catch (h) {
        throw new J(29);
      }
    }
    l && (f.node.K = f.node.G = Date.now());
    return m;
  }});
  return Mb(a, b, e);
}
function Yb(a) {
  if (!(a.ob || a.pb || a.link || a.h)) {
    if (globalThis.XMLHttpRequest) {
      u("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
    } else {
      try {
        a.h = (void 0)(a.url);
      } catch (b) {
        throw new J(29);
      }
    }
  }
}
function Zb(a, b, c, d, e) {
  function f(h, p, t, v, z) {
    h = h.node.h;
    if (z >= h.length) {
      return 0;
    }
    v = Math.min(h.length - z, v);
    q(0 <= v);
    if (h.slice) {
      for (var B = 0; B < v; B++) {
        p[t + B] = h[z + B];
      }
    } else {
      for (B = 0; B < v; B++) {
        p[t + B] = h.get(z + B);
      }
    }
    return v;
  }
  class g {
    ya=!1;
    H=[];
    ba=void 0;
    Ma=0;
    La=0;
    get(h) {
      if (!(h > this.length - 1 || 0 > h)) {
        var p = h % this.Oa;
        return this.ba(h / this.Oa | 0)[p];
      }
    }
    ub(h) {
      this.ba = h;
    }
    Na() {
      var h = new XMLHttpRequest();
      h.open("HEAD", c, !1);
      h.send(null);
      200 <= h.status && 300 > h.status || 304 === h.status || u("Couldn't load " + c + ". Status: " + h.status);
      var p = Number(h.getResponseHeader("Content-length")), t, v = (t = h.getResponseHeader("Accept-Ranges")) && "bytes" === t;
      h = (t = h.getResponseHeader("Content-Encoding")) && "gzip" === t;
      var z = 1048576;
      v || (z = p);
      var B = this;
      B.ub(F => {
        var H = F * z, D = (F + 1) * z - 1;
        D = Math.min(D, p - 1);
        if ("undefined" == typeof B.H[F]) {
          var U = B.H;
          H > D && u("invalid range (" + H + ", " + D + ") or no bytes requested!");
          D > p - 1 && u("only " + p + " bytes available! programmer error!");
          var K = new XMLHttpRequest();
          K.open("GET", c, !1);
          p !== z && K.setRequestHeader("Range", "bytes=" + H + "-" + D);
          K.responseType = "arraybuffer";
          K.overrideMimeType && K.overrideMimeType("text/plain; charset=x-user-defined");
          K.send(null);
          200 <= K.status && 300 > K.status || 304 === K.status || u("Couldn't load " + c + ". Status: " + K.status);
          H = void 0 !== K.response ? new Uint8Array(K.response || []) : Ta(K.responseText || "");
          U[F] = H;
        }
        "undefined" == typeof B.H[F] && u("doXHR failed!");
        return B.H[F];
      });
      if (h || !p) {
        z = p = 1, z = p = this.ba(0).length, da("LazyFiles on gzip forces download of the whole file when length is accessed");
      }
      this.Ma = p;
      this.La = z;
      this.ya = !0;
    }
    get length() {
      this.ya || this.Na();
      return this.Ma;
    }
    get Oa() {
      this.ya || this.Na();
      return this.La;
    }
  }
  if (globalThis.XMLHttpRequest) {
    u("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");
    var k = new g();
    var l = void 0;
  } else {
    l = c, k = void 0;
  }
  var m = Vb(a, b, d, e);
  k ? m.h = k : l && (m.h = null, m.url = l);
  Object.defineProperties(m, {v:{get:function() {
    return this.h.length;
  }}});
  a = {};
  for (const [h, p] of Object.entries(m.j)) {
    a[h] = (...t) => {
      Yb(m);
      return p(...t);
    };
  }
  a.read = (h, p, t, v, z) => {
    Yb(m);
    return f(h, p, t, v, z);
  };
  a.Aa = (h, p, t) => {
    Yb(m);
    var v = $a();
    if (!v) {
      throw new J(48);
    }
    f(h, A, v, p, t);
    return {m:v, Ya:!0};
  };
  m.j = a;
  return m;
}
var $b = {}, Ga = void 0, ac = {}, bc = a => {
  for (; a.length;) {
    var b = a.pop();
    a.pop()(b);
  }
};
function cc(a) {
  return this.o(w[a >> 2]);
}
var dc = {}, ec = {}, fc = {}, gc = class extends Error {
  constructor(a) {
    super(a);
    this.name = "InternalError";
  }
}, Q = (a, b, c) => {
  function d(k) {
    k = c(k);
    if (k.length !== a.length) {
      throw new gc("Mismatched type converter count");
    }
    for (var l = 0; l < a.length; ++l) {
      P(a[l], k[l]);
    }
  }
  a.forEach(k => fc[k] = b);
  var e = Array(b.length), f = [], g = 0;
  for (let [k, l] of b.entries()) {
    ec.hasOwnProperty(l) ? e[k] = ec[l] : (f.push(l), dc.hasOwnProperty(l) || (dc[l] = []), dc[l].push(() => {
      e[k] = ec[l];
      ++g;
      g === f.length && d(e);
    }));
  }
  0 === f.length && d(e);
}, R = a => {
  for (var b = "";;) {
    var c = C[a++];
    if (!c) {
      return b;
    }
    b += String.fromCharCode(c);
  }
}, S = class extends Error {
  constructor(a) {
    super(a);
    this.name = "BindingError";
  }
}, hc = a => {
  throw new S(a);
};
function ic(a, b, c = {}) {
  var d = b.name;
  if (!a) {
    throw new S(`type "${d}" must have a positive integer typeid pointer`);
  }
  if (ec.hasOwnProperty(a)) {
    if (c.jb) {
      return;
    }
    throw new S(`Cannot register type '${d}' twice`);
  }
  ec[a] = b;
  delete fc[a];
  dc.hasOwnProperty(a) && (b = dc[a], delete dc[a], b.forEach(e => e()));
}
function P(a, b, c = {}) {
  return ic(a, b, c);
}
var jc = (a, b, c) => {
  switch(b) {
    case 1:
      return c ? d => A[d] : d => C[d];
    case 2:
      return c ? d => E[d >> 1] : d => oa[d >> 1];
    case 4:
      return c ? d => G[d >> 2] : d => w[d >> 2];
    case 8:
      return c ? d => ra[d >> 3] : d => sa[d >> 3];
    default:
      throw new TypeError(`invalid integer width (${b}): ${a}`);
  }
}, kc = a => {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}, lc = (a, b, c, d) => {
  if (b < c || b > d) {
    throw new TypeError(`Passing a number "${kc(b)}" from JS side to C/C++ side to an argument of type "${a}", which is outside the valid range [${c}, ${d}]!`);
  }
}, mc = a => {
  throw new S(a.g.u.i.name + " instance already deleted");
}, nc = !1, oc = () => {
}, pc = (a, b, c) => {
  if (b === c) {
    return a;
  }
  if (void 0 === c.D) {
    return null;
  }
  a = pc(a, b, c.D);
  return null === a ? null : c.bb(a);
}, qc = {}, rc = {}, sc = (a, b) => {
  if (void 0 === b) {
    throw new S("ptr should not be undefined");
  }
  for (; a.D;) {
    b = a.ia(b), a = a.D;
  }
  return rc[b];
}, uc = (a, b) => {
  if (!b.u || !b.m) {
    throw new gc("makeClassHandle requires ptr and ptrType");
  }
  if (!!b.J !== !!b.A) {
    throw new gc("Both smartPtrType and smartPtr must be specified");
  }
  b.count = {value:1};
  return tc(Object.create(a, {g:{value:b, writable:!0}}));
};
function vc(a) {
  function b() {
    return this.ma ? uc(this.i.V, {u:this.vb, m:c, J:this, A:a}) : uc(this.i.V, {u:this, m:a});
  }
  var c = this.gb(a);
  if (!c) {
    return this.Ia(a), null;
  }
  var d = sc(this.i, c);
  if (void 0 !== d) {
    if (0 === d.g.count.value) {
      return d.g.m = c, d.g.A = a, d.clone();
    }
    d = d.clone();
    this.Ia(a);
    return d;
  }
  d = this.i.fb(c);
  d = qc[d];
  if (!d) {
    return b.call(this);
  }
  d = this.la ? d.$a : d.pointerType;
  var e = pc(c, this.i, d.i);
  return null === e ? b.call(this) : this.ma ? uc(d.i.V, {u:d, m:e, J:this, A:a}) : uc(d.i.V, {u:d, m:e});
}
var tc = a => {
  if (!globalThis.FinalizationRegistry) {
    return tc = b => b, a;
  }
  nc = new FinalizationRegistry(b => {
    console.warn(b.rb);
    b = b.g;
    --b.count.value;
    0 === b.count.value && (b.A ? b.J.O(b.A) : b.u.i.O(b.m));
  });
  tc = b => {
    var c = b.g;
    if (c.A) {
      var d = {g:c};
      c = Error(`Embind found a leaked C++ instance ${c.u.i.name} <${ia(c.m)}>.\n` + "We'll free it automatically in this case, but this functionality is not reliable across various environments.\nMake sure to invoke .delete() manually once you're done with the instance instead.\nOriginally allocated");
      "captureStackTrace" in Error && Error.captureStackTrace(c, vc);
      d.rb = c.stack.replace(/^Error: /, "");
      nc.register(b, d, b);
    }
    return b;
  };
  oc = b => {
    nc.unregister(b);
  };
  return tc(a);
}, wc = [];
function xc() {
}
var yc = (a, b) => Object.defineProperty(b, "name", {value:a}), zc = (a, b, c) => {
  if (void 0 === a[b].I) {
    var d = a[b];
    a[b] = function(...e) {
      if (!a[b].I.hasOwnProperty(e.length)) {
        throw new S(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${a[b].I})!`);
      }
      return a[b].I[e.length].apply(this, e);
    };
    a[b].I = [];
    a[b].I[d.W] = d;
  }
}, Ac = (a, b) => {
  if (n.hasOwnProperty(a)) {
    throw new S(`Cannot register public name '${a}' twice`);
  }
  n[a] = b;
  n[a].W = void 0;
}, Bc = a => {
  q("string" === typeof a);
  a = a.replace(/[^a-zA-Z0-9_]/g, "$");
  var b = a.charCodeAt(0);
  return 48 <= b && 57 >= b ? `_${a}` : a;
};
function Cc(a, b, c, d, e, f, g, k) {
  this.name = a;
  this.constructor = b;
  this.V = c;
  this.O = d;
  this.D = e;
  this.fb = f;
  this.ia = g;
  this.bb = k;
  this.wb = [];
}
var Dc = (a, b, c) => {
  for (; b !== c;) {
    if (!b.ia) {
      throw new S(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);
    }
    a = b.ia(a);
    b = b.D;
  }
  return a;
};
function Ec(a, b) {
  if (null === b) {
    if (this.za) {
      throw new S(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new S(`Cannot pass "${kc(b)}" as a ${this.name}`);
  }
  if (!b.g.m) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  return Dc(b.g.m, b.g.u.i, this.i);
}
function Fc(a, b) {
  if (null === b) {
    if (this.za) {
      throw new S(`null is not a valid ${this.name}`);
    }
    if (this.ma) {
      var c = this.Ca();
      null !== a && a.push(this.O, c);
      return c;
    }
    return 0;
  }
  if (!b || !b.g) {
    throw new S(`Cannot pass "${kc(b)}" as a ${this.name}`);
  }
  if (!b.g.m) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (!this.la && b.g.u.la) {
    throw new S(`Cannot convert argument of type ${b.g.J ? b.g.J.name : b.g.u.name} to parameter type ${this.name}`);
  }
  c = Dc(b.g.m, b.g.u.i, this.i);
  if (this.ma) {
    if (void 0 === b.g.A) {
      throw new S("Passing raw pointer to smart pointer is illegal");
    }
    switch(this.Bb) {
      case 0:
        if (b.g.J === this) {
          c = b.g.A;
        } else {
          throw new S(`Cannot convert argument of type ${b.g.J ? b.g.J.name : b.g.u.name} to parameter type ${this.name}`);
        }
        break;
      case 1:
        c = b.g.A;
        break;
      case 2:
        if (b.g.J === this) {
          c = b.g.A;
        } else {
          var d = b.clone();
          c = this.xb(c, Gc(() => d["delete"]()));
          null !== a && a.push(this.O, c);
        }
        break;
      default:
        throw new S("Unsupporting sharing policy");
    }
  }
  return c;
}
function Hc(a, b) {
  if (null === b) {
    if (this.za) {
      throw new S(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new S(`Cannot pass "${kc(b)}" as a ${this.name}`);
  }
  if (!b.g.m) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (b.g.u.la) {
    throw new S(`Cannot convert argument of type ${b.g.u.name} to parameter type ${this.name}`);
  }
  return Dc(b.g.m, b.g.u.i, this.i);
}
function Ic(a, b, c, d, e, f, g, k, l, m, h) {
  this.name = a;
  this.i = b;
  this.za = c;
  this.la = d;
  this.ma = e;
  this.vb = f;
  this.Bb = g;
  this.Sa = k;
  this.Ca = l;
  this.xb = m;
  this.O = h;
  e || void 0 !== b.D ? this.B = Fc : (this.B = d ? Ec : Hc, this.F = null);
}
var Jc = (a, b) => {
  if (!n.hasOwnProperty(a)) {
    throw new gc("Replacing nonexistent public symbol");
  }
  n[a] = b;
  n[a].W = void 0;
}, Kc = [], T = (a, b, c = !1) => {
  q(!c, "Async bindings are only supported with JSPI.");
  a = R(a);
  (c = Kc[b]) || (Kc[b] = c = Lc.get(b));
  q(Lc.get(b) == c, "JavaScript-side Wasm function table mirror is out of date!");
  if ("function" != typeof c) {
    throw new S(`unknown function pointer with signature ${a}: ${b}`);
  }
  return c;
};
class Mc extends Error {
}
var Qc = a => {
  a = Nc(a);
  var b = R(a);
  Oc(a);
  return b;
}, Rc = (a, b) => {
  function c(f) {
    e[f] || ec[f] || (fc[f] ? fc[f].forEach(c) : (d.push(f), e[f] = !0));
  }
  var d = [], e = {};
  b.forEach(c);
  throw new Mc(`${a}: ` + d.map(Qc).join([", "]));
};
function Sc(a) {
  for (var b = 1; b < a.length; ++b) {
    if (null !== a[b] && void 0 === a[b].F) {
      return !0;
    }
  }
  return !1;
}
function Tc(a, b, c, d, e) {
  (a < b || a > c) && e(`function ${d} called with ${a} arguments, expected ${b == c ? b : `${b} to ${c}`}`);
}
function Uc(a, b, c, d, e, f) {
  var g = b.length;
  if (2 > g) {
    throw new S("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  q(!f, "Async bindings are only supported with JSPI.");
  var k = null !== b[1] && null !== c, l = Sc(b);
  c = !b[0].qb;
  var m = g - 2;
  var h = b.length - 2;
  for (var p = b.length - 1; 2 <= p && b[p].optional; --p) {
    h--;
  }
  p = b[0];
  var t = b[1];
  d = [a, hc, d, e, bc, p.o.bind(p), t?.B.bind(t)];
  for (e = 2; e < g; ++e) {
    p = b[e], d.push(p.B.bind(p));
  }
  if (!l) {
    for (e = k ? 1 : 2; e < b.length; ++e) {
      null !== b[e].F && d.push(b[e].F);
    }
  }
  d.push(Tc, h, m);
  l = Sc(b);
  m = b.length - 2;
  h = [];
  e = ["fn"];
  k && e.push("thisWired");
  for (g = 0; g < m; ++g) {
    h.push(`arg${g}`), e.push(`arg${g}Wired`);
  }
  h = h.join(",");
  e = e.join(",");
  h = `return function (${h}) {\n` + "checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);\n";
  l && (h += "var destructors = [];\n");
  t = l ? "destructors" : "null";
  p = "humanName throwBindingError invoker fn runDestructors fromRetWire toClassParamWire".split(" ");
  k && (h += `var thisWired = toClassParamWire(${t}, this);\n`);
  for (g = 0; g < m; ++g) {
    var v = `toArg${g}Wire`;
    h += `var arg${g}Wired = ${v}(${t}, arg${g});\n`;
    p.push(v);
  }
  h += (c || f ? "var rv = " : "") + `invoker(${e});\n`;
  if (l) {
    h += "runDestructors(destructors);\n";
  } else {
    for (g = k ? 1 : 2; g < b.length; ++g) {
      f = 1 === g ? "thisWired" : "arg" + (g - 2) + "Wired", null !== b[g].F && (h += `${f}_dtor(${f});\n`, p.push(`${f}_dtor`));
    }
  }
  c && (h += "var ret = fromRetWire(rv);\nreturn ret;\n");
  h += "}\n";
  p.push("checkArgCount", "minArgs", "maxArgs");
  h = `if (arguments.length !== ${p.length}){ throw new Error(humanName + "Expected ${p.length} closure arguments " + arguments.length + " given."); }\n${h}`;
  b = (new Function(p, h))(...d);
  return yc(a, b);
}
var Vc = (a, b) => {
  for (var c = [], d = 0; d < a; d++) {
    c.push(w[b + 4 * d >> 2]);
  }
  return c;
}, Wc = a => {
  a = a.trim();
  const b = a.indexOf("(");
  if (-1 === b) {
    return a;
  }
  q(a.endsWith(")"), "Parentheses for argument names should match.");
  return a.slice(0, b);
}, Xc = (a, b, c) => {
  if (!(a instanceof Object)) {
    throw new S(`${c} with invalid "this": ${a}`);
  }
  if (!(a instanceof b.i.constructor)) {
    throw new S(`${c} incompatible with "this" of type ${a.constructor.name}`);
  }
  if (!a.g.m) {
    throw new S(`cannot call emscripten binding method ${c} on deleted object`);
  }
  return Dc(a.g.m, a.g.u.i, b.i);
}, Yc = [], V = [0, 1, , 1, null, 1, !0, 1, !1, 1], Zc = a => {
  if (!a) {
    throw new S(`Cannot use deleted val. handle = ${a}`);
  }
  q(2 === a || void 0 !== V[a] && 0 === a % 2, `invalid handle: ${a}`);
  return V[a];
}, Gc = a => {
  switch(a) {
    case void 0:
      return 2;
    case null:
      return 4;
    case !0:
      return 6;
    case !1:
      return 8;
    default:
      const b = Yc.pop() || V.length;
      V[b] = a;
      V[b + 1] = 1;
      return b;
  }
}, $c = {name:"emscripten::val", o:a => {
  var b = Zc(a);
  9 < a && 0 === --V[a + 1] && (q(void 0 !== V[a], "Decref for unallocated handle."), V[a] = void 0, Yc.push(a));
  return b;
}, B:(a, b) => Gc(b), P:cc, F:null}, ad = (a, b, c) => {
  switch(b) {
    case 1:
      return c ? function(d) {
        return this.o(A[d]);
      } : function(d) {
        return this.o(C[d]);
      };
    case 2:
      return c ? function(d) {
        return this.o(E[d >> 1]);
      } : function(d) {
        return this.o(oa[d >> 1]);
      };
    case 4:
      return c ? function(d) {
        return this.o(G[d >> 2]);
      } : function(d) {
        return this.o(w[d >> 2]);
      };
    default:
      throw new TypeError(`invalid integer width (${b}): ${a}`);
  }
}, bd = a => {
  var b = ec[a];
  if (void 0 === b) {
    throw a = `${"enum"} has unknown type ${Qc(a)}`, new S(a);
  }
  return b;
}, cd = (a, b) => {
  switch(b) {
    case 4:
      return function(c) {
        return this.o(pa[c >> 2]);
      };
    case 8:
      return function(c) {
        return this.o(qa[c >> 3]);
      };
    default:
      throw new TypeError(`invalid float width (${b}): ${a}`);
  }
}, dd = (a, b, c) => {
  q("number" == typeof c, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return Sa(a, C, b, c);
}, ed = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, fd = (a, b, c) => {
  q(0 == a % 2, "Pointer passed to UTF16ToString must be aligned to two bytes!");
  a >>= 1;
  b = Oa(oa, a, b / 2, c);
  if (16 < b - a && ed) {
    return ed.decode(oa.subarray(a, b));
  }
  for (c = ""; a < b; ++a) {
    c += String.fromCharCode(oa[a]);
  }
  return c;
}, gd = (a, b, c) => {
  q(0 == b % 2, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
  q("number" == typeof c, "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  c ??= 2147483647;
  if (2 > c) {
    return 0;
  }
  c -= 2;
  var d = b;
  c = c < 2 * a.length ? c / 2 : a.length;
  for (var e = 0; e < c; ++e) {
    E[b >> 1] = a.charCodeAt(e), b += 2;
  }
  E[b >> 1] = 0;
  return b - d;
}, hd = a => 2 * a.length, jd = (a, b, c) => {
  q(0 == a % 4, "Pointer passed to UTF32ToString must be aligned to four bytes!");
  var d = "";
  a >>= 2;
  for (var e = 0; !(e >= b / 4); e++) {
    var f = w[a + e];
    if (!f && !c) {
      break;
    }
    d += String.fromCodePoint(f);
  }
  return d;
}, kd = (a, b, c) => {
  q(0 == b % 4, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
  q("number" == typeof c, "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  c ??= 2147483647;
  if (4 > c) {
    return 0;
  }
  var d = b;
  c = d + c - 4;
  for (var e = 0; e < a.length; ++e) {
    var f = a.codePointAt(e);
    65535 < f && e++;
    G[b >> 2] = f;
    b += 4;
    if (b + 4 > c) {
      break;
    }
  }
  G[b >> 2] = 0;
  return b - d;
}, ld = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    65535 < a.codePointAt(c) && c++, b += 4;
  }
  return b;
}, md = {}, od = a => {
  if (ea) {
    r("user callback triggered after runtime exited or application aborted.  Ignoring.");
  } else {
    try {
      a();
    } catch (b) {
      if (a = b, !(a instanceof Ca || "unwind" == a)) {
        throw fa(), a instanceof WebAssembly.RuntimeError && 0 >= nd() && r("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)"), a;
      }
    }
  }
}, pd = [], qd = [0, document, window], rd = a => {
  a = 2 < a ? N(a) : a;
  return qd[a] || document.querySelector(a);
}, W, sd = 1, td = [], X = [], ud = [], Y = [], vd = [], Z = [], wd = a => {
  for (var b = sd++, c = a.length; c < b; c++) {
    a[c] = null;
  }
  return b;
}, xd = (a, b, c, d) => {
  for (var e = 0; e < a; e++) {
    var f = W[c](), g = f && wd(d);
    f && (f.name = g, d[g] = f);
    G[b + 4 * e >> 2] = g;
  }
}, zd = (a, b) => {
  a.H || (a.H = a.getContext, a.getContext = function(d, e) {
    e = a.H(d, e);
    return "webgl" == d == e instanceof WebGLRenderingContext ? e : null;
  });
  var c = a.getContext("webgl2", b);
  return c ? yd(c, b) : 0;
}, yd = (a, b) => {
  var c = wd(Z);
  b = {handle:c, attributes:b, version:b.da, $:a};
  a.canvas && (a.canvas.Xa = b);
  Z[c] = b;
  return c;
}, Ad, Bd = ["default", "low-power", "high-performance"], Cd = {}, Ed = () => {
  if (!Dd) {
    var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.language || "C").replace("-", "_") + ".UTF-8", _:"./this.program"}, b;
    for (b in Cd) {
      void 0 === Cd[b] ? delete a[b] : a[b] = Cd[b];
    }
    var c = [];
    for (b in a) {
      c.push(`${b}=${a[b]}`);
    }
    Dd = c;
  }
  return Dd;
}, Dd, Fd = a => "]" == a.slice(-1) && a.lastIndexOf("["), Gd = a => {
  a -= 5120;
  return 0 == a ? A : 1 == a ? C : 2 == a ? E : 4 == a ? G : 6 == a ? pa : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a ? w : oa;
};
tb = Array(4096);
Jb(L, "/");
O("/tmp");
O("/home");
O("/home/web_user");
(function() {
  O("/dev");
  Wa(259, {read:() => 0, write:(d, e, f, g) => g, M:() => 0});
  Mb("/dev/null", 259);
  Va(1280, Ya);
  Va(1536, Za);
  Mb("/dev/tty", 1280);
  Mb("/dev/tty1", 1536);
  var a = new Uint8Array(1024), b = 0, c = () => {
    0 === b && (La(a), b = a.byteLength);
    return a[--b];
  };
  Xb("/dev", "random", c);
  Xb("/dev", "urandom", c);
  O("/dev/shm");
  O("/dev/shm/tmp");
})();
(function() {
  O("/proc");
  var a = O("/proc/self");
  O("/proc/self/fd");
  Jb({S() {
    var b = bb(a, "fd", 16895, 73);
    b.j = {M:L.j.M};
    b.l = {ca(c, d) {
      c = +d;
      var e = Fb(c);
      c = {parent:null, S:{Qa:"fake"}, l:{ga:() => e.path}, id:c + 1};
      return c.parent = c;
    }, Da() {
      return Array.from(rb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
    }};
    return b;
  }}, "/proc/self/fd");
})();
(() => {
  let a = xc.prototype;
  Object.assign(a, {isAliasOf:function(c) {
    if (!(this instanceof xc && c instanceof xc)) {
      return !1;
    }
    var d = this.g.u.i, e = this.g.m;
    c.g = c.g;
    var f = c.g.u.i;
    for (c = c.g.m; d.D;) {
      e = d.ia(e), d = d.D;
    }
    for (; f.D;) {
      c = f.ia(c), f = f.D;
    }
    return d === f && e === c;
  }, clone:function() {
    this.g.m || mc(this);
    if (this.g.fa) {
      return this.g.count.value += 1, this;
    }
    var c = tc, d = Object, e = d.create, f = Object.getPrototypeOf(this), g = this.g;
    c = c(e.call(d, f, {g:{value:{count:g.count, aa:g.aa, fa:g.fa, m:g.m, u:g.u, A:g.A, J:g.J}}}));
    c.g.count.value += 1;
    c.g.aa = !1;
    return c;
  }, ["delete"]() {
    this.g.m || mc(this);
    if (this.g.aa && !this.g.fa) {
      throw new S("Object already scheduled for deletion");
    }
    oc(this);
    var c = this.g;
    --c.count.value;
    0 === c.count.value && (c.A ? c.J.O(c.A) : c.u.i.O(c.m));
    this.g.fa || (this.g.A = void 0, this.g.m = void 0);
  }, isDeleted:function() {
    return !this.g.m;
  }, deleteLater:function() {
    this.g.m || mc(this);
    if (this.g.aa && !this.g.fa) {
      throw new S("Object already scheduled for deletion");
    }
    wc.push(this);
    this.g.aa = !0;
    return this;
  }});
  const b = Symbol.dispose;
  b && (a[b] = a["delete"]);
})();
Object.assign(Ic.prototype, {gb(a) {
  this.Sa && (a = this.Sa(a));
  return a;
}, Ia(a) {
  this.O?.(a);
}, P:cc, o:vc});
q(10 === V.length);
y("ENVIRONMENT");
y("GL_MAX_TEXTURE_IMAGE_UNITS");
y("SDL_canPlayWithWebAudio");
y("SDL_numSimultaneouslyQueuedBuffers");
y("INITIAL_MEMORY");
y("wasmMemory");
y("arguments");
y("buffer");
y("canvas");
y("doNotCaptureKeyboard");
y("dynamicLibraries");
y("elementPointerLock");
y("extraStackTrace");
y("forcedAspectRatio");
y("instantiateWasm");
y("keyboardListeningElement");
y("freePreloadedMediaOnUse");
y("loadSplitModule");
y("locateFile");
y("logReadFiles");
y("mainScriptUrlOrBlob");
y("mem");
y("monitorRunDependencies");
y("noExitRuntime");
y("noInitialRun");
y("onAbort");
y("onCustomMessage");
y("onExit");
y("onFree");
y("onFullScreen");
y("onMalloc");
y("onRealloc");
y("onRuntimeInitialized");
y("postMainLoop");
y("postRun");
y("preInit");
y("preMainLoop");
y("preRun");
y("preinitializedWebGLContext");
y("preloadPlugins");
y("print");
y("printErr");
y("setStatus");
y("statusMessage");
y("stderr");
y("stdin");
y("stdout");
y("thisProgram");
y("wasm");
y("wasmBinary");
y("websocket");
y("fetchSettings");
q("undefined" == typeof n.memoryInitializerPrefixURL, "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
q("undefined" == typeof n.pthreadMainPrefixURL, "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
q("undefined" == typeof n.cdInitializerPrefixURL, "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
q("undefined" == typeof n.filePackagePrefixURL, "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
q("undefined" == typeof n.read, "Module.read option was removed");
q("undefined" == typeof n.readAsync, "Module.readAsync option was removed (modify readAsync in JS)");
q("undefined" == typeof n.readBinary, "Module.readBinary option was removed (modify readBinary in JS)");
q("undefined" == typeof n.setWindowTitle, "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
q("undefined" == typeof n.TOTAL_MEMORY, "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
q("undefined" == typeof n.ENVIRONMENT, "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
q("undefined" == typeof n.STACK_SIZE, "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
q("undefined" == typeof n.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
q("undefined" == typeof n.INITIAL_MEMORY, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
n.addRunDependency = mb;
n.removeRunDependency = lb;
n.FS_preloadFile = async(a, b, c, d, e, f, g, k) => {
  var l = b ? Ma(Ia(a + "/" + b)) : a, m;
  a: {
    for (var h = m = `cp ${l}`;;) {
      if (!jb[m]) {
        break a;
      }
      m = h + Math.random();
    }
  }
  mb(m);
  try {
    h = c, "string" == typeof c && (h = await gb(c)), h = await ob(h, l), k?.(), f || Wb(a, b, h, d, e, g);
  } finally {
    lb(m);
  }
};
n.FS_unlink = (...a) => Ob(...a);
n.FS_createPath = (...a) => Ub(...a);
n.FS_createDevice = (...a) => Xb(...a);
n.FS_createDataFile = (...a) => Wb(...a);
n.FS_createLazyFile = (...a) => Zb(...a);
"writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertI32PairToI53Checked convertU32PairToI53 stackAlloc getTempRet0 setTempRet0 zeroMemory withStackSave inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr runMainThreadEmAsm autoResumeAudioContext getDynCaller dynCall runtimeKeepalivePush runtimeKeepalivePop asmjsMangle HandleAllocator addOnPreRun addOnInit addOnPostCtor addOnPreMain addOnExit addOnPostRun STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS ccall cwrap convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction intArrayToString stringToAscii stringToNewUTF8 stringToUTF8OnStack writeArrayToMemory registerKeyEventCallback getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData registerBatteryEventCallback setCanvasElementSize getCanvasElementSize jsStackTrace getCallstack convertPCtoSourceLocation checkWasiClock wasiRightsToMuslOFlags wasiOFlagsToMuslOFlags safeSetTimeout setImmediateWrapped safeRequestAnimationFrame clearImmediateWrapped registerPostMainLoop registerPreMainLoop getPromise makePromise idsToPromises makePromiseCallback findMatchingCatch Browser_asyncPrepareDataCounter isLeapYear ydayFromDate arraySum addDays getSocketFromFD getSocketAddress FS_mkdirTree _setNetworkCallback webgl_enable_WEBGL_multi_draw webgl_enable_EXT_polygon_offset_clamp webgl_enable_EXT_clip_control webgl_enable_WEBGL_polygon_mode emscriptenWebGLGet emscriptenWebGLGetUniform emscriptenWebGLGetVertexAttrib __glGetActiveAttribOrUniform writeGLArray registerWebGlEventCallback runAndAbortIfError emscriptenWebGLGetIndexed webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance ALLOC_NORMAL ALLOC_STACK allocate writeStringToMemory writeAsciiToMemory allocateUTF8 allocateUTF8OnStack demangle stackTrace getNativeTypeSize getFunctionArgsName createJsInvokerSignature PureVirtualError registerInheritedInstance unregisterInheritedInstance getInheritedInstanceCount getLiveInheritedInstances setDelayFunction count_emval_handles getStringOrSymbol emval_returnValue emval_lookupTypes emval_addMethodCaller".split(" ").forEach(function(a) {
  la(a);
});
"run out err callMain abort wasmExports HEAPF32 HEAPF64 HEAP8 HEAP16 HEAPU16 HEAP32 HEAPU32 HEAP64 HEAPU64 writeStackCookie checkStackCookie INT53_MAX INT53_MIN bigintToI53Checked stackSave stackRestore createNamedFunction ptrToString exitJS getHeapMax growMemory ENV ERRNO_CODES strError DNS Protocols Sockets timers warnOnce readEmAsmArgsArray readEmAsmArgs runEmAsmFunction jstoi_q getExecutableName handleException keepRuntimeAlive callUserCallback maybeExit asyncLoad alignMemory mmapAlloc wasmTable wasmMemory getUniqueRunDependency noExitRuntime freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS UTF8Decoder UTF8ArrayToString UTF8ToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 intArrayFromString AsciiToString UTF16Decoder UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 JSEvents specialHTMLTargets maybeCStringToJsString findEventTarget findCanvasEventTarget currentFullscreenStrategy restoreOldWindowedStyle UNWIND_CACHE ExitStatus getEnvStrings doReadv doWritev initRandomFill randomFill emSetImmediate emClearImmediate_deps emClearImmediate promiseMap uncaughtExceptionCount exceptionLast exceptionCaught ExceptionInfo Browser requestFullscreen requestFullScreen setCanvasSize getUserMedia createContext getPreloadedImageData__data wget MONTH_DAYS_REGULAR MONTH_DAYS_LEAP MONTH_DAYS_REGULAR_CUMULATIVE MONTH_DAYS_LEAP_CUMULATIVE SYSCALLS preloadPlugins FS_createPreloadedFile FS_modeStringToFlags FS_getMode FS_stdin_getChar_buffer FS_stdin_getChar FS_readFile FS FS_root FS_mounts FS_devices FS_streams FS_nextInode FS_nameTable FS_currentPath FS_initialized FS_ignorePermissions FS_filesystems FS_syncFSRequests FS_lookupPath FS_getPath FS_hashName FS_hashAddNode FS_hashRemoveNode FS_lookupNode FS_createNode FS_destroyNode FS_isRoot FS_isMountpoint FS_isFile FS_isDir FS_isLink FS_isChrdev FS_isBlkdev FS_isFIFO FS_isSocket FS_flagsToPermissionString FS_nodePermissions FS_mayLookup FS_mayCreate FS_mayDelete FS_mayOpen FS_checkOpExists FS_nextfd FS_getStreamChecked FS_getStream FS_createStream FS_closeStream FS_dupStream FS_doSetAttr FS_chrdev_stream_ops FS_major FS_minor FS_makedev FS_registerDevice FS_getDevice FS_getMounts FS_syncfs FS_mount FS_unmount FS_lookup FS_mknod FS_statfs FS_statfsStream FS_statfsNode FS_create FS_mkdir FS_mkdev FS_symlink FS_rename FS_rmdir FS_readdir FS_readlink FS_stat FS_fstat FS_lstat FS_doChmod FS_chmod FS_lchmod FS_fchmod FS_doChown FS_chown FS_lchown FS_fchown FS_doTruncate FS_truncate FS_ftruncate FS_utime FS_open FS_close FS_isClosed FS_llseek FS_read FS_write FS_mmap FS_msync FS_ioctl FS_writeFile FS_cwd FS_chdir FS_createDefaultDirectories FS_createDefaultDevices FS_createSpecialDirectories FS_createStandardStreams FS_staticInit FS_init FS_quit FS_findObject FS_analyzePath FS_createFile FS_forceLoadFile FS_absolutePath FS_createFolder FS_createLink FS_joinPath FS_mmapAlloc FS_standardizePath MEMFS TTY PIPEFS SOCKFS tempFixedLengthArray miniTempWebGLFloatBuffers miniTempWebGLIntBuffers heapObjectForWebGLType toTypedArrayIndex GL computeUnpackAlignedImageSize colorChannelsInGlTextureFormat emscriptenWebGLGetTexPixelData webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos AL GLUT EGL GLEW IDBStore SDL SDL_gfx print printErr jstoi_s InternalError BindingError throwInternalError throwBindingError registeredTypes awaitingDependencies typeDependencies tupleRegistrations structRegistrations sharedRegisterType whenDependentTypesAreResolved getTypeName getFunctionName heap32VectorToArray requireRegisteredType usesDestructorStack checkArgCount getRequiredArgCount createJsInvoker UnboundTypeError EmValType EmValOptionalType throwUnboundTypeError ensureOverloadTable exposePublicSymbol replacePublicSymbol embindRepr registeredInstances getBasestPointer getInheritedInstance registeredPointers registerType integerReadValueFromPointer enumReadValueFromPointer floatReadValueFromPointer assertIntegerRange readPointer runDestructors craftInvokerFunction embind__requireFunction genericPointerToWireType constNoSmartPtrRawPointerToWireType nonConstNoSmartPtrRawPointerToWireType init_RegisteredPointer RegisteredPointer RegisteredPointer_fromWireType runDestructor releaseClassHandle finalizationRegistry detachFinalizer_deps detachFinalizer attachFinalizer makeClassHandle init_ClassHandle ClassHandle throwInstanceAlreadyDeleted deletionQueue flushPendingDeletes delayFunction RegisteredClass shallowCopyInternalPointer downcastPointer upcastPointer validateThis char_0 char_9 makeLegalFunctionName emval_freelist emval_handles emval_symbols Emval emval_methodCallers".split(" ").forEach(la);
var Hd = {107728:() => {
  throw "A böngésződ nem támogatja a WebGL-t!";
}, 107779:() => {
  console.error("Renderer: Tried to set non-existent shader!");
}, 107840:() => {
  console.error("Renderer: No shader is set!");
}, 107885:a => {
  throw "Sikertelen shader fordítás: " + N(a);
}, 107949:a => {
  throw "Sikertelen shader összekapcsolás: " + N(a);
}, 108019:(a, b) => {
  if (b = document.getElementById(N(b))) {
    b.innerText = a;
  }
}, 108109:a => {
  throw "Sikertelen fájl beolvasás: " + N(a);
}}, Nc = x("___getTypeName"), Id = x("_malloc"), Oc = x("_free"), ha = x("_emscripten_stack_get_end"), Jd = x("__emscripten_timeout"), wb = x("_strerror"), Kd = x("_emscripten_stack_init"), nd = x("_emscripten_stack_get_current"), va = x("wasmMemory"), Lc = x("wasmTable"), Ld = {__cxa_throw:(a, b, c) => {
  a = new Ea(a);
  w[a.m + 16 >> 2] = 0;
  w[a.m + 4 >> 2] = b;
  w[a.m + 8 >> 2] = c;
  Fa++;
  q(!1, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
}, __syscall_fcntl64:function(a, b, c) {
  Ga = c;
  try {
    var d = Fb(a);
    switch(b) {
      case 0:
        var e = I();
        if (0 > e) {
          break;
        }
        for (; rb[e];) {
          e++;
        }
        return Hb(d, e).C;
      case 1:
      case 2:
        return 0;
      case 3:
        return d.flags;
      case 4:
        return e = I(), d.flags |= e, 0;
      case 12:
        return e = I(), E[e + 0 >> 1] = 2, 0;
      case 13:
      case 14:
        return 0;
    }
    return -28;
  } catch (f) {
    if ("undefined" == typeof $b || "ErrnoError" !== f.name) {
      throw f;
    }
    return -f.L;
  }
}, __syscall_ioctl:function(a, b, c) {
  Ga = c;
  try {
    var d = Fb(a);
    switch(b) {
      case 21509:
        return d.s ? 0 : -59;
      case 21505:
        if (!d.s) {
          return -59;
        }
        if (d.s.T.lb) {
          b = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          var e = I();
          G[e >> 2] = 25856;
          G[e + 4 >> 2] = 5;
          G[e + 8 >> 2] = 191;
          G[e + 12 >> 2] = 35387;
          for (var f = 0; 32 > f; f++) {
            A[e + f + 17] = b[f] || 0;
          }
        }
        return 0;
      case 21510:
      case 21511:
      case 21512:
        return d.s ? 0 : -59;
      case 21506:
      case 21507:
      case 21508:
        if (!d.s) {
          return -59;
        }
        if (d.s.T.mb) {
          for (e = I(), b = [], f = 0; 32 > f; f++) {
            b.push(A[e + f + 17]);
          }
        }
        return 0;
      case 21519:
        if (!d.s) {
          return -59;
        }
        e = I();
        return G[e >> 2] = 0;
      case 21520:
        return d.s ? -28 : -59;
      case 21537:
      case 21531:
        e = I();
        if (!d.j.kb) {
          throw new J(59);
        }
        return d.j.kb(d, b, e);
      case 21523:
        if (!d.s) {
          return -59;
        }
        d.s.T.nb && (f = [24, 80], e = I(), E[e >> 1] = f[0], E[e + 2 >> 1] = f[1]);
        return 0;
      case 21524:
        return d.s ? 0 : -59;
      case 21515:
        return d.s ? 0 : -59;
      default:
        return -28;
    }
  } catch (g) {
    if ("undefined" == typeof $b || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.L;
  }
}, __syscall_openat:function(a, b, c, d) {
  Ga = d;
  try {
    b = N(b);
    var e = b;
    if ("/" === e.charAt(0)) {
      b = e;
    } else {
      var f = -100 === a ? "/" : Fb(a).path;
      if (0 == e.length) {
        throw new J(44);
      }
      b = f + "/" + e;
    }
    var g = d ? I() : 0;
    return Qb(b, c, g).C;
  } catch (k) {
    if ("undefined" == typeof $b || "ErrnoError" !== k.name) {
      throw k;
    }
    return -k.L;
  }
}, _abort_js:() => u("native code called abort()"), _embind_finalize_value_object:a => {
  var b = ac[a];
  delete ac[a];
  var c = b.Ca, d = b.O, e = b.Ja, f = e.map(g => g.ib).concat(e.map(g => g.zb));
  Q([a], f, g => {
    var k = {}, l, m;
    for ([l, m] of e.entries()) {
      const h = g[l], p = m.ba, t = m.hb, v = g[l + e.length], z = m.yb, B = m.Ab;
      k[m.eb] = {read:F => h.o(p(t, F)), write:(F, H) => {
        var D = [];
        z(B, F, v.B(D, H));
        bc(D);
      }, optional:h.optional};
    }
    return [{name:b.name, o:h => {
      var p = {}, t;
      for (t in k) {
        p[t] = k[t].read(h);
      }
      d(h);
      return p;
    }, B:(h, p) => {
      for (var t in k) {
        if (!(t in p || k[t].optional)) {
          throw new TypeError(`Missing field: "${t}"`);
        }
      }
      var v = c();
      for (t in k) {
        k[t].write(v, p[t]);
      }
      null !== h && h.push(d, v);
      return v;
    }, P:cc, F:d}];
  });
}, _embind_register_bigint:(a, b, c, d, e) => {
  b = R(b);
  const f = 0n === d;
  let g = k => k;
  if (f) {
    const k = 8 * c;
    g = l => BigInt.asUintN(k, l);
    e = g(e);
  }
  P(a, {name:b, o:g, B:(k, l) => {
    if ("number" == typeof l) {
      l = BigInt(l);
    } else if ("bigint" != typeof l) {
      throw new TypeError(`Cannot convert "${kc(l)}" to ${this.name}`);
    }
    lc(b, l, d, e);
    return l;
  }, P:jc(b, c, !f), F:null});
}, _embind_register_bool:(a, b, c, d) => {
  b = R(b);
  P(a, {name:b, o:function(e) {
    return !!e;
  }, B:function(e, f) {
    return f ? c : d;
  }, P:function(e) {
    return this.o(C[e]);
  }, F:null});
}, _embind_register_class:(a, b, c, d, e, f, g, k, l, m, h, p, t) => {
  h = R(h);
  f = T(e, f);
  k &&= T(g, k);
  m &&= T(l, m);
  t = T(p, t);
  var v = Bc(h);
  Ac(v, function() {
    Rc(`Cannot construct ${h} due to unbound types`, [d]);
  });
  Q([a, b, c], d ? [d] : [], z => {
    z = z[0];
    if (d) {
      var B = z.i;
      var F = B.V;
    } else {
      F = xc.prototype;
    }
    z = yc(h, function(...K) {
      if (Object.getPrototypeOf(this) !== H) {
        throw new S(`Use 'new' to construct ${h}`);
      }
      if (void 0 === D.Y) {
        throw new S(`${h} has no accessible constructor`);
      }
      var Pc = D.Y[K.length];
      if (void 0 === Pc) {
        throw new S(`Tried to invoke ctor of ${h} with invalid number of parameters (${K.length}) - expected (${Object.keys(D.Y).toString()}) parameters instead!`);
      }
      return Pc.apply(this, K);
    });
    var H = Object.create(F, {constructor:{value:z}});
    z.prototype = H;
    var D = new Cc(h, z, H, t, B, f, k, m);
    if (D.D) {
      var U;
      (U = D.D).ja ?? (U.ja = []);
      D.D.ja.push(D);
    }
    B = new Ic(h, D, !0, !1, !1);
    U = new Ic(h + "*", D, !1, !1, !1);
    F = new Ic(h + " const*", D, !1, !0, !1);
    qc[a] = {pointerType:U, $a:F};
    Jc(v, z);
    return [B, U, F];
  });
}, _embind_register_class_class_function:(a, b, c, d, e, f, g, k) => {
  var l = Vc(c, d);
  b = R(b);
  b = Wc(b);
  f = T(e, f, k);
  Q([], [a], m => {
    function h() {
      Rc(`Cannot call ${p} due to unbound types`, l);
    }
    m = m[0];
    var p = `${m.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    var t = m.i.constructor;
    void 0 === t[b] ? (h.W = c - 1, t[b] = h) : (zc(t, b, p), t[b].I[c - 1] = h);
    Q([], l, v => {
      v = Uc(p, [v[0], null].concat(v.slice(1)), null, f, g, k);
      void 0 === t[b].I ? (v.W = c - 1, t[b] = v) : t[b].I[c - 1] = v;
      if (m.i.ja) {
        for (const z of m.i.ja) {
          z.constructor.hasOwnProperty(b) || (z.constructor[b] = v);
        }
      }
      return [];
    });
    return [];
  });
}, _embind_register_class_constructor:(a, b, c, d, e, f) => {
  q(0 < b);
  var g = Vc(b, c);
  e = T(d, e);
  Q([], [a], k => {
    k = k[0];
    var l = `constructor ${k.name}`;
    void 0 === k.i.Y && (k.i.Y = []);
    if (void 0 !== k.i.Y[b - 1]) {
      throw new S(`Cannot register multiple constructors with identical number of parameters (${b - 1}) for class '${k.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    k.i.Y[b - 1] = () => {
      Rc(`Cannot construct ${k.name} due to unbound types`, g);
    };
    Q([], g, m => {
      m.splice(1, 0, null);
      k.i.Y[b - 1] = Uc(l, m, null, e, f);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:(a, b, c, d, e, f, g, k, l) => {
  var m = Vc(c, d);
  b = R(b);
  b = Wc(b);
  f = T(e, f, l);
  Q([], [a], h => {
    function p() {
      Rc(`Cannot call ${t} due to unbound types`, m);
    }
    h = h[0];
    var t = `${h.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    k && h.i.wb.push(b);
    var v = h.i.V, z = v[b];
    void 0 === z || void 0 === z.I && z.className !== h.name && z.W === c - 2 ? (p.W = c - 2, p.className = h.name, v[b] = p) : (zc(v, b, t), v[b].I[c - 2] = p);
    Q([], m, B => {
      B = Uc(t, B, h, f, g, l);
      void 0 === v[b].I ? (B.W = c - 2, v[b] = B) : v[b].I[c - 2] = B;
      return [];
    });
    return [];
  });
}, _embind_register_class_property:(a, b, c, d, e, f, g, k, l, m) => {
  b = R(b);
  e = T(d, e);
  Q([], [a], h => {
    h = h[0];
    var p = `${h.name}.${b}`, t = {get() {
      Rc(`Cannot access ${p} due to unbound types`, [c, g]);
    }, enumerable:!0, configurable:!0};
    t.set = l ? () => Rc(`Cannot access ${p} due to unbound types`, [c, g]) : () => {
      throw new S(p + " is a read-only property");
    };
    Object.defineProperty(h.i.V, b, t);
    Q([], l ? [c, g] : [c], v => {
      var z = v[0], B = {get() {
        var H = Xc(this, h, p + " getter");
        return z.o(e(f, H));
      }, enumerable:!0};
      if (l) {
        l = T(k, l);
        var F = v[1];
        B.set = function(H) {
          var D = Xc(this, h, p + " setter"), U = [];
          l(m, D, F.B(U, H));
          bc(U);
        };
      }
      Object.defineProperty(h.i.V, b, B);
      return [];
    });
    return [];
  });
}, _embind_register_emval:a => P(a, $c), _embind_register_enum:(a, b, c, d) => {
  function e() {
  }
  b = R(b);
  e.values = {};
  P(a, {name:b, constructor:e, o:function(f) {
    return this.constructor.values[f];
  }, B:(f, g) => g.value, P:ad(b, c, d), F:null});
  Ac(b, e);
}, _embind_register_enum_value:(a, b, c) => {
  var d = bd(a);
  b = R(b);
  a = d.constructor;
  d = Object.create(d.constructor.prototype, {value:{value:c}, constructor:{value:yc(`${d.name}_${b}`, function() {
  })}});
  a.values[c] = d;
  a[b] = d;
}, _embind_register_float:(a, b, c) => {
  b = R(b);
  P(a, {name:b, o:d => d, B:(d, e) => {
    if ("number" != typeof e && "boolean" != typeof e) {
      throw new TypeError(`Cannot convert ${kc(e)} to ${this.name}`);
    }
    return e;
  }, P:cd(b, c), F:null});
}, _embind_register_integer:(a, b, c, d, e) => {
  b = R(b);
  let f = k => k;
  if (0 === d) {
    var g = 32 - 8 * c;
    f = k => k << g >>> g;
    e = f(e);
  }
  P(a, {name:b, o:f, B:(k, l) => {
    if ("number" != typeof l && "boolean" != typeof l) {
      throw new TypeError(`Cannot convert "${kc(l)}" to ${b}`);
    }
    lc(b, l, d, e);
    return l;
  }, P:jc(b, c, 0 !== d), F:null});
}, _embind_register_memory_view:(a, b, c) => {
  function d(f) {
    return new e(A.buffer, w[f + 4 >> 2], w[f >> 2]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
  c = R(c);
  P(a, {name:c, o:d, P:d}, {jb:!0});
}, _embind_register_std_string:(a, b) => {
  b = R(b);
  P(a, {name:b, o(c) {
    var d = N(c + 4, w[c >> 2], !0);
    Oc(c);
    return d;
  }, B(c, d) {
    d instanceof ArrayBuffer && (d = new Uint8Array(d));
    var e = "string" == typeof d;
    if (!(e || ArrayBuffer.isView(d) && 1 == d.BYTES_PER_ELEMENT)) {
      throw new S("Cannot pass non-string to std::string");
    }
    var f = e ? Ra(d) : d.length;
    var g = Id(4 + f + 1), k = g + 4;
    w[g >> 2] = f;
    e ? dd(d, k, f + 1) : C.set(d, k);
    null !== c && c.push(Oc, g);
    return g;
  }, P:cc, F(c) {
    Oc(c);
  }});
}, _embind_register_std_wstring:(a, b, c) => {
  c = R(c);
  if (2 === b) {
    var d = fd;
    var e = gd;
    var f = hd;
  } else {
    q(4 === b, "only 2-byte and 4-byte strings are currently supported"), d = jd, e = kd, f = ld;
  }
  P(a, {name:c, o:g => {
    var k = d(g + 4, w[g >> 2] * b, !0);
    Oc(g);
    return k;
  }, B:(g, k) => {
    if ("string" != typeof k) {
      throw new S(`Cannot pass non-string to C++ string type ${c}`);
    }
    var l = f(k), m = Id(4 + l + b);
    w[m >> 2] = l / b;
    e(k, m + 4, l + b);
    null !== g && g.push(Oc, m);
    return m;
  }, P:cc, F(g) {
    Oc(g);
  }});
}, _embind_register_value_object:(a, b, c, d, e, f) => {
  ac[a] = {name:R(b), Ca:T(c, d), O:T(e, f), Ja:[]};
}, _embind_register_value_object_field:(a, b, c, d, e, f, g, k, l, m) => {
  ac[a].Ja.push({eb:R(b), ib:c, ba:T(d, e), hb:f, zb:g, yb:T(k, l), Ab:m});
}, _embind_register_void:(a, b) => {
  b = R(b);
  P(a, {qb:!0, name:b, o:() => {
  }, B:() => {
  }});
}, _emscripten_fs_load_embedded_files:a => {
  do {
    var b = w[a >> 2];
    a += 4;
    var c = w[a >> 2];
    a += 4;
    var d = w[a >> 2];
    a += 4;
    b = N(b);
    Ub("/", Ja(b));
    Wb(b, null, A.subarray(d, d + c), !0, !0, !0);
  } while (w[a >> 2]);
}, _emscripten_runtime_keepalive_clear:() => {
}, _setitimer_js:(a, b) => {
  md[a] && (clearTimeout(md[a].id), delete md[a]);
  if (!b) {
    return 0;
  }
  var c = setTimeout(() => {
    q(a in md);
    delete md[a];
    od(() => Jd(a, performance.now()));
  }, b);
  md[a] = {id:c, Xb:b};
  return 0;
}, _tzset_js:(a, b, c, d) => {
  var e = (new Date()).getFullYear(), f = (new Date(e, 0, 1)).getTimezoneOffset();
  e = (new Date(e, 6, 1)).getTimezoneOffset();
  w[a >> 2] = 60 * Math.max(f, e);
  G[b >> 2] = Number(f != e);
  b = g => {
    var k = Math.abs(g);
    return `UTC${0 <= g ? "-" : "+"}${String(Math.floor(k / 60)).padStart(2, "0")}${String(k % 60).padStart(2, "0")}`;
  };
  a = b(f);
  b = b(e);
  q(a);
  q(b);
  q(16 >= Ra(a), `timezone name truncated to fit in TZNAME_MAX (${a})`);
  q(16 >= Ra(b), `timezone name truncated to fit in TZNAME_MAX (${b})`);
  e < f ? (dd(a, c, 17), dd(b, d, 17)) : (dd(a, d, 17), dd(b, c, 17));
}, emscripten_asm_const_int:(a, b, c) => {
  q(Array.isArray(pd));
  q(0 == c % 16);
  pd.length = 0;
  for (var d; d = C[b++];) {
    var e = String.fromCharCode(d), f = ["d", "f", "i", "p"];
    f.push("j");
    q(f.includes(e), `Invalid character ${d}("${e}") in readEmAsmArgs! Use only [${f}], and do not specify "v" for void return argument.`);
    e = 105 != d;
    e &= 112 != d;
    c += e && c % 8 ? 4 : 0;
    pd.push(112 == d ? w[c >> 2] : 106 == d ? ra[c >> 3] : 105 == d ? G[c >> 2] : qa[c >> 3]);
    c += e ? 8 : 4;
  }
  q(Hd.hasOwnProperty(a), `No EM_ASM constant found at address ${a}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return Hd[a](...pd);
}, emscripten_get_now:() => performance.now(), emscripten_resize_heap:a => {
  var b = C.length;
  a >>>= 0;
  q(a > b);
  if (2147483648 < a) {
    return r(`Cannot enlarge memory, requested ${a} bytes, but the limit is ${2147483648} bytes!`), !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var d = b * (1 + 0.2 / c);
    d = Math.min(d, a + 100663296);
    var e = Math, f = e.min;
    d = Math.max(a, d);
    q(65536, "alignment argument is required");
    e = f.call(e, 2147483648, 65536 * Math.ceil(d / 65536));
    a: {
      f = e;
      d = va.buffer.byteLength;
      try {
        va.grow((f - d + 65535) / 65536 | 0);
        ua();
        var g = 1;
        break a;
      } catch (k) {
        r(`growMemory: Attempted to grow heap from ${d} bytes to ${f} bytes, but got error: ${k}`);
      }
      g = void 0;
    }
    if (g) {
      return !0;
    }
  }
  r(`Failed to grow the heap from ${b} bytes to ${e} bytes, not enough memory!`);
  return !1;
}, emscripten_set_canvas_element_size:(a, b, c) => {
  a = rd(a);
  if (!a) {
    return -4;
  }
  a.width = b;
  a.height = c;
  return 0;
}, emscripten_webgl_create_context:(a, b) => {
  q(b);
  var c = b >> 2;
  b = {alpha:!!A[b + 0], depth:!!A[b + 1], stencil:!!A[b + 2], antialias:!!A[b + 3], premultipliedAlpha:!!A[b + 4], preserveDrawingBuffer:!!A[b + 5], powerPreference:Bd[G[c + 2]], failIfMajorPerformanceCaveat:!!A[b + 12], da:G[c + 4], Rb:G[c + 5], Nb:A[b + 24], cb:A[b + 25], Ub:G[c + 7], Wb:A[b + 32]};
  1 !== b.da && 2 !== b.da && r(`Invalid WebGL version requested: ${b.da}`);
  2 !== b.da && r("WebGL 1 requested but only WebGL 2 is supported (MIN_WEBGL_VERSION is 2)");
  a = rd(a);
  return !a || b.cb ? 0 : zd(a, b);
}, emscripten_webgl_destroy_context:a => {
  Ad == a && (Ad = 0);
  Ad === Z[a] && (Ad = null);
  "object" == typeof JSEvents && JSEvents.Vb(Z[a].$.canvas);
  Z[a]?.$.canvas && (Z[a].$.canvas.Xa = void 0);
  Z[a] = null;
}, emscripten_webgl_get_current_context:() => Ad ? Ad.handle : 0, emscripten_webgl_make_context_current:a => {
  Ad = Z[a];
  n.ctx = W = Ad?.$;
  return !a || W ? 0 : -5;
}, environ_get:(a, b) => {
  var c = 0, d = 0, e;
  for (e of Ed()) {
    var f = b + c;
    w[a + d >> 2] = f;
    c += dd(e, f, Infinity) + 1;
    d += 4;
  }
  return 0;
}, environ_sizes_get:(a, b) => {
  var c = Ed();
  w[a >> 2] = c.length;
  a = 0;
  for (var d of c) {
    a += Ra(d) + 1;
  }
  w[b >> 2] = a;
  return 0;
}, fd_close:function(a) {
  try {
    var b = Fb(a);
    Rb(b);
    return 0;
  } catch (c) {
    if ("undefined" == typeof $b || "ErrnoError" !== c.name) {
      throw c;
    }
    return c.L;
  }
}, fd_read:function(a, b, c, d) {
  try {
    a: {
      var e = Fb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var k = w[a >> 2], l = w[a + 4 >> 2];
        a += 8;
        var m = e, h = k, p = l, t = f, v = A;
        q(0 <= h);
        if (0 > p || 0 > t) {
          throw new J(28);
        }
        if (null === m.C) {
          throw new J(8);
        }
        if (1 === (m.flags & 2097155)) {
          throw new J(8);
        }
        if (M(m.node.mode)) {
          throw new J(31);
        }
        if (!m.j.read) {
          throw new J(28);
        }
        var z = "undefined" != typeof t;
        if (!z) {
          t = m.position;
        } else if (!m.seekable) {
          throw new J(70);
        }
        var B = m.j.read(m, v, h, p, t);
        z || (m.position += B);
        var F = B;
        if (0 > F) {
          var H = -1;
          break a;
        }
        b += F;
        if (F < l) {
          break;
        }
        "undefined" != typeof f && (f += F);
      }
      H = b;
    }
    w[d >> 2] = H;
    return 0;
  } catch (D) {
    if ("undefined" == typeof $b || "ErrnoError" !== D.name) {
      throw D;
    }
    return D.L;
  }
}, fd_seek:function(a, b, c, d) {
  b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
  try {
    if (isNaN(b)) {
      return 61;
    }
    var e = Fb(a);
    Sb(e, b, c);
    ra[d >> 3] = BigInt(e.position);
    e.xa && 0 === b && 0 === c && (e.xa = null);
    return 0;
  } catch (f) {
    if ("undefined" == typeof $b || "ErrnoError" !== f.name) {
      throw f;
    }
    return f.L;
  }
}, fd_write:function(a, b, c, d) {
  try {
    a: {
      var e = Fb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var k = w[a >> 2], l = w[a + 4 >> 2];
        a += 8;
        var m = Tb(e, A, k, l, f);
        if (0 > m) {
          var h = -1;
          break a;
        }
        b += m;
        if (m < l) {
          break;
        }
        "undefined" != typeof f && (f += m);
      }
      h = b;
    }
    w[d >> 2] = h;
    return 0;
  } catch (p) {
    if ("undefined" == typeof $b || "ErrnoError" !== p.name) {
      throw p;
    }
    return p.L;
  }
}, glActiveTexture:a => W.activeTexture(a), glAttachShader:(a, b) => {
  W.attachShader(X[a], Y[b]);
}, glBindBuffer:(a, b) => {
  35051 == a ? W.Ha = b : 35052 == a && (W.ua = b);
  W.bindBuffer(a, td[b]);
}, glBindBufferRange:(a, b, c, d, e) => {
  W.bindBufferRange(a, b, td[c], d, e);
}, glBindTexture:(a, b) => {
  W.bindTexture(a, ud[b]);
}, glBindVertexArray:a => {
  W.bindVertexArray(vd[a]);
}, glBufferData:(a, b, c, d) => {
  c && b ? W.bufferData(a, C, d, c, b) : W.bufferData(a, b, d);
}, glBufferSubData:(a, b, c, d) => {
  c && W.bufferSubData(a, b, C, d, c);
}, glClear:a => W.clear(a), glClearColor:(a, b, c, d) => W.clearColor(a, b, c, d), glCompileShader:a => {
  W.compileShader(Y[a]);
}, glCreateProgram:() => {
  var a = wd(X), b = W.createProgram();
  b.name = a;
  b.pa = b.na = b.oa = 0;
  b.Fa = 1;
  X[a] = b;
  return a;
}, glCreateShader:a => {
  var b = wd(Y);
  Y[b] = W.createShader(a);
  return b;
}, glDeleteBuffers:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = G[b + 4 * c >> 2], e = td[d];
    e && (W.deleteBuffer(e), e.name = 0, td[d] = null, d == W.Ha && (W.Ha = 0), d == W.ua && (W.ua = 0));
  }
}, glDeleteProgram:a => {
  if (a) {
    var b = X[a];
    b && (W.deleteProgram(b), b.name = 0, X[a] = null);
  }
}, glDeleteShader:a => {
  if (a) {
    var b = Y[a];
    b && (W.deleteShader(b), Y[a] = null);
  }
}, glDeleteTextures:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = G[b + 4 * c >> 2], e = ud[d];
    e && (W.deleteTexture(e), e.name = 0, ud[d] = null);
  }
}, glDeleteVertexArrays:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = G[b + 4 * c >> 2];
    W.deleteVertexArray(vd[d]);
    vd[d] = null;
  }
}, glDrawElements:(a, b, c, d) => {
  W.drawElements(a, b, c, d);
}, glEnable:a => W.enable(a), glEnableVertexAttribArray:a => {
  W.enableVertexAttribArray(a);
}, glGenBuffers:(a, b) => {
  xd(a, b, "createBuffer", td);
}, glGenTextures:(a, b) => {
  xd(a, b, "createTexture", ud);
}, glGenVertexArrays:(a, b) => {
  xd(a, b, "createVertexArray", vd);
}, glGenerateMipmap:a => W.generateMipmap(a), glGetProgramInfoLog:(a, b, c, d) => {
  a = W.getProgramInfoLog(X[a]);
  b = 0 < b && d ? dd(a, d, b) : 0;
  c && (G[c >> 2] = b);
}, glGetProgramiv:(a, b, c) => {
  if (c && !(a >= sd)) {
    if (a = X[a], 35716 == b) {
      G[c >> 2] = W.getProgramInfoLog(a).length + 1;
    } else if (35719 == b) {
      if (!a.pa) {
        var d = W.getProgramParameter(a, 35718);
        for (b = 0; b < d; ++b) {
          a.pa = Math.max(a.pa, W.getActiveUniform(a, b).name.length + 1);
        }
      }
      G[c >> 2] = a.pa;
    } else if (35722 == b) {
      if (!a.na) {
        for (d = W.getProgramParameter(a, 35721), b = 0; b < d; ++b) {
          a.na = Math.max(a.na, W.getActiveAttrib(a, b).name.length + 1);
        }
      }
      G[c >> 2] = a.na;
    } else if (35381 == b) {
      if (!a.oa) {
        for (d = W.getProgramParameter(a, 35382), b = 0; b < d; ++b) {
          a.oa = Math.max(a.oa, W.getActiveUniformBlockName(a, b).length + 1);
        }
      }
      G[c >> 2] = a.oa;
    } else {
      G[c >> 2] = W.getProgramParameter(a, b);
    }
  }
}, glGetShaderInfoLog:(a, b, c, d) => {
  a = W.getShaderInfoLog(Y[a]);
  b = 0 < b && d ? dd(a, d, b) : 0;
  c && (G[c >> 2] = b);
}, glGetShaderiv:(a, b, c) => {
  c && (35716 == b ? (a = W.getShaderInfoLog(Y[a]), G[c >> 2] = a ? a.length + 1 : 0) : 35720 == b ? (a = W.getShaderSource(Y[a]), G[c >> 2] = a ? a.length + 1 : 0) : G[c >> 2] = W.getShaderParameter(Y[a], b));
}, glGetUniformBlockIndex:(a, b) => W.getUniformBlockIndex(X[a], N(b)), glGetUniformLocation:(a, b) => {
  b = N(b);
  if (a = X[a]) {
    var c = a, d = c.ha, e = c.Wa, f;
    if (!d) {
      c.ha = d = {};
      c.Va = {};
      var g = W.getProgramParameter(c, 35718);
      for (f = 0; f < g; ++f) {
        var k = W.getActiveUniform(c, f);
        var l = k.name;
        k = k.size;
        var m = Fd(l);
        m = 0 < m ? l.slice(0, m) : l;
        var h = c.Fa;
        c.Fa += k;
        e[m] = [k, h];
        for (l = 0; l < k; ++l) {
          d[h] = l, c.Va[h++] = m;
        }
      }
    }
    c = a.ha;
    d = 0;
    e = b;
    f = Fd(b);
    0 < f && (d = parseInt(b.slice(f + 1)) >>> 0, e = b.slice(0, f));
    if ((e = a.Wa[e]) && d < e[0] && (d += e[1], c[d] = c[d] || W.getUniformLocation(a, b))) {
      return d;
    }
  }
  return -1;
}, glLinkProgram:a => {
  a = X[a];
  W.linkProgram(a);
  a.ha = 0;
  a.Wa = {};
}, glShaderSource:(a, b, c, d) => {
  for (var e = "", f = 0; f < b; ++f) {
    e += N(w[c + 4 * f >> 2], d ? w[d + 4 * f >> 2] : void 0);
  }
  W.shaderSource(Y[a], e);
}, glTexImage2D:(a, b, c, d, e, f, g, k, l) => {
  if (W.ua) {
    W.texImage2D(a, b, c, d, e, f, g, k, l);
  } else {
    if (l) {
      var m = Gd(k);
      l >>>= 31 - Math.clz32(m.BYTES_PER_ELEMENT);
      W.texImage2D(a, b, c, d, e, f, g, k, m, l);
    } else {
      if (l) {
        m = Gd(k);
        var h = e * (d * ({5:3, 6:4, 8:2, 29502:3, 29504:4, 26917:2, 26918:2, 29846:3, 29847:4}[g - 6402] || 1) * m.BYTES_PER_ELEMENT + 4 - 1 & -4);
        l = m.subarray(l >>> 31 - Math.clz32(m.BYTES_PER_ELEMENT), l + h >>> 31 - Math.clz32(m.BYTES_PER_ELEMENT));
      } else {
        l = null;
      }
      W.texImage2D(a, b, c, d, e, f, g, k, l);
    }
  }
}, glTexParameteri:(a, b, c) => W.texParameteri(a, b, c), glUniform1i:(a, b) => {
  var c = W, d = c.uniform1i, e = W.ab;
  q(e, "Attempted to call glUniform*() without an active GL program set! (build with -sGL_TRACK_ERRORS for standards-conformant behavior)");
  var f = e.ha[a];
  "number" == typeof f && (e.ha[a] = f = W.getUniformLocation(e, e.Va[a] + (0 < f ? `[${f}]` : "")));
  d.call(c, f, b);
}, glUniformBlockBinding:(a, b, c) => {
  a = X[a];
  W.uniformBlockBinding(a, b, c);
}, glUseProgram:a => {
  a = X[a];
  W.useProgram(a);
  W.ab = a;
}, glVertexAttribPointer:(a, b, c, d, e, f) => {
  W.vertexAttribPointer(a, b, c, !!d, e, f);
}, glViewport:(a, b, c, d) => W.viewport(a, b, c, d), proc_exit:a => {
  throw new Ca(a);
}, textureFromURL:function(a, b, c, d, e) {
  let f = Z[c].$, g = new Image(), k = N(b), l = Zc(d), m = Zc(e);
  g.onload = function() {
    let h = ud[a];
    h ? (f.bindTexture(f.TEXTURE_2D, h), f.texImage2D(f.TEXTURE_2D, 0, f.RGBA, f.RGBA, f.UNSIGNED_BYTE, g), f.generateMipmap(f.TEXTURE_2D), f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MIN_FILTER, f.LINEAR_MIPMAP_LINEAR), f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MAG_FILTER, f.LINEAR), f.bindTexture(f.TEXTURE_2D, null), l()) : m("Texture failed to load (it no longer exists):\t" + k);
  };
  g.onerror = function() {
    m("Texture failed to load:\t" + k);
  };
  g.src = k;
}}, Md;
function Nd() {
  if (0 < hb) {
    ib = Nd;
  } else {
    Kd();
    var a = ha();
    q(0 == (a & 3));
    0 == a && (a += 4);
    w[a >> 2] = 34821223;
    w[a + 4 >> 2] = 2310721022;
    w[0] = 1668509029;
    if (0 < hb) {
      ib = Nd;
    } else {
      q(!Md);
      Md = !0;
      n.calledRun = !0;
      if (!ea) {
        q(!ta);
        ta = !0;
        fa();
        if (!n.noFSInit && !ub) {
          q(!ub, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
          ub = !0;
          Nb("/dev/tty", "/dev/stdin");
          Nb("/dev/tty", "/dev/stdout");
          Nb("/dev/tty1", "/dev/stderr");
          a = Qb("/dev/stdin", 0);
          var b = Qb("/dev/stdout", 1), c = Qb("/dev/stderr", 1);
          q(0 === a.C, `invalid handle for stdin (${a.C})`);
          q(1 === b.C, `invalid handle for stdout (${b.C})`);
          q(2 === c.C, `invalid handle for stderr (${c.C})`);
        }
        xa.__wasm_call_ctors();
        vb = !1;
        ma?.(n);
        q(!n._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
        fa();
      }
      fa();
    }
  }
}
var xa;
xa = await (async function() {
  var a = {env:Ld, wasi_snapshot_preview1:Ld};
  ya ??= aa + "terrain.wasm";
  a = await Ba(a);
  q(n === n, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  a = xa = a.instance.exports;
  q("undefined" != typeof a.__getTypeName, "missing Wasm export: __getTypeName");
  Nc = wa("__getTypeName", 1);
  q("undefined" != typeof a.malloc, "missing Wasm export: malloc");
  Id = wa("malloc", 1);
  q("undefined" != typeof a.free, "missing Wasm export: free");
  Oc = wa("free", 1);
  q("undefined" != typeof a.fflush, "missing Wasm export: fflush");
  q("undefined" != typeof a.emscripten_stack_get_end, "missing Wasm export: emscripten_stack_get_end");
  ha = a.emscripten_stack_get_end;
  q("undefined" != typeof a.emscripten_stack_get_base, "missing Wasm export: emscripten_stack_get_base");
  q("undefined" != typeof a._emscripten_timeout, "missing Wasm export: _emscripten_timeout");
  Jd = wa("_emscripten_timeout", 2);
  q("undefined" != typeof a.strerror, "missing Wasm export: strerror");
  wb = wa("strerror", 1);
  q("undefined" != typeof a.emscripten_stack_init, "missing Wasm export: emscripten_stack_init");
  Kd = a.emscripten_stack_init;
  q("undefined" != typeof a.emscripten_stack_get_free, "missing Wasm export: emscripten_stack_get_free");
  q("undefined" != typeof a._emscripten_stack_restore, "missing Wasm export: _emscripten_stack_restore");
  q("undefined" != typeof a._emscripten_stack_alloc, "missing Wasm export: _emscripten_stack_alloc");
  q("undefined" != typeof a.emscripten_stack_get_current, "missing Wasm export: emscripten_stack_get_current");
  nd = a.emscripten_stack_get_current;
  q("undefined" != typeof a.__cxa_increment_exception_refcount, "missing Wasm export: __cxa_increment_exception_refcount");
  q("undefined" != typeof a.memory, "missing Wasm export: memory");
  va = a.memory;
  q("undefined" != typeof a.__indirect_function_table, "missing Wasm export: __indirect_function_table");
  Lc = a.__indirect_function_table;
  ua();
  return xa;
}());
Nd();
ta ? moduleRtn = n : moduleRtn = new Promise((a, b) => {
  ma = a;
  na = b;
});
for (const a of Object.keys(n)) {
  a in moduleArg || Object.defineProperty(moduleArg, a, {configurable:!0, get() {
    u(`Access to module property ('${a}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
  }});
}
;


    return moduleRtn;
  };
})();

// Export using a UMD style export, or ES6 exports if selected
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = createModule;
  // This default export looks redundant, but it allows TS to import this
  // commonjs style module.
  module.exports.default = createModule;
} else if (typeof define === 'function' && define['amd'])
  define([], () => createModule);

