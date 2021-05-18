package com.ray.controller.clean_binding;

import com.github.liaochong.myexcel.core.DefaultExcelReader;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Date;
import java.util.Date;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.template.stat.ast.Set;
import com.jfinal.upload.UploadFile;
import com.ray.common.model.File;
import com.ray.common.model.WashingPlanParts;
import com.ray.common.excelModel.ProductPlan;

public class CleanQtyManageController extends Controller {
	// 完成清洗的接口
	// @params clean_box_no String
	public void finishWashing(){
		Record result = new Record();
		String clean_box_no = get("clean_box_no");
		if(!Db.find("select * from trace_workflow_cleanbinding where clean_box_no ='"+clean_box_no+"'").isEmpty()){
			Db.update("update trace_workflow_cleanbinding set clean_box_status = 2 where clean_box_no ='"+clean_box_no+"' and clean_box_status = 1 ");
			result.set("code", 200);
			result.set("msg", "成功，清洗框"+clean_box_no+"已清洗完成");
		}else{
			result.set("code", 0);
			result.set("msg", "失败，清洗框"+clean_box_no+"还未绑定或已使用，无法上传数据！");
		}
		renderJson(result);
	}
	//物料使用后上线
	public void useMaterial(){
		Record result = new Record();
		String clean_box_no = get("clean_box_no");
		if(!Db.find("select * from trace_workflow_cleanbinding where clean_box_no ='"+clean_box_no+"' and clean_box_status = 2").isEmpty()){
			Db.update("update trace_workflow_cleanbinding set clean_box_status = 3 where clean_box_no ='"+clean_box_no+"' and clean_box_status = 2 ");
			result.set("code", 200);
			result.set("msg", "成功，清洗框"+clean_box_no+"已上料完成");
		}else{
			result.set("code", 0);
			result.set("msg", "失败，清洗框"+clean_box_no+"还未绑定或未清洗或已使用，无法上传数据！");
		}
		renderJson(result);
	}

