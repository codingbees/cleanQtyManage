"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

var _conf = _interopRequireDefault(require("../../conf"));

var _tools = require("../../tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * 校验规则
 */
var Rule = /*#__PURE__*/function () {
  function Rule(rule) {
    _classCallCheck(this, Rule);

    Object.assign(this, {
      $options: rule,
      required: rule.required,
      min: rule.min,
      max: rule.max,
      type: rule.type,
      pattern: rule.pattern,
      validator: rule.validator,
      trigger: rule.trigger,
      maxWidth: rule.maxWidth
    });
  }
  /**
   * 获取校验不通过的消息
   * 支持国际化翻译
   */


  _createClass(Rule, [{
    key: "message",
    get: function get() {
      return _tools.UtilTools.getFuncText(this.$options.message);
    }
  }]);

  return Rule;
}();

var _default = {
  methods: {
    /**
     * 与 validate 一致行为，区别就是会校验所有并返回所有不通过的所有列
     */
    _fullValidate: function _fullValidate(rows, cb) {
      return this.beginValidate(rows, cb, true);
    },

    /**
     * 对表格数据进行校验
     */
    _validate: function _validate(rows, cb) {
      return this.beginValidate(rows, cb);
    },

    /**
     * 聚焦到校验通过的单元格并弹出校验错误提示
     */
    handleValidError: function handleValidError(params) {
      var _this = this;

      if (this.validOpts.autoPos === false) {
        this.emitEvent('valid-error', params);
      } else {
        this.handleActived(params, {
          type: 'valid-error',
          trigger: 'call'
        }).then(function () {
          return _this.showValidTooltip(params);
        });
      }
    },

    /**
     * 对表格数据进行校验
     * 如果传 row 指定行记录，则只验证传入的行
     * 如果传 rows 为多行记录，则只验证传入的行
     * 如果只传 callback 否则默认验证整个表格数据
     * 返回 Promise 对象，或者使用回调方式
     */
    beginValidate: function beginValidate(rows, cb, isAll) {
      var _this2 = this;

      var validRest = {};
      var status = true;
      var editRules = this.editRules,
          afterFullData = this.afterFullData,
          treeConfig = this.treeConfig,
          treeOpts = this.treeOpts;
      var vaildDatas = afterFullData;

      if (rows) {
        if (_xeUtils.default.isFunction(rows)) {
          cb = rows;
        } else {
          vaildDatas = _xeUtils.default.isArray(rows) ? rows : [rows];
        }
      }

      var rowValids = [];
      this.lastCallTime = Date.now();
      this.clearValidate();

      if (editRules) {
        var columns = this.getColumns();

        var handleVaild = function handleVaild(row) {
          var colVailds = [];
          columns.forEach(function (column) {
            if (_xeUtils.default.has(editRules, column.property)) {
              colVailds.push(new Promise(function (resolve, reject) {
                _this2.validCellRules('all', row, column).then(resolve).catch(function (_ref) {
                  var _rest;

                  var rule = _ref.rule,
                      rules = _ref.rules;
                  var rest = (_rest = {
                    rule: rule,
                    rules: rules
                  }, _defineProperty(_rest, "".concat(treeConfig ? '$' : '', "rowIndex"), _this2.getRowIndex(row)), _defineProperty(_rest, "row", row), _defineProperty(_rest, "columnIndex", _this2.getColumnIndex(column)), _defineProperty(_rest, "column", column), _defineProperty(_rest, "$table", _this2), _rest);

                  if (isAll) {
                    if (!validRest[column.property]) {
                      validRest[column.property] = [];
                    }

                    validRest[column.property].push(rest);
                    return resolve();
                  }

                  return reject(rest);
                });
              }));
            }
          });
          rowValids.push(Promise.all(colVailds));
        };

        if (treeConfig) {
          _xeUtils.default.eachTree(vaildDatas, handleVaild, treeOpts);
        } else {
          vaildDatas.forEach(handleVaild);
        }

        return Promise.all(rowValids).then(function () {
          var ruleProps = Object.keys(validRest);

          if (ruleProps.length) {
            return Promise.reject(validRest[ruleProps[0]][0]);
          }

          if (cb) {
            // 在 v3.0 中废弃 setup.validArgs
            if (_conf.default.validArgs === 'obsolete') {
              cb(status);
            } else {
              cb();
            }
          }
        }).catch(function (params) {
          var args = isAll ? validRest : _defineProperty({}, params.column.property, params);
          return new Promise(function (resolve, reject) {
            var finish = function finish() {
              status = false;

              if (cb) {
                // 在 v3.0 中废弃 setup.validArgs
                if (_conf.default.validArgs === 'obsolete') {
                  cb(status, args);
                } else {
                  cb(args);
                }

                resolve();
              } else {
                reject(args);
              }
            };

            var posAndFinish = function posAndFinish() {
              params.cell = _tools.DomTools.getCell(_this2, params);

              _this2.handleValidError(params);

              finish();
            };
            /**
             * 当校验不通过时
             * 将表格滚动到可视区
             * 由于提示信息至少需要占一行，定位向上偏移一行
             */


            var row = params.row;
            var rowIndex = afterFullData.indexOf(row);
            var locatRow = rowIndex > 0 ? afterFullData[rowIndex - 1] : row;

            _tools.DomTools.toView(_this2.$el);

            if (_this2.validOpts.autoPos === false) {
              finish();
            } else {
              if (treeConfig) {
                _this2.scrollToTreeRow(locatRow).then(posAndFinish);
              } else {
                _this2.scrollToRow(locatRow).then(posAndFinish);
              }
            }
          });
        });
      }

      if (cb) {
        // 在 v3.0 中废弃 setup.validArgs
        if (_conf.default.validArgs === 'obsolete') {
          cb(status);
        } else {
          cb();
        }
      }

      return Promise.resolve();
    },
    hasCellRules: function hasCellRules(type, row, column) {
      var editRules = this.editRules;
      var property = column.property;

      if (property && editRules) {
        var rules = _xeUtils.default.get(editRules, property);

        return rules && _xeUtils.default.find(rules, function (rule) {
          return type === 'all' || !rule.trigger || type === rule.trigger;
        });
      }

      return false;
    },

    /**
     * 校验数据
     * 按表格行、列顺序依次校验（同步或异步）
     * 校验规则根据索引顺序依次校验，如果是异步则会等待校验完成才会继续校验下一列
     * 如果校验失败则，触发回调或者Promise<不通过列的错误消息>
     * 如果是传回调方式这返回一个校验不通过列的错误消息
     *
     * rule 配置：
     *  required=Boolean 是否必填
     *  min=Number 最小长度
     *  max=Number 最大长度
     *  validator=Function({ cellValue, rule, rules, row, column, rowIndex, columnIndex }) 自定义校验，接收一个 Promise
     *  trigger=blur|change 触发方式（除非特殊场景，否则默认为空就行）
     */
    validCellRules: function validCellRules(type, row, column, val) {
      var _this3 = this;

      var editRules = this.editRules;
      var property = column.property;
      var errorRules = [];
      var cellVailds = [];

      if (property && editRules) {
        var rules = _xeUtils.default.get(editRules, property);

        if (rules) {
          var cellValue = _xeUtils.default.isUndefined(val) ? _xeUtils.default.get(row, property) : val;
          rules.forEach(function (rule) {
            cellVailds.push(new Promise(function (resolve) {
              if (type === 'all' || !rule.trigger || type === rule.trigger) {
                if (_xeUtils.default.isFunction(rule.validator)) {
                  // 在 v3.0 中废弃 setup.validArgs
                  if (_conf.default.validArgs === 'obsolete') {
                    rule.validator(rule, cellValue, function (e) {
                      if (_xeUtils.default.isError(e)) {
                        var cusRule = {
                          type: 'custom',
                          trigger: rule.trigger,
                          message: e.message,
                          rule: new Rule(rule)
                        };
                        errorRules.push(new Rule(cusRule));
                      }

                      return resolve();
                    }, {
                      rule: rule,
                      rules: rules,
                      row: row,
                      column: column,
                      rowIndex: _this3.getRowIndex(row),
                      columnIndex: _this3.getColumnIndex(column),
                      $table: _this3
                    });
                  } else {
                    Promise.resolve(rule.validator({
                      cellValue: cellValue,
                      rule: rule,
                      rules: rules,
                      row: row,
                      rowIndex: _this3.getRowIndex(row),
                      column: column,
                      columnIndex: _this3.getColumnIndex(column),
                      $table: _this3
                    })).catch(function (e) {
                      errorRules.push(new Rule({
                        type: 'custom',
                        trigger: rule.trigger,
                        message: e ? e.message : rule.message,
                        rule: new Rule(rule)
                      }));
                    }).then(resolve);
                  }
                } else {
                  var isNumber = rule.type === 'number';
                  var numVal = isNumber ? _xeUtils.default.toNumber(cellValue) : _xeUtils.default.getSize(cellValue);

                  if (cellValue === null || cellValue === undefined || cellValue === '') {
                    if (rule.required) {
                      errorRules.push(new Rule(rule));
                    }
                  } else if (isNumber && isNaN(cellValue) || !isNaN(rule.min) && numVal < parseFloat(rule.min) || !isNaN(rule.max) && numVal > parseFloat(rule.max) || rule.pattern && !(rule.pattern.test ? rule.pattern : new RegExp(rule.pattern)).test(cellValue)) {
                    errorRules.push(new Rule(rule));
                  }

                  resolve();
                }
              } else {
                resolve();
              }
            }));
          });
        }
      }

      return Promise.all(cellVailds).then(function () {
        if (errorRules.length) {
          var rest = {
            rules: errorRules,
            rule: errorRules[0]
          };
          return Promise.reject(rest);
        }
      });
    },
    _clearValidate: function _clearValidate() {
      var validTip = this.$refs.validTip;
      Object.assign(this.validStore, {
        visible: false,
        row: null,
        column: null,
        content: '',
        rule: null
      });

      if (validTip && validTip.visible) {
        validTip.close();
      }

      return this.$nextTick();
    },

    /**
     * 触发校验
     */
    triggerValidate: function triggerValidate(type) {
      var _this4 = this;

      var editConfig = this.editConfig,
          editStore = this.editStore,
          editRules = this.editRules,
          validStore = this.validStore;
      var actived = editStore.actived;

      if (actived.row && editRules) {
        var _actived$args = actived.args,
            row = _actived$args.row,
            column = _actived$args.column,
            cell = _actived$args.cell;

        if (this.hasCellRules(type, row, column)) {
          return this.validCellRules(type, row, column).then(function () {
            if (editConfig.mode === 'row') {
              if (validStore.visible && validStore.row === row && validStore.column === column) {
                _this4.clearValidate();
              }
            }
          }).catch(function (_ref3) {
            var rule = _ref3.rule;

            // 如果校验不通过与触发方式一致，则聚焦提示错误，否则跳过并不作任何处理
            if (!rule.trigger || type === rule.trigger) {
              var rest = {
                rule: rule,
                row: row,
                column: column,
                cell: cell
              };

              _this4.showValidTooltip(rest);

              return Promise.reject(rest);
            }

            return Promise.resolve();
          });
        }
      }

      return Promise.resolve();
    },

    /**
     * 弹出校验错误提示
     */
    showValidTooltip: function showValidTooltip(params) {
      var _this5 = this;

      var $refs = this.$refs,
          height = this.height,
          tableData = this.tableData,
          validOpts = this.validOpts;
      var rule = params.rule,
          row = params.row,
          column = params.column,
          cell = params.cell;
      var validTip = $refs.validTip;
      var content = rule.message;
      this.$nextTick(function () {
        Object.assign(_this5.validStore, {
          row: row,
          column: column,
          rule: rule,
          content: content,
          visible: true
        });

        if (validTip && (validOpts.message === 'tooltip' || validOpts.message === 'default' && !height && tableData.length < 2)) {
          validTip.toVisible(cell, content);
        }

        _this5.emitEvent('valid-error', params);
      });
    }
  }
};
exports.default = _default;