"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderOption = renderOption;
exports.renderOptgroup = renderOptgroup;
exports.default = void 0;

var _input = _interopRequireDefault(require("../../input/src/input"));

var _conf = _interopRequireDefault(require("../../conf"));

var _util = require("./util");

var _tools = require("../../tools");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function findOffsetOption(groupList, optionValue, isUpArrow) {
  var prevOption;
  var firstOption;
  var isMatchOption = false;

  for (var gIndex = 0; gIndex < groupList.length; gIndex++) {
    var group = groupList[gIndex];

    if (group.options) {
      for (var index = 0; index < group.options.length; index++) {
        var option = group.options[index];

        if (!firstOption) {
          firstOption = option;
        }

        if (isUpArrow) {
          if (optionValue === option.value) {
            return {
              offsetOption: prevOption,
              firstOption: firstOption
            };
          }
        } else {
          if (isMatchOption) {
            return {
              offsetOption: option,
              firstOption: firstOption
            };
          }

          if (optionValue === option.value) {
            isMatchOption = true;
          }
        }

        prevOption = option;
      }
    } else {
      if (!firstOption) {
        firstOption = group;
      }

      if (isUpArrow) {
        if (optionValue === group.value) {
          return {
            offsetOption: prevOption,
            firstOption: firstOption
          };
        }
      } else {
        if (isMatchOption) {
          return {
            offsetOption: group,
            firstOption: firstOption
          };
        }

        if (optionValue === group.value) {
          isMatchOption = true;
        }
      }

      prevOption = group;
    }
  }

  return {
    firstOption: firstOption
  };
}

function findOption(groupList, optionValue) {
  for (var gIndex = 0; gIndex < groupList.length; gIndex++) {
    var group = groupList[gIndex];

    if (group.options) {
      for (var index = 0; index < group.options.length; index++) {
        var option = group.options[index];

        if (optionValue === option.value) {
          return option;
        }
      }
    } else {
      if (optionValue === group.value) {
        return group;
      }
    }
  }
}

function renderOption(h, _vm, options, group) {
  var optkey = _vm.optkey,
      value = _vm.value,
      currentValue = _vm.currentValue,
      _vm$optionGroupProps = _vm.optionGroupProps,
      optionGroupProps = _vm$optionGroupProps === void 0 ? {} : _vm$optionGroupProps,
      _vm$optionProps = _vm.optionProps,
      optionProps = _vm$optionProps === void 0 ? {} : _vm$optionProps;
  var groupDisabled = optionGroupProps.disabled || 'disabled';
  var labelProp = optionProps.label || 'label';
  var valueProp = optionProps.value || 'value';
  var disabledProp = optionProps.disabled || 'disabled';
  return options ? options.map(function (option, cIndex) {
    var isDisabled = group && group[groupDisabled] || option[disabledProp];
    var optionValue = option[valueProp];
    var optid = (0, _util.getOptid)(_vm, option);
    return h('div', {
      key: optkey ? optid : cIndex,
      class: ['vxe-select-option', {
        'is--disabled': isDisabled,
        'is--checked': value === optionValue,
        'is--hover': currentValue === optionValue
      }],
      attrs: {
        'data-optid': optid
      },
      on: {
        click: function click(evnt) {
          if (!isDisabled) {
            _vm.changeOptionEvent(evnt, optionValue);
          }
        },
        mouseenter: function mouseenter() {
          if (!isDisabled) {
            _vm.setCurrentOption({
              value: optionValue
            });
          }
        }
      }
    }, _tools.UtilTools.formatText(_tools.UtilTools.getFuncText(option[labelProp])));
  }) : [];
}

