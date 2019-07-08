(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./$$_lazy_route_resource lazy recursive":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./node_modules/raw-loader/index.js!./src/app/app.component.html":
/*!**************************************************************!*\
  !*** ./node_modules/raw-loader!./src/app/app.component.html ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div *ngIf=\"config\" class=\"container\">\n  <div class=\"job-info\" *ngIf=\"job != null\">\n    <div class=\"progress-ring\">\n      <round-progress [current]=\"job.progress\" [max]=\"100\" [stroke]=\"25\" [rounded]=\"true\" [responsive]=\"true\" [color]=\"'#44bd32'\"></round-progress>\n      <div class=\"progress-percentage\">{{ job.progress }}<span style=\"font-size: 40%\">%</span></div>\n    </div>\n    <span class=\"job-filename\">{{ job.filename }}</span> <br />\n    <span class=\"job-filament\">{{ job.filamentAmount }}g Filament</span> <br />\n    <span class=\"job-time\"><span class=\"job-time-left\">{{ job.timeLeft.value }}</span>{{ job.timeLeft.unit }} left of {{ job.timeTotal.value }}{{ job.timeTotal.unit }}</span>\n  </div>\n  <div class=\"no-job\" *ngIf=\"job == null\">\n    No Job Running ...\n  </div>\n  <div class=\"printer-state\">\n    <table class=\"printer-state-table\">\n      <tr>\n        <td class=\"printer-value printer-value-1\">\n          <div class=\"container-printer-value\">\n            <img src=\"assets/nozzle.svg\">\n            <span class=\"printer-actual-value\">190<span class=\"unit\">°C</span></span>\n            <span class=\"printer-set-value\">/190<span class=\"unit\">°C</span></span>\n          </div>\n        </td>\n        <td class=\"printer-value printer-value-2\">\n          <div class=\"container-printer-value\">\n            <img src=\"assets/hot_bed.svg\">\n            <span class=\"printer-actual-value\">56<span class=\"unit\">°C</span></span>\n            <span class=\"printer-set-value\">/55<span class=\"unit\">°C</span></span>\n          </div>\n        </td>\n        <td class=\"printer-value printer-value-3\">\n          <div class=\"container-printer-value\">\n            <img src=\"assets/fan.svg\">\n            <span class=\"printer-actual-value\">80<span class=\"unit\">%</span></span>\n            <span class=\"printer-set-value\">/80<span class=\"unit\">%</span></span>\n          </div>\n        </td>\n      </tr>\n    </table>\n  </div>\n  <div class=\"bottom-bar\">\n    <table class=\"bottom-bar-table\">\n      <tr>\n        <td class=\"printer-name\"> {{ config.printer.name }} </td>\n        <td class=\"enclosure-temperature\"> {{ enclosureTemperature }}°C</td>\n        <td class=\"current-state\"> {{ currentState.status }}({{ currentState.duration.value }}{{ currentState.duration.unit }}) </td>\n      </tr>\n    </table>\n  </div>\n</div>"

/***/ }),

