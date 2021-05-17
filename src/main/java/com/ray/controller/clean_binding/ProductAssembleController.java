package com.ray.controller.clean_binding;

import java.util.Date;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class ProductAssembleController extends Controller {
	public void getProduct(){
		renderJson(Db.find("select product_no as label,id as value from trace_basedata_product where productline_id="+get("productline")));
	}
	public void getGp12Rule(){
		renderJson(Db.find("select * from trace_basedata_product_rule where product_id="+get("product")));
	}
	/*
	 * 传入数据为车间id，产线id，产品id，产品二维码
	 * 判定顺序：
	 * 1、判定产品是否符合二维码规则
	 * 2、判定产品的子部件数量是否足够
	 * 3、判定产品是否已经打包,是则询问并反馈
	 */
	public void scanProduct(){
		Record result = new Record();
		List<Record> productRules = Db.find("select * from trace_basedata_product_rule where product_id ="+get("product_no"));
		Boolean productRulesFlag = false;
		for (Record productRule : productRules) {
			if(get("barcode").contains(productRule.getStr("product_rule"))&&get("barcode").length()==Integer.parseInt(productRule.getStr("product_length"))){
				productRulesFlag=true;
			}
		}
		StringBuffer sb = new StringBuffer();
		if(productRulesFlag){
			List<Record> parts = Db.find("select * from trace_basedata_part where product_id="+ get("product_no"));
			Boolean partsFlag = true;
			for (Record part : parts) {
				Record stock = Db.findFirst("select part_no,sum(quantity) quantity from trace_workflow_equipfeeding"
						+ " where workshop="+get("workshop")
						+ " and productline ="+get("productline")
						+ " and part_no ='"+part.getStr("part_no")+"'");
				if(stock.get("quantity")==null||stock.getInt("quantity")<Integer.parseInt(part.getStr("consumption_quantity"))){
					partsFlag=false;
					sb.append(part.get("part_no")+"的数量为"+stock.getInt("quantity"));
				}
			}
			if(partsFlag){
				List<Record> olds = Db.find("select * from trace_workflow_assemble where barcode ='"+get("barcode")+"'");
				if(olds.isEmpty()){
					result.set("code", "1");
					result.set("msg", "完成绑定");
				}else{
					result.set("code", 2);
					result.set("msg", "该成品已绑定，是否覆盖绑定零部件？");
				}
			}else{
				result.set("code", 0);
				result.set("msg", "设备上料数量不足："+sb.toString());
			}
		}else{
			result.set("code", 0);
			result.set("msg", "二维码不符合产品规则");
		}
		renderJson(result);
	}
	/*
	 * 执行绑定
	 */
	public void doProductAssemble(){
		Record result = new Record();
		List<Record> productRules = Db.find("select * from trace_basedata_product_rule where product_id ="+get("product_no"));
		Boolean productRulesFlag = false;
		for (Record productRule : productRules) {
			if(get("barcode").contains(productRule.getStr("product_rule"))&&get("barcode").length()==Integer.parseInt(productRule.getStr("product_length"))){
				productRulesFlag=true;
			}
		}
		StringBuffer sb = new StringBuffer();
		if(productRulesFlag){
			List<Record> parts = Db.find("select * from trace_basedata_part where product_id="+ get("product_no"));
			Boolean partsFlag = true;
			for (Record part : parts) {
				Record stock = Db.findFirst("select part_no,sum(quantity) quantity from trace_workflow_equipfeeding"
						+ " where workshop="+get("workshop")
						+ " and productline ="+get("productline")
						+ " and part_no ='"+part.getStr("part_no")+"'");
				if(stock.get("quantity")==null||stock.getInt("quantity")<Integer.parseInt(part.getStr("consumption_quantity"))){
					partsFlag=false;
					sb.append(part.get("part_no")+"的数量为"+stock.getInt("quantity"));
				}
			}
			if(partsFlag){
				Record assemble = new Record();
				assemble.set("workshop_id", get("workshop"));
				assemble.set("productline_id", get("productline"));
				assemble.set("product_id", get("product_no"));
				assemble.set("barcode", get("barcode"));
				assemble.set("create_time", new Date());
				Db.save("trace_workflow_assemble", assemble);
				for (Record part : parts) {
					int need_quantity = Integer.parseInt(part.getStr("consumption_quantity"));
					while(need_quantity>0){
						Record stock = Db.findFirst("select * from trace_workflow_equipfeeding"
								+ " where workshop="+get("workshop")
								+ " and productline ="+get("productline")
								+ " and part_no ='"+part.getStr("part_no")+"' order by feeding_time");
						if(stock.get("quantity")==null||stock.getInt("quantity")==0){
							Db.delete("trace_workflow_equipfeeding",stock);
							//如果该项库存大于需求数量
						}else if(stock.getInt("quantity")>need_quantity){
							Record detail = new Record();
							detail.set("assemble_id", assemble.get("id"));
							detail.set("part_no", part.getStr("part_no"));
							detail.set("batch_no", stock.getStr("batch_no"));
							detail.set("quantity", need_quantity);
							Db.save("trace_workflow_assemble_detail", detail);
							stock.set("quantity", stock.getInt("quantity")-need_quantity);
							Db.update("trace_workflow_equipfeeding",stock);
							need_quantity=0;
							//如果等于或小于
						}else if(stock.getInt("quantity")<=need_quantity){
							need_quantity=need_quantity-stock.getInt("quantity");
							Record detail = new Record();
							detail.set("assemble_id", assemble.get("id"));
							detail.set("part_no", part.getStr("part_no"));
							detail.set("batch_no", stock.getStr("batch_no"));
							detail.set("quantity", stock.getInt("quantity"));
							Db.save("trace_workflow_assemble_detail", detail);
							Db.delete("trace_workflow_equipfeeding",stock);
						}
					}
				}
				result.set("assemble", assemble);
				result.set("code", 1);
				result.set("msg", "成品绑定批次成功");
			}else{
				result.set("code", 0);
				result.set("msg", "设备上料数量不足："+sb.toString());
			}
		}else{
			result.set("code", 0);
			result.set("msg", "二维码不符合产品规则");
		}
		renderJson(result);
	}
}
