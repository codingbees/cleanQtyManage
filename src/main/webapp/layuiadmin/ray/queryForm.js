Vue.component("query-form",{
		template:`<el-form ref="queryForm" :inline="true" size="mini" :model="queryForm" class="demo-form-inline">
							  <el-form-item v-for="(item,index) in columns" v-if="item.is_query" :key="index" :label="item.cn" :prop="item.en">
							    <el-input v-if="item.type == 'input'" v-model.lazy="queryForm[item.en]"></el-input>
							    <el-select v-if="item.type=='select' || item.type=='radio'" v-model="queryForm[item.en]" filterable placeholder="请选择">
								    <el-option
								      label="全部"
								      value=""
								      selected>
								    </el-option>
								    <el-option
								      v-for="selectItem in selectList[index]"
								      :key="selectItem.id"
								      :label="selectItem.label"
								      :value="selectItem.value">
								    </el-option>
								</el-select>
								<el-date-picker
									v-if="item.type=='date'"
									v-model="queryForm[item.en]"
							        type="daterange"
							        value-format="yyyy-MM-dd"
							        range-separator="至"
							        start-placeholder="开始日期"
							        end-placeholder="结束日期">
							    </el-date-picker>
							    <el-date-picker
									v-if="item.type=='datetime'"
									v-model="queryForm[item.en]"
							        type="datetimerange"
							        value-format="yyyy-MM-dd HH:mm:ss"
							        range-separator="至"
							        start-placeholder="开始时间"
							        end-placeholder="结束时间">
							    </el-date-picker>
							  </el-form-item>
							  <el-form-item v-if="is_query" collapse-node>
							    <el-button type="primary" @click="query">查询</el-button>
							  </el-form-item>
							</el-form>`,
		  props: {params: Object},
		  data () {
		    return {
		    	columns:null,
		    	selectList:null,
		    	is_query:false,
		    	queryForm:{},
		    }
		  },
		  watch: {
			params () {
			  const { columns, selectList,is_query} = this.params
		      this.columns = columns
		      this.selectList = selectList
		      this.is_query = is_query
		    }
		  },
		  methods: {
			  query(){
				  this.$parent.$parent.$parent.$parent.query(this.queryForm)
			  },
		  }
})