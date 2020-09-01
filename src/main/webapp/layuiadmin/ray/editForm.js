Vue.component("edit-form",{
		template:`<el-dialog :title="dialogTitle" :before-close="handleClose" :visible.sync="show" :with-header="true">
					  <el-row :gutter="4">
						  <el-form :rules="rules" ref="form" size="small" :model="form" label-width="100px">
					  	   <el-row>
					  		<el-col :span="item.type=='radio'||item.type=='checkbox'?24:12" v-for="(item,index) in columns" :key="item.id" v-if="item.is_update&&item.type != 'file'">
						  		<el-form-item :label="item.cn" :prop="item.en" :label-width="formLabelWidth" style="height:33px">
							      <el-input v-if="item.type == 'input'" v-model="form[item.en]"></el-input>
							      <el-select v-if="item.type=='select'" v-model="form[item.en]" style="width: 100%;" filterable placeholder="请选择">
								    <el-option
								      v-for="selectItem in selectList[index]"
								      :key="selectItem.id"
								      :label="selectItem.label"
								      :value="selectItem.value">
								    </el-option>
								  </el-select>
								  <el-radio-group v-if="item.type=='radio'" v-model="form[item.en]">
								    <el-radio v-for="selectItem in selectList[index]" :key="selectItem.id" :label="selectItem.value">{{selectItem.label}}</el-radio>
								  </el-radio-group>
								  <el-switch
								  	  v-if="item.type=='switch'"
									  v-model="form[item.en]"
									  active-color="#13ce66"
									  inactive-color="#ff4949">
								  </el-switch>
								  <el-date-picker
										v-if="item.type=='date'"
								        v-model="form[item.en]"
								        type="date"
								        value-format="yyyy-MM-dd"
								        style="width: 100%;"
								        placeholder="选择日期">
								  </el-date-picker>
								  <el-date-picker
										v-if="item.type=='datetime'"
								        v-model="form[item.en]"
								        type="datetime"
								        value-format="yyyy-MM-dd HH:mm:ss"
								        style="width: 100%;"
								        placeholder="选择日期">
								  </el-date-picker>
							    </el-form-item>
							  </el-col>
							</el-row>
						  </el-form>
				      </el-row>
					  <span slot="footer" class="dialog-footer">
					    <el-button @click="close()">取 消</el-button>
					    <el-button type="primary" @click="onSubmit('form')">确 定</el-button>
					  </span>
					</el-dialog>`,
		  props: {params: Object},
		  data () {
		    return {
		    	columns:null,
		    	selectList:null,
		    	rules:null,
		    	form:{},
		    	formLabelWidth:'120px',
		    	dialogTitle:'编辑',
		    	show:false
		    }
		  },
		  watch: {
			params () {
			  const { columns, selectList,rules,show,row} = this.params
		      this.columns = columns
		      this.selectList = selectList
		      this.rules = rules
		      this.show = show
		      this.form = row
		    }
		  },
		  methods: {
			  onSubmit(formName){
				  var _this = this;
		    	  this.$refs[formName].validate((valid) => {
		              if (valid) {
		            	  this.$parent.edit(_this.form);
		              } else {
		            	  console.log('error submit!!');
		                  return false;
		              }
		            });
			  },
		      handleClose(done) {
		          this.$confirm('确认关闭？')
		            .then(_ => {
		            	this.show = false;
		            })
		            .catch(_ => {});
	          },
	          close() {
	        	  this.show = false;
	          },
		  }
})