Vue.component("add-form",{
		template:`<el-dialog :title="dialogTitle" :before-close="handleClose" :visible.sync="show" :with-header="true">
					  <el-row :gutter="4">
						  <el-form :rules="rules" ref="form" size="small" :model="form" label-width="100px">
					  		<el-col :span="item.type=='radio'||item.type=='checkbox'?24:12" v-for="(item,index) in columns" :key="item.id">
						  		<el-form-item v-if="item.is_add" :label="item.cn" :prop="item.en" :label-width="formLabelWidth">
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
							      <el-upload
							      	  v-if="item.type=='file'"
									  class="upload-demo"
									  ref="upload"
									  action="/common/upload"
									  :data="{column:item.en}"
									  :accept="item.type_config.split('|')[2]"
									  :multiple="false"
									  :on-remove="beforeRemove"
									  :on-success="handleSuccess"
									  :on-exceed="handleExceed"
									  :limit="parseInt(item.type_config.split('|')[1])"
									  :file-list="fileList"
									  :auto-upload="true">
									  <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
									  <div slot="tip" class="el-upload__tip">只能上传{{item.type_config.split('|')[2]}}文件</div>
								  </el-upload>
							    </el-form-item>
							  </el-col>
						  </el-form>
				      </el-row>
					  <span slot="footer" class="dialog-footer">
					    <el-button @click="show = false">取 消</el-button>
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
		    	fileList:[],
		    	dialogTitle:'新增',
		    	show:false
		    }
		  },
		  watch: {
			params () {
			  const { columns, selectList,rules,show} = this.params
		      this.columns = columns
		      this.selectList = selectList
		      this.rules = rules
		      this.show = show
		    }
		  },
		  methods: {
			  onSubmit(formName){
				  var _this = this;
		    	  this.$refs[formName].validate((valid) => {
		              if (valid) {
		            	  this.$parent.onSubmit(_this.form,_this.fileList);
		              } else {
		            	  console.log('error submit!!');
		                  return false;
		              }
		            });
			  },
			  beforeRemove(file, fileList) {
		      	  this.fileList = fileList;
		      },
		      handleSuccess(res,file,fileList){
		        	this.fileList = fileList;
		      },
		      handleExceed(file, fileList){
		    	  this.$message({
		              type: 'error',
		              message: '超出文件个数限制'
		          });
		      },
		      handleClose(done) {
		          this.$confirm('确认关闭？')
		            .then(_ => {
		              done();
		            })
		            .catch(_ => {});
	          },
		  }
})