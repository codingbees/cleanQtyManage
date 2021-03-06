import XEUtils from 'xe-utils/methods/xe-utils'
import GlobalConfig from '../../conf'
import VXETable from '../../v-x-e-table'
import { UtilTools, DomTools } from '../../tools'

class Rule {
  constructor (rule) {
    Object.assign(this, {
      $options: rule,
      required: rule.required,
      min: rule.min,
      max: rule.min,
      type: rule.type,
      pattern: rule.pattern,
      validator: rule.validator,
      trigger: rule.trigger,
      maxWidth: rule.maxWidth
    })
  }

  get message () {
    return UtilTools.getFuncText(this.$options.message)
  }
}

function getResetValue (value, resetValue) {
  if (XEUtils.isArray(value)) {
    resetValue = []
  }
  return resetValue
}

function getItemSlots (_vm, item) {
  const { $scopedSlots } = _vm
  const itemSlots = item.slots
  const slots = {}
  let $default
  if (itemSlots) {
    $default = itemSlots.default
    if ($default && $scopedSlots[$default]) {
      $default = $scopedSlots[$default]
    }
  }
  if ($default) {
    slots.default = $default
  }
  return slots
}

function renderItems (h, _vm) {
  const { items } = _vm
  return items ? items.map(item => {
    return h('vxe-form-item', {
      props: item,
      scopedSlots: getItemSlots(_vm, item)
    })
  }) : []
}

