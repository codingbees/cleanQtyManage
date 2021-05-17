package com.ray.controller.clean_binding;

import java.util.Date;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class EquipFeedingController extends Controller {
	public void getWorkshop(){
		renderJson(Db.find("select workshop as label,id as value from trace_basedata_workshop"));
	}
	public void getProductline(){
		renderJson(Db.find("select productline as label,id as value from trace_basedata_productline where workshop_id="+get("workshop")));
	}
	public void doFeeding(){
		Record result = new Record();
		Record clean_binding = Db.findFirst("select * from trace_workflow_cleanbinding where clean_box_no ='"+get("clean_box_no")+"'");
		if(clean_binding==null){
			result.set("code", 0);
			result.set("msg", "清洗框"+get("clean_box_no")+"没有绑定物料信息");
		}else{
			//判定零件是否属于该产品
			if(Db.find("select * from trace_basedata_part where product_id=" +get("product_no")+" and part_no ='"+get("part_no")+"'").isEmpty()){
				result.set("code", 0);
				result.set("msg", "清洗框"+get("clean_box_no")+"绑定物料不属于该产线/产品");
			}else{
				Record equip_feeding = new Record();
				equip_feeding.set("workshop", get("workshop"));
				equip_feeding.set("productline", get("productline"));
				equip_feeding.set("part_no", get("part_no"));
				equip_feeding.set("batch_no", get("batch_no"));
				equip_feeding.set("quantity", get("quantity"));
				equip_feeding.set("clean_box_no", get("clean_box_no"));
				equip_feeding.set("cleaning_time", get("create_time"));
				equip_feeding.set("feeding_time", new Date());
				Db.save("trace_workflow_equipfeeding", equip_feeding);
				Db.delete("trace_workflow_cleanbinding", clean_binding);
				result.set("code", 1);
				result.set("msg", "清洗框"+clean_binding.getStr("clean_box_no")+"完成扫码上料");
			}
		}
		renderJson(result);
	}
}
