package com.ray.common.controller.base;

import java.util.List;

import com.jfinal.kit.PropKit;
import com.jfinal.kit.Ret;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.ray.common.controller.BaseController;
import com.ray.common.model.DataButton;
import com.ray.common.model.DataField;
import com.ray.common.model.DataObject;
import com.ray.common.model.Dicts;
/**
 * 数据模型处理类
 * @author Ray
 *
 */
public class DataController extends BaseController {
	
	public void index() {
		
	}
	
	public void getObjects() {
		List<DataObject> list = DataObject.dao.findAll();
		renderJson(list);
	}
	
	public void getFieldsAndButtons() {
		List<DataField> fields = DataField.dao.find("select * from data_field where data_object_id = "+get("object_id")+" order by order_num");
		List<DataButton> buttons = DataButton.dao.find("select * from data_button where data_object_id = "+get("object_id")+" order by order_num");
		Record resp = new Record();
		resp.set("fields", fields);
		resp.set("buttons", buttons);
		renderJson(resp);
	}
	
	public void getTables() {
		List<Record> list = Db.use("sys").find("select table_name as value from tables where table_schema = '"+PropKit.get("table_schema")+"'");
		renderJson(list);
	}
	
	public void newObject() {
		try {
			//生成元数据对象
			DataObject model = getModel(DataObject.class, "");
			if(model.getWhereAttr()==null) {
				model.setWhereAttr("");
			}
			model.save();
			//生成元数据对象字段
			List<Record> list = Db.use("sys")
					.find("select * from columns where table_schema = '"+PropKit.get("table_schema")+"' and table_name = '"
							+ get("table_name") + "' order by ORDINAL_POSITION");
			for (int i = 0; i < list.size(); i++) {
				DataField filed = new DataField();
				filed.setDataObjectId(model.getId());
				filed.setOrderNum(list.get(i).getInt("ORDINAL_POSITION"));
				filed.setEn(list.get(i).getStr("COLUMN_NAME"));
				filed.setCn(list.get(i).getStr("COLUMN_COMMENT"));
				if("int".equals(list.get(i).get("DATA_TYPE")) && !"PRI".equals(list.get(i).get("COLUMN_KEY"))) {
					filed.setType("select");
					//是否生成字典
					String comment = list.get(i).getStr("COLUMN_COMMENT");
					String[] temp = comment.split(":");
					if(temp.length==2) {
						filed.setCn(temp[0]);
						String[] temp1 = temp[1].split(",");
						for (int j = 0; j < temp1.length; j++) {
							String[] dict = temp1[j].split("=");
							Dicts dicts = new Dicts();
							dicts.setField(filed.getEn());
							dicts.setObject(model.getTableName());
							dicts.setName(dict[1]);
							dicts.setValue(Integer.valueOf(dict[0]));
							dicts.save();
						}
					}
					filed.setTypeConfig("from dicts where object='"+model.getTableName()+"' and field = '"+filed.getEn()+"'|name|value");
				}else if("tinyint".equals(list.get(i).get("DATA_TYPE"))) {
					filed.setType("switch");
					filed.setTypeConfig("from table_name where 1=1|label|value");
				}else if("date".equals(list.get(i).get("DATA_TYPE"))) {
					filed.setType("date");
				}else if("datetime".equals(list.get(i).get("DATA_TYPE"))) {
					filed.setType("datetime");
				}
				filed.save();
			}
			renderJson(Ret.ok("msg", "新建模型成功"));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("error", e.getMessage()));
		}
	}
	
	/**
	 * 更新
	 */
	public void updateObject() {
		try {
			//元数据对象
			DataObject model = getModel(DataObject.class, "",true);
			//已有字段
			List<DataField> hasList = DataField.dao.find("select * from data_field where data_object_id = "+model.getId());
			//生成元数据对象字段
			List<Record> list = Db.use("sys")
					.find("select * from columns where table_schema = '"+PropKit.get("table_schema")+"' and table_name = '"
							+ model.getTableName() + "' order by ORDINAL_POSITION");
			for (int i = 0; i < list.size(); i++) {
				boolean flag = true;
				for (int j = 0; j < hasList.size(); j++) {
					if(list.get(i).getStr("COLUMN_NAME").equals(hasList.get(j).getEn())) {
						flag = false;
					}
				}
				if(flag) {
					DataField filed = new DataField();
					filed.setDataObjectId(model.getId());
					filed.setOrderNum(list.get(i).getInt("ORDINAL_POSITION"));
					filed.setEn(list.get(i).getStr("COLUMN_NAME"));
					filed.setCn(list.get(i).getStr("COLUMN_COMMENT"));
					if("int".equals(list.get(i).get("DATA_TYPE")) && !"PRI".equals(list.get(i).get("COLUMN_KEY"))) {
						filed.setType("select");
						//是否生成字典
						String comment = list.get(i).getStr("COLUMN_COMMENT");
						String[] temp = comment.split(":");
						if(temp.length==2) {
							filed.setCn(temp[0]);
							String[] temp1 = temp[1].split(",");
							for (int j = 0; j < temp1.length; j++) {
								String[] dict = temp1[j].split("=");
								Dicts dicts = Dicts.dao.findFirst("select * from dicts where field = '"+filed.getEn()+"'"
										+ " and object = '"+model.getTableName()+"'"
										+ " and name = '"+dict[1]+"'"
										+ " and value = "+Integer.valueOf(dict[0]));
								if(dicts==null) {
									dicts = new Dicts();
									dicts.setField(filed.getEn());
									dicts.setObject(model.getTableName());
									dicts.setName(dict[1]);
									dicts.setValue(Integer.valueOf(dict[0]));
									dicts.save();
								}
							}
						}
						filed.setTypeConfig("from dicts where object='"+model.getTableName()+"' and field = '"+filed.getEn()+"'|name|value");
					}else if("tinyint".equals(list.get(i).get("DATA_TYPE"))) {
						filed.setType("switch");
						filed.setTypeConfig("from table_name where 1=1|label|value");
					}else if("date".equals(list.get(i).get("DATA_TYPE"))) {
						filed.setType("date");
					}else if("datetime".equals(list.get(i).get("DATA_TYPE"))) {
						filed.setType("datetime");
					}
					filed.save();
				}
			}
			renderJson(Ret.ok("msg", "更新模型成功"));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("error", e.getMessage()));
		}
	}
	
	/**
	 * 复制模型
	 */
	public void copyObject() {
		try {
			DataObject model = getModel(DataObject.class, "",true);
			List<DataField> list = DataField.dao.find("select * from data_field where data_object_id = "+model.getId());
			model.remove("id");
			model.setEn(model.getEn()+"_copy");
			model.setCn(model.getCn()+"_copy");
			model.save();
			for (int i = 0; i < list.size(); i++) {
				list.get(i).remove("id");
				list.get(i).setDataObjectId(model.getId());
				list.get(i).save();
			}
			renderJson(Ret.ok("msg", "复制数据模型成功！"));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("msg", "复制数据模型失败：" + e.getMessage()));
		}
	}
	
	public void changeObject() {
		try {
			DataObject model = getModel(DataObject.class,"",true);
			model.update();
			renderJson(Ret.ok("msg", "修改成功！"));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("error",e.getMessage()));
		}
	}
	
	public void del() {
		try {
			Db.delete("delete from data_field where data_object_id = "+get("id"));
			Db.deleteById("data_object", get("id"));
			renderJson(Ret.ok("msg", "删除成功"));
		} catch (Exception e) {
			renderJson(Ret.fail("error", "删除失败,"+e.getMessage()));
		}
	}
	
	public void newField() {
		try {
			DataField model = getModel(DataField.class,"");
			model.setIsFictitious(true);
			model.setIsUpdate(false);
			model.setIsAdd(false);
			model.save();
			renderJson(Ret.ok("msg", "添加成功！").set("row", model));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("msg",e.getMessage()));
		}
	}
	
	public void changeFiled() {
		try {
			DataField model = getModel(DataField.class,"",true);
			model.update();
			renderJson(Ret.ok("msg", "修改成功！"));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("error",e.getMessage()));
		}
	}
	
	public void delField() {
		try {
			Db.deleteById("data_field", get("id"));
			renderJson(Ret.ok("msg", "删除成功"));
		} catch (Exception e) {
			renderJson(Ret.fail("msg", "删除失败,"+e.getMessage()));
		}
	}
	
	public void newButton() {
		try {
			DataButton model = getModel(DataButton.class,"");
			model.save();
			renderJson(Ret.ok("msg", "添加成功！").set("row", model));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("msg",e.getMessage()));
		}
	}
	
	public void changeButton() {
		try {
			DataButton model = getModel(DataButton.class,"",true);
			model.update();
			renderJson(Ret.ok("msg", "修改成功！"));
		} catch (Exception e) {
			e.printStackTrace();
			renderJson(Ret.fail("msg",e.getMessage()));
		}
	}
	
	public void delButton() {
		try {
			Db.deleteById("data_button", get("id"));
			renderJson(Ret.ok("msg", "删除成功"));
		} catch (Exception e) {
			renderJson(Ret.fail("msg", "删除失败,"+e.getMessage()));
		}
	}
}