export default {
  name: 'VxeForm',
  props: {
    loading: Boolean,
    data: Object,
    size: { type: String, default: () => GlobalConfig.form.size || GlobalConfig.size },
    span: [String, Number],
    align: String,
    titleAlign: String,
    titleWidth: [String, Number],
    titleColon: { type: Boolean, default: () => GlobalConfig.form.titleColon },
    items: Array,
    rules: Object
  },
  data () {
    return {
      collapseAll: true,
      invalids: []
    }
  },
  provide () {
    return {
      $vxeform: this
    }
  },
  computed: {
    vSize () {
      return this.size || this.$parent.size || this.$parent.vSize
    }
  },
  render (h) {
    const { $slots, titleColon, loading, vSize } = this
    return h('form', {
      class: ['vxe-form', 'vxe-row', {
        [`size--${vSize}`]: vSize,
        'is--colon': titleColon,
        'is--loading': loading
      }],
      on: {
        submit: this.submitEvent,
        reset: this.resetEvent
      }
    }, [].concat($slots.default || renderItems(h, this)).concat([
      h('div', {
        class: ['vxe-loading', {
          'is--visible': loading
        }]
      }, [
        h('div', {
          class: 'vxe-loading--spinner'
        })
      ])
    ]))
  },
  methods: {
    toggleCollapse () {
      this.collapseAll = !this.collapseAll
      return this.$nextTick()
    },
    submitEvent (evnt) {
      evnt.preventDefault()
      this.beginValidate().then(() => {
        this.$emit('submit', { data: this.data, $form: this, $event: evnt }, evnt)
      }).catch(errMap => {
        this.$emit('submit-invalid', { data: this.data, errMap, $form: this, $event: evnt }, evnt)
      })
    },
    resetEvent (evnt) {
      evnt.preventDefault()
      const { data } = this
      if (data) {
        this.$children.forEach(({ field, resetValue, itemRender }) => {
          if (field) {
            XEUtils.set(data, field, resetValue === null ? getResetValue(XEUtils.get(data, field), resetValue) : resetValue)
            const compConf = itemRender ? VXETable.renderer.get(itemRender.name) : null
            if (compConf && compConf.itemResetMethod) {
              compConf.itemResetMethod({ data, property: field, $form: this })
            }
          }
        })
      }
      this.clearValidate()
      this.$emit('reset', { data, $form: this, $event: evnt }, evnt)
    },
    clearValidate (field) {
      if (field) {
        XEUtils.remove(this.invalids, ({ property }) => property === field)
      } else {
        this.invalids = []
      }
      return this.$nextTick()
    },
    validate (callback) {
      return this.beginValidate(callback)
    },
    beginValidate (type, callback) {
      const { data, rules: formRules } = this
      const validRest = {}
      const validFields = []
      const itemValids = []
      this.clearValidate()
      if (data && formRules) {
        this.$children.forEach(({ field }) => {
          if (field) {
            itemValids.push(
              new Promise((resolve, reject) => {
                this.validItemRules(type || 'all', field)
                  .then(resolve)
                  .catch(({ rule, rules }) => {
                    const rest = { rule, rules, data, property: field, $form: this }
                    if (!validRest[field]) {
                      validRest[field] = []
                    }
                    validRest[field].push(rest)
                    validFields.push(field)
                    this.invalids.push(rest)
                    return reject(rest)
                  })
              })
            )
          }
        })
        return Promise.all(itemValids).then(() => {
          if (callback) {
            callback()
          }
        }).catch(() => {
          if (callback) {
            callback(validRest)
          }
          this.$nextTick(() => {
            this.handleFocus(validFields)
          })
          return Promise.reject(validRest)
        })
      }
      if (callback) {
        callback()
      }
      return Promise.resolve()
    },
    /**
     * ????????????
     * ?????????????????????????????????????????????????????????
     * ???????????????????????????????????????????????????????????????????????????????????????????????????????????????
     * ?????????????????????????????????????????? Promise<(ErrMap ???????????????????????????)>
     * ??????????????????????????????????????? (ErrMap ???????????????????????????)
     *
     * rule ?????????
     *  required=Boolean ????????????
     *  min=Number ????????????
     *  max=Number ????????????
     *  validator=Function({ itemValue, rule, rules, data, property }) ?????????????????????????????? Promise
     *  trigger=change ????????????
     */
    validItemRules (type, property, val) {
      const { data, rules: formRules } = this
      const errorRules = []
      const itemVailds = []
      if (property && formRules) {
        const rules = XEUtils.get(formRules, property)
        if (rules) {
          const itemValue = XEUtils.isUndefined(val) ? XEUtils.get(data, property) : val
          rules.forEach(rule => {
            itemVailds.push(
              new Promise(resolve => {
                if (type === 'all' || !rule.trigger || type === rule.trigger) {
                  if (XEUtils.isFunction(rule.validator)) {
                    Promise.resolve(rule.validator({
                      itemValue,
                      rule,
                      rules,
                      data,
                      property,
                      $form: this
                    })).catch(e => {
                      errorRules.push(new Rule({ type: 'custom', trigger: rule.trigger, message: e ? e.message : rule.message, rule: new Rule(rule) }))
                    }).then(resolve)
                  } else {
                    const isNumber = rule.type === 'number'
                    const numVal = isNumber ? XEUtils.toNumber(itemValue) : XEUtils.getSize(itemValue)
                    if (itemValue === null || itemValue === undefined || itemValue === '') {
                      if (rule.required) {
                        errorRules.push(new Rule(rule))
                      }
                    } else if (
                      (isNumber && isNaN(itemValue)) ||
                      (!isNaN(rule.min) && numVal < parseFloat(rule.min)) ||
                      (!isNaN(rule.max) && numVal > parseFloat(rule.max)) ||
                      (rule.pattern && !(rule.pattern.test ? rule.pattern : new RegExp(rule.pattern)).test(itemValue))
                    ) {
                      errorRules.push(new Rule(rule))
                    }
                    resolve()
                  }
                } else {
                  resolve()
                }
              })
            )
          })
        }
      }
      return Promise.all(itemVailds).then(() => {
        if (errorRules.length) {
          const rest = { rules: errorRules, rule: errorRules[0] }
          return Promise.reject(rest)
        }
      })
    },
    handleFocus (fields) {
      const { $children } = this
      fields.some(property => {
        const comp = XEUtils.find($children, item => item.field === property)
        if (comp && comp.itemRender) {
          const { $el, itemRender } = comp
          const compConf = VXETable.renderer.get(itemRender.name)
          let inputElem
          // ????????????????????? class
          if (itemRender.autofocus) {
            inputElem = $el.querySelector(itemRender.autofocus)
          }
          // ????????????????????????
          if (!inputElem && compConf && compConf.autofocus) {
            inputElem = $el.querySelector(compConf.autofocus)
          }
          if (inputElem) {
            inputElem.focus()
            // ???????????????????????????????????????
            if (DomTools.browse.msie) {
              const textRange = inputElem.createTextRange()
              textRange.collapse(false)
              textRange.select()
            }
            return true
          }
        }
      })
    },
    /**
     * ???????????????
     * ??????????????? v-model ?????? change ??????????????????????????????????????????????????????
     * ?????????????????????????????????????????????????????????
     */
    updateStatus (scope, itemValue) {
      const { property } = scope
      if (property) {
        this.validItemRules('change', property, itemValue)
          .then(() => {
            this.clearValidate(property)
          })
          .catch(({ rule, rules }) => {
            const rest = XEUtils.find(this.invalids, rest => rest.property === property)
            if (rest) {
              rest.rule = rule
              rest.rules = rules
            } else {
              this.invalids.push({ rule, rules, property })
            }
          })
      }
    }
  }
}