	public void getLatestPlan(){
		Record record = new Record();
		String sql = "SELECT * FROM washing_plan_parts WHERE date_id IN (SELECT MAX(date_id) AS latest_id FROM washing_plan_parts) ORDER BY id ASC";
		List<Record> washingPlanPartsRecord =  Db.find(sql);
		record.set("washingPlanPartsRecord",washingPlanPartsRecord);
		renderJson(record);
	}
	public void saveDailyPlan(){
		Record record = new Record();
		WashingPlanParts washingPlanParts = getModel(WashingPlanParts.class,"");
		try {
			washingPlanParts.save();
			record.set("message","保存成功");
			record.set("code",200);
		}catch (Exception e){
			record.set("message",e);
			record.set("code",0);
		}

		renderJson(record);
	}
	public void statisticData(){
		render("/page/part_trace/statistic_data.html");
	}
	public void getDailyPlan(){
		Record record = new Record();
		String sqlPlan = "SELECT t.part_no AS part_no,SUM(p.qty*t.consumption_quantity) AS req_qty  FROM (SELECT* FROM trace_basedata_part  WHERE product_id\n" +
				" IN (SELECT product_id FROM washing_plan_parts\n" +
				"WHERE plan_date = '"+get("date")+"'\n" +
				"GROUP BY  part_no) AND  is_display = 1) t \n" +
				"LEFT OUTER JOIN\n" +
				"(SELECT t.part_no AS part,t.product_id AS pro, SUM(t.qty) AS qty,t.plan_date FROM washing_plan_parts t\n" +
				"WHERE plan_date = '"+get("date")+"'\n" +
				"GROUP BY  part) p\n" +
				"ON t.product_id = p.pro\n" +
				"GROUP BY t.part_no";
		List<Record> listPlan = Db.find(sqlPlan);
		record.set("result",listPlan);
		renderJson(record);

	}
	public void getPlanData(){
		Record record = new Record();
		String sqlPlan = "SELECT t.part_no AS part_no,SUM(p.qty*t.consumption_quantity) AS req_qty  FROM (SELECT* FROM trace_basedata_part  WHERE product_id\n" +
				" IN (SELECT product_id FROM washing_plan_parts\n" +
				"WHERE plan_date = '"+get("date")+"'\n" +
				"GROUP BY  part_no) AND  is_display = 1) t \n" +
				"LEFT OUTER JOIN\n" +
				"(SELECT t.part_no AS part,t.product_id AS pro, SUM(t.qty) AS qty,t.plan_date FROM washing_plan_parts t\n" +
				"WHERE plan_date = '"+get("date")+"'\n" +
				"GROUP BY  part) p\n" +
				"ON t.product_id = p.pro\n" +
				"GROUP BY t.part_no";
		List<Record> listPlan = Db.find(sqlPlan);
		record.set("resultPlan",listPlan);
		//获取该日计划的零件的最新在清洗的库存

		String sql = "SELECT t.part_no AS part_no,IFNULL(SUM(p.qty*t.consumption_quantity),0) AS real_time_qty FROM (SELECT* FROM trace_basedata_part  WHERE product_id\n" +
				" IN (SELECT product_id FROM washing_plan_parts\n" +
				"WHERE plan_date = '"+get("date")+"'\n" +
				"GROUP BY  part_no) AND  is_display = 1) t \n" +
				"LEFT OUTER JOIN\n" +
				"(SELECT part_no, SUM(quantity) AS qty FROM trace_workflow_cleanbinding where clean_box_status = '1' or clean_box_status = '2' \n" +
				"GROUP BY  part_no) p\n" +
				"ON t.part_no = p.part_no\n" +
				"GROUP BY t.part_no";
		List<Record> list = Db.find(sql);
		record.set("result",list);
		renderJson(record);
	}
	public void getRealTimeInv(){
		Record record = new Record();
		String sqlPlan = "SELECT part_no, SUM(quantity) AS total_qty FROM trace_workflow_cleanbinding WHERE part_no LIKE 'L07%' OR part_no LIKE 'F07%' GROUP BY part_no ";
		List<Record> realTimeInv = Db.find(sqlPlan);
		record.set("RealTimeInv",realTimeInv);
		renderJson(record);
	}
	//读取excel文件上传计划
	public void uploadPlan(){
		Record record = new Record();
		Db.tx(() -> {
			try {
				UploadFile file = getFile("file", "temp");
				InputStream is = new FileInputStream(file.getFile());
				System.out.println(is);
				List<com.ray.common.excelModel.ProductPlan> list = DefaultExcelReader.of(com.ray.common.excelModel.ProductPlan.class).sheet(8).rowFilter(row -> row.getRowNum()>2).read(is);
				for (ProductPlan productPlan : list) {
					System.out.println(productPlan.getProductLine());
					System.out.println(productPlan.getShift());
					System.out.println(productPlan.getPartNo());
					System.out.println(productPlan.getPartName());
					System.out.println(productPlan.getPlanQty());
					System.out.println(productPlan.getNote());
					System.out.println("================================");
				}
				record.set("code", 200);
				record.set("msg", "导入审核计划成功！");
				return true;
			} catch (Exception e) {
				// TODO: handle exception
				e.printStackTrace();
				record.set("code", 0);
				record.set("msg", "操作失败：" + e.getMessage());
				return false;
			}
		});

		renderJson(record);
	}
//	public void importPlan(){
//		Record req = new Record();
//		Db.tx(() -> {
//			try {
//				UploadFile file = getFile("file", "temp");
//				InputStream is = new FileInputStream(file.getFile());
//
//				String pc_no = "PC"+CgUtil.getRandomNumber();
//				List<com.ray.excelModel.CgPlan> list = DefaultExcelReader.of(com.ray.excelModel.CgPlan.class).sheet(0).rowFilter(row -> row.getRowNum()>3).read(is);
//				for (int i = 0; i < list.size(); i++) {
//					String numbers = CgUtil.getRandomNumber();
//					CgPlan cgPlan = new CgPlan();
//					cgPlan.setCgNo("CG"+numbers);
//					cgPlan.setType(getPara("cgtype"));
//
//					Workshop workshop = Workshop.dao.findFirst("SELECT * FROM workshop WHERE name = ?",list.get(i).getWork_name());
//					System.err.println("车间名称："+list.get(i).getWork_name());
//					cgPlan.setWorkId(workshop.getId());
//					cgPlan.setWlName(list.get(i).getWl_name());
//					UserMes userMes = UserMes.dao.findFirst("SELECT * FROM user_mes WHERE user_jobnumber = ?",list.get(i).getSh_gonghao());
//					cgPlan.setShUserid(userMes.getUserDingid());
//					cgPlan.setShUsername(userMes.getUserName());
//					cgPlan.setShGonghao(userMes.getUserJobnumber());
//					cgPlan.setTheyear(getParaToInt("theyear"));
//					if (list.get(i).getMonth1() != null) {
//						cgPlan.setThemonth(1);
//						cgPlan.setAborc(list.get(i).getMonth1());
//					}
//					if (list.get(i).getMonth2() != null) {
//						cgPlan.setThemonth(2);
//						cgPlan.setAborc(list.get(i).getMonth2());
//					}
//					if (list.get(i).getMonth3() != null) {
//						cgPlan.setThemonth(3);
//						cgPlan.setAborc(list.get(i).getMonth3());
//					}
//					if (list.get(i).getMonth4() != null) {
//						cgPlan.setThemonth(4);
//						cgPlan.setAborc(list.get(i).getMonth4());
//					}
//					if (list.get(i).getMonth5() != null) {
//						cgPlan.setThemonth(5);
//						cgPlan.setAborc(list.get(i).getMonth5());
//					}
//					if (list.get(i).getMonth6() != null) {
//						cgPlan.setThemonth(6);
//						cgPlan.setAborc(list.get(i).getMonth6());
//					}
//					if (list.get(i).getMonth7() != null) {
//						cgPlan.setThemonth(7);
//						cgPlan.setAborc(list.get(i).getMonth7());
//					}
//					if (list.get(i).getMonth8() != null) {
//						cgPlan.setThemonth(8);
//						cgPlan.setAborc(list.get(i).getMonth8());
//					}
//					if (list.get(i).getMonth9() != null) {
//						cgPlan.setThemonth(9);
//						cgPlan.setAborc(list.get(i).getMonth9());
//					}
//					if (list.get(i).getMonth10() != null) {
//						cgPlan.setThemonth(10);
//						cgPlan.setAborc(list.get(i).getMonth10());
//					}
//					if (list.get(i).getMonth11() != null) {
//						cgPlan.setThemonth(11);
//						cgPlan.setAborc(list.get(i).getMonth11());
//					}
//					if (list.get(i).getMonth12() != null) {
//						cgPlan.setThemonth(12);
//						cgPlan.setAborc(list.get(i).getMonth12());
//					}
//					cgPlan.setPcNo(pc_no);
//					cgPlan.save();
//				}
//				req.set("code", 0);
//				req.set("msg", "导入审核计划成功！");
//				return true;
//			} catch (Exception e) {
//				// TODO: handle exception
//				e.printStackTrace();
//				req.set("code", 1);
//				req.set("msg", "操作失败：" + e.getMessage());
//				return false;
//			}
//		});
//		renderJson(req);
//	}
}
