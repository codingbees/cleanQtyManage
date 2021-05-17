package com.ray.controller.dingding.material_scrap;

import java.util.Date;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class MaterialScrapController extends Controller {
	public void getWorkshop(){
		renderJson(Db.find("select * from trace_basedata_workshop"));
	}
	public void getProductline(){
		renderJson(Db.find("select id,productline from trace_basedata_productline where workshop_id ="+get("workshop_id")));
		
	}
	public void getProduct(){
		renderJson(Db.find("select id,product_no from trace_basedata_product where productline_id ="+get("productline_id")));
	}
	public void getPart(){
		renderJson(Db.find("select t1.id,part_no,consumption_quantity,"
				+"(select productline_id from trace_basedata_product t2 where t2.id = t1.product_id) productline_id,"
				+"(select sum(t3.quantity)  from trace_workflow_equipfeeding t3 where t3.part_no = t1.part_no and productline=productline_id) quantity from trace_basedata_part t1"
				+" where product_id = "+get("product_id")));
	}
	/*
	 * 根据产品id 判断数量
	 */
	public void doMaterialScrap(){
		Record result = new Record();
		List<Record> parts = Db.find("select * from trace_basedata_part where product_id="+get("product_id"));
		//线判断数量
		Boolean partsFlag = true;
		for (Record part : parts) {
			Record stock = Db.findFirst("select sum(quantity) quantity from trace_workflow_equipfeeding"
					+ " where workshop="+get("workshop_id")
					+ " and productline ="+get("productline_id")
					+ " and part_no ='"+part.getStr("part_no")+"'");
			if(getInt("quantity"+part.getStr("id"))!=null&&getInt("quantity"+part.getStr("id"))!=0&&(stock.get("quantity")==null||stock.getInt("quantity")<getInt("quantity"+part.getStr("id")))){
				partsFlag=false;
			}
		}
		if(partsFlag){
			Record materialScrap = new Record();
			materialScrap.set("workshop_id", get("workshop_id"));
			materialScrap.set("productline_id", get("productline_id"));
			materialScrap.set("product_id", get("product_id"));
			materialScrap.set("create_time", new Date());
			materialScrap.set("create_user", get("publishName"));
			Db.save("trace_workflow_material_scrap", materialScrap);
			for (Record part : parts) {
				if(getInt("quantity"+part.getStr("id"))!=null){
					int need_quantity = getInt("quantity"+part.getStr("id"));
					while(need_quantity>0){
						Record stock = Db.findFirst("select * from trace_workflow_equipfeeding"
								+ " where workshop="+get("workshop_id")
								+ " and productline ="+get("productline_id")
								+ " and part_no ='"+part.getStr("part_no")+"' order by feeding_time");
						if(stock.get("quantity")==null||stock.getInt("quantity")==0){
							Db.delete("trace_workflow_equipfeeding",stock);
							//如果该项库存大于需求数量
						}else if(stock.getInt("quantity")>need_quantity){
							Record detail = new Record();
							detail.set("assemble_id", materialScrap.get("id"));
							detail.set("part_no", part.getStr("part_no"));
							detail.set("batch_no", stock.getStr("batch_no"));
							detail.set("quantity", need_quantity);
							Db.save("trace_workflow_material_scrap_detail", detail);
							stock.set("quantity", stock.getInt("quantity")-need_quantity);
							Db.update("trace_workflow_equipfeeding",stock);
							need_quantity=0;
							//如果等于或小于
						}else if(stock.getInt("quantity")<=need_quantity){
							need_quantity=need_quantity-stock.getInt("quantity");
							Record detail = new Record();
							detail.set("assemble_id", materialScrap.get("id"));
							detail.set("part_no", part.getStr("part_no"));
							detail.set("batch_no", stock.getStr("batch_no"));
							detail.set("quantity", stock.getInt("quantity"));
							Db.save("trace_workflow_material_scrap_detail", detail);
							Db.delete("trace_workflow_equipfeeding",stock);
						}
					}
				}
			}
			result.set("code", 1);
			result.set("msg", "成品绑定批次成功");
		}else{
			result.set("code", 0);
			result.set("msg", "设备上料数量不足");
		}
		renderJson(result);
	}
}

