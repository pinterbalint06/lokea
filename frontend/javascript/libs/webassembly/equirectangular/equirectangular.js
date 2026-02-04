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
function ha() {
  if (!fa) {
    var a = ia();
    0 == a && (a += 4);
    var b = v[a >> 2], c = v[a + 4 >> 2];
    34821223 == b && 2310721022 == c || t(`Stack overflow! Stack cookie has been overwritten at ${ja(a)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ja(c)} ${ja(b)}`);
    1668509029 != v[0] && t("Runtime error: The application has corrupted its heap memory area (address zero)!");
  }
}
var ka = new Int16Array(1), la = new Int8Array(ka.buffer);
ka[0] = 25459;
115 === la[0] && 99 === la[1] || t("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
function x(a) {
  return () => p(!1, `call to '${a}' via reference taken before Wasm module initialization`);
}
function y(a) {
  Object.getOwnPropertyDescriptor(n, a) && t(`\`Module.${a}\` was supplied but \`${a}\` not included in INCOMING_MODULE_JS_API`);
}
function ma(a) {
  Object.getOwnPropertyDescriptor(n, a) || Object.defineProperty(n, a, {configurable:!0, get() {
    var b = `'${a}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    "FS_createPath" !== a && "FS_createDataFile" !== a && "FS_createPreloadedFile" !== a && "FS_preloadFile" !== a && "FS_unlink" !== a && "addRunDependency" !== a && "FS_createLazyFile" !== a && "FS_createDevice" !== a && "removeRunDependency" !== a || (b += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
    t(b);
  }});
}
var na, oa, B, D, F, pa, H, v, qa, ra, sa, ta, ua = !1;
function va() {
  var a = wa.buffer;
  B = new Int8Array(a);
  F = new Int16Array(a);
  D = new Uint8Array(a);
  pa = new Uint16Array(a);
  H = new Int32Array(a);
  v = new Uint32Array(a);
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
var ja = a => {
  p("number" === typeof a, `ptrToString expects a number, got ${typeof a}`);
  return "0x" + (a >>> 0).toString(16).padStart(8, "0");
}, Fa = a => {
  Fa.Ca || (Fa.Ca = {});
  Fa.Ca[a] || (Fa.Ca[a] = 1, q(a));
};
class Ga {
  constructor(a) {
    this.l = a - 24;
  }
}
var Ha = 0, J = () => {
  p(void 0 != Ia);
  var a = H[+Ia >> 2];
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
        224 == (e & 240) ? e = (e & 15) << 12 | f << 6 | g : (240 != (e & 248) && Fa("Invalid UTF-8 leading byte " + ja(e) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), e = (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63);
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
      1114111 < g && Fa("Invalid Unicode code point " + ja(g) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
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
  Wa[a] = {input:[], output:[], P:b};
  Ya(a, Za);
}
var Za = {open(a) {
  var b = Wa[a.node.pa];
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
    } catch (k) {
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
  e && (a.node.V = Date.now());
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
  d && (a.node.J = a.node.D = Date.now());
  return e;
}}, $a = {Ia() {
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
}, ia(a) {
  0 < a.output?.length && (ea(Ra(a.output)), a.output = []);
}, hb() {
  return {Ab:25856, Cb:5, zb:191, Bb:35387, yb:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
}, ib() {
  return 0;
}, jb() {
  return [24, 80];
}}, ab = {Aa(a, b) {
  null === b || 10 === b ? (q(Ra(a.output)), a.output = []) : 0 != b && a.output.push(b);
}, ia(a) {
  0 < a.output?.length && (q(Ra(a.output)), a.output = []);
}}, bb = () => {
  t("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
}, L = {M:null, O() {
  return L.createNode(null, "/", 16895, 0);
}, createNode(a, b, c, d) {
  if (24576 === (c & 61440) || 4096 === (c & 61440)) {
    throw new K(63);
  }
  L.M || (L.M = {dir:{node:{T:L.j.T, N:L.j.N, ba:L.j.ba, oa:L.j.oa, Sa:L.j.Sa, ra:L.j.ra, Ta:L.j.Ta, Ba:L.j.Ba, qa:L.j.qa}, stream:{L:L.i.L}}, file:{node:{T:L.j.T, N:L.j.N}, stream:{L:L.i.L, read:L.i.read, write:L.i.write, za:L.i.za, Pa:L.i.Pa}}, link:{node:{T:L.j.T, N:L.j.N, fa:L.j.fa}, stream:{}}, Fa:{node:{T:L.j.T, N:L.j.N}, stream:cb}});
  c = db(a, b, c, d);
  N(c.mode) ? (c.j = L.M.dir.node, c.i = L.M.dir.stream, c.h = {}) : 32768 === (c.mode & 61440) ? (c.j = L.M.file.node, c.i = L.M.file.stream, c.u = 0, c.h = null) : 40960 === (c.mode & 61440) ? (c.j = L.M.link.node, c.i = L.M.link.stream) : 8192 === (c.mode & 61440) && (c.j = L.M.Fa.node, c.i = L.M.Fa.stream);
  c.V = c.J = c.D = Date.now();
  a && (a.h[b] = c, a.V = a.J = a.D = c.V);
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
  N(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.u : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.V = new Date(a.V);
  b.J = new Date(a.J);
  b.D = new Date(a.D);
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
    var d = eb(b, c);
  } catch (f) {
  }
  if (d) {
    if (N(a.mode)) {
      for (var e in d.h) {
        throw new K(55);
      }
    }
    fb(d);
  }
  delete a.parent.h[a.name];
  b.h[c] = a;
  a.name = c;
  b.D = b.J = a.parent.D = a.parent.J = Date.now();
}, ra(a, b) {
  delete a.h[b];
  a.D = a.J = Date.now();
}, Ta(a, b) {
  var c = eb(a, b), d;
  for (d in c.h) {
    throw new K(55);
  }
  delete a.h[b];
  a.D = a.J = Date.now();
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
  b.buffer === B.buffer && (f = !1);
  if (!d) {
    return 0;
  }
  a = a.node;
  a.J = a.D = Date.now();
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
  if (e & 2 || !a || a.buffer !== B.buffer) {
    d = !0;
    e = bb();
    if (!e) {
      throw new K(48);
    }
    if (a) {
      if (0 < c || c + b < a.length) {
        a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
      }
      B.set(a, e);
    }
  } else {
    d = !1, e = a.byteOffset;
  }
  return {l:e, Xa:d};
}, Pa(a, b, c, d) {
  L.i.write(a, b, 0, d, c, !1);
  return 0;
}}}, gb = (a, b) => {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}, O = (a, b, c) => {
  p("number" == typeof a, `UTF8ToString expects a number (got ${typeof a})`);
  return a ? Ra(D, a, b, c) : "";
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
}, rb = null, sb = {}, tb = [], ub = 1, P = null, vb = !1, wb = !0, K = class extends Error {
  name="ErrnoError";
  constructor(a) {
    super(ua ? O(xb(a)) : "");
    this.K = a;
    for (var b in hb) {
      if (hb[b] === a) {
        this.code = b;
        break;
      }
    }
  }
}, yb = class {
  F={};
  node=null;
  get object() {
    return this.node;
  }
  set object(a) {
    this.node = a;
  }
  get flags() {
    return this.F.flags;
  }
  set flags(a) {
    this.F.flags = a;
  }
  get position() {
    return this.F.position;
  }
  set position(a) {
    this.F.position = a;
  }
}, zb = class {
  j={};
  i={};
  da=null;
  constructor(a, b, c, d) {
    a ||= this;
    this.parent = a;
    this.O = a.O;
    this.id = ub++;
    this.name = b;
    this.mode = c;
    this.pa = d;
    this.V = this.J = this.D = Date.now();
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
    return N(this.mode);
  }
  get kb() {
    return 8192 === (this.mode & 61440);
  }
};
function Ab(a, b = {}) {
  if (!a) {
    throw new K(44);
  }
  b.ua ?? (b.ua = !0);
  "/" === a.charAt(0) || (a = "//" + a);
  var c = 0;
  a: for (; 40 > c; c++) {
    a = a.split("/").filter(k => !!k);
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
          } catch (k) {
            if (44 === k?.K && g && b.ob) {
              return {path:e};
            }
            throw k;
          }
          !d.da || g && !b.ua || (d = d.da.root);
          if (40960 === (d.mode & 61440) && (!g || b.ta)) {
            if (!d.j.fa) {
              throw new K(52);
            }
            d = d.j.fa(d);
            "/" === d.charAt(0) || (d = La(e) + "/" + d);
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
function Bb(a) {
  for (var b;;) {
    if (a === a.parent) {
      return a = a.O.Oa, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
    }
    b = b ? `${a.name}/${b}` : a.name;
    a = a.parent;
  }
}
function Cb(a, b) {
  for (var c = 0, d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % P.length;
}
function fb(a) {
  var b = Cb(a.parent.id, a.name);
  if (P[b] === a) {
    P[b] = a.Z;
  } else {
    for (b = P[b]; b;) {
      if (b.Z === a) {
        b.Z = a.Z;
        break;
      }
      b = b.Z;
    }
  }
}
function eb(a, b) {
  var c = N(a.mode) ? (c = Db(a, "x")) ? c : a.j.ba ? 0 : 2 : 54;
  if (c) {
    throw new K(c);
  }
  for (c = P[Cb(a.id, b)]; c; c = c.Z) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return a.j.ba(a, b);
}
function db(a, b, c, d) {
  p("object" == typeof a);
  a = new zb(a, b, c, d);
  b = Cb(a.parent.id, a.name);
  a.Z = P[b];
  return P[b] = a;
}
function N(a) {
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
  if (!N(a.mode)) {
    return 54;
  }
  try {
    return eb(a, b), 20;
  } catch (c) {
  }
  return Db(a, "wx");
}
function Gb(a) {
  a = tb[a];
  if (!a) {
    throw new K(8);
  }
  return a;
}
function Hb(a, b = -1) {
  p(-1 <= b);
  a = Object.assign(new yb(), a);
  if (-1 == b) {
    a: {
      for (b = 0; 4096 >= b; b++) {
        if (!tb[b]) {
          break a;
        }
      }
      throw new K(33);
    }
  }
  a.A = b;
  return tb[b] = a;
}
function Ib(a, b = -1) {
  a = Hb(a, b);
  a.i?.Fb?.(a);
  return a;
}
function Jb(a, b) {
  var c = null?.i.N, d = c ? null : a;
  c ??= a.j.N;
  if (!c) {
    throw new K(63);
  }
  c(d, b);
}
var cb = {open(a) {
  a.i = sb[a.node.pa].i;
  a.i.open?.(a);
}, L() {
  throw new K(70);
}};
function Ya(a, b) {
  sb[a] = {i:b};
}
function Kb(a, b) {
  if ("string" == typeof a) {
    throw a;
  }
  var c = "/" === b, d = !b;
  if (c && rb) {
    throw new K(10);
  }
  if (!c && !d) {
    var e = Ab(b, {ua:!1});
    b = e.path;
    e = e.node;
    if (e.da) {
      throw new K(10);
    }
    if (!N(e.mode)) {
      throw new K(54);
    }
  }
  b = {type:a, Mb:{}, Oa:b, nb:[]};
  a = a.O(b);
  a.O = b;
  b.root = a;
  c ? rb = a : e && (e.da = b, e.O && e.O.nb.push(b));
}
function Lb(a, b, c) {
  var d = Ab(a, {parent:!0}).node;
  a = a && a.match(/([^\/]+|\/)\/*$/)[1];
  if (!a) {
    throw new K(28);
  }
  if ("." === a || ".." === a) {
    throw new K(20);
  }
  var e = Fb(d, a);
  if (e) {
    throw new K(e);
  }
  if (!d.j.oa) {
    throw new K(63);
  }
  return d.j.oa(d, a, b, c);
}
function Mb(a, b = 438) {
  return Lb(a, b & 4095 | 32768, 0);
}
function Q(a) {
  return Lb(a, 16895, 0);
}
function Nb(a, b, c) {
  "undefined" == typeof c && (c = b, b = 438);
  return Lb(a, b | 8192, c);
}
function Ob(a, b) {
  if (!Oa(a)) {
    throw new K(44);
  }
  var c = Ab(b, {parent:!0}).node;
  if (!c) {
    throw new K(44);
  }
  b = b && b.match(/([^\/]+|\/)\/*$/)[1];
  var d = Fb(c, b);
  if (d) {
    throw new K(d);
  }
  if (!c.j.qa) {
    throw new K(63);
  }
  c.j.qa(c, b, a);
}
function Pb(a) {
  var b = Ab(a, {parent:!0}).node;
  if (!b) {
    throw new K(44);
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
    d = e ? e : N(d.mode) ? 31 : 0;
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
  fb(c);
}
function Qb(a, b) {
  a = "string" == typeof a ? Ab(a, {ta:!0}).node : a;
  Jb(a, {mode:b & 4095 | a.mode & -4096, D:Date.now(), Eb:void 0});
}
function Rb(a, b, c = 438) {
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
    var f = Ab(a, {ta:!(b & 131072), ob:!0});
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
      d = Lb(a, c | 511, 0);
      f = !0;
    }
  }
  if (!d) {
    throw new K(44);
  }
  8192 === (d.mode & 61440) && (b &= -513);
  if (b & 65536 && !N(d.mode)) {
    throw new K(54);
  }
  if (!f && (e = d ? 40960 === (d.mode & 61440) ? 32 : N(d.mode) && ("r" !== Eb(b) || b & 576) ? 31 : Db(d, Eb(b)) : 44)) {
    throw new K(e);
  }
  if (b & 512 && !f) {
    e = d;
    e = "string" == typeof e ? Ab(e, {ta:!0}).node : e;
    if (N(e.mode)) {
      throw new K(31);
    }
    if (32768 !== (e.mode & 61440)) {
      throw new K(28);
    }
    if (a = Db(e, "w")) {
      throw new K(a);
    }
    Jb(e, {size:0, timestamp:Date.now()});
  }
  b = Hb({node:d, path:Bb(d), flags:b & -131713, seekable:!0, position:0, i:d.i, vb:[], error:!1});
  b.i.open && b.i.open(b);
  f && Qb(d, c & 511);
  return b;
}
function Sb(a) {
  if (null === a.A) {
    throw new K(8);
  }
  a.va && (a.va = null);
  try {
    a.i.close && a.i.close(a);
  } catch (b) {
    throw b;
  } finally {
    tb[a.A] = null;
  }
  a.A = null;
}
function Tb(a, b, c) {
  if (null === a.A) {
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
function Ub(a, b, c, d, e, f) {
  p(0 <= c);
  if (0 > d || 0 > e) {
    throw new K(28);
  }
  if (null === a.A) {
    throw new K(8);
  }
  if (0 === (a.flags & 2097155)) {
    throw new K(8);
  }
  if (N(a.node.mode)) {
    throw new K(31);
  }
  if (!a.i.write) {
    throw new K(28);
  }
  a.seekable && a.flags & 1024 && Tb(a, 0, 2);
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
function Vb(a, b) {
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
function Wb(a, b, c, d) {
  a = Ka(("string" == typeof a ? a : Bb(a)) + "/" + b);
  return Mb(a, gb(c, d));
}
function Xb(a, b, c, d, e, f) {
  var g = b;
  a && (a = "string" == typeof a ? a : Bb(a), g = b ? Ka(a + "/" + b) : a);
  a = gb(d, e);
  g = Mb(g, a);
  if (c) {
    if ("string" == typeof c) {
      b = Array(c.length);
      d = 0;
      for (e = c.length; d < e; ++d) {
        b[d] = c.charCodeAt(d);
      }
      c = b;
    }
    Qb(g, a | 146);
    b = Rb(g, 577);
    Ub(b, c, 0, c.length, 0, f);
    Sb(b);
    Qb(g, a);
  }
}
function Yb(a, b, c, d) {
  a = Ka(("string" == typeof a ? a : Bb(a)) + "/" + b);
  b = gb(!!c, !!d);
  Yb.Na ?? (Yb.Na = 64);
  var e = Yb.Na++ << 8 | 0;
  Ya(e, {open(f) {
    f.seekable = !1;
  }, close() {
    d?.buffer?.length && d(10);
  }, read(f, g, k, l) {
    for (var m = 0, h = 0; h < l; h++) {
      try {
        var r = c();
      } catch (z) {
        throw new K(29);
      }
      if (void 0 === r && 0 === m) {
        throw new K(6);
      }
      if (null === r || void 0 === r) {
        break;
      }
      m++;
      g[k + h] = r;
    }
    m && (f.node.V = Date.now());
    return m;
  }, write(f, g, k, l) {
    for (var m = 0; m < l; m++) {
      try {
        d(g[k + m]);
      } catch (h) {
        throw new K(29);
      }
    }
    l && (f.node.J = f.node.D = Date.now());
    return m;
  }});
  return Nb(a, b, e);
}
function Zb(a) {
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
function $b(a, b, c, d, e) {
  function f(h, r, z, u, w) {
    h = h.node.h;
    if (w >= h.length) {
      return 0;
    }
    u = Math.min(h.length - w, u);
    p(0 <= u);
    if (h.slice) {
      for (var C = 0; C < u; C++) {
        r[z + C] = h[w + C];
      }
    } else {
      for (C = 0; C < u; C++) {
        r[z + C] = h.get(w + C);
      }
    }
    return u;
  }
  class g {
    xa=!1;
    F=[];
    wa=void 0;
    La=0;
    Ka=0;
    get(h) {
      if (!(h > this.length - 1 || 0 > h)) {
        var r = h % this.Qa;
        return this.wa(h / this.Qa | 0)[r];
      }
    }
    tb(h) {
      this.wa = h;
    }
    Ma() {
      var h = new XMLHttpRequest();
      h.open("HEAD", c, !1);
      h.send(null);
      200 <= h.status && 300 > h.status || 304 === h.status || t("Couldn't load " + c + ". Status: " + h.status);
      var r = Number(h.getResponseHeader("Content-length")), z, u = (z = h.getResponseHeader("Accept-Ranges")) && "bytes" === z;
      h = (z = h.getResponseHeader("Content-Encoding")) && "gzip" === z;
      var w = 1048576;
      u || (w = r);
      var C = this;
      C.tb(A => {
        var I = A * w, E = (A + 1) * w - 1;
        E = Math.min(E, r - 1);
        if ("undefined" == typeof C.F[A]) {
          var M = C.F;
          I > E && t("invalid range (" + I + ", " + E + ") or no bytes requested!");
          E > r - 1 && t("only " + r + " bytes available! programmer error!");
          var G = new XMLHttpRequest();
          G.open("GET", c, !1);
          r !== w && G.setRequestHeader("Range", "bytes=" + I + "-" + E);
          G.responseType = "arraybuffer";
          G.overrideMimeType && G.overrideMimeType("text/plain; charset=x-user-defined");
          G.send(null);
          200 <= G.status && 300 > G.status || 304 === G.status || t("Couldn't load " + c + ". Status: " + G.status);
          I = void 0 !== G.response ? new Uint8Array(G.response || []) : Va(G.responseText || "");
          M[A] = I;
        }
        "undefined" == typeof C.F[A] && t("doXHR failed!");
        return C.F[A];
      });
      if (h || !r) {
        w = r = 1, w = r = this.wa(0).length, ea("LazyFiles on gzip forces download of the whole file when length is accessed");
      }
      this.La = r;
      this.Ka = w;
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
    var k = new g();
    var l = void 0;
  } else {
    l = c, k = void 0;
  }
  var m = Wb(a, b, d, e);
  k ? m.h = k : l && (m.h = null, m.url = l);
  Object.defineProperties(m, {u:{get:function() {
    return this.h.length;
  }}});
  a = {};
  for (const [h, r] of Object.entries(m.i)) {
    a[h] = (...z) => {
      Zb(m);
      return r(...z);
    };
  }
  a.read = (h, r, z, u, w) => {
    Zb(m);
    return f(h, r, z, u, w);
  };
  a.za = (h, r, z) => {
    Zb(m);
    var u = bb();
    if (!u) {
      throw new K(48);
    }
    f(h, B, u, r, z);
    return {l:u, Xa:!0};
  };
  m.i = a;
  return m;
}
var ac = {}, Ia = void 0, R = a => {
  for (var b = "";;) {
    var c = D[a++];
    if (!c) {
      return b;
    }
    b += String.fromCharCode(c);
  }
}, bc = {}, cc = {}, dc = {}, S = class extends Error {
  constructor(a) {
    super(a);
    this.name = "BindingError";
  }
}, ec = a => {
  throw new S(a);
};
function fc(a, b, c = {}) {
  var d = b.name;
  if (!a) {
    throw new S(`type "${d}" must have a positive integer typeid pointer`);
  }
  if (cc.hasOwnProperty(a)) {
    if (c.fb) {
      return;
    }
    throw new S(`Cannot register type '${d}' twice`);
  }
  cc[a] = b;
  delete dc[a];
  bc.hasOwnProperty(a) && (b = bc[a], delete bc[a], b.forEach(e => e()));
}
function T(a, b, c = {}) {
  return fc(a, b, c);
}
var gc = (a, b, c) => {
  switch(b) {
    case 1:
      return c ? d => B[d] : d => D[d];
    case 2:
      return c ? d => F[d >> 1] : d => pa[d >> 1];
    case 4:
      return c ? d => H[d >> 2] : d => v[d >> 2];
    case 8:
      return c ? d => sa[d >> 3] : d => ta[d >> 3];
    default:
      throw new TypeError(`invalid integer width (${b}): ${a}`);
  }
}, hc = a => {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}, ic = (a, b, c, d) => {
  if (b < c || b > d) {
    throw new TypeError(`Passing a number "${hc(b)}" from JS side to C/C++ side to an argument of type "${a}", which is outside the valid range [${c}, ${d}]!`);
  }
}, jc = a => {
  throw new S(a.g.s.m.name + " instance already deleted");
}, kc = !1, lc = () => {
}, mc = (a, b, c) => {
  if (b === c) {
    return a;
  }
  if (void 0 === c.C) {
    return null;
  }
  a = mc(a, b, c.C);
  return null === a ? null : c.ab(a);
}, nc = {}, oc = {}, pc = (a, b) => {
  if (void 0 === b) {
    throw new S("ptr should not be undefined");
  }
  for (; a.C;) {
    b = a.ha(b), a = a.C;
  }
  return oc[b];
}, qc = class extends Error {
  constructor(a) {
    super(a);
    this.name = "InternalError";
  }
}, sc = (a, b) => {
  if (!b.s || !b.l) {
    throw new qc("makeClassHandle requires ptr and ptrType");
  }
  if (!!b.G !== !!b.v) {
    throw new qc("Both smartPtrType and smartPtr must be specified");
  }
  b.count = {value:1};
  return rc(Object.create(a, {g:{value:b, writable:!0}}));
};
function tc(a) {
  function b() {
    return this.ka ? sc(this.m.Y, {s:this.pb, l:c, G:this, v:a}) : sc(this.m.Y, {s:this, l:a});
  }
  var c = this.eb(a);
  if (!c) {
    return this.Ha(a), null;
  }
  var d = pc(this.m, c);
  if (void 0 !== d) {
    if (0 === d.g.count.value) {
      return d.g.l = c, d.g.v = a, d.clone();
    }
    d = d.clone();
    this.Ha(a);
    return d;
  }
  d = this.m.cb(c);
  d = nc[d];
  if (!d) {
    return b.call(this);
  }
  d = this.ja ? d.Za : d.pointerType;
  var e = mc(c, this.m, d.m);
  return null === e ? b.call(this) : this.ka ? sc(d.m.Y, {s:d, l:e, G:this, v:a}) : sc(d.m.Y, {s:d, l:e});
}
var rc = a => {
  if (!globalThis.FinalizationRegistry) {
    return rc = b => b, a;
  }
  kc = new FinalizationRegistry(b => {
    console.warn(b.mb);
    b = b.g;
    --b.count.value;
    0 === b.count.value && (b.v ? b.G.U(b.v) : b.s.m.U(b.l));
  });
  rc = b => {
    var c = b.g;
    if (c.v) {
      var d = {g:c};
      c = Error(`Embind found a leaked C++ instance ${c.s.m.name} <${ja(c.l)}>.\n` + "We'll free it automatically in this case, but this functionality is not reliable across various environments.\nMake sure to invoke .delete() manually once you're done with the instance instead.\nOriginally allocated");
      "captureStackTrace" in Error && Error.captureStackTrace(c, tc);
      d.mb = c.stack.replace(/^Error: /, "");
      kc.register(b, d, b);
    }
    return b;
  };
  lc = b => {
    kc.unregister(b);
  };
  return rc(a);
}, uc = [];
function vc() {
}
var wc = (a, b) => Object.defineProperty(b, "name", {value:a}), xc = (a, b, c) => {
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
}, yc = (a, b) => {
  if (n.hasOwnProperty(a)) {
    throw new S(`Cannot register public name '${a}' twice`);
  }
  n[a] = b;
  n[a].$ = void 0;
}, zc = a => {
  p("string" === typeof a);
  a = a.replace(/[^a-zA-Z0-9_]/g, "$");
  var b = a.charCodeAt(0);
  return 48 <= b && 57 >= b ? `_${a}` : a;
};
function Ac(a, b, c, d, e, f, g, k) {
  this.name = a;
  this.constructor = b;
  this.Y = c;
  this.U = d;
  this.C = e;
  this.cb = f;
  this.ha = g;
  this.ab = k;
  this.qb = [];
}
var Bc = (a, b, c) => {
  for (; b !== c;) {
    if (!b.ha) {
      throw new S(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);
    }
    a = b.ha(a);
    b = b.C;
  }
  return a;
};
function Cc(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new S(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new S(`Cannot pass "${hc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  return Bc(b.g.l, b.g.s.m, this.m);
}
function Dc(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new S(`null is not a valid ${this.name}`);
    }
    if (this.ka) {
      var c = this.rb();
      null !== a && a.push(this.U, c);
      return c;
    }
    return 0;
  }
  if (!b || !b.g) {
    throw new S(`Cannot pass "${hc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (!this.ja && b.g.s.ja) {
    throw new S(`Cannot convert argument of type ${b.g.G ? b.g.G.name : b.g.s.name} to parameter type ${this.name}`);
  }
  c = Bc(b.g.l, b.g.s.m, this.m);
  if (this.ka) {
    if (void 0 === b.g.v) {
      throw new S("Passing raw pointer to smart pointer is illegal");
    }
    switch(this.ub) {
      case 0:
        if (b.g.G === this) {
          c = b.g.v;
        } else {
          throw new S(`Cannot convert argument of type ${b.g.G ? b.g.G.name : b.g.s.name} to parameter type ${this.name}`);
        }
        break;
      case 1:
        c = b.g.v;
        break;
      case 2:
        if (b.g.G === this) {
          c = b.g.v;
        } else {
          var d = b.clone();
          c = this.sb(c, Ec(() => d["delete"]()));
          null !== a && a.push(this.U, c);
        }
        break;
      default:
        throw new S("Unsupporting sharing policy");
    }
  }
  return c;
}
function Fc(a, b) {
  if (null === b) {
    if (this.ya) {
      throw new S(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new S(`Cannot pass "${hc(b)}" as a ${this.name}`);
  }
  if (!b.g.l) {
    throw new S(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (b.g.s.ja) {
    throw new S(`Cannot convert argument of type ${b.g.s.name} to parameter type ${this.name}`);
  }
  return Bc(b.g.l, b.g.s.m, this.m);
}
function Gc(a) {
  return this.B(v[a >> 2]);
}
function Hc(a, b, c, d, e, f, g, k, l, m, h) {
  this.name = a;
  this.m = b;
  this.ya = c;
  this.ja = d;
  this.ka = e;
  this.pb = f;
  this.ub = g;
  this.Ra = k;
  this.rb = l;
  this.sb = m;
  this.U = h;
  e || void 0 !== b.C ? this.H = Dc : (this.H = d ? Cc : Fc, this.I = null);
}
var Ic = (a, b) => {
  if (!n.hasOwnProperty(a)) {
    throw new qc("Replacing nonexistent public symbol");
  }
  n[a] = b;
  n[a].$ = void 0;
}, Jc = [], Lc = (a, b, c = !1) => {
  p(!c, "Async bindings are only supported with JSPI.");
  a = R(a);
  (c = Jc[b]) || (Jc[b] = c = Kc.get(b));
  p(Kc.get(b) == c, "JavaScript-side Wasm function table mirror is out of date!");
  if ("function" != typeof c) {
    throw new S(`unknown function pointer with signature ${a}: ${b}`);
  }
  return c;
};
class Mc extends Error {
}
var Pc = a => {
  a = Nc(a);
  var b = R(a);
  Oc(a);
  return b;
}, Qc = (a, b) => {
  function c(f) {
    e[f] || cc[f] || (dc[f] ? dc[f].forEach(c) : (d.push(f), e[f] = !0));
  }
  var d = [], e = {};
  b.forEach(c);
  throw new Mc(`${a}: ` + d.map(Pc).join([", "]));
}, Rc = (a, b, c) => {
  function d(k) {
    k = c(k);
    if (k.length !== a.length) {
      throw new qc("Mismatched type converter count");
    }
    for (var l = 0; l < a.length; ++l) {
      T(a[l], k[l]);
    }
  }
  a.forEach(k => dc[k] = b);
  var e = Array(b.length), f = [], g = 0;
  for (let [k, l] of b.entries()) {
    cc.hasOwnProperty(l) ? e[k] = cc[l] : (f.push(l), bc.hasOwnProperty(l) || (bc[l] = []), bc[l].push(() => {
      e[k] = cc[l];
      ++g;
      g === f.length && d(e);
    }));
  }
  0 === f.length && d(e);
}, Sc = (a, b) => {
  for (var c = [], d = 0; d < a; d++) {
    c.push(v[b + 4 * d >> 2]);
  }
  return c;
}, Tc = a => {
  for (; a.length;) {
    var b = a.pop();
    a.pop()(b);
  }
};
function Uc(a) {
  for (var b = 1; b < a.length; ++b) {
    if (null !== a[b] && void 0 === a[b].I) {
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
    throw new S("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  p(!f, "Async bindings are only supported with JSPI.");
  var k = null !== b[1] && null !== c, l = Uc(b);
  c = !b[0].Ja;
  var m = g - 2;
  var h = b.length - 2;
  for (var r = b.length - 1; 2 <= r && b[r].optional; --r) {
    h--;
  }
  r = b[0];
  var z = b[1];
  d = [a, ec, d, e, Tc, r.B.bind(r), z?.H.bind(z)];
  for (e = 2; e < g; ++e) {
    r = b[e], d.push(r.H.bind(r));
  }
  if (!l) {
    for (e = k ? 1 : 2; e < b.length; ++e) {
      null !== b[e].I && d.push(b[e].I);
    }
  }
  d.push(Vc, h, m);
  l = Uc(b);
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
  z = l ? "destructors" : "null";
  r = "humanName throwBindingError invoker fn runDestructors fromRetWire toClassParamWire".split(" ");
  k && (h += `var thisWired = toClassParamWire(${z}, this);\n`);
  for (g = 0; g < m; ++g) {
    var u = `toArg${g}Wire`;
    h += `var arg${g}Wired = ${u}(${z}, arg${g});\n`;
    r.push(u);
  }
  h += (c || f ? "var rv = " : "") + `invoker(${e});\n`;
  if (l) {
    h += "runDestructors(destructors);\n";
  } else {
    for (g = k ? 1 : 2; g < b.length; ++g) {
      f = 1 === g ? "thisWired" : "arg" + (g - 2) + "Wired", null !== b[g].I && (h += `${f}_dtor(${f});\n`, r.push(`${f}_dtor`));
    }
  }
  c && (h += "var ret = fromRetWire(rv);\nreturn ret;\n");
  h += "}\n";
  r.push("checkArgCount", "minArgs", "maxArgs");
  h = `if (arguments.length !== ${r.length}){ throw new Error(humanName + "Expected ${r.length} closure arguments " + arguments.length + " given."); }\n${h}`;
  b = (new Function(r, h))(...d);
  return wc(a, b);
}
var Xc = a => {
  a = a.trim();
  const b = a.indexOf("(");
  if (-1 === b) {
    return a;
  }
  p(a.endsWith(")"), "Parentheses for argument names should match.");
  return a.slice(0, b);
}, Yc = [], U = [0, 1, , 1, null, 1, !0, 1, !1, 1], Zc = a => {
  9 < a && 0 === --U[a + 1] && (p(void 0 !== U[a], "Decref for unallocated handle."), U[a] = void 0, Yc.push(a));
}, V = a => {
  if (!a) {
    throw new S(`Cannot use deleted val. handle = ${a}`);
  }
  p(2 === a || void 0 !== U[a] && 0 === a % 2, `invalid handle: ${a}`);
  return U[a];
}, Ec = a => {
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
      const b = Yc.pop() || U.length;
      U[b] = a;
      U[b + 1] = 1;
      return b;
  }
}, $c = {name:"emscripten::val", B:a => {
  var b = V(a);
  Zc(a);
  return b;
}, H:(a, b) => Ec(b), S:Gc, I:null}, ad = (a, b) => {
  switch(b) {
    case 4:
      return function(c) {
        return this.B(qa[c >> 2]);
      };
    case 8:
      return function(c) {
        return this.B(ra[c >> 3]);
      };
    default:
      throw new TypeError(`invalid float width (${b}): ${a}`);
  }
}, bd = (a, b, c) => {
  p("number" == typeof c, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return Ua(a, D, b, c);
}, cd = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, dd = (a, b, c) => {
  p(0 == a % 2, "Pointer passed to UTF16ToString must be aligned to two bytes!");
  a >>= 1;
  b = Qa(pa, a, b / 2, c);
  if (16 < b - a && cd) {
    return cd.decode(pa.subarray(a, b));
  }
  for (c = ""; a < b; ++a) {
    c += String.fromCharCode(pa[a]);
  }
  return c;
}, ed = (a, b, c) => {
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
    F[b >> 1] = a.charCodeAt(e), b += 2;
  }
  F[b >> 1] = 0;
  return b - d;
}, fd = a => 2 * a.length, gd = (a, b, c) => {
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
}, hd = (a, b, c) => {
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
    H[b >> 2] = f;
    b += 4;
    if (b + 4 > c) {
      break;
    }
  }
  H[b >> 2] = 0;
  return b - d;
}, jd = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    65535 < a.codePointAt(c) && c++, b += 4;
  }
  return b;
}, kd = [], ld = a => {
  var b = kd.length;
  kd.push(a);
  return b;
}, md = (a, b) => {
  for (var c = Array(a), d = 0; d < a; ++d) {
    var e = d, f = v[b + 4 * d >> 2], g = cc[f];
    if (void 0 === g) {
      throw a = `${`parameter ${d}`} has unknown type ${Pc(f)}`, new S(a);
    }
    c[e] = g;
  }
  return c;
}, nd = (a, b, c) => {
  var d = [];
  a = a(d, c);
  d.length && (v[b >> 2] = Ec(d));
  return a;
}, od = {}, pd = a => {
  var b = od[a];
  return void 0 === b ? R(a) : b;
}, qd = {}, sd = a => {
  if (fa) {
    q("user callback triggered after runtime exited or application aborted.  Ignoring.");
  } else {
    try {
      a();
    } catch (b) {
      if (a = b, !(a instanceof Ea || "unwind" == a)) {
        throw ha(), a instanceof WebAssembly.RuntimeError && 0 >= rd() && q("Stack overflow detected.  You can try increasing -sSTACK_SIZE (currently set to 65536)"), a;
      }
    }
  }
}, td = [], ud = [0, document, window], vd = a => {
  a = 2 < a ? O(a) : a;
  return ud[a] || document.querySelector(a);
}, W, wd = 1, xd = [], X = [], yd = [], Y = [], zd = [], Z = [], Ad = a => {
  for (var b = wd++, c = a.length; c < b; c++) {
    a[c] = null;
  }
  return b;
}, Bd = (a, b, c, d) => {
  for (var e = 0; e < a; e++) {
    var f = W[c](), g = f && Ad(d);
    f && (f.name = g, d[g] = f);
    H[b + 4 * e >> 2] = g;
  }
}, Dd = (a, b) => {
  a.F || (a.F = a.getContext, a.getContext = function(d, e) {
    e = a.F(d, e);
    return "webgl" == d == e instanceof WebGLRenderingContext ? e : null;
  });
  var c = a.getContext("webgl2", b);
  return c ? Cd(c, b) : 0;
}, Cd = (a, b) => {
  var c = Ad(Z);
  b = {handle:c, attributes:b, version:b.ca, X:a};
  a.canvas && (a.canvas.Wa = b);
  Z[c] = b;
  return c;
}, Ed, Fd = ["default", "low-power", "high-performance"], Gd = {}, Id = () => {
  if (!Hd) {
    var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.language || "C").replace("-", "_") + ".UTF-8", _:"./this.program"}, b;
    for (b in Gd) {
      void 0 === Gd[b] ? delete a[b] : a[b] = Gd[b];
    }
    var c = [];
    for (b in a) {
      c.push(`${b}=${a[b]}`);
    }
    Hd = c;
  }
  return Hd;
}, Hd;
function Jd(a, b, c, d, e, f = null) {
  b = {message:b, options:{type:c, imgUrl:d, requestId:e}};
  f && (b.options.originalError = f);
  "function" == typeof a ? a(b) : console.error("ERROR " + b.type + ": " + b.message, b.Nb);
}
var Kd = () => {
  var a = "EXT_color_buffer_float EXT_conservative_depth EXT_disjoint_timer_query_webgl2 EXT_texture_norm16 NV_shader_noperspective_interpolation WEBGL_clip_cull_distance EXT_clip_control EXT_color_buffer_half_float EXT_depth_clamp EXT_float_blend EXT_polygon_offset_clamp EXT_texture_compression_bptc EXT_texture_compression_rgtc EXT_texture_filter_anisotropic KHR_parallel_shader_compile OES_texture_float_linear WEBGL_blend_func_extended WEBGL_compressed_texture_astc WEBGL_compressed_texture_etc WEBGL_compressed_texture_etc1 WEBGL_compressed_texture_s3tc WEBGL_compressed_texture_s3tc_srgb WEBGL_debug_renderer_info WEBGL_debug_shaders WEBGL_lose_context WEBGL_multi_draw WEBGL_polygon_mode".split(" ");
  return (W.getSupportedExtensions() || []).filter(b => a.includes(b));
}, Ld = () => {
  var a = Kd();
  return a = a.concat(a.map(b => "GL_" + b));
}, Md = (a, b) => {
  if (b) {
    var c = void 0;
    switch(a) {
      case 36346:
        c = 1;
        break;
      case 36344:
        return;
      case 34814:
      case 36345:
        c = 0;
        break;
      case 34466:
        var d = W.getParameter(34467);
        c = d ? d.length : 0;
        break;
      case 33309:
        c = Ld().length;
        break;
      case 33307:
      case 33308:
        c = 33307 == a ? 3 : 0;
    }
    if (void 0 === c) {
      switch(d = W.getParameter(a), typeof d) {
        case "number":
          c = d;
          break;
        case "boolean":
          c = d ? 1 : 0;
          break;
        case "string":
          return;
        case "object":
          if (null === d) {
            switch(a) {
              case 34964:
              case 35725:
              case 34965:
              case 36006:
              case 36007:
              case 32873:
              case 34229:
              case 36662:
              case 36663:
              case 35053:
              case 35055:
              case 36010:
              case 35097:
              case 35869:
              case 32874:
              case 36389:
              case 35983:
              case 35368:
              case 34068:
                c = 0;
                break;
              default:
                return;
            }
          } else {
            if (d instanceof Float32Array || d instanceof Uint32Array || d instanceof Int32Array || d instanceof Array) {
              for (a = 0; a < d.length; ++a) {
                H[b + 4 * a >> 2] = d[a];
              }
              return;
            }
            c = d.name | 0;
          }
      }
    }
    H[b >> 2] = c;
  }
}, Nd = a => "]" == a.slice(-1) && a.lastIndexOf("["), Od = a => {
  a -= 5120;
  return 0 == a ? B : 1 == a ? D : 2 == a ? F : 4 == a ? H : 6 == a ? qa : 5 == a || 28922 == a || 28520 == a || 30779 == a || 30782 == a ? v : pa;
};
function Pd(a, b) {
  "function" == typeof a ? a(b) : console.error(b);
}
P = Array(4096);
Kb(L, "/");
Q("/tmp");
Q("/home");
Q("/home/web_user");
(function() {
  Q("/dev");
  Ya(259, {read:() => 0, write:(d, e, f, g) => g, L:() => 0});
  Nb("/dev/null", 259);
  Xa(1280, $a);
  Xa(1536, ab);
  Nb("/dev/tty", 1280);
  Nb("/dev/tty1", 1536);
  var a = new Uint8Array(1024), b = 0, c = () => {
    0 === b && (Na(a), b = a.byteLength);
    return a[--b];
  };
  Yb("/dev", "random", c);
  Yb("/dev", "urandom", c);
  Q("/dev/shm");
  Q("/dev/shm/tmp");
})();
(function() {
  Q("/proc");
  var a = Q("/proc/self");
  Q("/proc/self/fd");
  Kb({O() {
    var b = db(a, "fd", 16895, 73);
    b.i = {L:L.i.L};
    b.j = {ba(c, d) {
      c = +d;
      var e = Gb(c);
      c = {parent:null, O:{Oa:"fake"}, j:{fa:() => e.path}, id:c + 1};
      return c.parent = c;
    }, Ba() {
      return Array.from(tb.entries()).filter(([, c]) => c).map(([c]) => c.toString());
    }};
    return b;
  }}, "/proc/self/fd");
})();
(() => {
  let a = vc.prototype;
  Object.assign(a, {isAliasOf:function(c) {
    if (!(this instanceof vc && c instanceof vc)) {
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
    this.g.l || jc(this);
    if (this.g.ea) {
      return this.g.count.value += 1, this;
    }
    var c = rc, d = Object, e = d.create, f = Object.getPrototypeOf(this), g = this.g;
    c = c(e.call(d, f, {g:{value:{count:g.count, aa:g.aa, ea:g.ea, l:g.l, s:g.s, v:g.v, G:g.G}}}));
    c.g.count.value += 1;
    c.g.aa = !1;
    return c;
  }, ["delete"]() {
    this.g.l || jc(this);
    if (this.g.aa && !this.g.ea) {
      throw new S("Object already scheduled for deletion");
    }
    lc(this);
    var c = this.g;
    --c.count.value;
    0 === c.count.value && (c.v ? c.G.U(c.v) : c.s.m.U(c.l));
    this.g.ea || (this.g.v = void 0, this.g.l = void 0);
  }, isDeleted:function() {
    return !this.g.l;
  }, deleteLater:function() {
    this.g.l || jc(this);
    if (this.g.aa && !this.g.ea) {
      throw new S("Object already scheduled for deletion");
    }
    uc.push(this);
    this.g.aa = !0;
    return this;
  }});
  const b = Symbol.dispose;
  b && (a[b] = a["delete"]);
})();
Object.assign(Hc.prototype, {eb(a) {
  this.Ra && (a = this.Ra(a));
  return a;
}, Ha(a) {
  this.U?.(a);
}, S:Gc, B:tc});
p(10 === U.length);
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
n.UTF8ToString = O;
n.FS_preloadFile = async(a, b, c, d, e, f, g, k) => {
  var l = b ? Oa(Ka(a + "/" + b)) : a, m;
  a: {
    for (var h = m = `cp ${l}`;;) {
      if (!lb[m]) {
        break a;
      }
      m = h + Math.random();
    }
  }
  ob(m);
  try {
    h = c, "string" == typeof c && (h = await ib(c)), h = await qb(h, l), k?.(), f || Xb(a, b, h, d, e, g);
  } finally {
    nb(m);
  }
};
n.FS_unlink = (...a) => Pb(...a);
n.FS_createPath = (...a) => Vb(...a);
n.FS_createDevice = (...a) => Yb(...a);
n.FS_createDataFile = (...a) => Xb(...a);
n.FS_createLazyFile = (...a) => $b(...a);
"writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling convertI32PairToI53 convertI32PairToI53Checked convertU32PairToI53 stackAlloc getTempRet0 setTempRet0 zeroMemory withStackSave inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr runMainThreadEmAsm autoResumeAudioContext getDynCaller dynCall runtimeKeepalivePush runtimeKeepalivePop asmjsMangle HandleAllocator addOnPreRun addOnInit addOnPostCtor addOnPreMain addOnExit addOnPostRun STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS ccall cwrap convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction intArrayToString stringToAscii stringToNewUTF8 stringToUTF8OnStack writeArrayToMemory registerKeyEventCallback getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData registerBatteryEventCallback setCanvasElementSize getCanvasElementSize jsStackTrace getCallstack convertPCtoSourceLocation checkWasiClock wasiRightsToMuslOFlags wasiOFlagsToMuslOFlags safeSetTimeout setImmediateWrapped safeRequestAnimationFrame clearImmediateWrapped registerPostMainLoop registerPreMainLoop getPromise makePromise idsToPromises makePromiseCallback findMatchingCatch Browser_asyncPrepareDataCounter isLeapYear ydayFromDate arraySum addDays getSocketFromFD getSocketAddress FS_mkdirTree _setNetworkCallback webgl_enable_WEBGL_multi_draw webgl_enable_EXT_polygon_offset_clamp webgl_enable_EXT_clip_control webgl_enable_WEBGL_polygon_mode emscriptenWebGLGetUniform emscriptenWebGLGetVertexAttrib __glGetActiveAttribOrUniform writeGLArray registerWebGlEventCallback runAndAbortIfError emscriptenWebGLGetIndexed webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance ALLOC_NORMAL ALLOC_STACK allocate writeStringToMemory writeAsciiToMemory allocateUTF8 allocateUTF8OnStack demangle stackTrace getNativeTypeSize getFunctionArgsName createJsInvokerSignature PureVirtualError registerInheritedInstance unregisterInheritedInstance getInheritedInstanceCount getLiveInheritedInstances enumReadValueFromPointer setDelayFunction validateThis count_emval_handles".split(" ").forEach(function(a) {
  ma(a);
});
"run out err callMain abort wasmExports HEAPF32 HEAPF64 HEAP8 HEAPU8 HEAP16 HEAPU16 HEAP32 HEAPU32 HEAP64 HEAPU64 writeStackCookie checkStackCookie writeI53ToI64 readI53FromI64 readI53FromU64 INT53_MAX INT53_MIN bigintToI53Checked stackSave stackRestore createNamedFunction ptrToString exitJS getHeapMax growMemory ENV ERRNO_CODES strError DNS Protocols Sockets timers warnOnce readEmAsmArgsArray readEmAsmArgs runEmAsmFunction jstoi_q getExecutableName handleException keepRuntimeAlive callUserCallback maybeExit asyncLoad alignMemory mmapAlloc wasmTable wasmMemory getUniqueRunDependency noExitRuntime freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS UTF8Decoder UTF8ArrayToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 intArrayFromString AsciiToString UTF16Decoder UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 JSEvents specialHTMLTargets maybeCStringToJsString findEventTarget findCanvasEventTarget currentFullscreenStrategy restoreOldWindowedStyle UNWIND_CACHE ExitStatus getEnvStrings doReadv doWritev initRandomFill randomFill emSetImmediate emClearImmediate_deps emClearImmediate promiseMap uncaughtExceptionCount exceptionLast exceptionCaught ExceptionInfo Browser requestFullscreen requestFullScreen setCanvasSize getUserMedia createContext getPreloadedImageData__data wget MONTH_DAYS_REGULAR MONTH_DAYS_LEAP MONTH_DAYS_REGULAR_CUMULATIVE MONTH_DAYS_LEAP_CUMULATIVE SYSCALLS preloadPlugins FS_createPreloadedFile FS_modeStringToFlags FS_getMode FS_stdin_getChar_buffer FS_stdin_getChar FS_readFile FS FS_root FS_mounts FS_devices FS_streams FS_nextInode FS_nameTable FS_currentPath FS_initialized FS_ignorePermissions FS_filesystems FS_syncFSRequests FS_lookupPath FS_getPath FS_hashName FS_hashAddNode FS_hashRemoveNode FS_lookupNode FS_createNode FS_destroyNode FS_isRoot FS_isMountpoint FS_isFile FS_isDir FS_isLink FS_isChrdev FS_isBlkdev FS_isFIFO FS_isSocket FS_flagsToPermissionString FS_nodePermissions FS_mayLookup FS_mayCreate FS_mayDelete FS_mayOpen FS_checkOpExists FS_nextfd FS_getStreamChecked FS_getStream FS_createStream FS_closeStream FS_dupStream FS_doSetAttr FS_chrdev_stream_ops FS_major FS_minor FS_makedev FS_registerDevice FS_getDevice FS_getMounts FS_syncfs FS_mount FS_unmount FS_lookup FS_mknod FS_statfs FS_statfsStream FS_statfsNode FS_create FS_mkdir FS_mkdev FS_symlink FS_rename FS_rmdir FS_readdir FS_readlink FS_stat FS_fstat FS_lstat FS_doChmod FS_chmod FS_lchmod FS_fchmod FS_doChown FS_chown FS_lchown FS_fchown FS_doTruncate FS_truncate FS_ftruncate FS_utime FS_open FS_close FS_isClosed FS_llseek FS_read FS_write FS_mmap FS_msync FS_ioctl FS_writeFile FS_cwd FS_chdir FS_createDefaultDirectories FS_createDefaultDevices FS_createSpecialDirectories FS_createStandardStreams FS_staticInit FS_init FS_quit FS_findObject FS_analyzePath FS_createFile FS_forceLoadFile FS_absolutePath FS_createFolder FS_createLink FS_joinPath FS_mmapAlloc FS_standardizePath MEMFS TTY PIPEFS SOCKFS tempFixedLengthArray miniTempWebGLFloatBuffers miniTempWebGLIntBuffers heapObjectForWebGLType toTypedArrayIndex GL emscriptenWebGLGet computeUnpackAlignedImageSize colorChannelsInGlTextureFormat emscriptenWebGLGetTexPixelData webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos AL GLUT EGL GLEW IDBStore SDL SDL_gfx print printErr jstoi_s InternalError BindingError throwInternalError throwBindingError registeredTypes awaitingDependencies typeDependencies tupleRegistrations structRegistrations sharedRegisterType whenDependentTypesAreResolved getTypeName getFunctionName heap32VectorToArray requireRegisteredType usesDestructorStack checkArgCount getRequiredArgCount createJsInvoker UnboundTypeError EmValType EmValOptionalType throwUnboundTypeError ensureOverloadTable exposePublicSymbol replacePublicSymbol embindRepr registeredInstances getBasestPointer getInheritedInstance registeredPointers registerType integerReadValueFromPointer floatReadValueFromPointer assertIntegerRange readPointer runDestructors craftInvokerFunction embind__requireFunction genericPointerToWireType constNoSmartPtrRawPointerToWireType nonConstNoSmartPtrRawPointerToWireType init_RegisteredPointer RegisteredPointer RegisteredPointer_fromWireType runDestructor releaseClassHandle finalizationRegistry detachFinalizer_deps detachFinalizer attachFinalizer makeClassHandle init_ClassHandle ClassHandle throwInstanceAlreadyDeleted deletionQueue flushPendingDeletes delayFunction RegisteredClass shallowCopyInternalPointer downcastPointer upcastPointer char_0 char_9 makeLegalFunctionName emval_freelist emval_handles emval_symbols getStringOrSymbol Emval emval_returnValue emval_lookupTypes emval_methodCallers emval_addMethodCaller handleError equirectangularReportError getValidTextures".split(" ").forEach(ma);
var Qd = {100416:() => {
  throw "A böngésződ nem támogatja a WebGL-t!";
}, 100467:a => {
  throw "Sikertelen shader fordítás: " + O(a);
}, 100531:a => {
  throw "Sikertelen shader összekapcsolás: " + O(a);
}, 100601:(a, b) => {
  if (b = document.getElementById(O(b))) {
    b.innerText = a;
  }
}, 100691:a => {
  throw "Sikertelen fájl beolvasás: " + O(a);
}}, Nc = x("___getTypeName"), Rd = x("_malloc"), Oc = x("_free"), ia = x("_emscripten_stack_get_end"), Sd = x("__emscripten_timeout"), xb = x("_strerror"), Td = x("_emscripten_stack_init"), rd = x("_emscripten_stack_get_current"), wa = x("wasmMemory"), Kc = x("wasmTable"), Ud = {__cxa_throw:(a, b, c) => {
  a = new Ga(a);
  v[a.l + 16 >> 2] = 0;
  v[a.l + 4 >> 2] = b;
  v[a.l + 8 >> 2] = c;
  Ha++;
  p(!1, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
}, __syscall_fcntl64:function(a, b, c) {
  Ia = c;
  try {
    var d = Gb(a);
    switch(b) {
      case 0:
        var e = J();
        if (0 > e) {
          break;
        }
        for (; tb[e];) {
          e++;
        }
        return Ib(d, e).A;
      case 1:
      case 2:
        return 0;
      case 3:
        return d.flags;
      case 4:
        return e = J(), d.flags |= e, 0;
      case 12:
        return e = J(), F[e + 0 >> 1] = 2, 0;
      case 13:
      case 14:
        return 0;
    }
    return -28;
  } catch (f) {
    if ("undefined" == typeof ac || "ErrnoError" !== f.name) {
      throw f;
    }
    return -f.K;
  }
}, __syscall_ioctl:function(a, b, c) {
  Ia = c;
  try {
    var d = Gb(a);
    switch(b) {
      case 21509:
        return d.o ? 0 : -59;
      case 21505:
        if (!d.o) {
          return -59;
        }
        if (d.o.P.hb) {
          b = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          var e = J();
          H[e >> 2] = 25856;
          H[e + 4 >> 2] = 5;
          H[e + 8 >> 2] = 191;
          H[e + 12 >> 2] = 35387;
          for (var f = 0; 32 > f; f++) {
            B[e + f + 17] = b[f] || 0;
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
          for (e = J(), b = [], f = 0; 32 > f; f++) {
            b.push(B[e + f + 17]);
          }
        }
        return 0;
      case 21519:
        if (!d.o) {
          return -59;
        }
        e = J();
        return H[e >> 2] = 0;
      case 21520:
        return d.o ? -28 : -59;
      case 21537:
      case 21531:
        e = J();
        if (!d.i.gb) {
          throw new K(59);
        }
        return d.i.gb(d, b, e);
      case 21523:
        if (!d.o) {
          return -59;
        }
        d.o.P.jb && (f = [24, 80], e = J(), F[e >> 1] = f[0], F[e + 2 >> 1] = f[1]);
        return 0;
      case 21524:
        return d.o ? 0 : -59;
      case 21515:
        return d.o ? 0 : -59;
      default:
        return -28;
    }
  } catch (g) {
    if ("undefined" == typeof ac || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.K;
  }
}, __syscall_openat:function(a, b, c, d) {
  Ia = d;
  try {
    b = O(b);
    var e = b;
    if ("/" === e.charAt(0)) {
      b = e;
    } else {
      var f = -100 === a ? "/" : Gb(a).path;
      if (0 == e.length) {
        throw new K(44);
      }
      b = f + "/" + e;
    }
    var g = d ? J() : 0;
    return Rb(b, c, g).A;
  } catch (k) {
    if ("undefined" == typeof ac || "ErrnoError" !== k.name) {
      throw k;
    }
    return -k.K;
  }
}, _abort_js:() => t("native code called abort()"), _embind_register_bigint:(a, b, c, d, e) => {
  b = R(b);
  const f = 0n === d;
  let g = k => k;
  if (f) {
    const k = 8 * c;
    g = l => BigInt.asUintN(k, l);
    e = g(e);
  }
  T(a, {name:b, B:g, H:(k, l) => {
    if ("number" == typeof l) {
      l = BigInt(l);
    } else if ("bigint" != typeof l) {
      throw new TypeError(`Cannot convert "${hc(l)}" to ${this.name}`);
    }
    ic(b, l, d, e);
    return l;
  }, S:gc(b, c, !f), I:null});
}, _embind_register_bool:(a, b, c, d) => {
  b = R(b);
  T(a, {name:b, B:function(e) {
    return !!e;
  }, H:function(e, f) {
    return f ? c : d;
  }, S:function(e) {
    return this.B(D[e]);
  }, I:null});
}, _embind_register_class:(a, b, c, d, e, f, g, k, l, m, h, r, z) => {
  h = R(h);
  f = Lc(e, f);
  k &&= Lc(g, k);
  m &&= Lc(l, m);
  z = Lc(r, z);
  var u = zc(h);
  yc(u, function() {
    Qc(`Cannot construct ${h} due to unbound types`, [d]);
  });
  Rc([a, b, c], d ? [d] : [], w => {
    w = w[0];
    if (d) {
      var C = w.m;
      var A = C.Y;
    } else {
      A = vc.prototype;
    }
    w = wc(h, function(...G) {
      if (Object.getPrototypeOf(this) !== I) {
        throw new S(`Use 'new' to construct ${h}`);
      }
      if (void 0 === E.W) {
        throw new S(`${h} has no accessible constructor`);
      }
      var ya = E.W[G.length];
      if (void 0 === ya) {
        throw new S(`Tried to invoke ctor of ${h} with invalid number of parameters (${G.length}) - expected (${Object.keys(E.W).toString()}) parameters instead!`);
      }
      return ya.apply(this, G);
    });
    var I = Object.create(A, {constructor:{value:w}});
    w.prototype = I;
    var E = new Ac(h, w, I, z, C, f, k, m);
    if (E.C) {
      var M;
      (M = E.C).Ea ?? (M.Ea = []);
      E.C.Ea.push(E);
    }
    C = new Hc(h, E, !0, !1, !1);
    M = new Hc(h + "*", E, !1, !1, !1);
    A = new Hc(h + " const*", E, !1, !0, !1);
    nc[a] = {pointerType:M, Za:A};
    Ic(u, w);
    return [C, M, A];
  });
}, _embind_register_class_constructor:(a, b, c, d, e, f) => {
  p(0 < b);
  var g = Sc(b, c);
  e = Lc(d, e);
  Rc([], [a], k => {
    k = k[0];
    var l = `constructor ${k.name}`;
    void 0 === k.m.W && (k.m.W = []);
    if (void 0 !== k.m.W[b - 1]) {
      throw new S(`Cannot register multiple constructors with identical number of parameters (${b - 1}) for class '${k.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    k.m.W[b - 1] = () => {
      Qc(`Cannot construct ${k.name} due to unbound types`, g);
    };
    Rc([], g, m => {
      m.splice(1, 0, null);
      k.m.W[b - 1] = Wc(l, m, null, e, f);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:(a, b, c, d, e, f, g, k, l) => {
  var m = Sc(c, d);
  b = R(b);
  b = Xc(b);
  f = Lc(e, f, l);
  Rc([], [a], h => {
    function r() {
      Qc(`Cannot call ${z} due to unbound types`, m);
    }
    h = h[0];
    var z = `${h.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    k && h.m.qb.push(b);
    var u = h.m.Y, w = u[b];
    void 0 === w || void 0 === w.R && w.className !== h.name && w.$ === c - 2 ? (r.$ = c - 2, r.className = h.name, u[b] = r) : (xc(u, b, z), u[b].R[c - 2] = r);
    Rc([], m, C => {
      C = Wc(z, C, h, f, g, l);
      void 0 === u[b].R ? (C.$ = c - 2, u[b] = C) : u[b].R[c - 2] = C;
      return [];
    });
    return [];
  });
}, _embind_register_emval:a => T(a, $c), _embind_register_float:(a, b, c) => {
  b = R(b);
  T(a, {name:b, B:d => d, H:(d, e) => {
    if ("number" != typeof e && "boolean" != typeof e) {
      throw new TypeError(`Cannot convert ${hc(e)} to ${this.name}`);
    }
    return e;
  }, S:ad(b, c), I:null});
}, _embind_register_integer:(a, b, c, d, e) => {
  b = R(b);
  let f = k => k;
  if (0 === d) {
    var g = 32 - 8 * c;
    f = k => k << g >>> g;
    e = f(e);
  }
  T(a, {name:b, B:f, H:(k, l) => {
    if ("number" != typeof l && "boolean" != typeof l) {
      throw new TypeError(`Cannot convert "${hc(l)}" to ${b}`);
    }
    ic(b, l, d, e);
    return l;
  }, S:gc(b, c, 0 !== d), I:null});
}, _embind_register_memory_view:(a, b, c) => {
  function d(f) {
    return new e(B.buffer, v[f + 4 >> 2], v[f >> 2]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][b];
  c = R(c);
  T(a, {name:c, B:d, S:d}, {fb:!0});
}, _embind_register_std_string:(a, b) => {
  b = R(b);
  T(a, {name:b, B(c) {
    var d = O(c + 4, v[c >> 2], !0);
    Oc(c);
    return d;
  }, H(c, d) {
    d instanceof ArrayBuffer && (d = new Uint8Array(d));
    var e = "string" == typeof d;
    if (!(e || ArrayBuffer.isView(d) && 1 == d.BYTES_PER_ELEMENT)) {
      throw new S("Cannot pass non-string to std::string");
    }
    var f = e ? Ta(d) : d.length;
    var g = Rd(4 + f + 1), k = g + 4;
    v[g >> 2] = f;
    e ? bd(d, k, f + 1) : D.set(d, k);
    null !== c && c.push(Oc, g);
    return g;
  }, S:Gc, I(c) {
    Oc(c);
  }});
}, _embind_register_std_wstring:(a, b, c) => {
  c = R(c);
  if (2 === b) {
    var d = dd;
    var e = ed;
    var f = fd;
  } else {
    p(4 === b, "only 2-byte and 4-byte strings are currently supported"), d = gd, e = hd, f = jd;
  }
  T(a, {name:c, B:g => {
    var k = d(g + 4, v[g >> 2] * b, !0);
    Oc(g);
    return k;
  }, H:(g, k) => {
    if ("string" != typeof k) {
      throw new S(`Cannot pass non-string to C++ string type ${c}`);
    }
    var l = f(k), m = Rd(4 + l + b);
    v[m >> 2] = l / b;
    e(k, m + 4, l + b);
    null !== g && g.push(Oc, m);
    return m;
  }, S:Gc, I(g) {
    Oc(g);
  }});
}, _embind_register_void:(a, b) => {
  b = R(b);
  T(a, {Ja:!0, name:b, B:() => {
  }, H:() => {
  }});
}, _emscripten_fs_load_embedded_files:a => {
  do {
    var b = v[a >> 2];
    a += 4;
    var c = v[a >> 2];
    a += 4;
    var d = v[a >> 2];
    a += 4;
    b = O(b);
    Vb("/", La(b));
    Xb(b, null, B.subarray(d, d + c), !0, !0, !0);
  } while (v[a >> 2]);
}, _emscripten_runtime_keepalive_clear:() => {
}, _emval_create_invoker:(a, b, c) => {
  var [d, ...e] = md(a, b);
  b = d.H.bind(d);
  var f = e.map(l => l.S.bind(l));
  a--;
  var g = {toValue:V};
  a = f.map((l, m) => {
    var h = `argFromPtr${m}`;
    g[h] = l;
    return `${h}(args${m ? "+" + 8 * m : ""})`;
  });
  switch(c) {
    case 0:
      var k = "toValue(handle)";
      break;
    case 2:
      k = "new (toValue(handle))";
      break;
    case 3:
      k = "";
      break;
    case 1:
      g.getStringOrSymbol = pd, k = "toValue(handle)[getStringOrSymbol(methodName)]";
  }
  k += `(${a})`;
  d.Ja || (g.toReturnWire = b, g.emval_returnValue = nd, k = `return emval_returnValue(toReturnWire, destructorsRef, ${k})`);
  k = `return function (handle, methodName, destructorsRef, args) {
  ${k}
  }`;
  c = (new Function(Object.keys(g), k))(...Object.values(g));
  k = `methodCaller<(${e.map(l => l.name)}) => ${d.name}>`;
  return ld(wc(k, c));
}, _emval_decref:Zc, _emval_get_global:a => {
  if (!a) {
    return Ec(globalThis);
  }
  a = pd(a);
  return Ec(globalThis[a]);
}, _emval_incref:a => {
  9 < a && (U[a + 1] += 1);
}, _emval_invoke:(a, b, c, d, e) => kd[a](b, c, d, e), _emval_run_destructors:a => {
  var b = V(a);
  Tc(b);
  Zc(a);
}, _emval_set_property:(a, b, c) => {
  a = V(a);
  b = V(b);
  c = V(c);
  a[b] = c;
}, _setitimer_js:(a, b) => {
  qd[a] && (clearTimeout(qd[a].id), delete qd[a]);
  if (!b) {
    return 0;
  }
  var c = setTimeout(() => {
    p(a in qd);
    delete qd[a];
    sd(() => Sd(a, performance.now()));
  }, b);
  qd[a] = {id:c, Rb:b};
  return 0;
}, _tzset_js:(a, b, c, d) => {
  var e = (new Date()).getFullYear(), f = (new Date(e, 0, 1)).getTimezoneOffset();
  e = (new Date(e, 6, 1)).getTimezoneOffset();
  v[a >> 2] = 60 * Math.max(f, e);
  H[b >> 2] = Number(f != e);
  b = g => {
    var k = Math.abs(g);
    return `UTC${0 <= g ? "-" : "+"}${String(Math.floor(k / 60)).padStart(2, "0")}${String(k % 60).padStart(2, "0")}`;
  };
  a = b(f);
  b = b(e);
  p(a);
  p(b);
  p(16 >= Ta(a), `timezone name truncated to fit in TZNAME_MAX (${a})`);
  p(16 >= Ta(b), `timezone name truncated to fit in TZNAME_MAX (${b})`);
  e < f ? (bd(a, c, 17), bd(b, d, 17)) : (bd(a, d, 17), bd(b, c, 17));
}, emscripten_asm_const_int:(a, b, c) => {
  p(Array.isArray(td));
  p(0 == c % 16);
  td.length = 0;
  for (var d; d = D[b++];) {
    var e = String.fromCharCode(d), f = ["d", "f", "i", "p"];
    f.push("j");
    p(f.includes(e), `Invalid character ${d}("${e}") in readEmAsmArgs! Use only [${f}], and do not specify "v" for void return argument.`);
    e = 105 != d;
    e &= 112 != d;
    c += e && c % 8 ? 4 : 0;
    td.push(112 == d ? v[c >> 2] : 106 == d ? sa[c >> 3] : 105 == d ? H[c >> 2] : ra[c >> 3]);
    c += e ? 8 : 4;
  }
  p(Qd.hasOwnProperty(a), `No EM_ASM constant found at address ${a}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return Qd[a](...td);
}, emscripten_console_error:a => {
  p("number" == typeof a);
  console.error(O(a));
}, emscripten_get_now:() => performance.now(), emscripten_resize_heap:a => {
  var b = D.length;
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
      } catch (k) {
        q(`growMemory: Attempted to grow heap from ${d} bytes to ${f} bytes, but got error: ${k}`);
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
  a = vd(a);
  if (!a) {
    return -4;
  }
  a.width = b;
  a.height = c;
  return 0;
}, emscripten_webgl_create_context:(a, b) => {
  p(b);
  var c = b >> 2;
  b = {alpha:!!B[b + 0], depth:!!B[b + 1], stencil:!!B[b + 2], antialias:!!B[b + 3], premultipliedAlpha:!!B[b + 4], preserveDrawingBuffer:!!B[b + 5], powerPreference:Fd[H[c + 2]], failIfMajorPerformanceCaveat:!!B[b + 12], ca:H[c + 4], Kb:H[c + 5], Gb:B[b + 24], bb:B[b + 25], Ob:H[c + 7], Qb:B[b + 32]};
  1 !== b.ca && 2 !== b.ca && q(`Invalid WebGL version requested: ${b.ca}`);
  2 !== b.ca && q("WebGL 1 requested but only WebGL 2 is supported (MIN_WEBGL_VERSION is 2)");
  a = vd(a);
  return !a || b.bb ? 0 : Dd(a, b);
}, emscripten_webgl_destroy_context:a => {
  Ed == a && (Ed = 0);
  Ed === Z[a] && (Ed = null);
  "object" == typeof JSEvents && JSEvents.Pb(Z[a].X.canvas);
  Z[a]?.X.canvas && (Z[a].X.canvas.Wa = void 0);
  Z[a] = null;
}, emscripten_webgl_get_current_context:() => Ed ? Ed.handle : 0, emscripten_webgl_make_context_current:a => {
  Ed = Z[a];
  n.ctx = W = Ed?.X;
  return !a || W ? 0 : -5;
}, environ_get:(a, b) => {
  var c = 0, d = 0, e;
  for (e of Id()) {
    var f = b + c;
    v[a + d >> 2] = f;
    c += bd(e, f, Infinity) + 1;
    d += 4;
  }
  return 0;
}, environ_sizes_get:(a, b) => {
  var c = Id();
  v[a >> 2] = c.length;
  a = 0;
  for (var d of c) {
    a += Ta(d) + 1;
  }
  v[b >> 2] = a;
  return 0;
}, equirectangularFromURL:function(a, b, c, d, e, f, g, k) {
  let l = O(a);
  b = Z[b];
  let m = V(f);
  if (b) {
    let h = b.X, r = V(e), z = V(d);
    fetch(l).then(function(u) {
      if (u.ok) {
        let w = u.headers.get("content-type");
        w && !w.startsWith("image/") && Jd(m, "Invalid content-type:\t" + w, "INVALID_INPUT", a, g);
        return u.blob();
      }
      Jd(m, "Image failed to load:\t" + u.status, "NETWORK", a, g);
    }).then(function(u) {
      return createImageBitmap(u);
    }).then(async function(u) {
      let w = c * c, C = [];
      for (var A = 0; A < w && yd[z[A]];) {
        C.push(yd[z[A]]), A++;
      }
      A = H[k / 4];
      if (C.length == w && g == A) {
        A = u.width / c;
        let E = u.height / c;
        var I = h.getParameter(h.MAX_TEXTURE_SIZE);
        if (A <= I && E <= I) {
          try {
            I = [];
            for (let G = 0; G < c; G++) {
              for (let ya = 0; ya < c; ya++) {
                I.push(createImageBitmap(u, G * A, ya * A, A, E));
              }
            }
            let M = await Promise.all(I);
            u.close();
            for (A = 0; A < M.length; A++) {
              h.bindTexture(h.TEXTURE_2D, C[A]);
              h.texImage2D(h.TEXTURE_2D, 0, h.RGBA, h.RGBA, h.UNSIGNED_BYTE, M[A]);
              1 == w && h.generateMipmap(h.TEXTURE_2D);
              let G = 1 == w ? h.LINEAR : h.NEAREST;
              h.texParameteri(h.TEXTURE_2D, h.TEXTURE_MIN_FILTER, 1 == w ? h.LINEAR_MIPMAP_LINEAR : h.LINEAR);
              h.texParameteri(h.TEXTURE_2D, h.TEXTURE_MAG_FILTER, G);
              h.texParameteri(h.TEXTURE_2D, h.TEXTURE_WRAP_S, h.CLAMP_TO_EDGE);
              h.texParameteri(h.TEXTURE_2D, h.TEXTURE_WRAP_T, h.CLAMP_TO_EDGE);
              M[A].close();
            }
            h.bindTexture(h.TEXTURE_2D, null);
          } catch (M) {
            u.close(), Jd(m, "Failed to upload texture to GPU", "WEBGL", l, g, M);
          }
          u.close();
          "function" == typeof r && r();
        } else {
          u.close(), Jd(m, "Texture doesn't fit in MAX_TEXTURE_SIZE (" + I + ")", "WEBGL", l, g);
        }
      } else {
        u.close(), C.length != w ? Jd(m, "Textures no longer exist", "WEBGL", l, g) : Jd(m, "New image was requested. Aborting old request", "REQUEST_CANCELLED", l, g);
      }
    }).catch(function() {
      Jd(m, "Texture failed to load (Fetch/decoding error)", "IMAGE_DECODE", l, g);
    });
  } else {
    Jd(m, "Invalid WebGL context", "WEBGL", l, g);
  }
}, fd_close:function(a) {
  try {
    var b = Gb(a);
    Sb(b);
    return 0;
  } catch (c) {
    if ("undefined" == typeof ac || "ErrnoError" !== c.name) {
      throw c;
    }
    return c.K;
  }
}, fd_read:function(a, b, c, d) {
  try {
    a: {
      var e = Gb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var k = v[a >> 2], l = v[a + 4 >> 2];
        a += 8;
        var m = e, h = k, r = l, z = f, u = B;
        p(0 <= h);
        if (0 > r || 0 > z) {
          throw new K(28);
        }
        if (null === m.A) {
          throw new K(8);
        }
        if (1 === (m.flags & 2097155)) {
          throw new K(8);
        }
        if (N(m.node.mode)) {
          throw new K(31);
        }
        if (!m.i.read) {
          throw new K(28);
        }
        var w = "undefined" != typeof z;
        if (!w) {
          z = m.position;
        } else if (!m.seekable) {
          throw new K(70);
        }
        var C = m.i.read(m, u, h, r, z);
        w || (m.position += C);
        var A = C;
        if (0 > A) {
          var I = -1;
          break a;
        }
        b += A;
        if (A < l) {
          break;
        }
        "undefined" != typeof f && (f += A);
      }
      I = b;
    }
    v[d >> 2] = I;
    return 0;
  } catch (E) {
    if ("undefined" == typeof ac || "ErrnoError" !== E.name) {
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
    var e = Gb(a);
    Tb(e, b, c);
    sa[d >> 3] = BigInt(e.position);
    e.va && 0 === b && 0 === c && (e.va = null);
    return 0;
  } catch (f) {
    if ("undefined" == typeof ac || "ErrnoError" !== f.name) {
      throw f;
    }
    return f.K;
  }
}, fd_write:function(a, b, c, d) {
  try {
    a: {
      var e = Gb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var k = v[a >> 2], l = v[a + 4 >> 2];
        a += 8;
        var m = Ub(e, B, k, l, f);
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
    v[d >> 2] = h;
    return 0;
  } catch (r) {
    if ("undefined" == typeof ac || "ErrnoError" !== r.name) {
      throw r;
    }
    return r.K;
  }
}, glActiveTexture:a => W.activeTexture(a), glAttachShader:(a, b) => {
  W.attachShader(X[a], Y[b]);
}, glBindBuffer:(a, b) => {
  35051 == a ? W.Ga = b : 35052 == a && (W.sa = b);
  W.bindBuffer(a, xd[b]);
}, glBindBufferRange:(a, b, c, d, e) => {
  W.bindBufferRange(a, b, xd[c], d, e);
}, glBindTexture:(a, b) => {
  W.bindTexture(a, yd[b]);
}, glBindVertexArray:a => {
  W.bindVertexArray(zd[a]);
}, glBufferData:(a, b, c, d) => {
  c && b ? W.bufferData(a, D, d, c, b) : W.bufferData(a, b, d);
}, glBufferSubData:(a, b, c, d) => {
  c && W.bufferSubData(a, b, D, d, c);
}, glClear:a => W.clear(a), glClearColor:(a, b, c, d) => W.clearColor(a, b, c, d), glCompileShader:a => {
  W.compileShader(Y[a]);
}, glCreateProgram:() => {
  var a = Ad(X), b = W.createProgram();
  b.name = a;
  b.na = b.la = b.ma = 0;
  b.Da = 1;
  X[a] = b;
  return a;
}, glCreateShader:a => {
  var b = Ad(Y);
  Y[b] = W.createShader(a);
  return b;
}, glDeleteBuffers:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = H[b + 4 * c >> 2], e = xd[d];
    e && (W.deleteBuffer(e), e.name = 0, xd[d] = null, d == W.Ga && (W.Ga = 0), d == W.sa && (W.sa = 0));
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
    var d = H[b + 4 * c >> 2], e = yd[d];
    e && (W.deleteTexture(e), e.name = 0, yd[d] = null);
  }
}, glDeleteVertexArrays:(a, b) => {
  for (var c = 0; c < a; c++) {
    var d = H[b + 4 * c >> 2];
    W.deleteVertexArray(zd[d]);
    zd[d] = null;
  }
}, glDrawElements:(a, b, c, d) => {
  W.drawElements(a, b, c, d);
}, glEnable:a => W.enable(a), glEnableVertexAttribArray:a => {
  W.enableVertexAttribArray(a);
}, glGenBuffers:(a, b) => {
  Bd(a, b, "createBuffer", xd);
}, glGenTextures:(a, b) => {
  Bd(a, b, "createTexture", yd);
}, glGenVertexArrays:(a, b) => {
  Bd(a, b, "createVertexArray", zd);
}, glGenerateMipmap:a => W.generateMipmap(a), glGetIntegerv:(a, b) => Md(a, b), glGetProgramInfoLog:(a, b, c, d) => {
  a = W.getProgramInfoLog(X[a]);
  b = 0 < b && d ? bd(a, d, b) : 0;
  c && (H[c >> 2] = b);
}, glGetProgramiv:(a, b, c) => {
  if (c && !(a >= wd)) {
    if (a = X[a], 35716 == b) {
      H[c >> 2] = W.getProgramInfoLog(a).length + 1;
    } else if (35719 == b) {
      if (!a.na) {
        var d = W.getProgramParameter(a, 35718);
        for (b = 0; b < d; ++b) {
          a.na = Math.max(a.na, W.getActiveUniform(a, b).name.length + 1);
        }
      }
      H[c >> 2] = a.na;
    } else if (35722 == b) {
      if (!a.la) {
        for (d = W.getProgramParameter(a, 35721), b = 0; b < d; ++b) {
          a.la = Math.max(a.la, W.getActiveAttrib(a, b).name.length + 1);
        }
      }
      H[c >> 2] = a.la;
    } else if (35381 == b) {
      if (!a.ma) {
        for (d = W.getProgramParameter(a, 35382), b = 0; b < d; ++b) {
          a.ma = Math.max(a.ma, W.getActiveUniformBlockName(a, b).length + 1);
        }
      }
      H[c >> 2] = a.ma;
    } else {
      H[c >> 2] = W.getProgramParameter(a, b);
    }
  }
}, glGetShaderInfoLog:(a, b, c, d) => {
  a = W.getShaderInfoLog(Y[a]);
  b = 0 < b && d ? bd(a, d, b) : 0;
  c && (H[c >> 2] = b);
}, glGetShaderiv:(a, b, c) => {
  c && (35716 == b ? (a = W.getShaderInfoLog(Y[a]), H[c >> 2] = a ? a.length + 1 : 0) : 35720 == b ? (a = W.getShaderSource(Y[a]), H[c >> 2] = a ? a.length + 1 : 0) : H[c >> 2] = W.getShaderParameter(Y[a], b));
}, glGetUniformBlockIndex:(a, b) => W.getUniformBlockIndex(X[a], O(b)), glGetUniformLocation:(a, b) => {
  b = O(b);
  if (a = X[a]) {
    var c = a, d = c.ga, e = c.Va, f;
    if (!d) {
      c.ga = d = {};
      c.Ua = {};
      var g = W.getProgramParameter(c, 35718);
      for (f = 0; f < g; ++f) {
        var k = W.getActiveUniform(c, f);
        var l = k.name;
        k = k.size;
        var m = Nd(l);
        m = 0 < m ? l.slice(0, m) : l;
        var h = c.Da;
        c.Da += k;
        e[m] = [k, h];
        for (l = 0; l < k; ++l) {
          d[h] = l, c.Ua[h++] = m;
        }
      }
    }
    c = a.ga;
    d = 0;
    e = b;
    f = Nd(b);
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
    e += O(v[c + 4 * f >> 2], d ? v[d + 4 * f >> 2] : void 0);
  }
  W.shaderSource(Y[a], e);
}, glTexImage2D:(a, b, c, d, e, f, g, k, l) => {
  if (W.sa) {
    W.texImage2D(a, b, c, d, e, f, g, k, l);
  } else {
    if (l) {
      var m = Od(k);
      l >>>= 31 - Math.clz32(m.BYTES_PER_ELEMENT);
      W.texImage2D(a, b, c, d, e, f, g, k, m, l);
    } else {
      if (l) {
        m = Od(k);
        var h = e * (d * ({5:3, 6:4, 8:2, 29502:3, 29504:4, 26917:2, 26918:2, 29846:3, 29847:4}[g - 6402] || 1) * m.BYTES_PER_ELEMENT + 4 - 1 & -4);
        l = m.subarray(l >>> 31 - Math.clz32(m.BYTES_PER_ELEMENT), l + h >>> 31 - Math.clz32(m.BYTES_PER_ELEMENT));
      } else {
        l = null;
      }
      W.texImage2D(a, b, c, d, e, f, g, k, l);
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
}, glVertexAttribPointer:(a, b, c, d, e, f) => {
  W.vertexAttribPointer(a, b, c, !!d, e, f);
}, glViewport:(a, b, c, d) => W.viewport(a, b, c, d), proc_exit:a => {
  throw new Ea(a);
}, textureFromURL:function(a, b, c, d, e) {
  let f = Z[c].X, g = O(b), k = V(d), l = V(e);
  fetch(g).then(function(m) {
    if (m.ok) {
      let h = m.headers.get("content-type");
      h && !h.startsWith("image/") && Pd(l, "Invalid content-type:\t" + h);
      return m.blob();
    }
  }).then(function(m) {
    return createImageBitmap(m);
  }).then(function(m) {
    let h = yd[a];
    h ? (f.bindTexture(f.TEXTURE_2D, h), f.texImage2D(f.TEXTURE_2D, 0, f.RGBA, f.RGBA, f.UNSIGNED_BYTE, m), f.generateMipmap(f.TEXTURE_2D), f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MIN_FILTER, f.LINEAR_MIPMAP_LINEAR), f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MAG_FILTER, f.LINEAR), f.bindTexture(f.TEXTURE_2D, null), "function" == typeof k && k()) : "function" == typeof l && Pd(l, "Texture failed to load (it no longer exists):\t" + g);
  }).catch(function() {
    Pd(l, "Texture failed to load (Fetch/decoding error):\t" + g);
  });
}}, Vd;
function Wd() {
  if (0 < jb) {
    kb = Wd;
  } else {
    Td();
    var a = ia();
    p(0 == (a & 3));
    0 == a && (a += 4);
    v[a >> 2] = 34821223;
    v[a + 4 >> 2] = 2310721022;
    v[0] = 1668509029;
    if (0 < jb) {
      kb = Wd;
    } else {
      p(!Vd);
      Vd = !0;
      n.calledRun = !0;
      if (!fa) {
        p(!ua);
        ua = !0;
        ha();
        if (!n.noFSInit && !vb) {
          p(!vb, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
          vb = !0;
          Ob("/dev/tty", "/dev/stdin");
          Ob("/dev/tty", "/dev/stdout");
          Ob("/dev/tty1", "/dev/stderr");
          a = Rb("/dev/stdin", 0);
          var b = Rb("/dev/stdout", 1), c = Rb("/dev/stderr", 1);
          p(0 === a.A, `invalid handle for stdin (${a.A})`);
          p(1 === b.A, `invalid handle for stdout (${b.A})`);
          p(2 === c.A, `invalid handle for stderr (${c.A})`);
        }
        za.__wasm_call_ctors();
        wb = !1;
        na?.(n);
        p(!n._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
        ha();
      }
      ha();
    }
  }
}
var za;
za = await (async function() {
  var a = {env:Ud, wasi_snapshot_preview1:Ud};
  Aa ??= n.locateFile ? ba + "equirectangular.wasm" : (new URL("equirectangular.wasm", import.meta.url)).href;
  a = await Da(a);
  p(n === n, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
  a = za = a.instance.exports;
  p("undefined" != typeof a.__getTypeName, "missing Wasm export: __getTypeName");
  Nc = xa("__getTypeName", 1);
  p("undefined" != typeof a.malloc, "missing Wasm export: malloc");
  Rd = xa("malloc", 1);
  p("undefined" != typeof a.free, "missing Wasm export: free");
  Oc = xa("free", 1);
  p("undefined" != typeof a.fflush, "missing Wasm export: fflush");
  p("undefined" != typeof a.emscripten_stack_get_end, "missing Wasm export: emscripten_stack_get_end");
  ia = a.emscripten_stack_get_end;
  p("undefined" != typeof a.emscripten_stack_get_base, "missing Wasm export: emscripten_stack_get_base");
  p("undefined" != typeof a._emscripten_timeout, "missing Wasm export: _emscripten_timeout");
  Sd = xa("_emscripten_timeout", 2);
  p("undefined" != typeof a.strerror, "missing Wasm export: strerror");
  xb = xa("strerror", 1);
  p("undefined" != typeof a.emscripten_stack_init, "missing Wasm export: emscripten_stack_init");
  Td = a.emscripten_stack_init;
  p("undefined" != typeof a.emscripten_stack_get_free, "missing Wasm export: emscripten_stack_get_free");
  p("undefined" != typeof a._emscripten_stack_restore, "missing Wasm export: _emscripten_stack_restore");
  p("undefined" != typeof a._emscripten_stack_alloc, "missing Wasm export: _emscripten_stack_alloc");
  p("undefined" != typeof a.emscripten_stack_get_current, "missing Wasm export: emscripten_stack_get_current");
  rd = a.emscripten_stack_get_current;
  p("undefined" != typeof a.__cxa_increment_exception_refcount, "missing Wasm export: __cxa_increment_exception_refcount");
  p("undefined" != typeof a.memory, "missing Wasm export: memory");
  wa = a.memory;
  p("undefined" != typeof a.__indirect_function_table, "missing Wasm export: __indirect_function_table");
  Kc = a.__indirect_function_table;
  va();
  return za;
}());
Wd();
ua ? moduleRtn = n : moduleRtn = new Promise((a, b) => {
  na = a;
  oa = b;
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