/***/ "./src/app/app.component.scss":
/*!************************************!*\
  !*** ./src/app/app.component.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".container {\n  width: 100%;\n  height: 100%;\n  display: block;\n  position: relative;\n}\n\n.bottom-bar {\n  position: absolute;\n  bottom: 3vw;\n  left: 0;\n  right: 1.6vw;\n}\n\n.bottom-bar-table {\n  width: 100%;\n}\n\n.bottom-bar-table td {\n  width: 33.3%;\n}\n\n.enclosure-temperature {\n  text-align: center;\n}\n\n.current-state {\n  text-align: right;\n}\n\n.progress-ring {\n  padding: 4.5vw 5vw 0 4.5vw;\n  width: 22vw;\n  height: 22vw;\n  float: left;\n}\n\n.progress-percentage {\n  margin-top: -16.2vw;\n  margin-left: 4.3vw;\n  font-size: 8.5vw;\n  text-align: center;\n  width: 14vw;\n}\n\n.no-job {\n  width: 100%;\n  font-size: 2vw;\n  height: 14vw;\n  padding-top: 6vw;\n  text-align: center;\n}\n\n.job-filename {\n  font-size: 6vw;\n  padding-top: 4.5vw;\n  display: inline-block;\n}\n\n.job-filament {\n  font-size: 3vw;\n  margin-top: -4vw;\n}\n\n.job-time {\n  display: inline-block;\n  padding-top: 2vw;\n}\n\n.job-time-left {\n  font-size: 6vw;\n  font-weight: 600;\n}\n\n.printer-state-table {\n  width: 100%;\n  padding-top: 5vw;\n}\n\n.printer-value {\n  text-align: right;\n}\n\n.printer-value img {\n  width: 10vw;\n  float: left;\n  padding-top: 1vw;\n  padding-right: 2vw;\n}\n\n.unit {\n  font-size: 60%;\n}\n\n.printer-actual-value {\n  font-size: 6vw;\n  font-weight: 600;\n  display: block;\n}\n\n.printer-set-value {\n  display: block;\n  text-align: right;\n}\n\n.printer-value-1 {\n  width: 27vw;\n  padding-left: 2vw;\n  padding-right: 8.5vw;\n}\n\n.printer-value-2 {\n  width: 25vw;\n  padding-right: 7.5vw;\n}\n\n.printer-value-2 img {\n  width: 9.2vw;\n  height: 9.2vw;\n}\n\n.printer-value-3 {\n  padding-right: 3vw;\n}\n\n.printer-value-3 img {\n  width: 11.5vw;\n  height: 11.5vw;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kMDY0OTA2L2NvZGUvT2N0b3ByaW50RGFzaC9zcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyIsInNyYy9hcHAvYXBwLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0ksV0FBQTtFQUNBLFlBQUE7RUFDQSxjQUFBO0VBQ0Esa0JBQUE7QUNDSjs7QURFQTtFQUNJLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLE9BQUE7RUFDQSxZQUFBO0FDQ0o7O0FERUE7RUFDSSxXQUFBO0FDQ0o7O0FEQUk7RUFDSSxZQUFBO0FDRVI7O0FERUE7RUFDSSxrQkFBQTtBQ0NKOztBREVBO0VBQ0ksaUJBQUE7QUNDSjs7QURFQTtFQUNJLDBCQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxXQUFBO0FDQ0o7O0FERUE7RUFDSSxtQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLFdBQUE7QUNDSjs7QURFQTtFQUNJLFdBQUE7RUFDQSxjQUFBO0VBQ0EsWUFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7QUNDSjs7QURFQTtFQUNJLGNBQUE7RUFDQSxrQkFBQTtFQUNBLHFCQUFBO0FDQ0o7O0FERUE7RUFDSSxjQUFBO0VBQ0EsZ0JBQUE7QUNDSjs7QURFQTtFQUNJLHFCQUFBO0VBQ0EsZ0JBQUE7QUNDSjs7QURFQTtFQUNJLGNBQUE7RUFDQSxnQkFBQTtBQ0NKOztBREVBO0VBQ0ksV0FBQTtFQUNBLGdCQUFBO0FDQ0o7O0FERUE7RUFDSSxpQkFBQTtBQ0NKOztBREVBO0VBQ0ksV0FBQTtFQUNBLFdBQUE7RUFDQSxnQkFBQTtFQUNBLGtCQUFBO0FDQ0o7O0FERUE7RUFDSSxjQUFBO0FDQ0o7O0FERUE7RUFDSSxjQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0FDQ0o7O0FERUE7RUFDSSxjQUFBO0VBQ0EsaUJBQUE7QUNDSjs7QURFQTtFQUNJLFdBQUE7RUFDQSxpQkFBQTtFQUNBLG9CQUFBO0FDQ0o7O0FERUE7RUFDSSxXQUFBO0VBQ0Esb0JBQUE7QUNDSjs7QURBSTtFQUNJLFlBQUE7RUFDQSxhQUFBO0FDRVI7O0FERUE7RUFDSSxrQkFBQTtBQ0NKOztBREFJO0VBQ0ksYUFBQTtFQUNBLGNBQUE7QUNFUiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5jb250YWluZXIge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG5cbi5ib3R0b20tYmFyIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm90dG9tOiAzdnc7XG4gICAgbGVmdDogMDtcbiAgICByaWdodDogMS42dnc7XG59XG5cbi5ib3R0b20tYmFyLXRhYmxlIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICB0ZCB7XG4gICAgICAgIHdpZHRoOiAzMy4zJTtcbiAgICB9XG59XG5cbi5lbmNsb3N1cmUtdGVtcGVyYXR1cmUge1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cblxuLmN1cnJlbnQtc3RhdGUge1xuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xufVxuXG4ucHJvZ3Jlc3MtcmluZyB7XG4gICAgcGFkZGluZzogNC41dncgNXZ3IDAgNC41dnc7XG4gICAgd2lkdGg6IDIydnc7XG4gICAgaGVpZ2h0OiAyMnZ3O1xuICAgIGZsb2F0OiBsZWZ0O1xufVxuXG4ucHJvZ3Jlc3MtcGVyY2VudGFnZSB7XG4gICAgbWFyZ2luLXRvcDogLTE2LjJ2dztcbiAgICBtYXJnaW4tbGVmdDogNC4zdnc7XG4gICAgZm9udC1zaXplOiA4LjV2dztcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgd2lkdGg6IDE0dnc7XG59XG5cbi5uby1qb2Ige1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGZvbnQtc2l6ZTogMnZ3O1xuICAgIGhlaWdodDogMTR2dztcbiAgICBwYWRkaW5nLXRvcDogNnZ3O1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cblxuLmpvYi1maWxlbmFtZSB7XG4gICAgZm9udC1zaXplOiA2dnc7XG4gICAgcGFkZGluZy10b3A6IDQuNXZ3O1xuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbn1cblxuLmpvYi1maWxhbWVudCB7XG4gICAgZm9udC1zaXplOiAzdnc7XG4gICAgbWFyZ2luLXRvcDogLTR2dztcbn1cblxuLmpvYi10aW1lIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgcGFkZGluZy10b3A6IDJ2dztcbn1cblxuLmpvYi10aW1lLWxlZnQge1xuICAgIGZvbnQtc2l6ZTogNnZ3O1xuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG59XG5cbi5wcmludGVyLXN0YXRlLXRhYmxlIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBwYWRkaW5nLXRvcDogNXZ3O1xufVxuXG4ucHJpbnRlci12YWx1ZSB7XG4gICAgdGV4dC1hbGlnbjogcmlnaHQ7XG59XG5cbi5wcmludGVyLXZhbHVlIGltZyB7XG4gICAgd2lkdGg6IDEwdnc7XG4gICAgZmxvYXQ6IGxlZnQ7XG4gICAgcGFkZGluZy10b3A6IDF2dztcbiAgICBwYWRkaW5nLXJpZ2h0OiAydnc7XG59XG5cbi51bml0IHtcbiAgICBmb250LXNpemU6IDYwJTtcbn1cblxuLnByaW50ZXItYWN0dWFsLXZhbHVlIHtcbiAgICBmb250LXNpemU6IDZ2dztcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIGRpc3BsYXk6IGJsb2NrO1xufVxuXG4ucHJpbnRlci1zZXQtdmFsdWUge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xufVxuXG4ucHJpbnRlci12YWx1ZS0xIHtcbiAgICB3aWR0aDogMjd2dztcbiAgICBwYWRkaW5nLWxlZnQ6IDJ2dztcbiAgICBwYWRkaW5nLXJpZ2h0OiA4LjV2dztcbn1cblxuLnByaW50ZXItdmFsdWUtMiB7XG4gICAgd2lkdGg6IDI1dnc7XG4gICAgcGFkZGluZy1yaWdodDogNy41dnc7XG4gICAgJiBpbWcge1xuICAgICAgICB3aWR0aDogOS4ydnc7XG4gICAgICAgIGhlaWdodDogOS4ydnc7XG4gICAgfVxufVxuXG4ucHJpbnRlci12YWx1ZS0zICB7XG4gICAgcGFkZGluZy1yaWdodDogM3Z3O1xuICAgICYgaW1nIHtcbiAgICAgICAgd2lkdGg6IDExLjV2dztcbiAgICAgICAgaGVpZ2h0OiAxMS41dnc7XG4gICAgfVxufSIsIi5jb250YWluZXIge1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBkaXNwbGF5OiBibG9jaztcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuXG4uYm90dG9tLWJhciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgYm90dG9tOiAzdnc7XG4gIGxlZnQ6IDA7XG4gIHJpZ2h0OiAxLjZ2dztcbn1cblxuLmJvdHRvbS1iYXItdGFibGUge1xuICB3aWR0aDogMTAwJTtcbn1cbi5ib3R0b20tYmFyLXRhYmxlIHRkIHtcbiAgd2lkdGg6IDMzLjMlO1xufVxuXG4uZW5jbG9zdXJlLXRlbXBlcmF0dXJlIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuXG4uY3VycmVudC1zdGF0ZSB7XG4gIHRleHQtYWxpZ246IHJpZ2h0O1xufVxuXG4ucHJvZ3Jlc3MtcmluZyB7XG4gIHBhZGRpbmc6IDQuNXZ3IDV2dyAwIDQuNXZ3O1xuICB3aWR0aDogMjJ2dztcbiAgaGVpZ2h0OiAyMnZ3O1xuICBmbG9hdDogbGVmdDtcbn1cblxuLnByb2dyZXNzLXBlcmNlbnRhZ2Uge1xuICBtYXJnaW4tdG9wOiAtMTYuMnZ3O1xuICBtYXJnaW4tbGVmdDogNC4zdnc7XG4gIGZvbnQtc2l6ZTogOC41dnc7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgd2lkdGg6IDE0dnc7XG59XG5cbi5uby1qb2Ige1xuICB3aWR0aDogMTAwJTtcbiAgZm9udC1zaXplOiAydnc7XG4gIGhlaWdodDogMTR2dztcbiAgcGFkZGluZy10b3A6IDZ2dztcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuXG4uam9iLWZpbGVuYW1lIHtcbiAgZm9udC1zaXplOiA2dnc7XG4gIHBhZGRpbmctdG9wOiA0LjV2dztcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xufVxuXG4uam9iLWZpbGFtZW50IHtcbiAgZm9udC1zaXplOiAzdnc7XG4gIG1hcmdpbi10b3A6IC00dnc7XG59XG5cbi5qb2ItdGltZSB7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgcGFkZGluZy10b3A6IDJ2dztcbn1cblxuLmpvYi10aW1lLWxlZnQge1xuICBmb250LXNpemU6IDZ2dztcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbn1cblxuLnByaW50ZXItc3RhdGUtdGFibGUge1xuICB3aWR0aDogMTAwJTtcbiAgcGFkZGluZy10b3A6IDV2dztcbn1cblxuLnByaW50ZXItdmFsdWUge1xuICB0ZXh0LWFsaWduOiByaWdodDtcbn1cblxuLnByaW50ZXItdmFsdWUgaW1nIHtcbiAgd2lkdGg6IDEwdnc7XG4gIGZsb2F0OiBsZWZ0O1xuICBwYWRkaW5nLXRvcDogMXZ3O1xuICBwYWRkaW5nLXJpZ2h0OiAydnc7XG59XG5cbi51bml0IHtcbiAgZm9udC1zaXplOiA2MCU7XG59XG5cbi5wcmludGVyLWFjdHVhbC12YWx1ZSB7XG4gIGZvbnQtc2l6ZTogNnZ3O1xuICBmb250LXdlaWdodDogNjAwO1xuICBkaXNwbGF5OiBibG9jaztcbn1cblxuLnByaW50ZXItc2V0LXZhbHVlIHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHRleHQtYWxpZ246IHJpZ2h0O1xufVxuXG4ucHJpbnRlci12YWx1ZS0xIHtcbiAgd2lkdGg6IDI3dnc7XG4gIHBhZGRpbmctbGVmdDogMnZ3O1xuICBwYWRkaW5nLXJpZ2h0OiA4LjV2dztcbn1cblxuLnByaW50ZXItdmFsdWUtMiB7XG4gIHdpZHRoOiAyNXZ3O1xuICBwYWRkaW5nLXJpZ2h0OiA3LjV2dztcbn1cbi5wcmludGVyLXZhbHVlLTIgaW1nIHtcbiAgd2lkdGg6IDkuMnZ3O1xuICBoZWlnaHQ6IDkuMnZ3O1xufVxuXG4ucHJpbnRlci12YWx1ZS0zIHtcbiAgcGFkZGluZy1yaWdodDogM3Z3O1xufVxuLnByaW50ZXItdmFsdWUtMyBpbWcge1xuICB3aWR0aDogMTEuNXZ3O1xuICBoZWlnaHQ6IDExLjV2dztcbn0iXX0= */"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _app_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.service */ "./src/app/app.service.ts");



