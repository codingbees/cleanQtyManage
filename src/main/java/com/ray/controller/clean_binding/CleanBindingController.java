package com.ray.controller.clean_binding;

import java.util.Date;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class CleanBindingController extends Controller {
	/*
	 * 扫描二维码后根据二维码格式判断是清洗框还是批次二维码
	 * 如果是清洗框二维码,判断数据库中是否有未上料的清洗框,有则返回 code 0和msg。没有则返回code 1
	 * 如果是批次二维码  返回code 2,part_no,batch_no,quantity
	 */
	public void getBarcode(){
		String barcode = get("barcode");
		Record result = new Record();
		String[] strs = barcode.split(",");
		if(strs.length==4){
			Record part_no = Db.findFirst("select * from trace_basedata_part where part_no='"+strs[0]+"'");
			if(part_no!=null){
				result.set("part_no", strs[0]);
				result.set("batch_no", strs[2]);
				if(part_no.get("feeding_quantity")==null||"".equals(part_no.get("feeding_quantity"))){
					result.set("code", 0);
					result.set("msg", "该子部件没有设置单框清洗数量");
				}else{
					result.set("code", 2);
					result.set("quantity", part_no.get("feeding_quantity"));
				}
			}else{
				result.set("code", 0);
				result.set("msg", "没有找到该子部件所属的BOM信息");
			}
		}else{
			if(Db.find("select * from trace_workflow_cleanbinding where clean_box_no ='"+barcode+"'").isEmpty()){
				result.set("code", 1);
			}else{
				result.set("code", 0);
				result.set("msg", "清洗框"+barcode+"已绑定其他物料,且未进行上料或解绑");
			}
		}
		renderJson(result);
	}
	/*
	 * 执行清洗框绑定
	 * 判断清洗框是否已绑定
	 */
	public void doCleanBinding(){
		Record result = new Record();
		String clean_box_no = get("clean_box_no");
		Record cleanBinding = new Record();
		if(Db.find("select * from trace_workflow_cleanbinding where clean_box_no ='"+clean_box_no+"'").isEmpty()){
			result.set("code", 1);
			cleanBinding.set("part_no", get("part_no"));
			cleanBinding.set("batch_no", get("batch_no"));
			cleanBinding.set("quantity", get("quantity"));
			cleanBinding.set("clean_box_no", clean_box_no);
			cleanBinding.set("create_time", new Date());
			Db.save("trace_workflow_cleanbinding", cleanBinding);
			result.set("msg", "清洗框"+clean_box_no+"绑定物料批次"+get("batch_no")+"成功");
		}else{
			result.set("code", 0);
			result.set("msg", "清洗框"+clean_box_no+"已绑定其他物料,且未进行上料或解绑");
		}
		renderJson(result);
	}
	
	
	/*
	 * 获取清洗绑定信息
	 */
	public void getCleanBinding(){
		Record result = new Record();
		String clean_box_no = get("clean_box_no");
		Record clean_binding = Db.findFirst("select * from trace_workflow_cleanbinding where clean_box_no ='"+clean_box_no+"' order by create_time desc");
		if(clean_binding==null){
			result.set("code", 0);
			result.set("msg", "清洗框"+clean_box_no+"没有绑定物料信息");
		}else{
			result.set("code", 1);
			result.set("clean_binding", clean_binding);
		}
		renderJson(result);
	}
	public void deleteCleanBinding(){
		Record result = new Record();
		Record clean_binding = Db.findById("trace_workflow_cleanbinding", get("id"));
		if(clean_binding==null){
			result.set("code", 0);
			result.set("msg", "清洗框"+get("clean_box_no")+"没有绑定物料信息");
		}else{
			Db.delete("trace_workflow_cleanbinding", clean_binding);
			result.set("code", 1);
			result.set("msg", "清洗框"+clean_binding.getStr("clean_box_no")+"已经解除绑定");

		}
		renderJson(result);
	}
}
