"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/universal-user-agent";
exports.ids = ["vendor-chunks/universal-user-agent"];
exports.modules = {

/***/ "(rsc)/./node_modules/universal-user-agent/index.js":
/*!****************************************************!*\
  !*** ./node_modules/universal-user-agent/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getUserAgent: () => (/* binding */ getUserAgent)\n/* harmony export */ });\nfunction getUserAgent() {\n  if (typeof navigator === \"object\" && \"userAgent\" in navigator) {\n    return navigator.userAgent;\n  }\n\n  if (typeof process === \"object\" && process.version !== undefined) {\n    return `Node.js/${process.version.substr(1)} (${process.platform}; ${\n      process.arch\n    })`;\n  }\n\n  return \"<environment undetectable>\";\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvdW5pdmVyc2FsLXVzZXItYWdlbnQvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXNCLDJCQUEyQixHQUFHLG1CQUFtQjtBQUN2RTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYm9zcy1mYWN0b3J5Ly4vbm9kZV9tb2R1bGVzL3VuaXZlcnNhbC11c2VyLWFnZW50L2luZGV4LmpzPzMxMWMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJBZ2VudCgpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09IFwib2JqZWN0XCIgJiYgXCJ1c2VyQWdlbnRcIiBpbiBuYXZpZ2F0b3IpIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzLnZlcnNpb24gIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBgTm9kZS5qcy8ke3Byb2Nlc3MudmVyc2lvbi5zdWJzdHIoMSl9ICgke3Byb2Nlc3MucGxhdGZvcm19OyAke1xuICAgICAgcHJvY2Vzcy5hcmNoXG4gICAgfSlgO1xuICB9XG5cbiAgcmV0dXJuIFwiPGVudmlyb25tZW50IHVuZGV0ZWN0YWJsZT5cIjtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/universal-user-agent/index.js\n");

/***/ })

};
;