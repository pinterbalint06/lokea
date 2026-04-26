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
  var b = "undefined" !== typeof process && process.wb?.node ? a(process.wb.node) : 2147483647;
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
var m = moduleArg, aa = import.meta.url, ba = "", ca;
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
function ha() {
  if (!fa) {
    var a = ia();
    0 == a && (a += 4);
    var b = u[a >> 2], c = u[a + 4 >> 2];
    34821223 == b && 2310721022 == c || t(`Stack overflow! Stack cookie has been overwritten at ${ja(a)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ja(c)} ${ja(b)}`);
    1668509029 != u[0] && t("Runtime error: The application has corrupted its heap memory area (address zero)!");
  }
}
var ka = new Int16Array(1), la = new Int8Array(ka.buffer);
ka[0] = 25459;
115 === la[0] && 99 === la[1] || t("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
function v(a) {
  return () => p(!1, `call to '${a}' via reference taken before Wasm module initialization`);
}
function w(a) {
  Object.getOwnPropertyDescriptor(m, a) && t(`\`Module.${a}\` was supplied but \`${a}\` not included in INCOMING_MODULE_JS_API`);
}
function ma(a) {
  Object.getOwnPropertyDescriptor(m, a) || Object.defineProperty(m, a, {configurable:!0, get() {
    var b = `'${a}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    "FS_createPath" !== a && "FS_createDataFile" !== a && "FS_createPreloadedFile" !== a && "FS_preloadFile" !== a && "FS_unlink" !== a && "addRunDependency" !== a && "FS_createLazyFile" !== a && "FS_createDevice" !== a && "removeRunDependency" !== a || (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
    t(b);
  }});
}
var na, oa, x, C, D, pa, F, u, qa, ra, sa, ta, ua = !1;
function va() {
  var a = wa.buffer;
  x = new Int8Array(a);
  D = new Int16Array(a);
  C = new Uint8Array(a);
  pa = new Uint16Array(a);
  F = new Int32Array(a);
  u = new Uint32Array(a);
  qa = new Float32Array(a);
  ra = new Float64Array(a);
  sa = new BigInt64Array(a);
  ta = new BigUint64Array(a);
}
p(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set, "JS engine does not provide full typed array support");
function t(a) {
  a = "Aborted(" + a + ")";
  q(a);
  fa = !0;
  a = new WebAssembly.RuntimeError(a);
  oa?.(a);
  throw a;
}
function xa(a, b) {
  return (...c) => {
    p(ua, `native function \`${a}\` called before runtime initialization`);
    var d = ya[a];
    p(d, `exported native function \`${a}\` not found`);
    p(c.length <= b, `native function \`${a}\` called with ${c.length} args but expects ${b}`);
    return d(...c);
  };
}
var za;
async function Aa(a) {
  try {
    var b = await ca(a);
    return new Uint8Array(b);
  } catch {
  }
  throw "both async and sync fetching of the wasm failed";
}
async function Ba(a, b) {
  try {
    var c = await Aa(a);
    return await WebAssembly.instantiate(c, b);
  } catch (d) {
    q(`failed to asynchronously prepare wasm: ${d}`), da(a) && q(`warning: Loading from a file URI (${a}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`), t(d);
  }
}
async function Ca(a) {
  var b = za;
  try {
    var c = fetch(b, {credentials:"same-origin"});
    return await WebAssembly.instantiateStreaming(c, a);
  } catch (d) {
    q(`wasm streaming compile failed: ${d}`), q("falling back to ArrayBuffer instantiation");
  }
  return Ba(b, a);
}
class Da {
  name="ExitStatus";
  constructor(a) {
    this.message = `Program terminated with exit(${a})`;
    this.status = a;
  }
}
var ja = a => {
  p("number" === typeof a, `ptrToString expects a number, got ${typeof a}`);
  return "0x" + (a >>> 0).toString(16).padStart(8, "0");
}, Ea = a => {
  Ea.Ca || (Ea.Ca = {});
  Ea.Ca[a] || (Ea.Ca[a] = 1, q(a));
};
class Fa {
  constructor(a) {
    this.l = a - 24;
  }
}
var Ga = 0, H = () => {
  p(void 0 != Ha);
  var a = F[+Ha >> 2];
  Ha += 4;
  return a;
}, Ia = (a, b) => {
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
}, Ja = a => {
  var b = "/" === a.charAt(0), c = "/" === a.slice(-1);
  (a = Ia(a.split("/").filter(d => !!d), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}, Ka = a => {
  var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
  a = b[0];
  b = b[1];
  if (!a && !b) {
    return ".";
  }
  b &&= b.slice(0, -1);
  return a + b;
}, La = () => a => crypto.getRandomValues(a), Ma = a => {
  (Ma = La())(a);
}, Na = (...a) => {
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
  b = Ia(b.split("/").filter(e => !!e), !c).join("/");
  return (c ? "/" : "") + b || ".";
}, Oa = globalThis.TextDecoder && new TextDecoder(), Pa = (a, b, c, d) => {
  c = b + c;
  if (d) {
    return c;
  }
  for (; a[b] && !(b >= c);) {
    ++b;
  }
  return b;
}, Qa = (a, b = 0, c, d) => {
  c = Pa(a, b, c, d);
  if (16 < c - b && a.buffer && Oa) {
    return Oa.decode(a.subarray(b, c));
  }
  for (d = ""; b < c;) {
    var e = a[b++];
    if (e & 128) {
      var f = a[b++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | f);
      } else {
        var g = a[b++] & 63;
        224 == (e & 240) ? e = (e & 15) << 12 | f << 6 | g : (240 != (e & 248) && Ea("Invalid UTF-8 leading byte " + ja(e) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), e = (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63);
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}, Ra = [], Sa = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
  }
  return b;
}, Ta = (a, b, c, d) => {
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
      1114111 < g && Ea("Invalid Unicode code point " + ja(g) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
      b[c++] = 240 | g >> 18;
      b[c++] = 128 | g >> 12 & 63;
      b[c++] = 128 | g >> 6 & 63;
      b[c++] = 128 | g & 63;
      f++;
    }
  }
  b[c] = 0;
  return c - e;
}, Ua = a => {
  var b = Array(Sa(a) + 1);
  a = Ta(a, b, 0, b.length);
  b.length = a;
  return b;
}, Va = [];
function Wa(a, b) {
  Va[a] = {input:[], output:[], P:b};
  Xa(a, Ya);
}
var Ya = {open(a) {
  var b = Va[a.node.pa];
  if (!b) {
    throw new K(43);
  }
  a.o = b;
  a.seekable = !1;
}, close(a) {
  a.o.P.ia(a.o);
}, ia(a) {
  a.o.P.ia(a.o);
}, read(a, b, c, d) {
  if (!a.o || !a.o.P.Ia) {
    throw new K(60);
  }
  for (var e = 0, f = 0; f < d; f++) {
    try {
      var g = a.o.P.Ia(a.o);
    } catch (h) {
      throw new K(29);
    }
    if (void 0 === g && 0 === e) {
      throw new K(6);
    }
    if (null === g || void 0 === g) {
      break;
    }
    e++;
    b[c + f] = g;
  }
  e && (a.node.W = Date.now());
  return e;
}, write(a, b, c, d) {
  if (!a.o || !a.o.P.Aa) {
    throw new K(60);
  }
  try {
    for (var e = 0; e < d; e++) {
      a.o.P.Aa(a.o, b[c + e]);
    }
  } catch (f) {
    throw new K(29);
  }
  d && (a.node.J = a.node.F = Date.now());
  return e;
}}, Za = {Ia() {
  a: {
    if (!Ra.length) {
      var a = null;
      globalThis.window?.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
      if (!a) {
        a = null;
        break a;
      }
      Ra = Ua(a);
    }
    a = Ra.shift();
  }
  return a;
}, Aa(a, b) {
  null === b || 10 === b ? (ea(Qa(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ia(a) {
  0 < a.output?.length && (ea(Qa(a.output)), a.output = []);
}, hb() {
  return {Ab:25856, Cb:5, zb:191, Bb:35387, yb:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
}, ib() {
  return 0;
}, jb() {
  return [24, 80];
}}, $a = {Aa(a, b) {
  null === b || 10 === b ? (q(Qa(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ia(a) {
  0 < a.output?.length && (q(Qa(a.output)), a.output = []);
}}, ab = () => {
  t("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
}, L = {M:null, O() {
  return L.createNode(null, "/", 16895, 0);
}, createNode(a, b, c, d) {
  if (24576 === (c & 61440) || 4096 === (c & 61440)) {
    throw new K(63);
  }
  L.M || (L.M = {dir:{node:{T:L.j.T, N:L.j.N, ba:L.j.ba, oa:L.j.oa, Sa:L.j.Sa, ra:L.j.ra, Ta:L.j.Ta, Ba:L.j.Ba, qa:L.j.qa}, stream:{L:L.i.L}}, file:{node:{T:L.j.T, N:L.j.N}, stream:{L:L.i.L, read:L.i.read, write:L.i.write, za:L.i.za, Pa:L.i.Pa}}, link:{node:{T:L.j.T, N:L.j.N, fa:L.j.fa}, stream:{}}, Fa:{node:{T:L.j.T, N:L.j.N}, stream:bb}});
  c = cb(a, b, c, d);
  M(c.mode) ? (c.j = L.M.dir.node, c.i = L.M.dir.stream, c.h = {}) : 32768 === (c.mode & 61440) ? (c.j = L.M.file.node, c.i = L.M.file.stream, c.u = 0, c.h = null) : 40960 === (c.mode & 61440) ? (c.j = L.M.link.node, c.i = L.M.link.stream) : 8192 === (c.mode & 61440) && (c.j = L.M.Fa.node, c.i = L.M.Fa.stream);
  c.W = c.J = c.F = Date.now();
  a && (a.h[b] = c, a.W = a.J = a.F = c.W);
  return c;
}, Hb(a) {
  return a.h ? a.h.subarray ? a.h.subarray(0, a.u) : new Uint8Array(a.h) : new Uint8Array(0);
}, j:{T(a) {
  var b = {};
  b.Db = 8192 === (a.mode & 61440) ? a.id : 1;
  b.Jb = a.id;
  b.mode = a.mode;
  b.Lb = 1;
  b.uid = 0;
  b.Ib = 0;
  b.pa = a.pa;
  M(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.u : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.W = new Date(a.W);
  b.J = new Date(a.J);
  b.F = new Date(a.F);
  b.Ya = 4096;
  b.xb = Math.ceil(b.size / b.Ya);
  return b;
}, N(a, b) {
  for (var c of ["mode", "atime", "mtime", "ctime"]) {
    null != b[c] && (a[c] = b[c]);
  }
  void 0 !== b.size && (b = b.size, a.u != b && (0 == b ? (a.h = null, a.u = 0) : (c = a.h, a.h = new Uint8Array(b), c && a.h.set(c.subarray(0, Math.min(b, a.u))), a.u = b)));
}, ba() {
  throw new K(44);
}, oa(a, b, c, d) {
  return L.createNode(a, b, c, d);
}, Sa(a, b, c) {
  try {
    var d = db(b, c);
  } catch (f) {
  }
  if (d) {
    if (M(a.mode)) {
      for (var e in d.h) {
        throw new K(55);
      }
    }
    eb(d);
  }
  delete a.parent.h[a.name];
  b.h[c] = a;
  a.name = c;
  b.F = b.J = a.parent.F = a.parent.J = Date.now();
}, ra(a, b) {
  delete a.h[b];
  a.F = a.J = Date.now();
}, Ta(a, b) {
  var c = db(a, b), d;
  for (d in c.h) {
    throw new K(55);
  }
  delete a.h[b];
  a.F = a.J = Date.now();
}, Ba(a) {
  return [".", "..", ...Object.keys(a.h)];
}, qa(a, b, c) {
  a = L.createNode(a, b, 41471, 0);
  a.link = c;
  return a;
}, fa(a) {
  if (40960 !== (a.mode & 61440)) {
    throw new K(28);
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
  b.buffer === x.buffer && (f = !1);
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
    throw new K(28);
  }
  return b;
}, za(a, b, c, d, e) {
  if (32768 !== (a.node.mode & 61440)) {
    throw new K(43);
  }
  a = a.node.h;
  if (e & 2 || !a || a.buffer !== x.buffer) {
    d = !0;
    e = ab();
    if (!e) {
      throw new K(48);
    }
    if (a) {
      if (0 < c || c + b < a.length) {
        a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
      }
      x.set(a, e);
    }
  } else {
    d = !1, e = a.byteOffset;
  }
  return {l:e, Xa:d};
}, Pa(a, b, c, d) {
  L.i.write(a, b, 0, d, c, !1);
  return 0;
}}}, fb = (a, b) => {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}, N = (a, b, c) => {
  p("number" == typeof a, `UTF8ToString expects a number (got ${typeof a})`);
  return a ? Qa(C, a, b, c) : "";
}, gb = {EPERM:63, ENOENT:44, ESRCH:71, EINTR:27, EIO:29, ENXIO:60, E2BIG:1, ENOEXEC:45, EBADF:8, ECHILD:12, EAGAIN:6, EWOULDBLOCK:6, ENOMEM:48, EACCES:2, EFAULT:21, ENOTBLK:105, EBUSY:10, EEXIST:20, EXDEV:75, ENODEV:43, ENOTDIR:54, EISDIR:31, EINVAL:28, ENFILE:41, EMFILE:33, ENOTTY:59, ETXTBSY:74, EFBIG:22, ENOSPC:51, ESPIPE:70, EROFS:69, EMLINK:34, EPIPE:64, EDOM:18, ERANGE:68, ENOMSG:49, EIDRM:24, ECHRNG:106, EL2NSYNC:156, EL3HLT:107, EL3RST:108, ELNRNG:109, EUNATCH:110, ENOCSI:111, EL2HLT:112, 
EDEADLK:16, ENOLCK:46, EBADE:113, EBADR:114, EXFULL:115, ENOANO:104, EBADRQC:103, EBADSLT:102, EDEADLOCK:16, EBFONT:101, ENOSTR:100, ENODATA:116, ETIME:117, ENOSR:118, ENONET:119, ENOPKG:120, EREMOTE:121, ENOLINK:47, EADV:122, ESRMNT:123, ECOMM:124, EPROTO:65, EMULTIHOP:36, EDOTDOT:125, EBADMSG:9, ENOTUNIQ:126, EBADFD:127, EREMCHG:128, ELIBACC:129, ELIBBAD:130, ELIBSCN:131, ELIBMAX:132, ELIBEXEC:133, ENOSYS:52, ENOTEMPTY:55, ENAMETOOLONG:37, ELOOP:32, EOPNOTSUPP:138, EPFNOSUPPORT:139, ECONNRESET:15, 
ENOBUFS:42, EAFNOSUPPORT:5, EPROTOTYPE:67, ENOTSOCK:57, ENOPROTOOPT:50, ESHUTDOWN:140, ECONNREFUSED:14, EADDRINUSE:3, ECONNABORTED:13, ENETUNREACH:40, ENETDOWN:38, ETIMEDOUT:73, EHOSTDOWN:142, EHOSTUNREACH:23, EINPROGRESS:26, EALREADY:7, EDESTADDRREQ:17, EMSGSIZE:35, EPROTONOSUPPORT:66, ESOCKTNOSUPPORT:137, EADDRNOTAVAIL:4, ENETRESET:39, EISCONN:30, ENOTCONN:53, ETOOMANYREFS:141, EUSERS:136, EDQUOT:19, ESTALE:72, ENOTSUP:138, ENOMEDIUM:148, EILSEQ:25, EOVERFLOW:61, ECANCELED:11, ENOTRECOVERABLE:56, 
EOWNERDEAD:62, ESTRPIPE:135}, hb = async a => {
  var b = await ca(a);
  p(b, `Loading data file "${a}" failed (no arrayBuffer).`);
  return new Uint8Array(b);
}, ib = 0, jb = null, kb = {}, lb = null, mb = a => {
  ib--;
  p(a, "removeRunDependency requires an ID");
  p(kb[a]);
  delete kb[a];
  0 == ib && (null !== lb && (clearInterval(lb), lb = null), jb && (a = jb, jb = null, a()));
}, nb = a => {
  ib++;
  p(a, "addRunDependency requires an ID");
  p(!kb[a]);
  kb[a] = 1;
  null === lb && globalThis.setInterval && (lb = setInterval(() => {
    if (fa) {
      clearInterval(lb), lb = null;
    } else {
      var b = !1, c;
      for (c in kb) {
        b || (b = !0, q("still waiting on run dependencies:")), q(`dependency: ${c}`);
      }
      b && q("(end of list)");
    }
  }, 10000));
}, ob = [], pb = async(a, b) => {
  if ("undefined" != typeof Browser) {
    var c = Browser;
    u[c.l + 16 >> 2] = 0;
    u[c.l + 4 >> 2] = void 0;
    u[c.l + 8 >> 2] = void 0;
  }
  for (var d of ob) {
    if (d.canHandle(b)) {
      return p("AsyncFunction" === d.handle.constructor.name, "Filesystem plugin handlers must be async functions (See #24914)"), d.handle(a, b);
    }
  }
  return a;
}, qb = null, rb = {}, sb = [], tb = 1, O = null, ub = !1, vb = !0, K = class extends Error {
  name="ErrnoError";
  constructor(a) {
    super(ua ? N(wb(a)) : "");
    this.K = a;
    for (var b in gb) {
      if (gb[b] === a) {
        this.code = b;
        break;
      }
    }
  }
}, xb = class {
  G={};
  node=null;
  get object() {
    return this.node;
  }
  set object(a) {
    this.node = a;
  }
  get flags() {
    return this.G.flags;
  }
  set flags(a) {
    this.G.flags = a;
  }
  get position() {
    return this.G.position;
  }
  set position(a) {
    this.G.position = a;
  }
}, yb = class {
  j={};
  i={};
  da=null;
  constructor(a, b, c, d) {
    a ||= this;
    this.parent = a;
    this.O = a.O;
    this.id = tb++;
    this.name = b;
    this.mode = c;
    this.pa = d;
    this.W = this.J = this.F = Date.now();
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
  get lb() {
    return M(this.mode);
  }
  get kb() {
    return 8192 === (this.mode & 61440);
  }
};
function zb(a, b = {}) {
  if (!a) {
    throw new K(44);
  }
  b.ua ?? (b.ua = !0);
  "/" === a.charAt(0) || (a = "//" + a);
  var c = 0;
  a: for (; 40 > c; c++) {
    a = a.split("/").filter(h => !!h);
    for (var d = qb, e = "/", f = 0; f < a.length; f++) {
      var g = f === a.length - 1;
      if (g && b.parent) {
        break;
      }
      if ("." !== a[f]) {
        if (".." === a[f]) {
          if (e = Ka(e), d === d.parent) {
            a = e + "/" + a.slice(f + 1).join("/");
            c--;
            continue a;
          } else {
            d = d.parent;
          }
        } else {
          e = Ja(e + "/" + a[f]);
          try {
            d = db(d, a[f]);
          } catch (h) {
            if (44 === h?.K && g && b.ob) {
              return {path:e};
            }
            throw h;
          }
          !d.da || g && !b.ua || (d = d.da.root);
          if (40960 === (d.mode & 61440) && (!g || b.ta)) {
            if (!d.j.fa) {
              throw new K(52);
            }
            d = d.j.fa(d);
            "/" === d.charAt(0) || (d = Ka(e) + "/" + d);
            a = d + "/" + a.slice(f + 1).join("/");
            continue a;
          }
        }
      }
    }
    return {path:e, node:d};
  }
  throw new K(32);
}
function Ab(a) {
  for (var b;;) {
    if (a === a.parent) {
      return a = a.O.Oa, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
    }
    b = b ? `${a.name}/${b}` : a.name;
    a = a.parent;
  }
}
function Bb(a, b) {
  for (var c = 0, d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % O.length;
}
function eb(a) {
  var b = Bb(a.parent.id, a.name);
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
function db(a, b) {
  var c = M(a.mode) ? (c = Cb(a, "x")) ? c : a.j.ba ? 0 : 2 : 54;
  if (c) {
    throw new K(c);
  }
  for (c = O[Bb(a.id, b)]; c; c = c.Y) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return a.j.ba(a, b);
}
function cb(a, b, c, d) {
  p("object" == typeof a);
  a = new yb(a, b, c, d);
  b = Bb(a.parent.id, a.name);
  a.Y = O[b];
  return O[b] = a;
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
    return db(a, b), 20;
  } catch (c) {
  }
  return Cb(a, "wx");
}
function P(a) {
  a = sb[a];
  if (!a) {
    throw new K(8);
  }
  return a;
}
function Fb(a, b = -1) {
  p(-1 <= b);
  a = Object.assign(new xb(), a);
  if (-1 == b) {
    a: {
      for (b = 0; 4096 >= b; b++) {
        if (!sb[b]) {
          break a;
        }
      }
      throw new K(33);
    }
  }
  a.B = b;
  return sb[b] = a;
}
function Gb(a, b = -1) {
  a = Fb(a, b);
  a.i?.Fb?.(a);
  return a;
}
function Hb(a, b) {
  var c = null?.i.N, d = c ? null : a;
  c ??= a.j.N;
  if (!c) {
    throw new K(63);
  }
  c(d, b);
}
var bb = {open(a) {
  a.i = rb[a.node.pa].i;
  a.i.open?.(a);
}, L() {
  throw new K(70);
}};
function Xa(a, b) {
  rb[a] = {i:b};
}
function Ib(a, b) {
  if ("string" == typeof a) {
    throw a;
  }
  var c = "/" === b, d = !b;
  if (c && qb) {
    throw new K(10);
  }
  if (!c && !d) {
    var e = zb(b, {ua:!1});
    b = e.path;
    e = e.node;
    if (e.da) {
      throw new K(10);
    }
    if (!M(e.mode)) {
      throw new K(54);
    }
  }
  b = {type:a, Mb:{}, Oa:b, nb:[]};
  a = a.O(b);
  a.O = b;
  b.root = a;
  c ? qb = a : e && (e.da = b, e.O && e.O.nb.push(b));
}
function Jb(a, b, c) {
  var d = zb(a, {parent:!0}).node;
  a = a && a.match(/([^\/]+|\/)\/*$/)[1];
  if (!a) {
    throw new K(28);
  }
  if ("." === a || ".." === a) {
    throw new K(20);
  }
  var e = Eb(d, a);
  if (e) {
    throw new K(e);
  }
  if (!d.j.oa) {
    throw new K(63);
  }
  return d.j.oa(d, a, b, c);
}
function Kb(a, b = 438) {
  return Jb(a, b & 4095 | 32768, 0);
}
function Q(a) {
  return Jb(a, 16895, 0);
}
function Lb(a, b, c) {
  "undefined" == typeof c && (c = b, b = 438);
  return Jb(a, b | 8192, c);
}
function Mb(a, b) {
  if (!Na(a)) {
    throw new K(44);
  }
  var c = zb(b, {parent:!0}).node;
  if (!c) {
    throw new K(44);
  }
  b = b && b.match(/([^\/]+|\/)\/*$/)[1];
  var d = Eb(c, b);
  if (d) {
    throw new K(d);
  }
  if (!c.j.qa) {
    throw new K(63);
  }
  c.j.qa(c, b, a);
}
function Nb(a) {
  var b = zb(a, {parent:!0}).node;
  if (!b) {
    throw new K(44);
  }
  a = a && a.match(/([^\/]+|\/)\/*$/)[1];
  var c = db(b, a);
  a: {
    try {
      var d = db(b, a);
    } catch (f) {
      d = f.K;
      break a;
    }
    var e = Cb(b, "wx");
    d = e ? e : M(d.mode) ? 31 : 0;
  }
  if (d) {
    throw new K(d);
  }
  if (!b.j.ra) {
    throw new K(63);
  }
  if (c.da) {
    throw new K(10);
  }
  b.j.ra(b, a);
  eb(c);
}
function Ob(a, b) {
  a = "string" == typeof a ? zb(a, {ta:!0}).node : a;
  Hb(a, {mode:b & 4095 | a.mode & -4096, F:Date.now(), Eb:void 0});
}
function Pb(a, b, c = 438) {
  if ("" === a) {
    throw new K(44);
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
    var f = zb(a, {ta:!(b & 131072), ob:!0});
    d = f.node;
    a = f.path;
  }
  f = !1;
  if (b & 64) {
    if (d) {
      if (b & 128) {
        throw new K(20);
      }
    } else {
      if (e) {
        throw new K(31);
      }
      d = Jb(a, c | 511, 0);
      f = !0;
    }
  }
  if (!d) {
    throw new K(44);
  }
  8192 === (d.mode & 61440) && (b &= -513);
  if (b & 65536 && !M(d.mode)) {
    throw new K(54);
  }
  if (!f && (e = d ? 40960 === (d.mode & 61440) ? 32 : M(d.mode) && ("r" !== Db(b) || b & 576) ? 31 : Cb(d, Db(b)) : 44)) {
    throw new K(e);
  }
  if (b & 512 && !f) {
    e = d;
    e = "string" == typeof e ? zb(e, {ta:!0}).node : e;
    if (M(e.mode)) {
      throw new K(31);
    }
    if (32768 !== (e.mode & 61440)) {
      throw new K(28);
    }
    if (a = Cb(e, "w")) {
      throw new K(a);
    }
    Hb(e, {size:0, timestamp:Date.now()});
  }
  b = Fb({node:d, path:Ab(d), flags:b & -131713, seekable:!0, position:0, i:d.i, vb:[], error:!1});
  b.i.open && b.i.open(b);
  f && Ob(d, c & 511);
  return b;
}
function Qb(a) {
  if (null === a.B) {
    throw new K(8);
  }
  a.va && (a.va = null);
  try {
    a.i.close && a.i.close(a);
  } catch (b) {
    throw b;
  } finally {
    sb[a.B] = null;
  }
  a.B = null;
}
function Rb(a, b, c) {
  if (null === a.B) {
    throw new K(8);
  }
  if (!a.seekable || !a.i.L) {
    throw new K(70);
  }
  if (0 != c && 1 != c && 2 != c) {
    throw new K(28);
  }
  a.position = a.i.L(a, b, c);
  a.vb = [];
}
function Sb(a, b, c, d, e, f) {
  p(0 <= c);
  if (0 > d || 0 > e) {
    throw new K(28);
  }
  if (null === a.B) {
    throw new K(8);
  }
  if (0 === (a.flags & 2097155)) {
    throw new K(8);
  }
  if (M(a.node.mode)) {
    throw new K(31);
  }
  if (!a.i.write) {
    throw new K(28);
  }
  a.seekable && a.flags & 1024 && Rb(a, 0, 2);
  var g = "undefined" != typeof e;
  if (!g) {
    e = a.position;
  } else if (!a.seekable) {
    throw new K(70);
  }
  b = a.i.write(a, b, c, d, e, f);
  g || (a.position += b);
  return b;
}
function Tb(a, b) {
  a = "string" == typeof a ? a : Ab(a);
  for (b = b.split("/").reverse(); b.length;) {
    var c = b.pop();
    if (c) {
      var d = Ja(a + "/" + c);
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
function Ub(a, b, c, d) {
  a = Ja(("string" == typeof a ? a : Ab(a)) + "/" + b);
  return Kb(a, fb(c, d));
}
function Vb(a, b, c, d, e, f) {
  var g = b;
  a && (a = "string" == typeof a ? a : Ab(a), g = b ? Ja(a + "/" + b) : a);
  a = fb(d, e);
  g = Kb(g, a);
  if (c) {
    if ("string" == typeof c) {
      b = Array(c.length);
      d = 0;
      for (e = c.length; d < e; ++d) {
        b[d] = c.charCodeAt(d);
      }
      c = b;
    }
    Ob(g, a | 146);
    b = Pb(g, 577);
    Sb(b, c, 0, c.length, 0, f);
    Qb(b);
    Ob(g, a);
  }
}
function Wb(a, b, c, d) {
  a = Ja(("string" == typeof a ? a : Ab(a)) + "/" + b);
  b = fb(!!c, !!d);
  Wb.Na ?? (Wb.Na = 64);
  var e = Wb.Na++ << 8 | 0;
  Xa(e, {open(f) {
    f.seekable = !1;
  }, close() {
    d?.buffer?.length && d(10);
  }, read(f, g, h, l) {
    for (var n = 0, k = 0; k < l; k++) {
      try {
        var r = c();
      } catch (y) {
        throw new K(29);
      }
      if (void 0 === r && 0 === n) {
        throw new K(6);
      }
      if (null === r || void 0 === r) {
        break;
      }
      n++;
      g[h + k] = r;
    }
    n && (f.node.W = Date.now());
    return n;
  }, write(f, g, h, l) {
    for (var n = 0; n < l; n++) {
      try {
        d(g[h + n]);
      } catch (k) {
        throw new K(29);
      }
    }
    l && (f.node.J = f.node.F = Date.now());
    return n;
  }});
  return Lb(a, b, e);
}
function Xb(a) {
  if (!(a.kb || a.lb || a.link || a.h)) {
    if (globalThis.XMLHttpRequest) {
      t("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
    } else {
      try {
        a.h = (void 0)(a.url);
      } catch (b) {
        throw new K(29);
      }
    }
  }
}
function Yb(a, b, c, d, e) {
  function f(k, r, y, z, A) {
    k = k.node.h;
    if (A >= k.length) {
      return 0;
    }
    z = Math.min(k.length - A, z);
    p(0 <= z);
    if (k.slice) {
      for (var B = 0; B < z; B++) {
        r[y + B] = k[A + B];
      }
    } else {
      for (B = 0; B < z; B++) {
        r[y + B] = k.get(A + B);
      }
    }
    return z;
  }
  class g {
    xa=!1;
    G=[];
    wa=void 0;
    La=0;
    Ka=0;
    get(k) {
      if (!(k > this.length - 1 || 0 > k)) {
        var r = k % this.Qa;
        return this.wa(k / this.Qa | 0)[r];
      }
    }
    tb(k) {
      this.wa = k;
    }
    Ma() {
      var k = new XMLHttpRequest();
      k.open("HEAD", c, !1);
      k.send(null);
      200 <= k.status && 300 > k.status || 304 === k.status || t("Couldn't load " + c + ". Status: " + k.status);
      var r = Number(k.getResponseHeader("Content-length")), y, z = (y = k.getResponseHeader("Accept-Ranges")) && "bytes" === y;
      k = (y = k.getResponseHeader("Content-Encoding")) && "gzip" === y;
      var A = 1048576;
      z || (A = r);
      var B = this;
      B.tb(G => {
        var J = G * A, E = (G + 1) * A - 1;
        E = Math.min(E, r - 1);
        if ("undefined" == typeof B.G[G]) {
          var T = B.G;
          J > E && t("invalid range (" + J + ", " + E + ") or no bytes requested!");
          E > r - 1 && t("only " + r + " bytes available! programmer error!");
          var I = new XMLHttpRequest();
          I.open("GET", c, !1);
          r !== A && I.setRequestHeader("Range", "bytes=" + J + "-" + E);
          I.responseType = "arraybuffer";
          I.overrideMimeType && I.overrideMimeType("text/plain; charset=x-user-defined");
          I.send(null);
          200 <= I.status && 300 > I.status || 304 === I.status || t("Couldn't load " + c + ". Status: " + I.status);
          J = void 0 !== I.response ? new Uint8Array(I.response || []) : Ua(I.responseText || "");
          T[G] = J;
        }
        "undefined" == typeof B.G[G] && t("doXHR failed!");
        return B.G[G];
      });
      if (k || !r) {
        A = r = 1, A = r = this.wa(0).length, ea("LazyFiles on gzip forces download of the whole file when length is accessed");
      }
      this.La = r;
      this.Ka = A;
      this.xa = !0;
    }
    get length() {
      this.xa || this.Ma();
      return this.La;
    }
    get Qa() {
      this.xa || this.Ma();
      return this.Ka;
    }
  }
  if (globalThis.XMLHttpRequest) {
    t("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");
    var h = new g();
    var l = void 0;
  } else {
    l = c, h = void 0;
  }
  var n = Ub(a, b, d, e);
  h ? n.h = h : l && (n.h = null, n.url = l);
  Object.defineProperties(n, {u:{get:function() {
    return this.h.length;
  }}});
  a = {};
  for (const [k, r] of Object.entries(n.i)) {
    a[k] = (...y) => {
      Xb(n);
      return r(...y);
    };
  }
  a.read = (k, r, y, z, A) => {
    Xb(n);
    return f(k, r, y, z, A);
  };
  a.za = (k, r, y) => {
    Xb(n);
    var z = ab();
    if (!z) {
      throw new K(48);
    }
    f(k, x, z, r, y);
    return {l:z, Xa:!0};
  };
  n.i = a;
  return n;
}
var Zb = {}, Ha = void 0, R = a => {
  for (var b = "";;) {
    var c = C[a++];
    if (!c) {
      return b;
    }
    b += String.fromCharCode(c);
  }
}, $b = {}, ac = {}, bc = {}, S = class extends Error {
  constructor(a) {
    super(a);
    this.name = "BindingError";
  }
}, cc = a => {
  throw new S(a);
};
function dc(a, b, c = {}) {
  var d = b.name;
  if (!a) {
    throw new S(`type "${d}" must have a positive integer typeid pointer`);
  }
  if (ac.hasOwnProperty(a)) {
    if (c.fb) {
      return;
    }
    throw new S(`Cannot register type '${d}' twice`);
  }
  ac[a] = b;
  delete bc[a];
  $b.hasOwnProperty(a) && (b = $b[a], delete $b[a], b.forEach(e => e()));
}
function U(a, b, c = {}) {
  return dc(a, b, c);
}
var ec = (a, b, c) => {
  switch(b) {
    case 1:
      return c ? d => x[d] : d => C[d];
    case 2:
      return c ? d => D[d >> 1] : d => pa[d >> 1];
    case 4:
      return c ? d => F[d >> 2] : d => u[d >> 2];
    case 8:
      return c ? d => sa[d >> 3] : d => ta[d >> 3];
    default:
      throw new TypeError(`invalid integer width (${b}): ${a}`);
  }
}, fc = a => {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}, gc = (a, b, c, d) => {
  if (b < c || b > d) {
    throw new TypeError(`Passing a number "${fc(b)}" from JS side to C/C++ side to an argument of type "${a}", which is outside the valid range [${c}, ${d}]!`);
  }
}, hc = a => {
  throw new S(a.g.s.m.name + " instance already deleted");
}, ic = !1, jc = () => {
}, kc = (a, b, c) => {
  if (b === c) {
    return a;
  }
  if (void 0 === c.C) {
    return null;
  }
  a = kc(a, b, c.C);
  return null === a ? null : c.ab(a);
}, lc = {}, mc = {}, nc = (a, b) => {
  if (void 0 === b) {
    throw new S("ptr should not be undefined");
  }
  for (; a.C;) {
    b = a.ha(b), a = a.C;
  }
  return mc[b];
}, oc = class extends Error {
  constructor(a) {
    super(a);
    this.name = "InternalError";
  }
}, qc = (a, b) => {
  if (!b.s || !b.l) {
    throw new oc("makeClassHandle requires ptr and ptrType");
  }
  if (!!b.H !== !!b.A) {
    throw new oc("Both smartPtrType and smartPtr must be specified");
  }
  b.count = {value:1};
  return pc(Object.create(a, {g:{value:b, writable:!0}}));
};
function rc(a) {
  function b() {
    return this.ka ? qc(this.m.U, {s:this.pb, l:c, H:this, A:a}) : qc(this.m.U, {s:this, l:a});
  }
  var c = this.eb(a);
  if (!c) {
    return this.Ha(a), null;
  }
  var d = nc(this.m, c);
  if (void 0 !== d) {
    if (0 === d.g.count.value) {
      return d.g.l = c, d.g.A = a, d.clone();
    }
    d = d.clone();
    this.Ha(a);
    return d;
  }
  d = this.m.cb(c);
  d = lc[d];
  if (!d) {
    return b.call(this);
  }
  d = this.ja ? d.Za : d.pointerType;
  var e = kc(c, this.m, d.m);
  return null === e ? b.call(this) : this.ka ? qc(d.m.U, {s:d, l:e, H:this, A:a}) : qc(d.m.U, {s:d, l:e});
}
var pc = a => {
  if (!globalThis.FinalizationRegistry) {
    return pc = b => b, a;
  }
  ic = new FinalizationRegistry(b => {
    console.warn(b.mb);
    b = b.g;
    --b.count.value;
    0 === b.count.value && (b.A ? b.H.V(b.A) : b.s.m.V(b.l));
  });
  pc = b => {
    var c = b.g;
    if (c.A) {
      var d = {g:c};
      c = Error(`Embind found a leaked C++ instance ${c.s.m.name} <${ja(c.l)}>.\n` + "We'll free it automatically in this case, but this functionality is not reliable across various environments.\nMake sure to invoke .delete() manually once you're done with the instance instead.\nOriginally allocated");
      "captureStackTrace" in Error && Error.captureStackTrace(c, rc);
      d.mb = c.stack.replace(/^Error: /, "");
      ic.register(b, d, b);
    }
    return b;
  };
  jc = b => {
    ic.unregister(b);
  };
  return pc(a);
}, sc = [];
function tc() {
}
var uc = (a, b) => Object.defineProperty(b, "name", {value:a}), vc = (a, b, c) => {
  if (void 0 === a[b].R) {
    var d = a[b];
    a[b] = function(...e) {
      if (!a[b].R.hasOwnProperty(e.length)) {
        throw new S(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${a[b].R})!`);
      }
      return a[b].R[e.length].apply(this, e);
    };
    a[b].R = [];
    a[b].R[d.$] = d;
  }
}, wc = (a, b) => {
  if (m.hasOwnProperty(a)) {
    throw new S(`Cannot register public name '${a}' twice`);
  }
  m[a] = b;
  m[a].$ = void 0;
}, xc = a => {
  p("string" === typeof a);
  a = a.replace(/[^a-zA-Z0-9_]/g, "$");
  var b = a.charCodeAt(0);
  return 48 <= b && 57 >= b ? `_${a}` : a;
};
function yc(a, b, c, d, e, f, g, h) {
  this.name = a;
  this.constructor = b;
  this.U = c;
  this.V = d;
  this.C = e;
  this.cb = f;
  this.ha = g;
  this.ab = h;
  this.qb = [];
}
var zc = (a, b, c) => {
  for (; b !== c;) {
    if (!b.ha) {
      throw new S(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);
    }
    a = b.ha(a);
    b = b.C;
  }
  return a;
};
function Ac(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new S(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new S(`Cannot pass "${fc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  return zc(b.g.l, b.g.s.m, this.m);
}
function Bc(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new S(`null is not a valid ${this.name}`);
    }
    if (this.ka) {
      var c = this.rb();
      null !== a && a.push(this.V, c);
      return c;
    }
    return 0;
  }
  if (!b || !b.g) {
    throw new S(`Cannot pass "${fc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (!this.ja && b.g.s.ja) {
    throw new S(`Cannot convert argument of type ${b.g.H ? b.g.H.name : b.g.s.name} to parameter type ${this.name}`);
  }
  c = zc(b.g.l, b.g.s.m, this.m);
  if (this.ka) {
    if (void 0 === b.g.A) {
      throw new S("Passing raw pointer to smart pointer is illegal");
    }
    switch(this.ub) {
      case 0:
        if (b.g.H === this) {
          c = b.g.A;
        } else {
          throw new S(`Cannot convert argument of type ${b.g.H ? b.g.H.name : b.g.s.name} to parameter type ${this.name}`);
        }
        break;
      case 1:
        c = b.g.A;
        break;
      case 2:
        if (b.g.H === this) {
          c = b.g.A;
        } else {
          var d = b.clone();
          c = this.sb(c, Cc(() => d["delete"]()));
          null !== a && a.push(this.V, c);
        }
        break;
      default:
        throw new S("Unsupporting sharing policy");
    }
  }
  return c;
}
function Dc(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new S(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new S(`Cannot pass "${fc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (b.g.s.ja) {
    throw new S(`Cannot convert argument of type ${b.g.s.name} to parameter type ${this.name}`);
  }
  return zc(b.g.l, b.g.s.m, this.m);
}
function Ec(a) {
  return this.v(u[a >> 2]);
}
function Fc(a, b, c, d, e, f, g, h, l, n, k) {
  this.name = a;
  this.m = b;
  this.ya = c;
  this.ja = d;
  this.ka = e;
  this.pb = f;
  this.ub = g;
  this.Ra = h;
  this.rb = l;
  this.sb = n;
  this.V = k;
  e || void 0 !== b.C ? this.D = Bc : (this.D = d ? Ac : Dc, this.I = null);
}
var Gc = (a, b) => {
  if (!m.hasOwnProperty(a)) {
    throw new oc("Replacing nonexistent public symbol");
  }
  m[a] = b;
  m[a].$ = void 0;
}, Hc = [], Jc = (a, b, c = !1) => {
  p(!c, "Async bindings are only supported with JSPI.");
  a = R(a);
  (c = Hc[b]) || (Hc[b] = c = Ic.get(b));
  p(Ic.get(b) == c, "JavaScript-side Wasm function table mirror is out of date!");
  if ("function" != typeof c) {
    throw new S(`unknown function pointer with signature ${a}: ${b}`);
  }
  return c;
};
class Kc extends Error {
}
var Nc = a => {
  a = Lc(a);
  var b = R(a);
  Mc(a);
  return b;
}, Pc = (a, b) => {
  function c(f) {
    e[f] || ac[f] || (bc[f] ? bc[f].forEach(c) : (d.push(f), e[f] = !0));
  }
  var d = [], e = {};
  b.forEach(c);
  throw new Kc(`${a}: ` + d.map(Nc).join([", "]));
}, Qc = (a, b, c) => {
  function d(h) {
    h = c(h);
    if (h.length !== a.length) {
      throw new oc("Mismatched type converter count");
    }
    for (var l = 0; l < a.length; ++l) {
      U(a[l], h[l]);
    }
  }
  a.forEach(h => bc[h] = b);
  var e = Array(b.length), f = [], g = 0;
  for (let [h, l] of b.entries()) {
    ac.hasOwnProperty(l) ? e[h] = ac[l] : (f.push(l), $b.hasOwnProperty(l) || ($b[l] = []), $b[l].push(() => {
      e[h] = ac[l];
      ++g;
      g === f.length && d(e);
    }));
  }
  0 === f.length && d(e);
}, Rc = (a, b) => {
  for (var c = [], d = 0; d < a; d++) {
    c.push(u[b + 4 * d >> 2]);
  }
  return c;
}, Sc = a => {
  for (; a.length;) {
    var b = a.pop();
    a.pop()(b);
  }
};
function Tc(a) {
  for (var b = 1; b < a.length; ++b) {
    if (null !== a[b] && void 0 === a[b].I) {
      return !0;
    }
  }
  return !1;
}
function Uc(a, b, c, d, e) {
  (a < b || a > c) && e(`function ${d} called with ${a} arguments, expected ${b == c ? b : `${b} to ${c}`}`);
}
function Vc(a, b, c, d, e, f) {
  var g = b.length;
  if (2 > g) {
    throw new S("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  p(!f, "Async bindings are only supported with JSPI.");
  var h = null !== b[1] && null !== c, l = Tc(b);
  c = !b[0].Ja;
  var n = g - 2;
  var k = b.length - 2;
  for (var r = b.length - 1; 2 <= r && b[r].optional; --r) {
    k--;
  }
  r = b[0];
  var y = b[1];
  d = [a, cc, d, e, Sc, r.v.bind(r), y?.D.bind(y)];
  for (e = 2; e < g; ++e) {
    r = b[e], d.push(r.D.bind(r));
  }
  if (!l) {
    for (e = h ? 1 : 2; e < b.length; ++e) {
      null !== b[e].I && d.push(b[e].I);
    }
  }
  d.push(Uc, k, n);
  l = Tc(b);
  n = b.length - 2;
  k = [];
  e = ["fn"];
  h && e.push("thisWired");
  for (g = 0; g < n; ++g) {
    k.push(`arg${g}`), e.push(`arg${g}Wired`);
  }
  k = k.join(",");
  e = e.join(",");
  k = `return function (${k}) {\n` + "checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);\n";
  l && (k += "var destructors = [];\n");
  y = l ? "destructors" : "null";
  r = "humanName throwBindingError invoker fn runDestructors fromRetWire toClassParamWire".split(" ");
  h && (k += `var thisWired = toClassParamWire(${y}, this);\n`);
  for (g = 0; g < n; ++g) {
    var z = `toArg${g}Wire`;
    k += `var arg${g}Wired = ${z}(${y}, arg${g});\n`;
    r.push(z);
  }
  k += (c || f ? "var rv = " : "") + `invoker(${e});\n`;
  if (l) {
    k += "runDestructors(destructors);\n";
  } else {
    for (g = h ? 1 : 2; g < b.length; ++g) {
      f = 1 === g ? "thisWired" : "arg" + (g - 2) + "Wired", null !== b[g].I && (k += `${f}_dtor(${f});\n`, r.push(`${f}_dtor`));
    }
  }
  c && (k += "var ret = fromRetWire(rv);\nreturn ret;\n");
  k += "}\n";
  r.push("checkArgCount", "minArgs", "maxArgs");
  k = `if (arguments.length !== ${r.length}){ throw new Error(humanName + "Expected ${r.length} closure arguments " + arguments.length + " given."); }\n${k}`;
  b = (new Function(r, k))(...d);
  return uc(a, b);
}
var Wc = a => {
  a = a.trim();
  const b = a.indexOf("(");
  if (-1 === b) {
    return a;
  }
  p(a.endsWith(")"), "Parentheses for argument names should match.");
  return a.slice(0, b);
}, Xc = (a, b, c) => {
  if (!(a instanceof Object)) {
    throw new S(`${c} with invalid "this": ${a}`);
  }
  if (!(a instanceof b.m.constructor)) {
    throw new S(`${c} incompatible with "this" of type ${a.constructor.name}`);
  }
  if (!a.g.l) {
    throw new S(`cannot call emscripten binding method ${c} on deleted object`);
  }
  return zc(a.g.l, a.g.s.m, b.m);
}, Yc = [], V = [0, 1, , 1, null, 1, !0, 1, !1, 1], Zc = a => {
  9 < a && 0 === --V[a + 1] && (p(void 0 !== V[a], "Decref for unallocated handle."), V[a] = void 0, Yc.push(a));
}, $c = a => {
  if (!a) {
    throw new S(`Cannot use deleted val. handle = ${a}`);
  }
  p(2 === a || void 0 !== V[a] && 0 === a % 2, `invalid handle: ${a}`);
  return V[a];
}, Cc = a => {
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
}, D:(a, b) => Cc(b), S:Ec, I:null}, bd = (a, b) => {
  switch(b) {
    case 4:
      return function(c) {
        return this.v(qa[c >> 2]);
      };
    case 8:
      return function(c) {
        return this.v(ra[c >> 3]);
      };
    default:
      throw new TypeError(`invalid float width (${b}): ${a}`);
  }
}, cd = (a, b, c) => {
  p("number" == typeof c, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return Ta(a, C, b, c);
}, dd = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, ed = (a, b, c) => {
  p(0 == a % 2, "Pointer passed to UTF16ToString must be aligned to two bytes!");
  a >>= 1;
  b = Pa(pa, a, b / 2, c);
  if (16 < b - a && dd) {
    return dd.decode(pa.subarray(a, b));
  }
  for (c = ""; a < b; ++a) {
    c += String.fromCharCode(pa[a]);
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
    D[b >> 1] = a.charCodeAt(e), b += 2;
  }
  D[b >> 1] = 0;
  return b - d;
}, gd = a => 2 * a.length, hd = (a, b, c) => {
  p(0 == a % 4, "Pointer passed to UTF32ToString must be aligned to four bytes!");
  var d = "";
  a >>= 2;
  for (var e = 0; !(e >= b / 4); e++) {
    var f = u[a + e];
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
    F[b >> 2] = f;
    b += 4;
    if (b + 4 > c) {
      break;
    }
  }
  F[b >> 2] = 0;
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
    var e = d, f = u[b + 4 * d >> 2], g = ac[f];
    if (void 0 === g) {
      throw a = `${`parameter ${d}`} has unknown type ${Nc(f)}`, new S(a);
    }
    c[e] = g;
  }
  return c;
}, od = (a, b, c) => {
  var d = [];
  a = a(d, c);
  d.length && (u[b >> 2] = Cc(d));
  return a;
}, pd = {}, qd = a => {
  var b = pd[a];
  return void 0 === b ? R(a) : b;
}, rd = {}, td = a => {
  if (fa) {
    q("user callback triggered after runtime exited or application aborted.  Ignoring.");
  } else {
    try {
      a();
    } catch (b) {
      if (a = b, !(a instanceof Da || "unwind" == a)) {
        throw ha(), a instanceof WebAssembly.RuntimeError && 0 >= sd() && q("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)"), a;
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
    F[b + 4 * e >> 2] = g;
  }
}, Ed = (a, b) => {
  a.G || (a.G = a.getContext, a.getContext = function(d, e) {
    e = a.G(d, e);
    return "webgl" == d == e instanceof WebGLRenderingContext ? e : null;
  });
  var c = a.getContext("webgl2", b);
  return c ? Dd(c, b) : 0;
}, Dd = (a, b) => {
  var c = Bd(Z);
  b = {handle:c, attributes:b, version:b.ca, Z:a};
  a.canvas && (a.canvas.Wa = b);
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
  return 0 == a ? x : 1 == a ? C : 2 == a ? D : 4 == a ? F : 6 == a ? qa : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a ? u : pa;
};
O = Array(4096);
Ib(L, "/");
Q("/tmp");
Q("/home");
Q("/home/web_user");
(function() {
  Q("/dev");
  Xa(259, {read:() => 0, write:(d, e, f, g) => g, L:() => 0});
  Lb("/dev/null", 259);
  Wa(1280, Za);
  Wa(1536, $a);
  Lb("/dev/tty", 1280);
  Lb("/dev/tty1", 1536);
  var a = new Uint8Array(1024), b = 0, c = () => {
    0 === b && (Ma(a), b = a.byteLength);
    return a[--b];
  };
  Wb("/dev", "random", c);
  Wb("/dev", "urandom", c);
  Q("/dev/shm");
  Q("/dev/shm/tmp");
})();
(function() {
  Q("/proc");
  var a = Q("/proc/self");
  Q("/proc/self/fd");
  Ib({O() {
    var b = cb(a, "fd", 16895, 73);
    b.i = {L:L.i.L};
    b.j = {ba(c, d) {
      c = +d;
      var e = P(c);
      c = {parent:null, O:{Oa:"fake"}, j:{fa:() => e.path}, id:c + 1};
      return c.parent = c;
    }, Ba() {
      return Array.from(sb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
    }};
    return b;
  }}, "/proc/self/fd");
})();
(() => {
  let a = tc.prototype;
  Object.assign(a, {isAliasOf:function(c) {
    if (!(this instanceof tc && c instanceof tc)) {
      return !1;
    }
    var d = this.g.s.m, e = this.g.l;
    c.g = c.g;
    var f = c.g.s.m;
    for (c = c.g.l; d.C;) {
      e = d.ha(e), d = d.C;
    }
    for (; f.C;) {
      c = f.ha(c), f = f.C;
    }
    return d === f && e === c;
  }, clone:function() {
    this.g.l || hc(this);
    if (this.g.ea) {
      return this.g.count.value += 1, this;
    }
    var c = pc, d = Object, e = d.create, f = Object.getPrototypeOf(this), g = this.g;
    c = c(e.call(d, f, {g:{value:{count:g.count, aa:g.aa, ea:g.ea, l:g.l, s:g.s, A:g.A, H:g.H}}}));
    c.g.count.value += 1;
    c.g.aa = !1;
    return c;
  }, ["delete"]() {
    this.g.l || hc(this);
    if (this.g.aa && !this.g.ea) {
      throw new S("Object already scheduled for deletion");
    }
    jc(this);
    var c = this.g;
    --c.count.value;
    0 === c.count.value && (c.A ? c.H.V(c.A) : c.s.m.V(c.l));
    this.g.ea || (this.g.A = void 0, this.g.l = void 0);
  }, isDeleted:function() {
    return !this.g.l;
  }, deleteLater:function() {
    this.g.l || hc(this);
    if (this.g.aa && !this.g.ea) {
      throw new S("Object already scheduled for deletion");
    }
    sc.push(this);
    this.g.aa = !0;
    return this;
  }});
  const b = Symbol.dispose;
  b && (a[b] = a["delete"]);
})();
Object.assign(Fc.prototype, {eb(a) {
  this.Ra && (a = this.Ra(a));
  return a;
}, Ha(a) {
  this.V?.(a);
}, S:Ec, v:rc});
p(10 === V.length);
w("ENVIRONMENT");
w("GL_MAX_TEXTURE_IMAGE_UNITS");
w("SDL_canPlayWithWebAudio");
w("SDL_numSimultaneouslyQueuedBuffers");
w("INITIAL_MEMORY");
w("wasmMemory");
w("arguments");
w("buffer");
w("canvas");
w("doNotCaptureKeyboard");
w("dynamicLibraries");
w("elementPointerLock");
w("extraStackTrace");
w("forcedAspectRatio");
w("instantiateWasm");
w("keyboardListeningElement");
w("freePreloadedMediaOnUse");
w("loadSplitModule");
w("locateFile");
w("logReadFiles");
w("mainScriptUrlOrBlob");
w("mem");
w("monitorRunDependencies");
w("noExitRuntime");
w("noInitialRun");
w("onAbort");
w("onCustomMessage");
w("onExit");
w("onFree");
w("onFullScreen");
w("onMalloc");
w("onRealloc");
w("onRuntimeInitialized");
w("postMainLoop");
w("postRun");
w("preInit");
w("preMainLoop");
w("preRun");
w("preinitializedWebGLContext");
w("preloadPlugins");
w("print");
w("printErr");
w("setStatus");
w("statusMessage");
w("stderr");
w("stdin");
w("stdout");
w("thisProgram");
w("wasm");
w("wasmBinary");
w("websocket");
w("fetchSettings");
p("undefined" == typeof m.memoryInitializerPrefixURL, "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof m.pthreadMainPrefixURL, "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof m.cdInitializerPrefixURL, "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof m.filePackagePrefixURL, "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
p("undefined" == typeof m.read, "Module.read option was removed");
p("undefined" == typeof m.readAsync, "Module.readAsync option was removed (modify readAsync in JS)");
p("undefined" == typeof m.readBinary, "Module.readBinary option was removed (modify readBinary in JS)");
p("undefined" == typeof m.setWindowTitle, "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
p("undefined" == typeof m.TOTAL_MEMORY, "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
p("undefined" == typeof m.ENVIRONMENT, "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
p("undefined" == typeof m.STACK_SIZE, "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
p("undefined" == typeof m.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
p("undefined" == typeof m.INITIAL_MEMORY, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
m.addRunDependency = nb;
m.removeRunDependency = mb;
m.UTF8ToString = N;
m.FS_preloadFile = async(a, b, c, d, e, f, g, h) => {
  var l = b ? Na(Ja(a + "/" + b)) : a, n;
  a: {
    for (var k = n = `cp ${l}`;;) {
      if (!kb[n]) {
        break a;
      }
      n = k + Math.random();
    }
  }
  nb(n);
  try {
    k = c, "string" == typeof c && (k = await hb(c)), k = await pb(k, l), h?.(), f || Vb(a, b, k, d, e, g);
  } finally {
    mb(n);
  }
};
m.FS_unlink = (...a) => Nb(...a);
m.FS_createPath = (...a) => Tb(...a);
m.FS_createDevice = (...a) => Wb(...a);
m.FS_createDataFile = (...a) => Vb(...a);
m.FS_createLazyFile = (...a) => Yb(...a);
"writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertI32PairToI53Checked convertU32PairToI53 stackAlloc getTempRet0 setTempRet0 zeroMemory withStackSave inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr runMainThreadEmAsm autoResumeAudioContext getDynCaller dynCall runtimeKeepalivePush runtimeKeepalivePop asmjsMangle HandleAllocator addOnPreRun addOnInit addOnPostCtor addOnPreMain addOnExit addOnPostRun STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS ccall cwrap convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction intArrayToString stringToAscii stringToNewUTF8 stringToUTF8OnStack writeArrayToMemory registerKeyEventCallback getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData registerBatteryEventCallback setCanvasElementSize getCanvasElementSize jsStackTrace getCallstack convertPCtoSourceLocation checkWasiClock wasiRightsToMuslOFlags wasiOFlagsToMuslOFlags safeSetTimeout setImmediateWrapped safeRequestAnimationFrame clearImmediateWrapped registerPostMainLoop registerPreMainLoop getPromise makePromise idsToPromises makePromiseCallback findMatchingCatch Browser_asyncPrepareDataCounter isLeapYear ydayFromDate arraySum addDays getSocketFromFD getSocketAddress FS_mkdirTree _setNetworkCallback webgl_enable_WEBGL_multi_draw webgl_enable_EXT_polygon_offset_clamp webgl_enable_EXT_clip_control webgl_enable_WEBGL_polygon_mode emscriptenWebGLGet emscriptenWebGLGetUniform emscriptenWebGLGetVertexAttrib __glGetActiveAttribOrUniform writeGLArray registerWebGlEventCallback runAndAbortIfError emscriptenWebGLGetIndexed webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance ALLOC_NORMAL ALLOC_STACK allocate writeStringToMemory writeAsciiToMemory allocateUTF8 allocateUTF8OnStack demangle stackTrace getNativeTypeSize getFunctionArgsName createJsInvokerSignature PureVirtualError registerInheritedInstance unregisterInheritedInstance getInheritedInstanceCount getLiveInheritedInstances enumReadValueFromPointer setDelayFunction count_emval_handles".split(" ").forEach(function(a) {
  ma(a);
});
"run out err callMain abort wasmExports HEAPF32 HEAPF64 HEAP8 HEAPU8 HEAP16 HEAPU16 HEAP32 HEAPU32 HEAP64 HEAPU64 writeStackCookie checkStackCookie INT53_MAX INT53_MIN bigintToI53Checked stackSave stackRestore createNamedFunction ptrToString exitJS getHeapMax growMemory ENV ERRNO_CODES strError DNS Protocols Sockets timers warnOnce readEmAsmArgsArray readEmAsmArgs runEmAsmFunction jstoi_q getExecutableName handleException keepRuntimeAlive callUserCallback maybeExit asyncLoad alignMemory mmapAlloc wasmTable wasmMemory getUniqueRunDependency noExitRuntime freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS UTF8Decoder UTF8ArrayToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 intArrayFromString AsciiToString UTF16Decoder UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 JSEvents specialHTMLTargets maybeCStringToJsString findEventTarget findCanvasEventTarget currentFullscreenStrategy restoreOldWindowedStyle UNWIND_CACHE ExitStatus getEnvStrings doReadv doWritev initRandomFill randomFill emSetImmediate emClearImmediate_deps emClearImmediate promiseMap uncaughtExceptionCount exceptionLast exceptionCaught ExceptionInfo Browser requestFullscreen requestFullScreen setCanvasSize getUserMedia createContext getPreloadedImageData__data wget MONTH_DAYS_REGULAR MONTH_DAYS_LEAP MONTH_DAYS_REGULAR_CUMULATIVE MONTH_DAYS_LEAP_CUMULATIVE SYSCALLS preloadPlugins FS_createPreloadedFile FS_modeStringToFlags FS_getMode FS_stdin_getChar_buffer FS_stdin_getChar FS_readFile FS FS_root FS_mounts FS_devices FS_streams FS_nextInode FS_nameTable FS_currentPath FS_initialized FS_ignorePermissions FS_filesystems FS_syncFSRequests FS_lookupPath FS_getPath FS_hashName FS_hashAddNode FS_hashRemoveNode FS_lookupNode FS_createNode FS_destroyNode FS_isRoot FS_isMountpoint FS_isFile FS_isDir FS_isLink FS_isChrdev FS_isBlkdev FS_isFIFO FS_isSocket FS_flagsToPermissionString FS_nodePermissions FS_mayLookup FS_mayCreate FS_mayDelete FS_mayOpen FS_checkOpExists FS_nextfd FS_getStreamChecked FS_getStream FS_createStream FS_closeStream FS_dupStream FS_doSetAttr FS_chrdev_stream_ops FS_major FS_minor FS_makedev FS_registerDevice FS_getDevice FS_getMounts FS_syncfs FS_mount FS_unmount FS_lookup FS_mknod FS_statfs FS_statfsStream FS_statfsNode FS_create FS_mkdir FS_mkdev FS_symlink FS_rename FS_rmdir FS_readdir FS_readlink FS_stat FS_fstat FS_lstat FS_doChmod FS_chmod FS_lchmod FS_fchmod FS_doChown FS_chown FS_lchown FS_fchown FS_doTruncate FS_truncate FS_ftruncate FS_utime FS_open FS_close FS_isClosed FS_llseek FS_read FS_write FS_mmap FS_msync FS_ioctl FS_writeFile FS_cwd FS_chdir FS_createDefaultDirectories FS_createDefaultDevices FS_createSpecialDirectories FS_createStandardStreams FS_staticInit FS_init FS_quit FS_findObject FS_analyzePath FS_createFile FS_forceLoadFile FS_absolutePath FS_createFolder FS_createLink FS_joinPath FS_mmapAlloc FS_standardizePath MEMFS TTY PIPEFS SOCKFS tempFixedLengthArray miniTempWebGLFloatBuffers miniTempWebGLIntBuffers heapObjectForWebGLType toTypedArrayIndex GL computeUnpackAlignedImageSize colorChannelsInGlTextureFormat emscriptenWebGLGetTexPixelData webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos AL GLUT EGL GLEW IDBStore SDL SDL_gfx print printErr jstoi_s InternalError BindingError throwInternalError throwBindingError registeredTypes awaitingDependencies typeDependencies tupleRegistrations structRegistrations sharedRegisterType whenDependentTypesAreResolved getTypeName getFunctionName heap32VectorToArray requireRegisteredType usesDestructorStack checkArgCount getRequiredArgCount createJsInvoker UnboundTypeError EmValType EmValOptionalType throwUnboundTypeError ensureOverloadTable exposePublicSymbol replacePublicSymbol embindRepr registeredInstances getBasestPointer getInheritedInstance registeredPointers registerType integerReadValueFromPointer floatReadValueFromPointer assertIntegerRange readPointer runDestructors craftInvokerFunction embind__requireFunction genericPointerToWireType constNoSmartPtrRawPointerToWireType nonConstNoSmartPtrRawPointerToWireType init_RegisteredPointer RegisteredPointer RegisteredPointer_fromWireType runDestructor releaseClassHandle finalizationRegistry detachFinalizer_deps detachFinalizer attachFinalizer makeClassHandle init_ClassHandle ClassHandle throwInstanceAlreadyDeleted deletionQueue flushPendingDeletes delayFunction RegisteredClass shallowCopyInternalPointer downcastPointer upcastPointer validateThis char_0 char_9 makeLegalFunctionName emval_freelist emval_handles emval_symbols getStringOrSymbol Emval emval_returnValue emval_lookupTypes emval_methodCallers emval_addMethodCaller handleError".split(" ").forEach(ma);
var Md = {93360:() => {
  throw "A böngésződ nem támogatja a WebGL-t!";
}, 93411:a => {
  throw "Sikertelen shader fordítás: " + N(a);
}, 93475:a => {
  throw "Sikertelen shader összekapcsolás: " + N(a);
}, 93545:(a, b) => {
  if (b = document.getElementById(N(b))) {
    b.innerText = a;
  }
}, 93635:a => {
  throw "Sikertelen fájl beolvasás: " + N(a);
}}, Lc = v("___getTypeName"), ia = v("_emscripten_stack_get_end"), Nd = v("__emscripten_timeout"), Od = v("_malloc"), wb = v("_strerror"), Mc = v("_free"), Pd = v("_emscripten_stack_init"), sd = v("_emscripten_stack_get_current"), wa = v("wasmMemory"), Ic = v("wasmTable"), Qd = {__cxa_throw:(a, b, c) => {
  a = new Fa(a);
  u[a.l + 16 >> 2] = 0;
  u[a.l + 4 >> 2] = b;
  u[a.l + 8 >> 2] = c;
  Ga++;
  p(!1, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
}, __syscall_fcntl64:function(a, b, c) {
  Ha = c;
  try {
    var d = P(a);
    switch(b) {
      case 0:
        var e = H();
        if (0 > e) {
          break;
        }
        for (; sb[e];) {
          e++;
        }
        return Gb(d, e).B;
      case 1:
      case 2:
        return 0;
      case 3:
        return d.flags;
      case 4:
        return e = H(), d.flags |= e, 0;
      case 12:
        return e = H(), D[e + 0 >> 1] = 2, 0;
      case 13:
      case 14:
        return 0;
    }
    return -28;
  } catch (f) {
    if ("undefined" == typeof Zb || "ErrnoError" !== f.name) {
      throw f;
    }
    return -f.K;
  }
}, __syscall_ioctl:function(a, b, c) {
  Ha = c;
  try {
    var d = P(a);
    switch(b) {
      case 21509:
        return d.o ? 0 : -59;
      case 21505:
        if (!d.o) {
          return -59;
        }
        if (d.o.P.hb) {
          b = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          var e = H();
          F[e >> 2] = 25856;
          F[e + 4 >> 2] = 5;
          F[e + 8 >> 2] = 191;
          F[e + 12 >> 2] = 35387;
          for (var f = 0; 32 > f; f++) {
            x[e + f + 17] = b[f] || 0;
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
        if (d.o.P.ib) {
          for (e = H(), b = [], f = 0; 32 > f; f++) {
            b.push(x[e + f + 17]);
          }
        }
        return 0;
      case 21519:
        if (!d.o) {
          return -59;
        }
        e = H();
        return F[e >> 2] = 0;
      case 21520:
        return d.o ? -28 : -59;
      case 21537:
      case 21531:
        e = H();
        if (!d.i.gb) {
          throw new K(59);
        }
        return d.i.gb(d, b, e);
      case 21523:
        if (!d.o) {
          return -59;
        }
        d.o.P.jb && (f = [24, 80], e = H(), D[e >> 1] = f[0], D[e + 2 >> 1] = f[1]);
        return 0;
      case 21524:
        return d.o ? 0 : -59;
      case 21515:
        return d.o ? 0 : -59;
      default:
        return -28;
    }
  } catch (g) {
    if ("undefined" == typeof Zb || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.K;
  }
}, __syscall_openat:function(a, b, c, d) {
  Ha = d;
  try {
    b = N(b);
    var e = b;
    if ("/" === e.charAt(0)) {
      b = e;
    } else {
      var f = -100 === a ? "/" : P(a).path;
      if (0 == e.length) {
        throw new K(44);
      }
      b = f + "/" + e;
    }
    var g = d ? H() : 0;
    return Pb(b, c, g).B;
  } catch (h) {
    if ("undefined" == typeof Zb || "ErrnoError" !== h.name) {
      throw h;
    }
    return -h.K;
  }
}, _abort_js:() => t("native code called abort()"), _embind_register_bigint:(a, b, c, d, e) => {
  b = R(b);
  const f = 0n === d;
  let g = h => h;
  if (f) {
    const h = 8 * c;
    g = l => BigInt.asUintN(h, l);
    e = g(e);
  }
  U(a, {name:b, v:g, D:(h, l) => {
    if ("number" == typeof l) {
      l = BigInt(l);
    } else if ("bigint" != typeof l) {
      throw new TypeError(`Cannot convert "${fc(l)}" to ${this.name}`);
    }
    gc(b, l, d, e);
    return l;
  }, S:ec(b, c, !f), I:null});
}, _embind_register_bool:(a, b, c, d) => {
  b = R(b);
  U(a, {name:b, v:function(e) {
    return !!e;
  }, D:function(e, f) {
    return f ? c : d;
  }, S:function(e) {
    return this.v(C[e]);
  }, I:null});
}, _embind_register_class:(a, b, c, d, e, f, g, h, l, n, k, r, y) => {
  k = R(k);
  f = Jc(e, f);
  h &&= Jc(g, h);
  n &&= Jc(l, n);
  y = Jc(r, y);
  var z = xc(k);
  wc(z, function() {
    Pc(`Cannot construct ${k} due to unbound types`, [d]);
  });
  Qc([a, b, c], d ? [d] : [], A => {
    A = A[0];
    if (d) {
      var B = A.m;
      var G = B.U;
    } else {
      G = tc.prototype;
    }
    A = uc(k, function(...I) {
      if (Object.getPrototypeOf(this) !== J) {
        throw new S(`Use 'new' to construct ${k}`);
      }
      if (void 0 === E.X) {
        throw new S(`${k} has no accessible constructor`);
      }
      var Oc = E.X[I.length];
      if (void 0 === Oc) {
        throw new S(`Tried to invoke ctor of ${k} with invalid number of parameters (${I.length}) - expected (${Object.keys(E.X).toString()}) parameters instead!`);
      }
      return Oc.apply(this, I);
    });
    var J = Object.create(G, {constructor:{value:A}});
    A.prototype = J;
    var E = new yc(k, A, J, y, B, f, h, n);
    if (E.C) {
      var T;
      (T = E.C).Ea ?? (T.Ea = []);
      E.C.Ea.push(E);
    }
    B = new Fc(k, E, !0, !1, !1);
    T = new Fc(k + "*", E, !1, !1, !1);
    G = new Fc(k + " const*", E, !1, !0, !1);
    lc[a] = {pointerType:T, Za:G};
    Gc(z, A);
    return [B, T, G];
  });
}, _embind_register_class_constructor:(a, b, c, d, e, f) => {
  p(0 < b);
  var g = Rc(b, c);
  e = Jc(d, e);
  Qc([], [a], h => {
    h = h[0];
    var l = `constructor ${h.name}`;
    void 0 === h.m.X && (h.m.X = []);
    if (void 0 !== h.m.X[b - 1]) {
      throw new S(`Cannot register multiple constructors with identical number of parameters (${b - 1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    h.m.X[b - 1] = () => {
      Pc(`Cannot construct ${h.name} due to unbound types`, g);
    };
    Qc([], g, n => {
      n.splice(1, 0, null);
      h.m.X[b - 1] = Vc(l, n, null, e, f);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:(a, b, c, d, e, f, g, h, l) => {
  var n = Rc(c, d);
  b = R(b);
  b = Wc(b);
  f = Jc(e, f, l);
  Qc([], [a], k => {
    function r() {
      Pc(`Cannot call ${y} due to unbound types`, n);
    }
    k = k[0];
    var y = `${k.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    h && k.m.qb.push(b);
    var z = k.m.U, A = z[b];
    void 0 === A || void 0 === A.R && A.className !== k.name && A.$ === c - 2 ? (r.$ = c - 2, r.className = k.name, z[b] = r) : (vc(z, b, y), z[b].R[c - 2] = r);
    Qc([], n, B => {
      B = Vc(y, B, k, f, g, l);
      void 0 === z[b].R ? (B.$ = c - 2, z[b] = B) : z[b].R[c - 2] = B;
      return [];
    });
    return [];
  });
}, _embind_register_class_property:(a, b, c, d, e, f, g, h, l, n) => {
  b = R(b);
  e = Jc(d, e);
  Qc([], [a], k => {
    k = k[0];
    var r = `${k.name}.${b}`, y = {get() {
      Pc(`Cannot access ${r} due to unbound types`, [c, g]);
    }, enumerable:!0, configurable:!0};
    y.set = l ? () => Pc(`Cannot access ${r} due to unbound types`, [c, g]) : () => {
      throw new S(r + " is a read-only property");
    };
    Object.defineProperty(k.m.U, b, y);
    Qc([], l ? [c, g] : [c], z => {
      var A = z[0], B = {get() {
        var J = Xc(this, k, r + " getter");
        return A.v(e(f, J));
      }, enumerable:!0};
      if (l) {
        l = Jc(h, l);
        var G = z[1];
        B.set = function(J) {
          var E = Xc(this, k, r + " setter"), T = [];
          l(n, E, G.D(T, J));
          Sc(T);
        };
      }
      Object.defineProperty(k.m.U, b, B);
      return [];
    });
    return [];
  });
}, _embind_register_emval:a => U(a, ad), _embind_register_float:(a, b, c) => {
  b = R(b);
  U(a, {name:b, v:d => d, D:(d, e) => {
    if ("number" != typeof e && "boolean" != typeof e) {
      throw new TypeError(`Cannot convert ${fc(e)} to ${this.name}`);
    }
    return e;
  }, S:bd(b, c), I:null});
}, _embind_register_integer:(a, b, c, d, e) => {
  b = R(b);
  let f = h => h;
  if (0 === d) {
    var g = 32 - 8 * c;
    f = h => h << g >>> g;
    e = f(e);
  }
  U(a, {name:b, v:f, D:(h, l) => {
    if ("number" != typeof l && "boolean" != typeof l) {
      throw new TypeError(`Cannot convert "${fc(l)}" to ${b}`);
    }
    gc(b, l, d, e);
    return l;
  }, S:ec(b, c, 0 !== d), I:null});
}, _embind_register_memory_view:(a, b, c) => {
  function d(f) {
    return new e(x.buffer, u[f + 4 >> 2], u[f >> 2]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
  c = R(c);
  U(a, {name:c, v:d, S:d}, {fb:!0});
}, _embind_register_std_string:(a, b) => {
  b = R(b);
  U(a, {name:b, v(c) {
    var d = N(c + 4, u[c >> 2], !0);
    Mc(c);
    return d;
  }, D(c, d) {
    d instanceof ArrayBuffer && (d = new Uint8Array(d));
    var e = "string" == typeof d;
    if (!(e || ArrayBuffer.isView(d) && 1 == d.BYTES_PER_ELEMENT)) {
      throw new S("Cannot pass non-string to std::string");
    }
    var f = e ? Sa(d) : d.length;
    var g = Od(4 + f + 1), h = g + 4;
    u[g >> 2] = f;
    e ? cd(d, h, f + 1) : C.set(d, h);
    null !== c && c.push(Mc, g);
    return g;
  }, S:Ec, I(c) {
    Mc(c);
  }});
}, _embind_register_std_wstring:(a, b, c) => {
  c = R(c);
  if (2 === b) {
    var d = ed;
    var e = fd;
    var f = gd;
  } else {
    p(4 === b, "only 2-byte and 4-byte strings are currently supported"), d = hd, e = jd, f = kd;
  }
  U(a, {name:c, v:g => {
    var h = d(g + 4, u[g >> 2] * b, !0);
    Mc(g);
    return h;
  }, D:(g, h) => {
    if ("string" != typeof h) {
      throw new S(`Cannot pass non-string to C++ string type ${c}`);
    }
    var l = f(h), n = Od(4 + l + b);
    u[n >> 2] = l / b;
    e(h, n + 4, l + b);
    null !== g && g.push(Mc, n);
    return n;
  }, S:Ec, I(g) {
    Mc(g);
  }});
}, _embind_register_void:(a, b) => {
  b = R(b);
  U(a, {Ja:!0, name:b, v:() => {
  }, D:() => {
  }});
}, _emscripten_fs_load_embedded_files:a => {
  do {
    var b = u[a >> 2];
    a += 4;
    var c = u[a >> 2];
    a += 4;
    var d = u[a >> 2];
    a += 4;
    b = N(b);
    Tb("/", Ka(b));
    Vb(b, null, x.subarray(d, d + c), !0, !0, !0);
  } while (u[a >> 2]);
}, _emscripten_runtime_keepalive_clear:() => {
}, _emval_create_invoker:(a, b, c) => {
  var [d, ...e] = nd(a, b);
  b = d.D.bind(d);
  var f = e.map(l => l.S.bind(l));
  a--;
  var g = {toValue:$c};
  a = f.map((l, n) => {
    var k = `argFromPtr${n}`;
    g[k] = l;
    return `${k}(args${n ? "+" + 8 * n : ""})`;
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
  d.Ja || (g.toReturnWire = b, g.emval_returnValue = od, h = `return emval_returnValue(toReturnWire, destructorsRef, ${h})`);
  h = `return function (handle, methodName, destructorsRef, args) {
  ${h}
  }`;
  c = (new Function(Object.keys(g), h))(...Object.values(g));
  h = `methodCaller<(${e.map(l => l.name)}) => ${d.name}>`;
  return md(uc(h, c));
}, _emval_decref:Zc, _emval_incref:a => {
  9 < a && (V[a + 1] += 1);
}, _emval_invoke:(a, b, c, d, e) => ld[a](b, c, d, e), _emval_new_cstring:a => Cc(qd(a)), _emval_new_object:() => Cc({}), _emval_run_destructors:a => {
  var b = $c(a);
  Sc(b);
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
    td(() => Nd(a, performance.now()));
  }, b);
  rd[a] = {id:c, Qb:b};
  return 0;
}, _tzset_js:(a, b, c, d) => {
  var e = (new Date()).getFullYear(), f = (new Date(e, 0, 1)).getTimezoneOffset();
  e = (new Date(e, 6, 1)).getTimezoneOffset();
  u[a >> 2] = 60 * Math.max(f, e);
  F[b >> 2] = Number(f != e);
  b = g => {
    var h = Math.abs(g);
    return `UTC${0 <= g ? "-" : "+"}${String(Math.floor(h / 60)).padStart(2, "0")}${String(h % 60).padStart(2, "0")}`;
  };
  a = b(f);
  b = b(e);
  p(a);
  p(b);
  p(16 >= Sa(a), `timezone name truncated to fit in TZNAME_MAX (${a})`);
  p(16 >= Sa(b), `timezone name truncated to fit in TZNAME_MAX (${b})`);
  e < f ? (cd(a, c, 17), cd(b, d, 17)) : (cd(a, d, 17), cd(b, c, 17));
}, emscripten_asm_const_int:(a, b, c) => {
  p(Array.isArray(ud));
  p(0 == c % 16);
  ud.length = 0;
  for (var d; d = C[b++];) {
    var e = String.fromCharCode(d), f = ["d", "f", "i", "p"];
    f.push("j");
    p(f.includes(e), `Invalid character ${d}("${e}") in readEmAsmArgs! Use only [${f}], and do not specify "v" for void return argument.`);
    e = 105 != d;
    e &= 112 != d;
    c += e && c % 8 ? 4 : 0;
    ud.push(112 == d ? u[c >> 2] : 106 == d ? sa[c >> 3] : 105 == d ? F[c >> 2] : ra[c >> 3]);
    c += e ? 8 : 4;
  }
  p(Md.hasOwnProperty(a), `No EM_ASM constant found at address ${a}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return Md[a](...ud);
}, emscripten_console_error:a => {
  p("number" == typeof a);
  console.error(N(a));
}, emscripten_get_now:() => performance.now(), emscripten_resize_heap:a => {
  var b = C.length;
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
      d = wa.buffer.byteLength;
      try {
        wa.grow((f - d + 65535) / 65536 | 0);
        va();
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
  b = {alpha:!!x[b + 0], depth:!!x[b + 1], stencil:!!x[b + 2], antialias:!!x[b + 3], premultipliedAlpha:!!x[b + 4], preserveDrawingBuffer:!!x[b + 5], powerPreference:Gd[F[c + 2]], failIfMajorPerformanceCaveat:!!x[b + 12], ca:F[c + 4], Kb:F[c + 5], Gb:x[b + 24], bb:x[b + 25], Nb:F[c + 7], Pb:x[b + 32]};
  1 !== b.ca && 2 !== b.ca && q(`Invalid WebGL version requested: ${b.ca}`);
  2 !== b.ca && q("WebGL 1 requested but only WebGL 2 is supported (MIN_WEBGL_VERSION is 2)");
  a = wd(a);
  return !a || b.bb ? 0 : Ed(a, b);
}, emscripten_webgl_destroy_context:a => {
  Fd == a && (Fd = 0);
  Fd === Z[a] && (Fd = null);
  "object" == typeof JSEvents && JSEvents.Ob(Z[a].Z.canvas);
  Z[a]?.Z.canvas && (Z[a].Z.canvas.Wa = void 0);
  Z[a] = null;
}, emscripten_webgl_get_current_context:() => Fd ? Fd.handle : 0, emscripten_webgl_make_context_current:a => {
  Fd = Z[a];
  m.ctx = W = Fd?.Z;
  return !a || W ? 0 : -5;
}, environ_get:(a, b) => {
  var c = 0, d = 0, e;
  for (e of Jd()) {
    var f = b + c;
    u[a + d >> 2] = f;
    c += cd(e, f, Infinity) + 1;
    d += 4;
  }
  return 0;
}, environ_sizes_get:(a, b) => {
  var c = Jd();
  u[a >> 2] = c.length;
  a = 0;
  for (var d of c) {
    a += Sa(d) + 1;
  }
  u[b >> 2] = a;
  return 0;
}, fd_close:function(a) {
  try {
    var b = P(a);
    Qb(b);
    return 0;
  } catch (c) {
    if ("undefined" == typeof Zb || "ErrnoError" !== c.name) {
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
        var h = u[a >> 2], l = u[a + 4 >> 2];
        a += 8;
        var n = e, k = h, r = l, y = f, z = x;
        p(0 <= k);
        if (0 > r || 0 > y) {
          throw new K(28);
        }
        if (null === n.B) {
          throw new K(8);
        }
        if (1 === (n.flags & 2097155)) {
          throw new K(8);
        }
        if (M(n.node.mode)) {
          throw new K(31);
        }
        if (!n.i.read) {
          throw new K(28);
        }
        var A = "undefined" != typeof y;
        if (!A) {
          y = n.position;
        } else if (!n.seekable) {
          throw new K(70);
        }
        var B = n.i.read(n, z, k, r, y);
        A || (n.position += B);
        var G = B;
        if (0 > G) {
          var J = -1;
          break a;
        }
        b += G;
        if (G < l) {
          break;
        }
        "undefined" != typeof f && (f += G);
      }
      J = b;
    }
    u[d >> 2] = J;
    return 0;
  } catch (E) {
    if ("undefined" == typeof Zb || "ErrnoError" !== E.name) {
      throw E;
    }
    return E.K;
  }
}, fd_seek:function(a, b, c, d) {
  b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
  try {
    if (isNaN(b)) {
      return 61;
    }
    var e = P(a);
    Rb(e, b, c);
    sa[d >> 3] = BigInt(e.position);
    e.va && 0 === b && 0 === c && (e.va = null);
    return 0;
  } catch (f) {
    if ("undefined" == typeof Zb || "ErrnoError" !== f.name) {
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
        var h = u[a >> 2], l = u[a + 4 >> 2];
        a += 8;
        var n = Sb(e, x, h, l, f);
        if (0 > n) {
          var k = -1;
          break a;
        }
        b += n;
        if (n < l) {
          break;
        }
        "undefined" != typeof f && (f += n);
      }
      k = b;
    }
    u[d >> 2] = k;
    return 0;
  } catch (r) {
    if ("undefined" == typeof Zb || "ErrnoError" !== r.name) {
      throw r;
    }
    return r.K;
  }
}, glActiveTexture:a => W.activeTexture(a), glAttachShader:(a, b) => {
  W.attachShader(X[a], Y[b]);
}, glBindBuffer:(a, b) => {
  35051 == a ? W.Ga = b : 35052 == a && (W.sa = b);
  W.bindBuffer(a, yd[b]);
}, glBindBufferRange:(a, b, c, d, e) => {
  W.bindBufferRange(a, b, yd[c], d, e);
}, glBindTexture:(a, b) => {
  W.bindTexture(a, zd[b]);
}, glBindVertexArray:a => {
  W.bindVertexArray(Ad[a]);
}, glBlendFunc:(a, b) => W.blendFunc(a, b), glBufferData:(a, b, c, d) => {
  c && b ? W.bufferData(a, C, d, c, b) : W.bufferData(a, b, d);
}, glBufferSubData:(a, b, c, d) => {
  c && W.bufferSubData(a, b, C, d, c);
}, glClear:a => W.clear(a), glClearColor:(a, b, c, d) => W.clearColor(a, b, c, d), glCompileShader:a => {
  W.compileShader(Y[a]);
}, glCreateProgram:() => {
  var a = Bd(X), b = W.createProgram();
  b.name = a;
  b.na = b.la = b.ma = 0;
  b.Da = 1;
  X[a] = b;
  return a;
}, glCreateShader:a => {
  var b = Bd(Y);
  Y[b] = W.createShader(a);
  return b;
}, glDeleteBuffers:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = F[b + 4 * c >> 2], e = yd[d];
    e && (W.deleteBuffer(e), e.name = 0, yd[d] = null, d == W.Ga && (W.Ga = 0), d == W.sa && (W.sa = 0));
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
    var d = F[b + 4 * c >> 2], e = zd[d];
    e && (W.deleteTexture(e), e.name = 0, zd[d] = null);
  }
}, glDeleteVertexArrays:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = F[b + 4 * c >> 2];
    W.deleteVertexArray(Ad[d]);
    Ad[d] = null;
  }
}, glDepthMask:a => {
  W.depthMask(!!a);
}, glDrawElements:(a, b, c, d) => {
  W.drawElements(a, b, c, d);
}, glDrawElementsInstanced:(a, b, c, d, e) => {
  W.drawElementsInstanced(a, b, c, d, e);
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
  c && (F[c >> 2] = b);
}, glGetProgramiv:(a, b, c) => {
  if (c && !(a >= xd)) {
    if (a = X[a], 35716 == b) {
      F[c >> 2] = W.getProgramInfoLog(a).length + 1;
    } else if (35719 == b) {
      if (!a.na) {
        var d = W.getProgramParameter(a, 35718);
        for (b = 0; b < d; ++b) {
          a.na = Math.max(a.na, W.getActiveUniform(a, b).name.length + 1);
        }
      }
      F[c >> 2] = a.na;
    } else if (35722 == b) {
      if (!a.la) {
        for (d = W.getProgramParameter(a, 35721), b = 0; b < d; ++b) {
          a.la = Math.max(a.la, W.getActiveAttrib(a, b).name.length + 1);
        }
      }
      F[c >> 2] = a.la;
    } else if (35381 == b) {
      if (!a.ma) {
        for (d = W.getProgramParameter(a, 35382), b = 0; b < d; ++b) {
          a.ma = Math.max(a.ma, W.getActiveUniformBlockName(a, b).length + 1);
        }
      }
      F[c >> 2] = a.ma;
    } else {
      F[c >> 2] = W.getProgramParameter(a, b);
    }
  }
}, glGetShaderInfoLog:(a, b, c, d) => {
  a = W.getShaderInfoLog(Y[a]);
  b = 0 < b && d ? cd(a, d, b) : 0;
  c && (F[c >> 2] = b);
}, glGetShaderiv:(a, b, c) => {
  c && (35716 == b ? (a = W.getShaderInfoLog(Y[a]), F[c >> 2] = a ? a.length + 1 : 0) : 35720 == b ? (a = W.getShaderSource(Y[a]), F[c >> 2] = a ? a.length + 1 : 0) : F[c >> 2] = W.getShaderParameter(Y[a], b));
}, glGetUniformBlockIndex:(a, b) => W.getUniformBlockIndex(X[a], N(b)), glGetUniformLocation:(a, b) => {
  b = N(b);
  if (a = X[a]) {
    var c = a, d = c.ga, e = c.Va, f;
    if (!d) {
      c.ga = d = {};
      c.Ua = {};
      var g = W.getProgramParameter(c, 35718);
      for (f = 0; f < g; ++f) {
        var h = W.getActiveUniform(c, f);
        var l = h.name;
        h = h.size;
        var n = Kd(l);
        n = 0 < n ? l.slice(0, n) : l;
        var k = c.Da;
        c.Da += h;
        e[n] = [h, k];
        for (l = 0; l < h; ++l) {
          d[k] = l, c.Ua[k++] = n;
        }
      }
    }
    c = a.ga;
    d = 0;
    e = b;
    f = Kd(b);
    0 < f && (d = parseInt(b.slice(f + 1)) >>> 0, e = b.slice(0, f));
    if ((e = a.Va[e]) && d < e[0] && (d += e[1], c[d] = c[d] || W.getUniformLocation(a, b))) {
      return d;
    }
  }
  return -1;
}, glLinkProgram:a => {
  a = X[a];
  W.linkProgram(a);
  a.ga = 0;
  a.Va = {};
}, glShaderSource:(a, b, c, d) => {
  for (var e = "", f = 0; f < b; ++f) {
    e += N(u[c + 4 * f >> 2], d ? u[d + 4 * f >> 2] : void 0);
  }
  W.shaderSource(Y[a], e);
}, glTexImage2D:(a, b, c, d, e, f, g, h, l) => {
  if (W.sa) {
    W.texImage2D(a, b, c, d, e, f, g, h, l);
  } else {
    if (l) {
      var n = Ld(h);
      l >>>= 31 - Math.clz32(n.BYTES_PER_ELEMENT);
      W.texImage2D(a, b, c, d, e, f, g, h, n, l);
    } else {
      if (l) {
        n = Ld(h);
        var k = e * (d * ({5:3, 6:4, 8:2, 29502:3, 29504:4, 26917:2, 26918:2, 29846:3, 29847:4}[g - 6402] || 1) * n.BYTES_PER_ELEMENT + 4 - 1 & -4);
        l = n.subarray(l >>> 31 - Math.clz32(n.BYTES_PER_ELEMENT), l + k >>> 31 - Math.clz32(n.BYTES_PER_ELEMENT));
      } else {
        l = null;
      }
      W.texImage2D(a, b, c, d, e, f, g, h, l);
    }
  }
}, glTexParameteri:(a, b, c) => W.texParameteri(a, b, c), glUniform1i:(a, b) => {
  var c = W, d = c.uniform1i, e = W.$a;
  p(e, "Attempted to call glUniform*() without an active GL program set! (build with -sGL_TRACK_ERRORS for standards-conformant behavior)");
  var f = e.ga[a];
  "number" == typeof f && (e.ga[a] = f = W.getUniformLocation(e, e.Ua[a] + (0 < f ? `[${f}]` : "")));
  d.call(c, f, b);
}, glUniformBlockBinding:(a, b, c) => {
  a = X[a];
  W.uniformBlockBinding(a, b, c);
}, glUseProgram:a => {
  a = X[a];
  W.useProgram(a);
  W.$a = a;
}, glVertexAttribDivisor:(a, b) => {
  W.vertexAttribDivisor(a, b);
}, glVertexAttribPointer:(a, b, c, d, e, f) => {
  W.vertexAttribPointer(a, b, c, !!d, e, f);
}, glViewport:(a, b, c, d) => W.viewport(a, b, c, d), proc_exit:a => {
  throw new Da(a);
}, textureFromURL:async function(a, b, c, d, e, f) {
  c = Z[c].Z;
  b = N(b);
  e = $c(e);
  f = $c(f);
  let g = null;
  try {
    const l = await fetch(b);
    if (!l.ok) {
      throw Error(`${l.status} ${l.statusText}`);
    }
    const n = l.headers.get("content-type");
    if (n && !n.startsWith("image/")) {
      throw Error(`Invalid content-type: ${n}`);
    }
    const k = await l.blob();
    g = await createImageBitmap(k);
    const r = zd[a];
    if (!r) {
      throw Error("Texture failed to load (the webgl texture no longer exists)");
    }
    c.bindTexture(c.TEXTURE_2D, r);
    c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, g);
    d && c.generateMipmap(c.TEXTURE_2D);
    c.bindTexture(c.TEXTURE_2D, null);
    "function" == typeof e && e();
  } catch (l) {
    var h = `Texture error [${b}]: ${l.message}`;
    "function" == typeof f ? f(h) : console.error(h);
  } finally {
    g && g.close();
  }
}}, Rd;
function Sd() {
  if (0 < ib) {
    jb = Sd;
  } else {
    Pd();
    var a = ia();
    p(0 == (a & 3));
    0 == a && (a += 4);
    u[a >> 2] = 34821223;
    u[a + 4 >> 2] = 2310721022;
    u[0] = 1668509029;
    if (0 < ib) {
      jb = Sd;
    } else {
      p(!Rd);
      Rd = !0;
      m.calledRun = !0;
      if (!fa) {
        p(!ua);
        ua = !0;
        ha();
        if (!m.noFSInit && !ub) {
          p(!ub, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
          ub = !0;
          Mb("/dev/tty", "/dev/stdin");
          Mb("/dev/tty", "/dev/stdout");
          Mb("/dev/tty1", "/dev/stderr");
          a = Pb("/dev/stdin", 0);
          var b = Pb("/dev/stdout", 1), c = Pb("/dev/stderr", 1);
          p(0 === a.B, `invalid handle for stdin (${a.B})`);
          p(1 === b.B, `invalid handle for stdout (${b.B})`);
          p(2 === c.B, `invalid handle for stderr (${c.B})`);
        }
        ya.__wasm_call_ctors();
        vb = !1;
        na?.(m);
        p(!m._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
        ha();
      }
      ha();
    }
  }
}
var ya;
ya = await (async function() {
  var a = {env:Qd, wasi_snapshot_preview1:Qd};
  za ??= m.locateFile ? ba + "mapViewer.wasm" : (new URL("mapViewer.wasm", import.meta.url)).href;
  a = await Ca(a);
  p(m === m, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  a = ya = a.instance.exports;
  p("undefined" != typeof a.__getTypeName, "missing Wasm export: __getTypeName");
  Lc = xa("__getTypeName", 1);
  p("undefined" != typeof a.fflush, "missing Wasm export: fflush");
  p("undefined" != typeof a.emscripten_stack_get_end, "missing Wasm export: emscripten_stack_get_end");
  ia = a.emscripten_stack_get_end;
  p("undefined" != typeof a.emscripten_stack_get_base, "missing Wasm export: emscripten_stack_get_base");
  p("undefined" != typeof a._emscripten_timeout, "missing Wasm export: _emscripten_timeout");
  Nd = xa("_emscripten_timeout", 2);
  p("undefined" != typeof a.malloc, "missing Wasm export: malloc");
  Od = xa("malloc", 1);
  p("undefined" != typeof a.strerror, "missing Wasm export: strerror");
  wb = xa("strerror", 1);
  p("undefined" != typeof a.free, "missing Wasm export: free");
  Mc = xa("free", 1);
  p("undefined" != typeof a.emscripten_stack_init, "missing Wasm export: emscripten_stack_init");
  Pd = a.emscripten_stack_init;
  p("undefined" != typeof a.emscripten_stack_get_free, "missing Wasm export: emscripten_stack_get_free");
  p("undefined" != typeof a._emscripten_stack_restore, "missing Wasm export: _emscripten_stack_restore");
  p("undefined" != typeof a._emscripten_stack_alloc, "missing Wasm export: _emscripten_stack_alloc");
  p("undefined" != typeof a.emscripten_stack_get_current, "missing Wasm export: emscripten_stack_get_current");
  sd = a.emscripten_stack_get_current;
  p("undefined" != typeof a.__cxa_increment_exception_refcount, "missing Wasm export: __cxa_increment_exception_refcount");
  p("undefined" != typeof a.memory, "missing Wasm export: memory");
  wa = a.memory;
  p("undefined" != typeof a.__indirect_function_table, "missing Wasm export: __indirect_function_table");
  Ic = a.__indirect_function_table;
  va();
  return ya;
}());
Sd();
ua ? moduleRtn = m : moduleRtn = new Promise((a, b) => {
  na = a;
  oa = b;
});
for (const a of Object.keys(m)) {
  a in moduleArg || Object.defineProperty(moduleArg, a, {configurable:!0, get() {
    t(`Access to module property ('${a}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
  }});
}
;


  return moduleRtn;
}

// Export using a UMD style export, or ES6 exports if selected
export default ModuleBuilder;

