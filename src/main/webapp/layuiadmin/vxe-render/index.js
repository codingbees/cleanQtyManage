VXETable.renderer.add('cell-select', {
  // select显示模板
  renderDefault (h, renderOpts, params) {
    let { row, column } = params
    let { options } = renderOpts
    for(var i=0;i<options.length;i++){
    	if(options[i].value==row[column.property]){
    		return options[i].label;
    	}
    }
    return row[column.property];
  }
});

VXETable.renderer.add('cell-switch', {
  // switch显示模板
  renderDefault (h, renderOpts, params) {
    let { row, column } = params
    if(row[column.property]){
    	return '是'
    }else{
    	return '否'
    }
  }
})

VXETable.renderer.add('cell-user', {
  // 选人字段展示
  renderDefault (h, renderOpts, params) {
    let { row, column } = params
    let { options } = renderOpts
    var temp = row[column.property].split(",");
    var names = "";
    for(var i=0;i<temp.length;i++){
    	options.forEach(function(item){
    		if(item.id == temp[i]){
    			names += item.nickname+",";
    		}
    	})
    }
    return names.substring(0,names.length-1);
  }
});


//前端字段格式化
VXETable.formats.add('format', ({ cellValue,row }, formatter) => {
	return eval(formatter);
})

//文本域组件
Vue.component("edit-down-textarea",{
		template:`<div class="edit-down-textarea">
    <vxe-pulldown class="edit-down-pulldown" ref="xDown" transfer>
      <template>
        <vxe-input class="edit-down-input" v-model="row[column.property]" @click="clickEvent" readonly></vxe-input>
      </template>
      <template v-slot:dropdown>
        <div class="edit-down-wrapper">
          <vxe-textarea ref="xText" class="edit-down-text" v-model="row[column.property]" resize="none" maxlength="1000" show-word-count></vxe-textarea>
        </div>
      </template>
    </vxe-pulldown>
  </div>`,
		props: {
		    params: Object
		  },
		  data () {
		    return {
		      row: null,
		      column: null
		    }
		  },
		  watch: {
		    params () {
		      this.load()
		    }
		  },
		  created () {
		    this.load()
		  },
		  methods: {
		    load () {
		      const { row, column } = this.params
		      this.row = row
		      this.column = column
		    },
		    clickEvent () {
		      this.$refs.xDown.showPanel().then(() => {
		        this.$refs.xText.focus()
		      })
		    },
		    suffixClick () {
		      this.$refs.xDown.togglePanel()
		    }
		  }
})

//渲染文本域
VXETable.renderer.add('EditDownTextarea', {
  autofocus: '.vxe-input--inner',
  renderEdit (h, renderOpts, params) {
    return [
      h('edit-down-textarea', {
          attrs: {
        	  params: params
          }
      })
    ]
  }
})