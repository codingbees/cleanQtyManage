//钉钉JS
var _config = window.parent._config;
window.dd = window.parent.dd;

window.dd.error(function(err) {
    alert('dd error: ' + JSON.stringify(err));
})
//窗口变化
window.onresize=function(){  
	this.app.fullHeight = document.documentElement.clientHeight; //窗口高度
}
//获取参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r != null) {
          return decodeURIComponent(r[2]);
    }
    return '';
}
//初始化data
function buildData(custom_data) {
  return Object.assign({
	  menu_id:getQueryString('id'),
	  parent_id:getQueryString('parent_id'),
	  parent_id_field:getQueryString('parent_id_field'),
	  user_roles:getQueryString('user_roles'),
	  menu:{},
	  data_object:{},
	  datas:[],
	  columns:[],
	  form:{},
	  is_query:false,
	  queryForm:{},
	  fileList:[],
	  inFileList:[],
	  dialogVisible: false,
	  fileDialogVisible:false,
	  dialogTitle:'',
      formLabelWidth: '120px',
      fullHeight: document.documentElement.clientHeight,
      tableHeight:0,
      tablePage:{
          currentPage: 1,
          pageSize: 20,
          total: 0,
          pageSizes: [20, 50, 100, 200, 500],
          layouts: ['Sizes', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'FullJump', 'Total'],
   		  perfect: true
      },
      exportConfig: {
          remote: true,
          exportMethod: this.exportDataEvent
      },
      selectRow:{},
      select_rows:[],
      rules:{},
      headButtons:[],
      lineButtons:[],
      checkList:[],
      tableToolbar: {
          slots: {
            buttons: 'toolbar_buttons'
          },
          refresh: true,
          export: true,
          print: true,
          zoom: true,
          custom: true,
          perfect:true
      },
      buttonDialog:false,
      buttonDialogTitle:'',
      buttonDialogWidth:'',
      buttonDialogSrc:'',
	  dialogRow:{},
	  dialogHeight:'',
	  file_edit:false,
	  domin_url:'',
  }, custom_data)
}
//初始化watch
function buildWatch(custom_watch){
	return Object.assign({
		fullHeight:function(){
			this.tableHeight=this.fullHeight-this.$refs.banner.offsetHeight-85;
		},
		menu:function(){
			this.$nextTick(()=>{
				this.getColumns();
			});
		},
		columns:function(){
			this.$nextTick(()=>{
				this.getData();
				this.tableHeight=this.fullHeight-this.$refs.banner.offsetHeight-85;
			});
		}
	})
}
//初始化methods
function buildMethods(custom_methods) {
  return Object.assign({
	  getMenuInfo(){
		  var _this = this;
		  axios({
	    		method:"post",
	    		url:"/single/getMenuInfo",
	    		params:{id:_this.menu_id}
	  		}).then((res)=>{
			    	if(res.status==200){
			    		_this.menu = res.data.menu;
			    		_this.domin_url = res.data.domin_url;
				  	}else{
				  		this.$message.error('网络请求失败');
				  	}
	  		})
	  },
	  getColumns: function (event) {
		  var _this = this;
		  axios({
	    		method:"post",
	    		url:"/single/getColumns",
	    		params:{object_id:_this.menu.data_object_id}
    		}).then((res)=>{
		    	if(res.status==200){
		    		_this.columns = res.data.list;
		    		_this.is_query = res.data.is_query;
		    		_this.selectList = res.data.selectMap;
		    		_this.rules = res.data.validator;
		    		_this.headButtons = res.data.headButtons;
		    		_this.lineButtons = res.data.lineButtons;
		    		_this.data_object = res.data.data_object;
			  	}else{
			  		this.$message.error('网络请求失败');
			  	}
    		})  
	  },
	  getData: function (event) {
		  var _this = this;
		  axios({
	    		method:"post",
	    		url:"/single/getData",
	    		params:{object_id:_this.menu.data_object_id,
	    			parent_id:_this.parent_id,
	    			parent_id_field:_this.parent_id_field,currentPage:_this.tablePage.currentPage,pageSize:_this.tablePage.pageSize}
    		}).then((res)=>{
		    	if(res.status==200){
			    	if(res.data.state=="fail"){
			    		this.$message.error(res.data.msg);
				    }else{
				    	_this.datas = res.data.list;
				    	_this.tablePage.total = res.data.totalResult;
					}
			  	}else{
			  		this.$message.error('网络请求失败');
			  	}
    		})
	  },
	  handleCurrentChange:function({ currentPage, pageSize }){
		  this.tablePage.currentPage = currentPage
          this.tablePage.pageSize = pageSize
          this.getData();
	  },
	  query(){
		  var _this = this;
		  axios({
	    		method:"post",
	    		url:"/single/getData",
	    		params:{object_id:_this.menu.data_object_id,
	    			parent_id:_this.parent_id,
	    			parent_id_field:_this.parent_id_field,queryForm:_this.queryForm,currentPage:_this.tablePage.currentPage,pageSize:_this.tablePage.pageSize}
    		}).then((res)=>{
		    	if(res.status==200){
		    		_this.datas = res.data.list;
		    		_this.tablePage.total = res.data.totalResult;
			  	}else{
			  		this.$message.error('网络请求失败');
			  	}
    		})
	  },
	  addInit:function(){
    	this.dialogTitle='新增';
    	this.form = {};
    	this.fileList = [];
    	this.dialogVisible = true;
	  },
      onSubmit:function(formName){
    	  var _this = this;
    	  this.$refs[formName].validate((valid) => {
              if (valid) {
            	  axios({
	  		    		method:"post",
	  		    		url:"/single/new_",
	  		    		params:{form:_this.form,fileList:_this.fileList,object_id:_this.menu.data_object_id,parent_id:_this.parent_id,
	  		    			parent_id_field:_this.parent_id_field}
	  	    		}).then((res)=>{
	  			    	if(res.status==200){
	  			    		if(res.data.state=="ok"){
	  				    		_this.$message({
	  			    		          message: res.data.msg,
	  			    		          type: 'success'
	  			    		        });
	  				    		_this.dialogVisible = false;
	  				    		_this.getData();
	  					    }else{
	  					    	this.$message.error(res.data.msg);
	  						}
	  				  	}else{
	  				  		this.$message.error('网络请求失败');
	  				  	}
	  	    		})
              } else {
            	  console.log('error submit!!');
                  return false;
              }
            });
      },
      //cell编辑
	  editClosedEvent ({ row, column }, event) {
		  var _this = this;
		  axios({
	    		method:"post",
	    		url:"/single/edit",
	    		params:{row:row,object_id:_this.menu.data_object_id}
    		}).then((res)=>{
		    	if(res.status==200){
			    	if(res.data.state=="ok"){
			    		_this.$message({
		    		          message: res.data.msg,
		    		          type: 'success'
		    		        });
			    		_this.query();
				    }else{
				    	this.$message.error(res.data.msg);
					}
			  	}else{
			  		this.$message.error('网络请求失败');
			  	}
    		})
         },
      del:function(row){
    	var _this = this;
    	this.$confirm('确定要删除吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
        	  axios({
		    		method:"post",
		    		url:"/single/del",
		    		params:{id:row.id,object_id:_this.menu.data_object_id}
	    		}).then((res)=>{
			    	if(res.status==200){
			    		if(res.data.state=="ok"){
				    		_this.$message({
			    		          message: res.data.msg,
			    		          type: 'success'
			    		        });
				    		_this.$refs.table.remove(row);
					    }else{
					    	this.$message.error(res.data.msg);
						}
				  	}else{
				  		this.$message.error('网络请求失败');
				  	}
	    		})
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });          
          });
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
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
      exportDataEvent:function({ options }) {
    	  var _this = this;
              const body = {
                filename: options.filename,
                sheetName: options.sheetName,
                isHeader: options.isHeader,
                original: options.original,
                mode: options.mode,
                ids: options.mode === 'selected' ? options.data.map(item => item.id) : [],
                fields: options.columns.map(column => {
                  return {
                    field: column.property,
                    title: column.title
                  }
                })
              }
              // 开始服务端导出
			  return axios({
		    		method:"post",
		    		url:"/common/export",
		    		params:{body:body,
		    			parent_id:_this.parent_id,
		    			parent_id_field:_this.parent_id_field,
		    			queryForm:_this.queryForm,
		    			object_id:_this.menu.data_object_id}
	    		}).then(res=>{
			    	if(res.status==200){
			    		location.href = _this.domin_url+res.data.url
				  	}else{
				  		this.$message.error('网络请求失败');
				  	}
	    		})
         },
      fileEdit({row,column}){
    	  var _this = this;
    	  _this.fileList = [];
    	  _this.selectRow = row;
    	  _this.file_column = column.property;
    	  _this.file_edit = true;
    	  axios({
	    		method:"post",
	    		url:"/common/getFileList",
	    		params:{row:row,column:_this.file_column}
    		}).then((res)=>{
		    	if(res.status==200){
			    	_this.inFileList = res.data;
			    	_this.fileDialogVisible = true;
			  	}else{
			  		this.$message.error('网络请求失败');
			  	}
    		})
	  },
	  fileScan({row,column}){
    	  var _this = this;
    	  _this.fileList = [];
    	  _this.selectRow = row;
    	  _this.file_column = column.property;
    	  _this.file_edit = false;
    	  axios({
	    		method:"post",
	    		url:"/common/getFileList",
	    		params:{row:row,column:_this.file_column}
    		}).then((res)=>{
		    	if(res.status==200){
			    	_this.inFileList = res.data;
			    	_this.fileDialogVisible = true;
			  	}else{
			  		this.$message.error('网络请求失败');
			  	}
    		})
	  },
	  delFile(id,index){
		  var _this = this;
		  _this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
	          confirmButtonText: '确定',
	          cancelButtonText: '取消',
	          type: 'warning'
	        }).then(() => {
	        	axios({
		    		method:"post",
		    		url:"/common/delFile",
		    		params:{row:_this.selectRow,column:_this.file_column,file_id:id,object_id:_this.menu.data_object_id}
	    		}).then((res)=>{
			    	if(res.status==200){
				    	if(res.data.state=="ok"){
				    		_this.$message({
			    		          message: res.data.msg,
			    		          type: 'success'
			    		        });
		    		        _this.inFileList.splice(index,1)
					    }else{
					    	this.$message.error(res.data.msg);
						}
				  	}else{
				  		this.$message.error('网络请求失败');
				  	}
	    		})
	        })
	  },
	  confirmUpload(){
		var _this = this;
		axios({
    		method:"post",
    		url:"/common/confirmUpload",
    		params:{row:_this.selectRow,fileList:_this.fileList,object_id:_this.menu.data_object_id,column:_this.file_column}
   		}).then((res)=>{
	    	if(res.status==200){
	    		if(res.data.state=="ok"){
		    		_this.$message({
	    		          message: res.data.msg,
	    		          type: 'success'
	    		    });
	    		    for(var i=0;i<res.data.respFileList.length;i++){
	    		    	_this.inFileList.push({
 			    		    	id:res.data.respFileList[i].id,
 				    			name: res.data.respFileList[i].name,
 				    			url:res.data.respFileList[i].url
 				    		});
 			    		}
 			    		_this.$refs.uploadUpdate.clearFiles();
			    }else{
			    	this.$message.error(res.data.msg);
				}
		  	}else{
		  		this.$message.error('网络请求失败');
		  	}
   		})
	  },
	  lineButtonConfirmClick(row,button){
		  var _this = this;
		  _this.$confirm(button.tip, '提示', {
	          confirmButtonText: '确定',
	          cancelButtonText: '取消',
	          type: 'warning'
	        }).then(() => {
	        	axios({
		    		method:"post",
		    		url:button.action,
		    		params:row
	    		}).then((res)=>{
			    	if(res.status==200){
				    	if(res.data.state=="ok"){
				    		_this.$message({
		    		          message: res.data.msg,
		    		          type: 'success'
		    		        });
				    		_this.query();
					    }else{
					    	this.$message.error(res.data.msg);
						}
				  	}else{
				  		this.$message.error('网络请求失败');
				  	}
	    		})
	        })
	  },
	  lineButtonComboboxClick(row,button){
		  var _this = this;
		  this.$prompt(button.tip, '提示', {
	          confirmButtonText: '确定',
	          cancelButtonText: '取消',
	        }).then(({ value }) => {
		        row.comboValue = value;
	        	axios({
		    		method:"post",
		    		url:button.action,
		    		params:row
	    		}).then((res)=>{
			    	if(res.status==200){
				    	if(res.data.state=="ok"){
				    		_this.$message({
		    		          message: res.data.msg,
		    		          type: 'success'
		    		        });
				    		_this.query();
					    }else{
					    	this.$message.error(res.data.msg);
						}
				  	}else{
				  		this.$message.error('网络请求失败');
				  	}
	    		})
	        })
	  },
	  lineButtonDialogClick(row,button){
		    var _this = this;
    		_this.buttonDialog = true;
	    	_this.buttonDialogSrc = button.dialog_src;
	    	_this.buttonDialogTitle = button.dialog_title;
	    	_this.buttonDialogWidth = button.dialog_width;
	    	_this.dialogRow = row;
	  },
	  headButtonConfirmClick(button){
		  var _this = this;
		  if(_this.select_rows.length>0){
			  _this.$confirm(button.tip, '提示', {
		          confirmButtonText: '确定',
		          cancelButtonText: '取消',
		          type: 'warning'
		        }).then(() => {
		        	axios({
			    		method:"post",
			    		url:button.action,
			    		params:{rows:_this.select_rows}
		    		}).then((res)=>{
				    	if(res.status==200){
					    	if(res.data.state=="ok"){
					    		_this.$message({
			    		          message: res.data.msg,
			    		          type: 'success'
			    		        });
					    		_this.query();
						    }else{
						    	this.$message.error(res.data.msg);
							}
					  	}else{
					  		this.$message.error('网络请求失败');
					  	}
		    		})
		        })
		  }else{
			  this.$message({
		          message: '请至少选择一行数据进行操作',
		          type: 'warning'
		        });
		  }
	  },
	  headButtonComboboxClick(button){
		  var _this = this;
		  if(_this.select_rows.length>0){
			  _this.$prompt(button.tip, '提示', {
		          confirmButtonText: '确定',
		          cancelButtonText: '取消',
		        }).then(({ value }) => {
		        	axios({
			    		method:"post",
			    		url:button.action,
			    		params:{comboValue:value,rows:_this.select_rows}
		    		}).then((res)=>{
				    	if(res.status==200){
					    	if(res.data.state=="ok"){
					    		_this.$message({
			    		          message: res.data.msg,
			    		          type: 'success'
			    		        });
					    		_this.query();
						    }else{
						    	this.$message.error(res.data.msg);
							}
					  	}else{
					  		this.$message.error('网络请求失败');
					  	}
		    		})
		        })
			}else{
				this.$message({
			          message: '请至少选择一行数据进行操作',
			          type: 'warning'
			        });
			}
	  },
	  checkEvent ({ checked, records }) {
		  this.select_rows = records
            },
            headButtonAuth:function(item){
                if(item.auth_role!=null){
					var roles = item.auth_role.split(",");
					for(var i=0;i<roles.length;i++){
						if(this.user_roles.indexOf(roles[i])!=-1){
							return true;
						}
					}
                }else{
					return true;
                }
               	return false;
            },
            lineButtonAuth:function(item,row){
                if(item.auth_role!=null){
					var roles = item.auth_role.split(",");
					for(var i=0;i<roles.length;i++){
						if(this.user_roles.indexOf(roles[i])!=-1){
							if(item.auth_row!=null){
								var authrow = JSON.parse(item.auth_row);
								for(var j = 0;j<authrow.length;j++){
									for(let key  in row){
								        if(key == authrow[j].field){
									        var aaa = row[key]+authrow[j].operator+authrow[j].value;
								        	if(!eval(aaa)){
												return false;
									        }
									    }
								    }
								}
							}
							return true;
						}
					}
                }else{
              	  if(item.auth_row!=null){
					var authrow = JSON.parse(item.auth_row);
					for(var j = 0;j<authrow.length;j++){
						for(let key  in row){
					        if(key == authrow[j].field){
						        var aaa = row[key]+authrow[j].operator+authrow[j].value;
					        	if(!eval(aaa)){
									return false;
						        }
						    }
					    }
					}
				}
			  return true;
                }
                return false;
            }
  }, custom_methods)
}