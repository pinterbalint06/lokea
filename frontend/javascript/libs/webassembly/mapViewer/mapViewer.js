// This code implements the `-sMODULARIZE` settings by taking the generated
// JS program code (INNER_JS_CODE) and wrapping it in a factory function.

// When targetting node and ES6 we use `await import ..` in the generated code
// so the outer function needs to be marked as async.
async function ModuleBuilder(moduleArg = {}) {
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
var n = moduleArg, aa = import.meta.url, ba = "", ca;
try {
  ba = (new URL(".", aa)).href;
} catch {
}
if (!globalThis.window && !globalThis.WorkerGlobalScope) {
  throw Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
}
ca = async a => {
  p(!da(a), "readAsync does not work with file:// URLs");
  a = await fetch(a, {credentials:"same-origin"});
  if (a.ok) {
    return a.arrayBuffer();
  }
  throw Error(a.status + " : " + a.url);
};
var ea = console.log.bind(console), q = console.error.bind(console);
p(!0, "worker environment detected but not enabled at build time.  Add `worker` to `-sENVIRONMENT` to enable.");
p(!0, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");
p(!0, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
globalThis.WebAssembly || q("no native wasm support detected");
var fa = !1;
function p(a, b) {
  a || t("Assertion failed" + (b ? ": " + b : ""));
}
var da = a => a.startsWith("file://");
function ia() {
  if (!fa) {
    var a = ja();
    0 == a && (a += 4);
    var b = v[a >> 2], c = v[a + 4 >> 2];
    34821223 == b && 2310721022 == c || t(`Stack overflow! Stack cookie has been overwritten at ${ka(a)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ka(c)} ${ka(b)}`);
    1668509029 != v[0] && t("Runtime error: The application has corrupted its heap memory area (address zero)!");
  }
}
var la = new Int16Array(1), ma = new Int8Array(la.buffer);
la[0] = 25459;
115 === ma[0] && 99 === ma[1] || t("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
function w(a) {
  return () => p(!1, `call to '${a}' via reference taken before Wasm module initialization`);
}
function x(a) {
  Object.getOwnPropertyDescriptor(n, a) && t(`\`Module.${a}\` was supplied but \`${a}\` not included in INCOMING_MODULE_JS_API`);
}
function na(a) {
  Object.getOwnPropertyDescriptor(n, a) || Object.defineProperty(n, a, {configurable:!0, get() {
    var b = `'${a}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    "FS_createPath" !== a && "FS_createDataFile" !== a && "FS_createPreloadedFile" !== a && "FS_preloadFile" !== a && "FS_unlink" !== a && "addRunDependency" !== a && "FS_createLazyFile" !== a && "FS_createDevice" !== a && "removeRunDependency" !== a || (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
    t(b);
  }});
}
var oa, pa, z, B, E, qa, G, v, ra, sa, ta, ua, va = !1;
function wa() {
  var a = xa.buffer;
  z = new Int8Array(a);
  E = new Int16Array(a);
  B = new Uint8Array(a);
  qa = new Uint16Array(a);
  G = new Int32Array(a);
  v = new Uint32Array(a);
  ra = new Float32Array(a);
  sa = new Float64Array(a);
  ta = new BigInt64Array(a);
  ua = new BigUint64Array(a);
}
p(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set, "JS engine does not provide full typed array support");
function t(a) {
  a = "Aborted(" + a + ")";
  q(a);
  fa = !0;
  a = new WebAssembly.RuntimeError(a);
  pa?.(a);
  throw a;
}
function ya(a, b) {
  return (...c) => {
    p(va, `native function \`${a}\` called before runtime initialization`);
    var d = za[a];
    p(d, `exported native function \`${a}\` not found`);
    p(c.length <= b, `native function \`${a}\` called with ${c.length} args but expects ${b}`);
    return d(...c);
  };
}
var Aa;
async function Ba(a) {
  try {
    var b = await ca(a);
    return new Uint8Array(b);
  } catch {
  }
  throw "both async and sync fetching of the wasm failed";
}
async function Ca(a, b) {
  try {
    var c = await Ba(a);
    return await WebAssembly.instantiate(c, b);
  } catch (d) {
    q(`failed to asynchronously prepare wasm: ${d}`), da(a) && q(`warning: Loading from a file URI (${a}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`), t(d);
  }
}
async function Da(a) {
  var b = Aa;
  try {
    var c = fetch(b, {credentials:"same-origin"});
    return await WebAssembly.instantiateStreaming(c, a);
  } catch (d) {
    q(`wasm streaming compile failed: ${d}`), q("falling back to ArrayBuffer instantiation");
  }
  return Ca(b, a);
}
class Ea {
  name="ExitStatus";
  constructor(a) {
    this.message = `Program terminated with exit(${a})`;
    this.status = a;
  }
}
var ka = a => {
  p("number" === typeof a, `ptrToString expects a number, got ${typeof a}`);
  return "0x" + (a >>> 0).toString(16).padStart(8, "0");
}, Fa = a => {
  Fa.Da || (Fa.Da = {});
  Fa.Da[a] || (Fa.Da[a] = 1, q(a));
};
class Ga {
  constructor(a) {
    this.l = a - 24;
  }
}
var Ha = 0, H = () => {
  p(void 0 != Ia);
  var a = G[+Ia >> 2];
  Ia += 4;
  return a;
}, Ja = (a, b) => {
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
}, Ka = a => {
  var b = "/" === a.charAt(0), c = "/" === a.slice(-1);
  (a = Ja(a.split("/").filter(d => !!d), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}, La = a => {
  var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
  a = b[0];
  b = b[1];
  if (!a && !b) {
    return ".";
  }
  b &&= b.slice(0, -1);
  return a + b;
}, Ma = () => a => crypto.getRandomValues(a), Na = a => {
  (Na = Ma())(a);
}, Oa = (...a) => {
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
  b = Ja(b.split("/").filter(e => !!e), !c).join("/");
  return (c ? "/" : "") + b || ".";
}, Pa = globalThis.TextDecoder && new TextDecoder(), Qa = (a, b, c, d) => {
  c = b + c;
  if (d) {
    return c;
  }
  for (; a[b] && !(b >= c);) {
    ++b;
  }
  return b;
}, Ra = (a, b = 0, c, d) => {
  c = Qa(a, b, c, d);
  if (16 < c - b && a.buffer && Pa) {
    return Pa.decode(a.subarray(b, c));
  }
  for (d = ""; b < c;) {
    var e = a[b++];
    if (e & 128) {
      var f = a[b++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | f);
      } else {
        var g = a[b++] & 63;
        224 == (e & 240) ? e = (e & 15) << 12 | f << 6 | g : (240 != (e & 248) && Fa("Invalid UTF-8 leading byte " + ka(e) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), e = (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63);
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}, Sa = [], Ta = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
  }
  return b;
}, Ua = (a, b, c, d) => {
  p("string" === typeof a, `stringToUTF8Array expects a string (got ${typeof a})`);
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
      1114111 < g && Fa("Invalid Unicode code point " + ka(g) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
      b[c++] = 240 | g >> 18;
      b[c++] = 128 | g >> 12 & 63;
      b[c++] = 128 | g >> 6 & 63;
      b[c++] = 128 | g & 63;
      f++;
    }
  }
  b[c] = 0;
  return c - e;
}, Va = a => {
  var b = Array(Ta(a) + 1);
  a = Ua(a, b, 0, b.length);
  b.length = a;
  return b;
}, Wa = [];
function Xa(a, b) {
  Wa[a] = {input:[], output:[], S:b};
  Ya(a, Za);
}
var Za = {open(a) {
  var b = Wa[a.node.qa];
  if (!b) {
    throw new J(43);
  }
  a.o = b;
  a.seekable = !1;
}, close(a) {
  a.o.S.ja(a.o);
}, ja(a) {
  a.o.S.ja(a.o);
}, read(a, b, c, d) {
  if (!a.o || !a.o.S.Ka) {
    throw new J(60);
  }
  for (var e = 0, f = 0; f < d; f++) {
    try {
      var g = a.o.S.Ka(a.o);
    } catch (h) {
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
  e && (a.node.V = Date.now());
  return e;
}, write(a, b, c, d) {
  if (!a.o || !a.o.S.Aa) {
    throw new J(60);
  }
  try {
    for (var e = 0; e < d; e++) {
      a.o.S.Aa(a.o, b[c + e]);
    }
  } catch (f) {
    throw new J(29);
  }
  d && (a.node.J = a.node.F = Date.now());
  return e;
}}, $a = {Ka() {
  a: {
    if (!Sa.length) {
      var a = null;
      globalThis.window?.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
      if (!a) {
        a = null;
        break a;
      }
      Sa = Va(a);
    }
    a = Sa.shift();
  }
  return a;
}, Aa(a, b) {
  null === b || 10 === b ? (ea(Ra(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ja(a) {
  0 < a.output?.length && (ea(Ra(a.output)), a.output = []);
}, mb() {
  return {Hb:25856, Jb:5, Gb:191, Ib:35387, Fb:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
}, nb() {
  return 0;
}, ob() {
  return [24, 80];
}}, ab = {Aa(a, b) {
  null === b || 10 === b ? (q(Ra(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ja(a) {
  0 < a.output?.length && (q(Ra(a.output)), a.output = []);
}}, bb = () => {
  t("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
}, K = {M:null, R() {
  return K.createNode(null, "/", 16895, 0);
}, createNode(a, b, c, d) {
  if (24576 === (c & 61440) || 4096 === (c & 61440)) {
    throw new J(63);
  }
  K.M || (K.M = {dir:{node:{U:K.j.U, P:K.j.P, ca:K.j.ca, pa:K.j.pa, Ua:K.j.Ua, sa:K.j.sa, Va:K.j.Va, Ca:K.j.Ca, ra:K.j.ra}, stream:{L:K.i.L}}, file:{node:{U:K.j.U, P:K.j.P}, stream:{L:K.i.L, read:K.i.read, write:K.i.write, za:K.i.za, Sa:K.i.Sa}}, link:{node:{U:K.j.U, P:K.j.P, ga:K.j.ga}, stream:{}}, Ga:{node:{U:K.j.U, P:K.j.P}, stream:cb}});
  c = db(a, b, c, d);
  M(c.mode) ? (c.j = K.M.dir.node, c.i = K.M.dir.stream, c.h = {}) : 32768 === (c.mode & 61440) ? (c.j = K.M.file.node, c.i = K.M.file.stream, c.u = 0, c.h = null) : 40960 === (c.mode & 61440) ? (c.j = K.M.link.node, c.i = K.M.link.stream) : 8192 === (c.mode & 61440) && (c.j = K.M.Ga.node, c.i = K.M.Ga.stream);
  c.V = c.J = c.F = Date.now();
  a && (a.h[b] = c, a.V = a.J = a.F = c.V);
  return c;
}, Ob(a) {
  return a.h ? a.h.subarray ? a.h.subarray(0, a.u) : new Uint8Array(a.h) : new Uint8Array(0);
}, j:{U(a) {
  var b = {};
  b.Kb = 8192 === (a.mode & 61440) ? a.id : 1;
  b.Qb = a.id;
  b.mode = a.mode;
  b.Sb = 1;
  b.uid = 0;
  b.Pb = 0;
  b.qa = a.qa;
  M(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.u : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.V = new Date(a.V);
  b.J = new Date(a.J);
  b.F = new Date(a.F);
  b.$a = 4096;
  b.Eb = Math.ceil(b.size / b.$a);
  return b;
}, P(a, b) {
  for (var c of ["mode", "atime", "mtime", "ctime"]) {
    null != b[c] && (a[c] = b[c]);
  }
  void 0 !== b.size && (b = b.size, a.u != b && (0 == b ? (a.h = null, a.u = 0) : (c = a.h, a.h = new Uint8Array(b), c && a.h.set(c.subarray(0, Math.min(b, a.u))), a.u = b)));
}, ca() {
  throw new J(44);
}, pa(a, b, c, d) {
  return K.createNode(a, b, c, d);
}, Ua(a, b, c) {
  try {
    var d = eb(b, c);
  } catch (f) {
  }
  if (d) {
    if (M(a.mode)) {
      for (var e in d.h) {
        throw new J(55);
      }
    }
    fb(d);
  }
  delete a.parent.h[a.name];
  b.h[c] = a;
  a.name = c;
  b.F = b.J = a.parent.F = a.parent.J = Date.now();
}, sa(a, b) {
  delete a.h[b];
  a.F = a.J = Date.now();
}, Va(a, b) {
  var c = eb(a, b), d;
  for (d in c.h) {
    throw new J(55);
  }
  delete a.h[b];
  a.F = a.J = Date.now();
}, Ca(a) {
  return [".", "..", ...Object.keys(a.h)];
}, ra(a, b, c) {
  a = K.createNode(a, b, 41471, 0);
  a.link = c;
  return a;
}, ga(a) {
  if (40960 !== (a.mode & 61440)) {
    throw new J(28);
  }
  return a.link;
}}, i:{read(a, b, c, d, e) {
  var f = a.node.h;
  if (e >= a.node.u) {
    return 0;
  }
  a = Math.min(a.node.u - e, d);
  p(0 <= a);
  if (8 < a && f.subarray) {
    b.set(f.subarray(e, e + a), c);
  } else {
    for (d = 0; d < a; d++) {
      b[c + d] = f[e + d];
    }
  }
  return a;
}, write(a, b, c, d, e, f) {
  p(!(b instanceof ArrayBuffer));
  b.buffer === z.buffer && (f = !1);
  if (!d) {
    return 0;
  }
  a = a.node;
  a.J = a.F = Date.now();
  if (b.subarray && (!a.h || a.h.subarray)) {
    if (f) {
      return p(0 === e, "canOwn must imply no weird position inside the file"), a.h = b.subarray(c, c + d), a.u = d;
    }
    if (0 === a.u && 0 === e) {
      return a.h = b.slice(c, c + d), a.u = d;
    }
    if (e + d <= a.u) {
      return a.h.set(b.subarray(c, c + d), e), d;
    }
  }
  f = e + d;
  var g = a.h ? a.h.length : 0;
  g >= f || (f = Math.max(f, g * (1048576 > g ? 2.0 : 1.125) >>> 0), 0 != g && (f = Math.max(f, 256)), g = a.h, a.h = new Uint8Array(f), 0 < a.u && a.h.set(g.subarray(0, a.u), 0));
  if (a.h.subarray && b.subarray) {
    a.h.set(b.subarray(c, c + d), e);
  } else {
    for (f = 0; f < d; f++) {
      a.h[e + f] = b[c + f];
    }
  }
  a.u = Math.max(a.u, e + d);
  return d;
}, L(a, b, c) {
  1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.u);
  if (0 > b) {
    throw new J(28);
  }
  return b;
}, za(a, b, c, d, e) {
  if (32768 !== (a.node.mode & 61440)) {
    throw new J(43);
  }
  a = a.node.h;
  if (e & 2 || !a || a.buffer !== z.buffer) {
    d = !0;
    e = bb();
    if (!e) {
      throw new J(48);
    }
    if (a) {
      if (0 < c || c + b < a.length) {
        a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
      }
      z.set(a, e);
    }
  } else {
    d = !1, e = a.byteOffset;
  }
  return {l:e, Za:d};
}, Sa(a, b, c, d) {
  K.i.write(a, b, 0, d, c, !1);
  return 0;
}}}, gb = (a, b) => {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}, N = (a, b, c) => {
  p("number" == typeof a, `UTF8ToString expects a number (got ${typeof a})`);
  return a ? Ra(B, a, b, c) : "";
}, hb = {EPERM:63, ENOENT:44, ESRCH:71, EINTR:27, EIO:29, ENXIO:60, E2BIG:1, ENOEXEC:45, EBADF:8, ECHILD:12, EAGAIN:6, EWOULDBLOCK:6, ENOMEM:48, EACCES:2, EFAULT:21, ENOTBLK:105, EBUSY:10, EEXIST:20, EXDEV:75, ENODEV:43, ENOTDIR:54, EISDIR:31, EINVAL:28, ENFILE:41, EMFILE:33, ENOTTY:59, ETXTBSY:74, EFBIG:22, ENOSPC:51, ESPIPE:70, EROFS:69, EMLINK:34, EPIPE:64, EDOM:18, ERANGE:68, ENOMSG:49, EIDRM:24, ECHRNG:106, EL2NSYNC:156, EL3HLT:107, EL3RST:108, ELNRNG:109, EUNATCH:110, ENOCSI:111, EL2HLT:112, 
EDEADLK:16, ENOLCK:46, EBADE:113, EBADR:114, EXFULL:115, ENOANO:104, EBADRQC:103, EBADSLT:102, EDEADLOCK:16, EBFONT:101, ENOSTR:100, ENODATA:116, ETIME:117, ENOSR:118, ENONET:119, ENOPKG:120, EREMOTE:121, ENOLINK:47, EADV:122, ESRMNT:123, ECOMM:124, EPROTO:65, EMULTIHOP:36, EDOTDOT:125, EBADMSG:9, ENOTUNIQ:126, EBADFD:127, EREMCHG:128, ELIBACC:129, ELIBBAD:130, ELIBSCN:131, ELIBMAX:132, ELIBEXEC:133, ENOSYS:52, ENOTEMPTY:55, ENAMETOOLONG:37, ELOOP:32, EOPNOTSUPP:138, EPFNOSUPPORT:139, ECONNRESET:15, 
ENOBUFS:42, EAFNOSUPPORT:5, EPROTOTYPE:67, ENOTSOCK:57, ENOPROTOOPT:50, ESHUTDOWN:140, ECONNREFUSED:14, EADDRINUSE:3, ECONNABORTED:13, ENETUNREACH:40, ENETDOWN:38, ETIMEDOUT:73, EHOSTDOWN:142, EHOSTUNREACH:23, EINPROGRESS:26, EALREADY:7, EDESTADDRREQ:17, EMSGSIZE:35, EPROTONOSUPPORT:66, ESOCKTNOSUPPORT:137, EADDRNOTAVAIL:4, ENETRESET:39, EISCONN:30, ENOTCONN:53, ETOOMANYREFS:141, EUSERS:136, EDQUOT:19, ESTALE:72, ENOTSUP:138, ENOMEDIUM:148, EILSEQ:25, EOVERFLOW:61, ECANCELED:11, ENOTRECOVERABLE:56, 
EOWNERDEAD:62, ESTRPIPE:135}, ib = async a => {
  var b = await ca(a);
  p(b, `Loading data file "${a}" failed (no arrayBuffer).`);
  return new Uint8Array(b);
}, jb = 0, kb = null, lb = {}, mb = null, nb = a => {
  jb--;
  p(a, "removeRunDependency requires an ID");
  p(lb[a]);
  delete lb[a];
  0 == jb && (null !== mb && (clearInterval(mb), mb = null), kb && (a = kb, kb = null, a()));
}, ob = a => {
  jb++;
  p(a, "addRunDependency requires an ID");
  p(!lb[a]);
  lb[a] = 1;
  null === mb && globalThis.setInterval && (mb = setInterval(() => {
    if (fa) {
      clearInterval(mb), mb = null;
    } else {
      var b = !1, c;
      for (c in lb) {
        b || (b = !0, q("still waiting on run dependencies:")), q(`dependency: ${c}`);
      }
      b && q("(end of list)");
    }
  }, 10000));
}, pb = [], qb = async(a, b) => {
  if ("undefined" != typeof Browser) {
    var c = Browser;
    v[c.l + 16 >> 2] = 0;
    v[c.l + 4 >> 2] = void 0;
    v[c.l + 8 >> 2] = void 0;
  }
  for (var d of pb) {
    if (d.canHandle(b)) {
      return p("AsyncFunction" === d.handle.constructor.name, "Filesystem plugin handlers must be async functions (See #24914)"), d.handle(a, b);
    }
  }
  return a;
}, rb = null, sb = {}, tb = [], ub = 1, O = null, vb = !1, wb = !0, J = class extends Error {
  name="ErrnoError";
  constructor(a) {
    super(va ? N(xb(a)) : "");
    this.K = a;
    for (var b in hb) {
      if (hb[b] === a) {
        this.code = b;
        break;
      }
    }
  }
}, yb = class {
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
}, zb = class {
  j={};
  i={};
  ea=null;
  constructor(a, b, c, d) {
    a ||= this;
    this.parent = a;
    this.R = a.R;
    this.id = ub++;
    this.name = b;
    this.mode = c;
    this.qa = d;
    this.V = this.J = this.F = Date.now();
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
  get qb() {
    return M(this.mode);
  }
  get pb() {
    return 8192 === (this.mode & 61440);
  }
};
function Ab(a, b = {}) {
  if (!a) {
    throw new J(44);
  }
  b.va ?? (b.va = !0);
  "/" === a.charAt(0) || (a = "//" + a);
  var c = 0;
  a: for (; 40 > c; c++) {
    a = a.split("/").filter(h => !!h);
    for (var d = rb, e = "/", f = 0; f < a.length; f++) {
      var g = f === a.length - 1;
      if (g && b.parent) {
        break;
      }
      if ("." !== a[f]) {
        if (".." === a[f]) {
          if (e = La(e), d === d.parent) {
            a = e + "/" + a.slice(f + 1).join("/");
            c--;
            continue a;
          } else {
            d = d.parent;
          }
        } else {
          e = Ka(e + "/" + a[f]);
          try {
            d = eb(d, a[f]);
          } catch (h) {
            if (44 === h?.K && g && b.tb) {
              return {path:e};
            }
            throw h;
          }
          !d.ea || g && !b.va || (d = d.ea.root);
          if (40960 === (d.mode & 61440) && (!g || b.ua)) {
            if (!d.j.ga) {
              throw new J(52);
            }
            d = d.j.ga(d);
            "/" === d.charAt(0) || (d = La(e) + "/" + d);
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
function Bb(a) {
  for (var b;;) {
    if (a === a.parent) {
      return a = a.R.Ra, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
    }
    b = b ? `${a.name}/${b}` : a.name;
    a = a.parent;
  }
}
function Cb(a, b) {
  for (var c = 0, d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % O.length;
}
function fb(a) {
  var b = Cb(a.parent.id, a.name);
  if (O[b] === a) {
    O[b] = a.Y;
  } else {
    for (b = O[b]; b;) {
      if (b.Y === a) {
        b.Y = a.Y;
        break;
      }
      b = b.Y;
    }
  }
}
function eb(a, b) {
  var c = M(a.mode) ? (c = Db(a, "x")) ? c : a.j.ca ? 0 : 2 : 54;
  if (c) {
    throw new J(c);
  }
  for (c = O[Cb(a.id, b)]; c; c = c.Y) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return a.j.ca(a, b);
}
function db(a, b, c, d) {
  p("object" == typeof a);
  a = new zb(a, b, c, d);
  b = Cb(a.parent.id, a.name);
  a.Y = O[b];
  return O[b] = a;
}
function M(a) {
  return 16384 === (a & 61440);
}
function Eb(a) {
  var b = ["r", "w", "rw"][a & 3];
  a & 512 && (b += "w");
  return b;
}
function Db(a, b) {
  if (wb) {
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
function Fb(a, b) {
  if (!M(a.mode)) {
    return 54;
  }
  try {
    return eb(a, b), 20;
  } catch (c) {
  }
  return Db(a, "wx");
}
function P(a) {
  a = tb[a];
  if (!a) {
    throw new J(8);
  }
  return a;
}
function Gb(a, b = -1) {
  p(-1 <= b);
  a = Object.assign(new yb(), a);
  if (-1 == b) {
    a: {
      for (b = 0; 4096 >= b; b++) {
        if (!tb[b]) {
          break a;
        }
      }
      throw new J(33);
    }
  }
  a.B = b;
  return tb[b] = a;
}
function Hb(a, b = -1) {
  a = Gb(a, b);
  a.i?.Mb?.(a);
  return a;
}
function Ib(a, b) {
  var c = null?.i.P, d = c ? null : a;
  c ??= a.j.P;
  if (!c) {
    throw new J(63);
  }
  c(d, b);
}
var cb = {open(a) {
  a.i = sb[a.node.qa].i;
  a.i.open?.(a);
}, L() {
  throw new J(70);
}};
function Ya(a, b) {
  sb[a] = {i:b};
}
function Jb(a, b) {
  if ("string" == typeof a) {
    throw a;
  }
  var c = "/" === b, d = !b;
  if (c && rb) {
    throw new J(10);
  }
  if (!c && !d) {
    var e = Ab(b, {va:!1});
    b = e.path;
    e = e.node;
    if (e.ea) {
      throw new J(10);
    }
    if (!M(e.mode)) {
      throw new J(54);
    }
  }
  b = {type:a, Tb:{}, Ra:b, sb:[]};
  a = a.R(b);
  a.R = b;
  b.root = a;
  c ? rb = a : e && (e.ea = b, e.R && e.R.sb.push(b));
}
function Kb(a, b, c) {
  var d = Ab(a, {parent:!0}).node;
  a = a && a.match(/([^\/]+|\/)\/*$/)[1];
  if (!a) {
    throw new J(28);
  }
  if ("." === a || ".." === a) {
    throw new J(20);
  }
  var e = Fb(d, a);
  if (e) {
    throw new J(e);
  }
  if (!d.j.pa) {
    throw new J(63);
  }
  return d.j.pa(d, a, b, c);
}
function Lb(a, b = 438) {
  return Kb(a, b & 4095 | 32768, 0);
}
function Q(a) {
  return Kb(a, 16895, 0);
}
function Mb(a, b, c) {
  "undefined" == typeof c && (c = b, b = 438);
  return Kb(a, b | 8192, c);
}
function Nb(a, b) {
  if (!Oa(a)) {
    throw new J(44);
  }
  var c = Ab(b, {parent:!0}).node;
  if (!c) {
    throw new J(44);
  }
  b = b && b.match(/([^\/]+|\/)\/*$/)[1];
  var d = Fb(c, b);
  if (d) {
    throw new J(d);
  }
  if (!c.j.ra) {
    throw new J(63);
  }
  c.j.ra(c, b, a);
}
function Ob(a) {
  var b = Ab(a, {parent:!0}).node;
  if (!b) {
    throw new J(44);
  }
  a = a && a.match(/([^\/]+|\/)\/*$/)[1];
  var c = eb(b, a);
  a: {
    try {
      var d = eb(b, a);
    } catch (f) {
      d = f.K;
      break a;
    }
    var e = Db(b, "wx");
    d = e ? e : M(d.mode) ? 31 : 0;
  }
  if (d) {
    throw new J(d);
  }
  if (!b.j.sa) {
    throw new J(63);
  }
  if (c.ea) {
    throw new J(10);
  }
  b.j.sa(b, a);
  fb(c);
}
function Pb(a, b) {
  a = "string" == typeof a ? Ab(a, {ua:!0}).node : a;
  Ib(a, {mode:b & 4095 | a.mode & -4096, F:Date.now(), Lb:void 0});
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
    var f = Ab(a, {ua:!(b & 131072), tb:!0});
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
  if (!f && (e = d ? 40960 === (d.mode & 61440) ? 32 : M(d.mode) && ("r" !== Eb(b) || b & 576) ? 31 : Db(d, Eb(b)) : 44)) {
    throw new J(e);
  }
  if (b & 512 && !f) {
    e = d;
    e = "string" == typeof e ? Ab(e, {ua:!0}).node : e;
    if (M(e.mode)) {
      throw new J(31);
    }
    if (32768 !== (e.mode & 61440)) {
      throw new J(28);
    }
    if (a = Db(e, "w")) {
      throw new J(a);
    }
    Ib(e, {size:0, timestamp:Date.now()});
  }
  b = Gb({node:d, path:Bb(d), flags:b & -131713, seekable:!0, position:0, i:d.i, Cb:[], error:!1});
  b.i.open && b.i.open(b);
  f && Pb(d, c & 511);
  return b;
}
function Rb(a) {
  if (null === a.B) {
    throw new J(8);
  }
  a.wa && (a.wa = null);
  try {
    a.i.close && a.i.close(a);
  } catch (b) {
    throw b;
  } finally {
    tb[a.B] = null;
  }
  a.B = null;
}
function Sb(a, b, c) {
  if (null === a.B) {
    throw new J(8);
  }
  if (!a.seekable || !a.i.L) {
    throw new J(70);
  }
  if (0 != c && 1 != c && 2 != c) {
    throw new J(28);
  }
  a.position = a.i.L(a, b, c);
  a.Cb = [];
}
function Tb(a, b, c, d, e, f) {
  p(0 <= c);
  if (0 > d || 0 > e) {
    throw new J(28);
  }
  if (null === a.B) {
    throw new J(8);
  }
  if (0 === (a.flags & 2097155)) {
    throw new J(8);
  }
  if (M(a.node.mode)) {
    throw new J(31);
  }
  if (!a.i.write) {
    throw new J(28);
  }
  a.seekable && a.flags & 1024 && Sb(a, 0, 2);
  var g = "undefined" != typeof e;
  if (!g) {
    e = a.position;
  } else if (!a.seekable) {
    throw new J(70);
  }
  b = a.i.write(a, b, c, d, e, f);
  g || (a.position += b);
  return b;
}
function Ub(a, b) {
  a = "string" == typeof a ? a : Bb(a);
  for (b = b.split("/").reverse(); b.length;) {
    var c = b.pop();
    if (c) {
      var d = Ka(a + "/" + c);
      try {
        Q(d);
      } catch (e) {
        if (20 != e.K) {
          throw e;
        }
      }
      a = d;
    }
  }
  return d;
}
function Vb(a, b, c, d) {
  a = Ka(("string" == typeof a ? a : Bb(a)) + "/" + b);
  return Lb(a, gb(c, d));
}
function Wb(a, b, c, d, e, f) {
  var g = b;
  a && (a = "string" == typeof a ? a : Bb(a), g = b ? Ka(a + "/" + b) : a);
  a = gb(d, e);
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
  a = Ka(("string" == typeof a ? a : Bb(a)) + "/" + b);
  b = gb(!!c, !!d);
  Xb.Qa ?? (Xb.Qa = 64);
  var e = Xb.Qa++ << 8 | 0;
  Ya(e, {open(f) {
    f.seekable = !1;
  }, close() {
    d?.buffer?.length && d(10);
  }, read(f, g, h, l) {
    for (var m = 0, k = 0; k < l; k++) {
      try {
        var r = c();
      } catch (u) {
        throw new J(29);
      }
      if (void 0 === r && 0 === m) {
        throw new J(6);
      }
      if (null === r || void 0 === r) {
        break;
      }
      m++;
      g[h + k] = r;
    }
    m && (f.node.V = Date.now());
    return m;
  }, write(f, g, h, l) {
    for (var m = 0; m < l; m++) {
      try {
        d(g[h + m]);
      } catch (k) {
        throw new J(29);
      }
    }
    l && (f.node.J = f.node.F = Date.now());
    return m;
  }});
  return Mb(a, b, e);
}
function Yb(a) {
  if (!(a.pb || a.qb || a.link || a.h)) {
    if (globalThis.XMLHttpRequest) {
      t("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
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
  function f(k, r, u, y, A) {
    k = k.node.h;
    if (A >= k.length) {
      return 0;
    }
    y = Math.min(k.length - A, y);
    p(0 <= y);
    if (k.slice) {
      for (var C = 0; C < y; C++) {
        r[u + C] = k[A + C];
      }
    } else {
      for (C = 0; C < y; C++) {
        r[u + C] = k.get(A + C);
      }
    }
    return y;
  }
  class g {
    xa=!1;
    H=[];
    ba=void 0;
    Na=0;
    La=0;
    get(k) {
      if (!(k > this.length - 1 || 0 > k)) {
        var r = k % this.Pa;
        return this.ba(k / this.Pa | 0)[r];
      }
    }
    ub(k) {
      this.ba = k;
    }
    Oa() {
      var k = new XMLHttpRequest();
      k.open("HEAD", c, !1);
      k.send(null);
      200 <= k.status && 300 > k.status || 304 === k.status || t("Couldn't load " + c + ". Status: " + k.status);
      var r = Number(k.getResponseHeader("Content-length")), u, y = (u = k.getResponseHeader("Accept-Ranges")) && "bytes" === u;
      k = (u = k.getResponseHeader("Content-Encoding")) && "gzip" === u;
      var A = 1048576;
      y || (A = r);
      var C = this;
      C.ub(F => {
        var L = F * A, D = (F + 1) * A - 1;
        D = Math.min(D, r - 1);
        if ("undefined" == typeof C.H[F]) {
          var ha = C.H;
          L > D && t("invalid range (" + L + ", " + D + ") or no bytes requested!");
          D > r - 1 && t("only " + r + " bytes available! programmer error!");
          var I = new XMLHttpRequest();
          I.open("GET", c, !1);
          r !== A && I.setRequestHeader("Range", "bytes=" + L + "-" + D);
          I.responseType = "arraybuffer";
          I.overrideMimeType && I.overrideMimeType("text/plain; charset=x-user-defined");
          I.send(null);
          200 <= I.status && 300 > I.status || 304 === I.status || t("Couldn't load " + c + ". Status: " + I.status);
          L = void 0 !== I.response ? new Uint8Array(I.response || []) : Va(I.responseText || "");
          ha[F] = L;
        }
        "undefined" == typeof C.H[F] && t("doXHR failed!");
        return C.H[F];
      });
      if (k || !r) {
        A = r = 1, A = r = this.ba(0).length, ea("LazyFiles on gzip forces download of the whole file when length is accessed");
      }
      this.Na = r;
      this.La = A;
      this.xa = !0;
    }
    get length() {
      this.xa || this.Oa();
      return this.Na;
    }
    get Pa() {
      this.xa || this.Oa();
      return this.La;
    }
  }
  if (globalThis.XMLHttpRequest) {
    t("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");
    var h = new g();
    var l = void 0;
  } else {
    l = c, h = void 0;
  }
  var m = Vb(a, b, d, e);
  h ? m.h = h : l && (m.h = null, m.url = l);
  Object.defineProperties(m, {u:{get:function() {
    return this.h.length;
  }}});
  a = {};
  for (const [k, r] of Object.entries(m.i)) {
    a[k] = (...u) => {
      Yb(m);
      return r(...u);
    };
  }
  a.read = (k, r, u, y, A) => {
    Yb(m);
    return f(k, r, u, y, A);
  };
  a.za = (k, r, u) => {
    Yb(m);
    var y = bb();
    if (!y) {
      throw new J(48);
    }
    f(k, z, y, r, u);
    return {l:y, Za:!0};
  };
  m.i = a;
  return m;
}
var $b = {}, Ia = void 0, ac = {}, bc = a => {
  for (; a.length;) {
    var b = a.pop();
    a.pop()(b);
  }
};
function cc(a) {
  return this.v(v[a >> 2]);
}
var dc = {}, ec = {}, fc = {}, gc = class extends Error {
  constructor(a) {
    super(a);
    this.name = "InternalError";
  }
}, hc = (a, b, c) => {
  function d(h) {
    h = c(h);
    if (h.length !== a.length) {
      throw new gc("Mismatched type converter count");
    }
    for (var l = 0; l < a.length; ++l) {
      R(a[l], h[l]);
    }
  }
  a.forEach(h => fc[h] = b);
  var e = Array(b.length), f = [], g = 0;
  for (let [h, l] of b.entries()) {
    ec.hasOwnProperty(l) ? e[h] = ec[l] : (f.push(l), dc.hasOwnProperty(l) || (dc[l] = []), dc[l].push(() => {
      e[h] = ec[l];
      ++g;
      g === f.length && d(e);
    }));
  }
  0 === f.length && d(e);
}, S = a => {
  for (var b = "";;) {
    var c = B[a++];
    if (!c) {
      return b;
    }
    b += String.fromCharCode(c);
  }
}, T = class extends Error {
  constructor(a) {
    super(a);
    this.name = "BindingError";
  }
}, ic = a => {
  throw new T(a);
};
function jc(a, b, c = {}) {
  var d = b.name;
  if (!a) {
    throw new T(`type "${d}" must have a positive integer typeid pointer`);
  }
  if (ec.hasOwnProperty(a)) {
    if (c.kb) {
      return;
    }
    throw new T(`Cannot register type '${d}' twice`);
  }
  ec[a] = b;
  delete fc[a];
  dc.hasOwnProperty(a) && (b = dc[a], delete dc[a], b.forEach(e => e()));
}
function R(a, b, c = {}) {
  return jc(a, b, c);
}
var kc = (a, b, c) => {
  switch(b) {
    case 1:
      return c ? d => z[d] : d => B[d];
    case 2:
      return c ? d => E[d >> 1] : d => qa[d >> 1];
    case 4:
      return c ? d => G[d >> 2] : d => v[d >> 2];
    case 8:
      return c ? d => ta[d >> 3] : d => ua[d >> 3];
    default:
      throw new TypeError(`invalid integer width (${b}): ${a}`);
  }
}, lc = a => {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}, mc = (a, b, c, d) => {
  if (b < c || b > d) {
    throw new TypeError(`Passing a number "${lc(b)}" from JS side to C/C++ side to an argument of type "${a}", which is outside the valid range [${c}, ${d}]!`);
  }
}, nc = a => {
  throw new T(a.g.s.m.name + " instance already deleted");
}, oc = !1, pc = () => {
}, qc = (a, b, c) => {
  if (b === c) {
    return a;
  }
  if (void 0 === c.D) {
    return null;
  }
  a = qc(a, b, c.D);
  return null === a ? null : c.cb(a);
}, rc = {}, sc = {}, tc = (a, b) => {
  if (void 0 === b) {
    throw new T("ptr should not be undefined");
  }
  for (; a.D;) {
    b = a.ia(b), a = a.D;
  }
  return sc[b];
}, vc = (a, b) => {
  if (!b.s || !b.l) {
    throw new gc("makeClassHandle requires ptr and ptrType");
  }
  if (!!b.I !== !!b.A) {
    throw new gc("Both smartPtrType and smartPtr must be specified");
  }
  b.count = {value:1};
  return uc(Object.create(a, {g:{value:b, writable:!0}}));
};
function wc(a) {
  function b() {
    return this.la ? vc(this.m.X, {s:this.vb, l:c, I:this, A:a}) : vc(this.m.X, {s:this, l:a});
  }
  var c = this.hb(a);
  if (!c) {
    return this.Ia(a), null;
  }
  var d = tc(this.m, c);
  if (void 0 !== d) {
    if (0 === d.g.count.value) {
      return d.g.l = c, d.g.A = a, d.clone();
    }
    d = d.clone();
    this.Ia(a);
    return d;
  }
  d = this.m.gb(c);
  d = rc[d];
  if (!d) {
    return b.call(this);
  }
  d = this.ka ? d.ab : d.pointerType;
  var e = qc(c, this.m, d.m);
  return null === e ? b.call(this) : this.la ? vc(d.m.X, {s:d, l:e, I:this, A:a}) : vc(d.m.X, {s:d, l:e});
}
var uc = a => {
  if (!globalThis.FinalizationRegistry) {
    return uc = b => b, a;
  }
  oc = new FinalizationRegistry(b => {
    console.warn(b.rb);
    b = b.g;
    --b.count.value;
    0 === b.count.value && (b.A ? b.I.N(b.A) : b.s.m.N(b.l));
  });
  uc = b => {
    var c = b.g;
    if (c.A) {
      var d = {g:c};
      c = Error(`Embind found a leaked C++ instance ${c.s.m.name} <${ka(c.l)}>.\n` + "We'll free it automatically in this case, but this functionality is not reliable across various environments.\nMake sure to invoke .delete() manually once you're done with the instance instead.\nOriginally allocated");
      "captureStackTrace" in Error && Error.captureStackTrace(c, wc);
      d.rb = c.stack.replace(/^Error: /, "");
      oc.register(b, d, b);
    }
    return b;
  };
  pc = b => {
    oc.unregister(b);
  };
  return uc(a);
}, xc = [];
function yc() {
}
var zc = (a, b) => Object.defineProperty(b, "name", {value:a}), Ac = (a, b, c) => {
  if (void 0 === a[b].T) {
    var d = a[b];
    a[b] = function(...e) {
      if (!a[b].T.hasOwnProperty(e.length)) {
        throw new T(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${a[b].T})!`);
      }
      return a[b].T[e.length].apply(this, e);
    };
    a[b].T = [];
    a[b].T[d.$] = d;
  }
}, Bc = (a, b) => {
  if (n.hasOwnProperty(a)) {
    throw new T(`Cannot register public name '${a}' twice`);
  }
  n[a] = b;
  n[a].$ = void 0;
}, Cc = a => {
  p("string" === typeof a);
  a = a.replace(/[^a-zA-Z0-9_]/g, "$");
  var b = a.charCodeAt(0);
  return 48 <= b && 57 >= b ? `_${a}` : a;
};
function Dc(a, b, c, d, e, f, g, h) {
  this.name = a;
  this.constructor = b;
  this.X = c;
  this.N = d;
  this.D = e;
  this.gb = f;
  this.ia = g;
  this.cb = h;
  this.wb = [];
}
var Ec = (a, b, c) => {
  for (; b !== c;) {
    if (!b.ia) {
      throw new T(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);
    }
    a = b.ia(a);
    b = b.D;
  }
  return a;
};
function Fc(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new T(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new T(`Cannot pass "${lc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new T(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  return Ec(b.g.l, b.g.s.m, this.m);
}
function Gc(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new T(`null is not a valid ${this.name}`);
    }
    if (this.la) {
      var c = this.Ba();
      null !== a && a.push(this.N, c);
      return c;
    }
    return 0;
  }
  if (!b || !b.g) {
    throw new T(`Cannot pass "${lc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new T(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (!this.ka && b.g.s.ka) {
    throw new T(`Cannot convert argument of type ${b.g.I ? b.g.I.name : b.g.s.name} to parameter type ${this.name}`);
  }
  c = Ec(b.g.l, b.g.s.m, this.m);
  if (this.la) {
    if (void 0 === b.g.A) {
      throw new T("Passing raw pointer to smart pointer is illegal");
    }
    switch(this.Bb) {
      case 0:
        if (b.g.I === this) {
          c = b.g.A;
        } else {
          throw new T(`Cannot convert argument of type ${b.g.I ? b.g.I.name : b.g.s.name} to parameter type ${this.name}`);
        }
        break;
      case 1:
        c = b.g.A;
        break;
      case 2:
        if (b.g.I === this) {
          c = b.g.A;
        } else {
          var d = b.clone();
          c = this.xb(c, Hc(() => d["delete"]()));
          null !== a && a.push(this.N, c);
        }
        break;
      default:
        throw new T("Unsupporting sharing policy");
    }
  }
  return c;
}
function Ic(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new T(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new T(`Cannot pass "${lc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new T(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (b.g.s.ka) {
    throw new T(`Cannot convert argument of type ${b.g.s.name} to parameter type ${this.name}`);
  }
  return Ec(b.g.l, b.g.s.m, this.m);
}
function Jc(a, b, c, d, e, f, g, h, l, m, k) {
  this.name = a;
  this.m = b;
  this.ya = c;
  this.ka = d;
  this.la = e;
  this.vb = f;
  this.Bb = g;
  this.Ta = h;
  this.Ba = l;
  this.xb = m;
  this.N = k;
  e || void 0 !== b.D ? this.C = Gc : (this.C = d ? Fc : Ic, this.G = null);
}
var Kc = (a, b) => {
  if (!n.hasOwnProperty(a)) {
    throw new gc("Replacing nonexistent public symbol");
  }
  n[a] = b;
  n[a].$ = void 0;
}, Lc = [], U = (a, b, c = !1) => {
  p(!c, "Async bindings are only supported with JSPI.");
  a = S(a);
  (c = Lc[b]) || (Lc[b] = c = Mc.get(b));
  p(Mc.get(b) == c, "JavaScript-side Wasm function table mirror is out of date!");
  if ("function" != typeof c) {
    throw new T(`unknown function pointer with signature ${a}: ${b}`);
  }
  return c;
};
class Nc extends Error {
}
var Rc = a => {
  a = Oc(a);
  var b = S(a);
  Qc(a);
  return b;
}, Sc = (a, b) => {
  function c(f) {
    e[f] || ec[f] || (fc[f] ? fc[f].forEach(c) : (d.push(f), e[f] = !0));
  }
  var d = [], e = {};
  b.forEach(c);
  throw new Nc(`${a}: ` + d.map(Rc).join([", "]));
}, Tc = (a, b) => {
  for (var c = [], d = 0; d < a; d++) {
    c.push(v[b + 4 * d >> 2]);
  }
  return c;
};
function Uc(a) {
  for (var b = 1; b < a.length; ++b) {
    if (null !== a[b] && void 0 === a[b].G) {
      return !0;
    }
  }
  return !1;
}
function Vc(a, b, c, d, e) {
  (a < b || a > c) && e(`function ${d} called with ${a} arguments, expected ${b == c ? b : `${b} to ${c}`}`);
}
function Wc(a, b, c, d, e, f) {
  var g = b.length;
  if (2 > g) {
    throw new T("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  p(!f, "Async bindings are only supported with JSPI.");
  var h = null !== b[1] && null !== c, l = Uc(b);
  c = !b[0].Ma;
  var m = g - 2;
  var k = b.length - 2;
  for (var r = b.length - 1; 2 <= r && b[r].optional; --r) {
    k--;
  }
  r = b[0];
  var u = b[1];
  d = [a, ic, d, e, bc, r.v.bind(r), u?.C.bind(u)];
  for (e = 2; e < g; ++e) {
    r = b[e], d.push(r.C.bind(r));
  }
  if (!l) {
    for (e = h ? 1 : 2; e < b.length; ++e) {
      null !== b[e].G && d.push(b[e].G);
    }
  }
  d.push(Vc, k, m);
  l = Uc(b);
  m = b.length - 2;
  k = [];
  e = ["fn"];
  h && e.push("thisWired");
  for (g = 0; g < m; ++g) {
    k.push(`arg${g}`), e.push(`arg${g}Wired`);
  }
  k = k.join(",");
  e = e.join(",");
  k = `return function (${k}) {\n` + "checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);\n";
  l && (k += "var destructors = [];\n");
  u = l ? "destructors" : "null";
  r = "humanName throwBindingError invoker fn runDestructors fromRetWire toClassParamWire".split(" ");
  h && (k += `var thisWired = toClassParamWire(${u}, this);\n`);
  for (g = 0; g < m; ++g) {
    var y = `toArg${g}Wire`;
    k += `var arg${g}Wired = ${y}(${u}, arg${g});\n`;
    r.push(y);
  }
  k += (c || f ? "var rv = " : "") + `invoker(${e});\n`;
  if (l) {
    k += "runDestructors(destructors);\n";
  } else {
    for (g = h ? 1 : 2; g < b.length; ++g) {
      f = 1 === g ? "thisWired" : "arg" + (g - 2) + "Wired", null !== b[g].G && (k += `${f}_dtor(${f});\n`, r.push(`${f}_dtor`));
    }
  }
  c && (k += "var ret = fromRetWire(rv);\nreturn ret;\n");
  k += "}\n";
  r.push("checkArgCount", "minArgs", "maxArgs");
  k = `if (arguments.length !== ${r.length}){ throw new Error(humanName + "Expected ${r.length} closure arguments " + arguments.length + " given."); }\n${k}`;
  b = (new Function(r, k))(...d);
  return zc(a, b);
}
var Xc = a => {
  a = a.trim();
  const b = a.indexOf("(");
  if (-1 === b) {
    return a;
  }
  p(a.endsWith(")"), "Parentheses for argument names should match.");
  return a.slice(0, b);
}, Yc = [], V = [0, 1, , 1, null, 1, !0, 1, !1, 1], Zc = a => {
  9 < a && 0 === --V[a + 1] && (p(void 0 !== V[a], "Decref for unallocated handle."), V[a] = void 0, Yc.push(a));
}, $c = a => {
  if (!a) {
    throw new T(`Cannot use deleted val. handle = ${a}`);
  }
  p(2 === a || void 0 !== V[a] && 0 === a % 2, `invalid handle: ${a}`);
  return V[a];
}, Hc = a => {
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
}, ad = {name:"emscripten::val", v:a => {
  var b = $c(a);
  Zc(a);
  return b;
}, C:(a, b) => Hc(b), O:cc, G:null}, bd = (a, b) => {
  switch(b) {
    case 4:
      return function(c) {
        return this.v(ra[c >> 2]);
      };
    case 8:
      return function(c) {
        return this.v(sa[c >> 3]);
      };
    default:
      throw new TypeError(`invalid float width (${b}): ${a}`);
  }
}, cd = (a, b, c) => {
  p("number" == typeof c, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return Ua(a, B, b, c);
}, dd = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, ed = (a, b, c) => {
  p(0 == a % 2, "Pointer passed to UTF16ToString must be aligned to two bytes!");
  a >>= 1;
  b = Qa(qa, a, b / 2, c);
  if (16 < b - a && dd) {
    return dd.decode(qa.subarray(a, b));
  }
  for (c = ""; a < b; ++a) {
    c += String.fromCharCode(qa[a]);
  }
  return c;
}, fd = (a, b, c) => {
  p(0 == b % 2, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
  p("number" == typeof c, "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
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
}, gd = a => 2 * a.length, hd = (a, b, c) => {
  p(0 == a % 4, "Pointer passed to UTF32ToString must be aligned to four bytes!");
  var d = "";
  a >>= 2;
  for (var e = 0; !(e >= b / 4); e++) {
    var f = v[a + e];
    if (!f && !c) {
      break;
    }
    d += String.fromCodePoint(f);
  }
  return d;
}, jd = (a, b, c) => {
  p(0 == b % 4, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
  p("number" == typeof c, "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
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
}, kd = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    65535 < a.codePointAt(c) && c++, b += 4;
  }
  return b;
}, ld = [], md = a => {
  var b = ld.length;
  ld.push(a);
  return b;
}, nd = (a, b) => {
  for (var c = Array(a), d = 0; d < a; ++d) {
    var e = d, f = v[b + 4 * d >> 2], g = ec[f];
    if (void 0 === g) {
      throw a = `${`parameter ${d}`} has unknown type ${Rc(f)}`, new T(a);
    }
    c[e] = g;
  }
  return c;
}, od = (a, b, c) => {
  var d = [];
  a = a(d, c);
  d.length && (v[b >> 2] = Hc(d));
  return a;
}, pd = {}, qd = a => {
  var b = pd[a];
  return void 0 === b ? S(a) : b;
}, rd = {}, td = a => {
  if (fa) {
    q("user callback triggered after runtime exited or application aborted.  Ignoring.");
  } else {
    try {
      a();
    } catch (b) {
      if (a = b, !(a instanceof Ea || "unwind" == a)) {
        throw ia(), a instanceof WebAssembly.RuntimeError && 0 >= sd() && q("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)"), a;
      }
    }
  }
}, ud = [], vd = [0, document, window], wd = a => {
  a = 2 < a ? N(a) : a;
  return vd[a] || document.querySelector(a);
}, W, xd = 1, yd = [], X = [], zd = [], Y = [], Ad = [], Z = [], Bd = a => {
  for (var b = xd++, c = a.length; c < b; c++) {
    a[c] = null;
  }
  return b;
}, Cd = (a, b, c, d) => {
  for (var e = 0; e < a; e++) {
    var f = W[c](), g = f && Bd(d);
    f && (f.name = g, d[g] = f);
    G[b + 4 * e >> 2] = g;
  }
}, Ed = (a, b) => {
  a.H || (a.H = a.getContext, a.getContext = function(d, e) {
    e = a.H(d, e);
    return "webgl" == d == e instanceof WebGLRenderingContext ? e : null;
  });
  var c = a.getContext("webgl2", b);
  return c ? Dd(c, b) : 0;
}, Dd = (a, b) => {
  var c = Bd(Z);
  b = {handle:c, attributes:b, version:b.da, Z:a};
  a.canvas && (a.canvas.Ya = b);
  Z[c] = b;
  return c;
}, Fd, Gd = ["default", "low-power", "high-performance"], Hd = {}, Jd = () => {
  if (!Id) {
    var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.language || "C").replace("-", "_") + ".UTF-8", _:"./this.program"}, b;
    for (b in Hd) {
      void 0 === Hd[b] ? delete a[b] : a[b] = Hd[b];
    }
    var c = [];
    for (b in a) {
      c.push(`${b}=${a[b]}`);
    }
    Id = c;
  }
  return Id;
}, Id, Kd = a => "]" == a.slice(-1) && a.lastIndexOf("["), Ld = a => {
  a -= 5120;
  return 0 == a ? z : 1 == a ? B : 2 == a ? E : 4 == a ? G : 6 == a ? ra : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a ? v : qa;
};
function Md(a, b) {
  "function" == typeof a ? a(b) : console.error(b);
}
O = Array(4096);
Jb(K, "/");
Q("/tmp");
Q("/home");
Q("/home/web_user");
(function() {
  Q("/dev");
  Ya(259, {read:() => 0, write:(d, e, f, g) => g, L:() => 0});
  Mb("/dev/null", 259);
  Xa(1280, $a);
  Xa(1536, ab);
  Mb("/dev/tty", 1280);
  Mb("/dev/tty1", 1536);
  var a = new Uint8Array(1024), b = 0, c = () => {
    0 === b && (Na(a), b = a.byteLength);
    return a[--b];
  };
  Xb("/dev", "random", c);
  Xb("/dev", "urandom", c);
  Q("/dev/shm");
  Q("/dev/shm/tmp");
})();
(function() {
  Q("/proc");
  var a = Q("/proc/self");
  Q("/proc/self/fd");
  Jb({R() {
    var b = db(a, "fd", 16895, 73);
    b.i = {L:K.i.L};
    b.j = {ca(c, d) {
      c = +d;
      var e = P(c);
      c = {parent:null, R:{Ra:"fake"}, j:{ga:() => e.path}, id:c + 1};
      return c.parent = c;
    }, Ca() {
      return Array.from(tb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
    }};
    return b;
  }}, "/proc/self/fd");
})();
(() => {
  let a = yc.prototype;
  Object.assign(a, {isAliasOf:function(c) {
    if (!(this instanceof yc && c instanceof yc)) {
      return !1;
    }
    var d = this.g.s.m, e = this.g.l;
    c.g = c.g;
    var f = c.g.s.m;
    for (c = c.g.l; d.D;) {
      e = d.ia(e), d = d.D;
    }
    for (; f.D;) {
      c = f.ia(c), f = f.D;
    }
    return d === f && e === c;
  }, clone:function() {
    this.g.l || nc(this);
    if (this.g.fa) {
      return this.g.count.value += 1, this;
    }
    var c = uc, d = Object, e = d.create, f = Object.getPrototypeOf(this), g = this.g;
    c = c(e.call(d, f, {g:{value:{count:g.count, aa:g.aa, fa:g.fa, l:g.l, s:g.s, A:g.A, I:g.I}}}));
    c.g.count.value += 1;
    c.g.aa = !1;
    return c;
  }, ["delete"]() {
    this.g.l || nc(this);
    if (this.g.aa && !this.g.fa) {
      throw new T("Object already scheduled for deletion");
    }
    pc(this);
    var c = this.g;
    --c.count.value;
    0 === c.count.value && (c.A ? c.I.N(c.A) : c.s.m.N(c.l));
    this.g.fa || (this.g.A = void 0, this.g.l = void 0);
  }, isDeleted:function() {
    return !this.g.l;
  }, deleteLater:function() {
    this.g.l || nc(this);
    if (this.g.aa && !this.g.fa) {
      throw new T("Object already scheduled for deletion");
    }
    xc.push(this);
    this.g.aa = !0;
    return this;
  }});
  const b = Symbol.dispose;
  b && (a[b] = a["delete"]);
})();
Object.assign(Jc.prototype, {hb(a) {
  this.Ta && (a = this.Ta(a));
  return a;
}, Ia(a) {
  this.N?.(a);
}, O:cc, v:wc});
p(10 === V.length);
x("ENVIRONMENT");
x("GL_MAX_TEXTURE_IMAGE_UNITS");
x("SDL_canPlayWithWebAudio");
x("SDL_numSimultaneouslyQueuedBuffers");
x("INITIAL_MEMORY");
x("wasmMemory");
x("arguments");
x("buffer");
x("canvas");
x("doNotCaptureKeyboard");
x("dynamicLibraries");
x("elementPointerLock");
x("extraStackTrace");
x("forcedAspectRatio");
x("instantiateWasm");
x("keyboardListeningElement");
x("freePreloadedMediaOnUse");
x("loadSplitModule");
x("locateFile");
x("logReadFiles");
x("mainScriptUrlOrBlob");
x("mem");
x("monitorRunDependencies");
x("noExitRuntime");
x("noInitialRun");
x("onAbort");
x("onCustomMessage");
x("onExit");
x("onFree");
x("onFullScreen");
x("onMalloc");
x("onRealloc");
x("onRuntimeInitialized");
x("postMainLoop");
x("postRun");
x("preInit");
x("preMainLoop");
x("preRun");
x("preinitializedWebGLContext");
x("preloadPlugins");
x("print");
x("printErr");
x("setStatus");
x("statusMessage");
x("stderr");
x("stdin");
x("stdout");
x("thisProgram");
x("wasm");
x("wasmBinary");
x("websocket");
x("fetchSettings");
p("undefined" == typeof n.memoryInitializerPrefixURL, "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof n.pthreadMainPrefixURL, "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof n.cdInitializerPrefixURL, "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof n.filePackagePrefixURL, "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof n.read, "Module.read option was removed");
p("undefined" == typeof n.readAsync, "Module.readAsync option was removed (modify readAsync in JS)");
p("undefined" == typeof n.readBinary, "Module.readBinary option was removed (modify readBinary in JS)");
p("undefined" == typeof n.setWindowTitle, "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
p("undefined" == typeof n.TOTAL_MEMORY, "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
p("undefined" == typeof n.ENVIRONMENT, "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
p("undefined" == typeof n.STACK_SIZE, "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
p("undefined" == typeof n.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
p("undefined" == typeof n.INITIAL_MEMORY, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
n.addRunDependency = ob;
n.removeRunDependency = nb;
n.UTF8ToString = N;
n.FS_preloadFile = async(a, b, c, d, e, f, g, h) => {
  var l = b ? Oa(Ka(a + "/" + b)) : a, m;
  a: {
    for (var k = m = `cp ${l}`;;) {
      if (!lb[m]) {
        break a;
      }
      m = k + Math.random();
    }
  }
  ob(m);
  try {
    k = c, "string" == typeof c && (k = await ib(c)), k = await qb(k, l), h?.(), f || Wb(a, b, k, d, e, g);
  } finally {
    nb(m);
  }
};
n.FS_unlink = (...a) => Ob(...a);
n.FS_createPath = (...a) => Ub(...a);
n.FS_createDevice = (...a) => Xb(...a);
n.FS_createDataFile = (...a) => Wb(...a);
n.FS_createLazyFile = (...a) => Zb(...a);
"writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertI32PairToI53Checked convertU32PairToI53 stackAlloc getTempRet0 setTempRet0 zeroMemory withStackSave inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr runMainThreadEmAsm autoResumeAudioContext getDynCaller dynCall runtimeKeepalivePush runtimeKeepalivePop asmjsMangle HandleAllocator addOnPreRun addOnInit addOnPostCtor addOnPreMain addOnExit addOnPostRun STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS ccall cwrap convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction intArrayToString stringToAscii stringToNewUTF8 stringToUTF8OnStack writeArrayToMemory registerKeyEventCallback getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData registerBatteryEventCallback setCanvasElementSize getCanvasElementSize jsStackTrace getCallstack convertPCtoSourceLocation checkWasiClock wasiRightsToMuslOFlags wasiOFlagsToMuslOFlags safeSetTimeout setImmediateWrapped safeRequestAnimationFrame clearImmediateWrapped registerPostMainLoop registerPreMainLoop getPromise makePromise idsToPromises makePromiseCallback findMatchingCatch Browser_asyncPrepareDataCounter isLeapYear ydayFromDate arraySum addDays getSocketFromFD getSocketAddress FS_mkdirTree _setNetworkCallback webgl_enable_WEBGL_multi_draw webgl_enable_EXT_polygon_offset_clamp webgl_enable_EXT_clip_control webgl_enable_WEBGL_polygon_mode emscriptenWebGLGet emscriptenWebGLGetUniform emscriptenWebGLGetVertexAttrib __glGetActiveAttribOrUniform writeGLArray registerWebGlEventCallback runAndAbortIfError emscriptenWebGLGetIndexed webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance ALLOC_NORMAL ALLOC_STACK allocate writeStringToMemory writeAsciiToMemory allocateUTF8 allocateUTF8OnStack demangle stackTrace getNativeTypeSize getFunctionArgsName createJsInvokerSignature PureVirtualError registerInheritedInstance unregisterInheritedInstance getInheritedInstanceCount getLiveInheritedInstances enumReadValueFromPointer setDelayFunction validateThis count_emval_handles".split(" ").forEach(function(a) {
  na(a);
});
"run out err callMain abort wasmExports HEAPF32 HEAPF64 HEAP8 HEAPU8 HEAP16 HEAPU16 HEAP32 HEAPU32 HEAP64 HEAPU64 writeStackCookie checkStackCookie INT53_MAX INT53_MIN bigintToI53Checked stackSave stackRestore createNamedFunction ptrToString exitJS getHeapMax growMemory ENV ERRNO_CODES strError DNS Protocols Sockets timers warnOnce readEmAsmArgsArray readEmAsmArgs runEmAsmFunction jstoi_q getExecutableName handleException keepRuntimeAlive callUserCallback maybeExit asyncLoad alignMemory mmapAlloc wasmTable wasmMemory getUniqueRunDependency noExitRuntime freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS UTF8Decoder UTF8ArrayToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 intArrayFromString AsciiToString UTF16Decoder UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 JSEvents specialHTMLTargets maybeCStringToJsString findEventTarget findCanvasEventTarget currentFullscreenStrategy restoreOldWindowedStyle UNWIND_CACHE ExitStatus getEnvStrings doReadv doWritev initRandomFill randomFill emSetImmediate emClearImmediate_deps emClearImmediate promiseMap uncaughtExceptionCount exceptionLast exceptionCaught ExceptionInfo Browser requestFullscreen requestFullScreen setCanvasSize getUserMedia createContext getPreloadedImageData__data wget MONTH_DAYS_REGULAR MONTH_DAYS_LEAP MONTH_DAYS_REGULAR_CUMULATIVE MONTH_DAYS_LEAP_CUMULATIVE SYSCALLS preloadPlugins FS_createPreloadedFile FS_modeStringToFlags FS_getMode FS_stdin_getChar_buffer FS_stdin_getChar FS_readFile FS FS_root FS_mounts FS_devices FS_streams FS_nextInode FS_nameTable FS_currentPath FS_initialized FS_ignorePermissions FS_filesystems FS_syncFSRequests FS_lookupPath FS_getPath FS_hashName FS_hashAddNode FS_hashRemoveNode FS_lookupNode FS_createNode FS_destroyNode FS_isRoot FS_isMountpoint FS_isFile FS_isDir FS_isLink FS_isChrdev FS_isBlkdev FS_isFIFO FS_isSocket FS_flagsToPermissionString FS_nodePermissions FS_mayLookup FS_mayCreate FS_mayDelete FS_mayOpen FS_checkOpExists FS_nextfd FS_getStreamChecked FS_getStream FS_createStream FS_closeStream FS_dupStream FS_doSetAttr FS_chrdev_stream_ops FS_major FS_minor FS_makedev FS_registerDevice FS_getDevice FS_getMounts FS_syncfs FS_mount FS_unmount FS_lookup FS_mknod FS_statfs FS_statfsStream FS_statfsNode FS_create FS_mkdir FS_mkdev FS_symlink FS_rename FS_rmdir FS_readdir FS_readlink FS_stat FS_fstat FS_lstat FS_doChmod FS_chmod FS_lchmod FS_fchmod FS_doChown FS_chown FS_lchown FS_fchown FS_doTruncate FS_truncate FS_ftruncate FS_utime FS_open FS_close FS_isClosed FS_llseek FS_read FS_write FS_mmap FS_msync FS_ioctl FS_writeFile FS_cwd FS_chdir FS_createDefaultDirectories FS_createDefaultDevices FS_createSpecialDirectories FS_createStandardStreams FS_staticInit FS_init FS_quit FS_findObject FS_analyzePath FS_createFile FS_forceLoadFile FS_absolutePath FS_createFolder FS_createLink FS_joinPath FS_mmapAlloc FS_standardizePath MEMFS TTY PIPEFS SOCKFS tempFixedLengthArray miniTempWebGLFloatBuffers miniTempWebGLIntBuffers heapObjectForWebGLType toTypedArrayIndex GL computeUnpackAlignedImageSize colorChannelsInGlTextureFormat emscriptenWebGLGetTexPixelData webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos AL GLUT EGL GLEW IDBStore SDL SDL_gfx print printErr jstoi_s InternalError BindingError throwInternalError throwBindingError registeredTypes awaitingDependencies typeDependencies tupleRegistrations structRegistrations sharedRegisterType whenDependentTypesAreResolved getTypeName getFunctionName heap32VectorToArray requireRegisteredType usesDestructorStack checkArgCount getRequiredArgCount createJsInvoker UnboundTypeError EmValType EmValOptionalType throwUnboundTypeError ensureOverloadTable exposePublicSymbol replacePublicSymbol embindRepr registeredInstances getBasestPointer getInheritedInstance registeredPointers registerType integerReadValueFromPointer floatReadValueFromPointer assertIntegerRange readPointer runDestructors craftInvokerFunction embind__requireFunction genericPointerToWireType constNoSmartPtrRawPointerToWireType nonConstNoSmartPtrRawPointerToWireType init_RegisteredPointer RegisteredPointer RegisteredPointer_fromWireType runDestructor releaseClassHandle finalizationRegistry detachFinalizer_deps detachFinalizer attachFinalizer makeClassHandle init_ClassHandle ClassHandle throwInstanceAlreadyDeleted deletionQueue flushPendingDeletes delayFunction RegisteredClass shallowCopyInternalPointer downcastPointer upcastPointer char_0 char_9 makeLegalFunctionName emval_freelist emval_handles emval_symbols getStringOrSymbol Emval emval_returnValue emval_lookupTypes emval_methodCallers emval_addMethodCaller handleError".split(" ").forEach(na);
var Nd = {101552:() => {
  throw "A böngésződ nem támogatja a WebGL-t!";
}, 101603:a => {
  throw "Sikertelen shader fordítás: " + N(a);
}, 101667:a => {
  throw "Sikertelen shader összekapcsolás: " + N(a);
}, 101737:(a, b) => {
  if (b = document.getElementById(N(b))) {
    b.innerText = a;
  }
}, 101827:a => {
  throw "Sikertelen fájl beolvasás: " + N(a);
}}, Oc = w("___getTypeName"), Od = w("_malloc"), Qc = w("_free"), ja = w("_emscripten_stack_get_end"), Pd = w("__emscripten_timeout"), xb = w("_strerror"), Qd = w("_emscripten_stack_init"), sd = w("_emscripten_stack_get_current"), xa = w("wasmMemory"), Mc = w("wasmTable"), Rd = {__cxa_throw:(a, b, c) => {
  a = new Ga(a);
  v[a.l + 16 >> 2] = 0;
  v[a.l + 4 >> 2] = b;
  v[a.l + 8 >> 2] = c;
  Ha++;
  p(!1, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
}, __syscall_fcntl64:function(a, b, c) {
  Ia = c;
  try {
    var d = P(a);
    switch(b) {
      case 0:
        var e = H();
        if (0 > e) {
          break;
        }
        for (; tb[e];) {
          e++;
        }
        return Hb(d, e).B;
      case 1:
      case 2:
        return 0;
      case 3:
        return d.flags;
      case 4:
        return e = H(), d.flags |= e, 0;
      case 12:
        return e = H(), E[e + 0 >> 1] = 2, 0;
      case 13:
      case 14:
        return 0;
    }
    return -28;
  } catch (f) {
    if ("undefined" == typeof $b || "ErrnoError" !== f.name) {
      throw f;
    }
    return -f.K;
  }
}, __syscall_ioctl:function(a, b, c) {
  Ia = c;
  try {
    var d = P(a);
    switch(b) {
      case 21509:
        return d.o ? 0 : -59;
      case 21505:
        if (!d.o) {
          return -59;
        }
        if (d.o.S.mb) {
          b = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          var e = H();
          G[e >> 2] = 25856;
          G[e + 4 >> 2] = 5;
          G[e + 8 >> 2] = 191;
          G[e + 12 >> 2] = 35387;
          for (var f = 0; 32 > f; f++) {
            z[e + f + 17] = b[f] || 0;
          }
        }
        return 0;
      case 21510:
      case 21511:
      case 21512:
        return d.o ? 0 : -59;
      case 21506:
      case 21507:
      case 21508:
        if (!d.o) {
          return -59;
        }
        if (d.o.S.nb) {
          for (e = H(), b = [], f = 0; 32 > f; f++) {
            b.push(z[e + f + 17]);
          }
        }
        return 0;
      case 21519:
        if (!d.o) {
          return -59;
        }
        e = H();
        return G[e >> 2] = 0;
      case 21520:
        return d.o ? -28 : -59;
      case 21537:
      case 21531:
        e = H();
        if (!d.i.lb) {
          throw new J(59);
        }
        return d.i.lb(d, b, e);
      case 21523:
        if (!d.o) {
          return -59;
        }
        d.o.S.ob && (f = [24, 80], e = H(), E[e >> 1] = f[0], E[e + 2 >> 1] = f[1]);
        return 0;
      case 21524:
        return d.o ? 0 : -59;
      case 21515:
        return d.o ? 0 : -59;
      default:
        return -28;
    }
  } catch (g) {
    if ("undefined" == typeof $b || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.K;
  }
}, __syscall_openat:function(a, b, c, d) {
  Ia = d;
  try {
    b = N(b);
    var e = b;
    if ("/" === e.charAt(0)) {
      b = e;
    } else {
      var f = -100 === a ? "/" : P(a).path;
      if (0 == e.length) {
        throw new J(44);
      }
      b = f + "/" + e;
    }
    var g = d ? H() : 0;
    return Qb(b, c, g).B;
  } catch (h) {
    if ("undefined" == typeof $b || "ErrnoError" !== h.name) {
      throw h;
    }
    return -h.K;
  }
}, _abort_js:() => t("native code called abort()"), _embind_finalize_value_object:a => {
  var b = ac[a];
  delete ac[a];
  var c = b.Ba, d = b.N, e = b.Ja, f = e.map(g => g.jb).concat(e.map(g => g.zb));
  hc([a], f, g => {
    var h = {}, l, m;
    for ([l, m] of e.entries()) {
      const k = g[l], r = m.ba, u = m.ib, y = g[l + e.length], A = m.yb, C = m.Ab;
      h[m.fb] = {read:F => k.v(r(u, F)), write:(F, L) => {
        var D = [];
        A(C, F, y.C(D, L));
        bc(D);
      }, optional:k.optional};
    }
    return [{name:b.name, v:k => {
      var r = {}, u;
      for (u in h) {
        r[u] = h[u].read(k);
      }
      d(k);
      return r;
    }, C:(k, r) => {
      for (var u in h) {
        if (!(u in r || h[u].optional)) {
          throw new TypeError(`Missing field: "${u}"`);
        }
      }
      var y = c();
      for (u in h) {
        h[u].write(y, r[u]);
      }
      null !== k && k.push(d, y);
      return y;
    }, O:cc, G:d}];
  });
}, _embind_register_bigint:(a, b, c, d, e) => {
  b = S(b);
  const f = 0n === d;
  let g = h => h;
  if (f) {
    const h = 8 * c;
    g = l => BigInt.asUintN(h, l);
    e = g(e);
  }
  R(a, {name:b, v:g, C:(h, l) => {
    if ("number" == typeof l) {
      l = BigInt(l);
    } else if ("bigint" != typeof l) {
      throw new TypeError(`Cannot convert "${lc(l)}" to ${this.name}`);
    }
    mc(b, l, d, e);
    return l;
  }, O:kc(b, c, !f), G:null});
}, _embind_register_bool:(a, b, c, d) => {
  b = S(b);
  R(a, {name:b, v:function(e) {
    return !!e;
  }, C:function(e, f) {
    return f ? c : d;
  }, O:function(e) {
    return this.v(B[e]);
  }, G:null});
}, _embind_register_class:(a, b, c, d, e, f, g, h, l, m, k, r, u) => {
  k = S(k);
  f = U(e, f);
  h &&= U(g, h);
  m &&= U(l, m);
  u = U(r, u);
  var y = Cc(k);
  Bc(y, function() {
    Sc(`Cannot construct ${k} due to unbound types`, [d]);
  });
  hc([a, b, c], d ? [d] : [], A => {
    A = A[0];
    if (d) {
      var C = A.m;
      var F = C.X;
    } else {
      F = yc.prototype;
    }
    A = zc(k, function(...I) {
      if (Object.getPrototypeOf(this) !== L) {
        throw new T(`Use 'new' to construct ${k}`);
      }
      if (void 0 === D.W) {
        throw new T(`${k} has no accessible constructor`);
      }
      var Pc = D.W[I.length];
      if (void 0 === Pc) {
        throw new T(`Tried to invoke ctor of ${k} with invalid number of parameters (${I.length}) - expected (${Object.keys(D.W).toString()}) parameters instead!`);
      }
      return Pc.apply(this, I);
    });
    var L = Object.create(F, {constructor:{value:A}});
    A.prototype = L;
    var D = new Dc(k, A, L, u, C, f, h, m);
    if (D.D) {
      var ha;
      (ha = D.D).Fa ?? (ha.Fa = []);
      D.D.Fa.push(D);
    }
    C = new Jc(k, D, !0, !1, !1);
    ha = new Jc(k + "*", D, !1, !1, !1);
    F = new Jc(k + " const*", D, !1, !0, !1);
    rc[a] = {pointerType:ha, ab:F};
    Kc(y, A);
    return [C, ha, F];
  });
}, _embind_register_class_constructor:(a, b, c, d, e, f) => {
  p(0 < b);
  var g = Tc(b, c);
  e = U(d, e);
  hc([], [a], h => {
    h = h[0];
    var l = `constructor ${h.name}`;
    void 0 === h.m.W && (h.m.W = []);
    if (void 0 !== h.m.W[b - 1]) {
      throw new T(`Cannot register multiple constructors with identical number of parameters (${b - 1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    h.m.W[b - 1] = () => {
      Sc(`Cannot construct ${h.name} due to unbound types`, g);
    };
    hc([], g, m => {
      m.splice(1, 0, null);
      h.m.W[b - 1] = Wc(l, m, null, e, f);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:(a, b, c, d, e, f, g, h, l) => {
  var m = Tc(c, d);
  b = S(b);
  b = Xc(b);
  f = U(e, f, l);
  hc([], [a], k => {
    function r() {
      Sc(`Cannot call ${u} due to unbound types`, m);
    }
    k = k[0];
    var u = `${k.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    h && k.m.wb.push(b);
    var y = k.m.X, A = y[b];
    void 0 === A || void 0 === A.T && A.className !== k.name && A.$ === c - 2 ? (r.$ = c - 2, r.className = k.name, y[b] = r) : (Ac(y, b, u), y[b].T[c - 2] = r);
    hc([], m, C => {
      C = Wc(u, C, k, f, g, l);
      void 0 === y[b].T ? (C.$ = c - 2, y[b] = C) : y[b].T[c - 2] = C;
      return [];
    });
    return [];
  });
}, _embind_register_emval:a => R(a, ad), _embind_register_float:(a, b, c) => {
  b = S(b);
  R(a, {name:b, v:d => d, C:(d, e) => {
    if ("number" != typeof e && "boolean" != typeof e) {
      throw new TypeError(`Cannot convert ${lc(e)} to ${this.name}`);
    }
    return e;
  }, O:bd(b, c), G:null});
}, _embind_register_integer:(a, b, c, d, e) => {
  b = S(b);
  let f = h => h;
  if (0 === d) {
    var g = 32 - 8 * c;
    f = h => h << g >>> g;
    e = f(e);
  }
  R(a, {name:b, v:f, C:(h, l) => {
    if ("number" != typeof l && "boolean" != typeof l) {
      throw new TypeError(`Cannot convert "${lc(l)}" to ${b}`);
    }
    mc(b, l, d, e);
    return l;
  }, O:kc(b, c, 0 !== d), G:null});
}, _embind_register_memory_view:(a, b, c) => {
  function d(f) {
    return new e(z.buffer, v[f + 4 >> 2], v[f >> 2]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
  c = S(c);
  R(a, {name:c, v:d, O:d}, {kb:!0});
}, _embind_register_std_string:(a, b) => {
  b = S(b);
  R(a, {name:b, v(c) {
    var d = N(c + 4, v[c >> 2], !0);
    Qc(c);
    return d;
  }, C(c, d) {
    d instanceof ArrayBuffer && (d = new Uint8Array(d));
    var e = "string" == typeof d;
    if (!(e || ArrayBuffer.isView(d) && 1 == d.BYTES_PER_ELEMENT)) {
      throw new T("Cannot pass non-string to std::string");
    }
    var f = e ? Ta(d) : d.length;
    var g = Od(4 + f + 1), h = g + 4;
    v[g >> 2] = f;
    e ? cd(d, h, f + 1) : B.set(d, h);
    null !== c && c.push(Qc, g);
    return g;
  }, O:cc, G(c) {
    Qc(c);
  }});
}, _embind_register_std_wstring:(a, b, c) => {
  c = S(c);
  if (2 === b) {
    var d = ed;
    var e = fd;
    var f = gd;
  } else {
    p(4 === b, "only 2-byte and 4-byte strings are currently supported"), d = hd, e = jd, f = kd;
  }
  R(a, {name:c, v:g => {
    var h = d(g + 4, v[g >> 2] * b, !0);
    Qc(g);
    return h;
  }, C:(g, h) => {
    if ("string" != typeof h) {
      throw new T(`Cannot pass non-string to C++ string type ${c}`);
    }
    var l = f(h), m = Od(4 + l + b);
    v[m >> 2] = l / b;
    e(h, m + 4, l + b);
    null !== g && g.push(Qc, m);
    return m;
  }, O:cc, G(g) {
    Qc(g);
  }});
}, _embind_register_value_object:(a, b, c, d, e, f) => {
  ac[a] = {name:S(b), Ba:U(c, d), N:U(e, f), Ja:[]};
}, _embind_register_value_object_field:(a, b, c, d, e, f, g, h, l, m) => {
  ac[a].Ja.push({fb:S(b), jb:c, ba:U(d, e), ib:f, zb:g, yb:U(h, l), Ab:m});
}, _embind_register_void:(a, b) => {
  b = S(b);
  R(a, {Ma:!0, name:b, v:() => {
  }, C:() => {
  }});
}, _emscripten_fs_load_embedded_files:a => {
  do {
    var b = v[a >> 2];
    a += 4;
    var c = v[a >> 2];
    a += 4;
    var d = v[a >> 2];
    a += 4;
    b = N(b);
    Ub("/", La(b));
    Wb(b, null, z.subarray(d, d + c), !0, !0, !0);
  } while (v[a >> 2]);
}, _emscripten_runtime_keepalive_clear:() => {
}, _emval_create_invoker:(a, b, c) => {
  var [d, ...e] = nd(a, b);
  b = d.C.bind(d);
  var f = e.map(l => l.O.bind(l));
  a--;
  var g = {toValue:$c};
  a = f.map((l, m) => {
    var k = `argFromPtr${m}`;
    g[k] = l;
    return `${k}(args${m ? "+" + 8 * m : ""})`;
  });
  switch(c) {
    case 0:
      var h = "toValue(handle)";
      break;
    case 2:
      h = "new (toValue(handle))";
      break;
    case 3:
      h = "";
      break;
    case 1:
      g.getStringOrSymbol = qd, h = "toValue(handle)[getStringOrSymbol(methodName)]";
  }
  h += `(${a})`;
  d.Ma || (g.toReturnWire = b, g.emval_returnValue = od, h = `return emval_returnValue(toReturnWire, destructorsRef, ${h})`);
  h = `return function (handle, methodName, destructorsRef, args) {
  ${h}
  }`;
  c = (new Function(Object.keys(g), h))(...Object.values(g));
  h = `methodCaller<(${e.map(l => l.name)}) => ${d.name}>`;
  return md(zc(h, c));
}, _emval_decref:Zc, _emval_incref:a => {
  9 < a && (V[a + 1] += 1);
}, _emval_invoke:(a, b, c, d, e) => ld[a](b, c, d, e), _emval_new_cstring:a => Hc(qd(a)), _emval_new_object:() => Hc({}), _emval_run_destructors:a => {
  var b = $c(a);
  bc(b);
  Zc(a);
}, _emval_set_property:(a, b, c) => {
  a = $c(a);
  b = $c(b);
  c = $c(c);
  a[b] = c;
}, _setitimer_js:(a, b) => {
  rd[a] && (clearTimeout(rd[a].id), delete rd[a]);
  if (!b) {
    return 0;
  }
  var c = setTimeout(() => {
    p(a in rd);
    delete rd[a];
    td(() => Pd(a, performance.now()));
  }, b);
  rd[a] = {id:c, Xb:b};
  return 0;
}, _tzset_js:(a, b, c, d) => {
  var e = (new Date()).getFullYear(), f = (new Date(e, 0, 1)).getTimezoneOffset();
  e = (new Date(e, 6, 1)).getTimezoneOffset();
  v[a >> 2] = 60 * Math.max(f, e);
  G[b >> 2] = Number(f != e);
  b = g => {
    var h = Math.abs(g);
    return `UTC${0 <= g ? "-" : "+"}${String(Math.floor(h / 60)).padStart(2, "0")}${String(h % 60).padStart(2, "0")}`;
  };
  a = b(f);
  b = b(e);
  p(a);
  p(b);
  p(16 >= Ta(a), `timezone name truncated to fit in TZNAME_MAX (${a})`);
  p(16 >= Ta(b), `timezone name truncated to fit in TZNAME_MAX (${b})`);
  e < f ? (cd(a, c, 17), cd(b, d, 17)) : (cd(a, d, 17), cd(b, c, 17));
}, emscripten_asm_const_int:(a, b, c) => {
  p(Array.isArray(ud));
  p(0 == c % 16);
  ud.length = 0;
  for (var d; d = B[b++];) {
    var e = String.fromCharCode(d), f = ["d", "f", "i", "p"];
    f.push("j");
    p(f.includes(e), `Invalid character ${d}("${e}") in readEmAsmArgs! Use only [${f}], and do not specify "v" for void return argument.`);
    e = 105 != d;
    e &= 112 != d;
    c += e && c % 8 ? 4 : 0;
    ud.push(112 == d ? v[c >> 2] : 106 == d ? ta[c >> 3] : 105 == d ? G[c >> 2] : sa[c >> 3]);
    c += e ? 8 : 4;
  }
  p(Nd.hasOwnProperty(a), `No EM_ASM constant found at address ${a}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return Nd[a](...ud);
}, emscripten_console_error:a => {
  p("number" == typeof a);
  console.error(N(a));
}, emscripten_get_now:() => performance.now(), emscripten_resize_heap:a => {
  var b = B.length;
  a >>>= 0;
  p(a > b);
  if (2147483648 < a) {
    return q(`Cannot enlarge memory, requested ${a} bytes, but the limit is ${2147483648} bytes!`), !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var d = b * (1 + 0.2 / c);
    d = Math.min(d, a + 100663296);
    var e = Math, f = e.min;
    d = Math.max(a, d);
    p(65536, "alignment argument is required");
    e = f.call(e, 2147483648, 65536 * Math.ceil(d / 65536));
    a: {
      f = e;
      d = xa.buffer.byteLength;
      try {
        xa.grow((f - d + 65535) / 65536 | 0);
        wa();
        var g = 1;
        break a;
      } catch (h) {
        q(`growMemory: Attempted to grow heap from ${d} bytes to ${f} bytes, but got error: ${h}`);
      }
      g = void 0;
    }
    if (g) {
      return !0;
    }
  }
  q(`Failed to grow the heap from ${b} bytes to ${e} bytes, not enough memory!`);
  return !1;
}, emscripten_set_canvas_element_size:(a, b, c) => {
  a = wd(a);
  if (!a) {
    return -4;
  }
  a.width = b;
  a.height = c;
  return 0;
}, emscripten_webgl_create_context:(a, b) => {
  p(b);
  var c = b >> 2;
  b = {alpha:!!z[b + 0], depth:!!z[b + 1], stencil:!!z[b + 2], antialias:!!z[b + 3], premultipliedAlpha:!!z[b + 4], preserveDrawingBuffer:!!z[b + 5], powerPreference:Gd[G[c + 2]], failIfMajorPerformanceCaveat:!!z[b + 12], da:G[c + 4], Rb:G[c + 5], Nb:z[b + 24], eb:z[b + 25], Ub:G[c + 7], Wb:z[b + 32]};
  1 !== b.da && 2 !== b.da && q(`Invalid WebGL version requested: ${b.da}`);
  2 !== b.da && q("WebGL 1 requested but only WebGL 2 is supported (MIN_WEBGL_VERSION is 2)");
  a = wd(a);
  return !a || b.eb ? 0 : Ed(a, b);
}, emscripten_webgl_destroy_context:a => {
  Fd == a && (Fd = 0);
  Fd === Z[a] && (Fd = null);
  "object" == typeof JSEvents && JSEvents.Vb(Z[a].Z.canvas);
  Z[a]?.Z.canvas && (Z[a].Z.canvas.Ya = void 0);
  Z[a] = null;
}, emscripten_webgl_get_current_context:() => Fd ? Fd.handle : 0, emscripten_webgl_make_context_current:a => {
  Fd = Z[a];
  n.ctx = W = Fd?.Z;
  return !a || W ? 0 : -5;
}, environ_get:(a, b) => {
  var c = 0, d = 0, e;
  for (e of Jd()) {
    var f = b + c;
    v[a + d >> 2] = f;
    c += cd(e, f, Infinity) + 1;
    d += 4;
  }
  return 0;
}, environ_sizes_get:(a, b) => {
  var c = Jd();
  v[a >> 2] = c.length;
  a = 0;
  for (var d of c) {
    a += Ta(d) + 1;
  }
  v[b >> 2] = a;
  return 0;
}, fd_close:function(a) {
  try {
    var b = P(a);
    Rb(b);
    return 0;
  } catch (c) {
    if ("undefined" == typeof $b || "ErrnoError" !== c.name) {
      throw c;
    }
    return c.K;
  }
}, fd_read:function(a, b, c, d) {
  try {
    a: {
      var e = P(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var h = v[a >> 2], l = v[a + 4 >> 2];
        a += 8;
        var m = e, k = h, r = l, u = f, y = z;
        p(0 <= k);
        if (0 > r || 0 > u) {
          throw new J(28);
        }
        if (null === m.B) {
          throw new J(8);
        }
        if (1 === (m.flags & 2097155)) {
          throw new J(8);
        }
        if (M(m.node.mode)) {
          throw new J(31);
        }
        if (!m.i.read) {
          throw new J(28);
        }
        var A = "undefined" != typeof u;
        if (!A) {
          u = m.position;
        } else if (!m.seekable) {
          throw new J(70);
        }
        var C = m.i.read(m, y, k, r, u);
        A || (m.position += C);
        var F = C;
        if (0 > F) {
          var L = -1;
          break a;
        }
        b += F;
        if (F < l) {
          break;
        }
        "undefined" != typeof f && (f += F);
      }
      L = b;
    }
    v[d >> 2] = L;
    return 0;
  } catch (D) {
    if ("undefined" == typeof $b || "ErrnoError" !== D.name) {
      throw D;
    }
    return D.K;
  }
}, fd_seek:function(a, b, c, d) {
  b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
  try {
    if (isNaN(b)) {
      return 61;
    }
    var e = P(a);
    Sb(e, b, c);
    ta[d >> 3] = BigInt(e.position);
    e.wa && 0 === b && 0 === c && (e.wa = null);
    return 0;
  } catch (f) {
    if ("undefined" == typeof $b || "ErrnoError" !== f.name) {
      throw f;
    }
    return f.K;
  }
}, fd_write:function(a, b, c, d) {
  try {
    a: {
      var e = P(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var h = v[a >> 2], l = v[a + 4 >> 2];
        a += 8;
        var m = Tb(e, z, h, l, f);
        if (0 > m) {
          var k = -1;
          break a;
        }
        b += m;
        if (m < l) {
          break;
        }
        "undefined" != typeof f && (f += m);
      }
      k = b;
    }
    v[d >> 2] = k;
    return 0;
  } catch (r) {
    if ("undefined" == typeof $b || "ErrnoError" !== r.name) {
      throw r;
    }
    return r.K;
  }
}, glActiveTexture:a => W.activeTexture(a), glAttachShader:(a, b) => {
  W.attachShader(X[a], Y[b]);
}, glBindBuffer:(a, b) => {
  35051 == a ? W.Ha = b : 35052 == a && (W.ta = b);
  W.bindBuffer(a, yd[b]);
}, glBindBufferRange:(a, b, c, d, e) => {
  W.bindBufferRange(a, b, yd[c], d, e);
}, glBindTexture:(a, b) => {
  W.bindTexture(a, zd[b]);
}, glBindVertexArray:a => {
  W.bindVertexArray(Ad[a]);
}, glBlendFunc:(a, b) => W.blendFunc(a, b), glBufferData:(a, b, c, d) => {
  c && b ? W.bufferData(a, B, d, c, b) : W.bufferData(a, b, d);
}, glBufferSubData:(a, b, c, d) => {
  c && W.bufferSubData(a, b, B, d, c);
}, glClear:a => W.clear(a), glClearColor:(a, b, c, d) => W.clearColor(a, b, c, d), glCompileShader:a => {
  W.compileShader(Y[a]);
}, glCreateProgram:() => {
  var a = Bd(X), b = W.createProgram();
  b.name = a;
  b.oa = b.ma = b.na = 0;
  b.Ea = 1;
  X[a] = b;
  return a;
}, glCreateShader:a => {
  var b = Bd(Y);
  Y[b] = W.createShader(a);
  return b;
}, glDeleteBuffers:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = G[b + 4 * c >> 2], e = yd[d];
    e && (W.deleteBuffer(e), e.name = 0, yd[d] = null, d == W.Ha && (W.Ha = 0), d == W.ta && (W.ta = 0));
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
    var d = G[b + 4 * c >> 2], e = zd[d];
    e && (W.deleteTexture(e), e.name = 0, zd[d] = null);
  }
}, glDeleteVertexArrays:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = G[b + 4 * c >> 2];
    W.deleteVertexArray(Ad[d]);
    Ad[d] = null;
  }
}, glDepthMask:a => {
  W.depthMask(!!a);
}, glDrawElements:(a, b, c, d) => {
  W.drawElements(a, b, c, d);
}, glEnable:a => W.enable(a), glEnableVertexAttribArray:a => {
  W.enableVertexAttribArray(a);
}, glGenBuffers:(a, b) => {
  Cd(a, b, "createBuffer", yd);
}, glGenTextures:(a, b) => {
  Cd(a, b, "createTexture", zd);
}, glGenVertexArrays:(a, b) => {
  Cd(a, b, "createVertexArray", Ad);
}, glGenerateMipmap:a => W.generateMipmap(a), glGetProgramInfoLog:(a, b, c, d) => {
  a = W.getProgramInfoLog(X[a]);
  b = 0 < b && d ? cd(a, d, b) : 0;
  c && (G[c >> 2] = b);
}, glGetProgramiv:(a, b, c) => {
  if (c && !(a >= xd)) {
    if (a = X[a], 35716 == b) {
      G[c >> 2] = W.getProgramInfoLog(a).length + 1;
    } else if (35719 == b) {
      if (!a.oa) {
        var d = W.getProgramParameter(a, 35718);
        for (b = 0; b < d; ++b) {
          a.oa = Math.max(a.oa, W.getActiveUniform(a, b).name.length + 1);
        }
      }
      G[c >> 2] = a.oa;
    } else if (35722 == b) {
      if (!a.ma) {
        for (d = W.getProgramParameter(a, 35721), b = 0; b < d; ++b) {
          a.ma = Math.max(a.ma, W.getActiveAttrib(a, b).name.length + 1);
        }
      }
      G[c >> 2] = a.ma;
    } else if (35381 == b) {
      if (!a.na) {
        for (d = W.getProgramParameter(a, 35382), b = 0; b < d; ++b) {
          a.na = Math.max(a.na, W.getActiveUniformBlockName(a, b).length + 1);
        }
      }
      G[c >> 2] = a.na;
    } else {
      G[c >> 2] = W.getProgramParameter(a, b);
    }
  }
}, glGetShaderInfoLog:(a, b, c, d) => {
  a = W.getShaderInfoLog(Y[a]);
  b = 0 < b && d ? cd(a, d, b) : 0;
  c && (G[c >> 2] = b);
}, glGetShaderiv:(a, b, c) => {
  c && (35716 == b ? (a = W.getShaderInfoLog(Y[a]), G[c >> 2] = a ? a.length + 1 : 0) : 35720 == b ? (a = W.getShaderSource(Y[a]), G[c >> 2] = a ? a.length + 1 : 0) : G[c >> 2] = W.getShaderParameter(Y[a], b));
}, glGetUniformBlockIndex:(a, b) => W.getUniformBlockIndex(X[a], N(b)), glGetUniformLocation:(a, b) => {
  b = N(b);
  if (a = X[a]) {
    var c = a, d = c.ha, e = c.Xa, f;
    if (!d) {
      c.ha = d = {};
      c.Wa = {};
      var g = W.getProgramParameter(c, 35718);
      for (f = 0; f < g; ++f) {
        var h = W.getActiveUniform(c, f);
        var l = h.name;
        h = h.size;
        var m = Kd(l);
        m = 0 < m ? l.slice(0, m) : l;
        var k = c.Ea;
        c.Ea += h;
        e[m] = [h, k];
        for (l = 0; l < h; ++l) {
          d[k] = l, c.Wa[k++] = m;
        }
      }
    }
    c = a.ha;
    d = 0;
    e = b;
    f = Kd(b);
    0 < f && (d = parseInt(b.slice(f + 1)) >>> 0, e = b.slice(0, f));
    if ((e = a.Xa[e]) && d < e[0] && (d += e[1], c[d] = c[d] || W.getUniformLocation(a, b))) {
      return d;
    }
  }
  return -1;
}, glLinkProgram:a => {
  a = X[a];
  W.linkProgram(a);
  a.ha = 0;
  a.Xa = {};
}, glShaderSource:(a, b, c, d) => {
  for (var e = "", f = 0; f < b; ++f) {
    e += N(v[c + 4 * f >> 2], d ? v[d + 4 * f >> 2] : void 0);
  }
  W.shaderSource(Y[a], e);
}, glTexImage2D:(a, b, c, d, e, f, g, h, l) => {
  if (W.ta) {
    W.texImage2D(a, b, c, d, e, f, g, h, l);
  } else {
    if (l) {
      var m = Ld(h);
      l >>>= 31 - Math.clz32(m.BYTES_PER_ELEMENT);
      W.texImage2D(a, b, c, d, e, f, g, h, m, l);
    } else {
      if (l) {
        m = Ld(h);
        var k = e * (d * ({5:3, 6:4, 8:2, 29502:3, 29504:4, 26917:2, 26918:2, 29846:3, 29847:4}[g - 6402] || 1) * m.BYTES_PER_ELEMENT + 4 - 1 & -4);
        l = m.subarray(l >>> 31 - Math.clz32(m.BYTES_PER_ELEMENT), l + k >>> 31 - Math.clz32(m.BYTES_PER_ELEMENT));
      } else {
        l = null;
      }
      W.texImage2D(a, b, c, d, e, f, g, h, l);
    }
  }
}, glTexParameteri:(a, b, c) => W.texParameteri(a, b, c), glUniform1i:(a, b) => {
  var c = W, d = c.uniform1i, e = W.bb;
  p(e, "Attempted to call glUniform*() without an active GL program set! (build with -sGL_TRACK_ERRORS for standards-conformant behavior)");
  var f = e.ha[a];
  "number" == typeof f && (e.ha[a] = f = W.getUniformLocation(e, e.Wa[a] + (0 < f ? `[${f}]` : "")));
  d.call(c, f, b);
}, glUniformBlockBinding:(a, b, c) => {
  a = X[a];
  W.uniformBlockBinding(a, b, c);
}, glUseProgram:a => {
  a = X[a];
  W.useProgram(a);
  W.bb = a;
}, glVertexAttribPointer:(a, b, c, d, e, f) => {
  W.vertexAttribPointer(a, b, c, !!d, e, f);
}, glViewport:(a, b, c, d) => W.viewport(a, b, c, d), proc_exit:a => {
  throw new Ea(a);
}, textureFromURL:function(a, b, c, d, e) {
  let f = Z[c].Z, g = N(b), h = $c(d), l = $c(e);
  fetch(g).then(function(m) {
    if (m.ok) {
      let k = m.headers.get("content-type");
      k && !k.startsWith("image/") && Md(l, "Invalid content-type:\t" + k);
      return m.blob();
    }
  }).then(function(m) {
    return createImageBitmap(m);
  }).then(function(m) {
    let k = zd[a];
    k ? (f.bindTexture(f.TEXTURE_2D, k), f.texImage2D(f.TEXTURE_2D, 0, f.RGBA, f.RGBA, f.UNSIGNED_BYTE, m), f.generateMipmap(f.TEXTURE_2D), f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MIN_FILTER, f.LINEAR_MIPMAP_LINEAR), f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MAG_FILTER, f.LINEAR), f.bindTexture(f.TEXTURE_2D, null), "function" == typeof h && h()) : "function" == typeof l && Md(l, "Texture failed to load (it no longer exists):\t" + g);
  }).catch(function() {
    Md(l, "Texture failed to load (Fetch/decoding error):\t" + g);
  });
}}, Sd;
function Td() {
  if (0 < jb) {
    kb = Td;
  } else {
    Qd();
    var a = ja();
    p(0 == (a & 3));
    0 == a && (a += 4);
    v[a >> 2] = 34821223;
    v[a + 4 >> 2] = 2310721022;
    v[0] = 1668509029;
    if (0 < jb) {
      kb = Td;
    } else {
      p(!Sd);
      Sd = !0;
      n.calledRun = !0;
      if (!fa) {
        p(!va);
        va = !0;
        ia();
        if (!n.noFSInit && !vb) {
          p(!vb, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
          vb = !0;
          Nb("/dev/tty", "/dev/stdin");
          Nb("/dev/tty", "/dev/stdout");
          Nb("/dev/tty1", "/dev/stderr");
          a = Qb("/dev/stdin", 0);
          var b = Qb("/dev/stdout", 1), c = Qb("/dev/stderr", 1);
          p(0 === a.B, `invalid handle for stdin (${a.B})`);
          p(1 === b.B, `invalid handle for stdout (${b.B})`);
          p(2 === c.B, `invalid handle for stderr (${c.B})`);
        }
        za.__wasm_call_ctors();
        wb = !1;
        oa?.(n);
        p(!n._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
        ia();
      }
      ia();
    }
  }
}
var za;
za = await (async function() {
  var a = {env:Rd, wasi_snapshot_preview1:Rd};
  Aa ??= n.locateFile ? ba + "mapViewer.wasm" : (new URL("mapViewer.wasm", import.meta.url)).href;
  a = await Da(a);
  p(n === n, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  a = za = a.instance.exports;
  p("undefined" != typeof a.__getTypeName, "missing Wasm export: __getTypeName");
  Oc = ya("__getTypeName", 1);
  p("undefined" != typeof a.malloc, "missing Wasm export: malloc");
  Od = ya("malloc", 1);
  p("undefined" != typeof a.free, "missing Wasm export: free");
  Qc = ya("free", 1);
  p("undefined" != typeof a.fflush, "missing Wasm export: fflush");
  p("undefined" != typeof a.emscripten_stack_get_end, "missing Wasm export: emscripten_stack_get_end");
  ja = a.emscripten_stack_get_end;
  p("undefined" != typeof a.emscripten_stack_get_base, "missing Wasm export: emscripten_stack_get_base");
  p("undefined" != typeof a._emscripten_timeout, "missing Wasm export: _emscripten_timeout");
  Pd = ya("_emscripten_timeout", 2);
  p("undefined" != typeof a.strerror, "missing Wasm export: strerror");
  xb = ya("strerror", 1);
  p("undefined" != typeof a.emscripten_stack_init, "missing Wasm export: emscripten_stack_init");
  Qd = a.emscripten_stack_init;
  p("undefined" != typeof a.emscripten_stack_get_free, "missing Wasm export: emscripten_stack_get_free");
  p("undefined" != typeof a._emscripten_stack_restore, "missing Wasm export: _emscripten_stack_restore");
  p("undefined" != typeof a._emscripten_stack_alloc, "missing Wasm export: _emscripten_stack_alloc");
  p("undefined" != typeof a.emscripten_stack_get_current, "missing Wasm export: emscripten_stack_get_current");
  sd = a.emscripten_stack_get_current;
  p("undefined" != typeof a.__cxa_increment_exception_refcount, "missing Wasm export: __cxa_increment_exception_refcount");
  p("undefined" != typeof a.memory, "missing Wasm export: memory");
  xa = a.memory;
  p("undefined" != typeof a.__indirect_function_table, "missing Wasm export: __indirect_function_table");
  Mc = a.__indirect_function_table;
  wa();
  return za;
}());
Td();
va ? moduleRtn = n : moduleRtn = new Promise((a, b) => {
  oa = a;
  pa = b;
});
for (const a of Object.keys(n)) {
  a in moduleArg || Object.defineProperty(moduleArg, a, {configurable:!0, get() {
    t(`Access to module property ('${a}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
  }});
}
;


  return moduleRtn;
}

// Export using a UMD style export, or ES6 exports if selected
export default ModuleBuilder;

