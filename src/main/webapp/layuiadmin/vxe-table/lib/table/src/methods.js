"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _xeUtils = _interopRequireDefault(require("xe-utils/methods/xe-utils"));

var _conf = _interopRequireDefault(require("../../conf"));

var _cell = _interopRequireDefault(require("../../cell"));

var _vXETable = _interopRequireDefault(require("../../v-x-e-table"));

var _tools = require("../../tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var browse = _tools.DomTools.browse;
var isWebkit = browse['-webkit'] && !browse.edge;
var debounceScrollYDuration = browse.msie ? 40 : 20;
var resizableStorageKey = 'VXE_TABLE_CUSTOM_COLUMN_WIDTH';
var visibleStorageKey = 'VXE_TABLE_CUSTOM_COLUMN_VISIBLE';
/**
 * 生成行的唯一主键
 */

function getRowUniqueId() {
  return _xeUtils.default.uniqueId('row_');
}

function getNextSortOrder(_vm, column) {
  var orders = _vm.sortOpts.orders;
  var currOrder = column.order || null;
  var oIndex = orders.indexOf(currOrder) + 1;
  return orders[oIndex < orders.length ? oIndex : 0];
}

function getCustomStorageMap(key) {
  var version = _conf.default.version;

  var rest = _xeUtils.default.toStringJSON(localStorage.getItem(key));

  return rest && rest._v === version ? rest : {
    _v: version
  };
}

function handleReserveRow(_vm, list) {
  var fullAllDataRowMap = _vm.fullAllDataRowMap;
  return list.filter(function (row) {
    return fullAllDataRowMap.has(row);
  });
}

var Methods = {
  /**
   * 获取父容器元素
   */
  getParentElem: function getParentElem() {
    return this.$xegrid ? this.$xegrid.$el.parentNode : this.$el.parentNode;
  },

  /**
   * 获取父容器的高度
   */
  getParentHeight: function getParentHeight() {
    return this.$xegrid ? this.$xegrid.getParentHeight() : this.getParentElem().clientHeight;
  },

  /**
   * 获取需要排除的高度
   * 但渲染表格高度时，需要排除工具栏或分页等相关组件的高度
   * 如果存在表尾合计滚动条，则需要排除滚动条高度
   */
  getExcludeHeight: function getExcludeHeight() {
    return this.$xegrid ? this.$xegrid.getExcludeHeight() : 0;
  },

  /**
   * 重置表格的一切数据状态
   */
  clearAll: function clearAll() {
    this.inited = false;
    this.clearSort();
    this.clearCurrentRow();
    this.clearCurrentColumn();
    this.clearRadioRow();
    this.clearRadioReserve();
    this.clearCheckboxRow();
    this.clearCheckboxReserve();
    this.clearRowExpand();
    this.clearTreeExpand();

    if (_vXETable.default._edit) {
      this.clearActived();
    }

    if (_vXETable.default._filter) {
      this.clearFilter();
    }

    if (this.keyboardConfig || this.mouseConfig) {
      this.clearIndexChecked();
      this.clearHeaderChecked();
      this.clearChecked();
      this.clearSelected();
      this.clearCopyed();
    }

    return this.clearScroll();
  },
  refreshData: function refreshData() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['refreshData', 'syncData']);

    return this.syncData();
  },

  /**
   * 同步 data 数据
   * 如果用了该方法，那么组件将不再记录增删改的状态，只能自行实现对应逻辑
   * 对于某些特殊的场景，比如深层树节点元素发生变动时可能会用到
   */
  syncData: function syncData() {
    var _this = this;

    return this.$nextTick().then(function () {
      _this.tableData = [];
      return _this.$nextTick().then(function () {
        return _this.loadTableData(_this.tableFullData);
      });
    });
  },

  /**
   * 手动处理数据
   * 对于手动更改了排序、筛选...等条件后需要重新处理数据时可能会用到
   */
  updateData: function updateData() {
    return this.handleTableData(true).then(this.updateFooter).then(this.recalculate);
  },
  handleTableData: function handleTableData(force) {
    var scrollYLoad = this.scrollYLoad,
        scrollYStore = this.scrollYStore;
    var fullData = force ? this.updateAfterFullData() : this.afterFullData;
    this.tableData = scrollYLoad ? fullData.slice(scrollYStore.startIndex, Math.max(scrollYStore.startIndex + scrollYStore.renderSize, 1)) : fullData.slice(0);
    return this.$nextTick();
  },

  /**
   * 加载表格数据
   * @param {Array} datas 数据
   */
  loadTableData: function loadTableData(datas) {
    var _this2 = this;

    var keepSource = this.keepSource,
        treeConfig = this.treeConfig,
        editStore = this.editStore,
        sYOpts = this.sYOpts,
        scrollYStore = this.scrollYStore;
    var tableFullData = datas ? datas.slice(0) : [];
    var scrollYLoad = !treeConfig && sYOpts.gt > -1 && sYOpts.gt < tableFullData.length;
    scrollYStore.startIndex = 0;
    scrollYStore.visibleIndex = 0;
    editStore.insertList = [];
    editStore.removeList = []; // 全量数据

    this.tableFullData = tableFullData; // 缓存数据

    this.updateCache(true); // 原始数据

    this.tableSynchData = datas;

    if (keepSource) {
      this.tableSourceData = _xeUtils.default.clone(tableFullData, true);
    }

    this.scrollYLoad = scrollYLoad;

    if (scrollYLoad) {
      if (!(this.height || this.maxHeight)) {
        _tools.UtilTools.error('vxe.error.reqProp', ['height | max-height']);
      }

      if (!this.showOverflow) {
        _tools.UtilTools.warn('vxe.error.reqProp', ['show-overflow']);
      }

      if (this.spanMethod) {
        _tools.UtilTools.warn('vxe.error.scrollErrProp', ['span-method']);
      }
    }

    this.handleTableData(true);
    this.updateFooter();
    return this.computeScrollLoad().then(function () {
      // 是否加载了数据
      _this2.isLoadData = true;

      _this2.computeRowHeight();

      _this2.handleReserveStatus();

      _this2.checkSelectionStatus();

      return _this2.$nextTick().then(_this2.recalculate).then(_this2.refreshScroll);
    });
  },

  /**
   * 重新加载数据，不会清空表格状态
   * @param {Array} datas 数据
   */
  loadData: function loadData(datas) {
    this.inited = true;
    return this.loadTableData(datas).then(this.recalculate);
  },

  /**
   * 重新加载数据，会清空表格状态
   * @param {Array} datas 数据
   */
  reloadData: function reloadData(datas) {
    var _this3 = this;

    return this.clearAll().then(function () {
      _this3.inited = true;
      return _this3.loadTableData(datas);
    }).then(this.handleDefaults);
  },

  /**
   * 局部加载行数据并恢复到初始状态
   * 对于行数据需要局部更改的场景中可能会用到
   * @param {Row} row 行对象
   * @param {Object} record 新数据
   * @param {String} field 字段名
   */
  reloadRow: function reloadRow(row, record, field) {
    var tableSourceData = this.tableSourceData,
        tableData = this.tableData; // 在 v3 中必须要开启 keep-source

    if (!this.keepSource) {
      _tools.UtilTools.warn('vxe.error.reqProp', ['keep-source']);

      return this.$nextTick();
    }

    var rowIndex = this.getRowIndex(row);
    var oRow = tableSourceData[rowIndex];

    if (oRow && row) {
      if (field) {
        _xeUtils.default.set(oRow, field, _xeUtils.default.get(record || row, field));
      } else {
        if (record) {
          tableSourceData[rowIndex] = record;

          _xeUtils.default.clear(row, undefined);

          Object.assign(row, this.defineField(Object.assign({}, record)));
          this.updateCache(true);
        } else {
          _xeUtils.default.destructuring(oRow, _xeUtils.default.clone(row, true));
        }
      }
    }

    this.tableData = tableData.slice(0);
    return this.$nextTick();
  },

  /**
   * 加载列配置
   * 对于表格列需要重载、局部递增场景下可能会用到
   * @param {ColumnConfig} columns 列配置
   */
  loadColumn: function loadColumn(columns) {
    var _this4 = this;

    this.collectColumn = _xeUtils.default.mapTree(columns, function (column) {
      return _cell.default.createColumn(_this4, column);
    });
    return this.$nextTick();
  },

  /**
   * 加载列配置并恢复到初始状态
   * 对于表格列需要重载、局部递增场景下可能会用到
   * @param {ColumnConfig} columns 列配置
   */
  reloadColumn: function reloadColumn(columns) {
    this.clearAll();
    return this.loadColumn(columns);
  },

  /**
   * 更新数据行的 Map
   * 牺牲数据组装的耗时，用来换取使用过程中的流畅
   */
  updateCache: function updateCache(source) {
    var _this5 = this;

    var treeConfig = this.treeConfig,
        treeOpts = this.treeOpts,
        tableFullData = this.tableFullData,
        fullDataRowMap = this.fullDataRowMap,
        fullAllDataRowMap = this.fullAllDataRowMap;
    var fullDataRowIdData = this.fullDataRowIdData,
        fullAllDataRowIdData = this.fullAllDataRowIdData;

    var rowkey = _tools.UtilTools.getRowkey(this);

    var isLazy = treeConfig && treeOpts.lazy;

    var handleCache = function handleCache(row, index) {
      var rowid = _tools.UtilTools.getRowid(_this5, row);

      if (!rowid) {
        rowid = getRowUniqueId();

        _xeUtils.default.set(row, rowkey, rowid);
      }

      if (isLazy && row[treeOpts.hasChild] && _xeUtils.default.isUndefined(row[treeOpts.children])) {
        row[treeOpts.children] = null;
      }

      var rest = {
        row: row,
        rowid: rowid,
        index: treeConfig ? -1 : index
      };

      if (source) {
        fullDataRowIdData[rowid] = rest;
        fullDataRowMap.set(row, rest);
      }

      fullAllDataRowIdData[rowid] = rest;
      fullAllDataRowMap.set(row, rest);
    };

    if (source) {
      fullDataRowIdData = this.fullDataRowIdData = {};
      fullDataRowMap.clear();
    }

    fullAllDataRowIdData = this.fullAllDataRowIdData = {};
    fullAllDataRowMap.clear();

    if (treeConfig) {
      _xeUtils.default.eachTree(tableFullData, handleCache, treeOpts);
    } else {
      tableFullData.forEach(handleCache);
    }
  },
  appendTreeCache: function appendTreeCache(row, childs) {
    var _this6 = this;

    var keepSource = this.keepSource,
        tableSourceData = this.tableSourceData,
        treeOpts = this.treeOpts,
        fullDataRowIdData = this.fullDataRowIdData,
        fullDataRowMap = this.fullDataRowMap,
        fullAllDataRowMap = this.fullAllDataRowMap,
        fullAllDataRowIdData = this.fullAllDataRowIdData;
    var children = treeOpts.children,
        hasChild = treeOpts.hasChild;

    var rowkey = _tools.UtilTools.getRowkey(this);

    var rowid = _tools.UtilTools.getRowid(this, row);

    var matchObj;

    if (keepSource) {
      matchObj = _xeUtils.default.findTree(tableSourceData, function (item) {
        return rowid === _tools.UtilTools.getRowid(_this6, item);
      }, treeOpts);
    }

    _xeUtils.default.eachTree(childs, function (row, index) {
      var rowid = _tools.UtilTools.getRowid(_this6, row);

      if (!rowid) {
        rowid = getRowUniqueId();

        _xeUtils.default.set(row, rowkey, rowid);
      }

      if (row[hasChild] && _xeUtils.default.isUndefined(row[children])) {
        row[children] = null;
      }

      var rest = {
        row: row,
        rowid: rowid,
        index: index
      };
      fullDataRowIdData[rowid] = rest;
      fullDataRowMap.set(row, rest);
      fullAllDataRowIdData[rowid] = rest;
      fullAllDataRowMap.set(row, rest);
    }, treeOpts);

    if (matchObj) {
      matchObj.item[children] = _xeUtils.default.clone(childs, true);
    }
  },

  /**
   * 更新数据列的 Map
   * 牺牲数据组装的耗时，用来换取使用过程中的流畅
   */
  cacheColumnMap: function cacheColumnMap() {
    var isGroup = this.isGroup,
        tableFullColumn = this.tableFullColumn,
        collectColumn = this.collectColumn,
        fullColumnMap = this.fullColumnMap;
    var fullColumnIdData = this.fullColumnIdData = {};
    var fullColumnFieldData = this.fullColumnFieldData = {};
    var expandColumn;
    var hasFixed;

    var handleFunc = function handleFunc(column, index) {
      var colid = column.id,
          property = column.property,
          fixed = column.fixed,
          type = column.type;
      var rest = {
        column: column,
        colid: colid,
        index: index
      };

      if (property) {
        fullColumnFieldData[property] = rest;
      }

      if (!hasFixed && fixed) {
        hasFixed = fixed;
      }

      if (!expandColumn && type === 'expand') {
        expandColumn = column;
      }

      fullColumnIdData[colid] = rest;
      fullColumnMap.set(column, rest);
    };

    fullColumnMap.clear();

    if (isGroup) {
      _xeUtils.default.eachTree(collectColumn, handleFunc);
    } else {
      tableFullColumn.forEach(handleFunc);
    }

    if (hasFixed && expandColumn) {
      _tools.UtilTools.warn('vxe.error.errConflicts', ['column.fixed', 'column.type=expand']);
    }

    this.expandColumn = expandColumn;
  },

  /**
   * 根据 tr 元素获取对应的 row 信息
   * @param {Element} tr 元素
   */
  getRowNode: function getRowNode(tr) {
    var _this7 = this;

    if (tr) {
      var treeConfig = this.treeConfig,
          treeOpts = this.treeOpts,
          tableFullData = this.tableFullData,
          fullAllDataRowIdData = this.fullAllDataRowIdData;
      var rowid = tr.getAttribute('data-rowid');

      if (treeConfig) {
        var matchObj = _xeUtils.default.findTree(tableFullData, function (row) {
          return _tools.UtilTools.getRowid(_this7, row) === rowid;
        }, treeOpts);

        if (matchObj) {
          return matchObj;
        }
      } else {
        if (fullAllDataRowIdData[rowid]) {
          var rest = fullAllDataRowIdData[rowid];
          return {
            item: rest.row,
            index: rest.index,
            items: tableFullData
          };
        }
      }
    }

    return null;
  },

  /**
   * 根据 th/td 元素获取对应的 column 信息
   * @param {Element} cell 元素
   */
  getColumnNode: function getColumnNode(cell) {
    if (cell) {
      var fullColumnIdData = this.fullColumnIdData,
          tableFullColumn = this.tableFullColumn;
      var colid = cell.getAttribute('data-colid');
      var _fullColumnIdData$col = fullColumnIdData[colid],
          column = _fullColumnIdData$col.column,
          index = _fullColumnIdData$col.index;
      return {
        item: column,
        index: index,
        items: tableFullColumn
      };
    }

    return null;
  },

  /**
   * 根据 row 获取相对于 data 中的索引
   * @param {Row} row 行对象
   */
  getRowIndex: function getRowIndex(row) {
    return this.fullDataRowMap.has(row) ? this.fullDataRowMap.get(row).index : -1;
  },

  /**
   * 根据 row 获取相对于当前数据中的索引
   * @param {Row} row 行对象
   */
  _getRowIndex: function _getRowIndex(row) {
    return this.afterFullData.indexOf(row);
  },

  /**
   * 根据 row 获取渲染中的虚拟索引
   * @param {Row} row 行对象
   */
  $getRowIndex: function $getRowIndex(row) {
    return this.tableData.indexOf(row);
  },

  /**
   * 根据 column 获取相对于 columns 中的索引
   * @param {ColumnConfig} column 列配置
   */
  getColumnIndex: function getColumnIndex(column) {
    return this.fullColumnMap.has(column) ? this.fullColumnMap.get(column).index : -1;
  },

  /**
   * 根据 column 获取相对于当前表格列中的索引
   * @param {ColumnConfig} column 列配置
   */
  _getColumnIndex: function _getColumnIndex(column) {
    return this.visibleColumn.indexOf(column);
  },

  /**
   * 根据 column 获取渲染中的虚拟索引
   * @param {ColumnConfig} column 列配置
   */
  $getColumnIndex: function $getColumnIndex(column) {
    return this.tableColumn.indexOf(column);
  },

  /**
   * 判断是否为索引列
   * @param {ColumnConfig} column 列配置
   */
  isSeqColumn: function isSeqColumn(column) {
    return column && (column.type === 'seq' || column.type === 'index');
  },

  /**
   * 定义行数据中的列属性，如果不存在则定义
   * @param {Row} record 行数据
   */
  defineField: function defineField(record) {
    var treeConfig = this.treeConfig,
        treeOpts = this.treeOpts;

    var rowkey = _tools.UtilTools.getRowkey(this);

    this.visibleColumn.forEach(function (_ref) {
      var property = _ref.property,
          editRender = _ref.editRender;

      if (property && !_xeUtils.default.has(record, property)) {
        _xeUtils.default.set(record, property, editRender && !_xeUtils.default.isUndefined(editRender.defaultValue) ? editRender.defaultValue : null);
      }
    });

    if (treeConfig && treeOpts.lazy && _xeUtils.default.isUndefined(record[treeOpts.children])) {
      record[treeOpts.children] = null;
    } // 必须有行数据的唯一主键，可以自行设置；也可以默认生成一个随机数


    if (!_xeUtils.default.get(record, rowkey)) {
      _xeUtils.default.set(record, rowkey, getRowUniqueId());
    }

    return record;
  },

  /**
   * 创建 data 对象
   * 对于某些特殊场景可能会用到，会自动对数据的字段名进行检测，如果不存在就自动定义
   * @param {Array} records 新数据
   */
  createData: function createData(records) {
    var _this8 = this;

    var rowkey = _tools.UtilTools.getRowkey(this);

    var rows = records.map(function (record) {
      return _this8.defineField(Object.assign({}, record, _defineProperty({}, rowkey, null)));
    });
    return this.$nextTick().then(function () {
      return rows;
    });
  },

  /**
   * 创建 Row|Rows 对象
   * 对于某些特殊场景需要对数据进行手动插入时可能会用到
   * @param {Array/Object} records 新数据
   */
  createRow: function createRow(records) {
    var _this9 = this;

    var isArr = _xeUtils.default.isArray(records);

    if (!isArr) {
      records = [records];
    }

    return this.$nextTick().then(function () {
      return _this9.createData(records).then(function (rows) {
        return isArr ? rows : rows[0];
      });
    });
  },
  revert: function revert() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['revert', 'revertData']);

    return this.revertData.apply(this, arguments);
  },

  /**
   * 还原数据
   * 如果不传任何参数，则还原整个表格
   * 如果传 row 则还原一行
   * 如果传 rows 则还原多行
   * 如果还额外传了 field 则还原指定的单元格数据
   */
  revertData: function revertData(rows, field) {
    var _this10 = this;

    var tableSourceData = this.tableSourceData,
        tableFullData = this.tableFullData; // 在 v3 中必须要开启 keep-source

    if (!this.keepSource) {
      _tools.UtilTools.warn('vxe.error.reqProp', ['keep-source']);

      return this.$nextTick();
    }

    if (arguments.length) {
      if (rows && !_xeUtils.default.isArray(rows)) {
        rows = [rows];
      }

      rows.forEach(function (row) {
        if (!_this10.isInsertByRow(row)) {
          var rowIndex = tableFullData.indexOf(row);
          var oRow = tableSourceData[rowIndex];

          if (oRow && row) {
            if (field) {
              _xeUtils.default.set(row, field, _xeUtils.default.clone(_xeUtils.default.get(oRow, field), true));
            } else {
              _xeUtils.default.destructuring(row, _xeUtils.default.clone(oRow, true));
            }
          }
        }
      });
      return this.$nextTick();
    }

    return this.reloadData(tableSourceData);
  },

  /**
   * 清空单元格内容
   * 如果不创参数，则清空整个表格内容
   * 如果传 row 则清空一行内容
   * 如果传 rows 则清空多行内容
   * 如果还额外传了 field 则清空指定单元格内容
   * @param {Array/Row} rows 行数据
   * @param {String} field 字段名
   */
  clearData: function clearData(rows, field) {
    var tableFullData = this.tableFullData,
        visibleColumn = this.visibleColumn;

    if (!arguments.length) {
      rows = tableFullData;
    } else if (rows && !_xeUtils.default.isArray(rows)) {
      rows = [rows];
    }

    if (field) {
      rows.forEach(function (row) {
        return _xeUtils.default.set(row, field, null);
      });
    } else {
      rows.forEach(function (row) {
        visibleColumn.forEach(function (column) {
          if (column.property) {
            _tools.UtilTools.setCellValue(row, column, null);
          }
        });
      });
    }

    return this.$nextTick();
  },

  /**
   * 检查是否为临时行数据
   * @param {Row} row 行对象
   */
  isInsertByRow: function isInsertByRow(row) {
    return this.editStore.insertList.indexOf(row) > -1;
  },
  // 在 v3.0 中废弃 hasRowChange
  hasRowChange: function hasRowChange(row, field) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['hasRowChange', 'isUpdateByRow']);

    return this.isUpdateByRow(row, field);
  },

  /**
   * 检查行或列数据是否发生改变
   * @param {Row} row 行对象
   * @param {String} field 字段名
   */
  isUpdateByRow: function isUpdateByRow(row, field) {
    var _this11 = this;

    var visibleColumn = this.visibleColumn,
        keepSource = this.keepSource,
        treeConfig = this.treeConfig,
        treeOpts = this.treeOpts,
        tableSourceData = this.tableSourceData,
        fullDataRowIdData = this.fullDataRowIdData;

    if (keepSource) {
      var oRow, property;

      var rowid = _tools.UtilTools.getRowid(this, row); // 新增的数据不需要检测


      if (!fullDataRowIdData[rowid]) {
        return false;
      }

      if (treeConfig) {
        var children = treeOpts.children;

        var matchObj = _xeUtils.default.findTree(tableSourceData, function (item) {
          return rowid === _tools.UtilTools.getRowid(_this11, item);
        }, treeOpts);

        row = Object.assign({}, row, _defineProperty({}, children, null));

        if (matchObj) {
          oRow = Object.assign({}, matchObj.item, _defineProperty({}, children, null));
        }
      } else {
        var oRowIndex = fullDataRowIdData[rowid].index;
        oRow = tableSourceData[oRowIndex];
      }

      if (oRow) {
        if (arguments.length > 1) {
          return !_xeUtils.default.isEqual(_xeUtils.default.get(oRow, field), _xeUtils.default.get(row, field));
        }

        for (var index = 0, len = visibleColumn.length; index < len; index++) {
          property = visibleColumn[index].property;

          if (property && !_xeUtils.default.isEqual(_xeUtils.default.get(oRow, property), _xeUtils.default.get(row, property))) {
            return true;
          }
        }
      }
    }

    return false;
  },

  /**
   * 获取表格的可视列，也可以指定索引获取列
   * @param {Number} columnIndex 索引
   */
  getColumns: function getColumns(columnIndex) {
    var columns = this.visibleColumn;
    return arguments.length ? columns[columnIndex] : columns.slice(0);
  },

  /**
   * 根据列的唯一主键获取列
   * @param {String} colid 列主键
   */
  getColumnById: function getColumnById(colid) {
    var fullColumnIdData = this.fullColumnIdData;
    return fullColumnIdData[colid] ? fullColumnIdData[colid].column : null;
  },

  /**
   * 根据列的字段名获取列
   * @param {String} field 字段名
   */
  getColumnByField: function getColumnByField(field) {
    var fullColumnFieldData = this.fullColumnFieldData;
    return fullColumnFieldData[field] ? fullColumnFieldData[field].column : null;
  },

  /**
   * 获取当前表格的列
   * 收集到的全量列、全量表头列、处理条件之后的全量表头列、当前渲染中的表头列
   */
  getTableColumn: function getTableColumn() {
    return {
      collectColumn: this.collectColumn.slice(0),
      fullColumn: this.tableFullColumn.slice(0),
      visibleColumn: this.visibleColumn.slice(0),
      tableColumn: this.tableColumn.slice(0)
    };
  },
  // 在 v3.0 中废弃 getRecords
  getRecords: function getRecords() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getRecords', 'getData']);

    return this.getData.apply(this, arguments);
  },

  /**
   * 获取数据，和 data 的行为一致，也可以指定索引获取数据
   */
  getData: function getData(rowIndex) {
    var tableSynchData = this.data || this.tableSynchData;
    return arguments.length ? tableSynchData[rowIndex] : tableSynchData.slice(0);
  },
  // 在 v3.0 中废弃 getAllRecords
  getAllRecords: function getAllRecords() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getAllRecords', 'getRecordset']);

    return this.getRecordset();
  },
  // 在 v3.0 中废弃 getSelectRecords
  getSelectRecords: function getSelectRecords() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getSelectRecords', 'getCheckboxRecords']);

    return this.getCheckboxRecords();
  },

  /**
   * 用于多选行，获取已选中的数据
   */
  getCheckboxRecords: function getCheckboxRecords() {
    var tableFullData = this.tableFullData,
        treeConfig = this.treeConfig,
        treeOpts = this.treeOpts,
        checkboxOpts = this.checkboxOpts;
    var property = checkboxOpts.checkField;
    var rowList = [];

    if (property) {
      if (treeConfig) {
        rowList = _xeUtils.default.filterTree(tableFullData, function (row) {
          return _xeUtils.default.get(row, property);
        }, treeOpts);
      } else {
        rowList = tableFullData.filter(function (row) {
          return _xeUtils.default.get(row, property);
        });
      }
    } else {
      var selection = this.selection;

      if (treeConfig) {
        rowList = _xeUtils.default.filterTree(tableFullData, function (row) {
          return selection.indexOf(row) > -1;
        }, treeOpts);
      } else {
        rowList = tableFullData.filter(function (row) {
          return selection.indexOf(row) > -1;
        });
      }
    }

    return rowList;
  },

  /**
   * 获取处理后全量的表格数据
   * 如果存在筛选条件，继续处理
   */
  updateAfterFullData: function updateAfterFullData() {
    var visibleColumn = this.visibleColumn,
        tableFullData = this.tableFullData,
        remoteSort = this.remoteSort,
        remoteFilter = this.remoteFilter,
        filterOpts = this.filterOpts,
        sortOpts = this.sortOpts;
    var tableData = tableFullData.slice(0);

    var column = _xeUtils.default.find(visibleColumn, function (column) {
      return column.order;
    });

    var filterColumns = [];
    visibleColumn.forEach(function (column) {
      if (column.filters && column.filters.length) {
        var valueList = [];
        var itemList = [];
        column.filters.forEach(function (item) {
          if (item.checked) {
            itemList.push(item);
            valueList.push(item.value);
          }
        });
        filterColumns.push({
          column: column,
          valueList: valueList,
          itemList: itemList
        });
      }
    });

    if (filterColumns.length) {
      tableData = tableData.filter(function (row) {
        return filterColumns.every(function (_ref2) {
          var column = _ref2.column,
              valueList = _ref2.valueList,
              itemList = _ref2.itemList;

          if (valueList.length && !(filterOpts.remote || remoteFilter)) {
            var filterRender = column.filterRender,
                property = column.property;
            var filterMethod = column.filterMethod;
            var allFilterMethod = filterOpts.filterMethod;
            var compConf = filterRender ? _vXETable.default.renderer.get(filterRender.name) : null;

            if (!filterMethod && compConf && compConf.renderFilter) {
              filterMethod = compConf.filterMethod;
            }

            if (allFilterMethod && !filterMethod) {
              return allFilterMethod({
                options: itemList,
                values: valueList,
                row: row,
                column: column
              });
            }

            return filterMethod ? itemList.some(function (item) {
              return filterMethod({
                value: item.value,
                option: item,
                row: row,
                column: column
              });
            }) : valueList.indexOf(_xeUtils.default.get(row, property)) > -1;
          }

          return true;
        });
      });
    }

    if (column && column.order) {
      var allSortMethod = sortOpts.sortMethod || this.sortMethod;
      var isRemote = _xeUtils.default.isBoolean(column.remoteSort) ? column.remoteSort : sortOpts.remote || remoteSort;

      if (!isRemote) {
        if (allSortMethod) {
          tableData = allSortMethod({
            data: tableData,
            column: column,
            property: column.property,
            order: column.order,
            $table: this
          }) || tableData;
        } else {
          var params = {
            $table: this
          };
          var rest = column.sortMethod ? tableData.sort(column.sortMethod) : _xeUtils.default.sortBy(tableData, column.sortBy || (column.formatter ? function (row) {
            return _tools.UtilTools.getCellLabel(row, column, params);
          } : column.property));
          tableData = column.order === 'desc' ? rest.reverse() : rest;
        }
      }
    }

    this.afterFullData = tableData;
    return tableData;
  },

  /**
   * 根据行的唯一主键获取行
   * @param {String/Number} rowid 行主键
   */
  getRowById: function getRowById(rowid) {
    var fullDataRowIdData = this.fullDataRowIdData;
    return fullDataRowIdData[rowid] ? fullDataRowIdData[rowid].row : null;
  },

  /**
   * 根据行获取行的唯一主键
   * @param {Row} row 行对象
   */
  getRowid: function getRowid(row) {
    var fullAllDataRowMap = this.fullAllDataRowMap;
    return fullAllDataRowMap.has(row) ? fullAllDataRowMap.get(row).rowid : null;
  },

  /**
   * 获取处理后的表格数据
   * 如果存在筛选条件，继续处理
   * 如果存在排序，继续处理
   */
  getTableData: function getTableData() {
    var tableFullData = this.tableFullData,
        afterFullData = this.afterFullData,
        tableData = this.tableData,
        footerData = this.footerData;
    return {
      fullData: tableFullData.slice(0),
      visibleData: afterFullData.slice(0),
      tableData: tableData.slice(0),
      footerData: footerData.slice(0)
    };
  },

  /**
   * 默认行为只允许执行一次
   */
  handleDefaults: function handleDefaults() {
    var _this12 = this;

    // 在 v3.0 中废弃 selectConfig
    var checkboxConfig = this.checkboxConfig || this.selectConfig;

    if (checkboxConfig) {
      this.handleDefaultSelectionChecked();
    }

    if (this.radioConfig) {
      this.handleDefaultRadioChecked();
    }

    if (this.sortConfig) {
      this.handleDefaultSort();
    }

    if (this.expandConfig) {
      this.handleDefaultRowExpand();
    }

    if (this.treeConfig) {
      this.handleDefaultTreeExpand();
    }

    this.$nextTick(function () {
      return setTimeout(_this12.recalculate);
    });
  },

  /**
   * 动态列处理
   */
  mergeCustomColumn: function mergeCustomColumn(customColumns) {
    var tableFullColumn = this.tableFullColumn;
    this.isUpdateCustoms = true;

    if (customColumns.length) {
      tableFullColumn.forEach(function (column) {
        // 在 v3.0 中废弃 prop
        var item = _xeUtils.default.find(customColumns, function (item) {
          return column.property && (item.field || item.prop) === column.property;
        });

        if (item) {
          if (_xeUtils.default.isNumber(item.resizeWidth)) {
            column.resizeWidth = item.resizeWidth;
          }

          if (_xeUtils.default.isBoolean(item.visible)) {
            column.visible = item.visible;
          }
        }
      });
    }

    this.emitEvent('update:customs', tableFullColumn);
  },

  /**
   * 手动重置列的所有操作，还原到初始状态
   * 如果已关联工具栏，则会同步更新
   */
  resetAll: function resetAll() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['resetAll', 'resetColumn']);

    this.resetColumn(true);
  },

  /**
   * 隐藏指定列
   * @param {ColumnConfig} column 列配置
   */
  hideColumn: function hideColumn(column) {
    column.visible = false;
    return this.handleCustom();
  },

  /**
   * 显示指定列
   * @param {ColumnConfig} column 列配置
   */
  showColumn: function showColumn(column) {
    column.visible = true;
    return this.handleCustom();
  },

  /**
   * 手动重置列的显示隐藏、列宽拖动的状态；
   * 如果为 true 则重置所有状态
   * 如果已关联工具栏，则会同步更新
   */
  resetColumn: function resetColumn(options) {
    var customOpts = this.customOpts;
    var checkMethod = customOpts.checkMethod;
    var opts = Object.assign({
      visible: true,
      resizable: options === true
    }, options);
    this.tableFullColumn.forEach(function (column) {
      if (opts.resizable) {
        column.resizeWidth = 0;
      }

      if (!checkMethod || checkMethod({
        column: column
      })) {
        column.visible = column.defaultVisible;
      }
    });

    if (opts.resizable) {
      this.saveCustomResizable(true);
    }

    return this.handleCustom();
  },
  handleCustom: function handleCustom() {
    this.saveCustomVisible();
    this.analyColumnWidth();
    return this.refreshColumn();
  },
  resetResizable: function resetResizable() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['resetResizable', 'resetColumn']);

    return this.resetColumn();
  },

  /**
   * 已废弃的方法
   */
  reloadCustoms: function reloadCustoms(customColumns) {
    var _this13 = this;

    _tools.UtilTools.warn('vxe.error.delFunc', ['reloadCustoms', 'column.visible & refreshColumn']);

    return this.$nextTick().then(function () {
      _this13.mergeCustomColumn(customColumns);

      return _this13.refreshColumn().then(function () {
        return _this13.tableFullColumn;
      });
    });
  },

  /**
   * 还原自定义列操作状态
   */
  restoreCustomStorage: function restoreCustomStorage() {
    var $toolbar = this.$toolbar,
        collectColumn = this.collectColumn,
        customConfig = this.customConfig,
        customOpts = this.customOpts;
    var storage = customOpts.storage;
    var isAllStorage = customOpts.storage === true;
    var isResizable = isAllStorage || storage && storage.resizable || $toolbar && $toolbar.resizableOpts.storage;
    var isVisible = isAllStorage || storage && storage.visible || $toolbar && $toolbar.customOpts.storage; // 在 v3.0 中废弃 $toolbar 方式

    if ((customConfig || $toolbar) && (isResizable || isVisible)) {
      // 在 v3.0 中废弃 toolbar.id
      var id = customConfig ? this.id : $toolbar ? $toolbar.id : null;
      var customMap = {};

      if (!id) {
        _tools.UtilTools.error('vxe.error.reqProp', ['id']);

        return;
      }

      if (isResizable) {
        var columnWidthStorage = getCustomStorageMap(resizableStorageKey)[id];

        if (columnWidthStorage) {
          _xeUtils.default.each(columnWidthStorage, function (resizeWidth, field) {
            customMap[field] = {
              field: field,
              resizeWidth: resizeWidth
            };
          });
        }
      }

      if (isVisible) {
        var columnVisibleStorage = getCustomStorageMap(visibleStorageKey)[id];

        if (columnVisibleStorage) {
          var colVisibles = columnVisibleStorage.split('|');
          var colHides = colVisibles[0] ? colVisibles[0].split(',') : [];
          var colShows = colVisibles[1] ? colVisibles[1].split(',') : [];
          colHides.forEach(function (field) {
            if (customMap[field]) {
              customMap[field].visible = false;
            } else {
              customMap[field] = {
                field: field,
                visible: false
              };
            }
          });
          colShows.forEach(function (field) {
            if (customMap[field]) {
              customMap[field].visible = true;
            } else {
              customMap[field] = {
                field: field,
                visible: true
              };
            }
          });
        }
      }

      var keyMap = {};

      _xeUtils.default.eachTree(collectColumn, function (column) {
        var colKey = column.getKey();

        if (colKey) {
          keyMap[colKey] = column;
        }
      });

      _xeUtils.default.each(customMap, function (_ref3, field) {
        var visible = _ref3.visible,
            resizeWidth = _ref3.resizeWidth;
        var column = keyMap[field];

        if (column) {
          if (_xeUtils.default.isNumber(resizeWidth)) {
            column.resizeWidth = resizeWidth;
          }

          if (_xeUtils.default.isBoolean(visible)) {
            column.visible = visible;
          }
        }
      });
    }
  },
  saveCustomVisible: function saveCustomVisible() {
    var $toolbar = this.$toolbar,
        collectColumn = this.collectColumn,
        customConfig = this.customConfig,
        customOpts = this.customOpts;
    var checkMethod = customOpts.checkMethod,
        storage = customOpts.storage;
    var isAllStorage = customOpts.storage === true;
    var isVisible = isAllStorage || storage && storage.visible || $toolbar && $toolbar.customOpts.storage; // 在 v3.0 中废弃 $toolbar 方式

    if ((customConfig || $toolbar) && isVisible) {
      // 在 v3.0 中废弃 toolbar.id
      var id = customConfig ? this.id : $toolbar ? $toolbar.id : null;
      var columnVisibleStorageMap = getCustomStorageMap(visibleStorageKey);
      var colHides = [];
      var colShows = [];

      if (!id) {
        _tools.UtilTools.error('vxe.error.reqProp', ['id']);

        return;
      }

      _xeUtils.default.eachTree(collectColumn, function (column) {
        if (!checkMethod || checkMethod({
          column: column
        })) {
          if (!column.visible && column.defaultVisible) {
            var colKey = column.getKey();

            if (colKey) {
              colHides.push(colKey);
            }
          } else if (column.visible && !column.defaultVisible) {
            var _colKey = column.getKey();

            if (_colKey) {
              colShows.push(_colKey);
            }
          }
        }
      });

      columnVisibleStorageMap[id] = [colHides.join(',')].concat(colShows.length ? [colShows.join(',')] : []).join('|') || undefined;
      localStorage.setItem(visibleStorageKey, _xeUtils.default.toJSONString(columnVisibleStorageMap));
    }
  },
  saveCustomResizable: function saveCustomResizable(isReset) {
    var $toolbar = this.$toolbar,
        collectColumn = this.collectColumn,
        customConfig = this.customConfig,
        customOpts = this.customOpts;
    var storage = customOpts.storage;
    var isAllStorage = customOpts.storage === true;
    var isResizable = isAllStorage || storage && storage.resizable || $toolbar && $toolbar.resizableOpts.storage; // 在 v3.0 中废弃 $toolbar 方式

    if ((customConfig || $toolbar) && isResizable) {
      // 在 v3.0 中废弃 toolbar.id
      var id = customConfig ? this.id : $toolbar ? $toolbar.id : null;
      var columnWidthStorageMap = getCustomStorageMap(resizableStorageKey);
      var columnWidthStorage;

      if (!id) {
        _tools.UtilTools.error('vxe.error.reqProp', ['id']);

        return;
      }

      if (!isReset) {
        columnWidthStorage = _xeUtils.default.isPlainObject(columnWidthStorageMap[id]) ? columnWidthStorageMap[id] : {};

        _xeUtils.default.eachTree(collectColumn, function (column) {
          if (column.resizeWidth) {
            var colKey = column.getKey();

            if (colKey) {
              columnWidthStorage[colKey] = column.renderWidth;
            }
          }
        });
      }

      columnWidthStorageMap[id] = _xeUtils.default.isEmpty(columnWidthStorage) ? undefined : columnWidthStorage;
      localStorage.setItem(resizableStorageKey, _xeUtils.default.toJSONString(columnWidthStorageMap));
    }
  },

  /**
   * 刷新列信息
   * 将固定的列左边、右边分别靠边
   */
  refreshColumn: function refreshColumn() {
    var _this14 = this;

    var leftList = [];
    var centerList = [];
    var rightList = [];
    var collectColumn = this.collectColumn,
        tableFullColumn = this.tableFullColumn,
        isGroup = this.isGroup,
        columnStore = this.columnStore,
        sXOpts = this.sXOpts,
        scrollXStore = this.scrollXStore; // 如果是分组表头，如果子列全部被隐藏，则根列也隐藏

    if (isGroup) {
      var leftGroupList = [];
      var centerGroupList = [];
      var rightGroupList = [];

      _xeUtils.default.eachTree(collectColumn, function (column, index, items, path, parent) {
        var isColGroup = _tools.UtilTools.hasChildrenList(column); // 如果是分组，必须按组设置固定列，不允许给子列设置固定


        if (parent && parent.fixed) {
          column.fixed = parent.fixed;
        }

        if (parent && column.fixed !== parent.fixed) {
          _tools.UtilTools.error('vxe.error.groupFixed');
        }

        if (isColGroup) {
          column.visible = !!_xeUtils.default.findTree(column.children, function (subColumn) {
            return _tools.UtilTools.hasChildrenList(subColumn) ? null : subColumn.visible;
          });
        } else if (column.visible) {
          if (column.fixed === 'left') {
            leftList.push(column);
          } else if (column.fixed === 'right') {
            rightList.push(column);
          } else {
            centerList.push(column);
          }
        }
      });

      collectColumn.forEach(function (column) {
        if (column.visible) {
          if (column.fixed === 'left') {
            leftGroupList.push(column);
          } else if (column.fixed === 'right') {
            rightGroupList.push(column);
          } else {
            centerGroupList.push(column);
          }
        }
      });
      this.tableGroupColumn = leftGroupList.concat(centerGroupList).concat(rightGroupList);
    } else {
      // 重新分配列
      tableFullColumn.forEach(function (column) {
        if (column.visible) {
          if (column.fixed === 'left') {
            leftList.push(column);
          } else if (column.fixed === 'right') {
            rightList.push(column);
          } else {
            centerList.push(column);
          }
        }
      });
    }

    var visibleColumn = leftList.concat(centerList).concat(rightList);
    var tableColumn = visibleColumn;
    var scrollXLoad = sXOpts.gt > -1 && sXOpts.gt < tableFullColumn.length;
    Object.assign(columnStore, {
      leftList: leftList,
      centerList: centerList,
      rightList: rightList
    });

    if (scrollXLoad && isGroup) {
      scrollXLoad = false;

      _tools.UtilTools.warn('vxe.error.scrollXNotGroup');
    }

    if (scrollXLoad) {
      if (this.showHeader && !this.showHeaderOverflow) {
        _tools.UtilTools.warn('vxe.error.reqProp', ['show-header-overflow']);
      }

      if (this.showFooter && !this.showFooterOverflow) {
        _tools.UtilTools.warn('vxe.error.reqProp', ['show-footer-overflow']);
      }

      if (this.spanMethod) {
        _tools.UtilTools.warn('vxe.error.scrollErrProp', ['span-method']);
      }

      if (this.footerSpanMethod) {
        _tools.UtilTools.warn('vxe.error.scrollErrProp', ['footer-span-method']);
      }

      Object.assign(scrollXStore, {
        startIndex: 0,
        visibleIndex: 0
      });
      tableColumn = visibleColumn.slice(scrollXStore.startIndex, scrollXStore.startIndex + scrollXStore.renderSize);
    }

    this.scrollXLoad = scrollXLoad;
    this.tableColumn = tableColumn;
    this.visibleColumn = visibleColumn;
    return this.$nextTick().then(function () {
      _this14.updateFooter();

      _this14.recalculate(true);
    });
  },

  /**
   * 指定列宽的列进行拆分
   */
  analyColumnWidth: function analyColumnWidth() {
    var columnWidth = this.columnWidth,
        columnMinWidth = this.columnMinWidth;
    var resizeList = [];
    var pxList = [];
    var pxMinList = [];
    var scaleList = [];
    var scaleMinList = [];
    var autoList = [];
    this.tableFullColumn.forEach(function (column) {
      if (columnWidth && !column.width) {
        column.width = columnWidth;
      }

      if (columnMinWidth && !column.minWidth) {
        column.minWidth = columnMinWidth;
      }

      if (column.visible) {
        if (column.resizeWidth) {
          resizeList.push(column);
        } else if (_tools.DomTools.isPx(column.width)) {
          pxList.push(column);
        } else if (_tools.DomTools.isScale(column.width)) {
          scaleList.push(column);
        } else if (_tools.DomTools.isPx(column.minWidth)) {
          pxMinList.push(column);
        } else if (_tools.DomTools.isScale(column.minWidth)) {
          scaleMinList.push(column);
        } else {
          autoList.push(column);
        }
      }
    });
    Object.assign(this.columnStore, {
      resizeList: resizeList,
      pxList: pxList,
      pxMinList: pxMinList,
      scaleList: scaleList,
      scaleMinList: scaleMinList,
      autoList: autoList
    });
  },

  /**
   * 刷新滚动操作，手动同步滚动相关位置（对于某些特殊的操作，比如滚动条错位、固定列不同步）
   */
  refreshScroll: function refreshScroll() {
    var _this15 = this;

    var lastScrollLeft = this.lastScrollLeft,
        lastScrollTop = this.lastScrollTop;
    this.clearScroll();
    return this.$nextTick().then(function () {
      if (lastScrollLeft || lastScrollTop) {
        // 重置最后滚动状态
        _this15.lastScrollLeft = 0;
        _this15.lastScrollTop = 0; // 还原滚动状态

        return _this15.scrollTo(lastScrollLeft, lastScrollTop);
      }
    });
  },

  /**
   * 计算单元格列宽，动态分配可用剩余空间
   * 支持 width=? width=?px width=?% min-width=? min-width=?px min-width=?%
   */
  recalculate: function recalculate(refull) {
    var _this16 = this;

    var $refs = this.$refs;
    var tableBody = $refs.tableBody,
        tableHeader = $refs.tableHeader,
        tableFooter = $refs.tableFooter;
    var bodyElem = tableBody ? tableBody.$el : null;
    var headerElem = tableHeader ? tableHeader.$el : null;
    var footerElem = tableFooter ? tableFooter.$el : null;

    if (bodyElem) {
      this.autoCellWidth(headerElem, bodyElem, footerElem);

      if (refull === true) {
        // 初始化时需要在列计算之后再执行优化运算，达到最优显示效果
        return this.computeScrollLoad().then(function () {
          _this16.autoCellWidth(headerElem, bodyElem, footerElem);

          _this16.computeScrollLoad();
        });
      }
    }

    return this.computeScrollLoad();
  },

  /**
   * 列宽算法
   * 支持 px、%、固定 混合分配
   * 支持动态列表调整分配
   * 支持自动分配偏移量
   * @param {Element} headerElem
   * @param {Element} bodyElem
   * @param {Element} footerElem
   * @param {Number} bodyWidth
   */
  autoCellWidth: function autoCellWidth(headerElem, bodyElem, footerElem) {
    var tableWidth = 0;
    var minCellWidth = 40; // 列宽最少限制 40px

    var bodyWidth = bodyElem.clientWidth;
    var remainWidth = bodyWidth;
    var meanWidth = remainWidth / 100;
    var fit = this.fit,
        columnStore = this.columnStore;
    var resizeList = columnStore.resizeList,
        pxMinList = columnStore.pxMinList,
        pxList = columnStore.pxList,
        scaleList = columnStore.scaleList,
        scaleMinList = columnStore.scaleMinList,
        autoList = columnStore.autoList; // 最小宽

    pxMinList.forEach(function (column) {
      var minWidth = parseInt(column.minWidth);
      tableWidth += minWidth;
      column.renderWidth = minWidth;
    }); // 最小百分比

    scaleMinList.forEach(function (column) {
      var scaleWidth = Math.floor(parseInt(column.minWidth) * meanWidth);
      tableWidth += scaleWidth;
      column.renderWidth = scaleWidth;
    }); // 固定百分比

    scaleList.forEach(function (column) {
      var scaleWidth = Math.floor(parseInt(column.width) * meanWidth);
      tableWidth += scaleWidth;
      column.renderWidth = scaleWidth;
    }); // 固定宽

    pxList.forEach(function (column) {
      var width = parseInt(column.width);
      tableWidth += width;
      column.renderWidth = width;
    }); // 调整了列宽

    resizeList.forEach(function (column) {
      var width = parseInt(column.resizeWidth);
      tableWidth += width;
      column.renderWidth = width;
    });
    remainWidth -= tableWidth;
    meanWidth = remainWidth > 0 ? Math.floor(remainWidth / (scaleMinList.length + pxMinList.length + autoList.length)) : 0;

    if (fit) {
      if (remainWidth > 0) {
        scaleMinList.concat(pxMinList).forEach(function (column) {
          tableWidth += meanWidth;
          column.renderWidth += meanWidth;
        });
      }
    } else {
      meanWidth = minCellWidth;
    } // 自适应


    autoList.forEach(function (column) {
      var width = Math.max(meanWidth, minCellWidth);
      column.renderWidth = width;
      tableWidth += width;
    });

    if (fit) {
      /**
       * 偏移量算法
       * 如果所有列足够放的情况下，从最后动态列开始分配
       */
      var dynamicList = scaleList.concat(scaleMinList).concat(pxMinList).concat(autoList);
      var dynamicSize = dynamicList.length - 1;

      if (dynamicSize > 0) {
        var odiffer = bodyWidth - tableWidth;

        if (odiffer > 0) {
          while (odiffer > 0 && dynamicSize >= 0) {
            odiffer--;
            dynamicList[dynamicSize--].renderWidth++;
          }

          tableWidth = bodyWidth;
        }
      }
    }

    var tableHeight = bodyElem.offsetHeight;
    var overflowY = bodyElem.scrollHeight > bodyElem.clientHeight;
    this.scrollbarWidth = overflowY ? bodyElem.offsetWidth - bodyWidth : 0;
    this.overflowY = overflowY;
    this.tableWidth = tableWidth;
    this.tableHeight = tableHeight;

    if (headerElem) {
      this.headerHeight = headerElem.clientHeight; // 检测是否同步滚动

      if (headerElem.scrollLeft !== bodyElem.scrollLeft) {
        headerElem.scrollLeft = bodyElem.scrollLeft;
      }
    } else {
      this.headerHeight = 0;
    }

    if (footerElem) {
      var footerHeight = footerElem.offsetHeight;
      this.scrollbarHeight = Math.max(footerHeight - footerElem.clientHeight, 0);
      this.overflowX = tableWidth > footerElem.clientWidth;
      this.footerHeight = footerHeight;
    } else {
      this.footerHeight = 0;
      this.scrollbarHeight = Math.max(tableHeight - bodyElem.clientHeight, 0);
      this.overflowX = tableWidth > bodyWidth;
    }

    this.parentHeight = Math.max(this.headerHeight + this.footerHeight + 20, this.getParentHeight());

    if (this.overflowX) {
      this.checkScrolling();
    }
  },

  /**
   * 放弃 vue 的双向 dom 绑定，使用原生的方式更新 Dom，性能翻倍提升
   */
  updateStyle: function updateStyle() {
    var _this17 = this;

    var $refs = this.$refs,
        isGroup = this.isGroup,
        fullColumnIdData = this.fullColumnIdData,
        height = this.height,
        parentHeight = this.parentHeight,
        border = this.border,
        headerHeight = this.headerHeight,
        showFooter = this.showFooter,
        allColumnOverflow = this.showOverflow,
        allColumnHeaderOverflow = this.showHeaderOverflow,
        allColumnFooterOverflow = this.showFooterOverflow,
        footerHeight = this.footerHeight,
        tableHeight = this.tableHeight,
        tableWidth = this.tableWidth,
        scrollbarHeight = this.scrollbarHeight,
        scrollbarWidth = this.scrollbarWidth,
        scrollXLoad = this.scrollXLoad,
        scrollYLoad = this.scrollYLoad,
        cellOffsetWidth = this.cellOffsetWidth,
        columnStore = this.columnStore,
        elemStore = this.elemStore,
        editStore = this.editStore,
        currentRow = this.currentRow,
        mouseConfig = this.mouseConfig;
    var maxHeight = this.maxHeight,
        tableColumn = this.tableColumn;
    var containerList = ['main', 'left', 'right'];
    var customHeight = 0;

    if (height) {
      customHeight = height === 'auto' ? parentHeight : (_tools.DomTools.isScale(height) ? Math.floor(parseInt(height) / 100 * parentHeight) : _xeUtils.default.toNumber(height)) - this.getExcludeHeight();

      if (showFooter) {
        customHeight += scrollbarHeight;
      }
    }

    var emptyPlaceholderElem = $refs.emptyPlaceholder;
    var bodyWrapperElem = elemStore['main-body-wrapper'];

    if (emptyPlaceholderElem) {
      emptyPlaceholderElem.style.top = "".concat(headerHeight, "px");
      emptyPlaceholderElem.style.height = bodyWrapperElem ? "".concat(bodyWrapperElem.offsetHeight - scrollbarHeight, "px") : '';
    }

    containerList.forEach(function (name, index) {
      var fixedType = index > 0 ? name : '';
      var layoutList = ['header', 'body', 'footer'];
      var fixedColumn = columnStore["".concat(fixedType, "List")];
      var fixedWrapperElem = $refs["".concat(fixedType, "Container")];
      layoutList.forEach(function (layout) {
        var wrapperElem = elemStore["".concat(name, "-").concat(layout, "-wrapper")];
        var tableElem = elemStore["".concat(name, "-").concat(layout, "-table")];

        if (layout === 'header') {
          // 表头体样式处理
          // 横向滚动渲染
          var tWidth = tableWidth;

          if (scrollXLoad) {
            if (fixedType) {
              tableColumn = fixedColumn;
            }

            tWidth = tableColumn.reduce(function (previous, column) {
              return previous + column.renderWidth;
            }, 0);
          }

          if (tableElem) {
            tableElem.style.width = tWidth ? "".concat(tWidth + scrollbarWidth, "px") : ''; // 修复 IE 中高度无法自适应问题

            if (browse.msie) {
              _xeUtils.default.arrayEach(tableElem.querySelectorAll('.vxe-resizable'), function (resizeElem) {
                resizeElem.style.height = "".concat(resizeElem.parentNode.offsetHeight, "px");
              });
            }
          }

          var repairElem = elemStore["".concat(name, "-").concat(layout, "-repair")];

          if (repairElem) {
            repairElem.style.width = "".concat(tableWidth, "px");
          }

          var listElem = elemStore["".concat(name, "-").concat(layout, "-list")];

          if (isGroup && listElem) {
            // XEUtils.arrayEach(listElem.querySelectorAll(`.col--gutter`), thElem => {
            //   thElem.style.width = `${scrollbarWidth}px`
            // })
            _xeUtils.default.arrayEach(listElem.querySelectorAll('.col--group'), function (thElem) {
              var column = _this17.getColumnNode(thElem).item;

              var showHeaderOverflow = column.showHeaderOverflow;
              var cellOverflow = _xeUtils.default.isBoolean(showHeaderOverflow) ? showHeaderOverflow : allColumnHeaderOverflow;
              var showEllipsis = cellOverflow === 'ellipsis';
              var showTitle = cellOverflow === 'title';
              var showTooltip = cellOverflow === true || cellOverflow === 'tooltip';
              var hasEllipsis = showTitle || showTooltip || showEllipsis;
              var childWidth = 0;
              var countChild = 0;

              if (hasEllipsis) {
                _xeUtils.default.eachTree(column.children, function (item) {
                  if (!item.children || !column.children.length) {
                    countChild++;
                  }

                  childWidth += item.renderWidth;
                });
              }

              thElem.style.width = hasEllipsis ? "".concat(childWidth - countChild - (border ? 2 : 0), "px") : '';
            });
          }
        } else if (layout === 'body') {
          var emptyBlockElem = elemStore["".concat(name, "-").concat(layout, "-emptyBlock")];

          if (wrapperElem) {
            if (maxHeight) {
              maxHeight = maxHeight === 'auto' ? parentHeight : _tools.DomTools.isScale(maxHeight) ? Math.floor(parseInt(maxHeight) / 100 * parentHeight) : _xeUtils.default.toNumber(maxHeight);
              wrapperElem.style.maxHeight = "".concat(fixedType ? maxHeight - headerHeight - (showFooter ? 0 : scrollbarHeight) : maxHeight - headerHeight, "px");
            } else {
              if (customHeight > 0) {
                wrapperElem.style.height = "".concat(fixedType ? (customHeight > 0 ? customHeight - headerHeight - footerHeight : tableHeight) - (showFooter ? 0 : scrollbarHeight) : customHeight - headerHeight - footerHeight, "px");
              } else {
                wrapperElem.style.height = '';
              }
            }
          } // 如果是固定列


          if (fixedWrapperElem) {
            var isRightFixed = fixedType === 'right';
            var _fixedColumn = columnStore["".concat(fixedType, "List")];
            wrapperElem.style.top = "".concat(headerHeight, "px");
            fixedWrapperElem.style.height = "".concat((customHeight > 0 ? customHeight - headerHeight - footerHeight : tableHeight) + headerHeight + footerHeight - scrollbarHeight * (showFooter ? 2 : 1), "px");
            fixedWrapperElem.style.width = "".concat(_fixedColumn.reduce(function (previous, column) {
              return previous + column.renderWidth;
            }, isRightFixed ? scrollbarWidth : 0), "px");
          }

          var _tWidth = tableWidth; // 如果是固定列与设置了超出隐藏

          if (fixedType && allColumnOverflow) {
            tableColumn = fixedColumn;
            _tWidth = tableColumn.reduce(function (previous, column) {
              return previous + column.renderWidth;
            }, 0);
          } else if (scrollXLoad) {
            if (fixedType) {
              tableColumn = fixedColumn;
            }

            _tWidth = tableColumn.reduce(function (previous, column) {
              return previous + column.renderWidth;
            }, 0);
          }

          if (tableElem) {
            tableElem.style.width = _tWidth ? "".concat(_tWidth, "px") : ''; // 兼容性处理

            tableElem.style.paddingRight = scrollbarWidth && fixedType && (browse['-moz'] || browse.safari) ? "".concat(scrollbarWidth, "px") : '';
          }

          if (emptyBlockElem) {
            emptyBlockElem.style.width = _tWidth ? "".concat(_tWidth, "px") : '';
          }
        } else if (layout === 'footer') {
          // 如果是使用优化模式
          var _tWidth2 = tableWidth;

          if (fixedType && allColumnOverflow) {
            tableColumn = fixedColumn;
            _tWidth2 = tableColumn.reduce(function (previous, column) {
              return previous + column.renderWidth;
            }, 0);
          } else if (scrollXLoad) {
            if (fixedType) {
              tableColumn = fixedColumn;
            }

            _tWidth2 = tableColumn.reduce(function (previous, column) {
              return previous + column.renderWidth;
            }, 0);
          }

          if (wrapperElem) {
            // 如果是固定列
            if (fixedWrapperElem) {
              wrapperElem.style.top = "".concat(customHeight > 0 ? customHeight - footerHeight : tableHeight + headerHeight, "px");
            }

            wrapperElem.style.marginTop = "".concat(-scrollbarHeight, "px");
          }

          if (tableElem) {
            tableElem.style.width = _tWidth2 ? "".concat(_tWidth2 + scrollbarWidth, "px") : '';
          } // const listElem = elemStore[`${name}-${layout}-list`]
          // if (listElem) {
          //   XEUtils.arrayEach(listElem.querySelectorAll(`.col--gutter`), thElem => {
          //     thElem.style.width = `${scrollbarWidth}px`
          //   })
          // }

        }

        var colgroupElem = elemStore["".concat(name, "-").concat(layout, "-colgroup")];

        if (colgroupElem) {
          _xeUtils.default.arrayEach(colgroupElem.children, function (colElem) {
            var colid = colElem.getAttribute('name');

            if (colid === 'col_gutter') {
              colElem.style.width = "".concat(scrollbarWidth, "px");
            }

            if (fullColumnIdData[colid]) {
              var column = fullColumnIdData[colid].column;
              var showHeaderOverflow = column.showHeaderOverflow,
                  showFooterOverflow = column.showFooterOverflow,
                  showOverflow = column.showOverflow;
              var cellOverflow;
              colElem.style.width = "".concat(column.renderWidth, "px");

              if (layout === 'header') {
                cellOverflow = _xeUtils.default.isUndefined(showHeaderOverflow) || _xeUtils.default.isNull(showHeaderOverflow) ? allColumnHeaderOverflow : showHeaderOverflow;
              } else if (layout === 'footer') {
                cellOverflow = _xeUtils.default.isUndefined(showFooterOverflow) || _xeUtils.default.isNull(showFooterOverflow) ? allColumnFooterOverflow : showFooterOverflow;
              } else {
                cellOverflow = _xeUtils.default.isUndefined(showOverflow) || _xeUtils.default.isNull(showOverflow) ? allColumnOverflow : showOverflow;
              }

              var showEllipsis = cellOverflow === 'ellipsis';
              var showTitle = cellOverflow === 'title';
              var showTooltip = cellOverflow === true || cellOverflow === 'tooltip';
              var hasEllipsis = showTitle || showTooltip || showEllipsis;
              var _listElem = elemStore["".concat(name, "-").concat(layout, "-list")]; // 滚动的渲染不支持动态行高

              if (layout === 'header' || layout === 'footer') {
                if (scrollXLoad && !hasEllipsis) {
                  hasEllipsis = true;
                }
              } else {
                if ((scrollXLoad || scrollYLoad) && !hasEllipsis) {
                  hasEllipsis = true;
                }
              }

              if (_listElem) {
                _xeUtils.default.arrayEach(_listElem.querySelectorAll(".".concat(column.id)), function (elem) {
                  var colspan = parseInt(elem.getAttribute('colspan') || 1);
                  var cellElem = elem.querySelector('.vxe-cell');
                  var colWidth = column.renderWidth;

                  if (cellElem) {
                    if (colspan > 1) {
                      var columnIndex = _this17.getColumnIndex(column);

                      for (var _index = 1; _index < colspan; _index++) {
                        var nextColumn = _this17.getColumns(columnIndex + _index);

                        if (nextColumn) {
                          colWidth += nextColumn.renderWidth;
                        }
                      }
                    }

                    cellElem.style.width = hasEllipsis ? "".concat(colWidth - cellOffsetWidth * colspan, "px") : '';
                  }
                });
              }
            }
          });
        }
      });
    });

    if (currentRow) {
      this.setCurrentRow(currentRow);
    }

    if (mouseConfig && mouseConfig.selected && editStore.selected.row && editStore.selected.column) {
      this.addColSdCls();
    }

    return this.$nextTick();
  },

  /**
   * 处理固定列的显示状态
   */
  checkScrolling: function checkScrolling() {
    var _this$$refs = this.$refs,
        tableBody = _this$$refs.tableBody,
        leftContainer = _this$$refs.leftContainer,
        rightContainer = _this$$refs.rightContainer;
    var bodyElem = tableBody ? tableBody.$el : null;

    if (bodyElem) {
      if (leftContainer) {
        _tools.DomTools[bodyElem.scrollLeft > 0 ? 'addClass' : 'removeClass'](leftContainer, 'scrolling--middle');
      }

      if (rightContainer) {
        _tools.DomTools[bodyElem.clientWidth < bodyElem.scrollWidth - Math.ceil(bodyElem.scrollLeft) ? 'addClass' : 'removeClass'](rightContainer, 'scrolling--middle');
      }
    }
  },
  preventEvent: function preventEvent(evnt, type, args, next, end) {
    var _this18 = this;

    var evntList = _vXETable.default.interceptor.get(type);

    var rest;

    if (!evntList.some(function (func) {
      return func(Object.assign({
        $grid: _this18.$xegrid,
        $table: _this18,
        $event: evnt
      }, args), evnt, _this18) === false;
    })) {
      if (next) {
        rest = next();
      }
    }

    if (end) {
      end();
    }

    return rest;
  },

  /**
   * 全局按下事件处理
   */
  handleGlobalMousedownEvent: function handleGlobalMousedownEvent(evnt) {
    var _this19 = this;

    var $el = this.$el,
        $refs = this.$refs,
        mouseConfig = this.mouseConfig,
        mouseOpts = this.mouseOpts,
        editStore = this.editStore,
        ctxMenuStore = this.ctxMenuStore,
        editOpts = this.editOpts,
        filterStore = this.filterStore,
        getRowNode = this.getRowNode;
    var actived = editStore.actived;
    var filterWrapper = $refs.filterWrapper,
        validTip = $refs.validTip; // 在 v3.0 中废弃 mouse-config.checked

    var isMouseChecked = mouseConfig && (mouseOpts.range || mouseOpts.checked);

    if (filterWrapper) {
      if (_tools.DomTools.getEventTargetNode(evnt, $el, 'vxe-cell--filter').flag) {// 如果点击了筛选按钮
      } else if (_tools.DomTools.getEventTargetNode(evnt, filterWrapper.$el).flag) {// 如果点击筛选容器
      } else {
        if (!_tools.DomTools.getEventTargetNode(evnt, document.body, 'vxe-table--ignore-clear').flag) {
          this.preventEvent(evnt, 'event.clearFilter', filterStore.args, this.closeFilter);
        }
      }
    } // 如果已激活了编辑状态


    if (actived.row) {
      if (!(editOpts.autoClear === false)) {
        if (validTip && _tools.DomTools.getEventTargetNode(evnt, validTip.$el).flag) {// 如果是激活状态，且点击了校验提示框
        } else if (!this.lastCallTime || this.lastCallTime + 50 < Date.now()) {
          // 如果是激活状态，且点击了下拉选项
          if (!_tools.DomTools.getEventTargetNode(evnt, document.body, 'vxe-table--ignore-clear').flag) {
            // 如果手动调用了激活单元格，避免触发源被移除后导致重复关闭
            this.preventEvent(evnt, 'event.clearActived', actived.args, function () {
              var isClear;

              if (editOpts.mode === 'row') {
                var rowNode = _tools.DomTools.getEventTargetNode(evnt, $el, 'vxe-body--row'); // row 方式，如果点击了不同行


                isClear = rowNode.flag ? getRowNode(rowNode.targetElem).item !== actived.args.row : false;
              } else {
                // cell 方式，如果是非编辑列
                isClear = !_tools.DomTools.getEventTargetNode(evnt, $el, 'col--edit').flag;
              }

              if (!isClear) {
                isClear = _tools.DomTools.getEventTargetNode(evnt, $el, 'vxe-header--row').flag;
              }

              if (!isClear) {
                isClear = _tools.DomTools.getEventTargetNode(evnt, $el, 'vxe-footer--row').flag;
              }

              if (isClear || // 如果点击了当前表格之外
              !_tools.DomTools.getEventTargetNode(evnt, $el).flag) {
                // this.triggerValidate('blur').then(a => {
                // 保证 input 的 change 事件能先触发之后再清除
                setTimeout(function () {
                  return _this19.clearActived(evnt);
                }); // }).catch(e => e)
              }
            });
          }
        }
      }
    } else if (mouseConfig) {
      if (!_tools.DomTools.getEventTargetNode(evnt, $el).flag && !_tools.DomTools.getEventTargetNode(evnt, $refs.tableWrapper).flag) {
        if (isMouseChecked) {
          this.clearIndexChecked();
          this.clearHeaderChecked();
          this.clearChecked();
        }

        this.clearSelected();
      }
    } // 如果配置了快捷菜单且，点击了其他地方则关闭


    if (ctxMenuStore.visible && this.$refs.ctxWrapper && !_tools.DomTools.getEventTargetNode(evnt, this.$refs.ctxWrapper.$el).flag) {
      this.closeMenu();
    } // 最后激活的表格


    this.isActivated = _tools.DomTools.getEventTargetNode(evnt, (this.$xegrid || this).$el).flag;
  },

  /**
   * 窗口失焦事件处理
   */
  handleGlobalBlurEvent: function handleGlobalBlurEvent() {
    this.closeFilter();
    this.closeMenu();
  },

  /**
   * 全局滚动事件
   */
  handleGlobalMousewheelEvent: function handleGlobalMousewheelEvent() {
    this.clostTooltip();
    this.closeMenu();
  },

  /**
   * 全局键盘事件
   */
  handleGlobalKeydownEvent: function handleGlobalKeydownEvent(evnt) {
    var _this20 = this;

    // 该行为只对当前激活的表格有效
    if (this.isActivated) {
      this.preventEvent(evnt, 'event.keydown', null, function () {
        var isCtxMenu = _this20.isCtxMenu,
            ctxMenuStore = _this20.ctxMenuStore,
            editStore = _this20.editStore,
            editOpts = _this20.editOpts,
            _this20$mouseConfig = _this20.mouseConfig,
            mouseConfig = _this20$mouseConfig === void 0 ? {} : _this20$mouseConfig,
            _this20$keyboardConfi = _this20.keyboardConfig,
            keyboardConfig = _this20$keyboardConfi === void 0 ? {} : _this20$keyboardConfi,
            treeConfig = _this20.treeConfig,
            treeOpts = _this20.treeOpts,
            highlightCurrentRow = _this20.highlightCurrentRow,
            currentRow = _this20.currentRow;
        var selected = editStore.selected,
            actived = editStore.actived;
        var keyCode = evnt.keyCode;
        var isBack = keyCode === 8;
        var isTab = keyCode === 9;
        var isEnter = keyCode === 13;
        var isEsc = keyCode === 27;
        var isSpacebar = keyCode === 32;
        var isLeftArrow = keyCode === 37;
        var isUpArrow = keyCode === 38;
        var isRightArrow = keyCode === 39;
        var isDwArrow = keyCode === 40;
        var isDel = keyCode === 46;
        var isA = keyCode === 65;
        var isC = keyCode === 67;
        var isV = keyCode === 86;
        var isX = keyCode === 88;
        var isF2 = keyCode === 113;
        var isCtrlKey = evnt.ctrlKey;
        var isShiftKey = evnt.shiftKey;
        var operArrow = isLeftArrow || isUpArrow || isRightArrow || isDwArrow;
        var operCtxMenu = isCtxMenu && ctxMenuStore.visible && (isEnter || isSpacebar || operArrow);
        var params;

        if (isEsc) {
          // 如果按下了 Esc 键，关闭快捷菜单、筛选
          _this20.closeMenu();

          _this20.closeFilter(); // 如果是激活编辑状态，则取消编辑


          if (actived.row) {
            params = actived.args;

            _this20.clearActived(evnt); // 如果配置了选中功能，则为选中状态


            if (mouseConfig.selected) {
              _this20.$nextTick(function () {
                return _this20.handleSelected(params, evnt);
              });
            }
          }
        } else if (isSpacebar && (keyboardConfig.isArrow || keyboardConfig.isTab) && selected.row && selected.column && (selected.column.type === 'checkbox' || selected.column.type === 'selection' || selected.column.type === 'radio')) {
          // 在 v3.0 中废弃 type=selection
          // 空格键支持选中复选框
          evnt.preventDefault(); // 在 v3.0 中废弃 type=selection

          if (selected.column.type === 'checkbox' || selected.column.type === 'selection') {
            _this20.handleToggleCheckRowEvent(selected.args, evnt);
          } else {
            _this20.triggerRadioRowEvent(evnt, selected.args);
          }
        } else if (isEnter && keyboardConfig.isEnter && (selected.row || actived.row || treeConfig && highlightCurrentRow && currentRow)) {
          // 退出选中
          if (isCtrlKey) {
            // 如果是激活编辑状态，则取消编辑
            if (actived.row) {
              params = actived.args;

              _this20.clearActived(evnt); // 如果配置了选中功能，则为选中状态


              if (mouseConfig.selected) {
                _this20.$nextTick(function () {
                  return _this20.handleSelected(params, evnt);
                });
              }
            }
          } else {
            // 如果是激活状态，退则出到上一行/下一行
            if (selected.row || actived.row) {
              if (isShiftKey) {
                _this20.moveSelected(selected.row ? selected.args : actived.args, isLeftArrow, true, isRightArrow, false, evnt);
              } else {
                _this20.moveSelected(selected.row ? selected.args : actived.args, isLeftArrow, false, isRightArrow, true, evnt);
              }
            } else if (treeConfig && highlightCurrentRow && currentRow) {
              // 如果是树形表格当前行回车移动到子节点
              var childrens = currentRow[treeOpts.children];

              if (childrens && childrens.length) {
                evnt.preventDefault();
                var targetRow = childrens[0];
                params = {
                  $table: _this20,
                  row: targetRow
                };

                _this20.setTreeExpand(currentRow, true).then(function () {
                  return _this20.scrollToRow(targetRow);
                }).then(function () {
                  return _this20.triggerCurrentRowEvent(evnt, params);
                });
              }
            }
          }
        } else if (operCtxMenu) {
          // 如果配置了右键菜单; 支持方向键操作、回车
          evnt.preventDefault();

          if (ctxMenuStore.showChild && _tools.UtilTools.hasChildrenList(ctxMenuStore.selected)) {
            _this20.moveCtxMenu(evnt, keyCode, ctxMenuStore, 'selectChild', 37, false, ctxMenuStore.selected.children);
          } else {
            _this20.moveCtxMenu(evnt, keyCode, ctxMenuStore, 'selected', 39, true, _this20.ctxMenuList);
          }
        } else if (isF2) {
          // 如果按下了 F2 键
          if (selected.row && selected.column) {
            evnt.preventDefault();

            _this20.handleActived(selected.args, evnt);
          }
        } else if (operArrow && keyboardConfig.isArrow) {
          // 如果按下了方向键
          if (selected.row && selected.column) {
            _this20.moveSelected(selected.args, isLeftArrow, isUpArrow, isRightArrow, isDwArrow, evnt);
          } else if ((isUpArrow || isDwArrow) && highlightCurrentRow && currentRow) {
            // 当前行按键上下移动
            _this20.moveCurrentRow(isUpArrow, isDwArrow, evnt);
          }
        } else if (isTab && keyboardConfig.isTab) {
          // 如果按下了 Tab 键切换
          if (selected.row || selected.column) {
            _this20.moveTabSelected(selected.args, isShiftKey, evnt);
          } else if (actived.row || actived.column) {
            _this20.moveTabSelected(actived.args, isShiftKey, evnt);
          }
        } else if (isDel || (treeConfig && highlightCurrentRow && currentRow ? isBack && keyboardConfig.isArrow : isBack)) {
          // 如果是删除键
          if (keyboardConfig.isDel && (selected.row || selected.column)) {
            _tools.UtilTools.setCellValue(selected.row, selected.column, null);

            if (isBack) {
              _this20.handleActived(selected.args, evnt);
            }
          } else if (isBack && keyboardConfig.isArrow && treeConfig && highlightCurrentRow && currentRow) {
            // 如果树形表格回退键关闭当前行返回父节点
            var _XEUtils$findTree = _xeUtils.default.findTree(_this20.afterFullData, function (item) {
              return item === currentRow;
            }, treeOpts),
                parentRow = _XEUtils$findTree.parent;

            if (parentRow) {
              evnt.preventDefault();
              params = {
                $table: _this20,
                row: parentRow
              };

              _this20.setTreeExpand(parentRow, false).then(function () {
                return _this20.scrollToRow(parentRow);
              }).then(function () {
                return _this20.triggerCurrentRowEvent(evnt, params);
              });
            }
          }
        } else if (keyboardConfig.isCut && isCtrlKey && (isA || isX || isC || isV)) {
          // 如果开启复制功能
          if (isA) {
            _this20.handleAllChecked(evnt);
          } else if (isX || isC) {
            _this20.handleCopyed(isX, evnt);
          } else {
            _this20.handlePaste(evnt);
          }
        } else if (keyboardConfig.isEdit && !isCtrlKey && (isSpacebar || keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90 || keyCode >= 96 && keyCode <= 111 || keyCode >= 186 && keyCode <= 192 || keyCode >= 219 && keyCode <= 222)) {
          // 启用编辑后，空格键功能将失效
          // if (isSpacebar) {
          //   evnt.preventDefault()
          // }
          // 如果是按下非功能键之外允许直接编辑
          if (selected.column && selected.row && selected.column.editRender) {
            if (!keyboardConfig.editMethod || !(keyboardConfig.editMethod(selected.args, evnt) === false)) {
              if (!editOpts.activeMethod || editOpts.activeMethod(selected.args)) {
                _tools.UtilTools.setCellValue(selected.row, selected.column, null);

                _this20.handleActived(selected.args, evnt);
              }
            }
          }
        }

        _this20.emitEvent('keydown', {}, evnt);
      });
    }
  },
  handleGlobalResizeEvent: function handleGlobalResizeEvent() {
    this.closeMenu();
    this.recalculate(true);
  },
  handleTooltipLeaveEvent: function handleTooltipLeaveEvent() {
    var _this21 = this;

    var tooltipOpts = this.tooltipOpts;
    setTimeout(function () {
      if (!_this21.tooltipActive) {
        _this21.clostTooltip();
      }
    }, tooltipOpts.leaveDelay);
  },
  handleTargetEnterEvent: function handleTargetEnterEvent() {
    clearTimeout(this.tooltipTimeout);
    this.tooltipActive = true;
    this.clostTooltip();
  },
  handleTargetLeaveEvent: function handleTargetLeaveEvent() {
    var _this22 = this;

    var tooltipOpts = this.tooltipOpts;
    this.tooltipActive = false;

    if (tooltipOpts.enterable) {
      this.tooltipTimeout = setTimeout(function () {
        if (!_this22.$refs.tooltip.isHover) {
          _this22.clostTooltip();
        }
      }, tooltipOpts.leaveDelay);
    } else {
      this.clostTooltip();
    }
  },

  /**
   * 触发表头 tooltip 事件
   */
  triggerHeaderTooltipEvent: function triggerHeaderTooltipEvent(evnt, params) {
    var tooltipStore = this.tooltipStore;
    var column = params.column;
    var cell = evnt.currentTarget;
    this.handleTargetEnterEvent();

    if (tooltipStore.column !== column || !tooltipStore.visible) {
      this.handleTooltip(evnt, cell, cell.querySelector('.vxe-cell--title'), params);
    }
  },

  /**
   * 触发表尾 tooltip 事件
   */
  triggerFooterTooltipEvent: function triggerFooterTooltipEvent(evnt, params) {
    var tooltipStore = this.tooltipStore;
    var column = params.column;
    var cell = evnt.currentTarget;
    this.handleTargetEnterEvent();

    if (tooltipStore.column !== column || !tooltipStore.visible) {
      this.handleTooltip(evnt, cell, cell.children[0], params);
    }
  },

  /**
   * 触发 tooltip 事件
   */
  triggerTooltipEvent: function triggerTooltipEvent(evnt, params) {
    var editConfig = this.editConfig,
        editOpts = this.editOpts,
        editStore = this.editStore,
        tooltipStore = this.tooltipStore;
    var actived = editStore.actived;
    var row = params.row,
        column = params.column;
    var cell = evnt.currentTarget;
    this.handleTargetEnterEvent();

    if (editConfig) {
      if (editOpts.mode === 'row' && actived.row === row || actived.row === row && actived.column === column) {
        return;
      }
    }

    if (tooltipStore.column !== column || tooltipStore.row !== row || !tooltipStore.visible) {
      this.handleTooltip(evnt, cell, column.treeNode ? cell.querySelector('.vxe-tree-cell') : cell.children[0], params);
    }
  },

  /**
   * 处理显示 tooltip
   * @param {Event} evnt 事件
   * @param {ColumnConfig} column 列配置
   * @param {Row} row 行对象
   */
  handleTooltip: function handleTooltip(evnt, cell, overflowElem, params) {
    params.cell = cell;
    var $refs = this.$refs,
        tooltipOpts = this.tooltipOpts,
        tooltipStore = this.tooltipStore;
    var column = params.column,
        row = params.row;
    var enabled = tooltipOpts.enabled,
        contentMethod = tooltipOpts.contentMethod;
    var tooltip = $refs.tooltip;
    var customContent = contentMethod ? contentMethod(params) : null;
    var useCustom = contentMethod && !_xeUtils.default.eqNull(customContent);
    var content = useCustom ? customContent : (column.type === 'html' ? overflowElem.innerText : overflowElem.textContent).trim();

    if (content && (enabled || useCustom || overflowElem.scrollWidth > overflowElem.clientWidth)) {
      Object.assign(tooltipStore, {
        row: row,
        column: column,
        visible: true
      });

      if (tooltip) {
        tooltip.toVisible(overflowElem, _tools.UtilTools.formatText(content));
      }
    }

    return this.$nextTick();
  },

  /**
   * 关闭 tooltip
   */
  clostTooltip: function clostTooltip() {
    var tooltip = this.$refs.tooltip;
    Object.assign(this.tooltipStore, {
      row: null,
      column: null,
      content: null,
      visible: false
    });

    if (tooltip) {
      tooltip.close();
    }

    return this.$nextTick();
  },

  /**
   * 判断复选框是否全选
   */
  isAllCheckboxChecked: function isAllCheckboxChecked() {
    return this.isAllSelected;
  },

  /**
   * 判断复选框是否全选
   */
  isCheckboxIndeterminate: function isCheckboxIndeterminate() {
    return this.isIndeterminate;
  },

  /**
   * 获取复选框半选状态的行数据
   */
  getCheckboxIndeterminateRecords: function getCheckboxIndeterminateRecords() {
    var treeConfig = this.treeConfig,
        treeIndeterminates = this.treeIndeterminates;

    if (treeConfig) {
      return treeIndeterminates.slice(0);
    }

    return [];
  },

  /**
   * 处理默认勾选
   */
  handleDefaultSelectionChecked: function handleDefaultSelectionChecked() {
    var fullDataRowIdData = this.fullDataRowIdData,
        checkboxOpts = this.checkboxOpts,
        checkboxReserveRowMap = this.checkboxReserveRowMap;
    var checkAll = checkboxOpts.checkAll,
        checkRowKeys = checkboxOpts.checkRowKeys;

    if (checkAll) {
      this.setAllCheckboxRow(true);
    } else if (checkRowKeys) {
      var defSelection = [];

      var rowkey = _tools.UtilTools.getRowkey(this);

      checkRowKeys.forEach(function (rowid) {
        if (fullDataRowIdData[rowid]) {
          defSelection.push(fullDataRowIdData[rowid].row);
        }

        if (checkboxOpts.reserve) {
          checkboxReserveRowMap[rowid] = _defineProperty({}, rowkey, rowid);
        }
      });
      this.setCheckboxRow(defSelection, true);
    }
  },
  // 在 v3.0 中废弃 setSelection
  setSelection: function setSelection(rows, value) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['setSelection', 'setCheckboxRow']);

    return this.setCheckboxRow(rows, value);
  },

  /**
   * 用于多选行，设置行为选中状态，第二个参数为选中与否
   * @param {Array/Row} rows 行数据
   * @param {Boolean} value 是否选中
   */
  setCheckboxRow: function setCheckboxRow(rows, value) {
    var _this23 = this;

    if (rows && !_xeUtils.default.isArray(rows)) {
      rows = [rows];
    }

    rows.forEach(function (row) {
      return _this23.handleSelectRow({
        row: row
      }, !!value);
    });
    return this.$nextTick();
  },
  isCheckedByRow: function isCheckedByRow(row) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['isCheckedByRow', 'isCheckedByCheckboxRow']);

    return this.isCheckedByCheckboxRow(row);
  },
  isCheckedByCheckboxRow: function isCheckedByCheckboxRow(row) {
    var property = this.checkboxOpts.checkField;

    if (property) {
      return _xeUtils.default.get(row, property);
    }

    return this.selection.indexOf(row) > -1;
  },

  /**
   * 多选，行选中事件
   * value 选中true 不选false 不确定-1
   */
  handleSelectRow: function handleSelectRow(_ref4, value) {
    var _this24 = this;

    var row = _ref4.row;
    var selection = this.selection,
        afterFullData = this.afterFullData,
        treeConfig = this.treeConfig,
        treeOpts = this.treeOpts,
        treeIndeterminates = this.treeIndeterminates,
        checkboxOpts = this.checkboxOpts;
    var property = checkboxOpts.checkField,
        checkStrictly = checkboxOpts.checkStrictly,
        checkMethod = checkboxOpts.checkMethod;

    if (property) {
      if (treeConfig && !checkStrictly) {
        if (value === -1) {
          if (treeIndeterminates.indexOf(row) === -1) {
            treeIndeterminates.push(row);
          }

          _xeUtils.default.set(row, property, false);
        } else {
          // 更新子节点状态
          _xeUtils.default.eachTree([row], function (item) {
            if (row === item || !checkMethod || checkMethod({
              row: item
            })) {
              _xeUtils.default.set(item, property, value);

              _this24.handleCheckboxReserveRow(row, value);
            }
          }, treeOpts);

          _xeUtils.default.remove(treeIndeterminates, function (item) {
            return item === row;
          });
        } // 如果存在父节点，更新父节点状态


        var matchObj = _xeUtils.default.findTree(afterFullData, function (item) {
          return item === row;
        }, treeOpts);

        if (matchObj && matchObj.parent) {
          var parentStatus;
          var vItems = checkMethod ? matchObj.items.filter(function (item) {
            return checkMethod({
              row: item
            });
          }) : matchObj.items;

          var indeterminatesItem = _xeUtils.default.find(matchObj.items, function (item) {
            return treeIndeterminates.indexOf(item) > -1;
          });

          if (indeterminatesItem) {
            parentStatus = -1;
          } else {
            var selectItems = matchObj.items.filter(function (item) {
              return _xeUtils.default.get(item, property);
            });
            parentStatus = selectItems.filter(function (item) {
              return vItems.indexOf(item) > -1;
            }).length === vItems.length ? true : selectItems.length || value === -1 ? -1 : false;
          }

          return this.handleSelectRow({
            row: matchObj.parent
          }, parentStatus);
        }
      } else {
        if (!checkMethod || checkMethod({
          row: row
        })) {
          _xeUtils.default.set(row, property, value);

          this.handleCheckboxReserveRow(row, value);
        }
      }
    } else {
      if (treeConfig && !checkStrictly) {
        if (value === -1) {
          if (treeIndeterminates.indexOf(row) === -1) {
            treeIndeterminates.push(row);
          }

          _xeUtils.default.remove(selection, function (item) {
            return item === row;
          });
        } else {
          // 更新子节点状态
          _xeUtils.default.eachTree([row], function (item) {
            if (row === item || !checkMethod || checkMethod({
              row: item
            })) {
              if (value) {
                selection.push(item);
              } else {
                _xeUtils.default.remove(selection, function (select) {
                  return select === item;
                });
              }

              _this24.handleCheckboxReserveRow(row, value);
            }
          }, treeOpts);

          _xeUtils.default.remove(treeIndeterminates, function (item) {
            return item === row;
          });
        } // 如果存在父节点，更新父节点状态


        var _matchObj = _xeUtils.default.findTree(afterFullData, function (item) {
          return item === row;
        }, treeOpts);

        if (_matchObj && _matchObj.parent) {
          var _parentStatus;

          var _vItems = checkMethod ? _matchObj.items.filter(function (item) {
            return checkMethod({
              row: item
            });
          }) : _matchObj.items;

          var _indeterminatesItem = _xeUtils.default.find(_matchObj.items, function (item) {
            return treeIndeterminates.indexOf(item) > -1;
          });

          if (_indeterminatesItem) {
            _parentStatus = -1;
          } else {
            var _selectItems = _matchObj.items.filter(function (item) {
              return selection.indexOf(item) > -1;
            });

            _parentStatus = _selectItems.filter(function (item) {
              return _vItems.indexOf(item) > -1;
            }).length === _vItems.length ? true : _selectItems.length || value === -1 ? -1 : false;
          }

          return this.handleSelectRow({
            row: _matchObj.parent
          }, _parentStatus);
        }
      } else {
        if (!checkMethod || checkMethod({
          row: row
        })) {
          if (value) {
            if (selection.indexOf(row) === -1) {
              selection.push(row);
            }
          } else {
            _xeUtils.default.remove(selection, function (item) {
              return item === row;
            });
          }

          this.handleCheckboxReserveRow(row, value);
        }
      }
    }

    this.checkSelectionStatus();
  },
  handleToggleCheckRowEvent: function handleToggleCheckRowEvent(params, evnt) {
    var selection = this.selection,
        checkboxOpts = this.checkboxOpts;
    var property = checkboxOpts.checkField;
    var row = params.row;
    var value = property ? !_xeUtils.default.get(row, property) : selection.indexOf(row) === -1;

    if (evnt) {
      this.triggerCheckRowEvent(evnt, params, value);
    } else {
      this.handleSelectRow(params, value);
    }
  },
  triggerCheckRowEvent: function triggerCheckRowEvent(evnt, params, value) {
    var checkMethod = this.checkboxOpts.checkMethod;

    if (!checkMethod || checkMethod({
      row: params.row
    })) {
      this.handleSelectRow(params, value);
      var records = this.getCheckboxRecords(); // 在 v3.0 中废弃 select-change

      if (this.$listeners['select-change']) {
        _tools.UtilTools.warn('vxe.error.delEvent', ['select-change', 'checkbox-change']);

        this.emitEvent('select-change', Object.assign({
          records: records,
          selection: records,
          reserves: this.getCheckboxReserveRecords(),
          checked: value
        }, params), evnt);
      } else {
        this.emitEvent('checkbox-change', Object.assign({
          records: records,
          selection: records,
          reserves: this.getCheckboxReserveRecords(),
          indeterminates: this.getCheckboxIndeterminateRecords(),
          checked: value
        }, params), evnt);
      }
    }
  },
  // 在 v3.0 中废弃 toggleRowSelection
  toggleRowSelection: function toggleRowSelection(row) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['toggleRowSelection', 'toggleCheckboxRow']);

    return this.toggleCheckboxRow(row);
  },

  /**
   * 多选，切换某一行的选中状态
   */
  toggleCheckboxRow: function toggleCheckboxRow(row) {
    this.handleToggleCheckRowEvent({
      row: row
    });
    return this.$nextTick();
  },
  // 在 v3.0 中废弃 setAllSelection
  setAllSelection: function setAllSelection(value) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['setAllSelection', 'setAllCheckboxRow']);

    return this.setAllCheckboxRow(value);
  },

  /**
   * 用于多选行，设置所有行的选中状态
   * @param {Boolean} value 是否选中
   */
  setAllCheckboxRow: function setAllCheckboxRow(value) {
    var _this25 = this;

    var afterFullData = this.afterFullData,
        treeConfig = this.treeConfig,
        treeOpts = this.treeOpts,
        selection = this.selection,
        checkboxReserveRowMap = this.checkboxReserveRowMap,
        checkboxOpts = this.checkboxOpts;
    var property = checkboxOpts.checkField,
        reserve = checkboxOpts.reserve,
        checkStrictly = checkboxOpts.checkStrictly,
        checkMethod = checkboxOpts.checkMethod;
    var selectRows = [];
    var beforeSelection = treeConfig ? [] : selection.filter(function (row) {
      return afterFullData.indexOf(row) === -1;
    });

    if (checkStrictly) {
      this.isAllSelected = value;
    } else {
      if (property) {
        var setValFn = function setValFn(row) {
          if (!checkMethod || checkMethod({
            row: row
          })) {
            _xeUtils.default.set(row, property, value);
          }
        };

        var clearValFn = function clearValFn(row) {
          if (!checkMethod || (checkMethod({
            row: row
          }) ? 0 : selection.indexOf(row) > -1)) {
            _xeUtils.default.set(row, property, value);
          }
        };

        if (treeConfig) {
          _xeUtils.default.eachTree(afterFullData, value ? setValFn : clearValFn, treeOpts);
        } else {
          afterFullData.forEach(value ? setValFn : clearValFn);
        }
      } else {
        if (treeConfig) {
          if (value) {
            _xeUtils.default.eachTree(afterFullData, function (row) {
              if (!checkMethod || checkMethod({
                row: row
              })) {
                selectRows.push(row);
              }
            }, treeOpts);
          } else {
            if (checkMethod) {
              _xeUtils.default.eachTree(afterFullData, function (row) {
                if (checkMethod({
                  row: row
                }) ? 0 : selection.indexOf(row) > -1) {
                  selectRows.push(row);
                }
              }, treeOpts);
            }
          }
        } else {
          if (value) {
            if (checkMethod) {
              selectRows = afterFullData.filter(function (row) {
                return selection.indexOf(row) > -1 || checkMethod({
                  row: row
                });
              });
            } else {
              selectRows = afterFullData.slice(0);
            }
          } else {
            if (checkMethod) {
              selectRows = afterFullData.filter(function (row) {
                return checkMethod({
                  row: row
                }) ? 0 : selection.indexOf(row) > -1;
              });
            }
          }
        }
      }

      if (reserve) {
        if (value) {
          selectRows.forEach(function (row) {
            checkboxReserveRowMap[_tools.UtilTools.getRowid(_this25, row)] = row;
          });
        } else {
          afterFullData.forEach(function (row) {
            var rowid = _tools.UtilTools.getRowid(_this25, row);

            if (checkboxReserveRowMap[rowid]) {
              delete checkboxReserveRowMap[rowid];
            }
          });
        }
      }

      this.selection = beforeSelection.concat(selectRows);
    }

    this.treeIndeterminates = [];
    this.checkSelectionStatus();
  },
  checkSelectionStatus: function checkSelectionStatus() {
    var afterFullData = this.afterFullData,
        selection = this.selection,
        treeIndeterminates = this.treeIndeterminates,
        checkboxOpts = this.checkboxOpts,
        treeConfig = this.treeConfig;
    var checkField = checkboxOpts.checkField,
        halfField = checkboxOpts.halfField,
        checkStrictly = checkboxOpts.checkStrictly,
        checkMethod = checkboxOpts.checkMethod;

    if (!checkStrictly) {
      var isAllSelected = false;
      var isIndeterminate = false;

      if (checkField) {
        isAllSelected = afterFullData.length && afterFullData.every(checkMethod ? function (row) {
          return !checkMethod({
            row: row
          }) || _xeUtils.default.get(row, checkField);
        } : function (row) {
          return _xeUtils.default.get(row, checkField);
        });

        if (treeConfig) {
          if (halfField) {
            isIndeterminate = !isAllSelected && afterFullData.some(function (row) {
              return _xeUtils.default.get(row, checkField) || _xeUtils.default.get(row, halfField) || treeIndeterminates.indexOf(row) > -1;
            });
          } else {
            isIndeterminate = !isAllSelected && afterFullData.some(function (row) {
              return _xeUtils.default.get(row, checkField) || treeIndeterminates.indexOf(row) > -1;
            });
          }
        } else {
          if (halfField) {
            isIndeterminate = !isAllSelected && afterFullData.some(function (row) {
              return _xeUtils.default.get(row, checkField) || _xeUtils.default.get(row, halfField);
            });
          } else {
            isIndeterminate = !isAllSelected && afterFullData.some(function (row) {
              return _xeUtils.default.get(row, checkField);
            });
          }
        }
      } else {
        isAllSelected = afterFullData.length && afterFullData.every(checkMethod ? function (row) {
          return !checkMethod({
            row: row
          }) || selection.indexOf(row) > -1;
        } : function (row) {
          return selection.indexOf(row) > -1;
        });

        if (treeConfig) {
          isIndeterminate = !isAllSelected && afterFullData.some(function (row) {
            return treeIndeterminates.indexOf(row) > -1 || selection.indexOf(row) > -1;
          });
        } else {
          isIndeterminate = !isAllSelected && afterFullData.some(function (row) {
            return selection.indexOf(row) > -1;
          });
        }
      }

      this.isAllSelected = isAllSelected;
      this.isIndeterminate = isIndeterminate;
    }
  },
  // 还原展开、选中等相关状态
  handleReserveStatus: function handleReserveStatus() {
    var expandColumn = this.expandColumn,
        treeConfig = this.treeConfig,
        fullDataRowIdData = this.fullDataRowIdData,
        fullAllDataRowMap = this.fullAllDataRowMap,
        currentRow = this.currentRow,
        selectRow = this.selectRow,
        radioReserveRow = this.radioReserveRow,
        radioOpts = this.radioOpts,
        checkboxReserveRowMap = this.checkboxReserveRowMap,
        checkboxOpts = this.checkboxOpts,
        selection = this.selection,
        rowExpandeds = this.rowExpandeds,
        treeExpandeds = this.treeExpandeds,
        treeIndeterminates = this.treeIndeterminates; // 单选框

    if (selectRow && !fullAllDataRowMap.has(selectRow)) {
      this.selectRow = null; // 刷新单选行状态
    } // 还原保留选中状态


    if (radioOpts.reserve && radioReserveRow) {
      var rowid = _tools.UtilTools.getRowid(this, radioReserveRow);

      if (fullDataRowIdData[rowid]) {
        this.setRadioRow(fullDataRowIdData[rowid].row);
      }
    } // 复选框


    this.selection = handleReserveRow(this, selection); // 刷新多选行状态
    // 还原保留选中状态

    if (checkboxOpts.reserve) {
      var reserveSelection = [];

      _xeUtils.default.each(checkboxReserveRowMap, function (item, rowid) {
        if (fullDataRowIdData[rowid] && reserveSelection.indexOf(fullDataRowIdData[rowid].row) === -1) {
          reserveSelection.push(fullDataRowIdData[rowid].row);
        }
      });

      this.setCheckboxRow(reserveSelection, true);
    }

    if (currentRow && !fullAllDataRowMap.has(currentRow)) {
      this.currentRow = null; // 刷新当前行状态
    } // 行展开


    this.rowExpandeds = expandColumn ? handleReserveRow(this, rowExpandeds) : []; // 刷新行展开状态
    // 树展开

    this.treeExpandeds = treeConfig ? handleReserveRow(this, treeExpandeds) : [];
    this.treeIndeterminates = treeConfig ? handleReserveRow(this, treeIndeterminates) : [];
  },

  /**
   * 获取单选框保留选中的行
   */
  getRadioReserveRecord: function getRadioReserveRecord() {
    var fullDataRowIdData = this.fullDataRowIdData,
        radioReserveRow = this.radioReserveRow,
        radioOpts = this.radioOpts;

    if (radioOpts.reserve && radioReserveRow) {
      if (!fullDataRowIdData[_tools.UtilTools.getRowid(this, radioReserveRow)]) {
        return radioReserveRow;
      }
    }

    return null;
  },
  clearRadioReserve: function clearRadioReserve() {
    this.radioReserveRow = null;
    return this.$nextTick();
  },
  handleRadioReserveRow: function handleRadioReserveRow(row) {
    var radioOpts = this.radioOpts;

    if (radioOpts.reserve) {
      this.radioReserveRow = row;
    }
  },
  // 在 v3.0 中废弃 getSelectReserveRecords
  getSelectReserveRecords: function getSelectReserveRecords() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getSelectReserveRecords', 'getCheckboxReserveRecords']);

    return this.getCheckboxReserveRecords();
  },

  /**
   * 获取保留选中的行
   */
  getCheckboxReserveRecords: function getCheckboxReserveRecords() {
    var fullDataRowIdData = this.fullDataRowIdData,
        checkboxReserveRowMap = this.checkboxReserveRowMap,
        checkboxOpts = this.checkboxOpts;
    var reserveSelection = [];

    if (checkboxOpts.reserve) {
      Object.keys(checkboxReserveRowMap).forEach(function (rowid) {
        if (!fullDataRowIdData[rowid]) {
          reserveSelection.push(checkboxReserveRowMap[rowid]);
        }
      });
    }

    return reserveSelection;
  },
  // 在 v3.0 中废弃 clearSelectReserve
  clearSelectReserve: function clearSelectReserve() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['clearSelectReserve', 'clearCheckboxReserve']);

    return this.clearCheckboxReserve();
  },
  clearCheckboxReserve: function clearCheckboxReserve() {
    this.checkboxReserveRowMap = {};
    return this.$nextTick();
  },
  handleCheckboxReserveRow: function handleCheckboxReserveRow(row, checked) {
    var checkboxReserveRowMap = this.checkboxReserveRowMap,
        checkboxOpts = this.checkboxOpts;

    if (checkboxOpts.reserve) {
      var rowid = _tools.UtilTools.getRowid(this, row);

      if (checked) {
        checkboxReserveRowMap[rowid] = row;
      } else if (checkboxReserveRowMap[rowid]) {
        delete checkboxReserveRowMap[rowid];
      }
    }
  },

  /**
   * 多选，选中所有事件
   */
  triggerCheckAllEvent: function triggerCheckAllEvent(evnt, value) {
    this.setAllCheckboxRow(value);
    var records = this.getCheckboxRecords(); // 在 v3.0 中废弃 select-all

    if (this.$listeners['select-all']) {
      _tools.UtilTools.warn('vxe.error.delEvent', ['select-all', 'checkbox-all']);

      this.emitEvent('select-all', {
        records: records,
        selection: records,
        reserves: this.getCheckboxReserveRecords(),
        checked: value
      }, evnt);
    } else {
      this.emitEvent('checkbox-all', {
        records: records,
        selection: records,
        reserves: this.getCheckboxReserveRecords(),
        indeterminates: this.getCheckboxIndeterminateRecords(),
        checked: value
      }, evnt);
    }
  },
  // 在 v3.0 中废弃 toggleAllSelection
  toggleAllSelection: function toggleAllSelection() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['toggleAllSelection', 'toggleAllCheckboxRow']);

    return this.toggleAllCheckboxRow();
  },

  /**
   * 多选，切换所有行的选中状态
   */
  toggleAllCheckboxRow: function toggleAllCheckboxRow() {
    this.triggerCheckAllEvent(null, !this.isAllSelected);
    return this.$nextTick();
  },
  // 在 v3.0 中废弃 clearSelection
  clearSelection: function clearSelection() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['clearSelection', 'clearCheckboxRow']);

    return this.clearCheckboxRow();
  },

  /**
   * 用于多选行，手动清空用户的选择
   */
  clearCheckboxRow: function clearCheckboxRow() {
    var _this26 = this;

    var tableFullData = this.tableFullData,
        treeConfig = this.treeConfig,
        treeOpts = this.treeOpts,
        checkboxOpts = this.checkboxOpts,
        checkboxReserveRowMap = this.checkboxReserveRowMap;
    var property = checkboxOpts.checkField,
        reserve = checkboxOpts.reserve;

    if (property) {
      if (treeConfig) {
        _xeUtils.default.eachTree(tableFullData, function (item) {
          return _xeUtils.default.set(item, property, false);
        }, treeOpts);
      } else {
        tableFullData.forEach(function (item) {
          return _xeUtils.default.set(item, property, false);
        });
      }
    }

    if (reserve) {
      tableFullData.forEach(function (row) {
        var rowid = _tools.UtilTools.getRowid(_this26, row);

        if (checkboxReserveRowMap[rowid]) {
          delete checkboxReserveRowMap[rowid];
        }
      });
    }

    this.isAllSelected = false;
    this.isIndeterminate = false;
    this.selection = [];
    this.treeIndeterminates = [];
    return this.$nextTick();
  },

  /**
   * 处理单选框默认勾选
   */
  handleDefaultRadioChecked: function handleDefaultRadioChecked() {
    var radioOpts = this.radioOpts,
        fullDataRowIdData = this.fullDataRowIdData;
    var rowid = radioOpts.checkRowKey,
        reserve = radioOpts.reserve;

    if (rowid) {
      if (fullDataRowIdData[rowid]) {
        this.setRadioRow(fullDataRowIdData[rowid].row);
      }

      if (reserve) {
        var rowkey = _tools.UtilTools.getRowkey(this);

        this.radioReserveRow = _defineProperty({}, rowkey, rowid);
      }
    }
  },

  /**
   * 单选，行选中事件
   */
  triggerRadioRowEvent: function triggerRadioRowEvent(evnt, params) {
    var radioOpts = this.radioOpts;
    var checkMethod = radioOpts.checkMethod;

    if (!checkMethod || checkMethod({
      row: params.row
    })) {
      var isChange = this.selectRow !== params.row;
      this.setRadioRow(params.row);

      if (isChange) {
        this.emitEvent('radio-change', params, evnt);
      }
    }
  },
  triggerCurrentRowEvent: function triggerCurrentRowEvent(evnt, params) {
    var isChange = this.currentRow !== params.row;
    this.setCurrentRow(params.row);

    if (isChange) {
      this.emitEvent('current-change', params, evnt);
    }
  },

  /**
   * 用于当前行，设置某一行为高亮状态
   * @param {Row} row 行对象
   */
  setCurrentRow: function setCurrentRow(row) {
    this.clearCurrentRow();
    this.clearCurrentColumn();
    this.currentRow = row;

    if (this.highlightCurrentRow) {
      _xeUtils.default.arrayEach(this.$el.querySelectorAll("[data-rowid=\"".concat(_tools.UtilTools.getRowid(this, row), "\"]")), function (elem) {
        return _tools.DomTools.addClass(elem, 'row--current');
      });
    }

    return this.$nextTick();
  },
  isCheckedByRadioRow: function isCheckedByRadioRow(row) {
    return this.selectRow === row;
  },

  /**
   * 用于单选行，设置某一行为选中状态
   * @param {Row} row 行对象
   */
  setRadioRow: function setRadioRow(row) {
    if (this.selectRow !== row) {
      this.clearRadioRow();
    }

    this.selectRow = row;
    this.handleRadioReserveRow(row);
    return this.$nextTick();
  },

  /**
   * 用于当前行，手动清空当前高亮的状态
   */
  clearCurrentRow: function clearCurrentRow() {
    this.currentRow = null;
    this.hoverRow = null;

    _xeUtils.default.arrayEach(this.$el.querySelectorAll('.row--current'), function (elem) {
      return _tools.DomTools.removeClass(elem, 'row--current');
    });

    return this.$nextTick();
  },

  /**
   * 用于单选行，手动清空用户的选择
   */
  clearRadioRow: function clearRadioRow() {
    this.selectRow = null;
    return this.$nextTick();
  },
  // 在 v3.0 中废弃 getCurrentRow
  getCurrentRow: function getCurrentRow() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getCurrentRow', 'getCurrentRecord']);

    return this.getCurrentRecord();
  },

  /**
   * 用于当前行，获取当前行的数据
   */
  getCurrentRecord: function getCurrentRecord() {
    return this.highlightCurrentRow ? this.currentRow : null;
  },
  // 在 v3.0 中废弃 getRadioRow
  getRadioRow: function getRadioRow() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getRadioRow', 'getRadioRecord']);

    return this.getRadioRecord();
  },

  /**
   * 用于单选行，获取当已选中的数据
   */
  getRadioRecord: function getRadioRecord() {
    return this.selectRow;
  },

  /**
   * 行 hover 事件
   */
  triggerHoverEvent: function triggerHoverEvent(evnt, _ref5) {
    var row = _ref5.row;
    this.setHoverRow(row);
  },
  setHoverRow: function setHoverRow(row) {
    var rowid = _tools.UtilTools.getRowid(this, row);

    this.clearHoverRow();

    _xeUtils.default.arrayEach(this.$el.querySelectorAll("[data-rowid=\"".concat(rowid, "\"]")), function (elem) {
      return _tools.DomTools.addClass(elem, 'row--hover');
    });

    this.hoverRow = row;
  },
  clearHoverRow: function clearHoverRow() {
    _xeUtils.default.arrayEach(this.$el.querySelectorAll('.vxe-body--row.row--hover'), function (elem) {
      return _tools.DomTools.removeClass(elem, 'row--hover');
    });

    this.hoverRow = null;
  },
  triggerHeaderCellClickEvent: function triggerHeaderCellClickEvent(evnt, params) {
    var _lastResizeTime = this._lastResizeTime,
        sortOpts = this.sortOpts;
    var column = params.column;
    var cell = evnt.currentTarget;

    var triggerResizable = _lastResizeTime && _lastResizeTime > Date.now() - 300;

    var triggerSort = _tools.DomTools.getEventTargetNode(evnt, cell, 'vxe-cell--sort').flag;

    var triggerFilter = _tools.DomTools.getEventTargetNode(evnt, cell, 'vxe-cell--filter').flag;

    if (sortOpts.trigger === 'cell' && !(triggerResizable || triggerSort || triggerFilter)) {
      this.triggerSortEvent(evnt, column, getNextSortOrder(this, column));
    }

    this.emitEvent('header-cell-click', Object.assign({
      triggerResizable: triggerResizable,
      triggerSort: triggerSort,
      triggerFilter: triggerFilter,
      cell: cell
    }, params), evnt);

    if (this.highlightCurrentColumn) {
      return this.setCurrentColumn(column);
    }

    return this.$nextTick();
  },
  triggerHeaderCellDBLClickEvent: function triggerHeaderCellDBLClickEvent(evnt, params) {
    this.emitEvent('header-cell-dblclick', Object.assign({
      cell: evnt.currentTarget
    }, params), evnt);
  },
  getCurrentColumn: function getCurrentColumn() {
    return this.highlightCurrentColumn ? this.currentColumn : null;
  },

  /**
   * 用于当前列，设置某列行为高亮状态
   * @param {ColumnConfig} column 列配置
   */
  setCurrentColumn: function setCurrentColumn(column) {
    this.clearCurrentRow();
    this.clearCurrentColumn();
    this.currentColumn = column;
    return this.$nextTick();
  },

  /**
   * 用于当前列，手动清空当前高亮的状态
   */
  clearCurrentColumn: function clearCurrentColumn() {
    this.currentColumn = null;
    return this.$nextTick();
  },
  checkValidate: function checkValidate(type) {
    if (_vXETable.default._valid) {
      return this.triggerValidate(type);
    }

    return this.$nextTick();
  },

  /**
   * 当单元格发生改变时
   * 如果存在规则，则校验
   */
  handleChangeCell: function handleChangeCell(evnt, params) {
    var _this27 = this;

    this.checkValidate('blur').catch(function (e) {
      return e;
    }).then(function () {
      _this27.handleActived(params, evnt).then(function () {
        return _this27.checkValidate('change');
      }).catch(function (e) {
        return e;
      });
    });
  },

  /**
   * 列点击事件
   * 如果是单击模式，则激活为编辑状态
   * 如果是双击模式，则单击后选中状态
   */
  triggerCellClickEvent: function triggerCellClickEvent(evnt, params) {
    var highlightCurrentRow = this.highlightCurrentRow,
        editStore = this.editStore,
        radioOpts = this.radioOpts,
        expandOpts = this.expandOpts,
        treeOpts = this.treeOpts,
        editConfig = this.editConfig,
        editOpts = this.editOpts,
        checkboxOpts = this.checkboxOpts,
        mouseConfig = this.mouseConfig,
        mouseOpts = this.mouseOpts;
    var actived = editStore.actived;
    var _params = params,
        row = _params.row,
        column = _params.column;
    var type = column.type,
        treeNode = column.treeNode;
    var isRadioType = type === 'radio'; // 在 v3.0 中废弃 selection

    var isCheckboxType = type === 'checkbox' || type === 'selection';
    var isExpandType = type === 'expand';
    var cell = evnt.currentTarget;

    var triggerRadio = isRadioType && _tools.DomTools.getEventTargetNode(evnt, cell, 'vxe-cell--radio').flag;

    var triggerCheckbox = isCheckboxType && _tools.DomTools.getEventTargetNode(evnt, cell, 'vxe-cell--checkbox').flag;

    var triggerTreeNode = treeNode && _tools.DomTools.getEventTargetNode(evnt, cell, 'vxe-tree--btn-wrapper').flag;

    var triggerExpandNode = isExpandType && _tools.DomTools.getEventTargetNode(evnt, cell, 'vxe-table--expanded').flag;

    params = Object.assign({
      cell: cell,
      triggerRadio: triggerRadio,
      triggerCheckbox: triggerCheckbox,
      triggerTreeNode: triggerTreeNode,
      triggerExpandNode: triggerExpandNode
    }, params); // 在 v3.0 中废弃 mouse-config.checked

    var isMouseChecked = mouseConfig && (mouseOpts.range || mouseOpts.checked); // 如果是展开行

    if (!triggerExpandNode && (expandOpts.trigger === 'row' || isExpandType && expandOpts.trigger === 'cell')) {
      this.triggerRowExpandEvent(evnt, params);
    } // 如果是树形表格


    if (treeOpts.trigger === 'row' || treeNode && treeOpts.trigger === 'cell') {
      this.triggerTreeExpandEvent(evnt, params);
    } // 如果点击了树节点


    if (!triggerTreeNode) {
      if (!triggerExpandNode) {
        // 如果是高亮行
        if (highlightCurrentRow) {
          if (!triggerCheckbox && !triggerRadio) {
            this.triggerCurrentRowEvent(evnt, params);
          }
        } // 如果是单选框


        if (!triggerRadio && (radioOpts.trigger === 'row' || isRadioType && radioOpts.trigger === 'cell')) {
          this.triggerRadioRowEvent(evnt, params);
        } // 如果是复选框


        if (!triggerCheckbox && (checkboxOpts.trigger === 'row' || isCheckboxType && checkboxOpts.trigger === 'cell')) {
          this.handleToggleCheckRowEvent(params, evnt);
        }
      } // 如果设置了单元格选中功能，则不会使用点击事件去处理（只能支持双击模式）


      if (!isMouseChecked) {
        if (editConfig) {
          if (editOpts.trigger === 'manual') {
            if (actived.args && actived.row === row && column !== actived.column) {
              this.handleChangeCell(evnt, params);
            }
          } else if (!actived.args || row !== actived.row || column !== actived.column) {
            if (editOpts.trigger === 'click') {
              this.handleChangeCell(evnt, params);
            } else if (editOpts.trigger === 'dblclick') {
              if (editOpts.mode === 'row' && actived.row === row) {
                this.handleChangeCell(evnt, params);
              }
            }
          }
        }
      }
    }

    this.emitEvent('cell-click', params, evnt);
  },

  /**
   * 列双击点击事件
   * 如果是双击模式，则激活为编辑状态
   */
  triggerCellDBLClickEvent: function triggerCellDBLClickEvent(evnt, params) {
    var _this28 = this;

    var editStore = this.editStore,
        editConfig = this.editConfig,
        editOpts = this.editOpts;
    var actived = editStore.actived;
    var cell = evnt.currentTarget;
    params.cell = cell;

    if (editConfig && editOpts.trigger === 'dblclick') {
      if (!actived.args || evnt.currentTarget !== actived.args.cell) {
        if (editOpts.mode === 'row') {
          this.checkValidate('blur').catch(function (e) {
            return e;
          }).then(function () {
            _this28.handleActived(params, evnt).then(function () {
              return _this28.checkValidate('change');
            }).catch(function (e) {
              return e;
            });
          });
        } else if (editOpts.mode === 'cell') {
          this.handleActived(params, evnt).then(function () {
            return _this28.checkValidate('change');
          }).catch(function (e) {
            return e;
          });
        }
      }
    }

    this.emitEvent('cell-dblclick', params, evnt);
  },
  handleDefaultSort: function handleDefaultSort() {
    var defaultSort = this.sortOpts.defaultSort;

    if (defaultSort) {
      var field = defaultSort.field,
          order = defaultSort.order;

      if (field && order) {
        var column = _xeUtils.default.find(this.visibleColumn, function (item) {
          return item.property === field;
        });

        if (column && !column.order) {
          this.sort(field, order);
        }
      }
    }
  },

  /**
   * 点击排序事件
   */
  triggerSortEvent: function triggerSortEvent(evnt, column, order) {
    var property = column.property;

    if (column.sortable || column.remoteSort) {
      var params = {
        column: column,
        property: property,
        field: property,
        prop: property,
        order: order,
        sortBy: column.sortBy,
        $table: this,
        $event: evnt
      };

      if (!order || column.order === order) {
        params.order = null;
        this.clearSort();
      } else {
        this.sort(property, order);
      }

      this.emitEvent('sort-change', params, evnt);
    }
  },
  sort: function sort(field, order) {
    var tableFullColumn = this.tableFullColumn,
        sortOpts = this.sortOpts;
    var column = this.getColumnByField(field);

    if (column) {
      var isRemote = _xeUtils.default.isBoolean(column.remoteSort) ? column.remoteSort : sortOpts.remote;

      if (column.sortable || column.remoteSort) {
        if (arguments.length <= 1) {
          order = getNextSortOrder(this, column);
        }

        if (column.order !== order) {
          tableFullColumn.forEach(function (column) {
            column.order = null;
          });
          column.order = order; // 如果是服务端排序，则跳过本地排序处理

          if (!isRemote) {
            this.handleTableData(true);
          }
        }

        return this.$nextTick().then(this.updateStyle);
      }
    }

    return this.$nextTick();
  },

  /**
   * 手动清空排序条件，数据会恢复成未排序的状态
   */
  clearSort: function clearSort() {
    this.tableFullColumn.forEach(function (column) {
      column.order = null;
    });
    return this.handleTableData(true);
  },
  getSortColumn: function getSortColumn() {
    return _xeUtils.default.find(this.visibleColumn, function (column) {
      return column.sortable && column.order;
    });
  },

  /**
   * 关闭筛选
   * @param {Event} evnt 事件
   */
  closeFilter: function closeFilter() {
    Object.assign(this.filterStore, {
      isAllSelected: false,
      isIndeterminate: false,
      options: [],
      visible: false
    });
    return this.$nextTick();
  },

  /**
   * 判断指定列是否为筛选状态，如果为空则判断所有列
   * @param {String} field 字段名
   */
  isFilter: function isFilter(field) {
    if (field) {
      var column = this.getColumnByField(field);
      return column.filters && column.filters.some(function (option) {
        return option.checked;
      });
    }

    return this.visibleColumn.some(function (column) {
      return column.filters && column.filters.some(function (option) {
        return option.checked;
      });
    });
  },

  /**
   * 判断展开行是否懒加载完成
   * @param {Row} row 行对象
   */
  isRowExpandLoaded: function isRowExpandLoaded(row) {
    var rest = this.fullAllDataRowMap.get(row);
    return rest && rest.expandLoaded;
  },
  clearRowExpandLoaded: function clearRowExpandLoaded(row) {
    var expandOpts = this.expandOpts,
        expandLazyLoadeds = this.expandLazyLoadeds,
        fullAllDataRowMap = this.fullAllDataRowMap;
    var lazy = expandOpts.lazy;
    var rest = fullAllDataRowMap.get(row);

    if (lazy && rest) {
      rest.expandLoaded = false;

      _xeUtils.default.remove(expandLazyLoadeds, function (item) {
        return row === item;
      });
    }

    return this.$nextTick();
  },

  /**
   * 重新加载展开行的内容
   * @param {Row} row 行对象
   */
  reloadExpandContent: function reloadExpandContent(row) {
    var _this29 = this;

    var expandOpts = this.expandOpts,
        expandLazyLoadeds = this.expandLazyLoadeds;
    var lazy = expandOpts.lazy;

    if (lazy && expandLazyLoadeds.indexOf(row) === -1) {
      this.clearRowExpandLoaded(row).then(function () {
        return _this29.handleAsyncRowExpand(row);
      });
    }

    return this.$nextTick();
  },

  /**
   * 展开行事件
   */
  triggerRowExpandEvent: function triggerRowExpandEvent(evnt, params) {
    var $listeners = this.$listeners,
        expandOpts = this.expandOpts,
        expandLazyLoadeds = this.expandLazyLoadeds,
        column = this.expandColumn;
    var row = params.row;
    var lazy = expandOpts.lazy;

    if (!lazy || expandLazyLoadeds.indexOf(row) === -1) {
      var expanded = !this.isExpandByRow(row);
      var columnIndex = this.getColumnIndex(column);
      var $columnIndex = this.$getColumnIndex(column);
      this.setRowExpand(row, expanded); // 在 v3.0 中废弃 toggle-expand-change

      if ($listeners['toggle-expand-change']) {
        _tools.UtilTools.warn('vxe.error.delEvent', ['toggle-expand-change', 'toggle-row-expand']);

        this.emitEvent('toggle-expand-change', {
          expanded: expanded,
          column: column,
          columnIndex: columnIndex,
          $columnIndex: $columnIndex,
          row: row,
          rowIndex: this.getRowIndex(row),
          $rowIndex: this.$getRowIndex(row)
        }, evnt);
      } else {
        this.emitEvent('toggle-row-expand', {
          expanded: expanded,
          column: column,
          columnIndex: columnIndex,
          $columnIndex: $columnIndex,
          row: row,
          rowIndex: this.getRowIndex(row),
          $rowIndex: this.$getRowIndex(row)
        }, evnt);
      }
    }
  },
  toggleRowExpansion: function toggleRowExpansion(row) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['toggleRowExpansion', 'toggleRowExpand']);

    return this.toggleRowExpand(row);
  },

  /**
   * 切换展开行
   */
  toggleRowExpand: function toggleRowExpand(row) {
    return this.setRowExpand(row, !this.isExpandByRow(row));
  },

  /**
   * 处理默认展开行
   */
  handleDefaultRowExpand: function handleDefaultRowExpand() {
    var expandOpts = this.expandOpts,
        fullDataRowIdData = this.fullDataRowIdData;
    var expandAll = expandOpts.expandAll,
        expandRowKeys = expandOpts.expandRowKeys;

    if (expandAll) {
      this.setAllRowExpand(true);
    } else if (expandRowKeys) {
      var defExpandeds = [];
      expandRowKeys.forEach(function (rowid) {
        if (fullDataRowIdData[rowid]) {
          defExpandeds.push(fullDataRowIdData[rowid].row);
        }
      });
      this.setRowExpand(defExpandeds, true);
    }
  },
  setAllRowExpansion: function setAllRowExpansion(expanded) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['setAllRowExpansion', 'setAllRowExpand']);

    return this.setAllRowExpand(expanded);
  },

  /**
   * 设置所有行的展开与否
   * @param {Boolean} expanded 是否展开
   */
  setAllRowExpand: function setAllRowExpand(expanded) {
    return this.setRowExpand(this.expandOpts.lazy ? this.tableData : this.tableFullData, expanded);
  },
  handleAsyncRowExpand: function handleAsyncRowExpand(row) {
    var _this30 = this;

    var rest = this.fullAllDataRowMap.get(row);
    return new Promise(function (resolve) {
      _this30.expandLazyLoadeds.push(row);

      _this30.expandOpts.loadMethod({
        $table: _this30,
        row: row,
        rowIndex: _this30.getRowIndex(row),
        $rowIndex: _this30.$getRowIndex(row)
      }).catch(function (e) {
        return e;
      }).then(function () {
        rest.expandLoaded = true;

        _xeUtils.default.remove(_this30.expandLazyLoadeds, function (item) {
          return item === row;
        });

        _this30.rowExpandeds.push(row);

        resolve(_this30.$nextTick().then(_this30.recalculate));
      });
    });
  },
  setRowExpansion: function setRowExpansion(rows, expanded) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['setRowExpansion', 'setRowExpand']);

    return this.setRowExpand(rows, expanded);
  },

  /**
   * 设置展开行，二个参数设置这一行展开与否
   * 支持单行
   * 支持多行
   * @param {Array/Row} rows 行数据
   * @param {Boolean} expanded 是否展开
   */
  setRowExpand: function setRowExpand(rows, expanded) {
    var _this31 = this;

    var fullAllDataRowMap = this.fullAllDataRowMap,
        expandLazyLoadeds = this.expandLazyLoadeds,
        expandOpts = this.expandOpts,
        column = this.expandColumn;
    var rowExpandeds = this.rowExpandeds;
    var lazy = expandOpts.lazy,
        accordion = expandOpts.accordion,
        toggleMethod = expandOpts.toggleMethod;
    var lazyRests = [];
    var columnIndex = this.getColumnIndex(column);
    var $columnIndex = this.$getColumnIndex(column);

    if (rows) {
      if (!_xeUtils.default.isArray(rows)) {
        rows = [rows];
      }

      if (accordion) {
        // 只能同时展开一个
        rowExpandeds = [];
        rows = rows.slice(rows.length - 1, rows.length);
      }

      var removeRows = toggleMethod ? rows.filter(function (row) {
        return toggleMethod({
          expanded: expanded,
          column: column,
          columnIndex: columnIndex,
          $columnIndex: $columnIndex,
          row: row,
          rowIndex: _this31.getRowIndex(row),
          $rowIndex: _this31.$getRowIndex(row)
        });
      }) : rows;

      if (expanded) {
        removeRows.forEach(function (row) {
          if (rowExpandeds.indexOf(row) === -1) {
            var rest = fullAllDataRowMap.get(row);
            var isLoad = lazy && !rest.expandLoaded && expandLazyLoadeds.indexOf(row) === -1;

            if (isLoad) {
              lazyRests.push(_this31.handleAsyncRowExpand(row));
            } else {
              rowExpandeds.push(row);
            }
          }
        });
      } else {
        _xeUtils.default.remove(rowExpandeds, function (row) {
          return removeRows.indexOf(row) > -1;
        });
      }
    }

    this.rowExpandeds = rowExpandeds;
    return Promise.all(lazyRests).then(this.recalculate);
  },
  // 在 v3.0 中废弃 getRecords
  hasRowExpand: function hasRowExpand(row) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['hasRowExpand', 'isExpandByRow']);

    return this.isExpandByRow(row);
  },

  /**
   * 判断行是否为展开状态
   * @param {Row} row 行对象
   */
  isExpandByRow: function isExpandByRow(row) {
    return this.rowExpandeds.indexOf(row) > -1;
  },

  /**
   * 手动清空展开行状态，数据会恢复成未展开的状态
   */
  clearRowExpand: function clearRowExpand() {
    var _this32 = this;

    var isExists = this.rowExpandeds.length;
    this.rowExpandeds = [];
    return this.$nextTick().then(function () {
      return isExists ? _this32.recalculate() : 0;
    });
  },
  getRowExpandRecords: function getRowExpandRecords() {
    return this.rowExpandeds.slice(0);
  },
  getTreeExpandRecords: function getTreeExpandRecords() {
    return this.treeExpandeds.slice(0);
  },

  /**
   * 获取数表格状态
   */
  getTreeStatus: function getTreeStatus() {
    if (this.treeConfig) {
      return {
        config: this.treeOpts,
        rowExpandeds: this.getTreeExpandRecords()
      };
    }

    return null;
  },

  /**
   * 判断树节点是否懒加载完成
   * @param {Row} row 行对象
   */
  isTreeExpandLoaded: function isTreeExpandLoaded(row) {
    var rest = this.fullAllDataRowMap.get(row);
    return rest && rest.treeLoaded;
  },
  clearTreeExpandLoaded: function clearTreeExpandLoaded(row) {
    var treeOpts = this.treeOpts,
        treeExpandeds = this.treeExpandeds,
        fullAllDataRowMap = this.fullAllDataRowMap;
    var lazy = treeOpts.lazy;
    var rest = fullAllDataRowMap.get(row);

    if (lazy && rest) {
      rest.treeLoaded = false;

      _xeUtils.default.remove(treeExpandeds, function (item) {
        return row === item;
      });
    }

    return this.$nextTick();
  },

  /**
   * 重新加载树的子节点
   * @param {Row} row 行对象
   */
  reloadTreeChilds: function reloadTreeChilds(row) {
    var _this33 = this;

    var treeOpts = this.treeOpts,
        treeLazyLoadeds = this.treeLazyLoadeds;
    var lazy = treeOpts.lazy,
        hasChild = treeOpts.hasChild;

    if (lazy && row[hasChild] && treeLazyLoadeds.indexOf(row) === -1) {
      this.clearTreeExpandLoaded(row).then(function () {
        return _this33.handleAsyncTreeExpandChilds(row);
      });
    }

    return this.$nextTick();
  },

  /**
   * 展开树节点事件
   */
  triggerTreeExpandEvent: function triggerTreeExpandEvent(evnt, params) {
    var $listeners = this.$listeners,
        treeOpts = this.treeOpts,
        treeLazyLoadeds = this.treeLazyLoadeds,
        column = this.expandColumn;
    var row = params.row;
    var lazy = treeOpts.lazy;

    if (!lazy || treeLazyLoadeds.indexOf(row) === -1) {
      var expanded = !this.isTreeExpandByRow(row);
      var columnIndex = this.getColumnIndex(column);
      var $columnIndex = this.$getColumnIndex(column);
      this.setTreeExpand(row, expanded); // 在 v3.0 中废弃 toggle-tree-change

      if ($listeners['toggle-tree-change']) {
        _tools.UtilTools.warn('vxe.error.delEvent', ['toggle-tree-change', 'toggle-tree-expand']);

        this.emitEvent('toggle-tree-change', {
          expanded: expanded,
          column: column,
          columnIndex: columnIndex,
          $columnIndex: $columnIndex,
          row: row
        }, evnt);
      } else {
        this.emitEvent('toggle-tree-expand', {
          expanded: expanded,
          column: column,
          columnIndex: columnIndex,
          $columnIndex: $columnIndex,
          row: row
        }, evnt);
      }
    }
  },
  toggleTreeExpansion: function toggleTreeExpansion(row) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['toggleTreeExpansion', 'toggleTreeExpand']);

    return this.toggleTreeExpand(row);
  },

  /**
   * 切换/展开树节点
   */
  toggleTreeExpand: function toggleTreeExpand(row) {
    return this.setTreeExpand(row, !this.isTreeExpandByRow(row));
  },

  /**
   * 处理默认展开树节点
   */
  handleDefaultTreeExpand: function handleDefaultTreeExpand() {
    var treeConfig = this.treeConfig,
        treeOpts = this.treeOpts,
        tableFullData = this.tableFullData;

    if (treeConfig) {
      var expandAll = treeOpts.expandAll,
          expandRowKeys = treeOpts.expandRowKeys;

      if (expandAll) {
        this.setAllTreeExpand(true);
      } else if (expandRowKeys) {
        var defExpandeds = [];

        var rowkey = _tools.UtilTools.getRowkey(this);

        expandRowKeys.forEach(function (rowid) {
          var matchObj = _xeUtils.default.findTree(tableFullData, function (item) {
            return rowid === _xeUtils.default.get(item, rowkey);
          }, treeOpts);

          if (matchObj) {
            defExpandeds.push(matchObj.item);
          }
        });
        this.setTreeExpand(defExpandeds, true);
      }
    }
  },
  handleAsyncTreeExpandChilds: function handleAsyncTreeExpandChilds(row) {
    var _this34 = this;

    var fullAllDataRowMap = this.fullAllDataRowMap,
        treeExpandeds = this.treeExpandeds,
        treeOpts = this.treeOpts,
        treeLazyLoadeds = this.treeLazyLoadeds,
        checkboxOpts = this.checkboxOpts;
    var loadMethod = treeOpts.loadMethod,
        children = treeOpts.children;
    var checkStrictly = checkboxOpts.checkStrictly;
    var rest = fullAllDataRowMap.get(row);
    return new Promise(function (resolve) {
      treeLazyLoadeds.push(row);
      loadMethod({
        $table: _this34,
        row: row
      }).catch(function () {
        return [];
      }).then(function (childs) {
        rest.treeLoaded = true;

        _xeUtils.default.remove(treeLazyLoadeds, function (item) {
          return item === row;
        });

        if (!_xeUtils.default.isArray(childs)) {
          childs = [];
        }

        if (childs) {
          row[children] = childs;

          _this34.appendTreeCache(row, childs);

          if (childs.length && treeExpandeds.indexOf(row) === -1) {
            treeExpandeds.push(row);
          } // 如果当前节点已选中，则展开后子节点也被选中


          if (!checkStrictly && _this34.isCheckedByCheckboxRow(row)) {
            _this34.setCheckboxRow(childs, true);
          }
        }

        resolve(_this34.$nextTick().then(_this34.recalculate));
      });
    });
  },
  setAllTreeExpansion: function setAllTreeExpansion(expanded) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['setAllTreeExpansion', 'setAllTreeExpand']);

    return this.setAllTreeExpand(expanded);
  },

  /**
   * 设置所有树节点的展开与否
   * @param {Boolean} expanded 是否展开
   */
  setAllTreeExpand: function setAllTreeExpand(expanded) {
    var tableFullData = this.tableFullData,
        treeOpts = this.treeOpts;
    var lazy = treeOpts.lazy,
        children = treeOpts.children;
    var expandeds = [];

    _xeUtils.default.eachTree(tableFullData, function (row) {
      var rowChildren = row[children];

      if (lazy || rowChildren && rowChildren.length) {
        expandeds.push(row);
      }
    }, treeOpts);

    return this.setTreeExpand(expandeds, expanded);
  },
  setTreeExpansion: function setTreeExpansion(rows, expanded) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['setTreeExpansion', 'setTreeExpand']);

    return this.setTreeExpand(rows, expanded);
  },

  /**
   * 设置展开树形节点，二个参数设置这一行展开与否
   * 支持单行
   * 支持多行
   * @param {Array/Row} rows 行数据
   * @param {Boolean} expanded 是否展开
   */
  setTreeExpand: function setTreeExpand(rows, expanded) {
    var _this35 = this;

    var fullAllDataRowMap = this.fullAllDataRowMap,
        tableFullData = this.tableFullData,
        treeExpandeds = this.treeExpandeds,
        treeOpts = this.treeOpts,
        treeLazyLoadeds = this.treeLazyLoadeds,
        column = this.expandColumn;
    var lazy = treeOpts.lazy,
        hasChild = treeOpts.hasChild,
        children = treeOpts.children,
        accordion = treeOpts.accordion,
        toggleMethod = treeOpts.toggleMethod;
    var result = [];
    var columnIndex = this.getColumnIndex(column);
    var $columnIndex = this.$getColumnIndex(column);

    if (rows) {
      if (!_xeUtils.default.isArray(rows)) {
        rows = [rows];
      }

      if (rows.length) {
        if (accordion) {
          rows = rows.slice(rows.length - 1, rows.length); // 同一级只能展开一个

          var matchObj = _xeUtils.default.findTree(tableFullData, function (item) {
            return item === rows[0];
          }, treeOpts);

          _xeUtils.default.remove(treeExpandeds, function (item) {
            return matchObj.items.indexOf(item) > -1;
          });
        }

        var removeRows = toggleMethod ? rows.filter(function (row) {
          return toggleMethod({
            expanded: expanded,
            column: column,
            columnIndex: columnIndex,
            $columnIndex: $columnIndex,
            row: row
          });
        }) : rows;

        if (expanded) {
          removeRows.forEach(function (row) {
            if (treeExpandeds.indexOf(row) === -1) {
              var rest = fullAllDataRowMap.get(row);
              var isLoad = lazy && row[hasChild] && !rest.treeLoaded && treeLazyLoadeds.indexOf(row) === -1; // 是否使用懒加载

              if (isLoad) {
                result.push(_this35.handleAsyncTreeExpandChilds(row));
              } else {
                if (row[children] && row[children].length) {
                  treeExpandeds.push(row);
                }
              }
            }
          });
        } else {
          _xeUtils.default.remove(treeExpandeds, function (row) {
            return removeRows.indexOf(row) > -1;
          });
        }

        return Promise.all(result).then(this.recalculate);
      }
    }

    return Promise.resolve();
  },
  // 在 v3.0 中废弃 hasTreeExpand
  hasTreeExpand: function hasTreeExpand(row) {
    _tools.UtilTools.warn('vxe.error.delFunc', ['hasTreeExpand', 'isTreeExpandByRow']);

    return this.isTreeExpandByRow(row);
  },

  /**
   * 判断行是否为树形节点展开状态
   * @param {Row} row 行对象
   */
  isTreeExpandByRow: function isTreeExpandByRow(row) {
    return this.treeExpandeds.indexOf(row) > -1;
  },

  /**
   * 手动清空树形节点的展开状态，数据会恢复成未展开的状态
   */
  clearTreeExpand: function clearTreeExpand() {
    var _this36 = this;

    var isExists = this.treeExpandeds.length;
    this.treeExpandeds = [];
    return this.$nextTick().then(function () {
      return isExists ? _this36.recalculate() : 0;
    });
  },
  getVirtualScroller: function getVirtualScroller() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getVirtualScroller', 'getScroll']);

    return this.getScroll();
  },
  getTableScroll: function getTableScroll() {
    _tools.UtilTools.warn('vxe.error.delFunc', ['getTableScroll', 'getScroll']);

    return this.getScroll();
  },

  /**
   * 获取表格的滚动状态
   */
  getScroll: function getScroll() {
    var $refs = this.$refs,
        scrollXLoad = this.scrollXLoad,
        scrollYLoad = this.scrollYLoad;
    var bodyElem = $refs.tableBody.$el;
    return {
      virtualX: scrollXLoad,
      virtualY: scrollYLoad,
      scrollTop: bodyElem.scrollTop,
      scrollLeft: bodyElem.scrollLeft
    };
  },

  /**
   * 横向 X 可视渲染事件处理
   */
  triggerScrollXEvent: function triggerScrollXEvent() {
    this.loadScrollXData();
  },
  loadScrollXData: function loadScrollXData(force) {
    var $refs = this.$refs,
        visibleColumn = this.visibleColumn,
        scrollXStore = this.scrollXStore;
    var startIndex = scrollXStore.startIndex,
        renderSize = scrollXStore.renderSize,
        offsetSize = scrollXStore.offsetSize,
        visibleSize = scrollXStore.visibleSize;
    var scrollBodyElem = $refs.tableBody.$el;
    var scrollLeft = scrollBodyElem.scrollLeft;
    var toVisibleIndex = 0;
    var width = 0;
    var preload = force || false;
    var colLen = visibleColumn.length;

    for (var colIndex = 0; colIndex < colLen; colIndex++) {
      width += visibleColumn[colIndex].renderWidth;

      if (scrollLeft < width) {
        toVisibleIndex = colIndex;
        break;
      }
    }

    if (force || scrollXStore.visibleIndex !== toVisibleIndex) {
      var marginSize = Math.min(Math.floor((renderSize - visibleSize) / 2), visibleSize);

      if (scrollXStore.visibleIndex === toVisibleIndex) {
        scrollXStore.startIndex = toVisibleIndex;
      } else if (scrollXStore.visibleIndex > toVisibleIndex) {
        // 向左
        preload = toVisibleIndex - offsetSize <= startIndex;

        if (preload) {
          scrollXStore.startIndex = Math.max(0, Math.max(0, toVisibleIndex - marginSize));
        }
      } else {
        // 向右
        preload = toVisibleIndex + visibleSize + offsetSize >= startIndex + renderSize;

        if (preload) {
          scrollXStore.startIndex = Math.max(0, Math.min(visibleColumn.length - renderSize, toVisibleIndex - marginSize));
        }
      }

      if (preload) {
        this.updateScrollXData();
      }

      scrollXStore.visibleIndex = toVisibleIndex;
    }

    this.clostTooltip();
  },

  /**
   * 纵向 Y 可视渲染事件处理
   */
  triggerScrollYEvent: function triggerScrollYEvent(evnt) {
    // webkit 浏览器使用最佳的渲染方式
    if (isWebkit && this.scrollYStore.adaptive) {
      this.loadScrollYData(evnt);
    } else {
      this.debounceScrollY(evnt);
    }
  },
  debounceScrollY: _xeUtils.default.debounce(function (evnt) {
    this.loadScrollYData(evnt);
  }, debounceScrollYDuration, {
    leading: false,
    trailing: true
  }),

  /**
   * 纵向 Y 可视渲染处理
   */
  loadScrollYData: function loadScrollYData(evnt) {
    var afterFullData = this.afterFullData,
        scrollYStore = this.scrollYStore,
        isLoadData = this.isLoadData;
    var startIndex = scrollYStore.startIndex,
        renderSize = scrollYStore.renderSize,
        offsetSize = scrollYStore.offsetSize,
        visibleSize = scrollYStore.visibleSize,
        rowHeight = scrollYStore.rowHeight;
    var scrollBodyElem = evnt.target;
    var scrollTop = scrollBodyElem.scrollTop;
    var toVisibleIndex = Math.ceil(scrollTop / rowHeight);
    var preload = false;

    if (isLoadData || scrollYStore.visibleIndex !== toVisibleIndex) {
      var marginSize = Math.min(Math.floor((renderSize - visibleSize) / 2), visibleSize);

      if (scrollYStore.visibleIndex > toVisibleIndex) {
        // 向上
        preload = toVisibleIndex - offsetSize <= startIndex;

        if (preload) {
          scrollYStore.startIndex = Math.max(0, toVisibleIndex - Math.max(marginSize, renderSize - visibleSize));
        }
      } else {
        // 向下
        preload = toVisibleIndex + visibleSize + offsetSize >= startIndex + renderSize;

        if (preload) {
          scrollYStore.startIndex = Math.max(0, Math.min(afterFullData.length - renderSize, toVisibleIndex - marginSize));
        }
      }

      if (preload) {
        this.updateScrollYData();
      }

      scrollYStore.visibleIndex = toVisibleIndex;
      this.isLoadData = false;
    }
  },
  computeRowHeight: function computeRowHeight() {
    var tableBody = this.$refs.tableBody;
    var tableBodyElem = tableBody ? tableBody.$el : null;
    var tableHeader = this.$refs.tableHeader;
    var rowHeight;

    if (tableBodyElem) {
      var firstTrElem = tableBodyElem.querySelector('tbody>tr');

      if (!firstTrElem && tableHeader) {
        firstTrElem = tableHeader.$el.querySelector('thead>tr');
      }

      if (firstTrElem) {
        rowHeight = firstTrElem.clientHeight;
      }
    } // 默认的行高


    if (!rowHeight) {
      rowHeight = this.rowHeightMaps[this.vSize || 'default'];
    }

    this.rowHeight = rowHeight;
  },
  // 计算可视渲染相关数据
  computeScrollLoad: function computeScrollLoad() {
    var _this37 = this;

    return this.$nextTick().then(function () {
      var vSize = _this37.vSize,
          scrollXLoad = _this37.scrollXLoad,
          scrollYLoad = _this37.scrollYLoad,
          sYOpts = _this37.sYOpts,
          scrollYStore = _this37.scrollYStore,
          sXOpts = _this37.sXOpts,
          scrollXStore = _this37.scrollXStore,
          visibleColumn = _this37.visibleColumn,
          rowHeightMaps = _this37.rowHeightMaps;
      var tableBody = _this37.$refs.tableBody;
      var tableBodyElem = tableBody ? tableBody.$el : null;
      var tableHeader = _this37.$refs.tableHeader;

      if (tableBodyElem) {
        // 计算 X 逻辑
        if (scrollXLoad) {
          var bodyWidth = tableBodyElem.clientWidth;

          var visibleXSize = _xeUtils.default.toNumber(sXOpts.vSize);

          if (!sXOpts.vSize) {
            var len = visibleXSize = visibleColumn.length;
            var countWidth = 0;
            var column;

            for (var colIndex = 0; colIndex < len; colIndex++) {
              column = visibleColumn[colIndex];
              countWidth += column.renderWidth;

              if (countWidth > bodyWidth) {
                visibleXSize = colIndex + 1;
                break;
              }
            }
          }

          scrollXStore.visibleSize = visibleXSize; // 自动优化

          if (!sXOpts.oSize) {
            scrollXStore.offsetSize = visibleXSize;
          }

          if (!sXOpts.rSize) {
            scrollXStore.renderSize = Math.max(8, visibleXSize + 6);
          }

          _this37.updateScrollXData();
        } else {
          _this37.updateScrollXSpace();
        } // 计算 Y 逻辑


        if (scrollYLoad) {
          var rHeight;

          if (sYOpts.rHeight) {
            rHeight = sYOpts.rHeight;
          } else {
            var firstTrElem = tableBodyElem.querySelector('tbody>tr');

            if (!firstTrElem && tableHeader) {
              firstTrElem = tableHeader.$el.querySelector('thead>tr');
            }

            if (firstTrElem) {
              rHeight = firstTrElem.clientHeight;
            }
          } // 默认的行高


          if (!rHeight) {
            rHeight = rowHeightMaps[vSize || 'default'];
          }

          var visibleYSize = _xeUtils.default.toNumber(sYOpts.vSize || Math.ceil(tableBodyElem.clientHeight / rHeight));

          scrollYStore.visibleSize = visibleYSize;
          scrollYStore.rowHeight = rHeight; // 自动优化

          if (!sYOpts.oSize) {
            scrollYStore.offsetSize = visibleYSize;
          }

          if (!sYOpts.rSize) {
            scrollYStore.renderSize = Math.max(6, browse.edge ? visibleYSize * 10 : isWebkit ? visibleYSize + 2 : visibleYSize * 6);
          }

          _this37.updateScrollYData();
        } else {
          _this37.updateScrollYSpace();
        }
      }

      _this37.$nextTick(_this37.updateStyle);
    });
  },
  updateScrollXData: function updateScrollXData() {
    var visibleColumn = this.visibleColumn,
        scrollXStore = this.scrollXStore;
    this.tableColumn = visibleColumn.slice(scrollXStore.startIndex, scrollXStore.startIndex + scrollXStore.renderSize);
    this.updateScrollXSpace();
  },
  // 更新横向 X 可视渲染上下剩余空间大小
  updateScrollXSpace: function updateScrollXSpace() {
    var $refs = this.$refs,
        elemStore = this.elemStore,
        visibleColumn = this.visibleColumn,
        scrollXStore = this.scrollXStore,
        scrollXLoad = this.scrollXLoad,
        tableWidth = this.tableWidth,
        scrollbarWidth = this.scrollbarWidth;
    var tableHeader = $refs.tableHeader,
        tableBody = $refs.tableBody,
        tableFooter = $refs.tableFooter;
    var headerElem = tableHeader ? tableHeader.$el.querySelector('.vxe-table--header') : null;
    var bodyElem = tableBody.$el.querySelector('.vxe-table--body');
    var footerElem = tableFooter ? tableFooter.$el.querySelector('.vxe-table--footer') : null;
    var leftSpaceWidth = visibleColumn.slice(0, scrollXStore.startIndex).reduce(function (previous, column) {
      return previous + column.renderWidth;
    }, 0);
    var marginLeft = '';

    if (scrollXLoad) {
      marginLeft = "".concat(leftSpaceWidth, "px");
    }

    if (headerElem) {
      headerElem.style.marginLeft = marginLeft;
    }

    bodyElem.style.marginLeft = marginLeft;

    if (footerElem) {
      footerElem.style.marginLeft = marginLeft;
    }

    var containerList = ['main'];
    containerList.forEach(function (name) {
      var layoutList = ['header', 'body', 'footer'];
      layoutList.forEach(function (layout) {
        var xSpaceElem = elemStore["".concat(name, "-").concat(layout, "-xSpace")];

        if (xSpaceElem) {
          xSpaceElem.style.width = scrollXLoad ? "".concat(tableWidth + (layout === 'header' ? scrollbarWidth : 0), "px") : '';
        }
      });
    });
    this.$nextTick(this.updateStyle);
  },
  updateScrollYData: function updateScrollYData() {
    this.handleTableData();
    this.updateScrollYSpace();
  },
  // 更新纵向 Y 可视渲染上下剩余空间大小
  updateScrollYSpace: function updateScrollYSpace() {
    var elemStore = this.elemStore,
        scrollYStore = this.scrollYStore,
        scrollYLoad = this.scrollYLoad,
        afterFullData = this.afterFullData;
    var bodyHeight = afterFullData.length * scrollYStore.rowHeight;
    var topSpaceHeight = Math.max(scrollYStore.startIndex * scrollYStore.rowHeight, 0);
    var containerList = ['main', 'left', 'right'];
    var marginTop = '';
    var ySpaceHeight = '';

    if (scrollYLoad) {
      marginTop = "".concat(topSpaceHeight, "px");
      ySpaceHeight = "".concat(bodyHeight, "px");
    }

    containerList.forEach(function (name) {
      var layoutList = ['header', 'body', 'footer'];
      var tableElem = elemStore["".concat(name, "-body-table")];

      if (tableElem) {
        tableElem.style.marginTop = marginTop;
      }

      layoutList.forEach(function (layout) {
        var ySpaceElem = elemStore["".concat(name, "-").concat(layout, "-ySpace")];

        if (ySpaceElem) {
          ySpaceElem.style.height = ySpaceHeight;
        }
      });
    });
    this.$nextTick(this.updateStyle);
  },

  /**
   * 如果有滚动条，则滚动到对应的位置
   * @param {Number} scrollLeft 左距离
   * @param {Number} scrollTop 上距离
   */
  scrollTo: function scrollTo(scrollLeft, scrollTop) {
    var _this38 = this;

    var $refs = this.$refs;
    var bodyElem = $refs.tableBody.$el;
    var istriggerBody;

    if (_xeUtils.default.isNumber(scrollLeft)) {
      var footerElem = $refs.tableFooter ? $refs.tableFooter.$el : null;

      if (footerElem) {
        footerElem.scrollLeft = scrollLeft;

        _tools.DomTools.triggerEvent(footerElem, 'scroll');
      } else {
        istriggerBody = true;
        bodyElem.scrollLeft = scrollLeft;
      }
    }

    if (_xeUtils.default.isNumber(scrollTop)) {
      var rightBodyElem = $refs.rightBody ? $refs.rightBody.$el : null;

      if (rightBodyElem) {
        rightBodyElem.scrollTop = scrollTop;

        _tools.DomTools.triggerEvent(rightBodyElem, 'scroll');
      } else {
        istriggerBody = true;
        bodyElem.scrollTop = scrollTop;
      }
    }

    if (istriggerBody) {
      _tools.DomTools.triggerEvent(bodyElem, 'scroll');
    }

    if (this.scrollXLoad || this.scrollYLoad) {
      return new Promise(function (resolve) {
        return setTimeout(function () {
          return resolve(_this38.$nextTick());
        }, 50);
      });
    }

    return this.$nextTick();
  },

  /**
   * 如果有滚动条，则滚动到对应的行
   * @param {Row} row 行对象
   * @param {ColumnConfig} column 列配置
   */
  scrollToRow: function scrollToRow(row, column) {
    var rest = [];

    if (row) {
      if (this.treeConfig) {
        rest.push(this.scrollToTreeRow(row));
      } else {
        rest.push(_tools.DomTools.rowToVisible(this, row));
      }
    }

    rest.push(this.scrollToColumn(column));
    return Promise.all(rest);
  },

  /**
   * 如果有滚动条，则滚动到对应的列
   * @param {ColumnConfig} column 列配置
   */
  scrollToColumn: function scrollToColumn(column) {
    if (column && this.fullColumnMap.has(column)) {
      return _tools.DomTools.colToVisible(this, column);
    }

    return this.$nextTick();
  },

  /**
   * 对于树形结构中，可以直接滚动到指定深层节点中
   * 对于某些特定的场景可能会用到，比如定位到某一节点
   * @param {Row} row 行对象
   */
  scrollToTreeRow: function scrollToTreeRow(row) {
    var _this39 = this;

    var tableFullData = this.tableFullData,
        treeConfig = this.treeConfig,
        treeOpts = this.treeOpts;

    if (treeConfig) {
      var matchObj = _xeUtils.default.findTree(tableFullData, function (item) {
        return item === row;
      }, treeOpts);

      if (matchObj) {
        var nodes = matchObj.nodes;
        nodes.forEach(function (row, index) {
          if (index < nodes.length - 1 && !_this39.isTreeExpandByRow(row)) {
            _this39.setTreeExpand(row, true);
          }
        });
      }
    }

    return this.$nextTick();
  },

  /**
   * 手动清除滚动相关信息，还原到初始状态
   */
  clearScroll: function clearScroll() {
    var _this40 = this;

    var $refs = this.$refs;
    var tableBody = $refs.tableBody;
    var tableBodyElem = tableBody ? tableBody.$el : null;
    var tableFooter = $refs.tableFooter;
    var tableFooterElem = tableFooter ? tableFooter.$el : null;
    var footerTargetElem = tableFooterElem || tableBodyElem;

    if (tableBodyElem) {
      tableBodyElem.scrollTop = 0;
    }

    if (footerTargetElem) {
      footerTargetElem.scrollLeft = 0;
    }

    return new Promise(function (resolve) {
      return setTimeout(function () {
        return resolve(_this40.$nextTick());
      });
    });
  },

  /**
   * 更新表尾合计
   */
  updateFooter: function updateFooter() {
    var showFooter = this.showFooter,
        visibleColumn = this.visibleColumn,
        footerMethod = this.footerMethod;

    if (showFooter && footerMethod) {
      this.footerData = visibleColumn.length ? footerMethod({
        columns: visibleColumn,
        data: this.afterFullData
      }) : [];
    }

    return this.$nextTick();
  },

  /**
   * 更新列状态
   * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一列编辑状态
   * 如果单元格配置了校验规则，则会进行校验
   */
  updateStatus: function updateStatus(scope, cellValue) {
    var _this41 = this;

    var customVal = !_xeUtils.default.isUndefined(cellValue);
    return this.$nextTick().then(function () {
      var $refs = _this41.$refs,
          tableData = _this41.tableData,
          editRules = _this41.editRules,
          validStore = _this41.validStore;

      if (scope && $refs.tableBody && editRules) {
        var row = scope.row,
            column = scope.column;
        var type = 'change';

        if (_this41.hasCellRules(type, row, column)) {
          var rowIndex = tableData.indexOf(row);

          var cell = _tools.DomTools.getCell(_this41, {
            row: row,
            rowIndex: rowIndex,
            column: column
          });

          if (cell) {
            return _this41.validCellRules(type, row, column, cellValue).then(function () {
              if (customVal && validStore.visible) {
                _tools.UtilTools.setCellValue(row, column, cellValue);
              }

              _this41.clearValidate();
            }).catch(function (_ref6) {
              var rule = _ref6.rule;

              if (customVal) {
                _tools.UtilTools.setCellValue(row, column, cellValue);
              }

              _this41.showValidTooltip({
                rule: rule,
                row: row,
                column: column,
                cell: cell
              });
            });
          }
        }
      }
    });
  },
  updateZindex: function updateZindex() {
    if (this.zIndex) {
      this.tZindex = this.zIndex;
    } else if (this.tZindex < _tools.UtilTools.getLastZIndex()) {
      this.tZindex = _tools.UtilTools.nextZIndex();
    }
  },
  emitEvent: function emitEvent(type, params, evnt) {
    this.$emit(type, Object.assign({
      $table: this,
      $grid: this.$xegrid,
      $event: evnt
    }, params), evnt);
  },
  focus: function focus() {
    this.isActivated = true;
    return this.$nextTick();
  },
  blur: function blur() {
    this.isActivated = false;
    return this.$nextTick();
  },
  // 检查触发源是否属于目标节点
  getEventTargetNode: _tools.DomTools.getEventTargetNode,

  /*************************
   * Publish methods
   *************************/
  // 与工具栏对接
  connect: function connect($toolbar) {
    if ($toolbar && $toolbar.syncUpdate) {
      $toolbar.syncUpdate({
        collectColumn: this.collectColumn,
        $table: this
      });
      this.$toolbar = $toolbar;
    } else {
      _tools.UtilTools.error('vxe.error.barUnableLink');
    }
  }
  /*************************
   * Publish methods
   *************************/

}; // Module methods

var funcs = 'setFilter,filter,clearFilter,closeMenu,getMouseSelecteds,getMouseCheckeds,getSelectedCell,getSelectedRanges,clearCopyed,clearChecked,clearHeaderChecked,clearIndexChecked,clearSelected,insert,insertAt,remove,removeSelecteds,removeCheckboxRow,removeRadioRow,removeCurrentRow,getRecordset,getInsertRecords,getRemoveRecords,getUpdateRecords,clearActived,getActiveRecord,getActiveRow,hasActiveRow,isActiveByRow,setActiveRow,setActiveCell,setSelectCell,clearValidate,fullValidate,validate,exportCsv,openExport,exportData,openImport,importData,readFile,importByFile,print'.split(',');
funcs.forEach(function (name) {
  Methods[name] = function () {
    return this["_".concat(name)] ? this["_".concat(name)].apply(this, arguments) : null;
  };
});
var _default = Methods;
exports.default = _default;