let AppComponent = class AppComponent {
    constructor(_service) {
        this._service = _service;
        this.enclosureTemperature = 22.3;
        this.currentState = {
            status: "printing",
            duration: {
                value: "1:14",
                unit: "h"
            }
        };
        this.job = {
            filename: "Benchy.gcode",
            progress: 99,
            filamentAmount: 5.8,
            timeLeft: {
                value: "0:45",
                unit: "h"
            },
            timeTotal: {
                value: "1:59",
                unit: "h"
            }
        };
        this._service.getConfig().subscribe((config) => this.config = config);
    }
};
AppComponent.ctorParameters = () => [
    { type: _app_service__WEBPACK_IMPORTED_MODULE_2__["AppService"] }
];
AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
        selector: 'app-root',
        template: __webpack_require__(/*! raw-loader!./app.component.html */ "./node_modules/raw-loader/index.js!./src/app/app.component.html"),
        styles: [__webpack_require__(/*! ./app.component.scss */ "./src/app/app.component.scss")]
    }),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_app_service__WEBPACK_IMPORTED_MODULE_2__["AppService"]])
], AppComponent);



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm2015/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");
/* harmony import */ var angular_svg_round_progressbar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! angular-svg-round-progressbar */ "./node_modules/angular-svg-round-progressbar/dist/index.js");
/* harmony import */ var angular_svg_round_progressbar__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(angular_svg_round_progressbar__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");






let AppModule = class AppModule {
};
AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
        declarations: [
            _app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"]
        ],
        imports: [
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpClientModule"],
            angular_svg_round_progressbar__WEBPACK_IMPORTED_MODULE_4__["RoundProgressModule"]
        ],
        providers: [],
        bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_5__["AppComponent"]]
    })
], AppModule);



/***/ }),

/***/ "./src/app/app.service.ts":
/*!********************************!*\
  !*** ./src/app/app.service.ts ***!
  \********************************/
/*! exports provided: AppService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppService", function() { return AppService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm2015/http.js");



let AppService = class AppService {
    constructor(http) {
        this.http = http;
    }
    getConfig() {
        return this.http.get("assets/config.json");
    }
};
AppService.ctorParameters = () => [
    { type: _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"] }
];
AppService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
        providedIn: 'root'
    }),
    tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"]])
], AppService);



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm2015/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm2015/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/d064906/code/OctoprintDash/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main-es2015.js.map