function renderOptgroup(h, _vm) {
  var optkey = _vm.optkey,
      optionGroups = _vm.optionGroups,
      _vm$optionGroupProps2 = _vm.optionGroupProps,
      optionGroupProps = _vm$optionGroupProps2 === void 0 ? {} : _vm$optionGroupProps2;
  var groupOptions = optionGroupProps.options || 'options';
  var groupLabel = optionGroupProps.label || 'label';
  var groupDisabled = optionGroupProps.disabled || 'disabled';
  return optionGroups ? optionGroups.map(function (group, gIndex) {
    var optid = (0, _util.getOptid)(_vm, group);
    return h('div', {
      key: optkey ? optid : gIndex,
      class: ['vxe-optgroup', {
        'is--disabled': group[groupDisabled]
      }],
      attrs: {
        'data-optid': optid
      }
    }, [h('div', {
      class: 'vxe-optgroup--title'
    }, _tools.UtilTools.getFuncText(group[groupLabel])), h('div', {
      class: 'vxe-optgroup--wrapper'
    }, renderOption(h, _vm, group[groupOptions], group))]);
  }) : [];
}

var _default2 = {
  name: 'VxeSelect',
  props: {
    value: null,
    clearable: Boolean,
    placeholder: String,
    disabled: Boolean,
    prefixIcon: String,
    placement: String,
    options: Array,
    optionProps: Object,
    optionGroups: Array,
    optionGroupProps: Object,
    size: {
      type: String,
      default: function _default() {
        return _conf.default.select.size || _conf.default.size;
      }
    },
    optId: {
      type: String,
      default: function _default() {
        return _conf.default.select.optId;
      }
    },
    optKey: Boolean,
    transfer: {
      type: Boolean,
      default: function _default() {
        return _conf.default.select.transfer;
      }
    }
  },
  components: {
    VxeInput: _input.default
  },
  provide: function provide() {
    return {
      $xeselect: this
    };
  },
  data: function data() {
    return {
      updateFlag: 0,
      panelIndex: 0,
      optionList: [],
      allOptList: [],
      panelStyle: null,
      panelPlacement: null,
      currentValue: null,
      visiblePanel: false,
      animatVisible: false,
      isActivated: false
    };
  },
  computed: {
    vSize: function vSize() {
      return this.size || this.$parent.size || this.$parent.vSize;
    },
    selectLabel: function selectLabel() {
      var selectOption = findOption(this.allOptList, this.value);

      if (selectOption) {
        return selectOption.label;
      }

      return this.value;
    }
  },
  watch: {
    options: function options() {
      this.updateCache();
      this.updateOptComps();
    },
    optionGroups: function optionGroups() {
      this.updateCache();
      this.updateOptComps();
    },
    updateFlag: function updateFlag() {
      this.updateOptComps();
    }
  },
  created: function created() {
    if (this.options || this.optionGroups) {
      this.updateCache();
      this.updateOptComps();
    }

    _tools.GlobalEvent.on(this, 'mousewheel', this.handleGlobalMousewheelEvent);

    _tools.GlobalEvent.on(this, 'mousedown', this.handleGlobalMousedownEvent);

    _tools.GlobalEvent.on(this, 'keydown', this.handleGlobalKeydownEvent);

    _tools.GlobalEvent.on(this, 'blur', this.handleGlobalBlurEvent);
  },
  mounted: function mounted() {
    if (this.transfer) {
      document.body.appendChild(this.$refs.panel);
    }
  },
  beforeDestroy: function beforeDestroy() {
    var panelElem = this.$refs.panel;

    if (panelElem && panelElem.parentNode) {
      panelElem.parentNode.removeChild(panelElem);
    }
  },
  destroyed: function destroyed() {
    _tools.GlobalEvent.off(this, 'mousewheel');

    _tools.GlobalEvent.off(this, 'mousedown');

    _tools.GlobalEvent.off(this, 'keydown');

    _tools.GlobalEvent.off(this, 'blur');
  },
  render: function render(h) {
    var _ref, _ref2;

    var vSize = this.vSize,
        transfer = this.transfer,
        isActivated = this.isActivated,
        disabled = this.disabled,
        clearable = this.clearable,
        placeholder = this.placeholder,
        selectLabel = this.selectLabel,
        animatVisible = this.animatVisible,
        visiblePanel = this.visiblePanel,
        panelStyle = this.panelStyle,
        prefixIcon = this.prefixIcon,
        panelPlacement = this.panelPlacement,
        optionGroups = this.optionGroups;
    return h('div', {
      class: ['vxe-select', (_ref = {}, _defineProperty(_ref, "size--".concat(vSize), vSize), _defineProperty(_ref, 'is--visivle', visiblePanel), _defineProperty(_ref, 'is--disabled', disabled), _defineProperty(_ref, 'is--active', isActivated), _ref)]
    }, [h('vxe-input', {
      ref: 'input',
      props: {
        clearable: clearable,
        placeholder: placeholder,
        readonly: true,
        disabled: disabled,
        type: 'text',
        prefixIcon: prefixIcon,
        suffixIcon: visiblePanel ? _conf.default.icon.SELECT_OPEN : _conf.default.icon.SELECT_CLOSE,
        value: selectLabel
      },
      on: {
        clear: this.clearEvent,
        click: this.togglePanelEvent,
        focus: this.focusEvent,
        blur: this.blurEvent,
        'suffix-click': this.togglePanelEvent
      }
    }), h('div', {
      ref: 'panel',
      class: ['vxe-table--ignore-clear vxe-select--panel', (_ref2 = {}, _defineProperty(_ref2, "size--".concat(vSize), vSize), _defineProperty(_ref2, 'is--transfer', transfer), _defineProperty(_ref2, 'animat--leave', animatVisible), _defineProperty(_ref2, 'animat--enter', visiblePanel), _ref2)],
      attrs: {
        'data-placement': panelPlacement
      },
      style: panelStyle
    }, [h('div', {
      ref: 'optWrapper',
      class: 'vxe-select-option--wrapper'
    }, this.$slots.default || (optionGroups ? renderOptgroup(h, this) : renderOption(h, this, this.options)))])]);
  },
  methods: {
    updateOptions: function updateOptions() {
      this.updateFlag++;
    },
    updateCache: function updateCache() {
      var _this = this;

      var options = this.options,
          optionGroups = this.optionGroups,
          _this$optionGroupProp = this.optionGroupProps,
          optionGroupProps = _this$optionGroupProp === void 0 ? {} : _this$optionGroupProp;
      var groupOptions = optionGroupProps.options || 'options';

      if (optionGroups || options) {
        var optkey = (0, _util.getOptkey)(this);

        var handleOptis = function handleOptis(item) {
          if (!(0, _util.getOptid)(_this, item)) {
            item[optkey] = (0, _util.getOptUniqueId)();
          }
        };

        if (optionGroups) {
          optionGroups.forEach(function (group) {
            handleOptis(group);

            if (group[groupOptions]) {
              group[groupOptions].forEach(handleOptis);
            }
          });
        } else {
          options.forEach(handleOptis);
        }
      }
    },
    updateOptComps: function updateOptComps() {
      var _this2 = this;

      var options = this.options,
          optionGroups = this.optionGroups;
      var oList = [];
      var allList = [];

      if (optionGroups || options) {
        var _this$optionProps = this.optionProps,
            optionProps = _this$optionProps === void 0 ? {} : _this$optionProps,
            _this$optionGroupProp2 = this.optionGroupProps,
            optionGroupProps = _this$optionGroupProp2 === void 0 ? {} : _this$optionGroupProp2;
        var disabledProp = optionProps.disabled || 'disabled';
        var labelProp = optionProps.label || 'label';
        var valueProp = optionProps.value || 'value';

        if (optionGroups) {
          var groupOptions = optionGroupProps.options || 'options';
          var groupLabel = optionGroupProps.label || 'label';
          var groupDisabled = optionGroupProps.disabled || 'disabled';
          optionGroups.forEach(function (group) {
            var optChilds = [];
            var allOptChilds = [];
            group[groupOptions].forEach(function (option) {
              var isDisabled = group && group[groupDisabled] || option[disabledProp];
              var item = {
                label: option[labelProp],
                value: option[valueProp],
                disabled: isDisabled,
                id: (0, _util.getOptid)(_this2, option)
              };

              if (!isDisabled) {
                optChilds.push(item);
              }

              allOptChilds.push(item);
            });

            if (optChilds.length) {
              oList.push({
                label: group[groupLabel],
                disabled: group[groupDisabled],
                options: optChilds,
                id: (0, _util.getOptid)(_this2, group)
              });
            }

            if (allOptChilds.length) {
              allList.push({
                label: group[groupLabel],
                disabled: group[groupDisabled],
                options: allOptChilds,
                id: (0, _util.getOptid)(_this2, group)
              });
            }
          });
        } else {
          options.forEach(function (option) {
            var isDisabled = option[disabledProp];
            var item = {
              label: option[labelProp],
              value: option[valueProp],
              disabled: isDisabled,
              id: (0, _util.getOptid)(_this2, option)
            };

            if (!isDisabled) {
              oList.push(item);
            }

            allList.push(item);
          });
        }

        this.optionList = oList;
        this.allOptList = allList;
        return Promise.resolve();
      }

      return this.$nextTick().then(function () {
        _this2.$children.forEach(function (group) {
          if (group.$xeselect) {
            var optChilds = [];
            var allOptChilds = [];
            var isGroup = group.$children.length;
            group.$children.forEach(function (option) {
              if (option.$xeselect && option.$xeoptgroup) {
                var item = {
                  label: option.label,
                  value: option.value,
                  disabled: option.isDisabled,
                  id: option.id
                };

                if (!option.isDisabled) {
                  optChilds.push(item);
                }

                allOptChilds.push(item);
              }
            });

            if (isGroup) {
              if (optChilds.length) {
                oList.push({
                  label: group.label,
                  disabled: group.disabled,
                  options: optChilds,
                  id: group.id
                });
              }

              if (allOptChilds.length) {
                allList.push({
                  label: group.label,
                  disabled: group.disabled,
                  options: allOptChilds,
                  id: group.id
                });
              }
            } else {
              var item = {
                label: group.label,
                value: group.value,
                disabled: group.disabled,
                id: group.id
              };

              if (!group.disabled) {
                oList.push(item);
              }

              allList.push(item);
            }
          }
        });

        _this2.optionList = oList;
        _this2.allOptList = allList;
      });
    },
    setCurrentOption: function setCurrentOption(option) {
      if (option) {
        this.currentValue = option.value;
      }
    },
    scrollToOption: function scrollToOption(option, isAlignBottom) {
      var _this3 = this;

      return new Promise(function (resolve) {
        if (option) {
          return _this3.$nextTick().then(function () {
            var $refs = _this3.$refs;
            var optWrapperElem = $refs.optWrapper;
            var optElem = $refs.panel.querySelector("[data-optid='".concat(option.id, "']"));

            if (optWrapperElem && optElem) {
              var wrapperHeight = optWrapperElem.offsetHeight;
              var offsetPadding = 5;

              if (isAlignBottom) {
                if (optElem.offsetTop + optElem.offsetHeight - optWrapperElem.scrollTop > wrapperHeight) {
                  optWrapperElem.scrollTop = optElem.offsetTop + optElem.offsetHeight - wrapperHeight;
                }
              } else {
                if (optElem.offsetTop - offsetPadding < optWrapperElem.scrollTop) {
                  optWrapperElem.scrollTop = optElem.offsetTop - offsetPadding;
                }
              }
            }

            resolve();
          });
        } else {
          resolve();
        }
      });
    },
    clearEvent: function clearEvent(params, evnt) {
      this.clearValueEvent(evnt, null);
      this.hideOptionPanel();
    },
    clearValueEvent: function clearValueEvent(evnt, selectValue) {
      this.changeEvent(evnt, selectValue);
      this.$emit('clear', {
        value: selectValue,
        $event: evnt
      });
    },
    changeEvent: function changeEvent(evnt, selectValue) {
      if (selectValue !== this.value) {
        this.$emit('input', selectValue);
        this.$emit('change', {
          value: selectValue,
          $event: evnt
        });
      }
    },
    changeOptionEvent: function changeOptionEvent(evnt, selectValue) {
      this.changeEvent(evnt, selectValue);
      this.hideOptionPanel();
    },
    handleGlobalMousewheelEvent: function handleGlobalMousewheelEvent(evnt) {
      var $refs = this.$refs,
          $el = this.$el,
          disabled = this.disabled,
          visiblePanel = this.visiblePanel;

      if (!disabled) {
        if (visiblePanel) {
          var hasSlef = _tools.DomTools.getEventTargetNode(evnt, $el).flag;

          if (hasSlef || _tools.DomTools.getEventTargetNode(evnt, $refs.panel).flag) {
            if (hasSlef) {
              this.updatePlacement();
            }
          } else {
            this.hideOptionPanel();
          }
        }
      }
    },
    handleGlobalMousedownEvent: function handleGlobalMousedownEvent(evnt) {
      var $refs = this.$refs,
          $el = this.$el,
          disabled = this.disabled,
          visiblePanel = this.visiblePanel;

      if (!disabled) {
        this.isActivated = _tools.DomTools.getEventTargetNode(evnt, $el).flag || _tools.DomTools.getEventTargetNode(evnt, $refs.panel).flag;

        if (visiblePanel && !this.isActivated) {
          this.hideOptionPanel();
        }
      }
    },
    handleGlobalKeydownEvent: function handleGlobalKeydownEvent(evnt) {
      var visiblePanel = this.visiblePanel,
          currentValue = this.currentValue,
          clearable = this.clearable,
          disabled = this.disabled;

      if (!disabled) {
        var keyCode = evnt.keyCode;
        var isTab = keyCode === 9;
        var isEnter = keyCode === 13;
        var isEsc = keyCode === 27;
        var isUpArrow = keyCode === 38;
        var isDwArrow = keyCode === 40;
        var isDel = keyCode === 46;
        var isSpacebar = keyCode === 32;

        if (isTab) {
          this.isActivated = false;
        }

        if (visiblePanel) {
          if (isEsc || isTab) {
            this.hideOptionPanel();
          } else if (isEnter) {
            this.changeOptionEvent(evnt, currentValue);
          } else if (isUpArrow || isDwArrow) {
            evnt.preventDefault();
            var groupList = this.optionList;

            var _findOffsetOption = findOffsetOption(groupList, currentValue, isUpArrow),
                offsetOption = _findOffsetOption.offsetOption,
                firstOption = _findOffsetOption.firstOption;

            if (!offsetOption && !findOption(groupList, currentValue)) {
              offsetOption = firstOption;
            }

            this.setCurrentOption(offsetOption);
            this.scrollToOption(offsetOption, isDwArrow);
          } else if (isSpacebar) {
            evnt.preventDefault();
          }
        } else if ((isUpArrow || isDwArrow || isEnter || isSpacebar) && this.isActivated) {
          evnt.preventDefault();
          this.showOptionPanel();
        }

        if (this.isActivated) {
          if (isDel && clearable) {
            this.clearValueEvent(evnt, null);
          }
        }
      }
    },
    handleGlobalBlurEvent: function handleGlobalBlurEvent() {
      this.hideOptionPanel();
    },
    updateZindex: function updateZindex() {
      if (this.panelIndex < _tools.UtilTools.getLastZIndex()) {
        this.panelIndex = _tools.UtilTools.nextZIndex();
      }
    },
    focusEvent: function focusEvent() {
      if (!this.disabled) {
        this.isActivated = true;
      }
    },
    blurEvent: function blurEvent() {
      this.isActivated = false;
    },
    togglePanelEvent: function togglePanelEvent(params) {
      var $event = params.$event;
      $event.preventDefault();

      if (this.visiblePanel) {
        this.hideOptionPanel();
      } else {
        this.showOptionPanel();
      }
    },
    showOptionPanel: function showOptionPanel() {
      var _this4 = this;

      if (!this.disabled) {
        clearTimeout(this.hidePanelTimeout);
        this.isActivated = true;
        this.animatVisible = true;
        setTimeout(function () {
          var currOption = findOption(_this4.allOptList, _this4.value);
          _this4.visiblePanel = true;

          if (currOption) {
            _this4.setCurrentOption(currOption);

            _this4.scrollToOption(currOption);
          }
        }, 10);
        this.updateZindex();
        this.updatePlacement();
      }
    },
    hideOptionPanel: function hideOptionPanel() {
      var _this5 = this;

      this.visiblePanel = false;
      this.hidePanelTimeout = setTimeout(function () {
        _this5.animatVisible = false;
      }, 200);
    },
    updatePlacement: function updatePlacement() {
      var _this6 = this;

      return this.$nextTick().then(function () {
        var $refs = _this6.$refs,
            transfer = _this6.transfer,
            placement = _this6.placement,
            panelIndex = _this6.panelIndex;
        var targetElem = $refs.input.$el;
        var panelElem = $refs.panel;
        var targetHeight = targetElem.offsetHeight;
        var targetWidth = targetElem.offsetWidth;
        var panelHeight = panelElem.offsetHeight;
        var panelWidth = panelElem.offsetWidth;
        var marginSize = 5;
        var panelStyle = {
          zIndex: panelIndex
        };

        var _DomTools$getAbsolute = _tools.DomTools.getAbsolutePos(targetElem),
            boundingTop = _DomTools$getAbsolute.boundingTop,
            boundingLeft = _DomTools$getAbsolute.boundingLeft,
            visibleHeight = _DomTools$getAbsolute.visibleHeight,
            visibleWidth = _DomTools$getAbsolute.visibleWidth;

        var panelPlacement = 'bottom';

        if (transfer) {
          var left = boundingLeft;
          var top = boundingTop + targetHeight;

          if (placement === 'top') {
            panelPlacement = 'top';
            top = boundingTop - panelHeight;
          } else {
            // ?????????????????????????????????
            if (top + panelHeight + marginSize > visibleHeight) {
              panelPlacement = 'top';
              top = boundingTop - panelHeight;
            } // ?????????????????????????????????????????????


            if (top < marginSize) {
              panelPlacement = 'bottom';
              top = boundingTop + targetHeight;
            }
          } // ??????????????????


          if (left + panelWidth + marginSize > visibleWidth) {
            left -= left + panelWidth + marginSize - visibleWidth;
          } // ??????????????????


          if (left < marginSize) {
            left = marginSize;
          }

          Object.assign(panelStyle, {
            left: "".concat(left, "px"),
            top: "".concat(top, "px"),
            minWidth: "".concat(targetWidth, "px")
          });
        } else {
          if (placement === 'top') {
            panelPlacement = 'top';
            panelStyle.bottom = "".concat(targetHeight, "px");
          } else {
            // ?????????????????????????????????
            if (boundingTop + targetHeight + panelHeight > visibleHeight) {
              panelPlacement = 'top';
              panelStyle.bottom = "".concat(targetHeight, "px");
            }
          }
        }

        _this6.panelStyle = panelStyle;
        _this6.panelPlacement = panelPlacement;
        return _this6.$nextTick();
      });
    },
    focus: function focus() {
      this.showOptionPanel();
      return this.$nextTick();
    },
    blur: function blur() {
      this.hideOptionPanel();
      return this.$nextTick();
    }
  }
};
exports.default = _default2;