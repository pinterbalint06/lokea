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
  function $humanReadableVersionToPacked$$($str$jscomp$6_vers$$) {
    $str$jscomp$6_vers$$ = $str$jscomp$6_vers$$.split("-")[0];
    for ($str$jscomp$6_vers$$ = $str$jscomp$6_vers$$.split(".").slice(0, 3); 3 > $str$jscomp$6_vers$$.length;) {
      $str$jscomp$6_vers$$.push("00");
    }
    $str$jscomp$6_vers$$ = $str$jscomp$6_vers$$.map($n$jscomp$2$$ => $n$jscomp$2$$.padStart(2, "0"));
    return $str$jscomp$6_vers$$.join("");
  }
  var $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$ = "undefined" !== typeof process && process.$versions$?.node ? $humanReadableVersionToPacked$$(process.$versions$.node) : 2147483647;
  if (2147483647 > $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$) {
    throw Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
  }
  if (2147483647 > $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$) {
    throw Error(`This emscripten-generated code requires node v${"214748.36.47"} (detected v${[$currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$ / 1e4 | 0, ($currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$ / 100 | 0) % 100, $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$ % 100].join(".")})`);
  }
  $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$ = "undefined" !== typeof navigator && navigator.userAgent?.includes("Safari/") && navigator.userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/) ? $humanReadableVersionToPacked$$(navigator.userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/)[1]) : 2147483647;
  if (15e4 > $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$) {
    throw Error(`This emscripten-generated code requires Safari v${"15.0.0"} (detected v${$currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$})`);
  }
  $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$ = "undefined" !== typeof navigator && navigator.userAgent?.match(/Firefox\/(\d+(?:\.\d+)?)/) ? parseFloat(navigator.userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/)[1]) : 2147483647;
  if (79 > $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$) {
    throw Error(`This emscripten-generated code requires Firefox v79 (detected v${$currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$})`);
  }
  $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$ = "undefined" !== typeof navigator && navigator.userAgent?.match(/Chrome\/(\d+(?:\.\d+)?)/) ? parseFloat(navigator.userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/)[1]) : 2147483647;
  if (85 > $currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$) {
    throw Error(`This emscripten-generated code requires Chrome v85 (detected v${$currentChromeVersion_currentFirefoxVersion_currentNodeVersion_currentSafariVersion$$})`);
  }
})();
var $Module$$ = moduleArg, $thisProgram$$ = "./this.program", $scriptDirectory$$ = "", $readAsync$$;
try {
  $scriptDirectory$$ = (new URL(".", _scriptName)).href;
} catch {
}
if (!globalThis.window && !globalThis.WorkerGlobalScope) {
  throw Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
}
$readAsync$$ = async $response$jscomp$2_url$jscomp$24$$ => {
  $assert$$(!$isFileURI$$($response$jscomp$2_url$jscomp$24$$), "readAsync does not work with file:// URLs");
  $response$jscomp$2_url$jscomp$24$$ = await fetch($response$jscomp$2_url$jscomp$24$$, {credentials:"same-origin"});
  if ($response$jscomp$2_url$jscomp$24$$.ok) {
    return $response$jscomp$2_url$jscomp$24$$.arrayBuffer();
  }
  throw Error($response$jscomp$2_url$jscomp$24$$.status + " : " + $response$jscomp$2_url$jscomp$24$$.url);
};
var $out$$ = console.log.bind(console), $err$$ = console.error.bind(console);
$assert$$(!0, "worker environment detected but not enabled at build time.  Add `worker` to `-sENVIRONMENT` to enable.");
$assert$$(!0, "node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable.");
$assert$$(!0, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");
var $wasmBinary$$;
globalThis.WebAssembly || $err$$("no native wasm support detected");
var $ABORT$$ = !1;
function $assert$$($condition$jscomp$2$$, $text$jscomp$12$$) {
  $condition$jscomp$2$$ || $abort$$("Assertion failed" + ($text$jscomp$12$$ ? ": " + $text$jscomp$12$$ : ""));
}
var $isFileURI$$ = $filename$jscomp$2$$ => $filename$jscomp$2$$.startsWith("file://");
function $writeStackCookie$$() {
  var $max$$ = $_emscripten_stack_get_end$$();
  $assert$$(0 == ($max$$ & 3));
  0 == $max$$ && ($max$$ += 4);
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $max$$ >> 2, $___asan_storeN$$)] = 34821223;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $max$$ + 4 >> 2, $___asan_storeN$$)] = 2310721022;
}
function $checkStackCookie$$() {
  if (!$ABORT$$) {
    var $max$jscomp$1$$ = $_emscripten_stack_get_end$$();
    0 == $max$jscomp$1$$ && ($max$jscomp$1$$ += 4);
    var $cookie1$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $max$jscomp$1$$ >> 2, $___asan_loadN$$)], $cookie2$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $max$jscomp$1$$ + 4 >> 2, $___asan_loadN$$)];
    34821223 == $cookie1$$ && 2310721022 == $cookie2$$ || $abort$$(`Stack overflow! Stack cookie has been overwritten at ${$ptrToString$$($max$jscomp$1$$)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${$ptrToString$$($cookie2$$)} ${$ptrToString$$($cookie1$$)}`);
  }
}
var $h16$jscomp$inline_63$$ = new Int16Array(1), $h8$jscomp$inline_64$$ = new Int8Array($h16$jscomp$inline_63$$.buffer);
$h16$jscomp$inline_63$$[0] = 25459;
115 === $h8$jscomp$inline_64$$[0] && 99 === $h8$jscomp$inline_64$$[1] || $abort$$("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
function $consumedModuleProp$$($prop$jscomp$2$$) {
  Object.getOwnPropertyDescriptor($Module$$, $prop$jscomp$2$$) || Object.defineProperty($Module$$, $prop$jscomp$2$$, {configurable:!0, set() {
    $abort$$(`Attempt to set \`Module.${$prop$jscomp$2$$}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`);
  }});
}
function $makeInvalidEarlyAccess$$($name$jscomp$74$$) {
  return () => $assert$$(!1, `call to '${$name$jscomp$74$$}' via reference taken before Wasm module initialization`);
}
function $unexportedRuntimeSymbol$$($sym$jscomp$3$$) {
  Object.getOwnPropertyDescriptor($Module$$, $sym$jscomp$3$$) || Object.defineProperty($Module$$, $sym$jscomp$3$$, {configurable:!0, get() {
    var $msg$$ = `'${$sym$jscomp$3$$}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
    "FS_createPath" !== $sym$jscomp$3$$ && "FS_createDataFile" !== $sym$jscomp$3$$ && "FS_createPreloadedFile" !== $sym$jscomp$3$$ && "FS_preloadFile" !== $sym$jscomp$3$$ && "FS_unlink" !== $sym$jscomp$3$$ && "addRunDependency" !== $sym$jscomp$3$$ && "FS_createLazyFile" !== $sym$jscomp$3$$ && "FS_createDevice" !== $sym$jscomp$3$$ && "removeRunDependency" !== $sym$jscomp$3$$ || ($msg$$ += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you");
    $abort$$($msg$$);
  }});
}
function $_asan_js_check_index$$($arr$jscomp$2_elemSize$$, $index$jscomp$103$$, $asanFn$$) {
  $runtimeInitialized$$ && !$runtimeExited$$ && ($arr$jscomp$2_elemSize$$ = $arr$jscomp$2_elemSize$$.BYTES_PER_ELEMENT, $asanFn$$($index$jscomp$103$$ * $arr$jscomp$2_elemSize$$, $arr$jscomp$2_elemSize$$));
  return $index$jscomp$103$$;
}
var $readyPromiseResolve$$, $readyPromiseReject$$, $HEAP8$$, $HEAPU8$$, $HEAP16$$, $HEAPU16$$, $HEAP32$$, $HEAPU32$$, $HEAPF32$$, $HEAPF64$$, $HEAP64$$, $HEAPU64$$, $runtimeInitialized$$ = !1, $runtimeExited$$ = !1;
function $updateMemoryViews$$() {
  var $b$jscomp$1$$ = $wasmMemory$$.buffer;
  $HEAP8$$ = new Int8Array($b$jscomp$1$$);
  $HEAP16$$ = new Int16Array($b$jscomp$1$$);
  $Module$$.HEAPU8 = $HEAPU8$$ = new Uint8Array($b$jscomp$1$$);
  $HEAPU16$$ = new Uint16Array($b$jscomp$1$$);
  $HEAP32$$ = new Int32Array($b$jscomp$1$$);
  $HEAPU32$$ = new Uint32Array($b$jscomp$1$$);
  $HEAPF32$$ = new Float32Array($b$jscomp$1$$);
  $HEAPF64$$ = new Float64Array($b$jscomp$1$$);
  $HEAP64$$ = new BigInt64Array($b$jscomp$1$$);
  $HEAPU64$$ = new BigUint64Array($b$jscomp$1$$);
}
$assert$$(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set, "JS engine does not provide full typed array support");
function $abort$$($e$jscomp$7_what$$) {
  $Module$$.onAbort?.($e$jscomp$7_what$$);
  $e$jscomp$7_what$$ = "Aborted(" + $e$jscomp$7_what$$ + ")";
  $err$$($e$jscomp$7_what$$);
  $ABORT$$ = !0;
  $e$jscomp$7_what$$ = new WebAssembly.RuntimeError($e$jscomp$7_what$$);
  $readyPromiseReject$$?.($e$jscomp$7_what$$);
  throw $e$jscomp$7_what$$;
}
function $createExportWrapper$$($name$jscomp$76$$, $nargs$$) {
  return (...$args$jscomp$4$$) => {
    $assert$$($runtimeInitialized$$, `native function \`${$name$jscomp$76$$}\` called before runtime initialization`);
    $assert$$(!$runtimeExited$$, `native function \`${$name$jscomp$76$$}\` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)`);
    var $f$jscomp$1$$ = $wasmExports$$[$name$jscomp$76$$];
    $assert$$($f$jscomp$1$$, `exported native function \`${$name$jscomp$76$$}\` not found`);
    $assert$$($args$jscomp$4$$.length <= $nargs$$, `native function \`${$name$jscomp$76$$}\` called with ${$args$jscomp$4$$.length} args but expects ${$nargs$$}`);
    return $f$jscomp$1$$(...$args$jscomp$4$$);
  };
}
var $wasmBinaryFile$$;
async function $getWasmBinary$$($JSCompiler_inline_result$jscomp$0_binaryFile$$) {
  if (!$wasmBinary$$) {
    try {
      var $response$jscomp$3$$ = await $readAsync$$($JSCompiler_inline_result$jscomp$0_binaryFile$$);
      return new Uint8Array($response$jscomp$3$$);
    } catch {
    }
  }
  if ($JSCompiler_inline_result$jscomp$0_binaryFile$$ == $wasmBinaryFile$$ && $wasmBinary$$) {
    $JSCompiler_inline_result$jscomp$0_binaryFile$$ = new Uint8Array($wasmBinary$$);
  } else {
    throw "both async and sync fetching of the wasm failed";
  }
  return $JSCompiler_inline_result$jscomp$0_binaryFile$$;
}
async function $instantiateArrayBuffer$$($binaryFile$jscomp$1$$, $imports$$) {
  try {
    var $binary$$ = await $getWasmBinary$$($binaryFile$jscomp$1$$);
    return await WebAssembly.instantiate($binary$$, $imports$$);
  } catch ($reason$jscomp$9$$) {
    $err$$(`failed to asynchronously prepare wasm: ${$reason$jscomp$9$$}`), $isFileURI$$($binaryFile$jscomp$1$$) && $err$$(`warning: Loading from a file URI (${$binaryFile$jscomp$1$$}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`), $abort$$($reason$jscomp$9$$);
  }
}
async function $instantiateAsync$$($imports$jscomp$1$$) {
  var $binaryFile$jscomp$2$$ = $wasmBinaryFile$$;
  if (!$wasmBinary$$) {
    try {
      var $response$jscomp$4$$ = fetch($binaryFile$jscomp$2$$, {credentials:"same-origin"});
      return await WebAssembly.instantiateStreaming($response$jscomp$4$$, $imports$jscomp$1$$);
    } catch ($reason$jscomp$10$$) {
      $err$$(`wasm streaming compile failed: ${$reason$jscomp$10$$}`), $err$$("falling back to ArrayBuffer instantiation");
    }
  }
  return $instantiateArrayBuffer$$($binaryFile$jscomp$2$$, $imports$jscomp$1$$);
}
class $ExitStatus$$ {
  name="ExitStatus";
  constructor($status$jscomp$1$$) {
    this.message = `Program terminated with exit(${$status$jscomp$1$$})`;
    this.status = $status$jscomp$1$$;
  }
}
var $callRuntimeCallbacks$$ = $callbacks$$ => {
  for (; 0 < $callbacks$$.length;) {
    $callbacks$$.shift()($Module$$);
  }
}, $onPostRuns$$ = [], $onPreRuns$$ = [], $addOnPreRun$$ = () => {
  var $cb$jscomp$1$$ = $Module$$.preRun.shift();
  $onPreRuns$$.push($cb$jscomp$1$$);
}, $noExitRuntime$$ = !1, $ptrToString$$ = $ptr$jscomp$1$$ => {
  $assert$$("number" === typeof $ptr$jscomp$1$$, `ptrToString expects a number, got ${typeof $ptr$jscomp$1$$}`);
  return "0x" + ($ptr$jscomp$1$$ >>> 0).toString(16).padStart(8, "0");
}, $warnOnce$$ = $text$jscomp$13$$ => {
  $warnOnce$$.$shown$ || ($warnOnce$$.$shown$ = {});
  $warnOnce$$.$shown$[$text$jscomp$13$$] || ($warnOnce$$.$shown$[$text$jscomp$13$$] = 1, $err$$($text$jscomp$13$$));
}, $UTF8Decoder$$ = globalThis.TextDecoder && new TextDecoder(), $findStringEnd$$ = ($heapOrArray$$, $idx$$, $maxBytesToRead_maxIdx$$, $ignoreNul$$) => {
  $maxBytesToRead_maxIdx$$ = $idx$$ + $maxBytesToRead_maxIdx$$;
  if ($ignoreNul$$) {
    return $maxBytesToRead_maxIdx$$;
  }
  for (; $heapOrArray$$[$idx$$] && !($idx$$ >= $maxBytesToRead_maxIdx$$);) {
    ++$idx$$;
  }
  return $idx$$;
}, $UTF8ArrayToString$$ = ($heapOrArray$jscomp$1$$, $idx$jscomp$1$$ = 0, $endPtr_maxBytesToRead$jscomp$1$$, $ignoreNul$jscomp$1_str$jscomp$7$$) => {
  $endPtr_maxBytesToRead$jscomp$1$$ = $findStringEnd$$($heapOrArray$jscomp$1$$, $idx$jscomp$1$$, $endPtr_maxBytesToRead$jscomp$1$$, $ignoreNul$jscomp$1_str$jscomp$7$$);
  if (16 < $endPtr_maxBytesToRead$jscomp$1$$ - $idx$jscomp$1$$ && $heapOrArray$jscomp$1$$.buffer && $UTF8Decoder$$) {
    return $UTF8Decoder$$.decode($heapOrArray$jscomp$1$$.subarray($idx$jscomp$1$$, $endPtr_maxBytesToRead$jscomp$1$$));
  }
  for ($ignoreNul$jscomp$1_str$jscomp$7$$ = ""; $idx$jscomp$1$$ < $endPtr_maxBytesToRead$jscomp$1$$;) {
    var $ch_u0$$ = $heapOrArray$jscomp$1$$[$idx$jscomp$1$$++];
    if ($ch_u0$$ & 128) {
      var $u1$$ = $heapOrArray$jscomp$1$$[$idx$jscomp$1$$++] & 63;
      if (192 == ($ch_u0$$ & 224)) {
        $ignoreNul$jscomp$1_str$jscomp$7$$ += String.fromCharCode(($ch_u0$$ & 31) << 6 | $u1$$);
      } else {
        var $u2$$ = $heapOrArray$jscomp$1$$[$idx$jscomp$1$$++] & 63;
        224 == ($ch_u0$$ & 240) ? $ch_u0$$ = ($ch_u0$$ & 15) << 12 | $u1$$ << 6 | $u2$$ : (240 != ($ch_u0$$ & 248) && $warnOnce$$("Invalid UTF-8 leading byte " + $ptrToString$$($ch_u0$$) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!"), $ch_u0$$ = ($ch_u0$$ & 7) << 18 | $u1$$ << 12 | $u2$$ << 6 | $heapOrArray$jscomp$1$$[$idx$jscomp$1$$++] & 63);
        65536 > $ch_u0$$ ? $ignoreNul$jscomp$1_str$jscomp$7$$ += String.fromCharCode($ch_u0$$) : ($ch_u0$$ -= 65536, $ignoreNul$jscomp$1_str$jscomp$7$$ += String.fromCharCode(55296 | $ch_u0$$ >> 10, 56320 | $ch_u0$$ & 1023));
      }
    } else {
      $ignoreNul$jscomp$1_str$jscomp$7$$ += String.fromCharCode($ch_u0$$);
    }
  }
  return $ignoreNul$jscomp$1_str$jscomp$7$$;
}, $UTF8ToString$$ = ($ptr$jscomp$3$$, $maxBytesToRead$jscomp$2$$, $ignoreNul$jscomp$2$$) => {
  $assert$$("number" == typeof $ptr$jscomp$3$$, `UTF8ToString expects a number (got ${typeof $ptr$jscomp$3$$})`);
  return $ptr$jscomp$3$$ ? $UTF8ArrayToString$$($HEAPU8$$, $ptr$jscomp$3$$, $maxBytesToRead$jscomp$2$$, $ignoreNul$jscomp$2$$) : "";
};
class $ExceptionInfo$$ {
  constructor($excPtr$$) {
    this.$ptr$ = $excPtr$$ - 24;
  }
}
var $uncaughtExceptionCount$$ = 0, $PATH$normalizeArray$$ = ($parts$$, $allowAboveRoot$$) => {
  for (var $up$$ = 0, $i$jscomp$4$$ = $parts$$.length - 1; 0 <= $i$jscomp$4$$; $i$jscomp$4$$--) {
    var $last$$ = $parts$$[$i$jscomp$4$$];
    "." === $last$$ ? $parts$$.splice($i$jscomp$4$$, 1) : ".." === $last$$ ? ($parts$$.splice($i$jscomp$4$$, 1), $up$$++) : $up$$ && ($parts$$.splice($i$jscomp$4$$, 1), $up$$--);
  }
  if ($allowAboveRoot$$) {
    for (; $up$$; $up$$--) {
      $parts$$.unshift("..");
    }
  }
  return $parts$$;
}, $PATH$normalize$$ = $path$jscomp$7$$ => {
  var $isAbsolute$$ = "/" === $path$jscomp$7$$.charAt(0), $trailingSlash$$ = "/" === $path$jscomp$7$$.slice(-1);
  ($path$jscomp$7$$ = $PATH$normalizeArray$$($path$jscomp$7$$.split("/").filter($p$$ => !!$p$$), !$isAbsolute$$).join("/")) || $isAbsolute$$ || ($path$jscomp$7$$ = ".");
  $path$jscomp$7$$ && $trailingSlash$$ && ($path$jscomp$7$$ += "/");
  return ($isAbsolute$$ ? "/" : "") + $path$jscomp$7$$;
}, $PATH$dirname$$ = $path$jscomp$8_root$jscomp$3$$ => {
  var $dir_result$jscomp$3$$ = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec($path$jscomp$8_root$jscomp$3$$).slice(1);
  $path$jscomp$8_root$jscomp$3$$ = $dir_result$jscomp$3$$[0];
  $dir_result$jscomp$3$$ = $dir_result$jscomp$3$$[1];
  if (!$path$jscomp$8_root$jscomp$3$$ && !$dir_result$jscomp$3$$) {
    return ".";
  }
  $dir_result$jscomp$3$$ &&= $dir_result$jscomp$3$$.slice(0, -1);
  return $path$jscomp$8_root$jscomp$3$$ + $dir_result$jscomp$3$$;
}, $initRandomFill$$ = () => $view$jscomp$5$$ => crypto.getRandomValues($view$jscomp$5$$), $randomFill$$ = $view$jscomp$6$$ => {
  ($randomFill$$ = $initRandomFill$$())($view$jscomp$6$$);
}, $PATH_FS$resolve$$ = (...$args$jscomp$5$$) => {
  for (var $resolvedPath$$ = "", $path$jscomp$10_resolvedAbsolute$$ = !1, $i$jscomp$5$$ = $args$jscomp$5$$.length - 1; -1 <= $i$jscomp$5$$ && !$path$jscomp$10_resolvedAbsolute$$; $i$jscomp$5$$--) {
    $path$jscomp$10_resolvedAbsolute$$ = 0 <= $i$jscomp$5$$ ? $args$jscomp$5$$[$i$jscomp$5$$] : "/";
    if ("string" != typeof $path$jscomp$10_resolvedAbsolute$$) {
      throw new TypeError("Arguments to path.resolve must be strings");
    }
    if (!$path$jscomp$10_resolvedAbsolute$$) {
      return "";
    }
    $resolvedPath$$ = $path$jscomp$10_resolvedAbsolute$$ + "/" + $resolvedPath$$;
    $path$jscomp$10_resolvedAbsolute$$ = "/" === $path$jscomp$10_resolvedAbsolute$$.charAt(0);
  }
  $resolvedPath$$ = $PATH$normalizeArray$$($resolvedPath$$.split("/").filter($p$jscomp$1$$ => !!$p$jscomp$1$$), !$path$jscomp$10_resolvedAbsolute$$).join("/");
  return ($path$jscomp$10_resolvedAbsolute$$ ? "/" : "") + $resolvedPath$$ || ".";
}, $FS_stdin_getChar_buffer$$ = [], $lengthBytesUTF8$$ = $str$jscomp$8$$ => {
  for (var $len$$ = 0, $i$jscomp$7$$ = 0; $i$jscomp$7$$ < $str$jscomp$8$$.length; ++$i$jscomp$7$$) {
    var $c$$ = $str$jscomp$8$$.charCodeAt($i$jscomp$7$$);
    127 >= $c$$ ? $len$$++ : 2047 >= $c$$ ? $len$$ += 2 : 55296 <= $c$$ && 57343 >= $c$$ ? ($len$$ += 4, ++$i$jscomp$7$$) : $len$$ += 3;
  }
  return $len$$;
}, $stringToUTF8Array$$ = ($str$jscomp$9$$, $heap$$, $outIdx$$, $endIdx_maxBytesToWrite$$) => {
  $assert$$("string" === typeof $str$jscomp$9$$, `stringToUTF8Array expects a string (got ${typeof $str$jscomp$9$$})`);
  if (!(0 < $endIdx_maxBytesToWrite$$)) {
    return 0;
  }
  var $startIdx$$ = $outIdx$$;
  $endIdx_maxBytesToWrite$$ = $outIdx$$ + $endIdx_maxBytesToWrite$$ - 1;
  for (var $i$jscomp$8$$ = 0; $i$jscomp$8$$ < $str$jscomp$9$$.length; ++$i$jscomp$8$$) {
    var $u$$ = $str$jscomp$9$$.codePointAt($i$jscomp$8$$);
    if (127 >= $u$$) {
      if ($outIdx$$ >= $endIdx_maxBytesToWrite$$) {
        break;
      }
      $heap$$[$outIdx$$++] = $u$$;
    } else if (2047 >= $u$$) {
      if ($outIdx$$ + 1 >= $endIdx_maxBytesToWrite$$) {
        break;
      }
      $heap$$[$outIdx$$++] = 192 | $u$$ >> 6;
      $heap$$[$outIdx$$++] = 128 | $u$$ & 63;
    } else if (65535 >= $u$$) {
      if ($outIdx$$ + 2 >= $endIdx_maxBytesToWrite$$) {
        break;
      }
      $heap$$[$outIdx$$++] = 224 | $u$$ >> 12;
      $heap$$[$outIdx$$++] = 128 | $u$$ >> 6 & 63;
      $heap$$[$outIdx$$++] = 128 | $u$$ & 63;
    } else {
      if ($outIdx$$ + 3 >= $endIdx_maxBytesToWrite$$) {
        break;
      }
      1114111 < $u$$ && $warnOnce$$("Invalid Unicode code point " + $ptrToString$$($u$$) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
      $heap$$[$outIdx$$++] = 240 | $u$$ >> 18;
      $heap$$[$outIdx$$++] = 128 | $u$$ >> 12 & 63;
      $heap$$[$outIdx$$++] = 128 | $u$$ >> 6 & 63;
      $heap$$[$outIdx$$++] = 128 | $u$$ & 63;
      $i$jscomp$8$$++;
    }
  }
  $heap$$[$outIdx$$] = 0;
  return $outIdx$$ - $startIdx$$;
}, $intArrayFromString$$ = $numBytesWritten_stringy$$ => {
  var $u8array$$ = Array($lengthBytesUTF8$$($numBytesWritten_stringy$$) + 1);
  $numBytesWritten_stringy$$ = $stringToUTF8Array$$($numBytesWritten_stringy$$, $u8array$$, 0, $u8array$$.length);
  $u8array$$.length = $numBytesWritten_stringy$$;
  return $u8array$$;
}, $TTY$ttys$$ = [];
function $TTY$register$$($dev$$, $ops$$) {
  $TTY$ttys$$[$dev$$] = {input:[], output:[], $ops$:$ops$$};
  $FS$registerDevice$$($dev$$, $TTY$stream_ops$$);
}
var $TTY$stream_ops$$ = {open($stream$jscomp$4$$) {
  var $tty$$ = $TTY$ttys$$[$stream$jscomp$4$$.node.$rdev$];
  if (!$tty$$) {
    throw new $FS$ErrnoError$$(43);
  }
  $stream$jscomp$4$$.$tty$ = $tty$$;
  $stream$jscomp$4$$.seekable = !1;
}, close($stream$jscomp$5$$) {
  $stream$jscomp$5$$.$tty$.$ops$.$fsync$($stream$jscomp$5$$.$tty$);
}, $fsync$($stream$jscomp$6$$) {
  $stream$jscomp$6$$.$tty$.$ops$.$fsync$($stream$jscomp$6$$.$tty$);
}, read($stream$jscomp$7$$, $buffer$jscomp$18$$, $offset$jscomp$26$$, $length$jscomp$18$$) {
  if (!$stream$jscomp$7$$.$tty$ || !$stream$jscomp$7$$.$tty$.$ops$.$get_char$) {
    throw new $FS$ErrnoError$$(60);
  }
  for (var $bytesRead$$ = 0, $i$jscomp$9$$ = 0; $i$jscomp$9$$ < $length$jscomp$18$$; $i$jscomp$9$$++) {
    try {
      var $result$jscomp$5$$ = $stream$jscomp$7$$.$tty$.$ops$.$get_char$($stream$jscomp$7$$.$tty$);
    } catch ($e$jscomp$9$$) {
      throw new $FS$ErrnoError$$(29);
    }
    if (void 0 === $result$jscomp$5$$ && 0 === $bytesRead$$) {
      throw new $FS$ErrnoError$$(6);
    }
    if (null === $result$jscomp$5$$ || void 0 === $result$jscomp$5$$) {
      break;
    }
    $bytesRead$$++;
    $buffer$jscomp$18$$[$offset$jscomp$26$$ + $i$jscomp$9$$] = $result$jscomp$5$$;
  }
  $bytesRead$$ && ($stream$jscomp$7$$.node.$atime$ = Date.now());
  return $bytesRead$$;
}, write($stream$jscomp$8$$, $buffer$jscomp$19$$, $offset$jscomp$27$$, $length$jscomp$19$$) {
  if (!$stream$jscomp$8$$.$tty$ || !$stream$jscomp$8$$.$tty$.$ops$.$put_char$) {
    throw new $FS$ErrnoError$$(60);
  }
  try {
    for (var $i$jscomp$10$$ = 0; $i$jscomp$10$$ < $length$jscomp$19$$; $i$jscomp$10$$++) {
      $stream$jscomp$8$$.$tty$.$ops$.$put_char$($stream$jscomp$8$$.$tty$, $buffer$jscomp$19$$[$offset$jscomp$27$$ + $i$jscomp$10$$]);
    }
  } catch ($e$jscomp$10$$) {
    throw new $FS$ErrnoError$$(29);
  }
  $length$jscomp$19$$ && ($stream$jscomp$8$$.node.$mtime$ = $stream$jscomp$8$$.node.$ctime$ = Date.now());
  return $i$jscomp$10$$;
}}, $TTY$default_tty_ops$$ = {$get_char$() {
  a: {
    if (!$FS_stdin_getChar_buffer$$.length) {
      var $JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$ = null;
      globalThis.window?.prompt && ($JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$ = window.prompt("Input: "), null !== $JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$ && ($JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$ += "\n"));
      if (!$JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$) {
        $JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$ = null;
        break a;
      }
      $FS_stdin_getChar_buffer$$ = $intArrayFromString$$($JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$);
    }
    $JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$ = $FS_stdin_getChar_buffer$$.shift();
  }
  return $JSCompiler_inline_result$jscomp$2_result$jscomp$inline_68$$;
}, $put_char$($tty$jscomp$2$$, $val$jscomp$1$$) {
  null === $val$jscomp$1$$ || 10 === $val$jscomp$1$$ ? ($out$$($UTF8ArrayToString$$($tty$jscomp$2$$.output)), $tty$jscomp$2$$.output = []) : 0 != $val$jscomp$1$$ && $tty$jscomp$2$$.output.push($val$jscomp$1$$);
}, $fsync$($tty$jscomp$3$$) {
  0 < $tty$jscomp$3$$.output?.length && ($out$$($UTF8ArrayToString$$($tty$jscomp$3$$.output)), $tty$jscomp$3$$.output = []);
}, $ioctl_tcgets$() {
  return {$c_iflag$:25856, $c_oflag$:5, $c_cflag$:191, $c_lflag$:35387, $c_cc$:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
}, $ioctl_tcsets$() {
  return 0;
}, $ioctl_tiocgwinsz$() {
  return [24, 80];
}}, $TTY$default_tty1_ops$$ = {$put_char$($tty$jscomp$7$$, $val$jscomp$2$$) {
  null === $val$jscomp$2$$ || 10 === $val$jscomp$2$$ ? ($err$$($UTF8ArrayToString$$($tty$jscomp$7$$.output)), $tty$jscomp$7$$.output = []) : 0 != $val$jscomp$2$$ && $tty$jscomp$7$$.output.push($val$jscomp$2$$);
}, $fsync$($tty$jscomp$8$$) {
  0 < $tty$jscomp$8$$.output?.length && ($err$$($UTF8ArrayToString$$($tty$jscomp$8$$.output)), $tty$jscomp$8$$.output = []);
}}, $alignMemory$$ = $size$jscomp$22$$ => {
  $assert$$(65536, "alignment argument is required");
  return 65536 * Math.ceil($size$jscomp$22$$ / 65536);
}, $mmapAlloc$$ = $size$jscomp$23$$ => {
  $size$jscomp$23$$ = $alignMemory$$($size$jscomp$23$$);
  var $ptr$jscomp$6$$ = $_emscripten_builtin_memalign$$(65536, $size$jscomp$23$$);
  $ptr$jscomp$6$$ && $HEAPU8$$.fill(0, $ptr$jscomp$6$$, $ptr$jscomp$6$$ + $size$jscomp$23$$);
  return $ptr$jscomp$6$$;
}, $MEMFS$$ = {$ops_table$:null, $mount$() {
  return $MEMFS$$.createNode(null, "/", 16895, 0);
}, createNode($parent$jscomp$4$$, $name$jscomp$77$$, $mode$jscomp$15_node$jscomp$5$$, $dev$jscomp$1$$) {
  if (24576 === ($mode$jscomp$15_node$jscomp$5$$ & 61440) || 4096 === ($mode$jscomp$15_node$jscomp$5$$ & 61440)) {
    throw new $FS$ErrnoError$$(63);
  }
  $MEMFS$$.$ops_table$ || ($MEMFS$$.$ops_table$ = {dir:{node:{$getattr$:$MEMFS$$.$node_ops$.$getattr$, $setattr$:$MEMFS$$.$node_ops$.$setattr$, $lookup$:$MEMFS$$.$node_ops$.$lookup$, $mknod$:$MEMFS$$.$node_ops$.$mknod$, $rename$:$MEMFS$$.$node_ops$.$rename$, $unlink$:$MEMFS$$.$node_ops$.$unlink$, $rmdir$:$MEMFS$$.$node_ops$.$rmdir$, $readdir$:$MEMFS$$.$node_ops$.$readdir$, $symlink$:$MEMFS$$.$node_ops$.$symlink$}, stream:{$llseek$:$MEMFS$$.$stream_ops$.$llseek$}}, file:{node:{$getattr$:$MEMFS$$.$node_ops$.$getattr$, 
  $setattr$:$MEMFS$$.$node_ops$.$setattr$}, stream:{$llseek$:$MEMFS$$.$stream_ops$.$llseek$, read:$MEMFS$$.$stream_ops$.read, write:$MEMFS$$.$stream_ops$.write, $mmap$:$MEMFS$$.$stream_ops$.$mmap$, $msync$:$MEMFS$$.$stream_ops$.$msync$}}, link:{node:{$getattr$:$MEMFS$$.$node_ops$.$getattr$, $setattr$:$MEMFS$$.$node_ops$.$setattr$, $readlink$:$MEMFS$$.$node_ops$.$readlink$}, stream:{}}, $chrdev$:{node:{$getattr$:$MEMFS$$.$node_ops$.$getattr$, $setattr$:$MEMFS$$.$node_ops$.$setattr$}, stream:$FS$chrdev_stream_ops$$}});
  $mode$jscomp$15_node$jscomp$5$$ = $FS$createNode$$($parent$jscomp$4$$, $name$jscomp$77$$, $mode$jscomp$15_node$jscomp$5$$, $dev$jscomp$1$$);
  $FS$isDir$$($mode$jscomp$15_node$jscomp$5$$.mode) ? ($mode$jscomp$15_node$jscomp$5$$.$node_ops$ = $MEMFS$$.$ops_table$.dir.node, $mode$jscomp$15_node$jscomp$5$$.$stream_ops$ = $MEMFS$$.$ops_table$.dir.stream, $mode$jscomp$15_node$jscomp$5$$.$contents$ = {}) : 32768 === ($mode$jscomp$15_node$jscomp$5$$.mode & 61440) ? ($mode$jscomp$15_node$jscomp$5$$.$node_ops$ = $MEMFS$$.$ops_table$.file.node, $mode$jscomp$15_node$jscomp$5$$.$stream_ops$ = $MEMFS$$.$ops_table$.file.stream, $mode$jscomp$15_node$jscomp$5$$.$usedBytes$ = 
  0, $mode$jscomp$15_node$jscomp$5$$.$contents$ = null) : 40960 === ($mode$jscomp$15_node$jscomp$5$$.mode & 61440) ? ($mode$jscomp$15_node$jscomp$5$$.$node_ops$ = $MEMFS$$.$ops_table$.link.node, $mode$jscomp$15_node$jscomp$5$$.$stream_ops$ = $MEMFS$$.$ops_table$.link.stream) : 8192 === ($mode$jscomp$15_node$jscomp$5$$.mode & 61440) && ($mode$jscomp$15_node$jscomp$5$$.$node_ops$ = $MEMFS$$.$ops_table$.$chrdev$.node, $mode$jscomp$15_node$jscomp$5$$.$stream_ops$ = $MEMFS$$.$ops_table$.$chrdev$.stream);
  $mode$jscomp$15_node$jscomp$5$$.$atime$ = $mode$jscomp$15_node$jscomp$5$$.$mtime$ = $mode$jscomp$15_node$jscomp$5$$.$ctime$ = Date.now();
  $parent$jscomp$4$$ && ($parent$jscomp$4$$.$contents$[$name$jscomp$77$$] = $mode$jscomp$15_node$jscomp$5$$, $parent$jscomp$4$$.$atime$ = $parent$jscomp$4$$.$mtime$ = $parent$jscomp$4$$.$ctime$ = $mode$jscomp$15_node$jscomp$5$$.$atime$);
  return $mode$jscomp$15_node$jscomp$5$$;
}, $getFileDataAsTypedArray$($node$jscomp$6$$) {
  return $node$jscomp$6$$.$contents$ ? $node$jscomp$6$$.$contents$.subarray ? $node$jscomp$6$$.$contents$.subarray(0, $node$jscomp$6$$.$usedBytes$) : new Uint8Array($node$jscomp$6$$.$contents$) : new Uint8Array(0);
}, $node_ops$:{$getattr$($node$jscomp$9$$) {
  var $attr$$ = {};
  $attr$$.$dev$ = 8192 === ($node$jscomp$9$$.mode & 61440) ? $node$jscomp$9$$.id : 1;
  $attr$$.$ino$ = $node$jscomp$9$$.id;
  $attr$$.mode = $node$jscomp$9$$.mode;
  $attr$$.$nlink$ = 1;
  $attr$$.uid = 0;
  $attr$$.$gid$ = 0;
  $attr$$.$rdev$ = $node$jscomp$9$$.$rdev$;
  $FS$isDir$$($node$jscomp$9$$.mode) ? $attr$$.size = 4096 : 32768 === ($node$jscomp$9$$.mode & 61440) ? $attr$$.size = $node$jscomp$9$$.$usedBytes$ : 40960 === ($node$jscomp$9$$.mode & 61440) ? $attr$$.size = $node$jscomp$9$$.link.length : $attr$$.size = 0;
  $attr$$.$atime$ = new Date($node$jscomp$9$$.$atime$);
  $attr$$.$mtime$ = new Date($node$jscomp$9$$.$mtime$);
  $attr$$.$ctime$ = new Date($node$jscomp$9$$.$ctime$);
  $attr$$.$blksize$ = 4096;
  $attr$$.$blocks$ = Math.ceil($attr$$.size / $attr$$.$blksize$);
  return $attr$$;
}, $setattr$($node$jscomp$10$$, $attr$jscomp$1_newSize$jscomp$inline_74$$) {
  for (var $key$jscomp$39_oldContents$jscomp$inline_76$$ of ["mode", "atime", "mtime", "ctime"]) {
    null != $attr$jscomp$1_newSize$jscomp$inline_74$$[$key$jscomp$39_oldContents$jscomp$inline_76$$] && ($node$jscomp$10$$[$key$jscomp$39_oldContents$jscomp$inline_76$$] = $attr$jscomp$1_newSize$jscomp$inline_74$$[$key$jscomp$39_oldContents$jscomp$inline_76$$]);
  }
  void 0 !== $attr$jscomp$1_newSize$jscomp$inline_74$$.size && ($attr$jscomp$1_newSize$jscomp$inline_74$$ = $attr$jscomp$1_newSize$jscomp$inline_74$$.size, $node$jscomp$10$$.$usedBytes$ != $attr$jscomp$1_newSize$jscomp$inline_74$$ && (0 == $attr$jscomp$1_newSize$jscomp$inline_74$$ ? ($node$jscomp$10$$.$contents$ = null, $node$jscomp$10$$.$usedBytes$ = 0) : ($key$jscomp$39_oldContents$jscomp$inline_76$$ = $node$jscomp$10$$.$contents$, $node$jscomp$10$$.$contents$ = new Uint8Array($attr$jscomp$1_newSize$jscomp$inline_74$$), 
  $key$jscomp$39_oldContents$jscomp$inline_76$$ && $node$jscomp$10$$.$contents$.set($key$jscomp$39_oldContents$jscomp$inline_76$$.subarray(0, Math.min($attr$jscomp$1_newSize$jscomp$inline_74$$, $node$jscomp$10$$.$usedBytes$))), $node$jscomp$10$$.$usedBytes$ = $attr$jscomp$1_newSize$jscomp$inline_74$$)));
}, $lookup$() {
  throw new $FS$ErrnoError$$(44);
}, $mknod$($parent$jscomp$6$$, $name$jscomp$79$$, $mode$jscomp$16$$, $dev$jscomp$2$$) {
  return $MEMFS$$.createNode($parent$jscomp$6$$, $name$jscomp$79$$, $mode$jscomp$16$$, $dev$jscomp$2$$);
}, $rename$($old_node$$, $new_dir$$, $new_name$$) {
  try {
    var $new_node$$ = $FS$lookupNode$$($new_dir$$, $new_name$$);
  } catch ($e$jscomp$11$$) {
  }
  if ($new_node$$) {
    if ($FS$isDir$$($old_node$$.mode)) {
      for (var $i$jscomp$11$$ in $new_node$$.$contents$) {
        throw new $FS$ErrnoError$$(55);
      }
    }
    $FS$hashRemoveNode$$($new_node$$);
  }
  delete $old_node$$.parent.$contents$[$old_node$$.name];
  $new_dir$$.$contents$[$new_name$$] = $old_node$$;
  $old_node$$.name = $new_name$$;
  $new_dir$$.$ctime$ = $new_dir$$.$mtime$ = $old_node$$.parent.$ctime$ = $old_node$$.parent.$mtime$ = Date.now();
}, $unlink$($parent$jscomp$7$$, $name$jscomp$80$$) {
  delete $parent$jscomp$7$$.$contents$[$name$jscomp$80$$];
  $parent$jscomp$7$$.$ctime$ = $parent$jscomp$7$$.$mtime$ = Date.now();
}, $rmdir$($parent$jscomp$8$$, $name$jscomp$81$$) {
  var $node$jscomp$11$$ = $FS$lookupNode$$($parent$jscomp$8$$, $name$jscomp$81$$), $i$jscomp$12$$;
  for ($i$jscomp$12$$ in $node$jscomp$11$$.$contents$) {
    throw new $FS$ErrnoError$$(55);
  }
  delete $parent$jscomp$8$$.$contents$[$name$jscomp$81$$];
  $parent$jscomp$8$$.$ctime$ = $parent$jscomp$8$$.$mtime$ = Date.now();
}, $readdir$($node$jscomp$12$$) {
  return [".", "..", ...Object.keys($node$jscomp$12$$.$contents$)];
}, $symlink$($node$jscomp$13_parent$jscomp$9$$, $newname$$, $oldpath$$) {
  $node$jscomp$13_parent$jscomp$9$$ = $MEMFS$$.createNode($node$jscomp$13_parent$jscomp$9$$, $newname$$, 41471, 0);
  $node$jscomp$13_parent$jscomp$9$$.link = $oldpath$$;
  return $node$jscomp$13_parent$jscomp$9$$;
}, $readlink$($node$jscomp$14$$) {
  if (40960 !== ($node$jscomp$14$$.mode & 61440)) {
    throw new $FS$ErrnoError$$(28);
  }
  return $node$jscomp$14$$.link;
}}, $stream_ops$:{read($size$jscomp$24_stream$jscomp$9$$, $buffer$jscomp$20$$, $offset$jscomp$28$$, $i$jscomp$13_length$jscomp$20$$, $position$jscomp$1$$) {
  var $contents$jscomp$2$$ = $size$jscomp$24_stream$jscomp$9$$.node.$contents$;
  if ($position$jscomp$1$$ >= $size$jscomp$24_stream$jscomp$9$$.node.$usedBytes$) {
    return 0;
  }
  $size$jscomp$24_stream$jscomp$9$$ = Math.min($size$jscomp$24_stream$jscomp$9$$.node.$usedBytes$ - $position$jscomp$1$$, $i$jscomp$13_length$jscomp$20$$);
  $assert$$(0 <= $size$jscomp$24_stream$jscomp$9$$);
  if (8 < $size$jscomp$24_stream$jscomp$9$$ && $contents$jscomp$2$$.subarray) {
    $buffer$jscomp$20$$.set($contents$jscomp$2$$.subarray($position$jscomp$1$$, $position$jscomp$1$$ + $size$jscomp$24_stream$jscomp$9$$), $offset$jscomp$28$$);
  } else {
    for ($i$jscomp$13_length$jscomp$20$$ = 0; $i$jscomp$13_length$jscomp$20$$ < $size$jscomp$24_stream$jscomp$9$$; $i$jscomp$13_length$jscomp$20$$++) {
      $buffer$jscomp$20$$[$offset$jscomp$28$$ + $i$jscomp$13_length$jscomp$20$$] = $contents$jscomp$2$$[$position$jscomp$1$$ + $i$jscomp$13_length$jscomp$20$$];
    }
  }
  return $size$jscomp$24_stream$jscomp$9$$;
}, write($node$jscomp$15_stream$jscomp$10$$, $buffer$jscomp$21$$, $offset$jscomp$29$$, $length$jscomp$21$$, $position$jscomp$2$$, $canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$) {
  $assert$$(!($buffer$jscomp$21$$ instanceof ArrayBuffer));
  $buffer$jscomp$21$$.buffer === $HEAP8$$.buffer && ($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$ = !1);
  if (!$length$jscomp$21$$) {
    return 0;
  }
  $node$jscomp$15_stream$jscomp$10$$ = $node$jscomp$15_stream$jscomp$10$$.node;
  $node$jscomp$15_stream$jscomp$10$$.$mtime$ = $node$jscomp$15_stream$jscomp$10$$.$ctime$ = Date.now();
  if ($buffer$jscomp$21$$.subarray && (!$node$jscomp$15_stream$jscomp$10$$.$contents$ || $node$jscomp$15_stream$jscomp$10$$.$contents$.subarray)) {
    if ($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$) {
      return $assert$$(0 === $position$jscomp$2$$, "canOwn must imply no weird position inside the file"), $node$jscomp$15_stream$jscomp$10$$.$contents$ = $buffer$jscomp$21$$.subarray($offset$jscomp$29$$, $offset$jscomp$29$$ + $length$jscomp$21$$), $node$jscomp$15_stream$jscomp$10$$.$usedBytes$ = $length$jscomp$21$$;
    }
    if (0 === $node$jscomp$15_stream$jscomp$10$$.$usedBytes$ && 0 === $position$jscomp$2$$) {
      return $node$jscomp$15_stream$jscomp$10$$.$contents$ = $buffer$jscomp$21$$.slice($offset$jscomp$29$$, $offset$jscomp$29$$ + $length$jscomp$21$$), $node$jscomp$15_stream$jscomp$10$$.$usedBytes$ = $length$jscomp$21$$;
    }
    if ($position$jscomp$2$$ + $length$jscomp$21$$ <= $node$jscomp$15_stream$jscomp$10$$.$usedBytes$) {
      return $node$jscomp$15_stream$jscomp$10$$.$contents$.set($buffer$jscomp$21$$.subarray($offset$jscomp$29$$, $offset$jscomp$29$$ + $length$jscomp$21$$), $position$jscomp$2$$), $length$jscomp$21$$;
    }
  }
  $canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$ = $position$jscomp$2$$ + $length$jscomp$21$$;
  var $oldContents$jscomp$inline_82_prevCapacity$jscomp$inline_81$$ = $node$jscomp$15_stream$jscomp$10$$.$contents$ ? $node$jscomp$15_stream$jscomp$10$$.$contents$.length : 0;
  $oldContents$jscomp$inline_82_prevCapacity$jscomp$inline_81$$ >= $canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$ || ($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$ = Math.max($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$, $oldContents$jscomp$inline_82_prevCapacity$jscomp$inline_81$$ * (1048576 > $oldContents$jscomp$inline_82_prevCapacity$jscomp$inline_81$$ ? 2 : 1.125) >>> 0), 0 != $oldContents$jscomp$inline_82_prevCapacity$jscomp$inline_81$$ && ($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$ = 
  Math.max($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$, 256)), $oldContents$jscomp$inline_82_prevCapacity$jscomp$inline_81$$ = $node$jscomp$15_stream$jscomp$10$$.$contents$, $node$jscomp$15_stream$jscomp$10$$.$contents$ = new Uint8Array($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$), 0 < $node$jscomp$15_stream$jscomp$10$$.$usedBytes$ && $node$jscomp$15_stream$jscomp$10$$.$contents$.set($oldContents$jscomp$inline_82_prevCapacity$jscomp$inline_81$$.subarray(0, $node$jscomp$15_stream$jscomp$10$$.$usedBytes$), 
  0));
  if ($node$jscomp$15_stream$jscomp$10$$.$contents$.subarray && $buffer$jscomp$21$$.subarray) {
    $node$jscomp$15_stream$jscomp$10$$.$contents$.set($buffer$jscomp$21$$.subarray($offset$jscomp$29$$, $offset$jscomp$29$$ + $length$jscomp$21$$), $position$jscomp$2$$);
  } else {
    for ($canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$ = 0; $canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$ < $length$jscomp$21$$; $canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$++) {
      $node$jscomp$15_stream$jscomp$10$$.$contents$[$position$jscomp$2$$ + $canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$] = $buffer$jscomp$21$$[$offset$jscomp$29$$ + $canOwn_i$jscomp$14_newCapacity$jscomp$inline_79$$];
    }
  }
  $node$jscomp$15_stream$jscomp$10$$.$usedBytes$ = Math.max($node$jscomp$15_stream$jscomp$10$$.$usedBytes$, $position$jscomp$2$$ + $length$jscomp$21$$);
  return $length$jscomp$21$$;
}, $llseek$($stream$jscomp$11$$, $offset$jscomp$30_position$jscomp$3$$, $whence$$) {
  1 === $whence$$ ? $offset$jscomp$30_position$jscomp$3$$ += $stream$jscomp$11$$.position : 2 === $whence$$ && 32768 === ($stream$jscomp$11$$.node.mode & 61440) && ($offset$jscomp$30_position$jscomp$3$$ += $stream$jscomp$11$$.node.$usedBytes$);
  if (0 > $offset$jscomp$30_position$jscomp$3$$) {
    throw new $FS$ErrnoError$$(28);
  }
  return $offset$jscomp$30_position$jscomp$3$$;
}, $mmap$($contents$jscomp$3_stream$jscomp$12$$, $length$jscomp$22$$, $position$jscomp$4$$, $allocated_prot$$, $flags$jscomp$6_ptr$jscomp$7$$) {
  if (32768 !== ($contents$jscomp$3_stream$jscomp$12$$.node.mode & 61440)) {
    throw new $FS$ErrnoError$$(43);
  }
  $contents$jscomp$3_stream$jscomp$12$$ = $contents$jscomp$3_stream$jscomp$12$$.node.$contents$;
  if ($flags$jscomp$6_ptr$jscomp$7$$ & 2 || !$contents$jscomp$3_stream$jscomp$12$$ || $contents$jscomp$3_stream$jscomp$12$$.buffer !== $HEAP8$$.buffer) {
    $allocated_prot$$ = !0;
    $flags$jscomp$6_ptr$jscomp$7$$ = $mmapAlloc$$($length$jscomp$22$$);
    if (!$flags$jscomp$6_ptr$jscomp$7$$) {
      throw new $FS$ErrnoError$$(48);
    }
    if ($contents$jscomp$3_stream$jscomp$12$$) {
      if (0 < $position$jscomp$4$$ || $position$jscomp$4$$ + $length$jscomp$22$$ < $contents$jscomp$3_stream$jscomp$12$$.length) {
        $contents$jscomp$3_stream$jscomp$12$$.subarray ? $contents$jscomp$3_stream$jscomp$12$$ = $contents$jscomp$3_stream$jscomp$12$$.subarray($position$jscomp$4$$, $position$jscomp$4$$ + $length$jscomp$22$$) : $contents$jscomp$3_stream$jscomp$12$$ = Array.prototype.slice.call($contents$jscomp$3_stream$jscomp$12$$, $position$jscomp$4$$, $position$jscomp$4$$ + $length$jscomp$22$$);
      }
      $HEAP8$$.set($contents$jscomp$3_stream$jscomp$12$$, $flags$jscomp$6_ptr$jscomp$7$$);
    }
  } else {
    $allocated_prot$$ = !1, $flags$jscomp$6_ptr$jscomp$7$$ = $contents$jscomp$3_stream$jscomp$12$$.byteOffset;
  }
  return {$ptr$:$flags$jscomp$6_ptr$jscomp$7$$, $allocated$:$allocated_prot$$};
}, $msync$($stream$jscomp$13$$, $buffer$jscomp$22$$, $offset$jscomp$31$$, $length$jscomp$23$$) {
  $MEMFS$$.$stream_ops$.write($stream$jscomp$13$$, $buffer$jscomp$22$$, 0, $length$jscomp$23$$, $offset$jscomp$31$$, !1);
  return 0;
}}}, $FS_getMode$$ = ($canRead$$, $canWrite$$) => {
  var $mode$jscomp$17$$ = 0;
  $canRead$$ && ($mode$jscomp$17$$ |= 365);
  $canWrite$$ && ($mode$jscomp$17$$ |= 146);
  return $mode$jscomp$17$$;
}, $ERRNO_CODES$$ = {EPERM:63, ENOENT:44, ESRCH:71, EINTR:27, EIO:29, ENXIO:60, E2BIG:1, ENOEXEC:45, EBADF:8, ECHILD:12, EAGAIN:6, EWOULDBLOCK:6, ENOMEM:48, EACCES:2, EFAULT:21, ENOTBLK:105, EBUSY:10, EEXIST:20, EXDEV:75, ENODEV:43, ENOTDIR:54, EISDIR:31, EINVAL:28, ENFILE:41, EMFILE:33, ENOTTY:59, ETXTBSY:74, EFBIG:22, ENOSPC:51, ESPIPE:70, EROFS:69, EMLINK:34, EPIPE:64, EDOM:18, ERANGE:68, ENOMSG:49, EIDRM:24, ECHRNG:106, EL2NSYNC:156, EL3HLT:107, EL3RST:108, ELNRNG:109, EUNATCH:110, ENOCSI:111, 
EL2HLT:112, EDEADLK:16, ENOLCK:46, EBADE:113, EBADR:114, EXFULL:115, ENOANO:104, EBADRQC:103, EBADSLT:102, EDEADLOCK:16, EBFONT:101, ENOSTR:100, ENODATA:116, ETIME:117, ENOSR:118, ENONET:119, ENOPKG:120, EREMOTE:121, ENOLINK:47, EADV:122, ESRMNT:123, ECOMM:124, EPROTO:65, EMULTIHOP:36, EDOTDOT:125, EBADMSG:9, ENOTUNIQ:126, EBADFD:127, EREMCHG:128, ELIBACC:129, ELIBBAD:130, ELIBSCN:131, ELIBMAX:132, ELIBEXEC:133, ENOSYS:52, ENOTEMPTY:55, ENAMETOOLONG:37, ELOOP:32, EOPNOTSUPP:138, EPFNOSUPPORT:139, 
ECONNRESET:15, ENOBUFS:42, EAFNOSUPPORT:5, EPROTOTYPE:67, ENOTSOCK:57, ENOPROTOOPT:50, ESHUTDOWN:140, ECONNREFUSED:14, EADDRINUSE:3, ECONNABORTED:13, ENETUNREACH:40, ENETDOWN:38, ETIMEDOUT:73, EHOSTDOWN:142, EHOSTUNREACH:23, EINPROGRESS:26, EALREADY:7, EDESTADDRREQ:17, EMSGSIZE:35, EPROTONOSUPPORT:66, ESOCKTNOSUPPORT:137, EADDRNOTAVAIL:4, ENETRESET:39, EISCONN:30, ENOTCONN:53, ETOOMANYREFS:141, EUSERS:136, EDQUOT:19, ESTALE:72, ENOTSUP:138, ENOMEDIUM:148, EILSEQ:25, EOVERFLOW:61, ECANCELED:11, ENOTRECOVERABLE:56, 
EOWNERDEAD:62, ESTRPIPE:135}, $asyncLoad$$ = async $url$jscomp$25$$ => {
  var $arrayBuffer$$ = await $readAsync$$($url$jscomp$25$$);
  $assert$$($arrayBuffer$$, `Loading data file "${$url$jscomp$25$$}" failed (no arrayBuffer).`);
  return new Uint8Array($arrayBuffer$$);
}, $runDependencies$$ = 0, $dependenciesFulfilled$$ = null, $runDependencyTracking$$ = {}, $runDependencyWatcher$$ = null, $removeRunDependency$$ = $callback$jscomp$58_id$jscomp$7$$ => {
  $runDependencies$$--;
  $Module$$.monitorRunDependencies?.($runDependencies$$);
  $assert$$($callback$jscomp$58_id$jscomp$7$$, "removeRunDependency requires an ID");
  $assert$$($runDependencyTracking$$[$callback$jscomp$58_id$jscomp$7$$]);
  delete $runDependencyTracking$$[$callback$jscomp$58_id$jscomp$7$$];
  0 == $runDependencies$$ && (null !== $runDependencyWatcher$$ && (clearInterval($runDependencyWatcher$$), $runDependencyWatcher$$ = null), $dependenciesFulfilled$$ && ($callback$jscomp$58_id$jscomp$7$$ = $dependenciesFulfilled$$, $dependenciesFulfilled$$ = null, $callback$jscomp$58_id$jscomp$7$$()));
}, $addRunDependency$$ = $id$jscomp$8$$ => {
  $runDependencies$$++;
  $Module$$.monitorRunDependencies?.($runDependencies$$);
  $assert$$($id$jscomp$8$$, "addRunDependency requires an ID");
  $assert$$(!$runDependencyTracking$$[$id$jscomp$8$$]);
  $runDependencyTracking$$[$id$jscomp$8$$] = 1;
  null === $runDependencyWatcher$$ && globalThis.setInterval && ($runDependencyWatcher$$ = setInterval(() => {
    if ($ABORT$$) {
      clearInterval($runDependencyWatcher$$), $runDependencyWatcher$$ = null;
    } else {
      var $shown$$ = !1, $dep$$;
      for ($dep$$ in $runDependencyTracking$$) {
        $shown$$ || ($shown$$ = !0, $err$$("still waiting on run dependencies:")), $err$$(`dependency: ${$dep$$}`);
      }
      $shown$$ && $err$$("(end of list)");
    }
  }, 1e4));
}, $preloadPlugins$$ = [], $FS_handledByPreloadPlugin$$ = async($byteArray$$, $fullname$$) => {
  if ("undefined" != typeof Browser) {
    var $JSCompiler_StaticMethods_init$self$jscomp$inline_84$$ = Browser;
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $JSCompiler_StaticMethods_init$self$jscomp$inline_84$$.$ptr$ + 16 >> 2, $___asan_storeN$$)] = 0;
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $JSCompiler_StaticMethods_init$self$jscomp$inline_84$$.$ptr$ + 4 >> 2, $___asan_storeN$$)] = void 0;
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $JSCompiler_StaticMethods_init$self$jscomp$inline_84$$.$ptr$ + 8 >> 2, $___asan_storeN$$)] = void 0;
  }
  for (var $plugin$$ of $preloadPlugins$$) {
    if ($plugin$$.canHandle($fullname$$)) {
      return $assert$$("AsyncFunction" === $plugin$$.handle.constructor.name, "Filesystem plugin handlers must be async functions (See #24914)"), $plugin$$.handle($byteArray$$, $fullname$$);
    }
  }
  return $byteArray$$;
}, $FS$root$$ = null, $FS$devices$$ = {}, $FS$streams$$ = [], $FS$nextInode$$ = 1, $FS$nameTable$$ = null, $FS$initialized$$ = !1, $FS$ignorePermissions$$ = !0, $FS$readFiles$$ = {}, $FS$ErrnoError$$ = class extends Error {
  name="ErrnoError";
  constructor($errno$jscomp$1$$) {
    super($runtimeInitialized$$ ? $UTF8ToString$$($_strerror$$($errno$jscomp$1$$)) : "");
    this.$errno$ = $errno$jscomp$1$$;
    for (var $key$jscomp$40$$ in $ERRNO_CODES$$) {
      if ($ERRNO_CODES$$[$key$jscomp$40$$] === $errno$jscomp$1$$) {
        this.code = $key$jscomp$40$$;
        break;
      }
    }
  }
}, $FS$FSStream$$ = class {
  $g$={};
  node=null;
  get flags() {
    return this.$g$.flags;
  }
  set flags($val$jscomp$4$$) {
    this.$g$.flags = $val$jscomp$4$$;
  }
  get position() {
    return this.$g$.position;
  }
  set position($val$jscomp$5$$) {
    this.$g$.position = $val$jscomp$5$$;
  }
}, $FS$FSNode$$ = class {
  $node_ops$={};
  $stream_ops$={};
  $mounted$=null;
  constructor($parent$jscomp$12$$, $name$jscomp$84$$, $mode$jscomp$18$$, $rdev$$) {
    $parent$jscomp$12$$ ||= this;
    this.parent = $parent$jscomp$12$$;
    this.$mount$ = $parent$jscomp$12$$.$mount$;
    this.id = $FS$nextInode$$++;
    this.name = $name$jscomp$84$$;
    this.mode = $mode$jscomp$18$$;
    this.$rdev$ = $rdev$$;
    this.$atime$ = this.$mtime$ = this.$ctime$ = Date.now();
  }
  get read() {
    return 365 === (this.mode & 365);
  }
  set read($val$jscomp$6$$) {
    $val$jscomp$6$$ ? this.mode |= 365 : this.mode &= -366;
  }
  get write() {
    return 146 === (this.mode & 146);
  }
  set write($val$jscomp$7$$) {
    $val$jscomp$7$$ ? this.mode |= 146 : this.mode &= -147;
  }
  get $isFolder$() {
    return $FS$isDir$$(this.mode);
  }
  get $isDevice$() {
    return 8192 === (this.mode & 61440);
  }
};
function $FS$lookupPath$$($parts$jscomp$1_path$jscomp$11$$, $opts$$ = {}) {
  if (!$parts$jscomp$1_path$jscomp$11$$) {
    throw new $FS$ErrnoError$$(44);
  }
  $opts$$.$follow_mount$ ?? ($opts$$.$follow_mount$ = !0);
  "/" === $parts$jscomp$1_path$jscomp$11$$.charAt(0) || ($parts$jscomp$1_path$jscomp$11$$ = "//" + $parts$jscomp$1_path$jscomp$11$$);
  var $nlinks$$ = 0;
  a: for (; 40 > $nlinks$$; $nlinks$$++) {
    $parts$jscomp$1_path$jscomp$11$$ = $parts$jscomp$1_path$jscomp$11$$.split("/").filter($p$jscomp$2$$ => !!$p$jscomp$2$$);
    for (var $current_link$$ = $FS$root$$, $current_path$$ = "/", $i$jscomp$15$$ = 0; $i$jscomp$15$$ < $parts$jscomp$1_path$jscomp$11$$.length; $i$jscomp$15$$++) {
      var $islast$$ = $i$jscomp$15$$ === $parts$jscomp$1_path$jscomp$11$$.length - 1;
      if ($islast$$ && $opts$$.parent) {
        break;
      }
      if ("." !== $parts$jscomp$1_path$jscomp$11$$[$i$jscomp$15$$]) {
        if (".." === $parts$jscomp$1_path$jscomp$11$$[$i$jscomp$15$$]) {
          if ($current_path$$ = $PATH$dirname$$($current_path$$), $current_link$$ === $current_link$$.parent) {
            $parts$jscomp$1_path$jscomp$11$$ = $current_path$$ + "/" + $parts$jscomp$1_path$jscomp$11$$.slice($i$jscomp$15$$ + 1).join("/");
            $nlinks$$--;
            continue a;
          } else {
            $current_link$$ = $current_link$$.parent;
          }
        } else {
          $current_path$$ = $PATH$normalize$$($current_path$$ + "/" + $parts$jscomp$1_path$jscomp$11$$[$i$jscomp$15$$]);
          try {
            $current_link$$ = $FS$lookupNode$$($current_link$$, $parts$jscomp$1_path$jscomp$11$$[$i$jscomp$15$$]);
          } catch ($e$jscomp$12$$) {
            if (44 === $e$jscomp$12$$?.$errno$ && $islast$$ && $opts$$.$noent_okay$) {
              return {path:$current_path$$};
            }
            throw $e$jscomp$12$$;
          }
          !$current_link$$.$mounted$ || $islast$$ && !$opts$$.$follow_mount$ || ($current_link$$ = $current_link$$.$mounted$.root);
          if (40960 === ($current_link$$.mode & 61440) && (!$islast$$ || $opts$$.$follow$)) {
            if (!$current_link$$.$node_ops$.$readlink$) {
              throw new $FS$ErrnoError$$(52);
            }
            $current_link$$ = $current_link$$.$node_ops$.$readlink$($current_link$$);
            "/" === $current_link$$.charAt(0) || ($current_link$$ = $PATH$dirname$$($current_path$$) + "/" + $current_link$$);
            $parts$jscomp$1_path$jscomp$11$$ = $current_link$$ + "/" + $parts$jscomp$1_path$jscomp$11$$.slice($i$jscomp$15$$ + 1).join("/");
            continue a;
          }
        }
      }
    }
    return {path:$current_path$$, node:$current_link$$};
  }
  throw new $FS$ErrnoError$$(32);
}
function $FS$getPath$$($mount$jscomp$1_node$jscomp$16$$) {
  for (var $path$jscomp$12$$;;) {
    if ($mount$jscomp$1_node$jscomp$16$$ === $mount$jscomp$1_node$jscomp$16$$.parent) {
      return $mount$jscomp$1_node$jscomp$16$$ = $mount$jscomp$1_node$jscomp$16$$.$mount$.$mountpoint$, $path$jscomp$12$$ ? "/" !== $mount$jscomp$1_node$jscomp$16$$[$mount$jscomp$1_node$jscomp$16$$.length - 1] ? `${$mount$jscomp$1_node$jscomp$16$$}/${$path$jscomp$12$$}` : $mount$jscomp$1_node$jscomp$16$$ + $path$jscomp$12$$ : $mount$jscomp$1_node$jscomp$16$$;
    }
    $path$jscomp$12$$ = $path$jscomp$12$$ ? `${$mount$jscomp$1_node$jscomp$16$$.name}/${$path$jscomp$12$$}` : $mount$jscomp$1_node$jscomp$16$$.name;
    $mount$jscomp$1_node$jscomp$16$$ = $mount$jscomp$1_node$jscomp$16$$.parent;
  }
}
function $FS$hashName$$($parentid$$, $name$jscomp$85$$) {
  for (var $hash$$ = 0, $i$jscomp$16$$ = 0; $i$jscomp$16$$ < $name$jscomp$85$$.length; $i$jscomp$16$$++) {
    $hash$$ = ($hash$$ << 5) - $hash$$ + $name$jscomp$85$$.charCodeAt($i$jscomp$16$$) | 0;
  }
  return ($parentid$$ + $hash$$ >>> 0) % $FS$nameTable$$.length;
}
function $FS$hashRemoveNode$$($node$jscomp$18$$) {
  var $current$jscomp$1_hash$jscomp$2$$ = $FS$hashName$$($node$jscomp$18$$.parent.id, $node$jscomp$18$$.name);
  if ($FS$nameTable$$[$current$jscomp$1_hash$jscomp$2$$] === $node$jscomp$18$$) {
    $FS$nameTable$$[$current$jscomp$1_hash$jscomp$2$$] = $node$jscomp$18$$.$name_next$;
  } else {
    for ($current$jscomp$1_hash$jscomp$2$$ = $FS$nameTable$$[$current$jscomp$1_hash$jscomp$2$$]; $current$jscomp$1_hash$jscomp$2$$;) {
      if ($current$jscomp$1_hash$jscomp$2$$.$name_next$ === $node$jscomp$18$$) {
        $current$jscomp$1_hash$jscomp$2$$.$name_next$ = $node$jscomp$18$$.$name_next$;
        break;
      }
      $current$jscomp$1_hash$jscomp$2$$ = $current$jscomp$1_hash$jscomp$2$$.$name_next$;
    }
  }
}
function $FS$lookupNode$$($parent$jscomp$13$$, $name$jscomp$86$$) {
  var $errCode_errCode$jscomp$inline_89_node$jscomp$19$$ = $FS$isDir$$($parent$jscomp$13$$.mode) ? ($errCode_errCode$jscomp$inline_89_node$jscomp$19$$ = $FS$nodePermissions$$($parent$jscomp$13$$, "x")) ? $errCode_errCode$jscomp$inline_89_node$jscomp$19$$ : $parent$jscomp$13$$.$node_ops$.$lookup$ ? 0 : 2 : 54;
  if ($errCode_errCode$jscomp$inline_89_node$jscomp$19$$) {
    throw new $FS$ErrnoError$$($errCode_errCode$jscomp$inline_89_node$jscomp$19$$);
  }
  for ($errCode_errCode$jscomp$inline_89_node$jscomp$19$$ = $FS$nameTable$$[$FS$hashName$$($parent$jscomp$13$$.id, $name$jscomp$86$$)]; $errCode_errCode$jscomp$inline_89_node$jscomp$19$$; $errCode_errCode$jscomp$inline_89_node$jscomp$19$$ = $errCode_errCode$jscomp$inline_89_node$jscomp$19$$.$name_next$) {
    var $nodeName$$ = $errCode_errCode$jscomp$inline_89_node$jscomp$19$$.name;
    if ($errCode_errCode$jscomp$inline_89_node$jscomp$19$$.parent.id === $parent$jscomp$13$$.id && $nodeName$$ === $name$jscomp$86$$) {
      return $errCode_errCode$jscomp$inline_89_node$jscomp$19$$;
    }
  }
  return $parent$jscomp$13$$.$node_ops$.$lookup$($parent$jscomp$13$$, $name$jscomp$86$$);
}
function $FS$createNode$$($node$jscomp$20_parent$jscomp$14$$, $hash$jscomp$inline_92_name$jscomp$87$$, $mode$jscomp$19$$, $rdev$jscomp$1$$) {
  $assert$$("object" == typeof $node$jscomp$20_parent$jscomp$14$$);
  $node$jscomp$20_parent$jscomp$14$$ = new $FS$FSNode$$($node$jscomp$20_parent$jscomp$14$$, $hash$jscomp$inline_92_name$jscomp$87$$, $mode$jscomp$19$$, $rdev$jscomp$1$$);
  $hash$jscomp$inline_92_name$jscomp$87$$ = $FS$hashName$$($node$jscomp$20_parent$jscomp$14$$.parent.id, $node$jscomp$20_parent$jscomp$14$$.name);
  $node$jscomp$20_parent$jscomp$14$$.$name_next$ = $FS$nameTable$$[$hash$jscomp$inline_92_name$jscomp$87$$];
  return $FS$nameTable$$[$hash$jscomp$inline_92_name$jscomp$87$$] = $node$jscomp$20_parent$jscomp$14$$;
}
function $FS$isDir$$($mode$jscomp$21$$) {
  return 16384 === ($mode$jscomp$21$$ & 61440);
}
function $FS$flagsToPermissionString$$($flag$jscomp$1$$) {
  var $perms$$ = ["r", "w", "rw"][$flag$jscomp$1$$ & 3];
  $flag$jscomp$1$$ & 512 && ($perms$$ += "w");
  return $perms$$;
}
function $FS$nodePermissions$$($node$jscomp$24$$, $perms$jscomp$1$$) {
  if ($FS$ignorePermissions$$) {
    return 0;
  }
  if (!$perms$jscomp$1$$.includes("r") || $node$jscomp$24$$.mode & 292) {
    if ($perms$jscomp$1$$.includes("w") && !($node$jscomp$24$$.mode & 146) || $perms$jscomp$1$$.includes("x") && !($node$jscomp$24$$.mode & 73)) {
      return 2;
    }
  } else {
    return 2;
  }
  return 0;
}
function $FS$mayCreate$$($dir$jscomp$2$$, $name$jscomp$88$$) {
  if (!$FS$isDir$$($dir$jscomp$2$$.mode)) {
    return 54;
  }
  try {
    return $FS$lookupNode$$($dir$jscomp$2$$, $name$jscomp$88$$), 20;
  } catch ($e$jscomp$13$$) {
  }
  return $FS$nodePermissions$$($dir$jscomp$2$$, "wx");
}
function $FS$checkOpExists$$($op$$) {
  if (!$op$$) {
    throw new $FS$ErrnoError$$(63);
  }
  return $op$$;
}
function $FS$getStreamChecked$$($fd$jscomp$1_stream$jscomp$14$$) {
  $fd$jscomp$1_stream$jscomp$14$$ = $FS$streams$$[$fd$jscomp$1_stream$jscomp$14$$];
  if (!$fd$jscomp$1_stream$jscomp$14$$) {
    throw new $FS$ErrnoError$$(8);
  }
  return $fd$jscomp$1_stream$jscomp$14$$;
}
function $FS$createStream$$($stream$jscomp$15$$, $fd$jscomp$3_fd$jscomp$inline_94$$ = -1) {
  $assert$$(-1 <= $fd$jscomp$3_fd$jscomp$inline_94$$);
  $stream$jscomp$15$$ = Object.assign(new $FS$FSStream$$(), $stream$jscomp$15$$);
  if (-1 == $fd$jscomp$3_fd$jscomp$inline_94$$) {
    a: {
      for ($fd$jscomp$3_fd$jscomp$inline_94$$ = 0; 4096 >= $fd$jscomp$3_fd$jscomp$inline_94$$; $fd$jscomp$3_fd$jscomp$inline_94$$++) {
        if (!$FS$streams$$[$fd$jscomp$3_fd$jscomp$inline_94$$]) {
          break a;
        }
      }
      throw new $FS$ErrnoError$$(33);
    }
  }
  $stream$jscomp$15$$.$fd$ = $fd$jscomp$3_fd$jscomp$inline_94$$;
  return $FS$streams$$[$fd$jscomp$3_fd$jscomp$inline_94$$] = $stream$jscomp$15$$;
}
function $FS$dupStream$$($origStream_stream$jscomp$16$$, $fd$jscomp$5$$ = -1) {
  $origStream_stream$jscomp$16$$ = $FS$createStream$$($origStream_stream$jscomp$16$$, $fd$jscomp$5$$);
  $origStream_stream$jscomp$16$$.$stream_ops$?.$dup$?.($origStream_stream$jscomp$16$$);
  return $origStream_stream$jscomp$16$$;
}
function $FS$doSetAttr$$($node$jscomp$28$$, $attr$jscomp$2$$) {
  var $setattr$$ = null?.$stream_ops$.$setattr$, $arg$jscomp$8$$ = $setattr$$ ? null : $node$jscomp$28$$;
  $setattr$$ ??= $node$jscomp$28$$.$node_ops$.$setattr$;
  $FS$checkOpExists$$($setattr$$);
  $setattr$$($arg$jscomp$8$$, $attr$jscomp$2$$);
}
var $FS$chrdev_stream_ops$$ = {open($stream$jscomp$18$$) {
  $stream$jscomp$18$$.$stream_ops$ = $FS$devices$$[$stream$jscomp$18$$.node.$rdev$].$stream_ops$;
  $stream$jscomp$18$$.$stream_ops$.open?.($stream$jscomp$18$$);
}, $llseek$() {
  throw new $FS$ErrnoError$$(70);
}};
function $FS$registerDevice$$($dev$jscomp$5$$, $ops$jscomp$1$$) {
  $FS$devices$$[$dev$jscomp$5$$] = {$stream_ops$:$ops$jscomp$1$$};
}
function $FS$mount$$($mountRoot_type$jscomp$171$$, $mount$jscomp$4_mountpoint$$) {
  if ("string" == typeof $mountRoot_type$jscomp$171$$) {
    throw $mountRoot_type$jscomp$171$$;
  }
  var $root$jscomp$4$$ = "/" === $mount$jscomp$4_mountpoint$$, $pseudo$$ = !$mount$jscomp$4_mountpoint$$;
  if ($root$jscomp$4$$ && $FS$root$$) {
    throw new $FS$ErrnoError$$(10);
  }
  if (!$root$jscomp$4$$ && !$pseudo$$) {
    var $lookup_node$jscomp$29$$ = $FS$lookupPath$$($mount$jscomp$4_mountpoint$$, {$follow_mount$:!1});
    $mount$jscomp$4_mountpoint$$ = $lookup_node$jscomp$29$$.path;
    $lookup_node$jscomp$29$$ = $lookup_node$jscomp$29$$.node;
    if ($lookup_node$jscomp$29$$.$mounted$) {
      throw new $FS$ErrnoError$$(10);
    }
    if (!$FS$isDir$$($lookup_node$jscomp$29$$.mode)) {
      throw new $FS$ErrnoError$$(54);
    }
  }
  $mount$jscomp$4_mountpoint$$ = {type:$mountRoot_type$jscomp$171$$, $opts$:{}, $mountpoint$:$mount$jscomp$4_mountpoint$$, $mounts$:[]};
  $mountRoot_type$jscomp$171$$ = $mountRoot_type$jscomp$171$$.$mount$($mount$jscomp$4_mountpoint$$);
  $mountRoot_type$jscomp$171$$.$mount$ = $mount$jscomp$4_mountpoint$$;
  $mount$jscomp$4_mountpoint$$.root = $mountRoot_type$jscomp$171$$;
  $root$jscomp$4$$ ? $FS$root$$ = $mountRoot_type$jscomp$171$$ : $lookup_node$jscomp$29$$ && ($lookup_node$jscomp$29$$.$mounted$ = $mount$jscomp$4_mountpoint$$, $lookup_node$jscomp$29$$.$mount$ && $lookup_node$jscomp$29$$.$mount$.$mounts$.push($mount$jscomp$4_mountpoint$$));
}
function $FS$mknod$$($name$jscomp$91_path$jscomp$13$$, $mode$jscomp$27$$, $dev$jscomp$7$$) {
  var $parent$jscomp$16$$ = $FS$lookupPath$$($name$jscomp$91_path$jscomp$13$$, {parent:!0}).node;
  $name$jscomp$91_path$jscomp$13$$ = $name$jscomp$91_path$jscomp$13$$ && $name$jscomp$91_path$jscomp$13$$.match(/([^\/]+|\/)\/*$/)[1];
  if (!$name$jscomp$91_path$jscomp$13$$) {
    throw new $FS$ErrnoError$$(28);
  }
  if ("." === $name$jscomp$91_path$jscomp$13$$ || ".." === $name$jscomp$91_path$jscomp$13$$) {
    throw new $FS$ErrnoError$$(20);
  }
  var $errCode$jscomp$5$$ = $FS$mayCreate$$($parent$jscomp$16$$, $name$jscomp$91_path$jscomp$13$$);
  if ($errCode$jscomp$5$$) {
    throw new $FS$ErrnoError$$($errCode$jscomp$5$$);
  }
  if (!$parent$jscomp$16$$.$node_ops$.$mknod$) {
    throw new $FS$ErrnoError$$(63);
  }
  return $parent$jscomp$16$$.$node_ops$.$mknod$($parent$jscomp$16$$, $name$jscomp$91_path$jscomp$13$$, $mode$jscomp$27$$, $dev$jscomp$7$$);
}
function $FS$create$$($path$jscomp$15$$, $mode$jscomp$28$$ = 438) {
  return $FS$mknod$$($path$jscomp$15$$, $mode$jscomp$28$$ & 4095 | 32768, 0);
}
function $FS$mkdir$$($path$jscomp$16$$, $mode$jscomp$29$$ = 511) {
  return $FS$mknod$$($path$jscomp$16$$, $mode$jscomp$29$$ & 1023 | 16384, 0);
}
function $FS$mkdev$$($path$jscomp$18$$, $mode$jscomp$31$$, $dev$jscomp$8$$) {
  "undefined" == typeof $dev$jscomp$8$$ && ($dev$jscomp$8$$ = $mode$jscomp$31$$, $mode$jscomp$31$$ = 438);
  return $FS$mknod$$($path$jscomp$18$$, $mode$jscomp$31$$ | 8192, $dev$jscomp$8$$);
}
function $FS$symlink$$($oldpath$jscomp$1$$, $newname$jscomp$1_newpath$$) {
  if (!$PATH_FS$resolve$$($oldpath$jscomp$1$$)) {
    throw new $FS$ErrnoError$$(44);
  }
  var $parent$jscomp$17$$ = $FS$lookupPath$$($newname$jscomp$1_newpath$$, {parent:!0}).node;
  if (!$parent$jscomp$17$$) {
    throw new $FS$ErrnoError$$(44);
  }
  $newname$jscomp$1_newpath$$ = $newname$jscomp$1_newpath$$ && $newname$jscomp$1_newpath$$.match(/([^\/]+|\/)\/*$/)[1];
  var $errCode$jscomp$6$$ = $FS$mayCreate$$($parent$jscomp$17$$, $newname$jscomp$1_newpath$$);
  if ($errCode$jscomp$6$$) {
    throw new $FS$ErrnoError$$($errCode$jscomp$6$$);
  }
  if (!$parent$jscomp$17$$.$node_ops$.$symlink$) {
    throw new $FS$ErrnoError$$(63);
  }
  $parent$jscomp$17$$.$node_ops$.$symlink$($parent$jscomp$17$$, $newname$jscomp$1_newpath$$, $oldpath$jscomp$1$$);
}
function $FS$unlink$$($name$jscomp$93_path$jscomp$21$$) {
  var $parent$jscomp$19$$ = $FS$lookupPath$$($name$jscomp$93_path$jscomp$21$$, {parent:!0}).node;
  if (!$parent$jscomp$19$$) {
    throw new $FS$ErrnoError$$(44);
  }
  $name$jscomp$93_path$jscomp$21$$ = $name$jscomp$93_path$jscomp$21$$ && $name$jscomp$93_path$jscomp$21$$.match(/([^\/]+|\/)\/*$/)[1];
  var $node$jscomp$34$$ = $FS$lookupNode$$($parent$jscomp$19$$, $name$jscomp$93_path$jscomp$21$$);
  a: {
    try {
      var $errCode$jscomp$9_node$jscomp$inline_383$$ = $FS$lookupNode$$($parent$jscomp$19$$, $name$jscomp$93_path$jscomp$21$$);
    } catch ($e$jscomp$inline_385$$) {
      $errCode$jscomp$9_node$jscomp$inline_383$$ = $e$jscomp$inline_385$$.$errno$;
      break a;
    }
    var $errCode$jscomp$inline_384$$ = $FS$nodePermissions$$($parent$jscomp$19$$, "wx");
    $errCode$jscomp$9_node$jscomp$inline_383$$ = $errCode$jscomp$inline_384$$ ? $errCode$jscomp$inline_384$$ : $FS$isDir$$($errCode$jscomp$9_node$jscomp$inline_383$$.mode) ? 31 : 0;
  }
  if ($errCode$jscomp$9_node$jscomp$inline_383$$) {
    throw new $FS$ErrnoError$$($errCode$jscomp$9_node$jscomp$inline_383$$);
  }
  if (!$parent$jscomp$19$$.$node_ops$.$unlink$) {
    throw new $FS$ErrnoError$$(63);
  }
  if ($node$jscomp$34$$.$mounted$) {
    throw new $FS$ErrnoError$$(10);
  }
  $parent$jscomp$19$$.$node_ops$.$unlink$($parent$jscomp$19$$, $name$jscomp$93_path$jscomp$21$$);
  $FS$hashRemoveNode$$($node$jscomp$34$$);
}
function $FS$stat$$($node$jscomp$35_path$jscomp$23$$, $dontFollow$$) {
  $node$jscomp$35_path$jscomp$23$$ = $FS$lookupPath$$($node$jscomp$35_path$jscomp$23$$, {$follow$:!$dontFollow$$}).node;
  return $FS$checkOpExists$$($node$jscomp$35_path$jscomp$23$$.$node_ops$.$getattr$)($node$jscomp$35_path$jscomp$23$$);
}
function $FS$chmod$$($node$jscomp$38_path$jscomp$25$$, $mode$jscomp$33$$) {
  $node$jscomp$38_path$jscomp$25$$ = "string" == typeof $node$jscomp$38_path$jscomp$25$$ ? $FS$lookupPath$$($node$jscomp$38_path$jscomp$25$$, {$follow$:!0}).node : $node$jscomp$38_path$jscomp$25$$;
  $FS$doSetAttr$$($node$jscomp$38_path$jscomp$25$$, {mode:$mode$jscomp$33$$ & 4095 | $node$jscomp$38_path$jscomp$25$$.mode & -4096, $ctime$:Date.now(), $dontFollow$:void 0});
}
function $FS$open$$($lookup$jscomp$14_path$jscomp$31$$, $JSCompiler_temp$jscomp$5_flags$jscomp$9$$, $mode$jscomp$36$$ = 438) {
  if ("" === $lookup$jscomp$14_path$jscomp$31$$) {
    throw new $FS$ErrnoError$$(44);
  }
  if ("string" == typeof $JSCompiler_temp$jscomp$5_flags$jscomp$9$$) {
    var $flags$jscomp$inline_104_node$jscomp$44$$ = {r:0, "r+":2, w:577, "w+":578, a:1089, "a+":1090}[$JSCompiler_temp$jscomp$5_flags$jscomp$9$$];
    if ("undefined" == typeof $flags$jscomp$inline_104_node$jscomp$44$$) {
      throw Error(`Unknown file open mode: ${$JSCompiler_temp$jscomp$5_flags$jscomp$9$$}`);
    }
    $JSCompiler_temp$jscomp$5_flags$jscomp$9$$ = $flags$jscomp$inline_104_node$jscomp$44$$;
  }
  $mode$jscomp$36$$ = $JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 64 ? $mode$jscomp$36$$ & 4095 | 32768 : 0;
  if ("object" == typeof $lookup$jscomp$14_path$jscomp$31$$) {
    $flags$jscomp$inline_104_node$jscomp$44$$ = $lookup$jscomp$14_path$jscomp$31$$;
  } else {
    var $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$ = $lookup$jscomp$14_path$jscomp$31$$.endsWith("/");
    $lookup$jscomp$14_path$jscomp$31$$ = $FS$lookupPath$$($lookup$jscomp$14_path$jscomp$31$$, {$follow$:!($JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 131072), $noent_okay$:!0});
    $flags$jscomp$inline_104_node$jscomp$44$$ = $lookup$jscomp$14_path$jscomp$31$$.node;
    $lookup$jscomp$14_path$jscomp$31$$ = $lookup$jscomp$14_path$jscomp$31$$.path;
  }
  var $created$$ = !1;
  if ($JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 64) {
    if ($flags$jscomp$inline_104_node$jscomp$44$$) {
      if ($JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 128) {
        throw new $FS$ErrnoError$$(20);
      }
    } else {
      if ($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$) {
        throw new $FS$ErrnoError$$(31);
      }
      $flags$jscomp$inline_104_node$jscomp$44$$ = $FS$mknod$$($lookup$jscomp$14_path$jscomp$31$$, $mode$jscomp$36$$ | 511, 0);
      $created$$ = !0;
    }
  }
  if (!$flags$jscomp$inline_104_node$jscomp$44$$) {
    throw new $FS$ErrnoError$$(44);
  }
  8192 === ($flags$jscomp$inline_104_node$jscomp$44$$.mode & 61440) && ($JSCompiler_temp$jscomp$5_flags$jscomp$9$$ &= -513);
  if ($JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 65536 && !$FS$isDir$$($flags$jscomp$inline_104_node$jscomp$44$$.mode)) {
    throw new $FS$ErrnoError$$(54);
  }
  if (!$created$$ && ($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$ = $flags$jscomp$inline_104_node$jscomp$44$$ ? 40960 === ($flags$jscomp$inline_104_node$jscomp$44$$.mode & 61440) ? 32 : $FS$isDir$$($flags$jscomp$inline_104_node$jscomp$44$$.mode) && ("r" !== $FS$flagsToPermissionString$$($JSCompiler_temp$jscomp$5_flags$jscomp$9$$) || $JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 576) ? 31 : $FS$nodePermissions$$($flags$jscomp$inline_104_node$jscomp$44$$, 
  $FS$flagsToPermissionString$$($JSCompiler_temp$jscomp$5_flags$jscomp$9$$)) : 44)) {
    throw new $FS$ErrnoError$$($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$);
  }
  if ($JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 512 && !$created$$) {
    $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$ = $flags$jscomp$inline_104_node$jscomp$44$$;
    $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$ = "string" == typeof $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$ ? $FS$lookupPath$$($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$, {$follow$:!0}).node : $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$;
    if ($FS$isDir$$($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$.mode)) {
      throw new $FS$ErrnoError$$(31);
    }
    if (32768 !== ($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$.mode & 61440)) {
      throw new $FS$ErrnoError$$(28);
    }
    var $errCode$jscomp$inline_389$$ = $FS$nodePermissions$$($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$, "w");
    if ($errCode$jscomp$inline_389$$) {
      throw new $FS$ErrnoError$$($errCode$jscomp$inline_389$$);
    }
    $FS$doSetAttr$$($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$, {size:0, timestamp:Date.now()});
  }
  $JSCompiler_temp$jscomp$5_flags$jscomp$9$$ &= -131713;
  $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$ = $FS$createStream$$({node:$flags$jscomp$inline_104_node$jscomp$44$$, path:$FS$getPath$$($flags$jscomp$inline_104_node$jscomp$44$$), flags:$JSCompiler_temp$jscomp$5_flags$jscomp$9$$, seekable:!0, position:0, $stream_ops$:$flags$jscomp$inline_104_node$jscomp$44$$.$stream_ops$, $ungotten$:[], error:!1});
  $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$.$stream_ops$.open && $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$.$stream_ops$.open($errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$);
  $created$$ && $FS$chmod$$($flags$jscomp$inline_104_node$jscomp$44$$, $mode$jscomp$36$$ & 511);
  !$Module$$.logReadFiles || $JSCompiler_temp$jscomp$5_flags$jscomp$9$$ & 1 || $lookup$jscomp$14_path$jscomp$31$$ in $FS$readFiles$$ || ($FS$readFiles$$[$lookup$jscomp$14_path$jscomp$31$$] = 1);
  return $errCode$jscomp$11_isDirPath_node$jscomp$inline_387_path$jscomp$inline_106_stream$jscomp$27$$;
}
function $FS$close$$($stream$jscomp$28$$) {
  if (null === $stream$jscomp$28$$.$fd$) {
    throw new $FS$ErrnoError$$(8);
  }
  $stream$jscomp$28$$.$getdents$ && ($stream$jscomp$28$$.$getdents$ = null);
  try {
    $stream$jscomp$28$$.$stream_ops$.close && $stream$jscomp$28$$.$stream_ops$.close($stream$jscomp$28$$);
  } catch ($e$jscomp$18$$) {
    throw $e$jscomp$18$$;
  } finally {
    $FS$streams$$[$stream$jscomp$28$$.$fd$] = null;
  }
  $stream$jscomp$28$$.$fd$ = null;
}
function $FS$llseek$$($stream$jscomp$30$$, $offset$jscomp$32$$, $whence$jscomp$1$$) {
  if (null === $stream$jscomp$30$$.$fd$) {
    throw new $FS$ErrnoError$$(8);
  }
  if (!$stream$jscomp$30$$.seekable || !$stream$jscomp$30$$.$stream_ops$.$llseek$) {
    throw new $FS$ErrnoError$$(70);
  }
  if (0 != $whence$jscomp$1$$ && 1 != $whence$jscomp$1$$ && 2 != $whence$jscomp$1$$) {
    throw new $FS$ErrnoError$$(28);
  }
  $stream$jscomp$30$$.position = $stream$jscomp$30$$.$stream_ops$.$llseek$($stream$jscomp$30$$, $offset$jscomp$32$$, $whence$jscomp$1$$);
  $stream$jscomp$30$$.$ungotten$ = [];
}
function $FS$write$$($stream$jscomp$32$$, $buffer$jscomp$24_bytesWritten$jscomp$1$$, $offset$jscomp$34$$, $length$jscomp$25$$, $position$jscomp$6$$, $canOwn$jscomp$3$$) {
  $assert$$(0 <= $offset$jscomp$34$$);
  if (0 > $length$jscomp$25$$ || 0 > $position$jscomp$6$$) {
    throw new $FS$ErrnoError$$(28);
  }
  if (null === $stream$jscomp$32$$.$fd$) {
    throw new $FS$ErrnoError$$(8);
  }
  if (0 === ($stream$jscomp$32$$.flags & 2097155)) {
    throw new $FS$ErrnoError$$(8);
  }
  if ($FS$isDir$$($stream$jscomp$32$$.node.mode)) {
    throw new $FS$ErrnoError$$(31);
  }
  if (!$stream$jscomp$32$$.$stream_ops$.write) {
    throw new $FS$ErrnoError$$(28);
  }
  $stream$jscomp$32$$.seekable && $stream$jscomp$32$$.flags & 1024 && $FS$llseek$$($stream$jscomp$32$$, 0, 2);
  var $seeking$jscomp$1$$ = "undefined" != typeof $position$jscomp$6$$;
  if (!$seeking$jscomp$1$$) {
    $position$jscomp$6$$ = $stream$jscomp$32$$.position;
  } else if (!$stream$jscomp$32$$.seekable) {
    throw new $FS$ErrnoError$$(70);
  }
  $buffer$jscomp$24_bytesWritten$jscomp$1$$ = $stream$jscomp$32$$.$stream_ops$.write($stream$jscomp$32$$, $buffer$jscomp$24_bytesWritten$jscomp$1$$, $offset$jscomp$34$$, $length$jscomp$25$$, $position$jscomp$6$$, $canOwn$jscomp$3$$);
  $seeking$jscomp$1$$ || ($stream$jscomp$32$$.position += $buffer$jscomp$24_bytesWritten$jscomp$1$$);
  return $buffer$jscomp$24_bytesWritten$jscomp$1$$;
}
function $FS$createPath$$($parent$jscomp$21$$, $parts$jscomp$2_path$jscomp$37$$) {
  $parent$jscomp$21$$ = "string" == typeof $parent$jscomp$21$$ ? $parent$jscomp$21$$ : $FS$getPath$$($parent$jscomp$21$$);
  for ($parts$jscomp$2_path$jscomp$37$$ = $parts$jscomp$2_path$jscomp$37$$.split("/").reverse(); $parts$jscomp$2_path$jscomp$37$$.length;) {
    var $part$$ = $parts$jscomp$2_path$jscomp$37$$.pop();
    if ($part$$) {
      var $current$jscomp$3$$ = $PATH$normalize$$($parent$jscomp$21$$ + "/" + $part$$);
      try {
        $FS$mkdir$$($current$jscomp$3$$);
      } catch ($e$jscomp$21$$) {
        if (20 != $e$jscomp$21$$.$errno$) {
          throw $e$jscomp$21$$;
        }
      }
      $parent$jscomp$21$$ = $current$jscomp$3$$;
    }
  }
  return $current$jscomp$3$$;
}
function $FS$createFile$$($parent$jscomp$22_path$jscomp$38$$, $name$jscomp$95$$, $canRead$jscomp$4$$, $canWrite$jscomp$4$$) {
  $parent$jscomp$22_path$jscomp$38$$ = $PATH$normalize$$(("string" == typeof $parent$jscomp$22_path$jscomp$38$$ ? $parent$jscomp$22_path$jscomp$38$$ : $FS$getPath$$($parent$jscomp$22_path$jscomp$38$$)) + "/" + $name$jscomp$95$$);
  return $FS$create$$($parent$jscomp$22_path$jscomp$38$$, $FS_getMode$$($canRead$jscomp$4$$, $canWrite$jscomp$4$$));
}
function $FS$createDataFile$$($mode$jscomp$38_parent$jscomp$23$$, $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$, $data$jscomp$83$$, $canRead$jscomp$5_i$jscomp$17$$, $canWrite$jscomp$5_len$jscomp$5$$, $canOwn$jscomp$4$$) {
  var $node$jscomp$46_path$jscomp$39$$ = $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$;
  $mode$jscomp$38_parent$jscomp$23$$ && ($mode$jscomp$38_parent$jscomp$23$$ = "string" == typeof $mode$jscomp$38_parent$jscomp$23$$ ? $mode$jscomp$38_parent$jscomp$23$$ : $FS$getPath$$($mode$jscomp$38_parent$jscomp$23$$), $node$jscomp$46_path$jscomp$39$$ = $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$ ? $PATH$normalize$$($mode$jscomp$38_parent$jscomp$23$$ + "/" + $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$) : $mode$jscomp$38_parent$jscomp$23$$);
  $mode$jscomp$38_parent$jscomp$23$$ = $FS_getMode$$($canRead$jscomp$5_i$jscomp$17$$, $canWrite$jscomp$5_len$jscomp$5$$);
  $node$jscomp$46_path$jscomp$39$$ = $FS$create$$($node$jscomp$46_path$jscomp$39$$, $mode$jscomp$38_parent$jscomp$23$$);
  if ($data$jscomp$83$$) {
    if ("string" == typeof $data$jscomp$83$$) {
      $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$ = Array($data$jscomp$83$$.length);
      $canRead$jscomp$5_i$jscomp$17$$ = 0;
      for ($canWrite$jscomp$5_len$jscomp$5$$ = $data$jscomp$83$$.length; $canRead$jscomp$5_i$jscomp$17$$ < $canWrite$jscomp$5_len$jscomp$5$$; ++$canRead$jscomp$5_i$jscomp$17$$) {
        $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$[$canRead$jscomp$5_i$jscomp$17$$] = $data$jscomp$83$$.charCodeAt($canRead$jscomp$5_i$jscomp$17$$);
      }
      $data$jscomp$83$$ = $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$;
    }
    $FS$chmod$$($node$jscomp$46_path$jscomp$39$$, $mode$jscomp$38_parent$jscomp$23$$ | 146);
    $arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$ = $FS$open$$($node$jscomp$46_path$jscomp$39$$, 577);
    $FS$write$$($arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$, $data$jscomp$83$$, 0, $data$jscomp$83$$.length, 0, $canOwn$jscomp$4$$);
    $FS$close$$($arr$jscomp$4_name$jscomp$96_stream$jscomp$41$$);
    $FS$chmod$$($node$jscomp$46_path$jscomp$39$$, $mode$jscomp$38_parent$jscomp$23$$);
  }
}
function $FS$createDevice$$($parent$jscomp$24_path$jscomp$40$$, $mode$jscomp$39_name$jscomp$97$$, $input$jscomp$11$$, $output$jscomp$4$$) {
  $parent$jscomp$24_path$jscomp$40$$ = $PATH$normalize$$(("string" == typeof $parent$jscomp$24_path$jscomp$40$$ ? $parent$jscomp$24_path$jscomp$40$$ : $FS$getPath$$($parent$jscomp$24_path$jscomp$40$$)) + "/" + $mode$jscomp$39_name$jscomp$97$$);
  $mode$jscomp$39_name$jscomp$97$$ = $FS_getMode$$(!!$input$jscomp$11$$, !!$output$jscomp$4$$);
  $FS$createDevice$$.$major$ ?? ($FS$createDevice$$.$major$ = 64);
  var $dev$jscomp$9$$ = $FS$createDevice$$.$major$++ << 8 | 0;
  $FS$registerDevice$$($dev$jscomp$9$$, {open($stream$jscomp$42$$) {
    $stream$jscomp$42$$.seekable = !1;
  }, close() {
    $output$jscomp$4$$?.buffer?.length && $output$jscomp$4$$(10);
  }, read($stream$jscomp$44$$, $buffer$jscomp$27$$, $offset$jscomp$37$$, $length$jscomp$30$$) {
    for (var $bytesRead$jscomp$2$$ = 0, $i$jscomp$18$$ = 0; $i$jscomp$18$$ < $length$jscomp$30$$; $i$jscomp$18$$++) {
      try {
        var $result$jscomp$6$$ = $input$jscomp$11$$();
      } catch ($e$jscomp$22$$) {
        throw new $FS$ErrnoError$$(29);
      }
      if (void 0 === $result$jscomp$6$$ && 0 === $bytesRead$jscomp$2$$) {
        throw new $FS$ErrnoError$$(6);
      }
      if (null === $result$jscomp$6$$ || void 0 === $result$jscomp$6$$) {
        break;
      }
      $bytesRead$jscomp$2$$++;
      $buffer$jscomp$27$$[$offset$jscomp$37$$ + $i$jscomp$18$$] = $result$jscomp$6$$;
    }
    $bytesRead$jscomp$2$$ && ($stream$jscomp$44$$.node.$atime$ = Date.now());
    return $bytesRead$jscomp$2$$;
  }, write($stream$jscomp$45$$, $buffer$jscomp$28$$, $offset$jscomp$38$$, $length$jscomp$31$$) {
    for (var $i$jscomp$19$$ = 0; $i$jscomp$19$$ < $length$jscomp$31$$; $i$jscomp$19$$++) {
      try {
        $output$jscomp$4$$($buffer$jscomp$28$$[$offset$jscomp$38$$ + $i$jscomp$19$$]);
      } catch ($e$jscomp$23$$) {
        throw new $FS$ErrnoError$$(29);
      }
    }
    $length$jscomp$31$$ && ($stream$jscomp$45$$.node.$mtime$ = $stream$jscomp$45$$.node.$ctime$ = Date.now());
    return $i$jscomp$19$$;
  }});
  return $FS$mkdev$$($parent$jscomp$24_path$jscomp$40$$, $mode$jscomp$39_name$jscomp$97$$, $dev$jscomp$9$$);
}
function $FS$forceLoadFile$$($obj$jscomp$29$$) {
  if (!($obj$jscomp$29$$.$isDevice$ || $obj$jscomp$29$$.$isFolder$ || $obj$jscomp$29$$.link || $obj$jscomp$29$$.$contents$)) {
    if (globalThis.XMLHttpRequest) {
      $abort$$("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
    } else {
      try {
        $obj$jscomp$29$$.$contents$ = (void 0)($obj$jscomp$29$$.url);
      } catch ($e$jscomp$24$$) {
        throw new $FS$ErrnoError$$(29);
      }
    }
  }
}
function $FS$createLazyFile$$($parent$jscomp$25_stream_ops$$, $name$jscomp$98$$, $url$jscomp$28$$, $canRead$jscomp$6$$, $canWrite$jscomp$6$$) {
  function $writeChunks$$($contents$jscomp$4_stream$jscomp$46$$, $buffer$jscomp$29$$, $offset$jscomp$39$$, $length$jscomp$32_size$jscomp$25$$, $position$jscomp$8$$) {
    $contents$jscomp$4_stream$jscomp$46$$ = $contents$jscomp$4_stream$jscomp$46$$.node.$contents$;
    if ($position$jscomp$8$$ >= $contents$jscomp$4_stream$jscomp$46$$.length) {
      return 0;
    }
    $length$jscomp$32_size$jscomp$25$$ = Math.min($contents$jscomp$4_stream$jscomp$46$$.length - $position$jscomp$8$$, $length$jscomp$32_size$jscomp$25$$);
    $assert$$(0 <= $length$jscomp$32_size$jscomp$25$$);
    if ($contents$jscomp$4_stream$jscomp$46$$.slice) {
      for (var $i$jscomp$20$$ = 0; $i$jscomp$20$$ < $length$jscomp$32_size$jscomp$25$$; $i$jscomp$20$$++) {
        $buffer$jscomp$29$$[$offset$jscomp$39$$ + $i$jscomp$20$$] = $contents$jscomp$4_stream$jscomp$46$$[$position$jscomp$8$$ + $i$jscomp$20$$];
      }
    } else {
      for ($i$jscomp$20$$ = 0; $i$jscomp$20$$ < $length$jscomp$32_size$jscomp$25$$; $i$jscomp$20$$++) {
        $buffer$jscomp$29$$[$offset$jscomp$39$$ + $i$jscomp$20$$] = $contents$jscomp$4_stream$jscomp$46$$.get($position$jscomp$8$$ + $i$jscomp$20$$);
      }
    }
    return $length$jscomp$32_size$jscomp$25$$;
  }
  class $LazyUint8Array$$ {
    $h$=!1;
    $g$=[];
    $getter$=void 0;
    $j$=0;
    $i$=0;
    get($idx$jscomp$3$$) {
      if (!($idx$jscomp$3$$ > this.length - 1 || 0 > $idx$jscomp$3$$)) {
        var $chunkOffset$$ = $idx$jscomp$3$$ % this.$m$;
        return this.$getter$($idx$jscomp$3$$ / this.$m$ | 0)[$chunkOffset$$];
      }
    }
    $o$($getter$$) {
      this.$getter$ = $getter$$;
    }
    $l$() {
      var $usesGzip_xhr$$ = new XMLHttpRequest();
      $usesGzip_xhr$$.open("HEAD", $url$jscomp$28$$, !1);
      $usesGzip_xhr$$.send(null);
      200 <= $usesGzip_xhr$$.status && 300 > $usesGzip_xhr$$.status || 304 === $usesGzip_xhr$$.status || $abort$$("Couldn't load " + $url$jscomp$28$$ + ". Status: " + $usesGzip_xhr$$.status);
      var $datalength$$ = Number($usesGzip_xhr$$.getResponseHeader("Content-length")), $header$jscomp$2$$, $hasByteServing$$ = ($header$jscomp$2$$ = $usesGzip_xhr$$.getResponseHeader("Accept-Ranges")) && "bytes" === $header$jscomp$2$$;
      $usesGzip_xhr$$ = ($header$jscomp$2$$ = $usesGzip_xhr$$.getResponseHeader("Content-Encoding")) && "gzip" === $header$jscomp$2$$;
      var $chunkSize$$ = 1048576;
      $hasByteServing$$ || ($chunkSize$$ = $datalength$$);
      var $lazyArray$jscomp$1$$ = this;
      $lazyArray$jscomp$1$$.$o$($chunkNum$jscomp$1$$ => {
        var $JSCompiler_inline_result$jscomp$12_start$jscomp$14$$ = $chunkNum$jscomp$1$$ * $chunkSize$$, $end$jscomp$12_to$jscomp$inline_120$$ = ($chunkNum$jscomp$1$$ + 1) * $chunkSize$$ - 1;
        $end$jscomp$12_to$jscomp$inline_120$$ = Math.min($end$jscomp$12_to$jscomp$inline_120$$, $datalength$$ - 1);
        if ("undefined" == typeof $lazyArray$jscomp$1$$.$g$[$chunkNum$jscomp$1$$]) {
          var $JSCompiler_temp_const$jscomp$11$$ = $lazyArray$jscomp$1$$.$g$;
          $JSCompiler_inline_result$jscomp$12_start$jscomp$14$$ > $end$jscomp$12_to$jscomp$inline_120$$ && $abort$$("invalid range (" + $JSCompiler_inline_result$jscomp$12_start$jscomp$14$$ + ", " + $end$jscomp$12_to$jscomp$inline_120$$ + ") or no bytes requested!");
          $end$jscomp$12_to$jscomp$inline_120$$ > $datalength$$ - 1 && $abort$$("only " + $datalength$$ + " bytes available! programmer error!");
          var $xhr$jscomp$inline_121$$ = new XMLHttpRequest();
          $xhr$jscomp$inline_121$$.open("GET", $url$jscomp$28$$, !1);
          $datalength$$ !== $chunkSize$$ && $xhr$jscomp$inline_121$$.setRequestHeader("Range", "bytes=" + $JSCompiler_inline_result$jscomp$12_start$jscomp$14$$ + "-" + $end$jscomp$12_to$jscomp$inline_120$$);
          $xhr$jscomp$inline_121$$.responseType = "arraybuffer";
          $xhr$jscomp$inline_121$$.overrideMimeType && $xhr$jscomp$inline_121$$.overrideMimeType("text/plain; charset=x-user-defined");
          $xhr$jscomp$inline_121$$.send(null);
          200 <= $xhr$jscomp$inline_121$$.status && 300 > $xhr$jscomp$inline_121$$.status || 304 === $xhr$jscomp$inline_121$$.status || $abort$$("Couldn't load " + $url$jscomp$28$$ + ". Status: " + $xhr$jscomp$inline_121$$.status);
          $JSCompiler_inline_result$jscomp$12_start$jscomp$14$$ = void 0 !== $xhr$jscomp$inline_121$$.response ? new Uint8Array($xhr$jscomp$inline_121$$.response || []) : $intArrayFromString$$($xhr$jscomp$inline_121$$.responseText || "");
          $JSCompiler_temp_const$jscomp$11$$[$chunkNum$jscomp$1$$] = $JSCompiler_inline_result$jscomp$12_start$jscomp$14$$;
        }
        "undefined" == typeof $lazyArray$jscomp$1$$.$g$[$chunkNum$jscomp$1$$] && $abort$$("doXHR failed!");
        return $lazyArray$jscomp$1$$.$g$[$chunkNum$jscomp$1$$];
      });
      if ($usesGzip_xhr$$ || !$datalength$$) {
        $chunkSize$$ = $datalength$$ = 1, $chunkSize$$ = $datalength$$ = this.$getter$(0).length, $out$$("LazyFiles on gzip forces download of the whole file when length is accessed");
      }
      this.$j$ = $datalength$$;
      this.$i$ = $chunkSize$$;
      this.$h$ = !0;
    }
    get length() {
      this.$h$ || this.$l$();
      return this.$j$;
    }
    get $m$() {
      this.$h$ || this.$l$();
      return this.$i$;
    }
  }
  if (globalThis.XMLHttpRequest) {
    $abort$$("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");
    var $JSCompiler_object_inline_contents_360$$ = new $LazyUint8Array$$();
    var $JSCompiler_object_inline_url_361$$ = void 0;
  } else {
    $JSCompiler_object_inline_url_361$$ = $url$jscomp$28$$, $JSCompiler_object_inline_contents_360$$ = void 0;
  }
  var $node$jscomp$47$$ = $FS$createFile$$($parent$jscomp$25_stream_ops$$, $name$jscomp$98$$, $canRead$jscomp$6$$, $canWrite$jscomp$6$$);
  $JSCompiler_object_inline_contents_360$$ ? $node$jscomp$47$$.$contents$ = $JSCompiler_object_inline_contents_360$$ : $JSCompiler_object_inline_url_361$$ && ($node$jscomp$47$$.$contents$ = null, $node$jscomp$47$$.url = $JSCompiler_object_inline_url_361$$);
  Object.defineProperties($node$jscomp$47$$, {$usedBytes$:{get:function() {
    return this.$contents$.length;
  }}});
  $parent$jscomp$25_stream_ops$$ = {};
  for (const [$key$jscomp$41$$, $fn$$] of Object.entries($node$jscomp$47$$.$stream_ops$)) {
    $parent$jscomp$25_stream_ops$$[$key$jscomp$41$$] = (...$args$jscomp$7$$) => {
      $FS$forceLoadFile$$($node$jscomp$47$$);
      return $fn$$(...$args$jscomp$7$$);
    };
  }
  $parent$jscomp$25_stream_ops$$.read = ($stream$jscomp$47$$, $buffer$jscomp$30$$, $offset$jscomp$40$$, $length$jscomp$33$$, $position$jscomp$9$$) => {
    $FS$forceLoadFile$$($node$jscomp$47$$);
    return $writeChunks$$($stream$jscomp$47$$, $buffer$jscomp$30$$, $offset$jscomp$40$$, $length$jscomp$33$$, $position$jscomp$9$$);
  };
  $parent$jscomp$25_stream_ops$$.$mmap$ = ($stream$jscomp$48$$, $length$jscomp$34$$, $position$jscomp$10$$) => {
    $FS$forceLoadFile$$($node$jscomp$47$$);
    var $ptr$jscomp$8$$ = $mmapAlloc$$($length$jscomp$34$$);
    if (!$ptr$jscomp$8$$) {
      throw new $FS$ErrnoError$$(48);
    }
    $writeChunks$$($stream$jscomp$48$$, $HEAP8$$, $ptr$jscomp$8$$, $length$jscomp$34$$, $position$jscomp$10$$);
    return {$ptr$:$ptr$jscomp$8$$, $allocated$:!0};
  };
  $node$jscomp$47$$.$stream_ops$ = $parent$jscomp$25_stream_ops$$;
  return $node$jscomp$47$$;
}
var $FS$$ = {};
function $SYSCALLS$calculateAt$$($dir$jscomp$5_dirfd$$, $path$jscomp$41$$, $allowEmpty$$) {
  if ("/" === $path$jscomp$41$$.charAt(0)) {
    return $path$jscomp$41$$;
  }
  $dir$jscomp$5_dirfd$$ = -100 === $dir$jscomp$5_dirfd$$ ? "/" : $FS$getStreamChecked$$($dir$jscomp$5_dirfd$$).path;
  if (0 == $path$jscomp$41$$.length) {
    if (!$allowEmpty$$) {
      throw new $FS$ErrnoError$$(44);
    }
    return $dir$jscomp$5_dirfd$$;
  }
  return $dir$jscomp$5_dirfd$$ + "/" + $path$jscomp$41$$;
}
function $SYSCALLS$writeStat$$($buf$jscomp$1$$, $stat$jscomp$1$$) {
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ >> 2, $___asan_storeN$$)] = $stat$jscomp$1$$.$dev$;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 4 >> 2, $___asan_storeN$$)] = $stat$jscomp$1$$.mode;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 8 >> 2, $___asan_storeN$$)] = $stat$jscomp$1$$.$nlink$;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 12 >> 2, $___asan_storeN$$)] = $stat$jscomp$1$$.uid;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 16 >> 2, $___asan_storeN$$)] = $stat$jscomp$1$$.$gid$;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 20 >> 2, $___asan_storeN$$)] = $stat$jscomp$1$$.$rdev$;
  $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $buf$jscomp$1$$ + 24 >> 3, $___asan_storeN$$)] = BigInt($stat$jscomp$1$$.size);
  $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $buf$jscomp$1$$ + 32 >> 2, $___asan_storeN$$)] = 4096;
  $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $buf$jscomp$1$$ + 36 >> 2, $___asan_storeN$$)] = $stat$jscomp$1$$.$blocks$;
  var $atime$jscomp$1$$ = $stat$jscomp$1$$.$atime$.getTime(), $mtime$jscomp$1$$ = $stat$jscomp$1$$.$mtime$.getTime(), $ctime$$ = $stat$jscomp$1$$.$ctime$.getTime();
  $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $buf$jscomp$1$$ + 40 >> 3, $___asan_storeN$$)] = BigInt(Math.floor($atime$jscomp$1$$ / 1e3));
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 48 >> 2, $___asan_storeN$$)] = $atime$jscomp$1$$ % 1e3 * 1E6;
  $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $buf$jscomp$1$$ + 56 >> 3, $___asan_storeN$$)] = BigInt(Math.floor($mtime$jscomp$1$$ / 1e3));
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 64 >> 2, $___asan_storeN$$)] = $mtime$jscomp$1$$ % 1e3 * 1E6;
  $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $buf$jscomp$1$$ + 72 >> 3, $___asan_storeN$$)] = BigInt(Math.floor($ctime$$ / 1e3));
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $buf$jscomp$1$$ + 80 >> 2, $___asan_storeN$$)] = $ctime$$ % 1e3 * 1E6;
  $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $buf$jscomp$1$$ + 88 >> 3, $___asan_storeN$$)] = BigInt($stat$jscomp$1$$.$ino$);
  return 0;
}
var $SYSCALLS$varargs$$ = void 0, $syscallGetVarargI$$ = () => {
  $assert$$(void 0 != $SYSCALLS$varargs$$);
  var $ret$jscomp$4$$ = $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, +$SYSCALLS$varargs$$ >> 2, $___asan_loadN$$)];
  $SYSCALLS$varargs$$ += 4;
  return $ret$jscomp$4$$;
}, $structRegistrations$$ = {}, $runDestructors$$ = $destructors$$ => {
  for (; $destructors$$.length;) {
    var $ptr$jscomp$10$$ = $destructors$$.pop();
    $destructors$$.pop()($ptr$jscomp$10$$);
  }
};
function $readPointer$$($pointer$$) {
  return this.$fromWireType$($HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $pointer$$ >> 2, $___asan_loadN$$)]);
}
var $awaitingDependencies$$ = {}, $registeredTypes$$ = {}, $typeDependencies$$ = {}, $InternalError$$ = class extends Error {
  constructor($message$jscomp$40$$) {
    super($message$jscomp$40$$);
    this.name = "InternalError";
  }
}, $whenDependentTypesAreResolved$$ = ($myTypes$$, $dependentTypes$$, $getTypeConverters$$) => {
  function $onComplete$$($myTypeConverters_typeConverters$jscomp$1$$) {
    $myTypeConverters_typeConverters$jscomp$1$$ = $getTypeConverters$$($myTypeConverters_typeConverters$jscomp$1$$);
    if ($myTypeConverters_typeConverters$jscomp$1$$.length !== $myTypes$$.length) {
      throw new $InternalError$$("Mismatched type converter count");
    }
    for (var $i$jscomp$22$$ = 0; $i$jscomp$22$$ < $myTypes$$.length; ++$i$jscomp$22$$) {
      $registerType$$($myTypes$$[$i$jscomp$22$$], $myTypeConverters_typeConverters$jscomp$1$$[$i$jscomp$22$$]);
    }
  }
  $myTypes$$.forEach($type$jscomp$172$$ => $typeDependencies$$[$type$jscomp$172$$] = $dependentTypes$$);
  var $typeConverters$$ = Array($dependentTypes$$.length), $unregisteredTypes$$ = [], $registered$$ = 0;
  for (let [$i$jscomp$23$$, $dt$$] of $dependentTypes$$.entries()) {
    $registeredTypes$$.hasOwnProperty($dt$$) ? $typeConverters$$[$i$jscomp$23$$] = $registeredTypes$$[$dt$$] : ($unregisteredTypes$$.push($dt$$), $awaitingDependencies$$.hasOwnProperty($dt$$) || ($awaitingDependencies$$[$dt$$] = []), $awaitingDependencies$$[$dt$$].push(() => {
      $typeConverters$$[$i$jscomp$23$$] = $registeredTypes$$[$dt$$];
      ++$registered$$;
      $registered$$ === $unregisteredTypes$$.length && $onComplete$$($typeConverters$$);
    }));
  }
  0 === $unregisteredTypes$$.length && $onComplete$$($typeConverters$$);
}, $AsciiToString$$ = $ptr$jscomp$15$$ => {
  for (var $str$jscomp$11$$ = "";;) {
    var $ch$jscomp$1$$ = $HEAPU8$$[$_asan_js_check_index$$($HEAPU8$$, $ptr$jscomp$15$$++, $___asan_loadN$$)];
    if (!$ch$jscomp$1$$) {
      return $str$jscomp$11$$;
    }
    $str$jscomp$11$$ += String.fromCharCode($ch$jscomp$1$$);
  }
}, $BindingError$$ = class extends Error {
  constructor($message$jscomp$42$$) {
    super($message$jscomp$42$$);
    this.name = "BindingError";
  }
}, $throwBindingError$$ = $message$jscomp$43$$ => {
  throw new $BindingError$$($message$jscomp$43$$);
};
function $sharedRegisterType$$($rawType$$, $callbacks$jscomp$1_registeredInstance$$, $options$jscomp$67$$ = {}) {
  var $name$jscomp$99$$ = $callbacks$jscomp$1_registeredInstance$$.name;
  if (!$rawType$$) {
    throw new $BindingError$$(`type "${$name$jscomp$99$$}" must have a positive integer typeid pointer`);
  }
  if ($registeredTypes$$.hasOwnProperty($rawType$$)) {
    if ($options$jscomp$67$$.$ignoreDuplicateRegistrations$) {
      return;
    }
    throw new $BindingError$$(`Cannot register type '${$name$jscomp$99$$}' twice`);
  }
  $registeredTypes$$[$rawType$$] = $callbacks$jscomp$1_registeredInstance$$;
  delete $typeDependencies$$[$rawType$$];
  $awaitingDependencies$$.hasOwnProperty($rawType$$) && ($callbacks$jscomp$1_registeredInstance$$ = $awaitingDependencies$$[$rawType$$], delete $awaitingDependencies$$[$rawType$$], $callbacks$jscomp$1_registeredInstance$$.forEach($cb$jscomp$2$$ => $cb$jscomp$2$$()));
}
function $registerType$$($rawType$jscomp$1$$, $registeredInstance$jscomp$1$$, $options$jscomp$68$$ = {}) {
  return $sharedRegisterType$$($rawType$jscomp$1$$, $registeredInstance$jscomp$1$$, $options$jscomp$68$$);
}
var $integerReadValueFromPointer$$ = ($name$jscomp$100$$, $width$jscomp$28$$, $signed$$) => {
  switch($width$jscomp$28$$) {
    case 1:
      return $signed$$ ? $pointer$jscomp$1$$ => $HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $pointer$jscomp$1$$, $___asan_loadN$$)] : $pointer$jscomp$2$$ => $HEAPU8$$[$_asan_js_check_index$$($HEAPU8$$, $pointer$jscomp$2$$, $___asan_loadN$$)];
    case 2:
      return $signed$$ ? $pointer$jscomp$3$$ => $HEAP16$$[$_asan_js_check_index$$($HEAP16$$, $pointer$jscomp$3$$ >> 1, $___asan_loadN$$)] : $pointer$jscomp$4$$ => $HEAPU16$$[$_asan_js_check_index$$($HEAPU16$$, $pointer$jscomp$4$$ >> 1, $___asan_loadN$$)];
    case 4:
      return $signed$$ ? $pointer$jscomp$5$$ => $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $pointer$jscomp$5$$ >> 2, $___asan_loadN$$)] : $pointer$jscomp$6$$ => $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $pointer$jscomp$6$$ >> 2, $___asan_loadN$$)];
    case 8:
      return $signed$$ ? $pointer$jscomp$7$$ => $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $pointer$jscomp$7$$ >> 3, $___asan_loadN$$)] : $pointer$jscomp$8$$ => $HEAPU64$$[$_asan_js_check_index$$($HEAPU64$$, $pointer$jscomp$8$$ >> 3, $___asan_loadN$$)];
    default:
      throw new TypeError(`invalid integer width (${$width$jscomp$28$$}): ${$name$jscomp$100$$}`);
  }
}, $embindRepr$$ = $v$jscomp$2$$ => {
  if (null === $v$jscomp$2$$) {
    return "null";
  }
  var $t$$ = typeof $v$jscomp$2$$;
  return "object" === $t$$ || "array" === $t$$ || "function" === $t$$ ? $v$jscomp$2$$.toString() : "" + $v$jscomp$2$$;
}, $assertIntegerRange$$ = ($typeName$$, $value$jscomp$96$$, $minRange$$, $maxRange$$) => {
  if ($value$jscomp$96$$ < $minRange$$ || $value$jscomp$96$$ > $maxRange$$) {
    throw new TypeError(`Passing a number "${$embindRepr$$($value$jscomp$96$$)}" from JS side to C/C++ side to an argument of type "${$typeName$$}", which is outside the valid range [${$minRange$$}, ${$maxRange$$}]!`);
  }
}, $throwInstanceAlreadyDeleted$$ = $obj$jscomp$30$$ => {
  throw new $BindingError$$($obj$jscomp$30$$.$$$$.$ptrType$.$registeredClass$.name + " instance already deleted");
}, $finalizationRegistry$$ = !1, $detachFinalizer$$ = () => {
}, $downcastPointer$$ = ($ptr$jscomp$16_rv$jscomp$1$$, $ptrClass$$, $desiredClass$$) => {
  if ($ptrClass$$ === $desiredClass$$) {
    return $ptr$jscomp$16_rv$jscomp$1$$;
  }
  if (void 0 === $desiredClass$$.$baseClass$) {
    return null;
  }
  $ptr$jscomp$16_rv$jscomp$1$$ = $downcastPointer$$($ptr$jscomp$16_rv$jscomp$1$$, $ptrClass$$, $desiredClass$$.$baseClass$);
  return null === $ptr$jscomp$16_rv$jscomp$1$$ ? null : $desiredClass$$.$downcast$($ptr$jscomp$16_rv$jscomp$1$$);
}, $registeredPointers$$ = {}, $registeredInstances$$ = {}, $getInheritedInstance$$ = ($class_$jscomp$1_class_$jscomp$inline_131$$, $ptr$jscomp$18_ptr$jscomp$inline_132$$) => {
  if (void 0 === $ptr$jscomp$18_ptr$jscomp$inline_132$$) {
    throw new $BindingError$$("ptr should not be undefined");
  }
  for (; $class_$jscomp$1_class_$jscomp$inline_131$$.$baseClass$;) {
    $ptr$jscomp$18_ptr$jscomp$inline_132$$ = $class_$jscomp$1_class_$jscomp$inline_131$$.$upcast$($ptr$jscomp$18_ptr$jscomp$inline_132$$), $class_$jscomp$1_class_$jscomp$inline_131$$ = $class_$jscomp$1_class_$jscomp$inline_131$$.$baseClass$;
  }
  return $registeredInstances$$[$ptr$jscomp$18_ptr$jscomp$inline_132$$];
}, $makeClassHandle$$ = ($prototype$$, $record$$) => {
  if (!$record$$.$ptrType$ || !$record$$.$ptr$) {
    throw new $InternalError$$("makeClassHandle requires ptr and ptrType");
  }
  if (!!$record$$.$smartPtrType$ !== !!$record$$.$smartPtr$) {
    throw new $InternalError$$("Both smartPtrType and smartPtr must be specified");
  }
  $record$$.count = {value:1};
  return $attachFinalizer$$(Object.create($prototype$$, {$$$$:{value:$record$$, writable:!0}}));
};
function $RegisteredPointer_fromWireType$$($ptr$jscomp$19$$) {
  function $makeDefaultHandle$$() {
    return this.$isSmartPointer$ ? $makeClassHandle$$(this.$registeredClass$.$instancePrototype$, {$ptrType$:this.$pointeeType$, $ptr$:$rawPointer$$, $smartPtrType$:this, $smartPtr$:$ptr$jscomp$19$$}) : $makeClassHandle$$(this.$registeredClass$.$instancePrototype$, {$ptrType$:this, $ptr$:$ptr$jscomp$19$$});
  }
  var $rawPointer$$ = this.$getPointee$($ptr$jscomp$19$$);
  if (!$rawPointer$$) {
    return this.$destructor$($ptr$jscomp$19$$), null;
  }
  var $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$ = $getInheritedInstance$$(this.$registeredClass$, $rawPointer$$);
  if (void 0 !== $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$) {
    if (0 === $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.$$$$.count.value) {
      return $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.$$$$.$ptr$ = $rawPointer$$, $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.$$$$.$smartPtr$ = $ptr$jscomp$19$$, $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.clone();
    }
    $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$ = $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.clone();
    this.$destructor$($ptr$jscomp$19$$);
    return $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$;
  }
  $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$ = this.$registeredClass$.$getActualType$($rawPointer$$);
  $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$ = $registeredPointers$$[$actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$];
  if (!$actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$) {
    return $makeDefaultHandle$$.call(this);
  }
  $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$ = this.$isConst$ ? $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.$constPointerType$ : $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.pointerType;
  var $dp$$ = $downcastPointer$$($rawPointer$$, this.$registeredClass$, $actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.$registeredClass$);
  return null === $dp$$ ? $makeDefaultHandle$$.call(this) : this.$isSmartPointer$ ? $makeClassHandle$$($actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.$registeredClass$.$instancePrototype$, {$ptrType$:$actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$, $ptr$:$dp$$, $smartPtrType$:this, $smartPtr$:$ptr$jscomp$19$$}) : $makeClassHandle$$($actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$.$registeredClass$.$instancePrototype$, 
  {$ptrType$:$actualType_registeredInstance$jscomp$2_registeredPointerRecord_rv$jscomp$2_toType$$, $ptr$:$dp$$});
}
var $attachFinalizer$$ = $handle$jscomp$14$$ => {
  if (!globalThis.FinalizationRegistry) {
    return $attachFinalizer$$ = $handle$jscomp$15$$ => $handle$jscomp$15$$, $handle$jscomp$14$$;
  }
  $finalizationRegistry$$ = new FinalizationRegistry($$$$jscomp$inline_138_info$jscomp$2$$ => {
    console.warn($$$$jscomp$inline_138_info$jscomp$2$$.$leakWarning$);
    $$$$jscomp$inline_138_info$jscomp$2$$ = $$$$jscomp$inline_138_info$jscomp$2$$.$$$$;
    --$$$$jscomp$inline_138_info$jscomp$2$$.count.value;
    0 === $$$$jscomp$inline_138_info$jscomp$2$$.count.value && ($$$$jscomp$inline_138_info$jscomp$2$$.$smartPtr$ ? $$$$jscomp$inline_138_info$jscomp$2$$.$smartPtrType$.$rawDestructor$($$$$jscomp$inline_138_info$jscomp$2$$.$smartPtr$) : $$$$jscomp$inline_138_info$jscomp$2$$.$ptrType$.$registeredClass$.$rawDestructor$($$$$jscomp$inline_138_info$jscomp$2$$.$ptr$));
  });
  $attachFinalizer$$ = $handle$jscomp$16$$ => {
    var $$$$jscomp$2_err$jscomp$5$$ = $handle$jscomp$16$$.$$$$;
    if ($$$$jscomp$2_err$jscomp$5$$.$smartPtr$) {
      var $info$jscomp$3$$ = {$$$$:$$$$jscomp$2_err$jscomp$5$$};
      $$$$jscomp$2_err$jscomp$5$$ = Error(`Embind found a leaked C++ instance ${$$$$jscomp$2_err$jscomp$5$$.$ptrType$.$registeredClass$.name} <${$ptrToString$$($$$$jscomp$2_err$jscomp$5$$.$ptr$)}>.\n` + "We'll free it automatically in this case, but this functionality is not reliable across various environments.\nMake sure to invoke .delete() manually once you're done with the instance instead.\nOriginally allocated");
      "captureStackTrace" in Error && Error.captureStackTrace($$$$jscomp$2_err$jscomp$5$$, $RegisteredPointer_fromWireType$$);
      $info$jscomp$3$$.$leakWarning$ = $$$$jscomp$2_err$jscomp$5$$.stack.replace(/^Error: /, "");
      $finalizationRegistry$$.register($handle$jscomp$16$$, $info$jscomp$3$$, $handle$jscomp$16$$);
    }
    return $handle$jscomp$16$$;
  };
  $detachFinalizer$$ = $handle$jscomp$17$$ => {
    $finalizationRegistry$$.unregister($handle$jscomp$17$$);
  };
  return $attachFinalizer$$($handle$jscomp$14$$);
}, $deletionQueue$$ = [];
function $ClassHandle$$() {
}
var $createNamedFunction$$ = ($name$jscomp$103$$, $func$jscomp$8$$) => Object.defineProperty($func$jscomp$8$$, "name", {value:$name$jscomp$103$$}), $ensureOverloadTable$$ = ($proto$jscomp$4$$, $methodName$$, $humanName$$) => {
  if (void 0 === $proto$jscomp$4$$[$methodName$$].$overloadTable$) {
    var $prevFunc$$ = $proto$jscomp$4$$[$methodName$$];
    $proto$jscomp$4$$[$methodName$$] = function(...$args$jscomp$8$$) {
      if (!$proto$jscomp$4$$[$methodName$$].$overloadTable$.hasOwnProperty($args$jscomp$8$$.length)) {
        throw new $BindingError$$(`Function '${$humanName$$}' called with an invalid number of arguments (${$args$jscomp$8$$.length}) - expects one of (${$proto$jscomp$4$$[$methodName$$].$overloadTable$})!`);
      }
      return $proto$jscomp$4$$[$methodName$$].$overloadTable$[$args$jscomp$8$$.length].apply(this, $args$jscomp$8$$);
    };
    $proto$jscomp$4$$[$methodName$$].$overloadTable$ = [];
    $proto$jscomp$4$$[$methodName$$].$overloadTable$[$prevFunc$$.$argCount$] = $prevFunc$$;
  }
}, $exposePublicSymbol$$ = ($name$jscomp$104$$, $value$jscomp$100$$) => {
  if ($Module$$.hasOwnProperty($name$jscomp$104$$)) {
    throw new $BindingError$$(`Cannot register public name '${$name$jscomp$104$$}' twice`);
  }
  $Module$$[$name$jscomp$104$$] = $value$jscomp$100$$;
  $Module$$[$name$jscomp$104$$].$argCount$ = void 0;
}, $makeLegalFunctionName$$ = $name$jscomp$105$$ => {
  $assert$$("string" === typeof $name$jscomp$105$$);
  $name$jscomp$105$$ = $name$jscomp$105$$.replace(/[^a-zA-Z0-9_]/g, "$");
  var $f$jscomp$2$$ = $name$jscomp$105$$.charCodeAt(0);
  return 48 <= $f$jscomp$2$$ && 57 >= $f$jscomp$2$$ ? `_${$name$jscomp$105$$}` : $name$jscomp$105$$;
};
function $RegisteredClass$$($name$jscomp$106$$, $constructor$$, $instancePrototype$$, $rawDestructor$jscomp$1$$, $baseClass$$, $getActualType$$, $upcast$$, $downcast$$) {
  this.name = $name$jscomp$106$$;
  this.constructor = $constructor$$;
  this.$instancePrototype$ = $instancePrototype$$;
  this.$rawDestructor$ = $rawDestructor$jscomp$1$$;
  this.$baseClass$ = $baseClass$$;
  this.$getActualType$ = $getActualType$$;
  this.$upcast$ = $upcast$$;
  this.$downcast$ = $downcast$$;
  this.$pureVirtualFunctions$ = [];
}
var $upcastPointer$$ = ($ptr$jscomp$20$$, $ptrClass$jscomp$1$$, $desiredClass$jscomp$1$$) => {
  for (; $ptrClass$jscomp$1$$ !== $desiredClass$jscomp$1$$;) {
    if (!$ptrClass$jscomp$1$$.$upcast$) {
      throw new $BindingError$$(`Expected null or instance of ${$desiredClass$jscomp$1$$.name}, got an instance of ${$ptrClass$jscomp$1$$.name}`);
    }
    $ptr$jscomp$20$$ = $ptrClass$jscomp$1$$.$upcast$($ptr$jscomp$20$$);
    $ptrClass$jscomp$1$$ = $ptrClass$jscomp$1$$.$baseClass$;
  }
  return $ptr$jscomp$20$$;
};
function $constNoSmartPtrRawPointerToWireType$$($destructors$jscomp$5$$, $handle$jscomp$18$$) {
  if (null === $handle$jscomp$18$$) {
    if (this.$isReference$) {
      throw new $BindingError$$(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!$handle$jscomp$18$$.$$$$) {
    throw new $BindingError$$(`Cannot pass "${$embindRepr$$($handle$jscomp$18$$)}" as a ${this.name}`);
  }
  if (!$handle$jscomp$18$$.$$$$.$ptr$) {
    throw new $BindingError$$(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  return $upcastPointer$$($handle$jscomp$18$$.$$$$.$ptr$, $handle$jscomp$18$$.$$$$.$ptrType$.$registeredClass$, this.$registeredClass$);
}
function $genericPointerToWireType$$($destructors$jscomp$6$$, $handle$jscomp$19$$) {
  if (null === $handle$jscomp$19$$) {
    if (this.$isReference$) {
      throw new $BindingError$$(`null is not a valid ${this.name}`);
    }
    if (this.$isSmartPointer$) {
      var $ptr$jscomp$22$$ = this.$rawConstructor$();
      null !== $destructors$jscomp$6$$ && $destructors$jscomp$6$$.push(this.$rawDestructor$, $ptr$jscomp$22$$);
      return $ptr$jscomp$22$$;
    }
    return 0;
  }
  if (!$handle$jscomp$19$$ || !$handle$jscomp$19$$.$$$$) {
    throw new $BindingError$$(`Cannot pass "${$embindRepr$$($handle$jscomp$19$$)}" as a ${this.name}`);
  }
  if (!$handle$jscomp$19$$.$$$$.$ptr$) {
    throw new $BindingError$$(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (!this.$isConst$ && $handle$jscomp$19$$.$$$$.$ptrType$.$isConst$) {
    throw new $BindingError$$(`Cannot convert argument of type ${$handle$jscomp$19$$.$$$$.$smartPtrType$ ? $handle$jscomp$19$$.$$$$.$smartPtrType$.name : $handle$jscomp$19$$.$$$$.$ptrType$.name} to parameter type ${this.name}`);
  }
  $ptr$jscomp$22$$ = $upcastPointer$$($handle$jscomp$19$$.$$$$.$ptr$, $handle$jscomp$19$$.$$$$.$ptrType$.$registeredClass$, this.$registeredClass$);
  if (this.$isSmartPointer$) {
    if (void 0 === $handle$jscomp$19$$.$$$$.$smartPtr$) {
      throw new $BindingError$$("Passing raw pointer to smart pointer is illegal");
    }
    switch(this.$sharingPolicy$) {
      case 0:
        if ($handle$jscomp$19$$.$$$$.$smartPtrType$ === this) {
          $ptr$jscomp$22$$ = $handle$jscomp$19$$.$$$$.$smartPtr$;
        } else {
          throw new $BindingError$$(`Cannot convert argument of type ${$handle$jscomp$19$$.$$$$.$smartPtrType$ ? $handle$jscomp$19$$.$$$$.$smartPtrType$.name : $handle$jscomp$19$$.$$$$.$ptrType$.name} to parameter type ${this.name}`);
        }
        break;
      case 1:
        $ptr$jscomp$22$$ = $handle$jscomp$19$$.$$$$.$smartPtr$;
        break;
      case 2:
        if ($handle$jscomp$19$$.$$$$.$smartPtrType$ === this) {
          $ptr$jscomp$22$$ = $handle$jscomp$19$$.$$$$.$smartPtr$;
        } else {
          var $clonedHandle$$ = $handle$jscomp$19$$.clone();
          $ptr$jscomp$22$$ = this.$rawShare$($ptr$jscomp$22$$, $Emval$toHandle$$(() => $clonedHandle$$["delete"]()));
          null !== $destructors$jscomp$6$$ && $destructors$jscomp$6$$.push(this.$rawDestructor$, $ptr$jscomp$22$$);
        }
        break;
      default:
        throw new $BindingError$$("Unsupporting sharing policy");
    }
  }
  return $ptr$jscomp$22$$;
}
function $nonConstNoSmartPtrRawPointerToWireType$$($destructors$jscomp$7$$, $handle$jscomp$20$$) {
  if (null === $handle$jscomp$20$$) {
    if (this.$isReference$) {
      throw new $BindingError$$(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!$handle$jscomp$20$$.$$$$) {
    throw new $BindingError$$(`Cannot pass "${$embindRepr$$($handle$jscomp$20$$)}" as a ${this.name}`);
  }
  if (!$handle$jscomp$20$$.$$$$.$ptr$) {
    throw new $BindingError$$(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if ($handle$jscomp$20$$.$$$$.$ptrType$.$isConst$) {
    throw new $BindingError$$(`Cannot convert argument of type ${$handle$jscomp$20$$.$$$$.$ptrType$.name} to parameter type ${this.name}`);
  }
  return $upcastPointer$$($handle$jscomp$20$$.$$$$.$ptr$, $handle$jscomp$20$$.$$$$.$ptrType$.$registeredClass$, this.$registeredClass$);
}
function $RegisteredPointer$$($name$jscomp$107$$, $registeredClass$$, $isReference$$, $isConst$$, $isSmartPointer$$, $pointeeType$$, $sharingPolicy$$, $rawGetPointee$$, $rawConstructor$jscomp$1$$, $rawShare$$, $rawDestructor$jscomp$2$$) {
  this.name = $name$jscomp$107$$;
  this.$registeredClass$ = $registeredClass$$;
  this.$isReference$ = $isReference$$;
  this.$isConst$ = $isConst$$;
  this.$isSmartPointer$ = $isSmartPointer$$;
  this.$pointeeType$ = $pointeeType$$;
  this.$sharingPolicy$ = $sharingPolicy$$;
  this.$rawGetPointee$ = $rawGetPointee$$;
  this.$rawConstructor$ = $rawConstructor$jscomp$1$$;
  this.$rawShare$ = $rawShare$$;
  this.$rawDestructor$ = $rawDestructor$jscomp$2$$;
  $isSmartPointer$$ || void 0 !== $registeredClass$$.$baseClass$ ? this.$toWireType$ = $genericPointerToWireType$$ : (this.$toWireType$ = $isConst$$ ? $constNoSmartPtrRawPointerToWireType$$ : $nonConstNoSmartPtrRawPointerToWireType$$, this.$destructorFunction$ = null);
}
var $replacePublicSymbol$$ = ($name$jscomp$108$$, $value$jscomp$101$$) => {
  if (!$Module$$.hasOwnProperty($name$jscomp$108$$)) {
    throw new $InternalError$$("Replacing nonexistent public symbol");
  }
  $Module$$[$name$jscomp$108$$] = $value$jscomp$101$$;
  $Module$$[$name$jscomp$108$$].$argCount$ = void 0;
}, $wasmTableMirror$$ = [], $embind__requireFunction$$ = ($signature$jscomp$1$$, $rawFunction$$, $fp_func$jscomp$inline_398_isAsync$$ = !1) => {
  $assert$$(!$fp_func$jscomp$inline_398_isAsync$$, "Async bindings are only supported with JSPI.");
  $signature$jscomp$1$$ = $AsciiToString$$($signature$jscomp$1$$);
  ($fp_func$jscomp$inline_398_isAsync$$ = $wasmTableMirror$$[$rawFunction$$]) || ($wasmTableMirror$$[$rawFunction$$] = $fp_func$jscomp$inline_398_isAsync$$ = $wasmTable$$.get($rawFunction$$));
  $assert$$($wasmTable$$.get($rawFunction$$) == $fp_func$jscomp$inline_398_isAsync$$, "JavaScript-side Wasm function table mirror is out of date!");
  if ("function" != typeof $fp_func$jscomp$inline_398_isAsync$$) {
    throw new $BindingError$$(`unknown function pointer with signature ${$signature$jscomp$1$$}: ${$rawFunction$$}`);
  }
  return $fp_func$jscomp$inline_398_isAsync$$;
};
class $UnboundTypeError$$ extends Error {
}
var $getTypeName$$ = $ptr$jscomp$26_type$jscomp$173$$ => {
  $ptr$jscomp$26_type$jscomp$173$$ = $___getTypeName$$($ptr$jscomp$26_type$jscomp$173$$);
  var $rv$jscomp$3$$ = $AsciiToString$$($ptr$jscomp$26_type$jscomp$173$$);
  $_free$$($ptr$jscomp$26_type$jscomp$173$$);
  return $rv$jscomp$3$$;
}, $throwUnboundTypeError$$ = ($message$jscomp$44$$, $types$$) => {
  function $visit$$($type$jscomp$174$$) {
    $seen$$[$type$jscomp$174$$] || $registeredTypes$$[$type$jscomp$174$$] || ($typeDependencies$$[$type$jscomp$174$$] ? $typeDependencies$$[$type$jscomp$174$$].forEach($visit$$) : ($unboundTypes$$.push($type$jscomp$174$$), $seen$$[$type$jscomp$174$$] = !0));
  }
  var $unboundTypes$$ = [], $seen$$ = {};
  $types$$.forEach($visit$$);
  throw new $UnboundTypeError$$(`${$message$jscomp$44$$}: ` + $unboundTypes$$.map($getTypeName$$).join([", "]));
};
function $usesDestructorStack$$($argTypes$$) {
  for (var $i$jscomp$26$$ = 1; $i$jscomp$26$$ < $argTypes$$.length; ++$i$jscomp$26$$) {
    if (null !== $argTypes$$[$i$jscomp$26$$] && void 0 === $argTypes$$[$i$jscomp$26$$].$destructorFunction$) {
      return !0;
    }
  }
  return !1;
}
function $checkArgCount$$($numArgs$$, $minArgs$$, $maxArgs$$, $humanName$jscomp$1$$, $throwBindingError$jscomp$1$$) {
  ($numArgs$$ < $minArgs$$ || $numArgs$$ > $maxArgs$$) && $throwBindingError$jscomp$1$$(`function ${$humanName$jscomp$1$$} called with ${$numArgs$$} arguments, expected ${$minArgs$$ == $maxArgs$$ ? $minArgs$$ : `${$minArgs$$} to ${$maxArgs$$}`}`);
}
function $craftInvokerFunction$$($humanName$jscomp$2$$, $argTypes$jscomp$3_invokerFn$$, $classType_returns$jscomp$1$$, $closureArgs_cppInvokerFunc$$, $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$, $isAsync$jscomp$2_paramName$jscomp$inline_199$$) {
  var $argCount$jscomp$1_i$jscomp$inline_194$$ = $argTypes$jscomp$3_invokerFn$$.length;
  if (2 > $argCount$jscomp$1_i$jscomp$inline_194$$) {
    throw new $BindingError$$("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  $assert$$(!$isAsync$jscomp$2_paramName$jscomp$inline_199$$, "Async bindings are only supported with JSPI.");
  var $isClassMethodFunc$jscomp$1$$ = null !== $argTypes$jscomp$3_invokerFn$$[1] && null !== $classType_returns$jscomp$1$$, $needsDestructorStack$jscomp$1_needsDestructorStack$jscomp$inline_190$$ = $usesDestructorStack$$($argTypes$jscomp$3_invokerFn$$);
  $classType_returns$jscomp$1$$ = !$argTypes$jscomp$3_invokerFn$$[0].$isVoid$;
  var $argCount$jscomp$inline_191_expectedArgCount$$ = $argCount$jscomp$1_i$jscomp$inline_194$$ - 2;
  var $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ = $argTypes$jscomp$3_invokerFn$$.length - 2;
  for (var $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$ = $argTypes$jscomp$3_invokerFn$$.length - 1; 2 <= $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$ && $argTypes$jscomp$3_invokerFn$$[$argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$].optional; --$argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$) {
    $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$--;
  }
  $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$ = $argTypes$jscomp$3_invokerFn$$[0];
  var $dtorStack$jscomp$inline_196_instType$$ = $argTypes$jscomp$3_invokerFn$$[1];
  $closureArgs_cppInvokerFunc$$ = [$humanName$jscomp$2$$, $throwBindingError$$, $closureArgs_cppInvokerFunc$$, $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$, $runDestructors$$, $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$.$fromWireType$.bind($argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$), $dtorStack$jscomp$inline_196_instType$$?.$toWireType$.bind($dtorStack$jscomp$inline_196_instType$$)];
  for ($argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$ = 2; $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$ < $argCount$jscomp$1_i$jscomp$inline_194$$; ++$argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$) {
    $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$ = $argTypes$jscomp$3_invokerFn$$[$argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$], $closureArgs_cppInvokerFunc$$.push($argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$.$toWireType$.bind($argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$));
  }
  if (!$needsDestructorStack$jscomp$1_needsDestructorStack$jscomp$inline_190$$) {
    for ($argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$ = $isClassMethodFunc$jscomp$1$$ ? 1 : 2; $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$ < $argTypes$jscomp$3_invokerFn$$.length; ++$argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$) {
      null !== $argTypes$jscomp$3_invokerFn$$[$argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$].$destructorFunction$ && $closureArgs_cppInvokerFunc$$.push($argTypes$jscomp$3_invokerFn$$[$argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$].$destructorFunction$);
    }
  }
  $closureArgs_cppInvokerFunc$$.push($checkArgCount$$, $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$, $argCount$jscomp$inline_191_expectedArgCount$$);
  $needsDestructorStack$jscomp$1_needsDestructorStack$jscomp$inline_190$$ = $usesDestructorStack$$($argTypes$jscomp$3_invokerFn$$);
  $argCount$jscomp$inline_191_expectedArgCount$$ = $argTypes$jscomp$3_invokerFn$$.length - 2;
  $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ = [];
  $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$ = ["fn"];
  $isClassMethodFunc$jscomp$1$$ && $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$.push("thisWired");
  for ($argCount$jscomp$1_i$jscomp$inline_194$$ = 0; $argCount$jscomp$1_i$jscomp$inline_194$$ < $argCount$jscomp$inline_191_expectedArgCount$$; ++$argCount$jscomp$1_i$jscomp$inline_194$$) {
    $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$.push(`arg${$argCount$jscomp$1_i$jscomp$inline_194$$}`), $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$.push(`arg${$argCount$jscomp$1_i$jscomp$inline_194$$}Wired`);
  }
  $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ = $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$.join(",");
  $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$ = $argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$.join(",");
  $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ = `return function (${$argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$}) {\n` + "checkArgCount(arguments.length, minArgs, maxArgs, humanName, throwBindingError);\n";
  $needsDestructorStack$jscomp$1_needsDestructorStack$jscomp$inline_190$$ && ($argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += "var destructors = [];\n");
  $dtorStack$jscomp$inline_196_instType$$ = $needsDestructorStack$jscomp$1_needsDestructorStack$jscomp$inline_190$$ ? "destructors" : "null";
  $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$ = "humanName throwBindingError invoker fn runDestructors fromRetWire toClassParamWire".split(" ");
  $isClassMethodFunc$jscomp$1$$ && ($argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += `var thisWired = toClassParamWire(${$dtorStack$jscomp$inline_196_instType$$}, this);\n`);
  for ($argCount$jscomp$1_i$jscomp$inline_194$$ = 0; $argCount$jscomp$1_i$jscomp$inline_194$$ < $argCount$jscomp$inline_191_expectedArgCount$$; ++$argCount$jscomp$1_i$jscomp$inline_194$$) {
    var $argName$jscomp$inline_198$$ = `toArg${$argCount$jscomp$1_i$jscomp$inline_194$$}Wire`;
    $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += `var arg${$argCount$jscomp$1_i$jscomp$inline_194$$}Wired = ${$argName$jscomp$inline_198$$}(${$dtorStack$jscomp$inline_196_instType$$}, arg${$argCount$jscomp$1_i$jscomp$inline_194$$});\n`;
    $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$.push($argName$jscomp$inline_198$$);
  }
  $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += ($classType_returns$jscomp$1$$ || $isAsync$jscomp$2_paramName$jscomp$inline_199$$ ? "var rv = " : "") + `invoker(${$argsListWired$jscomp$inline_193_cppTargetFunc_i$jscomp$29$$});\n`;
  if ($needsDestructorStack$jscomp$1_needsDestructorStack$jscomp$inline_190$$) {
    $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += "runDestructors(destructors);\n";
  } else {
    for ($argCount$jscomp$1_i$jscomp$inline_194$$ = $isClassMethodFunc$jscomp$1$$ ? 1 : 2; $argCount$jscomp$1_i$jscomp$inline_194$$ < $argTypes$jscomp$3_invokerFn$$.length; ++$argCount$jscomp$1_i$jscomp$inline_194$$) {
      $isAsync$jscomp$2_paramName$jscomp$inline_199$$ = 1 === $argCount$jscomp$1_i$jscomp$inline_194$$ ? "thisWired" : "arg" + ($argCount$jscomp$1_i$jscomp$inline_194$$ - 2) + "Wired", null !== $argTypes$jscomp$3_invokerFn$$[$argCount$jscomp$1_i$jscomp$inline_194$$].$destructorFunction$ && ($argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += `${$isAsync$jscomp$2_paramName$jscomp$inline_199$$}_dtor(${$isAsync$jscomp$2_paramName$jscomp$inline_199$$});\n`, 
      $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$.push(`${$isAsync$jscomp$2_paramName$jscomp$inline_199$$}_dtor`));
    }
  }
  $classType_returns$jscomp$1$$ && ($argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += "var ret = fromRetWire(rv);\nreturn ret;\n");
  $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ += "}\n";
  $argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$.push("checkArgCount", "minArgs", "maxArgs");
  $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$ = `if (arguments.length !== ${$argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$.length}){ throw new Error(humanName + "Expected ${$argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$.length} closure arguments " + arguments.length + " given."); }\n${$argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$}`;
  $argTypes$jscomp$3_invokerFn$$ = (new Function($argType_args1$jscomp$inline_197_i$jscomp$inline_184_retType$$, $argsList$jscomp$inline_192_invokerFnBody$jscomp$inline_195_minArgs$jscomp$1_requiredArgCount$jscomp$inline_183$$))(...$closureArgs_cppInvokerFunc$$);
  return $createNamedFunction$$($humanName$jscomp$2$$, $argTypes$jscomp$3_invokerFn$$);
}
var $heap32VectorToArray$$ = ($count$jscomp$39$$, $firstElement$$) => {
  for (var $array$jscomp$6$$ = [], $i$jscomp$30$$ = 0; $i$jscomp$30$$ < $count$jscomp$39$$; $i$jscomp$30$$++) {
    $array$jscomp$6$$.push($HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $firstElement$$ + 4 * $i$jscomp$30$$ >> 2, $___asan_loadN$$)]);
  }
  return $array$jscomp$6$$;
}, $getFunctionName$$ = $signature$jscomp$2$$ => {
  $signature$jscomp$2$$ = $signature$jscomp$2$$.trim();
  const $argsIndex$$ = $signature$jscomp$2$$.indexOf("(");
  if (-1 === $argsIndex$$) {
    return $signature$jscomp$2$$;
  }
  $assert$$($signature$jscomp$2$$.endsWith(")"), "Parentheses for argument names should match.");
  return $signature$jscomp$2$$.slice(0, $argsIndex$$);
}, $validateThis$$ = ($this_$$, $classType$jscomp$4$$, $humanName$jscomp$6$$) => {
  if (!($this_$$ instanceof Object)) {
    throw new $BindingError$$(`${$humanName$jscomp$6$$} with invalid "this": ${$this_$$}`);
  }
  if (!($this_$$ instanceof $classType$jscomp$4$$.$registeredClass$.constructor)) {
    throw new $BindingError$$(`${$humanName$jscomp$6$$} incompatible with "this" of type ${$this_$$.constructor.name}`);
  }
  if (!$this_$$.$$$$.$ptr$) {
    throw new $BindingError$$(`cannot call emscripten binding method ${$humanName$jscomp$6$$} on deleted object`);
  }
  return $upcastPointer$$($this_$$.$$$$.$ptr$, $this_$$.$$$$.$ptrType$.$registeredClass$, $classType$jscomp$4$$.$registeredClass$);
}, $emval_freelist$$ = [], $emval_handles$$ = [0, 1, , 1, null, 1, !0, 1, !1, 1], $Emval$toHandle$$ = $value$jscomp$102$$ => {
  switch($value$jscomp$102$$) {
    case void 0:
      return 2;
    case null:
      return 4;
    case !0:
      return 6;
    case !1:
      return 8;
    default:
      const $handle$jscomp$23$$ = $emval_freelist$$.pop() || $emval_handles$$.length;
      $emval_handles$$[$handle$jscomp$23$$] = $value$jscomp$102$$;
      $emval_handles$$[$handle$jscomp$23$$ + 1] = 1;
      return $handle$jscomp$23$$;
  }
}, $EmValType$$ = {name:"emscripten::val", $fromWireType$:$handle$jscomp$24$$ => {
  if (!$handle$jscomp$24$$) {
    throw new $BindingError$$(`Cannot use deleted val. handle = ${$handle$jscomp$24$$}`);
  }
  $assert$$(2 === $handle$jscomp$24$$ || void 0 !== $emval_handles$$[$handle$jscomp$24$$] && 0 === $handle$jscomp$24$$ % 2, `invalid handle: ${$handle$jscomp$24$$}`);
  var $rv$jscomp$4$$ = $emval_handles$$[$handle$jscomp$24$$];
  9 < $handle$jscomp$24$$ && 0 === --$emval_handles$$[$handle$jscomp$24$$ + 1] && ($assert$$(void 0 !== $emval_handles$$[$handle$jscomp$24$$], "Decref for unallocated handle."), $emval_handles$$[$handle$jscomp$24$$] = void 0, $emval_freelist$$.push($handle$jscomp$24$$));
  return $rv$jscomp$4$$;
}, $toWireType$:($destructors$jscomp$10$$, $value$jscomp$103$$) => $Emval$toHandle$$($value$jscomp$103$$), $readValueFromPointer$:$readPointer$$, $destructorFunction$:null}, $enumReadValueFromPointer$$ = ($name$jscomp$110$$, $width$jscomp$29$$, $signed$jscomp$1$$) => {
  switch($width$jscomp$29$$) {
    case 1:
      return $signed$jscomp$1$$ ? function($pointer$jscomp$10$$) {
        return this.$fromWireType$($HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $pointer$jscomp$10$$, $___asan_loadN$$)]);
      } : function($pointer$jscomp$11$$) {
        return this.$fromWireType$($HEAPU8$$[$_asan_js_check_index$$($HEAPU8$$, $pointer$jscomp$11$$, $___asan_loadN$$)]);
      };
    case 2:
      return $signed$jscomp$1$$ ? function($pointer$jscomp$12$$) {
        return this.$fromWireType$($HEAP16$$[$_asan_js_check_index$$($HEAP16$$, $pointer$jscomp$12$$ >> 1, $___asan_loadN$$)]);
      } : function($pointer$jscomp$13$$) {
        return this.$fromWireType$($HEAPU16$$[$_asan_js_check_index$$($HEAPU16$$, $pointer$jscomp$13$$ >> 1, $___asan_loadN$$)]);
      };
    case 4:
      return $signed$jscomp$1$$ ? function($pointer$jscomp$14$$) {
        return this.$fromWireType$($HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $pointer$jscomp$14$$ >> 2, $___asan_loadN$$)]);
      } : function($pointer$jscomp$15$$) {
        return this.$fromWireType$($HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $pointer$jscomp$15$$ >> 2, $___asan_loadN$$)]);
      };
    default:
      throw new TypeError(`invalid integer width (${$width$jscomp$29$$}): ${$name$jscomp$110$$}`);
  }
}, $requireRegisteredType$$ = $message$jscomp$inline_213_rawType$jscomp$6$$ => {
  var $impl$$ = $registeredTypes$$[$message$jscomp$inline_213_rawType$jscomp$6$$];
  if (void 0 === $impl$$) {
    throw $message$jscomp$inline_213_rawType$jscomp$6$$ = `${"enum"} has unknown type ${$getTypeName$$($message$jscomp$inline_213_rawType$jscomp$6$$)}`, new $BindingError$$($message$jscomp$inline_213_rawType$jscomp$6$$);
  }
  return $impl$$;
}, $floatReadValueFromPointer$$ = ($name$jscomp$113$$, $width$jscomp$30$$) => {
  switch($width$jscomp$30$$) {
    case 4:
      return function($pointer$jscomp$16$$) {
        return this.$fromWireType$($HEAPF32$$[$_asan_js_check_index$$($HEAPF32$$, $pointer$jscomp$16$$ >> 2, $___asan_loadN$$)]);
      };
    case 8:
      return function($pointer$jscomp$17$$) {
        return this.$fromWireType$($HEAPF64$$[$_asan_js_check_index$$($HEAPF64$$, $pointer$jscomp$17$$ >> 3, $___asan_loadN$$)]);
      };
    default:
      throw new TypeError(`invalid float width (${$width$jscomp$30$$}): ${$name$jscomp$113$$}`);
  }
}, $stringToUTF8$$ = ($str$jscomp$12$$, $outPtr$$, $maxBytesToWrite$jscomp$1$$) => {
  $assert$$("number" == typeof $maxBytesToWrite$jscomp$1$$, "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return $stringToUTF8Array$$($str$jscomp$12$$, $HEAPU8$$, $outPtr$$, $maxBytesToWrite$jscomp$1$$);
}, $UTF16Decoder$$ = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, $UTF16ToString$$ = ($i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$, $endIdx$jscomp$1_maxBytesToRead$jscomp$3$$, $ignoreNul$jscomp$3_str$jscomp$14$$) => {
  $assert$$(0 == $i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$ % 2, "Pointer passed to UTF16ToString must be aligned to two bytes!");
  $i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$ >>= 1;
  $endIdx$jscomp$1_maxBytesToRead$jscomp$3$$ = $findStringEnd$$($HEAPU16$$, $i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$, $endIdx$jscomp$1_maxBytesToRead$jscomp$3$$ / 2, $ignoreNul$jscomp$3_str$jscomp$14$$);
  if (16 < $endIdx$jscomp$1_maxBytesToRead$jscomp$3$$ - $i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$ && $UTF16Decoder$$) {
    return $UTF16Decoder$$.decode($HEAPU16$$.subarray($i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$, $endIdx$jscomp$1_maxBytesToRead$jscomp$3$$));
  }
  for ($ignoreNul$jscomp$3_str$jscomp$14$$ = ""; $i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$ < $endIdx$jscomp$1_maxBytesToRead$jscomp$3$$; ++$i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$) {
    var $codeUnit$$ = $HEAPU16$$[$_asan_js_check_index$$($HEAPU16$$, $i$jscomp$33_idx$jscomp$4_ptr$jscomp$31$$, $___asan_loadN$$)];
    $ignoreNul$jscomp$3_str$jscomp$14$$ += String.fromCharCode($codeUnit$$);
  }
  return $ignoreNul$jscomp$3_str$jscomp$14$$;
}, $stringToUTF16$$ = ($str$jscomp$15$$, $outPtr$jscomp$1$$, $maxBytesToWrite$jscomp$2_numCharsToWrite$$) => {
  $assert$$(0 == $outPtr$jscomp$1$$ % 2, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
  $assert$$("number" == typeof $maxBytesToWrite$jscomp$2_numCharsToWrite$$, "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  $maxBytesToWrite$jscomp$2_numCharsToWrite$$ ??= 2147483647;
  if (2 > $maxBytesToWrite$jscomp$2_numCharsToWrite$$) {
    return 0;
  }
  $maxBytesToWrite$jscomp$2_numCharsToWrite$$ -= 2;
  var $startPtr$$ = $outPtr$jscomp$1$$;
  $maxBytesToWrite$jscomp$2_numCharsToWrite$$ = $maxBytesToWrite$jscomp$2_numCharsToWrite$$ < 2 * $str$jscomp$15$$.length ? $maxBytesToWrite$jscomp$2_numCharsToWrite$$ / 2 : $str$jscomp$15$$.length;
  for (var $i$jscomp$34$$ = 0; $i$jscomp$34$$ < $maxBytesToWrite$jscomp$2_numCharsToWrite$$; ++$i$jscomp$34$$) {
    var $codeUnit$jscomp$1$$ = $str$jscomp$15$$.charCodeAt($i$jscomp$34$$);
    $HEAP16$$[$_asan_js_check_index$$($HEAP16$$, $outPtr$jscomp$1$$ >> 1, $___asan_storeN$$)] = $codeUnit$jscomp$1$$;
    $outPtr$jscomp$1$$ += 2;
  }
  $HEAP16$$[$_asan_js_check_index$$($HEAP16$$, $outPtr$jscomp$1$$ >> 1, $___asan_storeN$$)] = 0;
  return $outPtr$jscomp$1$$ - $startPtr$$;
}, $lengthBytesUTF16$$ = $str$jscomp$16$$ => 2 * $str$jscomp$16$$.length, $UTF32ToString$$ = ($ptr$jscomp$32_startIdx$jscomp$1$$, $maxBytesToRead$jscomp$4$$, $ignoreNul$jscomp$4$$) => {
  $assert$$(0 == $ptr$jscomp$32_startIdx$jscomp$1$$ % 4, "Pointer passed to UTF32ToString must be aligned to four bytes!");
  var $str$jscomp$17$$ = "";
  $ptr$jscomp$32_startIdx$jscomp$1$$ >>= 2;
  for (var $i$jscomp$35$$ = 0; !($i$jscomp$35$$ >= $maxBytesToRead$jscomp$4$$ / 4); $i$jscomp$35$$++) {
    var $utf32$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $ptr$jscomp$32_startIdx$jscomp$1$$ + $i$jscomp$35$$, $___asan_loadN$$)];
    if (!$utf32$$ && !$ignoreNul$jscomp$4$$) {
      break;
    }
    $str$jscomp$17$$ += String.fromCodePoint($utf32$$);
  }
  return $str$jscomp$17$$;
}, $stringToUTF32$$ = ($str$jscomp$18$$, $outPtr$jscomp$2$$, $endPtr$jscomp$1_maxBytesToWrite$jscomp$3$$) => {
  $assert$$(0 == $outPtr$jscomp$2$$ % 4, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
  $assert$$("number" == typeof $endPtr$jscomp$1_maxBytesToWrite$jscomp$3$$, "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  $endPtr$jscomp$1_maxBytesToWrite$jscomp$3$$ ??= 2147483647;
  if (4 > $endPtr$jscomp$1_maxBytesToWrite$jscomp$3$$) {
    return 0;
  }
  var $startPtr$jscomp$1$$ = $outPtr$jscomp$2$$;
  $endPtr$jscomp$1_maxBytesToWrite$jscomp$3$$ = $startPtr$jscomp$1$$ + $endPtr$jscomp$1_maxBytesToWrite$jscomp$3$$ - 4;
  for (var $i$jscomp$36$$ = 0; $i$jscomp$36$$ < $str$jscomp$18$$.length; ++$i$jscomp$36$$) {
    var $codePoint$jscomp$1$$ = $str$jscomp$18$$.codePointAt($i$jscomp$36$$);
    65535 < $codePoint$jscomp$1$$ && $i$jscomp$36$$++;
    $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $outPtr$jscomp$2$$ >> 2, $___asan_storeN$$)] = $codePoint$jscomp$1$$;
    $outPtr$jscomp$2$$ += 4;
    if ($outPtr$jscomp$2$$ + 4 > $endPtr$jscomp$1_maxBytesToWrite$jscomp$3$$) {
      break;
    }
  }
  $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $outPtr$jscomp$2$$ >> 2, $___asan_storeN$$)] = 0;
  return $outPtr$jscomp$2$$ - $startPtr$jscomp$1$$;
}, $lengthBytesUTF32$$ = $str$jscomp$19$$ => {
  for (var $len$jscomp$7$$ = 0, $i$jscomp$37$$ = 0; $i$jscomp$37$$ < $str$jscomp$19$$.length; ++$i$jscomp$37$$) {
    65535 < $str$jscomp$19$$.codePointAt($i$jscomp$37$$) && $i$jscomp$37$$++, $len$jscomp$7$$ += 4;
  }
  return $len$jscomp$7$$;
}, $withBuiltinMalloc$$ = $func$jscomp$11$$ => {
  var $prev_malloc$$ = "undefined" != typeof $_malloc$$ ? $_malloc$$ : void 0, $prev_free$$ = "undefined" != typeof $_free$$ ? $_free$$ : void 0;
  $_malloc$$ = $_emscripten_builtin_malloc$$;
  $_free$$ = $_emscripten_builtin_free$$;
  try {
    return $func$jscomp$11$$();
  } finally {
    $_malloc$$ = $prev_malloc$$, $_free$$ = $prev_free$$;
  }
}, $stringToNewUTF8$$ = $str$jscomp$22$$ => {
  var $size$jscomp$31$$ = $lengthBytesUTF8$$($str$jscomp$22$$) + 1, $ret$jscomp$5$$ = $_malloc$$($size$jscomp$31$$);
  $ret$jscomp$5$$ && $stringToUTF8$$($str$jscomp$22$$, $ret$jscomp$5$$, $size$jscomp$31$$);
  return $ret$jscomp$5$$;
}, $readEmAsmArgsArray$$ = [], $UNWIND_CACHE$$ = {}, $convertPCtoSourceLocation$$ = $pc$$ => {
  if ($UNWIND_CACHE$$.$last_get_source_pc$ == $pc$$) {
    return $UNWIND_CACHE$$.$last_source$;
  }
  var $match$$;
  if (!$source$jscomp$17$$) {
    var $frame$jscomp$1$$ = $UNWIND_CACHE$$[$pc$$];
    if (!$frame$jscomp$1$$) {
      return null;
    }
    if ($match$$ = /\((.*):(\d+):(\d+)\)$/.exec($frame$jscomp$1$$)) {
      var $source$jscomp$17$$ = {file:$match$$[1], line:$match$$[2], $column$:$match$$[3]};
    } else if ($match$$ = /@(.*):(\d+):(\d+)/.exec($frame$jscomp$1$$)) {
      $source$jscomp$17$$ = {file:$match$$[1], line:$match$$[2], $column$:$match$$[3]};
    }
  }
  $UNWIND_CACHE$$.$last_get_source_pc$ = $pc$$;
  return $UNWIND_CACHE$$.$last_source$ = $source$jscomp$17$$;
}, $_emscripten_pc_get_file$$ = $pc$jscomp$2$$ => $withBuiltinMalloc$$(() => {
  var $result$jscomp$8$$ = $convertPCtoSourceLocation$$($pc$jscomp$2$$);
  if (!$result$jscomp$8$$) {
    return 0;
  }
  $_free$$($_emscripten_pc_get_file$$.$ret$ ?? 0);
  $_emscripten_pc_get_file$$.$ret$ = $stringToNewUTF8$$($result$jscomp$8$$.file);
  return $_emscripten_pc_get_file$$.$ret$;
}), $convertFrameToPC$$ = $frame$jscomp$2$$ => {
  var $match$jscomp$1$$;
  if ($match$jscomp$1$$ = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec($frame$jscomp$2$$)) {
    return +$match$jscomp$1$$[1];
  }
  if (/\bwasm-function\[(\d+)\]:(\d+)/.exec($frame$jscomp$2$$)) {
    $warnOnce$$("legacy backtrace format detected, this version of v8 is no longer supported by the emscripten backtrace mechanism");
  } else if ($match$jscomp$1$$ = /:(\d+):\d+(?:\)|$)/.exec($frame$jscomp$2$$)) {
    return 2147483648 | +$match$jscomp$1$$[1];
  }
  return 0;
}, $saveInUnwindCache$$ = $callstack_pc$jscomp$3$$ => {
  for (var $line$jscomp$8$$ of $callstack_pc$jscomp$3$$) {
    ($callstack_pc$jscomp$3$$ = $convertFrameToPC$$($line$jscomp$8$$)) && ($UNWIND_CACHE$$[$callstack_pc$jscomp$3$$] = $line$jscomp$8$$);
  }
}, $_emscripten_pc_get_function$$ = $pc$jscomp$4$$ => $withBuiltinMalloc$$(() => {
  var $frame$jscomp$3_name$jscomp$123$$ = $UNWIND_CACHE$$[$pc$jscomp$4$$];
  if (!$frame$jscomp$3_name$jscomp$123$$) {
    return 0;
  }
  var $match$jscomp$2$$;
  if ($match$jscomp$2$$ = /^\s+at .*\.wasm\.(.*) \(.*\)$/.exec($frame$jscomp$3_name$jscomp$123$$)) {
    $frame$jscomp$3_name$jscomp$123$$ = $match$jscomp$2$$[1];
  } else if ($match$jscomp$2$$ = /^\s+at (.*) \(.*\)$/.exec($frame$jscomp$3_name$jscomp$123$$)) {
    $frame$jscomp$3_name$jscomp$123$$ = $match$jscomp$2$$[1];
  } else if ($match$jscomp$2$$ = /^(.+?)@/.exec($frame$jscomp$3_name$jscomp$123$$)) {
    $frame$jscomp$3_name$jscomp$123$$ = $match$jscomp$2$$[1];
  } else {
    return 0;
  }
  $_free$$($_emscripten_pc_get_function$$.$ret$ ?? 0);
  $_emscripten_pc_get_function$$.$ret$ = $stringToNewUTF8$$($frame$jscomp$3_name$jscomp$123$$);
  return $_emscripten_pc_get_function$$.$ret$;
}), $specialHTMLTargets$$ = [0, document, window], $findEventTarget$$ = $cString$jscomp$inline_215_target$jscomp$92$$ => {
  $cString$jscomp$inline_215_target$jscomp$92$$ = 2 < $cString$jscomp$inline_215_target$jscomp$92$$ ? $UTF8ToString$$($cString$jscomp$inline_215_target$jscomp$92$$) : $cString$jscomp$inline_215_target$jscomp$92$$;
  return $specialHTMLTargets$$[$cString$jscomp$inline_215_target$jscomp$92$$] || document.querySelector($cString$jscomp$inline_215_target$jscomp$92$$);
}, $GLctx$$, $getEmscriptenSupportedExtensions$$ = $ctx$jscomp$6$$ => {
  var $supportedExtensions$$ = "EXT_color_buffer_float EXT_conservative_depth EXT_disjoint_timer_query_webgl2 EXT_texture_norm16 NV_shader_noperspective_interpolation WEBGL_clip_cull_distance EXT_clip_control EXT_color_buffer_half_float EXT_depth_clamp EXT_float_blend EXT_polygon_offset_clamp EXT_texture_compression_bptc EXT_texture_compression_rgtc EXT_texture_filter_anisotropic KHR_parallel_shader_compile OES_texture_float_linear WEBGL_blend_func_extended WEBGL_compressed_texture_astc WEBGL_compressed_texture_etc WEBGL_compressed_texture_etc1 WEBGL_compressed_texture_s3tc WEBGL_compressed_texture_s3tc_srgb WEBGL_debug_renderer_info WEBGL_debug_shaders WEBGL_lose_context WEBGL_multi_draw WEBGL_polygon_mode".split(" ");
  return ($ctx$jscomp$6$$.getSupportedExtensions() || []).filter($ext$$ => $supportedExtensions$$.includes($ext$$));
}, $GL$counter$$ = 1, $GL$buffers$$ = [], $GL$programs$$ = [], $GL$textures$$ = [], $GL$shaders$$ = [], $GL$vaos$$ = [], $GL$contexts$$ = [], $GL$getNewId$$ = $table$$ => {
  for (var $ret$jscomp$6$$ = $GL$counter$$++, $i$jscomp$39$$ = $table$$.length; $i$jscomp$39$$ < $ret$jscomp$6$$; $i$jscomp$39$$++) {
    $table$$[$i$jscomp$39$$] = null;
  }
  return $ret$jscomp$6$$;
}, $GL$genObject$$ = ($n$jscomp$4$$, $buffers$jscomp$2$$, $createFunction$$, $objectTable$$) => {
  for (var $i$jscomp$40$$ = 0; $i$jscomp$40$$ < $n$jscomp$4$$; $i$jscomp$40$$++) {
    var $buffer$jscomp$33$$ = $GLctx$$[$createFunction$$](), $id$jscomp$9$$ = $buffer$jscomp$33$$ && $GL$getNewId$$($objectTable$$);
    $buffer$jscomp$33$$ ? ($buffer$jscomp$33$$.name = $id$jscomp$9$$, $objectTable$$[$id$jscomp$9$$] = $buffer$jscomp$33$$) : $GL$lastError$$ ||= 1282;
    $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $buffers$jscomp$2$$ + 4 * $i$jscomp$40$$ >> 2, $___asan_storeN$$)] = $id$jscomp$9$$;
  }
}, $GL$createContext$$ = ($canvas$jscomp$1$$, $webGLContextAttributes$$) => {
  $canvas$jscomp$1$$.$g$ || ($canvas$jscomp$1$$.$g$ = $canvas$jscomp$1$$.getContext, $canvas$jscomp$1$$.getContext = function($ver$$, $attrs_gl$$) {
    $attrs_gl$$ = $canvas$jscomp$1$$.$g$($ver$$, $attrs_gl$$);
    return "webgl" == $ver$$ == $attrs_gl$$ instanceof WebGLRenderingContext ? $attrs_gl$$ : null;
  });
  var $ctx$jscomp$7$$ = $canvas$jscomp$1$$.getContext("webgl2", $webGLContextAttributes$$);
  return $ctx$jscomp$7$$ ? $GL$registerContext$$($ctx$jscomp$7$$, $webGLContextAttributes$$) : 0;
}, $GL$registerContext$$ = ($context$jscomp$inline_219_ctx$jscomp$8$$, $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$) => {
  var $handle$jscomp$27$$ = $GL$getNewId$$($GL$contexts$$), $context$jscomp$6$$ = {handle:$handle$jscomp$27$$, attributes:$GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$, version:$GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$majorVersion$, $GLctx$:$context$jscomp$inline_219_ctx$jscomp$8$$};
  $context$jscomp$inline_219_ctx$jscomp$8$$.canvas && ($context$jscomp$inline_219_ctx$jscomp$8$$.canvas.$GLctxObject$ = $context$jscomp$6$$);
  $GL$contexts$$[$handle$jscomp$27$$] = $context$jscomp$6$$;
  if ("undefined" == typeof $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$enableExtensionsByDefault$ || $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$enableExtensionsByDefault$) {
    if (($context$jscomp$inline_219_ctx$jscomp$8$$ = $context$jscomp$6$$) || ($context$jscomp$inline_219_ctx$jscomp$8$$ = $GL$currentContext$$), !$context$jscomp$inline_219_ctx$jscomp$8$$.$initExtensionsDone$) {
      $context$jscomp$inline_219_ctx$jscomp$8$$.$initExtensionsDone$ = !0;
      $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$ = $context$jscomp$inline_219_ctx$jscomp$8$$.$GLctx$;
      $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$multiDrawWebgl$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("WEBGL_multi_draw");
      $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$extPolygonOffsetClamp$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("EXT_polygon_offset_clamp");
      $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$extClipControl$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("EXT_clip_control");
      $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$webglPolygonMode$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("WEBGL_polygon_mode");
      $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$dibvbi$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("WEBGL_draw_instanced_base_vertex_base_instance");
      $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$mdibvbi$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance");
      2 <= $context$jscomp$inline_219_ctx$jscomp$8$$.version && ($GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$disjointTimerQueryExt$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("EXT_disjoint_timer_query_webgl2"));
      if (2 > $context$jscomp$inline_219_ctx$jscomp$8$$.version || !$GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$disjointTimerQueryExt$) {
        $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.$disjointTimerQueryExt$ = $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension("EXT_disjoint_timer_query");
      }
      for (var $ext$jscomp$inline_221$$ of $getEmscriptenSupportedExtensions$$($GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$)) {
        $ext$jscomp$inline_221$$.includes("lose_context") || $ext$jscomp$inline_221$$.includes("debug") || $GLctx$jscomp$inline_220_webGLContextAttributes$jscomp$1$$.getExtension($ext$jscomp$inline_221$$);
      }
    }
  }
  return $handle$jscomp$27$$;
}, $GL$lastError$$, $GL$currentContext$$, $webglPowerPreferences$$ = ["default", "low-power", "high-performance"], $ENV$$ = {}, $getEnvStrings$$ = () => {
  if (!$getEnvStrings$strings$$) {
    var $env$$ = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.language || "C").replace("-", "_") + ".UTF-8", _:$thisProgram$$ || "./this.program"}, $x$jscomp$92$$;
    for ($x$jscomp$92$$ in $ENV$$) {
      void 0 === $ENV$$[$x$jscomp$92$$] ? delete $env$$[$x$jscomp$92$$] : $env$$[$x$jscomp$92$$] = $ENV$$[$x$jscomp$92$$];
    }
    var $strings$$ = [];
    for ($x$jscomp$92$$ in $env$$) {
      $strings$$.push(`${$x$jscomp$92$$}=${$env$$[$x$jscomp$92$$]}`);
    }
    $getEnvStrings$strings$$ = $strings$$;
  }
  return $getEnvStrings$strings$$;
}, $getEnvStrings$strings$$, $webglGetLeftBracePos$$ = $name$jscomp$124$$ => "]" == $name$jscomp$124$$.slice(-1) && $name$jscomp$124$$.lastIndexOf("["), $heapObjectForWebGLType$$ = $type$jscomp$176$$ => {
  $type$jscomp$176$$ -= 5120;
  return 0 == $type$jscomp$176$$ ? $HEAP8$$ : 1 == $type$jscomp$176$$ ? $HEAPU8$$ : 2 == $type$jscomp$176$$ ? $HEAP16$$ : 4 == $type$jscomp$176$$ ? $HEAP32$$ : 6 == $type$jscomp$176$$ ? $HEAPF32$$ : 5 == $type$jscomp$176$$ || 28922 == $type$jscomp$176$$ || 28520 == $type$jscomp$176$$ || 30779 == $type$jscomp$176$$ || 30782 == $type$jscomp$176$$ ? $HEAPU32$$ : $HEAPU16$$;
};
$FS$nameTable$$ = Array(4096);
$FS$mount$$($MEMFS$$, "/");
$FS$mkdir$$("/tmp");
$FS$mkdir$$("/home");
$FS$mkdir$$("/home/web_user");
(function() {
  $FS$mkdir$$("/dev");
  $FS$registerDevice$$(259, {read:() => 0, write:($stream$jscomp$38$$, $buffer$jscomp$26$$, $offset$jscomp$36$$, $length$jscomp$29$$) => $length$jscomp$29$$, $llseek$:() => 0});
  $FS$mkdev$$("/dev/null", 259);
  $TTY$register$$(1280, $TTY$default_tty_ops$$);
  $TTY$register$$(1536, $TTY$default_tty1_ops$$);
  $FS$mkdev$$("/dev/tty", 1280);
  $FS$mkdev$$("/dev/tty1", 1536);
  var $randomBuffer$$ = new Uint8Array(1024), $randomLeft$$ = 0, $randomByte$$ = () => {
    0 === $randomLeft$$ && ($randomFill$$($randomBuffer$$), $randomLeft$$ = $randomBuffer$$.byteLength);
    return $randomBuffer$$[--$randomLeft$$];
  };
  $FS$createDevice$$("/dev", "random", $randomByte$$);
  $FS$createDevice$$("/dev", "urandom", $randomByte$$);
  $FS$mkdir$$("/dev/shm");
  $FS$mkdir$$("/dev/shm/tmp");
})();
(function() {
  $FS$mkdir$$("/proc");
  var $proc_self$$ = $FS$mkdir$$("/proc/self");
  $FS$mkdir$$("/proc/self/fd");
  $FS$mount$$({$mount$() {
    var $node$jscomp$45$$ = $FS$createNode$$($proc_self$$, "fd", 16895, 73);
    $node$jscomp$45$$.$stream_ops$ = {$llseek$:$MEMFS$$.$stream_ops$.$llseek$};
    $node$jscomp$45$$.$node_ops$ = {$lookup$($fd$jscomp$10_parent$jscomp$20_ret$$, $name$jscomp$94$$) {
      $fd$jscomp$10_parent$jscomp$20_ret$$ = +$name$jscomp$94$$;
      var $stream$jscomp$39$$ = $FS$getStreamChecked$$($fd$jscomp$10_parent$jscomp$20_ret$$);
      $fd$jscomp$10_parent$jscomp$20_ret$$ = {parent:null, $mount$:{$mountpoint$:"fake"}, $node_ops$:{$readlink$:() => $stream$jscomp$39$$.path}, id:$fd$jscomp$10_parent$jscomp$20_ret$$ + 1};
      return $fd$jscomp$10_parent$jscomp$20_ret$$.parent = $fd$jscomp$10_parent$jscomp$20_ret$$;
    }, $readdir$() {
      return Array.from($FS$streams$$.entries()).filter(([, $v$$]) => $v$$).map(([$k$jscomp$1$$]) => $k$jscomp$1$$.toString());
    }};
    return $node$jscomp$45$$;
  }}, "/proc/self/fd");
})();
(() => {
  let $proto$jscomp$3$$ = $ClassHandle$$.prototype;
  Object.assign($proto$jscomp$3$$, {isAliasOf:function($other$jscomp$11_right$jscomp$2$$) {
    if (!(this instanceof $ClassHandle$$ && $other$jscomp$11_right$jscomp$2$$ instanceof $ClassHandle$$)) {
      return !1;
    }
    var $leftClass$$ = this.$$$$.$ptrType$.$registeredClass$, $left$jscomp$2$$ = this.$$$$.$ptr$;
    $other$jscomp$11_right$jscomp$2$$.$$$$ = $other$jscomp$11_right$jscomp$2$$.$$$$;
    var $rightClass$$ = $other$jscomp$11_right$jscomp$2$$.$$$$.$ptrType$.$registeredClass$;
    for ($other$jscomp$11_right$jscomp$2$$ = $other$jscomp$11_right$jscomp$2$$.$$$$.$ptr$; $leftClass$$.$baseClass$;) {
      $left$jscomp$2$$ = $leftClass$$.$upcast$($left$jscomp$2$$), $leftClass$$ = $leftClass$$.$baseClass$;
    }
    for (; $rightClass$$.$baseClass$;) {
      $other$jscomp$11_right$jscomp$2$$ = $rightClass$$.$upcast$($other$jscomp$11_right$jscomp$2$$), $rightClass$$ = $rightClass$$.$baseClass$;
    }
    return $leftClass$$ === $rightClass$$ && $left$jscomp$2$$ === $other$jscomp$11_right$jscomp$2$$;
  }, clone:function() {
    this.$$$$.$ptr$ || $throwInstanceAlreadyDeleted$$(this);
    if (this.$$$$.$preservePointerOnDelete$) {
      return this.$$$$.count.value += 1, this;
    }
    var $JSCompiler_temp_const$jscomp$52_clone$$ = $attachFinalizer$$, $JSCompiler_temp_const$jscomp$51$$ = Object, $JSCompiler_temp_const$jscomp$50$$ = $JSCompiler_temp_const$jscomp$51$$.create, $JSCompiler_temp_const$jscomp$49$$ = Object.getPrototypeOf(this), $o$jscomp$inline_226$$ = this.$$$$;
    $JSCompiler_temp_const$jscomp$52_clone$$ = $JSCompiler_temp_const$jscomp$52_clone$$($JSCompiler_temp_const$jscomp$50$$.call($JSCompiler_temp_const$jscomp$51$$, $JSCompiler_temp_const$jscomp$49$$, {$$$$:{value:{count:$o$jscomp$inline_226$$.count, $deleteScheduled$:$o$jscomp$inline_226$$.$deleteScheduled$, $preservePointerOnDelete$:$o$jscomp$inline_226$$.$preservePointerOnDelete$, $ptr$:$o$jscomp$inline_226$$.$ptr$, $ptrType$:$o$jscomp$inline_226$$.$ptrType$, $smartPtr$:$o$jscomp$inline_226$$.$smartPtr$, 
    $smartPtrType$:$o$jscomp$inline_226$$.$smartPtrType$}}}));
    $JSCompiler_temp_const$jscomp$52_clone$$.$$$$.count.value += 1;
    $JSCompiler_temp_const$jscomp$52_clone$$.$$$$.$deleteScheduled$ = !1;
    return $JSCompiler_temp_const$jscomp$52_clone$$;
  }, ["delete"]() {
    this.$$$$.$ptr$ || $throwInstanceAlreadyDeleted$$(this);
    if (this.$$$$.$deleteScheduled$ && !this.$$$$.$preservePointerOnDelete$) {
      throw new $BindingError$$("Object already scheduled for deletion");
    }
    $detachFinalizer$$(this);
    var $$$$jscomp$inline_230$$ = this.$$$$;
    --$$$$jscomp$inline_230$$.count.value;
    0 === $$$$jscomp$inline_230$$.count.value && ($$$$jscomp$inline_230$$.$smartPtr$ ? $$$$jscomp$inline_230$$.$smartPtrType$.$rawDestructor$($$$$jscomp$inline_230$$.$smartPtr$) : $$$$jscomp$inline_230$$.$ptrType$.$registeredClass$.$rawDestructor$($$$$jscomp$inline_230$$.$ptr$));
    this.$$$$.$preservePointerOnDelete$ || (this.$$$$.$smartPtr$ = void 0, this.$$$$.$ptr$ = void 0);
  }, isDeleted:function() {
    return !this.$$$$.$ptr$;
  }, deleteLater:function() {
    this.$$$$.$ptr$ || $throwInstanceAlreadyDeleted$$(this);
    if (this.$$$$.$deleteScheduled$ && !this.$$$$.$preservePointerOnDelete$) {
      throw new $BindingError$$("Object already scheduled for deletion");
    }
    $deletionQueue$$.push(this);
    this.$$$$.$deleteScheduled$ = !0;
    return this;
  }});
  const $symbolDispose$$ = Symbol.dispose;
  $symbolDispose$$ && ($proto$jscomp$3$$[$symbolDispose$$] = $proto$jscomp$3$$["delete"]);
})();
Object.assign($RegisteredPointer$$.prototype, {$getPointee$($ptr$jscomp$inline_234$$) {
  this.$rawGetPointee$ && ($ptr$jscomp$inline_234$$ = this.$rawGetPointee$($ptr$jscomp$inline_234$$));
  return $ptr$jscomp$inline_234$$;
}, $destructor$($ptr$jscomp$inline_235$$) {
  this.$rawDestructor$?.($ptr$jscomp$inline_235$$);
}, $readValueFromPointer$:$readPointer$$, $fromWireType$:$RegisteredPointer_fromWireType$$});
$assert$$(10 === $emval_handles$$.length);
$Module$$.noExitRuntime && ($noExitRuntime$$ = $Module$$.noExitRuntime);
$Module$$.preloadPlugins && ($preloadPlugins$$ = $Module$$.preloadPlugins);
$Module$$.print && ($out$$ = $Module$$.print);
$Module$$.printErr && ($err$$ = $Module$$.printErr);
$Module$$.wasmBinary && ($wasmBinary$$ = $Module$$.wasmBinary);
Object.getOwnPropertyDescriptor($Module$$, "fetchSettings") && $abort$$("`Module.fetchSettings` was supplied but `fetchSettings` not included in INCOMING_MODULE_JS_API");
$Module$$.thisProgram && ($thisProgram$$ = $Module$$.thisProgram);
$assert$$("undefined" == typeof $Module$$.memoryInitializerPrefixURL, "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
$assert$$("undefined" == typeof $Module$$.pthreadMainPrefixURL, "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
$assert$$("undefined" == typeof $Module$$.cdInitializerPrefixURL, "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
$assert$$("undefined" == typeof $Module$$.filePackagePrefixURL, "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
$assert$$("undefined" == typeof $Module$$.read, "Module.read option was removed");
$assert$$("undefined" == typeof $Module$$.readAsync, "Module.readAsync option was removed (modify readAsync in JS)");
$assert$$("undefined" == typeof $Module$$.readBinary, "Module.readBinary option was removed (modify readBinary in JS)");
$assert$$("undefined" == typeof $Module$$.setWindowTitle, "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
$assert$$("undefined" == typeof $Module$$.TOTAL_MEMORY, "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
$assert$$("undefined" == typeof $Module$$.ENVIRONMENT, "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
$assert$$("undefined" == typeof $Module$$.STACK_SIZE, "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
$assert$$("undefined" == typeof $Module$$.wasmMemory, "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
$assert$$("undefined" == typeof $Module$$.INITIAL_MEMORY, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
if ($Module$$.preInit) {
  for ("function" == typeof $Module$$.preInit && ($Module$$.preInit = [$Module$$.preInit]); 0 < $Module$$.preInit.length;) {
    $Module$$.preInit.shift()();
  }
}
$consumedModuleProp$$("preInit");
$Module$$.addRunDependency = $addRunDependency$$;
$Module$$.removeRunDependency = $removeRunDependency$$;
$Module$$.FS_preloadFile = async($parent$jscomp$10$$, $name$jscomp$82$$, $url$jscomp$26$$, $canRead$jscomp$1$$, $canWrite$jscomp$1$$, $dontCreateFile$$, $canOwn$jscomp$1$$, $preFinish$$) => {
  var $fullname$jscomp$1$$ = $name$jscomp$82$$ ? $PATH_FS$resolve$$($PATH$normalize$$($parent$jscomp$10$$ + "/" + $name$jscomp$82$$)) : $parent$jscomp$10$$, $dep$jscomp$1_id$jscomp$inline_238$$;
  a: {
    for (var $byteArray$jscomp$1_orig$jscomp$inline_239$$ = $dep$jscomp$1_id$jscomp$inline_238$$ = `cp ${$fullname$jscomp$1$$}`;;) {
      if (!$runDependencyTracking$$[$dep$jscomp$1_id$jscomp$inline_238$$]) {
        break a;
      }
      $dep$jscomp$1_id$jscomp$inline_238$$ = $byteArray$jscomp$1_orig$jscomp$inline_239$$ + Math.random();
    }
  }
  $addRunDependency$$($dep$jscomp$1_id$jscomp$inline_238$$);
  try {
    $byteArray$jscomp$1_orig$jscomp$inline_239$$ = $url$jscomp$26$$, "string" == typeof $url$jscomp$26$$ && ($byteArray$jscomp$1_orig$jscomp$inline_239$$ = await $asyncLoad$$($url$jscomp$26$$)), $byteArray$jscomp$1_orig$jscomp$inline_239$$ = await $FS_handledByPreloadPlugin$$($byteArray$jscomp$1_orig$jscomp$inline_239$$, $fullname$jscomp$1$$), $preFinish$$?.(), $dontCreateFile$$ || $FS$createDataFile$$($parent$jscomp$10$$, $name$jscomp$82$$, $byteArray$jscomp$1_orig$jscomp$inline_239$$, $canRead$jscomp$1$$, 
    $canWrite$jscomp$1$$, $canOwn$jscomp$1$$);
  } finally {
    $removeRunDependency$$($dep$jscomp$1_id$jscomp$inline_238$$);
  }
};
$Module$$.FS_unlink = (...$args$jscomp$13$$) => $FS$unlink$$(...$args$jscomp$13$$);
$Module$$.FS_createPath = (...$args$jscomp$12$$) => $FS$createPath$$(...$args$jscomp$12$$);
$Module$$.FS_createDevice = (...$args$jscomp$15$$) => $FS$createDevice$$(...$args$jscomp$15$$);
$Module$$.FS_createDataFile = (...$args$jscomp$6$$) => $FS$createDataFile$$(...$args$jscomp$6$$);
$Module$$.FS_createLazyFile = (...$args$jscomp$14$$) => $FS$createLazyFile$$(...$args$jscomp$14$$);
"writeI53ToI64 writeI53ToI64Clamped writeI53ToI64Signaling writeI53ToU64Clamped writeI53ToU64Signaling readI53FromI64 readI53FromU64 convertI32PairToI53 convertI32PairToI53Checked convertU32PairToI53 stackAlloc getTempRet0 setTempRet0 exitJS withStackSave inetPton4 inetNtop4 inetPton6 inetNtop6 readSockaddr writeSockaddr runMainThreadEmAsm autoResumeAudioContext getDynCaller dynCall handleException runtimeKeepalivePush runtimeKeepalivePop callUserCallback maybeExit asmjsMangle HandleAllocator addOnInit addOnPostCtor addOnPreMain addOnExit STACK_SIZE STACK_ALIGN POINTER_SIZE ASSERTIONS ccall cwrap convertJsFunctionToWasm getEmptyTableSlot updateTableMap getFunctionAddress addFunction removeFunction intArrayToString stringToAscii stringToUTF8OnStack writeArrayToMemory registerKeyEventCallback getBoundingClientRect fillMouseEventData registerMouseEventCallback registerWheelEventCallback registerUiEventCallback registerFocusEventCallback fillDeviceOrientationEventData registerDeviceOrientationEventCallback fillDeviceMotionEventData registerDeviceMotionEventCallback screenOrientation fillOrientationChangeEventData registerOrientationChangeEventCallback fillFullscreenChangeEventData registerFullscreenChangeEventCallback JSEvents_requestFullscreen JSEvents_resizeCanvasForFullscreen registerRestoreOldStyle hideEverythingExceptGivenElement restoreHiddenElements setLetterbox softFullscreenResizeWebGLRenderTarget doRequestFullscreen fillPointerlockChangeEventData registerPointerlockChangeEventCallback registerPointerlockErrorEventCallback requestPointerLock fillVisibilityChangeEventData registerVisibilityChangeEventCallback registerTouchEventCallback fillGamepadEventData registerGamepadEventCallback registerBeforeUnloadEventCallback fillBatteryEventData registerBatteryEventCallback setCanvasElementSize getCanvasElementSize getCallstack wasiRightsToMuslOFlags wasiOFlagsToMuslOFlags safeSetTimeout setImmediateWrapped safeRequestAnimationFrame clearImmediateWrapped registerPostMainLoop registerPreMainLoop getPromise makePromise idsToPromises makePromiseCallback findMatchingCatch Browser_asyncPrepareDataCounter isLeapYear ydayFromDate arraySum addDays getSocketFromFD getSocketAddress FS_mkdirTree _setNetworkCallback emscriptenWebGLGet emscriptenWebGLGetUniform emscriptenWebGLGetVertexAttrib __glGetActiveAttribOrUniform writeGLArray registerWebGlEventCallback runAndAbortIfError emscriptenWebGLGetIndexed ALLOC_NORMAL ALLOC_STACK allocate writeStringToMemory writeAsciiToMemory allocateUTF8 allocateUTF8OnStack demangle stackTrace getNativeTypeSize getFunctionArgsName createJsInvokerSignature PureVirtualError registerInheritedInstance unregisterInheritedInstance getInheritedInstanceCount getLiveInheritedInstances setDelayFunction count_emval_handles getStringOrSymbol emval_returnValue emval_lookupTypes emval_addMethodCaller".split(" ").forEach(function($sym$jscomp$2$$) {
  $unexportedRuntimeSymbol$$($sym$jscomp$2$$);
});
"run out err callMain abort wasmExports HEAPF32 HEAPF64 HEAP8 HEAP16 HEAPU16 HEAP32 HEAPU32 HEAP64 HEAPU64 writeStackCookie checkStackCookie INT53_MAX INT53_MIN bigintToI53Checked stackSave stackRestore createNamedFunction ptrToString zeroMemory getHeapMax growMemory ENV ERRNO_CODES strError DNS Protocols Sockets timers warnOnce withBuiltinMalloc readEmAsmArgsArray readEmAsmArgs runEmAsmFunction jstoi_q getExecutableName keepRuntimeAlive asyncLoad alignMemory mmapAlloc wasmTable wasmMemory getUniqueRunDependency noExitRuntime addOnPreRun addOnPostRun freeTableIndexes functionsInTableMap setValue getValue PATH PATH_FS UTF8Decoder UTF8ArrayToString UTF8ToString stringToUTF8Array stringToUTF8 lengthBytesUTF8 intArrayFromString AsciiToString UTF16Decoder UTF16ToString stringToUTF16 lengthBytesUTF16 UTF32ToString stringToUTF32 lengthBytesUTF32 stringToNewUTF8 JSEvents specialHTMLTargets maybeCStringToJsString findEventTarget findCanvasEventTarget currentFullscreenStrategy restoreOldWindowedStyle jsStackTrace UNWIND_CACHE convertPCtoSourceLocation ExitStatus getEnvStrings checkWasiClock doReadv doWritev initRandomFill randomFill emSetImmediate emClearImmediate_deps emClearImmediate promiseMap uncaughtExceptionCount exceptionLast exceptionCaught ExceptionInfo Browser requestFullscreen requestFullScreen setCanvasSize getUserMedia createContext getPreloadedImageData__data wget MONTH_DAYS_REGULAR MONTH_DAYS_LEAP MONTH_DAYS_REGULAR_CUMULATIVE MONTH_DAYS_LEAP_CUMULATIVE SYSCALLS preloadPlugins FS_createPreloadedFile FS_modeStringToFlags FS_getMode FS_stdin_getChar_buffer FS_stdin_getChar FS_readFile FS FS_root FS_mounts FS_devices FS_streams FS_nextInode FS_nameTable FS_currentPath FS_initialized FS_ignorePermissions FS_filesystems FS_syncFSRequests FS_readFiles FS_lookupPath FS_getPath FS_hashName FS_hashAddNode FS_hashRemoveNode FS_lookupNode FS_createNode FS_destroyNode FS_isRoot FS_isMountpoint FS_isFile FS_isDir FS_isLink FS_isChrdev FS_isBlkdev FS_isFIFO FS_isSocket FS_flagsToPermissionString FS_nodePermissions FS_mayLookup FS_mayCreate FS_mayDelete FS_mayOpen FS_checkOpExists FS_nextfd FS_getStreamChecked FS_getStream FS_createStream FS_closeStream FS_dupStream FS_doSetAttr FS_chrdev_stream_ops FS_major FS_minor FS_makedev FS_registerDevice FS_getDevice FS_getMounts FS_syncfs FS_mount FS_unmount FS_lookup FS_mknod FS_statfs FS_statfsStream FS_statfsNode FS_create FS_mkdir FS_mkdev FS_symlink FS_rename FS_rmdir FS_readdir FS_readlink FS_stat FS_fstat FS_lstat FS_doChmod FS_chmod FS_lchmod FS_fchmod FS_doChown FS_chown FS_lchown FS_fchown FS_doTruncate FS_truncate FS_ftruncate FS_utime FS_open FS_close FS_isClosed FS_llseek FS_read FS_write FS_mmap FS_msync FS_ioctl FS_writeFile FS_cwd FS_chdir FS_createDefaultDirectories FS_createDefaultDevices FS_createSpecialDirectories FS_createStandardStreams FS_staticInit FS_init FS_quit FS_findObject FS_analyzePath FS_createFile FS_forceLoadFile FS_absolutePath FS_createFolder FS_createLink FS_joinPath FS_mmapAlloc FS_standardizePath MEMFS TTY PIPEFS SOCKFS tempFixedLengthArray miniTempWebGLFloatBuffers miniTempWebGLIntBuffers heapObjectForWebGLType toTypedArrayIndex webgl_enable_WEBGL_multi_draw webgl_enable_EXT_polygon_offset_clamp webgl_enable_EXT_clip_control webgl_enable_WEBGL_polygon_mode GL computeUnpackAlignedImageSize colorChannelsInGlTextureFormat emscriptenWebGLGetTexPixelData webglGetUniformLocation webglPrepareUniformLocationsBeforeFirstUse webglGetLeftBracePos AL GLUT EGL GLEW IDBStore SDL SDL_gfx webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance print printErr jstoi_s InternalError BindingError throwInternalError throwBindingError registeredTypes awaitingDependencies typeDependencies tupleRegistrations structRegistrations sharedRegisterType whenDependentTypesAreResolved getTypeName getFunctionName heap32VectorToArray requireRegisteredType usesDestructorStack checkArgCount getRequiredArgCount createJsInvoker UnboundTypeError EmValType EmValOptionalType throwUnboundTypeError ensureOverloadTable exposePublicSymbol replacePublicSymbol embindRepr registeredInstances getBasestPointer getInheritedInstance registeredPointers registerType integerReadValueFromPointer enumReadValueFromPointer floatReadValueFromPointer assertIntegerRange readPointer runDestructors craftInvokerFunction embind__requireFunction genericPointerToWireType constNoSmartPtrRawPointerToWireType nonConstNoSmartPtrRawPointerToWireType init_RegisteredPointer RegisteredPointer RegisteredPointer_fromWireType runDestructor releaseClassHandle finalizationRegistry detachFinalizer_deps detachFinalizer attachFinalizer makeClassHandle init_ClassHandle ClassHandle throwInstanceAlreadyDeleted deletionQueue flushPendingDeletes delayFunction RegisteredClass shallowCopyInternalPointer downcastPointer upcastPointer validateThis char_0 char_9 makeLegalFunctionName emval_freelist emval_handles emval_symbols Emval emval_methodCallers".split(" ").forEach($unexportedRuntimeSymbol$$);
var $ASM_CONSTS$$ = {306914432:() => {
  throw "A böngésződ nem támogatja a WebGL-t!";
}, 306914483:() => {
}, 306914484:() => {
}, 306914485:() => {
}, 306914486:() => {
}, 306914487:() => {
}, 306914488:() => {
}, 306914489:() => {
}, 306914490:() => {
}, 306914491:() => {
}, 306914492:() => {
}, 306914493:() => {
}, 306914494:() => {
}, 306914495:() => {
}, 306914496:() => {
}, 306914497:() => {
}, 306914498:() => {
}, 306914499:() => {
}, 306914500:() => {
}, 306914501:() => {
}, 306914502:() => {
}, 306914503:() => {
}, 306914504:() => {
}, 306914505:() => {
}, 306914506:() => {
}, 306914507:() => {
}, 306914508:() => {
}, 306914509:() => {
}, 306914510:() => {
}, 306914511:() => {
}, 306914512:() => {
}, 306914513:() => {
}, 306914514:() => {
}, 306914515:() => {
}, 306914516:() => {
}, 306914517:() => {
}, 306914518:() => {
}, 306914519:() => {
}, 306914520:() => {
}, 306914521:() => {
}, 306914522:() => {
}, 306914523:() => {
}, 306914524:() => {
}, 306914525:() => {
}, 306914526:() => {
}, 306914527:() => {
}, 306914528:() => {
  console.error("Renderer: Tried to set non-existent shader!");
}, 306914589:() => {
}, 306914590:() => {
}, 306914591:() => {
}, 306914592:() => {
}, 306914593:() => {
}, 306914594:() => {
}, 306914595:() => {
}, 306914596:() => {
}, 306914597:() => {
}, 306914598:() => {
}, 306914599:() => {
}, 306914600:() => {
}, 306914601:() => {
}, 306914602:() => {
}, 306914603:() => {
}, 306914604:() => {
}, 306914605:() => {
}, 306914606:() => {
}, 306914607:() => {
}, 306914608:() => {
}, 306914609:() => {
}, 306914610:() => {
}, 306914611:() => {
}, 306914612:() => {
}, 306914613:() => {
}, 306914614:() => {
}, 306914615:() => {
}, 306914616:() => {
}, 306914617:() => {
}, 306914618:() => {
}, 306914619:() => {
}, 306914620:() => {
}, 306914621:() => {
}, 306914622:() => {
}, 306914623:() => {
}, 306914624:() => {
  console.error("Renderer: No shader is set!");
}, 306914669:() => {
}, 306914670:() => {
}, 306914671:() => {
}, 306914672:() => {
}, 306914673:() => {
}, 306914674:() => {
}, 306914675:() => {
}, 306914676:() => {
}, 306914677:() => {
}, 306914678:() => {
}, 306914679:() => {
}, 306914680:() => {
}, 306914681:() => {
}, 306914682:() => {
}, 306914683:() => {
}, 306914684:() => {
}, 306914685:() => {
}, 306914686:() => {
}, 306914687:() => {
}, 306914688:() => {
}, 306914689:() => {
}, 306914690:() => {
}, 306914691:() => {
}, 306914692:() => {
}, 306914693:() => {
}, 306914694:() => {
}, 306914695:() => {
}, 306914696:() => {
}, 306914697:() => {
}, 306914698:() => {
}, 306914699:() => {
}, 306914700:() => {
}, 306914701:() => {
}, 306914702:() => {
}, 306914703:() => {
}, 306914704:() => {
}, 306914705:() => {
}, 306914706:() => {
}, 306914707:() => {
}, 306914708:() => {
}, 306914709:() => {
}, 306914710:() => {
}, 306914711:() => {
}, 306914712:() => {
}, 306914713:() => {
}, 306914714:() => {
}, 306914715:() => {
}, 306914716:() => {
}, 306914717:() => {
}, 306914718:() => {
}, 306914719:() => {
}, 306914720:$$0$$ => {
  throw "Sikertelen shader fordítás: " + $UTF8ToString$$($$0$$);
}, 306914784:() => {
}, 306914785:() => {
}, 306914786:() => {
}, 306914787:() => {
}, 306914788:() => {
}, 306914789:() => {
}, 306914790:() => {
}, 306914791:() => {
}, 306914792:() => {
}, 306914793:() => {
}, 306914794:() => {
}, 306914795:() => {
}, 306914796:() => {
}, 306914797:() => {
}, 306914798:() => {
}, 306914799:() => {
}, 306914800:() => {
}, 306914801:() => {
}, 306914802:() => {
}, 306914803:() => {
}, 306914804:() => {
}, 306914805:() => {
}, 306914806:() => {
}, 306914807:() => {
}, 306914808:() => {
}, 306914809:() => {
}, 306914810:() => {
}, 306914811:() => {
}, 306914812:() => {
}, 306914813:() => {
}, 306914814:() => {
}, 306914815:() => {
}, 306914816:$$0$jscomp$1$$ => {
  throw "Sikertelen shader összekapcsolás: " + $UTF8ToString$$($$0$jscomp$1$$);
}, 306914886:() => {
}, 306914887:() => {
}, 306914888:() => {
}, 306914889:() => {
}, 306914890:() => {
}, 306914891:() => {
}, 306914892:() => {
}, 306914893:() => {
}, 306914894:() => {
}, 306914895:() => {
}, 306914896:() => {
}, 306914897:() => {
}, 306914898:() => {
}, 306914899:() => {
}, 306914900:() => {
}, 306914901:() => {
}, 306914902:() => {
}, 306914903:() => {
}, 306914904:() => {
}, 306914905:() => {
}, 306914906:() => {
}, 306914907:() => {
}, 306914908:() => {
}, 306914909:() => {
}, 306914910:() => {
}, 306914911:() => {
}, 306914912:() => {
}, 306914913:() => {
}, 306914914:() => {
}, 306914915:() => {
}, 306914916:() => {
}, 306914917:() => {
}, 306914918:() => {
}, 306914919:() => {
}, 306914920:() => {
}, 306914921:() => {
}, 306914922:() => {
}, 306914923:() => {
}, 306914924:() => {
}, 306914925:() => {
}, 306914926:() => {
}, 306914927:() => {
}, 306914928:() => {
}, 306914929:() => {
}, 306914930:() => {
}, 306914931:() => {
}, 306914932:() => {
}, 306914933:() => {
}, 306914934:() => {
}, 306914935:() => {
}, 306914936:() => {
}, 306914937:() => {
}, 306914938:() => {
}, 306914939:() => {
}, 306914940:() => {
}, 306914941:() => {
}, 306914942:() => {
}, 306914943:() => {
}, 306914944:($$0$jscomp$2$$, $$1_fps$$) => {
  if ($$1_fps$$ = document.getElementById($UTF8ToString$$($$1_fps$$))) {
    $$1_fps$$.innerText = $$0$jscomp$2$$;
  }
}, 306915034:() => {
}, 306915035:() => {
}, 306915036:() => {
}, 306915037:() => {
}, 306915038:() => {
}, 306915039:() => {
}, 306915040:() => {
}, 306915041:() => {
}, 306915042:() => {
}, 306915043:() => {
}, 306915044:() => {
}, 306915045:() => {
}, 306915046:() => {
}, 306915047:() => {
}, 306915048:() => {
}, 306915049:() => {
}, 306915050:() => {
}, 306915051:() => {
}, 306915052:() => {
}, 306915053:() => {
}, 306915054:() => {
}, 306915055:() => {
}, 306915056:() => {
}, 306915057:() => {
}, 306915058:() => {
}, 306915059:() => {
}, 306915060:() => {
}, 306915061:() => {
}, 306915062:() => {
}, 306915063:() => {
}, 306915064:() => {
}, 306915065:() => {
}, 306915066:() => {
}, 306915067:() => {
}, 306915068:() => {
}, 306915069:() => {
}, 306915070:() => {
}, 306915071:() => {
}, 306915072:$$0$jscomp$3$$ => {
  throw "Sikertelen fájl beolvasás: " + $UTF8ToString$$($$0$jscomp$3$$);
}}, $___getTypeName$$ = $makeInvalidEarlyAccess$$("___getTypeName"), $_malloc$$ = $makeInvalidEarlyAccess$$("_malloc"), $_free$$ = $makeInvalidEarlyAccess$$("_free"), $_emscripten_stack_get_end$$ = $makeInvalidEarlyAccess$$("_emscripten_stack_get_end"), $_strerror$$ = $makeInvalidEarlyAccess$$("_strerror"), $_emscripten_builtin_malloc$$ = $makeInvalidEarlyAccess$$("_emscripten_builtin_malloc"), $_emscripten_builtin_free$$ = $makeInvalidEarlyAccess$$("_emscripten_builtin_free"), $_emscripten_builtin_memalign$$ = 
$makeInvalidEarlyAccess$$("_emscripten_builtin_memalign"), $_emscripten_stack_init$$ = $makeInvalidEarlyAccess$$("_emscripten_stack_init");
$Module$$.__ZN6__asan9FakeStack17AddrIsInFakeStackEm = $makeInvalidEarlyAccess$$("__ZN6__asan9FakeStack17AddrIsInFakeStackEm");
$Module$$.__ZN6__asan9FakeStack8AllocateEmmm = $makeInvalidEarlyAccess$$("__ZN6__asan9FakeStack8AllocateEmmm");
var $___asan_loadN$$ = $makeInvalidEarlyAccess$$("___asan_loadN"), $___asan_storeN$$ = $makeInvalidEarlyAccess$$("___asan_storeN"), $wasmMemory$$ = $makeInvalidEarlyAccess$$("wasmMemory"), $wasmTable$$ = $makeInvalidEarlyAccess$$("wasmTable"), $wasmImports$$ = {__assert_fail:($condition$jscomp$3$$, $filename$jscomp$3$$, $line$jscomp$7$$, $func$jscomp$7$$) => $abort$$(`Assertion failed: ${$UTF8ToString$$($condition$jscomp$3$$)}, at: ` + [$filename$jscomp$3$$ ? $UTF8ToString$$($filename$jscomp$3$$) : 
"unknown filename", $line$jscomp$7$$, $func$jscomp$7$$ ? $UTF8ToString$$($func$jscomp$7$$) : "unknown function"]), __cxa_throw:($JSCompiler_StaticMethods_init$self$jscomp$inline_241_ptr$jscomp$4$$, $type$jscomp$170$$, $destructor$jscomp$2$$) => {
  $JSCompiler_StaticMethods_init$self$jscomp$inline_241_ptr$jscomp$4$$ = new $ExceptionInfo$$($JSCompiler_StaticMethods_init$self$jscomp$inline_241_ptr$jscomp$4$$);
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $JSCompiler_StaticMethods_init$self$jscomp$inline_241_ptr$jscomp$4$$.$ptr$ + 16 >> 2, $___asan_storeN$$)] = 0;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $JSCompiler_StaticMethods_init$self$jscomp$inline_241_ptr$jscomp$4$$.$ptr$ + 4 >> 2, $___asan_storeN$$)] = $type$jscomp$170$$;
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $JSCompiler_StaticMethods_init$self$jscomp$inline_241_ptr$jscomp$4$$.$ptr$ + 8 >> 2, $___asan_storeN$$)] = $destructor$jscomp$2$$;
  $uncaughtExceptionCount$$++;
  $assert$$(!1, "Exception thrown, but exception catching is not enabled. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.");
}, __syscall_dup:function($fd$jscomp$12$$) {
  try {
    var $old$$ = $FS$getStreamChecked$$($fd$jscomp$12$$);
    return $FS$dupStream$$($old$$).$fd$;
  } catch ($e$jscomp$25$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$25$$.name) {
      throw $e$jscomp$25$$;
    }
    return -$e$jscomp$25$$.$errno$;
  }
}, __syscall_fcntl64:function($fd$jscomp$13$$, $cmd$jscomp$1$$, $varargs$$) {
  $SYSCALLS$varargs$$ = $varargs$$;
  try {
    var $stream$jscomp$51$$ = $FS$getStreamChecked$$($fd$jscomp$13$$);
    switch($cmd$jscomp$1$$) {
      case 0:
        var $arg$jscomp$11$$ = $syscallGetVarargI$$();
        if (0 > $arg$jscomp$11$$) {
          break;
        }
        for (; $FS$streams$$[$arg$jscomp$11$$];) {
          $arg$jscomp$11$$++;
        }
        return $FS$dupStream$$($stream$jscomp$51$$, $arg$jscomp$11$$).$fd$;
      case 1:
      case 2:
        return 0;
      case 3:
        return $stream$jscomp$51$$.flags;
      case 4:
        return $arg$jscomp$11$$ = $syscallGetVarargI$$(), $stream$jscomp$51$$.flags |= $arg$jscomp$11$$, 0;
      case 12:
        return $arg$jscomp$11$$ = $syscallGetVarargI$$(), $HEAP16$$[$_asan_js_check_index$$($HEAP16$$, $arg$jscomp$11$$ + 0 >> 1, $___asan_storeN$$)] = 2, 0;
      case 13:
      case 14:
        return 0;
    }
    return -28;
  } catch ($e$jscomp$26$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$26$$.name) {
      throw $e$jscomp$26$$;
    }
    return -$e$jscomp$26$$.$errno$;
  }
}, __syscall_fstat64:function($arg$jscomp$inline_249_fd$jscomp$14$$, $buf$jscomp$3$$) {
  try {
    var $stream$jscomp$inline_246$$ = $FS$getStreamChecked$$($arg$jscomp$inline_249_fd$jscomp$14$$), $node$jscomp$inline_247$$ = $stream$jscomp$inline_246$$.node, $getattr$jscomp$inline_248$$ = $stream$jscomp$inline_246$$.$stream_ops$.$getattr$;
    $arg$jscomp$inline_249_fd$jscomp$14$$ = $getattr$jscomp$inline_248$$ ? $stream$jscomp$inline_246$$ : $node$jscomp$inline_247$$;
    $getattr$jscomp$inline_248$$ ??= $node$jscomp$inline_247$$.$node_ops$.$getattr$;
    $FS$checkOpExists$$($getattr$jscomp$inline_248$$);
    var $JSCompiler_inline_result$jscomp$7$$ = $getattr$jscomp$inline_248$$($arg$jscomp$inline_249_fd$jscomp$14$$);
    return $SYSCALLS$writeStat$$($buf$jscomp$3$$, $JSCompiler_inline_result$jscomp$7$$);
  } catch ($e$jscomp$27$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$27$$.name) {
      throw $e$jscomp$27$$;
    }
    return -$e$jscomp$27$$.$errno$;
  }
}, __syscall_ioctl:function($fd$jscomp$15$$, $JSCompiler_object_inline_c_cc_366_c_cc_op$jscomp$1$$, $varargs$jscomp$1$$) {
  $SYSCALLS$varargs$$ = $varargs$jscomp$1$$;
  try {
    var $stream$jscomp$52$$ = $FS$getStreamChecked$$($fd$jscomp$15$$);
    switch($JSCompiler_object_inline_c_cc_366_c_cc_op$jscomp$1$$) {
      case 21509:
        return $stream$jscomp$52$$.$tty$ ? 0 : -59;
      case 21505:
        if (!$stream$jscomp$52$$.$tty$) {
          return -59;
        }
        if ($stream$jscomp$52$$.$tty$.$ops$.$ioctl_tcgets$) {
          $JSCompiler_object_inline_c_cc_366_c_cc_op$jscomp$1$$ = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          var $arg$jscomp$inline_253_argp$$ = $syscallGetVarargI$$();
          $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ >> 2, $___asan_storeN$$)] = 25856;
          $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ + 4 >> 2, $___asan_storeN$$)] = 5;
          $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ + 8 >> 2, $___asan_storeN$$)] = 191;
          $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ + 12 >> 2, $___asan_storeN$$)] = 35387;
          for (var $i$jscomp$21_winsize$$ = 0; 32 > $i$jscomp$21_winsize$$; $i$jscomp$21_winsize$$++) {
            $HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $arg$jscomp$inline_253_argp$$ + $i$jscomp$21_winsize$$ + 17, $___asan_storeN$$)] = $JSCompiler_object_inline_c_cc_366_c_cc_op$jscomp$1$$[$i$jscomp$21_winsize$$] || 0;
          }
        }
        return 0;
      case 21510:
      case 21511:
      case 21512:
        return $stream$jscomp$52$$.$tty$ ? 0 : -59;
      case 21506:
      case 21507:
      case 21508:
        if (!$stream$jscomp$52$$.$tty$) {
          return -59;
        }
        if ($stream$jscomp$52$$.$tty$.$ops$.$ioctl_tcsets$) {
          for ($arg$jscomp$inline_253_argp$$ = $syscallGetVarargI$$(), $_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ >> 2, $___asan_loadN$$), $_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ + 4 >> 2, $___asan_loadN$$), $_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ + 8 >> 2, $___asan_loadN$$), $_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ + 12 >> 2, $___asan_loadN$$), $JSCompiler_object_inline_c_cc_366_c_cc_op$jscomp$1$$ = [], 
          $i$jscomp$21_winsize$$ = 0; 32 > $i$jscomp$21_winsize$$; $i$jscomp$21_winsize$$++) {
            $JSCompiler_object_inline_c_cc_366_c_cc_op$jscomp$1$$.push($HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $arg$jscomp$inline_253_argp$$ + $i$jscomp$21_winsize$$ + 17, $___asan_loadN$$)]);
          }
        }
        return 0;
      case 21519:
        if (!$stream$jscomp$52$$.$tty$) {
          return -59;
        }
        $arg$jscomp$inline_253_argp$$ = $syscallGetVarargI$$();
        return $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $arg$jscomp$inline_253_argp$$ >> 2, $___asan_storeN$$)] = 0;
      case 21520:
        return $stream$jscomp$52$$.$tty$ ? -28 : -59;
      case 21537:
      case 21531:
        $arg$jscomp$inline_253_argp$$ = $syscallGetVarargI$$();
        if (!$stream$jscomp$52$$.$stream_ops$.$ioctl$) {
          throw new $FS$ErrnoError$$(59);
        }
        return $stream$jscomp$52$$.$stream_ops$.$ioctl$($stream$jscomp$52$$, $JSCompiler_object_inline_c_cc_366_c_cc_op$jscomp$1$$, $arg$jscomp$inline_253_argp$$);
      case 21523:
        if (!$stream$jscomp$52$$.$tty$) {
          return -59;
        }
        $stream$jscomp$52$$.$tty$.$ops$.$ioctl_tiocgwinsz$ && ($i$jscomp$21_winsize$$ = [24, 80], $arg$jscomp$inline_253_argp$$ = $syscallGetVarargI$$(), $HEAP16$$[$_asan_js_check_index$$($HEAP16$$, $arg$jscomp$inline_253_argp$$ >> 1, $___asan_storeN$$)] = $i$jscomp$21_winsize$$[0], $HEAP16$$[$_asan_js_check_index$$($HEAP16$$, $arg$jscomp$inline_253_argp$$ + 2 >> 1, $___asan_storeN$$)] = $i$jscomp$21_winsize$$[1]);
        return 0;
      case 21524:
        return $stream$jscomp$52$$.$tty$ ? 0 : -59;
      case 21515:
        return $stream$jscomp$52$$.$tty$ ? 0 : -59;
      default:
        return -28;
    }
  } catch ($e$jscomp$28$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$28$$.name) {
      throw $e$jscomp$28$$;
    }
    return -$e$jscomp$28$$.$errno$;
  }
}, __syscall_lstat64:function($path$jscomp$42$$, $buf$jscomp$4$$) {
  try {
    return $path$jscomp$42$$ = $UTF8ToString$$($path$jscomp$42$$), $SYSCALLS$writeStat$$($buf$jscomp$4$$, $FS$stat$$($path$jscomp$42$$, !0));
  } catch ($e$jscomp$29$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$29$$.name) {
      throw $e$jscomp$29$$;
    }
    return -$e$jscomp$29$$.$errno$;
  }
}, __syscall_mkdirat:function($dirfd$jscomp$1$$, $path$jscomp$43$$, $mode$jscomp$40$$) {
  try {
    return $path$jscomp$43$$ = $UTF8ToString$$($path$jscomp$43$$), $path$jscomp$43$$ = $SYSCALLS$calculateAt$$($dirfd$jscomp$1$$, $path$jscomp$43$$), $FS$mkdir$$($path$jscomp$43$$, $mode$jscomp$40$$), 0;
  } catch ($e$jscomp$30$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$30$$.name) {
      throw $e$jscomp$30$$;
    }
    return -$e$jscomp$30$$.$errno$;
  }
}, __syscall_newfstatat:function($dirfd$jscomp$2$$, $path$jscomp$44$$, $buf$jscomp$5$$, $flags$jscomp$13$$) {
  try {
    $path$jscomp$44$$ = $UTF8ToString$$($path$jscomp$44$$);
    var $nofollow$$ = $flags$jscomp$13$$ & 256, $allowEmpty$jscomp$1$$ = $flags$jscomp$13$$ & 4096;
    $flags$jscomp$13$$ &= -6401;
    $assert$$(!$flags$jscomp$13$$, `unknown flags in __syscall_newfstatat: ${$flags$jscomp$13$$}`);
    $path$jscomp$44$$ = $SYSCALLS$calculateAt$$($dirfd$jscomp$2$$, $path$jscomp$44$$, $allowEmpty$jscomp$1$$);
    return $SYSCALLS$writeStat$$($buf$jscomp$5$$, $nofollow$$ ? $FS$stat$$($path$jscomp$44$$, !0) : $FS$stat$$($path$jscomp$44$$));
  } catch ($e$jscomp$31$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$31$$.name) {
      throw $e$jscomp$31$$;
    }
    return -$e$jscomp$31$$.$errno$;
  }
}, __syscall_openat:function($dirfd$jscomp$3$$, $path$jscomp$45$$, $flags$jscomp$14$$, $varargs$jscomp$2$$) {
  $SYSCALLS$varargs$$ = $varargs$jscomp$2$$;
  try {
    $path$jscomp$45$$ = $UTF8ToString$$($path$jscomp$45$$);
    $path$jscomp$45$$ = $SYSCALLS$calculateAt$$($dirfd$jscomp$3$$, $path$jscomp$45$$);
    var $mode$jscomp$41$$ = $varargs$jscomp$2$$ ? $syscallGetVarargI$$() : 0;
    return $FS$open$$($path$jscomp$45$$, $flags$jscomp$14$$, $mode$jscomp$41$$).$fd$;
  } catch ($e$jscomp$32$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$32$$.name) {
      throw $e$jscomp$32$$;
    }
    return -$e$jscomp$32$$.$errno$;
  }
}, __syscall_stat64:function($path$jscomp$46$$, $buf$jscomp$6$$) {
  try {
    return $path$jscomp$46$$ = $UTF8ToString$$($path$jscomp$46$$), $SYSCALLS$writeStat$$($buf$jscomp$6$$, $FS$stat$$($path$jscomp$46$$));
  } catch ($e$jscomp$33$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$33$$.name) {
      throw $e$jscomp$33$$;
    }
    return -$e$jscomp$33$$.$errno$;
  }
}, _abort_js:() => $abort$$("native code called abort()"), _embind_finalize_value_object:$structType$$ => {
  var $reg$$ = $structRegistrations$$[$structType$$];
  delete $structRegistrations$$[$structType$$];
  var $rawConstructor$$ = $reg$$.$rawConstructor$, $rawDestructor$$ = $reg$$.$rawDestructor$, $fieldRecords$$ = $reg$$.$fields$, $fieldTypes$$ = $fieldRecords$$.map($field$$ => $field$$.$getterReturnType$).concat($fieldRecords$$.map($field$jscomp$1$$ => $field$jscomp$1$$.$setterArgumentType$));
  $whenDependentTypesAreResolved$$([$structType$$], $fieldTypes$$, $fieldTypes$jscomp$1$$ => {
    var $fields$$ = {}, $i$jscomp$24$$, $field$jscomp$2$$;
    for ([$i$jscomp$24$$, $field$jscomp$2$$] of $fieldRecords$$.entries()) {
      const $getterReturnType$$ = $fieldTypes$jscomp$1$$[$i$jscomp$24$$], $getter$jscomp$1$$ = $field$jscomp$2$$.$getter$, $getterContext$$ = $field$jscomp$2$$.$getterContext$, $setterArgumentType$$ = $fieldTypes$jscomp$1$$[$i$jscomp$24$$ + $fieldRecords$$.length], $setter$$ = $field$jscomp$2$$.$setter$, $setterContext$$ = $field$jscomp$2$$.$setterContext$;
      $fields$$[$field$jscomp$2$$.$fieldName$] = {read:$ptr$jscomp$11$$ => $getterReturnType$$.$fromWireType$($getter$jscomp$1$$($getterContext$$, $ptr$jscomp$11$$)), write:($ptr$jscomp$12$$, $o$$) => {
        var $destructors$jscomp$1$$ = [];
        $setter$$($setterContext$$, $ptr$jscomp$12$$, $setterArgumentType$$.$toWireType$($destructors$jscomp$1$$, $o$$));
        $runDestructors$$($destructors$jscomp$1$$);
      }, optional:$getterReturnType$$.optional};
    }
    return [{name:$reg$$.name, $fromWireType$:$ptr$jscomp$13$$ => {
      var $rv$$ = {}, $i$jscomp$25$$;
      for ($i$jscomp$25$$ in $fields$$) {
        $rv$$[$i$jscomp$25$$] = $fields$$[$i$jscomp$25$$].read($ptr$jscomp$13$$);
      }
      $rawDestructor$$($ptr$jscomp$13$$);
      return $rv$$;
    }, $toWireType$:($destructors$jscomp$2$$, $o$jscomp$1$$) => {
      for (var $fieldName$$ in $fields$$) {
        if (!($fieldName$$ in $o$jscomp$1$$ || $fields$$[$fieldName$$].optional)) {
          throw new TypeError(`Missing field: "${$fieldName$$}"`);
        }
      }
      var $ptr$jscomp$14$$ = $rawConstructor$$();
      for ($fieldName$$ in $fields$$) {
        $fields$$[$fieldName$$].write($ptr$jscomp$14$$, $o$jscomp$1$$[$fieldName$$]);
      }
      null !== $destructors$jscomp$2$$ && $destructors$jscomp$2$$.push($rawDestructor$$, $ptr$jscomp$14$$);
      return $ptr$jscomp$14$$;
    }, $readValueFromPointer$:$readPointer$$, $destructorFunction$:$rawDestructor$$}];
  });
}, _embind_register_bigint:($primitiveType$$, $name$jscomp$101$$, $size$jscomp$26$$, $minRange$jscomp$1$$, $maxRange$jscomp$1$$) => {
  $name$jscomp$101$$ = $AsciiToString$$($name$jscomp$101$$);
  const $isUnsignedType$$ = 0n === $minRange$jscomp$1$$;
  let $fromWireType$$ = $value$jscomp$97$$ => $value$jscomp$97$$;
  if ($isUnsignedType$$) {
    const $bitSize$$ = 8 * $size$jscomp$26$$;
    $fromWireType$$ = $value$jscomp$98$$ => BigInt.asUintN($bitSize$$, $value$jscomp$98$$);
    $maxRange$jscomp$1$$ = $fromWireType$$($maxRange$jscomp$1$$);
  }
  $registerType$$($primitiveType$$, {name:$name$jscomp$101$$, $fromWireType$:$fromWireType$$, $toWireType$:($destructors$jscomp$3$$, $value$jscomp$99$$) => {
    if ("number" == typeof $value$jscomp$99$$) {
      $value$jscomp$99$$ = BigInt($value$jscomp$99$$);
    } else if ("bigint" != typeof $value$jscomp$99$$) {
      throw new TypeError(`Cannot convert "${$embindRepr$$($value$jscomp$99$$)}" to ${this.name}`);
    }
    $assertIntegerRange$$($name$jscomp$101$$, $value$jscomp$99$$, $minRange$jscomp$1$$, $maxRange$jscomp$1$$);
    return $value$jscomp$99$$;
  }, $readValueFromPointer$:$integerReadValueFromPointer$$($name$jscomp$101$$, $size$jscomp$26$$, !$isUnsignedType$$), $destructorFunction$:null});
}, _embind_register_bool:($rawType$jscomp$2$$, $name$jscomp$102$$, $trueValue$$, $falseValue$$) => {
  $name$jscomp$102$$ = $AsciiToString$$($name$jscomp$102$$);
  $registerType$$($rawType$jscomp$2$$, {name:$name$jscomp$102$$, $fromWireType$:function($wt$$) {
    return !!$wt$$;
  }, $toWireType$:function($destructors$jscomp$4$$, $o$jscomp$2$$) {
    return $o$jscomp$2$$ ? $trueValue$$ : $falseValue$$;
  }, $readValueFromPointer$:function($pointer$jscomp$9$$) {
    return this.$fromWireType$($HEAPU8$$[$_asan_js_check_index$$($HEAPU8$$, $pointer$jscomp$9$$, $___asan_loadN$$)]);
  }, $destructorFunction$:null});
}, _embind_register_class:($rawType$jscomp$3$$, $rawPointerType$$, $rawConstPointerType$$, $baseClassRawType$$, $getActualTypeSignature$$, $getActualType$jscomp$1$$, $upcastSignature$$, $upcast$jscomp$1$$, $downcastSignature$$, $downcast$jscomp$1$$, $name$jscomp$109$$, $destructorSignature$$, $rawDestructor$jscomp$3$$) => {
  $name$jscomp$109$$ = $AsciiToString$$($name$jscomp$109$$);
  $getActualType$jscomp$1$$ = $embind__requireFunction$$($getActualTypeSignature$$, $getActualType$jscomp$1$$);
  $upcast$jscomp$1$$ &&= $embind__requireFunction$$($upcastSignature$$, $upcast$jscomp$1$$);
  $downcast$jscomp$1$$ &&= $embind__requireFunction$$($downcastSignature$$, $downcast$jscomp$1$$);
  $rawDestructor$jscomp$3$$ = $embind__requireFunction$$($destructorSignature$$, $rawDestructor$jscomp$3$$);
  var $legalFunctionName$$ = $makeLegalFunctionName$$($name$jscomp$109$$);
  $exposePublicSymbol$$($legalFunctionName$$, function() {
    $throwUnboundTypeError$$(`Cannot construct ${$name$jscomp$109$$} due to unbound types`, [$baseClassRawType$$]);
  });
  $whenDependentTypesAreResolved$$([$rawType$jscomp$3$$, $rawPointerType$$, $rawConstPointerType$$], $baseClassRawType$$ ? [$baseClassRawType$$] : [], $base$jscomp$3_constructor$jscomp$1$$ => {
    $base$jscomp$3_constructor$jscomp$1$$ = $base$jscomp$3_constructor$jscomp$1$$[0];
    if ($baseClassRawType$$) {
      var $baseClass$jscomp$1_referenceConverter$$ = $base$jscomp$3_constructor$jscomp$1$$.$registeredClass$;
      var $basePrototype_constPointerConverter$$ = $baseClass$jscomp$1_referenceConverter$$.$instancePrototype$;
    } else {
      $basePrototype_constPointerConverter$$ = $ClassHandle$$.prototype;
    }
    $base$jscomp$3_constructor$jscomp$1$$ = $createNamedFunction$$($name$jscomp$109$$, function(...$args$jscomp$9$$) {
      if (Object.getPrototypeOf(this) !== $instancePrototype$jscomp$1$$) {
        throw new $BindingError$$(`Use 'new' to construct ${$name$jscomp$109$$}`);
      }
      if (void 0 === $registeredClass$jscomp$1$$.$constructor_body$) {
        throw new $BindingError$$(`${$name$jscomp$109$$} has no accessible constructor`);
      }
      var $body$jscomp$1$$ = $registeredClass$jscomp$1$$.$constructor_body$[$args$jscomp$9$$.length];
      if (void 0 === $body$jscomp$1$$) {
        throw new $BindingError$$(`Tried to invoke ctor of ${$name$jscomp$109$$} with invalid number of parameters (${$args$jscomp$9$$.length}) - expected (${Object.keys($registeredClass$jscomp$1$$.$constructor_body$).toString()}) parameters instead!`);
      }
      return $body$jscomp$1$$.apply(this, $args$jscomp$9$$);
    });
    var $instancePrototype$jscomp$1$$ = Object.create($basePrototype_constPointerConverter$$, {constructor:{value:$base$jscomp$3_constructor$jscomp$1$$}});
    $base$jscomp$3_constructor$jscomp$1$$.prototype = $instancePrototype$jscomp$1$$;
    var $registeredClass$jscomp$1$$ = new $RegisteredClass$$($name$jscomp$109$$, $base$jscomp$3_constructor$jscomp$1$$, $instancePrototype$jscomp$1$$, $rawDestructor$jscomp$3$$, $baseClass$jscomp$1_referenceConverter$$, $getActualType$jscomp$1$$, $upcast$jscomp$1$$, $downcast$jscomp$1$$);
    if ($registeredClass$jscomp$1$$.$baseClass$) {
      var $$jscomp$logical$assign$tmpm688594953$4_pointerConverter$$;
      ($$jscomp$logical$assign$tmpm688594953$4_pointerConverter$$ = $registeredClass$jscomp$1$$.$baseClass$).$__derivedClasses$ ?? ($$jscomp$logical$assign$tmpm688594953$4_pointerConverter$$.$__derivedClasses$ = []);
      $registeredClass$jscomp$1$$.$baseClass$.$__derivedClasses$.push($registeredClass$jscomp$1$$);
    }
    $baseClass$jscomp$1_referenceConverter$$ = new $RegisteredPointer$$($name$jscomp$109$$, $registeredClass$jscomp$1$$, !0, !1, !1);
    $$jscomp$logical$assign$tmpm688594953$4_pointerConverter$$ = new $RegisteredPointer$$($name$jscomp$109$$ + "*", $registeredClass$jscomp$1$$, !1, !1, !1);
    $basePrototype_constPointerConverter$$ = new $RegisteredPointer$$($name$jscomp$109$$ + " const*", $registeredClass$jscomp$1$$, !1, !0, !1);
    $registeredPointers$$[$rawType$jscomp$3$$] = {pointerType:$$jscomp$logical$assign$tmpm688594953$4_pointerConverter$$, $constPointerType$:$basePrototype_constPointerConverter$$};
    $replacePublicSymbol$$($legalFunctionName$$, $base$jscomp$3_constructor$jscomp$1$$);
    return [$baseClass$jscomp$1_referenceConverter$$, $$jscomp$logical$assign$tmpm688594953$4_pointerConverter$$, $basePrototype_constPointerConverter$$];
  });
}, _embind_register_class_class_function:($rawClassType$$, $methodName$jscomp$1$$, $argCount$jscomp$2$$, $rawArgTypesAddr$$, $invokerSignature$$, $rawInvoker$$, $fn$jscomp$1$$, $isAsync$jscomp$3$$) => {
  var $rawArgTypes$$ = $heap32VectorToArray$$($argCount$jscomp$2$$, $rawArgTypesAddr$$);
  $methodName$jscomp$1$$ = $AsciiToString$$($methodName$jscomp$1$$);
  $methodName$jscomp$1$$ = $getFunctionName$$($methodName$jscomp$1$$);
  $rawInvoker$$ = $embind__requireFunction$$($invokerSignature$$, $rawInvoker$$, $isAsync$jscomp$3$$);
  $whenDependentTypesAreResolved$$([], [$rawClassType$$], $classType$jscomp$1$$ => {
    function $unboundTypesHandler$$() {
      $throwUnboundTypeError$$(`Cannot call ${$humanName$jscomp$3$$} due to unbound types`, $rawArgTypes$$);
    }
    $classType$jscomp$1$$ = $classType$jscomp$1$$[0];
    var $humanName$jscomp$3$$ = `${$classType$jscomp$1$$.name}.${$methodName$jscomp$1$$}`;
    $methodName$jscomp$1$$.startsWith("@@") && ($methodName$jscomp$1$$ = Symbol[$methodName$jscomp$1$$.substring(2)]);
    var $proto$jscomp$5$$ = $classType$jscomp$1$$.$registeredClass$.constructor;
    void 0 === $proto$jscomp$5$$[$methodName$jscomp$1$$] ? ($unboundTypesHandler$$.$argCount$ = $argCount$jscomp$2$$ - 1, $proto$jscomp$5$$[$methodName$jscomp$1$$] = $unboundTypesHandler$$) : ($ensureOverloadTable$$($proto$jscomp$5$$, $methodName$jscomp$1$$, $humanName$jscomp$3$$), $proto$jscomp$5$$[$methodName$jscomp$1$$].$overloadTable$[$argCount$jscomp$2$$ - 1] = $unboundTypesHandler$$);
    $whenDependentTypesAreResolved$$([], $rawArgTypes$$, $argTypes$jscomp$4_func$jscomp$10$$ => {
      $argTypes$jscomp$4_func$jscomp$10$$ = $craftInvokerFunction$$($humanName$jscomp$3$$, [$argTypes$jscomp$4_func$jscomp$10$$[0], null].concat($argTypes$jscomp$4_func$jscomp$10$$.slice(1)), null, $rawInvoker$$, $fn$jscomp$1$$, $isAsync$jscomp$3$$);
      void 0 === $proto$jscomp$5$$[$methodName$jscomp$1$$].$overloadTable$ ? ($argTypes$jscomp$4_func$jscomp$10$$.$argCount$ = $argCount$jscomp$2$$ - 1, $proto$jscomp$5$$[$methodName$jscomp$1$$] = $argTypes$jscomp$4_func$jscomp$10$$) : $proto$jscomp$5$$[$methodName$jscomp$1$$].$overloadTable$[$argCount$jscomp$2$$ - 1] = $argTypes$jscomp$4_func$jscomp$10$$;
      if ($classType$jscomp$1$$.$registeredClass$.$__derivedClasses$) {
        for (const $derivedClass$$ of $classType$jscomp$1$$.$registeredClass$.$__derivedClasses$) {
          $derivedClass$$.constructor.hasOwnProperty($methodName$jscomp$1$$) || ($derivedClass$$.constructor[$methodName$jscomp$1$$] = $argTypes$jscomp$4_func$jscomp$10$$);
        }
      }
      return [];
    });
    return [];
  });
}, _embind_register_class_constructor:($rawClassType$jscomp$1$$, $argCount$jscomp$3$$, $rawArgTypesAddr$jscomp$1$$, $invokerSignature$jscomp$1$$, $invoker$$, $rawConstructor$jscomp$2$$) => {
  $assert$$(0 < $argCount$jscomp$3$$);
  var $rawArgTypes$jscomp$1$$ = $heap32VectorToArray$$($argCount$jscomp$3$$, $rawArgTypesAddr$jscomp$1$$);
  $invoker$$ = $embind__requireFunction$$($invokerSignature$jscomp$1$$, $invoker$$);
  $whenDependentTypesAreResolved$$([], [$rawClassType$jscomp$1$$], $classType$jscomp$2$$ => {
    $classType$jscomp$2$$ = $classType$jscomp$2$$[0];
    var $humanName$jscomp$4$$ = `constructor ${$classType$jscomp$2$$.name}`;
    void 0 === $classType$jscomp$2$$.$registeredClass$.$constructor_body$ && ($classType$jscomp$2$$.$registeredClass$.$constructor_body$ = []);
    if (void 0 !== $classType$jscomp$2$$.$registeredClass$.$constructor_body$[$argCount$jscomp$3$$ - 1]) {
      throw new $BindingError$$(`Cannot register multiple constructors with identical number of parameters (${$argCount$jscomp$3$$ - 1}) for class '${$classType$jscomp$2$$.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    $classType$jscomp$2$$.$registeredClass$.$constructor_body$[$argCount$jscomp$3$$ - 1] = () => {
      $throwUnboundTypeError$$(`Cannot construct ${$classType$jscomp$2$$.name} due to unbound types`, $rawArgTypes$jscomp$1$$);
    };
    $whenDependentTypesAreResolved$$([], $rawArgTypes$jscomp$1$$, $argTypes$jscomp$5$$ => {
      $argTypes$jscomp$5$$.splice(1, 0, null);
      $classType$jscomp$2$$.$registeredClass$.$constructor_body$[$argCount$jscomp$3$$ - 1] = $craftInvokerFunction$$($humanName$jscomp$4$$, $argTypes$jscomp$5$$, null, $invoker$$, $rawConstructor$jscomp$2$$);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:($rawClassType$jscomp$2$$, $methodName$jscomp$2$$, $argCount$jscomp$4$$, $rawArgTypesAddr$jscomp$2$$, $invokerSignature$jscomp$2$$, $rawInvoker$jscomp$1$$, $context$jscomp$5$$, $isPureVirtual$$, $isAsync$jscomp$4$$) => {
  var $rawArgTypes$jscomp$2$$ = $heap32VectorToArray$$($argCount$jscomp$4$$, $rawArgTypesAddr$jscomp$2$$);
  $methodName$jscomp$2$$ = $AsciiToString$$($methodName$jscomp$2$$);
  $methodName$jscomp$2$$ = $getFunctionName$$($methodName$jscomp$2$$);
  $rawInvoker$jscomp$1$$ = $embind__requireFunction$$($invokerSignature$jscomp$2$$, $rawInvoker$jscomp$1$$, $isAsync$jscomp$4$$);
  $whenDependentTypesAreResolved$$([], [$rawClassType$jscomp$2$$], $classType$jscomp$3$$ => {
    function $unboundTypesHandler$jscomp$1$$() {
      $throwUnboundTypeError$$(`Cannot call ${$humanName$jscomp$5$$} due to unbound types`, $rawArgTypes$jscomp$2$$);
    }
    $classType$jscomp$3$$ = $classType$jscomp$3$$[0];
    var $humanName$jscomp$5$$ = `${$classType$jscomp$3$$.name}.${$methodName$jscomp$2$$}`;
    $methodName$jscomp$2$$.startsWith("@@") && ($methodName$jscomp$2$$ = Symbol[$methodName$jscomp$2$$.substring(2)]);
    $isPureVirtual$$ && $classType$jscomp$3$$.$registeredClass$.$pureVirtualFunctions$.push($methodName$jscomp$2$$);
    var $proto$jscomp$6$$ = $classType$jscomp$3$$.$registeredClass$.$instancePrototype$, $method$jscomp$1$$ = $proto$jscomp$6$$[$methodName$jscomp$2$$];
    void 0 === $method$jscomp$1$$ || void 0 === $method$jscomp$1$$.$overloadTable$ && $method$jscomp$1$$.className !== $classType$jscomp$3$$.name && $method$jscomp$1$$.$argCount$ === $argCount$jscomp$4$$ - 2 ? ($unboundTypesHandler$jscomp$1$$.$argCount$ = $argCount$jscomp$4$$ - 2, $unboundTypesHandler$jscomp$1$$.className = $classType$jscomp$3$$.name, $proto$jscomp$6$$[$methodName$jscomp$2$$] = $unboundTypesHandler$jscomp$1$$) : ($ensureOverloadTable$$($proto$jscomp$6$$, $methodName$jscomp$2$$, $humanName$jscomp$5$$), 
    $proto$jscomp$6$$[$methodName$jscomp$2$$].$overloadTable$[$argCount$jscomp$4$$ - 2] = $unboundTypesHandler$jscomp$1$$);
    $whenDependentTypesAreResolved$$([], $rawArgTypes$jscomp$2$$, $argTypes$jscomp$6_memberFunction$$ => {
      $argTypes$jscomp$6_memberFunction$$ = $craftInvokerFunction$$($humanName$jscomp$5$$, $argTypes$jscomp$6_memberFunction$$, $classType$jscomp$3$$, $rawInvoker$jscomp$1$$, $context$jscomp$5$$, $isAsync$jscomp$4$$);
      void 0 === $proto$jscomp$6$$[$methodName$jscomp$2$$].$overloadTable$ ? ($argTypes$jscomp$6_memberFunction$$.$argCount$ = $argCount$jscomp$4$$ - 2, $proto$jscomp$6$$[$methodName$jscomp$2$$] = $argTypes$jscomp$6_memberFunction$$) : $proto$jscomp$6$$[$methodName$jscomp$2$$].$overloadTable$[$argCount$jscomp$4$$ - 2] = $argTypes$jscomp$6_memberFunction$$;
      return [];
    });
    return [];
  });
}, _embind_register_class_property:($classType$jscomp$5$$, $fieldName$jscomp$1$$, $getterReturnType$jscomp$1$$, $getterSignature$$, $getter$jscomp$2$$, $getterContext$jscomp$1$$, $setterArgumentType$jscomp$1$$, $setterSignature$$, $setter$jscomp$1$$, $setterContext$jscomp$1$$) => {
  $fieldName$jscomp$1$$ = $AsciiToString$$($fieldName$jscomp$1$$);
  $getter$jscomp$2$$ = $embind__requireFunction$$($getterSignature$$, $getter$jscomp$2$$);
  $whenDependentTypesAreResolved$$([], [$classType$jscomp$5$$], $classType$jscomp$6$$ => {
    $classType$jscomp$6$$ = $classType$jscomp$6$$[0];
    var $humanName$jscomp$7$$ = `${$classType$jscomp$6$$.name}.${$fieldName$jscomp$1$$}`, $desc$$ = {get() {
      $throwUnboundTypeError$$(`Cannot access ${$humanName$jscomp$7$$} due to unbound types`, [$getterReturnType$jscomp$1$$, $setterArgumentType$jscomp$1$$]);
    }, enumerable:!0, configurable:!0};
    $desc$$.set = $setter$jscomp$1$$ ? () => $throwUnboundTypeError$$(`Cannot access ${$humanName$jscomp$7$$} due to unbound types`, [$getterReturnType$jscomp$1$$, $setterArgumentType$jscomp$1$$]) : () => {
      throw new $BindingError$$($humanName$jscomp$7$$ + " is a read-only property");
    };
    Object.defineProperty($classType$jscomp$6$$.$registeredClass$.$instancePrototype$, $fieldName$jscomp$1$$, $desc$$);
    $whenDependentTypesAreResolved$$([], $setter$jscomp$1$$ ? [$getterReturnType$jscomp$1$$, $setterArgumentType$jscomp$1$$] : [$getterReturnType$jscomp$1$$], $types$jscomp$1$$ => {
      var $getterReturnType$jscomp$2$$ = $types$jscomp$1$$[0], $desc$jscomp$1$$ = {get() {
        var $ptr$jscomp$27$$ = $validateThis$$(this, $classType$jscomp$6$$, $humanName$jscomp$7$$ + " getter");
        return $getterReturnType$jscomp$2$$.$fromWireType$($getter$jscomp$2$$($getterContext$jscomp$1$$, $ptr$jscomp$27$$));
      }, enumerable:!0};
      if ($setter$jscomp$1$$) {
        $setter$jscomp$1$$ = $embind__requireFunction$$($setterSignature$$, $setter$jscomp$1$$);
        var $setterArgumentType$jscomp$2$$ = $types$jscomp$1$$[1];
        $desc$jscomp$1$$.set = function($v$jscomp$4$$) {
          var $ptr$jscomp$28$$ = $validateThis$$(this, $classType$jscomp$6$$, $humanName$jscomp$7$$ + " setter"), $destructors$jscomp$9$$ = [];
          $setter$jscomp$1$$($setterContext$jscomp$1$$, $ptr$jscomp$28$$, $setterArgumentType$jscomp$2$$.$toWireType$($destructors$jscomp$9$$, $v$jscomp$4$$));
          $runDestructors$$($destructors$jscomp$9$$);
        };
      }
      Object.defineProperty($classType$jscomp$6$$.$registeredClass$.$instancePrototype$, $fieldName$jscomp$1$$, $desc$jscomp$1$$);
      return [];
    });
    return [];
  });
}, _embind_register_emval:$rawType$jscomp$4$$ => $registerType$$($rawType$jscomp$4$$, $EmValType$$), _embind_register_enum:($rawType$jscomp$5$$, $name$jscomp$111$$, $size$jscomp$27$$, $isSigned$$) => {
  function $ctor$$() {
  }
  $name$jscomp$111$$ = $AsciiToString$$($name$jscomp$111$$);
  $ctor$$.values = {};
  $registerType$$($rawType$jscomp$5$$, {name:$name$jscomp$111$$, constructor:$ctor$$, $fromWireType$:function($c$jscomp$1$$) {
    return this.constructor.values[$c$jscomp$1$$];
  }, $toWireType$:($destructors$jscomp$11$$, $c$jscomp$2$$) => $c$jscomp$2$$.value, $readValueFromPointer$:$enumReadValueFromPointer$$($name$jscomp$111$$, $size$jscomp$27$$, $isSigned$$), $destructorFunction$:null});
  $exposePublicSymbol$$($name$jscomp$111$$, $ctor$$);
}, _embind_register_enum_value:($Enum_rawEnumType$$, $name$jscomp$112$$, $enumValue$$) => {
  var $Value_enumType$$ = $requireRegisteredType$$($Enum_rawEnumType$$);
  $name$jscomp$112$$ = $AsciiToString$$($name$jscomp$112$$);
  $Enum_rawEnumType$$ = $Value_enumType$$.constructor;
  $Value_enumType$$ = Object.create($Value_enumType$$.constructor.prototype, {value:{value:$enumValue$$}, constructor:{value:$createNamedFunction$$(`${$Value_enumType$$.name}_${$name$jscomp$112$$}`, function() {
  })}});
  $Enum_rawEnumType$$.values[$enumValue$$] = $Value_enumType$$;
  $Enum_rawEnumType$$[$name$jscomp$112$$] = $Value_enumType$$;
}, _embind_register_float:($rawType$jscomp$7$$, $name$jscomp$114$$, $size$jscomp$28$$) => {
  $name$jscomp$114$$ = $AsciiToString$$($name$jscomp$114$$);
  $registerType$$($rawType$jscomp$7$$, {name:$name$jscomp$114$$, $fromWireType$:$value$jscomp$104$$ => $value$jscomp$104$$, $toWireType$:($destructors$jscomp$12$$, $value$jscomp$105$$) => {
    if ("number" != typeof $value$jscomp$105$$ && "boolean" != typeof $value$jscomp$105$$) {
      throw new TypeError(`Cannot convert ${$embindRepr$$($value$jscomp$105$$)} to ${this.name}`);
    }
    return $value$jscomp$105$$;
  }, $readValueFromPointer$:$floatReadValueFromPointer$$($name$jscomp$114$$, $size$jscomp$28$$), $destructorFunction$:null});
}, _embind_register_integer:($primitiveType$jscomp$1$$, $name$jscomp$115$$, $size$jscomp$29$$, $minRange$jscomp$2$$, $maxRange$jscomp$2$$) => {
  $name$jscomp$115$$ = $AsciiToString$$($name$jscomp$115$$);
  let $fromWireType$jscomp$1$$ = $value$jscomp$106$$ => $value$jscomp$106$$;
  if (0 === $minRange$jscomp$2$$) {
    var $bitshift$$ = 32 - 8 * $size$jscomp$29$$;
    $fromWireType$jscomp$1$$ = $value$jscomp$107$$ => $value$jscomp$107$$ << $bitshift$$ >>> $bitshift$$;
    $maxRange$jscomp$2$$ = $fromWireType$jscomp$1$$($maxRange$jscomp$2$$);
  }
  $registerType$$($primitiveType$jscomp$1$$, {name:$name$jscomp$115$$, $fromWireType$:$fromWireType$jscomp$1$$, $toWireType$:($destructors$jscomp$13$$, $value$jscomp$108$$) => {
    if ("number" != typeof $value$jscomp$108$$ && "boolean" != typeof $value$jscomp$108$$) {
      throw new TypeError(`Cannot convert "${$embindRepr$$($value$jscomp$108$$)}" to ${$name$jscomp$115$$}`);
    }
    $assertIntegerRange$$($name$jscomp$115$$, $value$jscomp$108$$, $minRange$jscomp$2$$, $maxRange$jscomp$2$$);
    return $value$jscomp$108$$;
  }, $readValueFromPointer$:$integerReadValueFromPointer$$($name$jscomp$115$$, $size$jscomp$29$$, 0 !== $minRange$jscomp$2$$), $destructorFunction$:null});
}, _embind_register_memory_view:($rawType$jscomp$8$$, $dataTypeIndex$$, $name$jscomp$116$$) => {
  function $decodeMemoryView$$($data$jscomp$84_handle$jscomp$25$$) {
    var $size$jscomp$30$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $data$jscomp$84_handle$jscomp$25$$ >> 2, $___asan_loadN$$)];
    $data$jscomp$84_handle$jscomp$25$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $data$jscomp$84_handle$jscomp$25$$ + 4 >> 2, $___asan_loadN$$)];
    return new $TA$$($HEAP8$$.buffer, $data$jscomp$84_handle$jscomp$25$$, $size$jscomp$30$$);
  }
  var $TA$$ = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][$dataTypeIndex$$];
  $name$jscomp$116$$ = $AsciiToString$$($name$jscomp$116$$);
  $registerType$$($rawType$jscomp$8$$, {name:$name$jscomp$116$$, $fromWireType$:$decodeMemoryView$$, $readValueFromPointer$:$decodeMemoryView$$}, {$ignoreDuplicateRegistrations$:!0});
}, _embind_register_std_string:($rawType$jscomp$9$$, $name$jscomp$117$$) => {
  $name$jscomp$117$$ = $AsciiToString$$($name$jscomp$117$$);
  $registerType$$($rawType$jscomp$9$$, {name:$name$jscomp$117$$, $fromWireType$($value$jscomp$109$$) {
    var $length$jscomp$35_str$jscomp$13$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $value$jscomp$109$$ >> 2, $___asan_loadN$$)];
    $length$jscomp$35_str$jscomp$13$$ = $UTF8ToString$$($value$jscomp$109$$ + 4, $length$jscomp$35_str$jscomp$13$$, !0);
    $_free$$($value$jscomp$109$$);
    return $length$jscomp$35_str$jscomp$13$$;
  }, $toWireType$($destructors$jscomp$14$$, $value$jscomp$110$$) {
    $value$jscomp$110$$ instanceof ArrayBuffer && ($value$jscomp$110$$ = new Uint8Array($value$jscomp$110$$));
    var $valueIsOfTypeString$$ = "string" == typeof $value$jscomp$110$$;
    if (!($valueIsOfTypeString$$ || ArrayBuffer.isView($value$jscomp$110$$) && 1 == $value$jscomp$110$$.BYTES_PER_ELEMENT)) {
      throw new $BindingError$$("Cannot pass non-string to std::string");
    }
    var $length$jscomp$36$$ = $valueIsOfTypeString$$ ? $lengthBytesUTF8$$($value$jscomp$110$$) : $value$jscomp$110$$.length;
    var $base$jscomp$4$$ = $_malloc$$(4 + $length$jscomp$36$$ + 1), $ptr$jscomp$29$$ = $base$jscomp$4$$ + 4;
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $base$jscomp$4$$ >> 2, $___asan_storeN$$)] = $length$jscomp$36$$;
    $valueIsOfTypeString$$ ? $stringToUTF8$$($value$jscomp$110$$, $ptr$jscomp$29$$, $length$jscomp$36$$ + 1) : $HEAPU8$$.set($value$jscomp$110$$, $ptr$jscomp$29$$);
    null !== $destructors$jscomp$14$$ && $destructors$jscomp$14$$.push($_free$$, $base$jscomp$4$$);
    return $base$jscomp$4$$;
  }, $readValueFromPointer$:$readPointer$$, $destructorFunction$($ptr$jscomp$30$$) {
    $_free$$($ptr$jscomp$30$$);
  }});
}, _embind_register_std_wstring:($rawType$jscomp$10$$, $charSize$$, $name$jscomp$118$$) => {
  $name$jscomp$118$$ = $AsciiToString$$($name$jscomp$118$$);
  if (2 === $charSize$$) {
    var $decodeString$$ = $UTF16ToString$$;
    var $encodeString$$ = $stringToUTF16$$;
    var $lengthBytesUTF$$ = $lengthBytesUTF16$$;
  } else {
    $assert$$(4 === $charSize$$, "only 2-byte and 4-byte strings are currently supported"), $decodeString$$ = $UTF32ToString$$, $encodeString$$ = $stringToUTF32$$, $lengthBytesUTF$$ = $lengthBytesUTF32$$;
  }
  $registerType$$($rawType$jscomp$10$$, {name:$name$jscomp$118$$, $fromWireType$:$value$jscomp$111$$ => {
    var $length$jscomp$37_str$jscomp$20$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $value$jscomp$111$$ >> 2, $___asan_loadN$$)];
    $length$jscomp$37_str$jscomp$20$$ = $decodeString$$($value$jscomp$111$$ + 4, $length$jscomp$37_str$jscomp$20$$ * $charSize$$, !0);
    $_free$$($value$jscomp$111$$);
    return $length$jscomp$37_str$jscomp$20$$;
  }, $toWireType$:($destructors$jscomp$15$$, $value$jscomp$112$$) => {
    if ("string" != typeof $value$jscomp$112$$) {
      throw new $BindingError$$(`Cannot pass non-string to C++ string type ${$name$jscomp$118$$}`);
    }
    var $length$jscomp$38$$ = $lengthBytesUTF$$($value$jscomp$112$$), $ptr$jscomp$33$$ = $_malloc$$(4 + $length$jscomp$38$$ + $charSize$$);
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $ptr$jscomp$33$$ >> 2, $___asan_storeN$$)] = $length$jscomp$38$$ / $charSize$$;
    $encodeString$$($value$jscomp$112$$, $ptr$jscomp$33$$ + 4, $length$jscomp$38$$ + $charSize$$);
    null !== $destructors$jscomp$15$$ && $destructors$jscomp$15$$.push($_free$$, $ptr$jscomp$33$$);
    return $ptr$jscomp$33$$;
  }, $readValueFromPointer$:$readPointer$$, $destructorFunction$($ptr$jscomp$34$$) {
    $_free$$($ptr$jscomp$34$$);
  }});
}, _embind_register_value_object:($rawType$jscomp$11$$, $name$jscomp$119$$, $constructorSignature$$, $rawConstructor$jscomp$3$$, $destructorSignature$jscomp$1$$, $rawDestructor$jscomp$4$$) => {
  $structRegistrations$$[$rawType$jscomp$11$$] = {name:$AsciiToString$$($name$jscomp$119$$), $rawConstructor$:$embind__requireFunction$$($constructorSignature$$, $rawConstructor$jscomp$3$$), $rawDestructor$:$embind__requireFunction$$($destructorSignature$jscomp$1$$, $rawDestructor$jscomp$4$$), $fields$:[]};
}, _embind_register_value_object_field:($structType$jscomp$1$$, $fieldName$jscomp$2$$, $getterReturnType$jscomp$3$$, $getterSignature$jscomp$1$$, $getter$jscomp$3$$, $getterContext$jscomp$2$$, $setterArgumentType$jscomp$3$$, $setterSignature$jscomp$1$$, $setter$jscomp$2$$, $setterContext$jscomp$2$$) => {
  $structRegistrations$$[$structType$jscomp$1$$].$fields$.push({$fieldName$:$AsciiToString$$($fieldName$jscomp$2$$), $getterReturnType$:$getterReturnType$jscomp$3$$, $getter$:$embind__requireFunction$$($getterSignature$jscomp$1$$, $getter$jscomp$3$$), $getterContext$:$getterContext$jscomp$2$$, $setterArgumentType$:$setterArgumentType$jscomp$3$$, $setter$:$embind__requireFunction$$($setterSignature$jscomp$1$$, $setter$jscomp$2$$), $setterContext$:$setterContext$jscomp$2$$});
}, _embind_register_void:($rawType$jscomp$12$$, $name$jscomp$120$$) => {
  $name$jscomp$120$$ = $AsciiToString$$($name$jscomp$120$$);
  $registerType$$($rawType$jscomp$12$$, {$isVoid$:!0, name:$name$jscomp$120$$, $fromWireType$:() => {
  }, $toWireType$:() => {
  }});
}, _emscripten_fs_load_embedded_files:$ptr$jscomp$35$$ => {
  do {
    var $name$jscomp$121_name_addr$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $ptr$jscomp$35$$ >> 2, $___asan_loadN$$)];
    $ptr$jscomp$35$$ += 4;
    var $len$jscomp$8$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $ptr$jscomp$35$$ >> 2, $___asan_loadN$$)];
    $ptr$jscomp$35$$ += 4;
    var $content$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $ptr$jscomp$35$$ >> 2, $___asan_loadN$$)];
    $ptr$jscomp$35$$ += 4;
    $name$jscomp$121_name_addr$$ = $UTF8ToString$$($name$jscomp$121_name_addr$$);
    $FS$createPath$$("/", $PATH$dirname$$($name$jscomp$121_name_addr$$));
    $FS$createDataFile$$($name$jscomp$121_name_addr$$, null, $HEAP8$$.subarray($content$$, $content$$ + $len$jscomp$8$$), !0, !0, !0);
  } while ($HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $ptr$jscomp$35$$ >> 2, $___asan_loadN$$)]);
}, _emscripten_get_progname:($str$jscomp$21$$, $len$jscomp$9$$) => $stringToUTF8$$($thisProgram$$ || "./this.program", $str$jscomp$21$$, $len$jscomp$9$$), _emscripten_sanitizer_get_option:$name$jscomp$122$$ => $withBuiltinMalloc$$(() => $stringToNewUTF8$$($Module$$[$UTF8ToString$$($name$jscomp$122$$)] || "")), _emscripten_sanitizer_use_colors:() => {
  var $setting$$ = $Module$$.printWithColors;
  return void 0 !== $setting$$ ? $setting$$ : !1;
}, _mmap_js:function($len$jscomp$10$$, $prot$jscomp$3$$, $flags$jscomp$15$$, $fd$jscomp$16_position$jscomp$inline_263$$, $offset$jscomp$43$$, $allocated$jscomp$1$$, $addr$jscomp$1$$) {
  $offset$jscomp$43$$ = -9007199254740992 > $offset$jscomp$43$$ || 9007199254740992 < $offset$jscomp$43$$ ? NaN : Number($offset$jscomp$43$$);
  try {
    $assert$$(!isNaN($offset$jscomp$43$$));
    var $stream$jscomp$inline_261$$ = $FS$getStreamChecked$$($fd$jscomp$16_position$jscomp$inline_263$$);
    $fd$jscomp$16_position$jscomp$inline_263$$ = $offset$jscomp$43$$;
    if (0 !== ($prot$jscomp$3$$ & 2) && 0 === ($flags$jscomp$15$$ & 2) && 2 !== ($stream$jscomp$inline_261$$.flags & 2097155)) {
      throw new $FS$ErrnoError$$(2);
    }
    if (1 === ($stream$jscomp$inline_261$$.flags & 2097155)) {
      throw new $FS$ErrnoError$$(2);
    }
    if (!$stream$jscomp$inline_261$$.$stream_ops$.$mmap$) {
      throw new $FS$ErrnoError$$(43);
    }
    if (!$len$jscomp$10$$) {
      throw new $FS$ErrnoError$$(28);
    }
    var $res$$ = $stream$jscomp$inline_261$$.$stream_ops$.$mmap$($stream$jscomp$inline_261$$, $len$jscomp$10$$, $fd$jscomp$16_position$jscomp$inline_263$$, $prot$jscomp$3$$, $flags$jscomp$15$$);
    var $ptr$jscomp$36$$ = $res$$.$ptr$;
    $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $allocated$jscomp$1$$ >> 2, $___asan_storeN$$)] = $res$$.$allocated$;
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $addr$jscomp$1$$ >> 2, $___asan_storeN$$)] = $ptr$jscomp$36$$;
    return 0;
  } catch ($e$jscomp$34$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$34$$.name) {
      throw $e$jscomp$34$$;
    }
    return -$e$jscomp$34$$.$errno$;
  }
}, _munmap_js:function($addr$jscomp$2$$, $len$jscomp$11$$, $offset$jscomp$inline_271_prot$jscomp$4$$, $flags$jscomp$16$$, $fd$jscomp$17$$, $offset$jscomp$44$$) {
  $offset$jscomp$44$$ = -9007199254740992 > $offset$jscomp$44$$ || 9007199254740992 < $offset$jscomp$44$$ ? NaN : Number($offset$jscomp$44$$);
  try {
    var $stream$jscomp$54$$ = $FS$getStreamChecked$$($fd$jscomp$17$$);
    if ($offset$jscomp$inline_271_prot$jscomp$4$$ & 2) {
      $offset$jscomp$inline_271_prot$jscomp$4$$ = $offset$jscomp$44$$;
      if (32768 !== ($stream$jscomp$54$$.node.mode & 61440)) {
        throw new $FS$ErrnoError$$(43);
      }
      if (!($flags$jscomp$16$$ & 2)) {
        var $buffer$jscomp$inline_427$$ = $HEAPU8$$.slice($addr$jscomp$2$$, $addr$jscomp$2$$ + $len$jscomp$11$$);
        $assert$$(0 <= $offset$jscomp$inline_271_prot$jscomp$4$$);
        $stream$jscomp$54$$.$stream_ops$.$msync$ && $stream$jscomp$54$$.$stream_ops$.$msync$($stream$jscomp$54$$, $buffer$jscomp$inline_427$$, $offset$jscomp$inline_271_prot$jscomp$4$$, $len$jscomp$11$$, $flags$jscomp$16$$);
      }
    }
  } catch ($e$jscomp$35$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$35$$.name) {
      throw $e$jscomp$35$$;
    }
    return -$e$jscomp$35$$.$errno$;
  }
}, _tzset_js:($timezone_winterName$$, $daylight_extractZone_summerName$$, $std_name$$, $dst_name$$) => {
  var $currentYear_summerOffset$$ = (new Date()).getFullYear(), $winterOffset$$ = (new Date($currentYear_summerOffset$$, 0, 1)).getTimezoneOffset();
  $currentYear_summerOffset$$ = (new Date($currentYear_summerOffset$$, 6, 1)).getTimezoneOffset();
  var $stdTimezoneOffset$$ = Math.max($winterOffset$$, $currentYear_summerOffset$$);
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $timezone_winterName$$ >> 2, $___asan_storeN$$)] = 60 * $stdTimezoneOffset$$;
  $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $daylight_extractZone_summerName$$ >> 2, $___asan_storeN$$)] = Number($winterOffset$$ != $currentYear_summerOffset$$);
  $daylight_extractZone_summerName$$ = $timezoneOffset$$ => {
    var $absOffset$$ = Math.abs($timezoneOffset$$);
    return `UTC${0 <= $timezoneOffset$$ ? "-" : "+"}${String(Math.floor($absOffset$$ / 60)).padStart(2, "0")}${String($absOffset$$ % 60).padStart(2, "0")}`;
  };
  $timezone_winterName$$ = $daylight_extractZone_summerName$$($winterOffset$$);
  $daylight_extractZone_summerName$$ = $daylight_extractZone_summerName$$($currentYear_summerOffset$$);
  $assert$$($timezone_winterName$$);
  $assert$$($daylight_extractZone_summerName$$);
  $assert$$(16 >= $lengthBytesUTF8$$($timezone_winterName$$), `timezone name truncated to fit in TZNAME_MAX (${$timezone_winterName$$})`);
  $assert$$(16 >= $lengthBytesUTF8$$($daylight_extractZone_summerName$$), `timezone name truncated to fit in TZNAME_MAX (${$daylight_extractZone_summerName$$})`);
  $currentYear_summerOffset$$ < $winterOffset$$ ? ($stringToUTF8$$($timezone_winterName$$, $std_name$$, 17), $stringToUTF8$$($daylight_extractZone_summerName$$, $dst_name$$, 17)) : ($stringToUTF8$$($timezone_winterName$$, $dst_name$$, 17), $stringToUTF8$$($daylight_extractZone_summerName$$, $std_name$$, 17));
}, clock_time_get:function($clk_id_nsec$$, $ignored_precision$$, $ptime$$) {
  if (!(0 <= $clk_id_nsec$$ && 3 >= $clk_id_nsec$$)) {
    return 28;
  }
  $clk_id_nsec$$ = Math.round(1E6 * (0 === $clk_id_nsec$$ ? Date.now() : performance.now()));
  $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $ptime$$ >> 3, $___asan_storeN$$)] = BigInt($clk_id_nsec$$);
  return 0;
}, emscripten_asm_const_int:($code$jscomp$3$$, $sigPtr$jscomp$2_sigPtr$jscomp$inline_432$$, $argbuf$jscomp$1_buf$jscomp$inline_433$$) => {
  $assert$$(Array.isArray($readEmAsmArgsArray$$));
  $assert$$(0 == $argbuf$jscomp$1_buf$jscomp$inline_433$$ % 16);
  $readEmAsmArgsArray$$.length = 0;
  for (var $ch$jscomp$inline_434$$; $ch$jscomp$inline_434$$ = $HEAPU8$$[$_asan_js_check_index$$($HEAPU8$$, $sigPtr$jscomp$2_sigPtr$jscomp$inline_432$$++, $___asan_loadN$$)];) {
    var $chr$jscomp$inline_435_wide$jscomp$inline_437$$ = String.fromCharCode($ch$jscomp$inline_434$$), $validChars$jscomp$inline_436$$ = ["d", "f", "i", "p"];
    $validChars$jscomp$inline_436$$.push("j");
    $assert$$($validChars$jscomp$inline_436$$.includes($chr$jscomp$inline_435_wide$jscomp$inline_437$$), `Invalid character ${$ch$jscomp$inline_434$$}("${$chr$jscomp$inline_435_wide$jscomp$inline_437$$}") in readEmAsmArgs! Use only [${$validChars$jscomp$inline_436$$}], and do not specify "v" for void return argument.`);
    $chr$jscomp$inline_435_wide$jscomp$inline_437$$ = 105 != $ch$jscomp$inline_434$$;
    $chr$jscomp$inline_435_wide$jscomp$inline_437$$ &= 112 != $ch$jscomp$inline_434$$;
    $argbuf$jscomp$1_buf$jscomp$inline_433$$ += $chr$jscomp$inline_435_wide$jscomp$inline_437$$ && $argbuf$jscomp$1_buf$jscomp$inline_433$$ % 8 ? 4 : 0;
    $readEmAsmArgsArray$$.push(112 == $ch$jscomp$inline_434$$ ? $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $argbuf$jscomp$1_buf$jscomp$inline_433$$ >> 2, $___asan_loadN$$)] : 106 == $ch$jscomp$inline_434$$ ? $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $argbuf$jscomp$1_buf$jscomp$inline_433$$ >> 3, $___asan_loadN$$)] : 105 == $ch$jscomp$inline_434$$ ? $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $argbuf$jscomp$1_buf$jscomp$inline_433$$ >> 2, $___asan_loadN$$)] : $HEAPF64$$[$_asan_js_check_index$$($HEAPF64$$, 
    $argbuf$jscomp$1_buf$jscomp$inline_433$$ >> 3, $___asan_loadN$$)]);
    $argbuf$jscomp$1_buf$jscomp$inline_433$$ += $chr$jscomp$inline_435_wide$jscomp$inline_437$$ ? 8 : 4;
  }
  $assert$$($ASM_CONSTS$$.hasOwnProperty($code$jscomp$3$$), `No EM_ASM constant found at address ${$code$jscomp$3$$}.  The loaded WebAssembly file is likely out of sync with the generated JavaScript.`);
  return $ASM_CONSTS$$[$code$jscomp$3$$](...$readEmAsmArgsArray$$);
}, emscripten_get_heap_max:() => 2147483648, emscripten_get_now:() => performance.now(), emscripten_pc_get_column:$pc$jscomp$1_result$jscomp$7$$ => ($pc$jscomp$1_result$jscomp$7$$ = $convertPCtoSourceLocation$$($pc$jscomp$1_result$jscomp$7$$)) ? $pc$jscomp$1_result$jscomp$7$$.$column$ || 0 : 0, emscripten_pc_get_file:$_emscripten_pc_get_file$$, emscripten_pc_get_function:$_emscripten_pc_get_function$$, emscripten_pc_get_line:$pc$jscomp$5_result$jscomp$9$$ => ($pc$jscomp$5_result$jscomp$9$$ = $convertPCtoSourceLocation$$($pc$jscomp$5_result$jscomp$9$$)) ? 
$pc$jscomp$5_result$jscomp$9$$.line : 0, emscripten_resize_heap:$requestedSize$$ => {
  var $oldSize$$ = $HEAPU8$$.length;
  $requestedSize$$ >>>= 0;
  $assert$$($requestedSize$$ > $oldSize$$);
  if (2147483648 < $requestedSize$$) {
    return $err$$(`Cannot enlarge memory, requested ${$requestedSize$$} bytes, but the limit is ${2147483648} bytes!`), !1;
  }
  for (var $cutDown$$ = 1; 4 >= $cutDown$$; $cutDown$$ *= 2) {
    var $newSize$jscomp$2_overGrownHeapSize$$ = $oldSize$$ * (1 + .2 / $cutDown$$);
    $newSize$jscomp$2_overGrownHeapSize$$ = Math.min($newSize$jscomp$2_overGrownHeapSize$$, $requestedSize$$ + 100663296);
    $newSize$jscomp$2_overGrownHeapSize$$ = Math.min(2147483648, $alignMemory$$(Math.max($requestedSize$$, $newSize$jscomp$2_overGrownHeapSize$$)));
    a: {
      var $size$jscomp$inline_278$$ = $newSize$jscomp$2_overGrownHeapSize$$, $oldHeapSize$jscomp$inline_279$$ = $wasmMemory$$.buffer.byteLength;
      try {
        $wasmMemory$$.grow(($size$jscomp$inline_278$$ - $oldHeapSize$jscomp$inline_279$$ + 65535) / 65536 | 0);
        $updateMemoryViews$$();
        var $JSCompiler_inline_result$jscomp$56$$ = 1;
        break a;
      } catch ($e$jscomp$inline_281$$) {
        $err$$(`growMemory: Attempted to grow heap from ${$oldHeapSize$jscomp$inline_279$$} bytes to ${$size$jscomp$inline_278$$} bytes, but got error: ${$e$jscomp$inline_281$$}`);
      }
      $JSCompiler_inline_result$jscomp$56$$ = void 0;
    }
    if ($JSCompiler_inline_result$jscomp$56$$) {
      return !0;
    }
  }
  $err$$(`Failed to grow the heap from ${$oldSize$$} bytes to ${$newSize$jscomp$2_overGrownHeapSize$$} bytes, not enough memory!`);
  return !1;
}, emscripten_return_address:$level$jscomp$19$$ => {
  var $callstack$jscomp$2$$ = Error().stack.toString().split("\n");
  "Error" == $callstack$jscomp$2$$[0] && $callstack$jscomp$2$$.shift();
  return $convertFrameToPC$$($callstack$jscomp$2$$[$level$jscomp$19$$ + 3]);
}, emscripten_set_canvas_element_size:($canvas_target$jscomp$93$$, $width$jscomp$31$$, $height$jscomp$25$$) => {
  $canvas_target$jscomp$93$$ = $findEventTarget$$($canvas_target$jscomp$93$$);
  if (!$canvas_target$jscomp$93$$) {
    return -4;
  }
  $canvas_target$jscomp$93$$.width = $width$jscomp$31$$;
  $canvas_target$jscomp$93$$.height = $height$jscomp$25$$;
  return 0;
}, emscripten_stack_snapshot:() => {
  var $callstack$jscomp$1$$ = Error().stack.toString().split("\n");
  "Error" == $callstack$jscomp$1$$[0] && $callstack$jscomp$1$$.shift();
  $saveInUnwindCache$$($callstack$jscomp$1$$);
  $UNWIND_CACHE$$.$last_addr$ = $convertFrameToPC$$($callstack$jscomp$1$$[3]);
  $UNWIND_CACHE$$.$last_stack$ = $callstack$jscomp$1$$;
  return $UNWIND_CACHE$$.$last_addr$;
}, emscripten_stack_unwind_buffer:($addr$jscomp$3_i$jscomp$38$$, $buffer$jscomp$32$$, $count$jscomp$40$$) => {
  if ($UNWIND_CACHE$$.$last_addr$ == $addr$jscomp$3_i$jscomp$38$$) {
    var $stack$$ = $UNWIND_CACHE$$.$last_stack$;
  } else {
    $stack$$ = Error().stack.toString().split("\n"), "Error" == $stack$$[0] && $stack$$.shift(), $saveInUnwindCache$$($stack$$);
  }
  for (var $offset$jscomp$45$$ = 3; $stack$$[$offset$jscomp$45$$] && $convertFrameToPC$$($stack$$[$offset$jscomp$45$$]) != $addr$jscomp$3_i$jscomp$38$$;) {
    ++$offset$jscomp$45$$;
  }
  for ($addr$jscomp$3_i$jscomp$38$$ = 0; $addr$jscomp$3_i$jscomp$38$$ < $count$jscomp$40$$ && $stack$$[$addr$jscomp$3_i$jscomp$38$$ + $offset$jscomp$45$$]; ++$addr$jscomp$3_i$jscomp$38$$) {
    $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $buffer$jscomp$32$$ + 4 * $addr$jscomp$3_i$jscomp$38$$ >> 2, $___asan_storeN$$)] = $convertFrameToPC$$($stack$$[$addr$jscomp$3_i$jscomp$38$$ + $offset$jscomp$45$$]);
  }
  return $addr$jscomp$3_i$jscomp$38$$;
}, emscripten_webgl_create_context:($canvas$jscomp$2_target$jscomp$94$$, $attributes$jscomp$1_contextAttributes$$) => {
  $assert$$($attributes$jscomp$1_contextAttributes$$);
  var $attr32$$ = $attributes$jscomp$1_contextAttributes$$ >> 2, $powerPreference$$ = $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $attr32$$ + 2, $___asan_loadN$$)];
  $attributes$jscomp$1_contextAttributes$$ = {alpha:!!$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 0, $___asan_loadN$$)], depth:!!$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 1, $___asan_loadN$$)], stencil:!!$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 2, $___asan_loadN$$)], antialias:!!$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 3, $___asan_loadN$$)], 
  premultipliedAlpha:!!$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 4, $___asan_loadN$$)], preserveDrawingBuffer:!!$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 5, $___asan_loadN$$)], powerPreference:$webglPowerPreferences$$[$powerPreference$$], failIfMajorPerformanceCaveat:!!$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 12, $___asan_loadN$$)], $majorVersion$:$HEAP32$$[$_asan_js_check_index$$($HEAP32$$, 
  $attr32$$ + 4, $___asan_loadN$$)], $minorVersion$:$HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $attr32$$ + 5, $___asan_loadN$$)], $enableExtensionsByDefault$:$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 24, $___asan_loadN$$)], $explicitSwapControl$:$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 25, $___asan_loadN$$)], $proxyContextToMainThread$:$HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $attr32$$ + 7, $___asan_loadN$$)], 
  $renderViaOffscreenBackBuffer$:$HEAP8$$[$_asan_js_check_index$$($HEAP8$$, $attributes$jscomp$1_contextAttributes$$ + 32, $___asan_loadN$$)]};
  1 !== $attributes$jscomp$1_contextAttributes$$.$majorVersion$ && 2 !== $attributes$jscomp$1_contextAttributes$$.$majorVersion$ && $err$$(`Invalid WebGL version requested: ${$attributes$jscomp$1_contextAttributes$$.$majorVersion$}`);
  2 !== $attributes$jscomp$1_contextAttributes$$.$majorVersion$ && $err$$("WebGL 1 requested but only WebGL 2 is supported (MIN_WEBGL_VERSION is 2)");
  $canvas$jscomp$2_target$jscomp$94$$ = $findEventTarget$$($canvas$jscomp$2_target$jscomp$94$$);
  return !$canvas$jscomp$2_target$jscomp$94$$ || $attributes$jscomp$1_contextAttributes$$.$explicitSwapControl$ ? 0 : $GL$createContext$$($canvas$jscomp$2_target$jscomp$94$$, $attributes$jscomp$1_contextAttributes$$);
}, emscripten_webgl_destroy_context:$contextHandle$jscomp$4$$ => {
  $GL$currentContext$$ == $contextHandle$jscomp$4$$ && ($GL$currentContext$$ = 0);
  $GL$currentContext$$ === $GL$contexts$$[$contextHandle$jscomp$4$$] && ($GL$currentContext$$ = null);
  "object" == typeof JSEvents && JSEvents.$removeAllHandlersOnTarget$($GL$contexts$$[$contextHandle$jscomp$4$$].$GLctx$.canvas);
  $GL$contexts$$[$contextHandle$jscomp$4$$]?.$GLctx$.canvas && ($GL$contexts$$[$contextHandle$jscomp$4$$].$GLctx$.canvas.$GLctxObject$ = void 0);
  $GL$contexts$$[$contextHandle$jscomp$4$$] = null;
}, emscripten_webgl_get_current_context:() => $GL$currentContext$$ ? $GL$currentContext$$.handle : 0, emscripten_webgl_make_context_current:$contextHandle$jscomp$5$$ => {
  $GL$currentContext$$ = $GL$contexts$$[$contextHandle$jscomp$5$$];
  $Module$$.ctx = $GLctx$$ = $GL$currentContext$$?.$GLctx$;
  return !$contextHandle$jscomp$5$$ || $GLctx$$ ? 0 : -5;
}, environ_get:($__environ$$, $environ_buf$$) => {
  var $bufSize$$ = 0, $envp$$ = 0, $string$jscomp$4$$;
  for ($string$jscomp$4$$ of $getEnvStrings$$()) {
    var $ptr$jscomp$37$$ = $environ_buf$$ + $bufSize$$;
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $__environ$$ + $envp$$ >> 2, $___asan_storeN$$)] = $ptr$jscomp$37$$;
    $bufSize$$ += $stringToUTF8$$($string$jscomp$4$$, $ptr$jscomp$37$$, Infinity) + 1;
    $envp$$ += 4;
  }
  return 0;
}, environ_sizes_get:($bufSize$jscomp$1_penviron_count$$, $penviron_buf_size$$) => {
  var $strings$jscomp$1$$ = $getEnvStrings$$();
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $bufSize$jscomp$1_penviron_count$$ >> 2, $___asan_storeN$$)] = $strings$jscomp$1$$.length;
  $bufSize$jscomp$1_penviron_count$$ = 0;
  for (var $string$jscomp$5$$ of $strings$jscomp$1$$) {
    $bufSize$jscomp$1_penviron_count$$ += $lengthBytesUTF8$$($string$jscomp$5$$) + 1;
  }
  $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $penviron_buf_size$$ >> 2, $___asan_storeN$$)] = $bufSize$jscomp$1_penviron_count$$;
  return 0;
}, fd_close:function($fd$jscomp$18$$) {
  try {
    var $stream$jscomp$55$$ = $FS$getStreamChecked$$($fd$jscomp$18$$);
    $FS$close$$($stream$jscomp$55$$);
    return 0;
  } catch ($e$jscomp$37$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$37$$.name) {
      throw $e$jscomp$37$$;
    }
    return $e$jscomp$37$$.$errno$;
  }
}, fd_read:function($fd$jscomp$19_iov$jscomp$inline_288$$, $iov$jscomp$1_ret$jscomp$inline_291$$, $iovcnt$jscomp$1$$, $pnum$$) {
  try {
    a: {
      var $stream$jscomp$inline_287$$ = $FS$getStreamChecked$$($fd$jscomp$19_iov$jscomp$inline_288$$);
      $fd$jscomp$19_iov$jscomp$inline_288$$ = $iov$jscomp$1_ret$jscomp$inline_291$$;
      for (var $offset$jscomp$inline_290$$, $i$jscomp$inline_292$$ = $iov$jscomp$1_ret$jscomp$inline_291$$ = 0; $i$jscomp$inline_292$$ < $iovcnt$jscomp$1$$; $i$jscomp$inline_292$$++) {
        var $ptr$jscomp$inline_293$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $fd$jscomp$19_iov$jscomp$inline_288$$ >> 2, $___asan_loadN$$)], $len$jscomp$inline_294$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $fd$jscomp$19_iov$jscomp$inline_288$$ + 4 >> 2, $___asan_loadN$$)];
        $fd$jscomp$19_iov$jscomp$inline_288$$ += 8;
        var $stream$jscomp$inline_439$$ = $stream$jscomp$inline_287$$, $offset$jscomp$inline_440$$ = $ptr$jscomp$inline_293$$, $length$jscomp$inline_441$$ = $len$jscomp$inline_294$$, $position$jscomp$inline_442$$ = $offset$jscomp$inline_290$$, $buffer$jscomp$inline_443$$ = $HEAP8$$;
        $assert$$(0 <= $offset$jscomp$inline_440$$);
        if (0 > $length$jscomp$inline_441$$ || 0 > $position$jscomp$inline_442$$) {
          throw new $FS$ErrnoError$$(28);
        }
        if (null === $stream$jscomp$inline_439$$.$fd$) {
          throw new $FS$ErrnoError$$(8);
        }
        if (1 === ($stream$jscomp$inline_439$$.flags & 2097155)) {
          throw new $FS$ErrnoError$$(8);
        }
        if ($FS$isDir$$($stream$jscomp$inline_439$$.node.mode)) {
          throw new $FS$ErrnoError$$(31);
        }
        if (!$stream$jscomp$inline_439$$.$stream_ops$.read) {
          throw new $FS$ErrnoError$$(28);
        }
        var $seeking$jscomp$inline_444$$ = "undefined" != typeof $position$jscomp$inline_442$$;
        if (!$seeking$jscomp$inline_444$$) {
          $position$jscomp$inline_442$$ = $stream$jscomp$inline_439$$.position;
        } else if (!$stream$jscomp$inline_439$$.seekable) {
          throw new $FS$ErrnoError$$(70);
        }
        var $bytesRead$jscomp$inline_445$$ = $stream$jscomp$inline_439$$.$stream_ops$.read($stream$jscomp$inline_439$$, $buffer$jscomp$inline_443$$, $offset$jscomp$inline_440$$, $length$jscomp$inline_441$$, $position$jscomp$inline_442$$);
        $seeking$jscomp$inline_444$$ || ($stream$jscomp$inline_439$$.position += $bytesRead$jscomp$inline_445$$);
        var $curr$jscomp$inline_295$$ = $bytesRead$jscomp$inline_445$$;
        if (0 > $curr$jscomp$inline_295$$) {
          var $num$jscomp$7$$ = -1;
          break a;
        }
        $iov$jscomp$1_ret$jscomp$inline_291$$ += $curr$jscomp$inline_295$$;
        if ($curr$jscomp$inline_295$$ < $len$jscomp$inline_294$$) {
          break;
        }
        "undefined" != typeof $offset$jscomp$inline_290$$ && ($offset$jscomp$inline_290$$ += $curr$jscomp$inline_295$$);
      }
      $num$jscomp$7$$ = $iov$jscomp$1_ret$jscomp$inline_291$$;
    }
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $pnum$$ >> 2, $___asan_storeN$$)] = $num$jscomp$7$$;
    return 0;
  } catch ($e$jscomp$38$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$38$$.name) {
      throw $e$jscomp$38$$;
    }
    return $e$jscomp$38$$.$errno$;
  }
}, fd_seek:function($fd$jscomp$20$$, $offset$jscomp$47$$, $whence$jscomp$2$$, $newOffset$$) {
  $offset$jscomp$47$$ = -9007199254740992 > $offset$jscomp$47$$ || 9007199254740992 < $offset$jscomp$47$$ ? NaN : Number($offset$jscomp$47$$);
  try {
    if (isNaN($offset$jscomp$47$$)) {
      return 61;
    }
    var $stream$jscomp$58$$ = $FS$getStreamChecked$$($fd$jscomp$20$$);
    $FS$llseek$$($stream$jscomp$58$$, $offset$jscomp$47$$, $whence$jscomp$2$$);
    $HEAP64$$[$_asan_js_check_index$$($HEAP64$$, $newOffset$$ >> 3, $___asan_storeN$$)] = BigInt($stream$jscomp$58$$.position);
    $stream$jscomp$58$$.$getdents$ && 0 === $offset$jscomp$47$$ && 0 === $whence$jscomp$2$$ && ($stream$jscomp$58$$.$getdents$ = null);
    return 0;
  } catch ($e$jscomp$39$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$39$$.name) {
      throw $e$jscomp$39$$;
    }
    return $e$jscomp$39$$.$errno$;
  }
}, fd_write:function($fd$jscomp$21_iov$jscomp$inline_298$$, $iov$jscomp$3_ret$jscomp$inline_301$$, $iovcnt$jscomp$3$$, $pnum$jscomp$1$$) {
  try {
    a: {
      var $stream$jscomp$inline_297$$ = $FS$getStreamChecked$$($fd$jscomp$21_iov$jscomp$inline_298$$);
      $fd$jscomp$21_iov$jscomp$inline_298$$ = $iov$jscomp$3_ret$jscomp$inline_301$$;
      for (var $offset$jscomp$inline_300$$, $i$jscomp$inline_302$$ = $iov$jscomp$3_ret$jscomp$inline_301$$ = 0; $i$jscomp$inline_302$$ < $iovcnt$jscomp$3$$; $i$jscomp$inline_302$$++) {
        var $ptr$jscomp$inline_303$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $fd$jscomp$21_iov$jscomp$inline_298$$ >> 2, $___asan_loadN$$)], $len$jscomp$inline_304$$ = $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $fd$jscomp$21_iov$jscomp$inline_298$$ + 4 >> 2, $___asan_loadN$$)];
        $fd$jscomp$21_iov$jscomp$inline_298$$ += 8;
        var $curr$jscomp$inline_305$$ = $FS$write$$($stream$jscomp$inline_297$$, $HEAP8$$, $ptr$jscomp$inline_303$$, $len$jscomp$inline_304$$, $offset$jscomp$inline_300$$);
        if (0 > $curr$jscomp$inline_305$$) {
          var $num$jscomp$8$$ = -1;
          break a;
        }
        $iov$jscomp$3_ret$jscomp$inline_301$$ += $curr$jscomp$inline_305$$;
        if ($curr$jscomp$inline_305$$ < $len$jscomp$inline_304$$) {
          break;
        }
        "undefined" != typeof $offset$jscomp$inline_300$$ && ($offset$jscomp$inline_300$$ += $curr$jscomp$inline_305$$);
      }
      $num$jscomp$8$$ = $iov$jscomp$3_ret$jscomp$inline_301$$;
    }
    $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $pnum$jscomp$1$$ >> 2, $___asan_storeN$$)] = $num$jscomp$8$$;
    return 0;
  } catch ($e$jscomp$40$$) {
    if ("undefined" == typeof $FS$$ || "ErrnoError" !== $e$jscomp$40$$.name) {
      throw $e$jscomp$40$$;
    }
    return $e$jscomp$40$$.$errno$;
  }
}, glActiveTexture:$x0$jscomp$2$$ => $GLctx$$.activeTexture($x0$jscomp$2$$), glAttachShader:($program$jscomp$63$$, $shader$jscomp$11$$) => {
  $GLctx$$.attachShader($GL$programs$$[$program$jscomp$63$$], $GL$shaders$$[$shader$jscomp$11$$]);
}, glBindBuffer:($target$jscomp$95$$, $buffer$jscomp$34$$) => {
  35051 == $target$jscomp$95$$ ? $GLctx$$.$currentPixelPackBufferBinding$ = $buffer$jscomp$34$$ : 35052 == $target$jscomp$95$$ && ($GLctx$$.$currentPixelUnpackBufferBinding$ = $buffer$jscomp$34$$);
  $GLctx$$.bindBuffer($target$jscomp$95$$, $GL$buffers$$[$buffer$jscomp$34$$]);
}, glBindBufferRange:($target$jscomp$96$$, $index$jscomp$104$$, $buffer$jscomp$35$$, $offset$jscomp$49$$, $ptrsize$$) => {
  $GLctx$$.bindBufferRange($target$jscomp$96$$, $index$jscomp$104$$, $GL$buffers$$[$buffer$jscomp$35$$], $offset$jscomp$49$$, $ptrsize$$);
}, glBindTexture:($target$jscomp$97$$, $texture$jscomp$7$$) => {
  $GLctx$$.bindTexture($target$jscomp$97$$, $GL$textures$$[$texture$jscomp$7$$]);
}, glBindVertexArray:$vao$$ => {
  $GLctx$$.bindVertexArray($GL$vaos$$[$vao$$]);
}, glBufferData:($target$jscomp$98$$, $size$jscomp$33$$, $data$jscomp$85$$, $usage$jscomp$2$$) => {
  $data$jscomp$85$$ && $size$jscomp$33$$ ? $GLctx$$.bufferData($target$jscomp$98$$, $HEAPU8$$, $usage$jscomp$2$$, $data$jscomp$85$$, $size$jscomp$33$$) : $GLctx$$.bufferData($target$jscomp$98$$, $size$jscomp$33$$, $usage$jscomp$2$$);
}, glBufferSubData:($target$jscomp$99$$, $offset$jscomp$50$$, $size$jscomp$34$$, $data$jscomp$86$$) => {
  $size$jscomp$34$$ && $GLctx$$.bufferSubData($target$jscomp$99$$, $offset$jscomp$50$$, $HEAPU8$$, $data$jscomp$86$$, $size$jscomp$34$$);
}, glClear:$x0$jscomp$3$$ => $GLctx$$.clear($x0$jscomp$3$$), glClearColor:($x0$jscomp$4$$, $x1$jscomp$5$$, $x2$jscomp$3$$, $x3$$) => $GLctx$$.clearColor($x0$jscomp$4$$, $x1$jscomp$5$$, $x2$jscomp$3$$, $x3$$), glCompileShader:$shader$jscomp$12$$ => {
  $GLctx$$.compileShader($GL$shaders$$[$shader$jscomp$12$$]);
}, glCreateProgram:() => {
  var $id$jscomp$10$$ = $GL$getNewId$$($GL$programs$$), $program$jscomp$64$$ = $GLctx$$.createProgram();
  $program$jscomp$64$$.name = $id$jscomp$10$$;
  $program$jscomp$64$$.$maxUniformLength$ = $program$jscomp$64$$.$maxAttributeLength$ = $program$jscomp$64$$.$maxUniformBlockNameLength$ = 0;
  $program$jscomp$64$$.$uniformIdCounter$ = 1;
  $GL$programs$$[$id$jscomp$10$$] = $program$jscomp$64$$;
  return $id$jscomp$10$$;
}, glCreateShader:$shaderType$$ => {
  var $id$jscomp$11$$ = $GL$getNewId$$($GL$shaders$$);
  $GL$shaders$$[$id$jscomp$11$$] = $GLctx$$.createShader($shaderType$$);
  return $id$jscomp$11$$;
}, glDeleteBuffers:($n$jscomp$5$$, $buffers$jscomp$3$$) => {
  for (var $i$jscomp$44$$ = 0; $i$jscomp$44$$ < $n$jscomp$5$$; $i$jscomp$44$$++) {
    var $id$jscomp$12$$ = $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $buffers$jscomp$3$$ + 4 * $i$jscomp$44$$ >> 2, $___asan_loadN$$)], $buffer$jscomp$36$$ = $GL$buffers$$[$id$jscomp$12$$];
    $buffer$jscomp$36$$ && ($GLctx$$.deleteBuffer($buffer$jscomp$36$$), $buffer$jscomp$36$$.name = 0, $GL$buffers$$[$id$jscomp$12$$] = null, $id$jscomp$12$$ == $GLctx$$.$currentPixelPackBufferBinding$ && ($GLctx$$.$currentPixelPackBufferBinding$ = 0), $id$jscomp$12$$ == $GLctx$$.$currentPixelUnpackBufferBinding$ && ($GLctx$$.$currentPixelUnpackBufferBinding$ = 0));
  }
}, glDeleteProgram:$id$jscomp$13$$ => {
  if ($id$jscomp$13$$) {
    var $program$jscomp$65$$ = $GL$programs$$[$id$jscomp$13$$];
    $program$jscomp$65$$ ? ($GLctx$$.deleteProgram($program$jscomp$65$$), $program$jscomp$65$$.name = 0, $GL$programs$$[$id$jscomp$13$$] = null) : $GL$lastError$$ ||= 1281;
  }
}, glDeleteShader:$id$jscomp$14$$ => {
  if ($id$jscomp$14$$) {
    var $shader$jscomp$13$$ = $GL$shaders$$[$id$jscomp$14$$];
    $shader$jscomp$13$$ ? ($GLctx$$.deleteShader($shader$jscomp$13$$), $GL$shaders$$[$id$jscomp$14$$] = null) : $GL$lastError$$ ||= 1281;
  }
}, glDeleteTextures:($n$jscomp$6$$, $textures$$) => {
  for (var $i$jscomp$45$$ = 0; $i$jscomp$45$$ < $n$jscomp$6$$; $i$jscomp$45$$++) {
    var $id$jscomp$15$$ = $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $textures$$ + 4 * $i$jscomp$45$$ >> 2, $___asan_loadN$$)], $texture$jscomp$8$$ = $GL$textures$$[$id$jscomp$15$$];
    $texture$jscomp$8$$ && ($GLctx$$.deleteTexture($texture$jscomp$8$$), $texture$jscomp$8$$.name = 0, $GL$textures$$[$id$jscomp$15$$] = null);
  }
}, glDeleteVertexArrays:($n$jscomp$7$$, $vaos$$) => {
  for (var $i$jscomp$46$$ = 0; $i$jscomp$46$$ < $n$jscomp$7$$; $i$jscomp$46$$++) {
    var $id$jscomp$16$$ = $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $vaos$$ + 4 * $i$jscomp$46$$ >> 2, $___asan_loadN$$)];
    $GLctx$$.deleteVertexArray($GL$vaos$$[$id$jscomp$16$$]);
    $GL$vaos$$[$id$jscomp$16$$] = null;
  }
}, glDrawElements:($mode$jscomp$42$$, $count$jscomp$42$$, $type$jscomp$175$$, $indices$$) => {
  $GLctx$$.drawElements($mode$jscomp$42$$, $count$jscomp$42$$, $type$jscomp$175$$, $indices$$);
}, glEnable:$x0$jscomp$5$$ => $GLctx$$.enable($x0$jscomp$5$$), glEnableVertexAttribArray:$index$jscomp$105$$ => {
  $GLctx$$.enableVertexAttribArray($index$jscomp$105$$);
}, glGenBuffers:($n$jscomp$8$$, $buffers$jscomp$4$$) => {
  $GL$genObject$$($n$jscomp$8$$, $buffers$jscomp$4$$, "createBuffer", $GL$buffers$$);
}, glGenTextures:($n$jscomp$9$$, $textures$jscomp$1$$) => {
  $GL$genObject$$($n$jscomp$9$$, $textures$jscomp$1$$, "createTexture", $GL$textures$$);
}, glGenVertexArrays:($n$jscomp$10$$, $arrays$$) => {
  $GL$genObject$$($n$jscomp$10$$, $arrays$$, "createVertexArray", $GL$vaos$$);
}, glGenerateMipmap:$x0$jscomp$6$$ => $GLctx$$.generateMipmap($x0$jscomp$6$$), glGetProgramInfoLog:($log_program$jscomp$66$$, $maxLength_numBytesWrittenExclNull$$, $length$jscomp$40$$, $infoLog$$) => {
  $log_program$jscomp$66$$ = $GLctx$$.getProgramInfoLog($GL$programs$$[$log_program$jscomp$66$$]);
  null === $log_program$jscomp$66$$ && ($log_program$jscomp$66$$ = "(unknown error)");
  $maxLength_numBytesWrittenExclNull$$ = 0 < $maxLength_numBytesWrittenExclNull$$ && $infoLog$$ ? $stringToUTF8$$($log_program$jscomp$66$$, $infoLog$$, $maxLength_numBytesWrittenExclNull$$) : 0;
  $length$jscomp$40$$ && ($HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $length$jscomp$40$$ >> 2, $___asan_storeN$$)] = $maxLength_numBytesWrittenExclNull$$);
}, glGetProgramiv:($log$jscomp$1_program$jscomp$67$$, $i$jscomp$47_pname$jscomp$26$$, $p$jscomp$3$$) => {
  if ($p$jscomp$3$$) {
    if ($log$jscomp$1_program$jscomp$67$$ >= $GL$counter$$) {
      $GL$lastError$$ ||= 1281;
    } else {
      if ($log$jscomp$1_program$jscomp$67$$ = $GL$programs$$[$log$jscomp$1_program$jscomp$67$$], 35716 == $i$jscomp$47_pname$jscomp$26$$) {
        $log$jscomp$1_program$jscomp$67$$ = $GLctx$$.getProgramInfoLog($log$jscomp$1_program$jscomp$67$$), null === $log$jscomp$1_program$jscomp$67$$ && ($log$jscomp$1_program$jscomp$67$$ = "(unknown error)"), $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$3$$ >> 2, $___asan_storeN$$)] = $log$jscomp$1_program$jscomp$67$$.length + 1;
      } else if (35719 == $i$jscomp$47_pname$jscomp$26$$) {
        if (!$log$jscomp$1_program$jscomp$67$$.$maxUniformLength$) {
          var $numActiveAttributes_numActiveUniformBlocks_numActiveUniforms$$ = $GLctx$$.getProgramParameter($log$jscomp$1_program$jscomp$67$$, 35718);
          for ($i$jscomp$47_pname$jscomp$26$$ = 0; $i$jscomp$47_pname$jscomp$26$$ < $numActiveAttributes_numActiveUniformBlocks_numActiveUniforms$$; ++$i$jscomp$47_pname$jscomp$26$$) {
            $log$jscomp$1_program$jscomp$67$$.$maxUniformLength$ = Math.max($log$jscomp$1_program$jscomp$67$$.$maxUniformLength$, $GLctx$$.getActiveUniform($log$jscomp$1_program$jscomp$67$$, $i$jscomp$47_pname$jscomp$26$$).name.length + 1);
          }
        }
        $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$3$$ >> 2, $___asan_storeN$$)] = $log$jscomp$1_program$jscomp$67$$.$maxUniformLength$;
      } else if (35722 == $i$jscomp$47_pname$jscomp$26$$) {
        if (!$log$jscomp$1_program$jscomp$67$$.$maxAttributeLength$) {
          for ($numActiveAttributes_numActiveUniformBlocks_numActiveUniforms$$ = $GLctx$$.getProgramParameter($log$jscomp$1_program$jscomp$67$$, 35721), $i$jscomp$47_pname$jscomp$26$$ = 0; $i$jscomp$47_pname$jscomp$26$$ < $numActiveAttributes_numActiveUniformBlocks_numActiveUniforms$$; ++$i$jscomp$47_pname$jscomp$26$$) {
            $log$jscomp$1_program$jscomp$67$$.$maxAttributeLength$ = Math.max($log$jscomp$1_program$jscomp$67$$.$maxAttributeLength$, $GLctx$$.getActiveAttrib($log$jscomp$1_program$jscomp$67$$, $i$jscomp$47_pname$jscomp$26$$).name.length + 1);
          }
        }
        $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$3$$ >> 2, $___asan_storeN$$)] = $log$jscomp$1_program$jscomp$67$$.$maxAttributeLength$;
      } else if (35381 == $i$jscomp$47_pname$jscomp$26$$) {
        if (!$log$jscomp$1_program$jscomp$67$$.$maxUniformBlockNameLength$) {
          for ($numActiveAttributes_numActiveUniformBlocks_numActiveUniforms$$ = $GLctx$$.getProgramParameter($log$jscomp$1_program$jscomp$67$$, 35382), $i$jscomp$47_pname$jscomp$26$$ = 0; $i$jscomp$47_pname$jscomp$26$$ < $numActiveAttributes_numActiveUniformBlocks_numActiveUniforms$$; ++$i$jscomp$47_pname$jscomp$26$$) {
            $log$jscomp$1_program$jscomp$67$$.$maxUniformBlockNameLength$ = Math.max($log$jscomp$1_program$jscomp$67$$.$maxUniformBlockNameLength$, $GLctx$$.getActiveUniformBlockName($log$jscomp$1_program$jscomp$67$$, $i$jscomp$47_pname$jscomp$26$$).length + 1);
          }
        }
        $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$3$$ >> 2, $___asan_storeN$$)] = $log$jscomp$1_program$jscomp$67$$.$maxUniformBlockNameLength$;
      } else {
        $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$3$$ >> 2, $___asan_storeN$$)] = $GLctx$$.getProgramParameter($log$jscomp$1_program$jscomp$67$$, $i$jscomp$47_pname$jscomp$26$$);
      }
    }
  } else {
    $GL$lastError$$ ||= 1281;
  }
}, glGetShaderInfoLog:($log$jscomp$2_shader$jscomp$14$$, $maxLength$jscomp$1_numBytesWrittenExclNull$jscomp$1$$, $length$jscomp$41$$, $infoLog$jscomp$1$$) => {
  $log$jscomp$2_shader$jscomp$14$$ = $GLctx$$.getShaderInfoLog($GL$shaders$$[$log$jscomp$2_shader$jscomp$14$$]);
  null === $log$jscomp$2_shader$jscomp$14$$ && ($log$jscomp$2_shader$jscomp$14$$ = "(unknown error)");
  $maxLength$jscomp$1_numBytesWrittenExclNull$jscomp$1$$ = 0 < $maxLength$jscomp$1_numBytesWrittenExclNull$jscomp$1$$ && $infoLog$jscomp$1$$ ? $stringToUTF8$$($log$jscomp$2_shader$jscomp$14$$, $infoLog$jscomp$1$$, $maxLength$jscomp$1_numBytesWrittenExclNull$jscomp$1$$) : 0;
  $length$jscomp$41$$ && ($HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $length$jscomp$41$$ >> 2, $___asan_storeN$$)] = $maxLength$jscomp$1_numBytesWrittenExclNull$jscomp$1$$);
}, glGetShaderiv:($log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$, $pname$jscomp$27$$, $p$jscomp$4$$) => {
  $p$jscomp$4$$ ? 35716 == $pname$jscomp$27$$ ? ($log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$ = $GLctx$$.getShaderInfoLog($GL$shaders$$[$log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$]), null === $log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$ && ($log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$ = "(unknown error)"), $log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$ = $log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$ ? 
  $log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$.length + 1 : 0, $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$4$$ >> 2, $___asan_storeN$$)] = $log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$) : 35720 == $pname$jscomp$27$$ ? ($log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$ = ($log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$ = $GLctx$$.getShaderSource($GL$shaders$$[$log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$])) ? 
  $log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$.length + 1 : 0, $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$4$$ >> 2, $___asan_storeN$$)] = $log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$) : $HEAP32$$[$_asan_js_check_index$$($HEAP32$$, $p$jscomp$4$$ >> 2, $___asan_storeN$$)] = $GLctx$$.getShaderParameter($GL$shaders$$[$log$jscomp$3_logLength_shader$jscomp$15_source$jscomp$19_sourceLength$$], $pname$jscomp$27$$) : $GL$lastError$$ ||= 1281;
}, glGetUniformBlockIndex:($program$jscomp$68$$, $uniformBlockName$jscomp$1$$) => $GLctx$$.getUniformBlockIndex($GL$programs$$[$program$jscomp$68$$], $UTF8ToString$$($uniformBlockName$jscomp$1$$)), glGetUniformLocation:($program$jscomp$70$$, $name$jscomp$125$$) => {
  $name$jscomp$125$$ = $UTF8ToString$$($name$jscomp$125$$);
  if ($program$jscomp$70$$ = $GL$programs$$[$program$jscomp$70$$]) {
    var $program$jscomp$inline_317_uniformLocsById$jscomp$1$$ = $program$jscomp$70$$, $arrayIndex_uniformLocsById$jscomp$inline_318$$ = $program$jscomp$inline_317_uniformLocsById$jscomp$1$$.$uniformLocsById$, $sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$ = $program$jscomp$inline_317_uniformLocsById$jscomp$1$$.$uniformSizeAndIdsByName$, $i$jscomp$inline_320_leftBrace$$;
    if (!$arrayIndex_uniformLocsById$jscomp$inline_318$$) {
      $program$jscomp$inline_317_uniformLocsById$jscomp$1$$.$uniformLocsById$ = $arrayIndex_uniformLocsById$jscomp$inline_318$$ = {};
      $program$jscomp$inline_317_uniformLocsById$jscomp$1$$.$uniformArrayNamesById$ = {};
      var $numActiveUniforms$jscomp$inline_322$$ = $GLctx$$.getProgramParameter($program$jscomp$inline_317_uniformLocsById$jscomp$1$$, 35718);
      for ($i$jscomp$inline_320_leftBrace$$ = 0; $i$jscomp$inline_320_leftBrace$$ < $numActiveUniforms$jscomp$inline_322$$; ++$i$jscomp$inline_320_leftBrace$$) {
        var $sz$jscomp$inline_325_u$jscomp$inline_323$$ = $GLctx$$.getActiveUniform($program$jscomp$inline_317_uniformLocsById$jscomp$1$$, $i$jscomp$inline_320_leftBrace$$);
        var $j$jscomp$inline_321_nm$jscomp$inline_324$$ = $sz$jscomp$inline_325_u$jscomp$inline_323$$.name;
        $sz$jscomp$inline_325_u$jscomp$inline_323$$ = $sz$jscomp$inline_325_u$jscomp$inline_323$$.size;
        var $arrayName$jscomp$inline_327_lb$jscomp$inline_326$$ = $webglGetLeftBracePos$$($j$jscomp$inline_321_nm$jscomp$inline_324$$);
        $arrayName$jscomp$inline_327_lb$jscomp$inline_326$$ = 0 < $arrayName$jscomp$inline_327_lb$jscomp$inline_326$$ ? $j$jscomp$inline_321_nm$jscomp$inline_324$$.slice(0, $arrayName$jscomp$inline_327_lb$jscomp$inline_326$$) : $j$jscomp$inline_321_nm$jscomp$inline_324$$;
        var $id$jscomp$inline_328$$ = $program$jscomp$inline_317_uniformLocsById$jscomp$1$$.$uniformIdCounter$;
        $program$jscomp$inline_317_uniformLocsById$jscomp$1$$.$uniformIdCounter$ += $sz$jscomp$inline_325_u$jscomp$inline_323$$;
        $sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$[$arrayName$jscomp$inline_327_lb$jscomp$inline_326$$] = [$sz$jscomp$inline_325_u$jscomp$inline_323$$, $id$jscomp$inline_328$$];
        for ($j$jscomp$inline_321_nm$jscomp$inline_324$$ = 0; $j$jscomp$inline_321_nm$jscomp$inline_324$$ < $sz$jscomp$inline_325_u$jscomp$inline_323$$; ++$j$jscomp$inline_321_nm$jscomp$inline_324$$) {
          $arrayIndex_uniformLocsById$jscomp$inline_318$$[$id$jscomp$inline_328$$] = $j$jscomp$inline_321_nm$jscomp$inline_324$$, $program$jscomp$inline_317_uniformLocsById$jscomp$1$$.$uniformArrayNamesById$[$id$jscomp$inline_328$$++] = $arrayName$jscomp$inline_327_lb$jscomp$inline_326$$;
        }
      }
    }
    $program$jscomp$inline_317_uniformLocsById$jscomp$1$$ = $program$jscomp$70$$.$uniformLocsById$;
    $arrayIndex_uniformLocsById$jscomp$inline_318$$ = 0;
    $sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$ = $name$jscomp$125$$;
    $i$jscomp$inline_320_leftBrace$$ = $webglGetLeftBracePos$$($name$jscomp$125$$);
    0 < $i$jscomp$inline_320_leftBrace$$ && ($arrayIndex_uniformLocsById$jscomp$inline_318$$ = parseInt($name$jscomp$125$$.slice($i$jscomp$inline_320_leftBrace$$ + 1)) >>> 0, $sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$ = $name$jscomp$125$$.slice(0, $i$jscomp$inline_320_leftBrace$$));
    if (($sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$ = $program$jscomp$70$$.$uniformSizeAndIdsByName$[$sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$]) && $arrayIndex_uniformLocsById$jscomp$inline_318$$ < $sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$[0] && ($arrayIndex_uniformLocsById$jscomp$inline_318$$ += $sizeAndId_uniformBaseName_uniformSizeAndIdsByName$jscomp$inline_319$$[1], $program$jscomp$inline_317_uniformLocsById$jscomp$1$$[$arrayIndex_uniformLocsById$jscomp$inline_318$$] = 
    $program$jscomp$inline_317_uniformLocsById$jscomp$1$$[$arrayIndex_uniformLocsById$jscomp$inline_318$$] || $GLctx$$.getUniformLocation($program$jscomp$70$$, $name$jscomp$125$$))) {
      return $arrayIndex_uniformLocsById$jscomp$inline_318$$;
    }
  } else {
    $GL$lastError$$ ||= 1281;
  }
  return -1;
}, glLinkProgram:$program$jscomp$71$$ => {
  $program$jscomp$71$$ = $GL$programs$$[$program$jscomp$71$$];
  $GLctx$$.linkProgram($program$jscomp$71$$);
  $program$jscomp$71$$.$uniformLocsById$ = 0;
  $program$jscomp$71$$.$uniformSizeAndIdsByName$ = {};
}, glShaderSource:($shader$jscomp$16$$, $count$jscomp$43$$, $string$jscomp$6$$, $length$jscomp$42$$) => {
  for (var $source$jscomp$inline_335$$ = "", $i$jscomp$inline_336$$ = 0; $i$jscomp$inline_336$$ < $count$jscomp$43$$; ++$i$jscomp$inline_336$$) {
    var $len$jscomp$inline_337$$ = $length$jscomp$42$$ ? $HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $length$jscomp$42$$ + 4 * $i$jscomp$inline_336$$ >> 2, $___asan_loadN$$)] : void 0;
    $source$jscomp$inline_335$$ += $UTF8ToString$$($HEAPU32$$[$_asan_js_check_index$$($HEAPU32$$, $string$jscomp$6$$ + 4 * $i$jscomp$inline_336$$ >> 2, $___asan_loadN$$)], $len$jscomp$inline_337$$);
  }
  $GLctx$$.shaderSource($GL$shaders$$[$shader$jscomp$16$$], $source$jscomp$inline_335$$);
}, glTexImage2D:($target$jscomp$100$$, $level$jscomp$20$$, $internalFormat$jscomp$1$$, $width$jscomp$34$$, $height$jscomp$28$$, $border$jscomp$5$$, $format$jscomp$21$$, $type$jscomp$178$$, $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$) => {
  if ($GLctx$$.$currentPixelUnpackBufferBinding$) {
    $GLctx$$.texImage2D($target$jscomp$100$$, $level$jscomp$20$$, $internalFormat$jscomp$1$$, $width$jscomp$34$$, $height$jscomp$28$$, $border$jscomp$5$$, $format$jscomp$21$$, $type$jscomp$178$$, $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$);
  } else {
    if ($JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$) {
      var $heap$jscomp$3_heap$jscomp$inline_344$$ = $heapObjectForWebGLType$$($type$jscomp$178$$);
      $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$ >>>= 31 - Math.clz32($heap$jscomp$3_heap$jscomp$inline_344$$.BYTES_PER_ELEMENT);
      $GLctx$$.texImage2D($target$jscomp$100$$, $level$jscomp$20$$, $internalFormat$jscomp$1$$, $width$jscomp$34$$, $height$jscomp$28$$, $border$jscomp$5$$, $format$jscomp$21$$, $type$jscomp$178$$, $heap$jscomp$3_heap$jscomp$inline_344$$, $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$);
    } else {
      if ($JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$) {
        $heap$jscomp$3_heap$jscomp$inline_344$$ = $heapObjectForWebGLType$$($type$jscomp$178$$);
        var $bytes$jscomp$inline_345$$ = $height$jscomp$28$$ * ($width$jscomp$34$$ * ({5:3, 6:4, 8:2, 29502:3, 29504:4, 26917:2, 26918:2, 29846:3, 29847:4}[$format$jscomp$21$$ - 6402] || 1) * $heap$jscomp$3_heap$jscomp$inline_344$$.BYTES_PER_ELEMENT + 4 - 1 & -4);
        $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$ = $heap$jscomp$3_heap$jscomp$inline_344$$.subarray($JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$ >>> 31 - Math.clz32($heap$jscomp$3_heap$jscomp$inline_344$$.BYTES_PER_ELEMENT), $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$ + $bytes$jscomp$inline_345$$ >>> 31 - Math.clz32($heap$jscomp$3_heap$jscomp$inline_344$$.BYTES_PER_ELEMENT));
      } else {
        $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$ = null;
      }
      $GLctx$$.texImage2D($target$jscomp$100$$, $level$jscomp$20$$, $internalFormat$jscomp$1$$, $width$jscomp$34$$, $height$jscomp$28$$, $border$jscomp$5$$, $format$jscomp$21$$, $type$jscomp$178$$, $JSCompiler_temp$jscomp$59_index$jscomp$106_pixels$jscomp$2$$);
    }
  }
}, glTexParameteri:($x0$jscomp$7$$, $x1$jscomp$6$$, $x2$jscomp$4$$) => $GLctx$$.texParameteri($x0$jscomp$7$$, $x1$jscomp$6$$, $x2$jscomp$4$$), glUniform1i:($JSCompiler_inline_result$jscomp$62_location$jscomp$80$$, $v0$jscomp$16$$) => {
  var $JSCompiler_temp_const$jscomp$61$$ = $GLctx$$, $JSCompiler_temp_const$jscomp$60$$ = $JSCompiler_temp_const$jscomp$61$$.uniform1i;
  var $p$jscomp$inline_348$$ = $GLctx$$.$currentProgram$;
  if ($p$jscomp$inline_348$$) {
    var $webglLoc$jscomp$inline_349$$ = $p$jscomp$inline_348$$.$uniformLocsById$[$JSCompiler_inline_result$jscomp$62_location$jscomp$80$$];
    "number" == typeof $webglLoc$jscomp$inline_349$$ && ($p$jscomp$inline_348$$.$uniformLocsById$[$JSCompiler_inline_result$jscomp$62_location$jscomp$80$$] = $webglLoc$jscomp$inline_349$$ = $GLctx$$.getUniformLocation($p$jscomp$inline_348$$, $p$jscomp$inline_348$$.$uniformArrayNamesById$[$JSCompiler_inline_result$jscomp$62_location$jscomp$80$$] + (0 < $webglLoc$jscomp$inline_349$$ ? `[${$webglLoc$jscomp$inline_349$$}]` : "")));
    $JSCompiler_inline_result$jscomp$62_location$jscomp$80$$ = $webglLoc$jscomp$inline_349$$;
  } else {
    $GL$lastError$$ ||= 1282, $JSCompiler_inline_result$jscomp$62_location$jscomp$80$$ = void 0;
  }
  $JSCompiler_temp_const$jscomp$60$$.call($JSCompiler_temp_const$jscomp$61$$, $JSCompiler_inline_result$jscomp$62_location$jscomp$80$$, $v0$jscomp$16$$);
}, glUniformBlockBinding:($program$jscomp$72$$, $uniformBlockIndex$jscomp$3$$, $uniformBlockBinding$jscomp$1$$) => {
  $program$jscomp$72$$ = $GL$programs$$[$program$jscomp$72$$];
  $GLctx$$.uniformBlockBinding($program$jscomp$72$$, $uniformBlockIndex$jscomp$3$$, $uniformBlockBinding$jscomp$1$$);
}, glUseProgram:$program$jscomp$73$$ => {
  $program$jscomp$73$$ = $GL$programs$$[$program$jscomp$73$$];
  $GLctx$$.useProgram($program$jscomp$73$$);
  $GLctx$$.$currentProgram$ = $program$jscomp$73$$;
}, glVertexAttribPointer:($index$jscomp$107$$, $size$jscomp$35$$, $type$jscomp$179$$, $normalized$jscomp$2$$, $stride$jscomp$3$$, $ptr$jscomp$40$$) => {
  $GLctx$$.vertexAttribPointer($index$jscomp$107$$, $size$jscomp$35$$, $type$jscomp$179$$, !!$normalized$jscomp$2$$, $stride$jscomp$3$$, $ptr$jscomp$40$$);
}, glViewport:($x0$jscomp$8$$, $x1$jscomp$7$$, $x2$jscomp$5$$, $x3$jscomp$1$$) => $GLctx$$.viewport($x0$jscomp$8$$, $x1$jscomp$7$$, $x2$jscomp$5$$, $x3$jscomp$1$$), proc_exit:$code$jscomp$4$$ => {
  $noExitRuntime$$ || ($Module$$.onExit?.($code$jscomp$4$$), $ABORT$$ = !0);
  throw new $ExitStatus$$($code$jscomp$4$$);
}, textureFromURL:function($textureID$$, $url$jscomp$29$$, $ctxId$$) {
  let $gl$jscomp$1$$ = $GL$contexts$$[$ctxId$$].$GLctx$, $img$jscomp$2$$ = new Image(), $imgUrl$$ = $UTF8ToString$$($url$jscomp$29$$);
  $img$jscomp$2$$.onload = function() {
    let $texture$jscomp$9$$ = $GL$textures$$[$textureID$$];
    $texture$jscomp$9$$ ? ($gl$jscomp$1$$.bindTexture($gl$jscomp$1$$.TEXTURE_2D, $texture$jscomp$9$$), $gl$jscomp$1$$.texImage2D($gl$jscomp$1$$.TEXTURE_2D, 0, $gl$jscomp$1$$.RGBA, $gl$jscomp$1$$.RGBA, $gl$jscomp$1$$.UNSIGNED_BYTE, $img$jscomp$2$$), $gl$jscomp$1$$.generateMipmap($gl$jscomp$1$$.TEXTURE_2D), $gl$jscomp$1$$.texParameteri($gl$jscomp$1$$.TEXTURE_2D, $gl$jscomp$1$$.TEXTURE_MIN_FILTER, $gl$jscomp$1$$.LINEAR_MIPMAP_LINEAR), $gl$jscomp$1$$.texParameteri($gl$jscomp$1$$.TEXTURE_2D, $gl$jscomp$1$$.TEXTURE_MAG_FILTER, 
    $gl$jscomp$1$$.LINEAR), $gl$jscomp$1$$.bindTexture($gl$jscomp$1$$.TEXTURE_2D, null)) : console.error("Texture failed to load (it no longer exists):\t" + $imgUrl$$);
  };
  $img$jscomp$2$$.onerror = function() {
    console.error("Texture failed to load:\t" + $imgUrl$$);
  };
  $img$jscomp$2$$.src = $imgUrl$$;
}}, $calledRun$$;
function $run$$() {
  function $doRun$$() {
    $assert$$(!$calledRun$$);
    $calledRun$$ = !0;
    $Module$$.calledRun = !0;
    if (!$ABORT$$) {
      $assert$$(!$runtimeInitialized$$);
      $runtimeInitialized$$ = !0;
      $checkStackCookie$$();
      if (!$Module$$.noFSInit && !$FS$initialized$$) {
        $assert$$(!$FS$initialized$$, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
        $FS$initialized$$ = !0;
        $input$jscomp$inline_449_input$jscomp$inline_452_stdout$jscomp$inline_456$$ ??= $Module$$.stdin;
        $output$jscomp$inline_450_output$jscomp$inline_453_stderr$jscomp$inline_457$$ ??= $Module$$.stdout;
        $cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$ ??= $Module$$.stderr;
        $input$jscomp$inline_449_input$jscomp$inline_452_stdout$jscomp$inline_456$$ ? $FS$createDevice$$("/dev", "stdin", $input$jscomp$inline_449_input$jscomp$inline_452_stdout$jscomp$inline_456$$) : $FS$symlink$$("/dev/tty", "/dev/stdin");
        $output$jscomp$inline_450_output$jscomp$inline_453_stderr$jscomp$inline_457$$ ? $FS$createDevice$$("/dev", "stdout", null, $output$jscomp$inline_450_output$jscomp$inline_453_stderr$jscomp$inline_457$$) : $FS$symlink$$("/dev/tty", "/dev/stdout");
        $cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$ ? $FS$createDevice$$("/dev", "stderr", null, $cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$) : $FS$symlink$$("/dev/tty1", "/dev/stderr");
        var $cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$ = $FS$open$$("/dev/stdin", 0);
        var $input$jscomp$inline_449_input$jscomp$inline_452_stdout$jscomp$inline_456$$ = $FS$open$$("/dev/stdout", 1);
        var $output$jscomp$inline_450_output$jscomp$inline_453_stderr$jscomp$inline_457$$ = $FS$open$$("/dev/stderr", 1);
        $assert$$(0 === $cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$.$fd$, `invalid handle for stdin (${$cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$.$fd$})`);
        $assert$$(1 === $input$jscomp$inline_449_input$jscomp$inline_452_stdout$jscomp$inline_456$$.$fd$, `invalid handle for stdout (${$input$jscomp$inline_449_input$jscomp$inline_452_stdout$jscomp$inline_456$$.$fd$})`);
        $assert$$(2 === $output$jscomp$inline_450_output$jscomp$inline_453_stderr$jscomp$inline_457$$.$fd$, `invalid handle for stderr (${$output$jscomp$inline_450_output$jscomp$inline_453_stderr$jscomp$inline_457$$.$fd$})`);
      }
      $wasmExports$$.__wasm_call_ctors();
      $FS$ignorePermissions$$ = !1;
      $readyPromiseResolve$$?.($Module$$);
      $Module$$.onRuntimeInitialized?.();
      $consumedModuleProp$$("onRuntimeInitialized");
      $assert$$(!$Module$$._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
      $checkStackCookie$$();
      if ($Module$$.postRun) {
        for ("function" == typeof $Module$$.postRun && ($Module$$.postRun = [$Module$$.postRun]); $Module$$.postRun.length;) {
          $cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$ = $Module$$.postRun.shift(), $onPostRuns$$.push($cb$jscomp$inline_459_error$jscomp$inline_451_error$jscomp$inline_454_stdin$jscomp$inline_455$$);
        }
      }
      $consumedModuleProp$$("postRun");
      $callRuntimeCallbacks$$($onPostRuns$$);
    }
  }
  if (0 < $runDependencies$$) {
    $dependenciesFulfilled$$ = $run$$;
  } else {
    $_emscripten_stack_init$$();
    $writeStackCookie$$();
    if ($Module$$.preRun) {
      for ("function" == typeof $Module$$.preRun && ($Module$$.preRun = [$Module$$.preRun]); $Module$$.preRun.length;) {
        $addOnPreRun$$();
      }
    }
    $consumedModuleProp$$("preRun");
    $callRuntimeCallbacks$$($onPreRuns$$);
    0 < $runDependencies$$ ? $dependenciesFulfilled$$ = $run$$ : ($Module$$.setStatus ? ($Module$$.setStatus("Running..."), setTimeout(() => {
      setTimeout(() => $Module$$.setStatus(""), 1);
      $doRun$$();
    }, 1)) : $doRun$$(), $checkStackCookie$$());
  }
}
var $wasmExports$$;
$wasmExports$$ = await (async function() {
  function $receiveInstance$$($instance$jscomp$1_wasmExports$jscomp$inline_357$$) {
    $instance$jscomp$1_wasmExports$jscomp$inline_357$$ = $wasmExports$$ = $instance$jscomp$1_wasmExports$jscomp$inline_357$$.exports;
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__getTypeName, "missing Wasm export: __getTypeName");
    $___getTypeName$$ = $createExportWrapper$$("__getTypeName", 1);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.malloc, "missing Wasm export: malloc");
    $_malloc$$ = $createExportWrapper$$("malloc", 1);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.free, "missing Wasm export: free");
    $_free$$ = $createExportWrapper$$("free", 1);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__funcs_on_exit, "missing Wasm export: __funcs_on_exit");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.fflush, "missing Wasm export: fflush");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_stack_get_end, "missing Wasm export: emscripten_stack_get_end");
    $_emscripten_stack_get_end$$ = $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_stack_get_end;
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_stack_get_base, "missing Wasm export: emscripten_stack_get_base");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.strerror, "missing Wasm export: strerror");
    $_strerror$$ = $createExportWrapper$$("strerror", 1);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_builtin_malloc, "missing Wasm export: emscripten_builtin_malloc");
    $_emscripten_builtin_malloc$$ = $createExportWrapper$$("emscripten_builtin_malloc", 1);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_builtin_free, "missing Wasm export: emscripten_builtin_free");
    $_emscripten_builtin_free$$ = $createExportWrapper$$("emscripten_builtin_free", 1);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_builtin_realloc, "missing Wasm export: emscripten_builtin_realloc");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_builtin_memalign, "missing Wasm export: emscripten_builtin_memalign");
    $_emscripten_builtin_memalign$$ = $createExportWrapper$$("emscripten_builtin_memalign", 2);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_builtin_calloc, "missing Wasm export: emscripten_builtin_calloc");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.calloc, "missing Wasm export: calloc");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.realloc, "missing Wasm export: realloc");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.memalign, "missing Wasm export: memalign");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_stack_init, "missing Wasm export: emscripten_stack_init");
    $_emscripten_stack_init$$ = $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_stack_init;
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_stack_get_free, "missing Wasm export: emscripten_stack_get_free");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$._emscripten_stack_restore, "missing Wasm export: _emscripten_stack_restore");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$._emscripten_stack_alloc, "missing Wasm export: _emscripten_stack_alloc");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.emscripten_stack_get_current, "missing Wasm export: emscripten_stack_get_current");
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$._ZN6__asan9FakeStack17AddrIsInFakeStackEm, "missing Wasm export: _ZN6__asan9FakeStack17AddrIsInFakeStackEm");
    $Module$$.__ZN6__asan9FakeStack17AddrIsInFakeStackEm = $createExportWrapper$$("_ZN6__asan9FakeStack17AddrIsInFakeStackEm", 2);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$._ZN6__asan9FakeStack8AllocateEmmm, "missing Wasm export: _ZN6__asan9FakeStack8AllocateEmmm");
    $Module$$.__ZN6__asan9FakeStack8AllocateEmmm = $createExportWrapper$$("_ZN6__asan9FakeStack8AllocateEmmm", 4);
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__asan_loadN, "missing Wasm export: __asan_loadN");
    $___asan_loadN$$ = $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__asan_loadN;
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__asan_storeN, "missing Wasm export: __asan_storeN");
    $___asan_storeN$$ = $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__asan_storeN;
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.memory, "missing Wasm export: memory");
    $wasmMemory$$ = $instance$jscomp$1_wasmExports$jscomp$inline_357$$.memory;
    $assert$$("undefined" != typeof $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__indirect_function_table, "missing Wasm export: __indirect_function_table");
    $wasmTable$$ = $instance$jscomp$1_wasmExports$jscomp$inline_357$$.__indirect_function_table;
    $updateMemoryViews$$();
    return $wasmExports$$;
  }
  var $trueModule$$ = $Module$$, $info$$ = {env:$wasmImports$$, wasi_snapshot_preview1:$wasmImports$$};
  if ($Module$$.instantiateWasm) {
    return new Promise(($resolve$$, $reject$$) => {
      try {
        $Module$$.instantiateWasm($info$$, ($inst$$, $mod$$) => {
          $resolve$$($receiveInstance$$($inst$$, $mod$$));
        });
      } catch ($e$jscomp$8$$) {
        $err$$(`Module.instantiateWasm callback failed with error: ${$e$jscomp$8$$}`), $reject$$($e$jscomp$8$$);
      }
    });
  }
  $wasmBinaryFile$$ ??= $Module$$.locateFile ? $Module$$.locateFile("terrain_debug.wasm", $scriptDirectory$$) : $scriptDirectory$$ + "terrain_debug.wasm";
  return function($result$jscomp$2$$) {
    $assert$$($Module$$ === $trueModule$$, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
    $trueModule$$ = null;
    return $receiveInstance$$($result$jscomp$2$$.instance);
  }(await $instantiateAsync$$($info$$));
}());
$run$$();
$runtimeInitialized$$ ? moduleRtn = $Module$$ : moduleRtn = new Promise(($resolve$jscomp$1$$, $reject$jscomp$1$$) => {
  $readyPromiseResolve$$ = $resolve$jscomp$1$$;
  $readyPromiseReject$$ = $reject$jscomp$1$$;
});
for (const $prop$jscomp$4$$ of Object.keys($Module$$)) {
  $prop$jscomp$4$$ in moduleArg || Object.defineProperty(moduleArg, $prop$jscomp$4$$, {configurable:!0, get() {
    $abort$$(`Access to module property ('${$prop$jscomp$4$$}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
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

