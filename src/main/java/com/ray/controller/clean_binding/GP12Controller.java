package com.ray.controller.clean_binding;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.ray.util.HttpRequestUtil;

public class GP12Controller extends Controller{
	/*
	 * 到GP12页面
	 */
	public void to_gp12(){
		//获取设备编号
		String url = "http://192.168.18.108/getEquip";
		String equips = HttpRequestUtil.sendPostJson(url, null, "UTF-8");
		JSONArray equipArray = JSONArray.parseArray(equips);
		setAttr("equipArray", equipArray);
		render("/page/trace/lhdz_gp12.html");
	}
	public void to_gp12_secret(){
		//获取设备编号
		String url = "http://192.168.18.108/getEquip";
		String equips = HttpRequestUtil.sendPostJson(url, null, "UTF-8");
		JSONArray equipArray = JSONArray.parseArray(equips);
		setAttr("equipArray", equipArray);
		render("/page/trace/lhdz_gp12_secret.html");
	}
	/*
	 * 获取产品编号
	 */
	public void getProduct_no(){
		JSONObject jb = new JSONObject();
		jb.put("equip_no", get("equip_no"));
		String url = "http://192.168.18.108/getProduct";
		String products = HttpRequestUtil.sendPostJson(url, jb,
				"UTF-8");
		renderJson(products);
	}
	/*
	 * 获取二维码规则信息
	 */
	public void getGp12_rule_result(){
		// 获取产品打包规则
		JSONObject jb = new JSONObject();
		jb.put("product_no", get("product_no"));
		String url = "http://192.168.18.108/getRule";
		String product_rule = HttpRequestUtil.sendPostJson(url, jb,
				"UTF-8");
		renderJson(product_rule);
	}
	/*
	 * 执行性能测试删除
	 */
	public void DeleteLine(){
		JSONObject jb = new JSONObject();
		jb.put("barcode", get("barcode"));
		jb.put("tableName",  get("tableName"));
		jb.put("cloumnName",  get("cloumnName"));
		String delete_url = "http://192.168.18.108/DeleteLine";
		String delete= HttpRequestUtil.sendPostJson(delete_url, jb, "UTF-8");
		renderJson(delete);
	}
	/*
	 * 删除打包数据
	 */
	public void unpackage(){
		JSONObject unpacking_jb = new JSONObject();
		unpacking_jb.put("product_barcode", get("barcode"));
		unpacking_jb.put("tableName",  get("tableName"));
		String unpacking =  HttpRequestUtil.sendPostJson("http://192.168.18.108/unpacking", unpacking_jb, "UTF-8");
		renderJson(unpacking);
	}
	
	/*
	 * 检验产品是否打包
	 */
	public void boxRepeat(){
		JSONObject checkRepeat_jb = new JSONObject();
		checkRepeat_jb.put("box_barcode", get("barcode"));
		checkRepeat_jb.put("tableName",get("tableName"));
		String isRepeat =  HttpRequestUtil.sendPostJson("http://192.168.18.108/boxRepeat", checkRepeat_jb, "UTF-8");
		renderJson(isRepeat);
	}
	
	
	public void XncsOkOrNot(){
		JSONObject jb = new JSONObject();
		jb.put("barcode", get("barcode"));
		jb.put("tableName", get("tableName"));
		String url = "http://192.168.18.108/XncsOkOrNot";
		String xncsjc = HttpRequestUtil.sendPostJson(url, jb, "UTF-8");
		renderJson(xncsjc);
	}
	
	/*
	 * 检验产品是否打包
	 */
	public void GccsOkOrNot(){
		//性能测试
		JSONObject jb = new JSONObject();
		jb.put("barcode", get("barcode"));
		jb.put("id", get("id"));
		String url = "http://192.168.18.108/GccsOkOrNot";
		String gccsjc =HttpRequestUtil.sendPostJson(url, jb, "UTF-8");
		renderJson(gccsjc);
	}
	/*
	 * 产品打包
	 */
	public void Pack(){
		JSONObject gpProcode = new JSONObject();
		gpProcode.put("boxBarcode", get("boxBarcode"));
		JSONArray products = JSON.parseArray(get("products"));
		JSONArray productCodes = new JSONArray();
		for (int i = 0; i < products.size(); i++) {
			JSONObject productCode = new JSONObject();
			productCode.put("product_barcode", products.getJSONObject(i).getString("barcode"));
			productCodes.add(productCode);
		}
		gpProcode.put("data", productCodes);
		gpProcode.put("tableName", get("tableName"));
		String url = "http://192.168.18.108/Pack";
		String result = HttpRequestUtil.sendPostJson(url, gpProcode, "UTF-8");
		renderJson(result);
	}
	/*
	 * 联电的打包上传
	 */
	public void lhdz_pack(){
		JSONObject gpProcode = new JSONObject();
		//生成盒标签打包
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		String day = sdf.format(new Date());
		Record serial_num = Db.findFirst("select * from serial_number where day ='"+day+"'");
		StringBuffer sb = new StringBuffer();
		sb.append("FL1");
		if(serial_num==null){
			Record new_serial_num = new Record();
			new_serial_num.set("num", 2);
			new_serial_num.set("day", day);
			Db.save("serial_number", new_serial_num);
			String  ls_code= String.format("%0" + 4 + "d", 1);
			SimpleDateFormat sdf2= new SimpleDateFormat("yyMMdd"+ls_code+"-HH:mm");
			sb.append(sdf2.format(new Date()));
		}else{
			String  ls_code= String.format("%0" + 4 + "d", serial_num.getInt("num"));
			SimpleDateFormat sdf2= new SimpleDateFormat("yyMMdd"+ls_code+"-HH:mm");
			serial_num.set("num", serial_num.getInt("num")+1);
			Db.update("serial_number",serial_num);
			sb.append(sdf2.format(new Date()));
		}
		gpProcode.put("boxBarcode", sb.toString());
		JSONArray products = JSON.parseArray(get("products"));
		JSONArray productCodes = new JSONArray();
		Boolean flag = true;
		for (int i = 0; i < products.size(); i++) {
			Record rec = Db.use("dc").findFirst("select * from system.data_pack_lhdz where product_barcode ='"+products.getJSONObject(i).getString("barcode")+"'");
			if(rec!=null){
				flag=false;
				break;
			}
			JSONObject productCode = new JSONObject();
			productCode.put("product_barcode", products.getJSONObject(i).getString("barcode"));
			productCodes.add(productCode);
		}
		if(flag){
			gpProcode.put("data", productCodes);
			gpProcode.put("tableName", get("tableName"));
			String url = "http://192.168.18.108/Pack";
			String result = HttpRequestUtil.sendPostJson(url, gpProcode, "UTF-8");
			renderJson(result);
		}else{
			Record result = new Record();
			result.set("code", 1);
			result.set("msg", "请不要重复提交");
			renderJson(result);
		}
	}
	/*
	 * 判断产品是否重码
	 */
	public void IsRepeat(){
		JSONObject checkRepeat_jb = new JSONObject();
		checkRepeat_jb.put("product_barcode", get("product_barcode"));
		checkRepeat_jb.put("tableName", get("tableName"));
		String isRepeat =  HttpRequestUtil.sendPostJson("http://192.168.18.108/IsRepeat", checkRepeat_jb, "UTF-8");
		renderJson(isRepeat);
	}
	/*
	 * 跳转到二维码打印页面
	 */
	public void rePrint(){
		String[] productCodes = get("products").split(",");
		String[] productCodes1 = new String[12];
		String[] productCodes2 = new String[12];
		setAttr("product_no",get("product_no"));
		/*if(productCodes[0].contains("1704")){
			setAttr("product_no","F01RD0N704-01");
		}else if(productCodes[0].contains("5097")){
			setAttr("product_no","F01RD0N097-05");
		}else if(productCodes[0].contains("1117")){
			setAttr("product_no","F01RD0N117-01");
		}else if(productCodes[0].contains("7095")){
			setAttr("product_no","F01RD0N095-07");
		}*/
		//查询打包的盒标签
		Record rec = Db.use("dc").findFirst("select * from system.data_pack_lhdz where product_barcode ='"+productCodes[0]+"'");
		set("quantity",productCodes.length);
		setAttr("package_no", rec.getStr("box_barcode"));
		if(productCodes.length<12){
			System.arraycopy(productCodes,0,productCodes1, 0,productCodes.length);
		}else{
			System.arraycopy(productCodes,0,productCodes1, 0,12);
			System.arraycopy(productCodes,12,productCodes2, 0,productCodes.length-12);
		}
		setAttr("productCodes1",productCodes1);
		setAttr("productCodes2",productCodes2);
		render("/page/trace/print_qrcode.html");
	}
	/*
	 * 联合电子打包数据测试
	 */
	public void LhdzOkOrNot(){
		//先判断该二维码是否被拉黑，在判断气泡号是否正确
		String new_barcode = get("barcode");
		String old_barcode="";
		Record new_black = Db.use("dc").findFirst("select * from system.Data_GC_LHDZ_BLACKLIST WHERE barcode ='"+new_barcode+"'");
		Record result = new Record();
		if(new_black!=null){
			result.set("code", 0);
			result.set("msg", "该零件成品二维码已经拉黑");
		}else{
			Record bkzm = Db.use("dc").findFirst("select * from system.Data_GC_LHDZ_BKZM WHERE new_barcode ='"+new_barcode+"' order by create_time desc");
			if(bkzm!=null){
				old_barcode=bkzm.get("old_barcode");
				Record old_black = Db.use("dc").findFirst("select * from system.Data_GC_LHDZ_BLACKLIST WHERE barcode ='"+old_barcode+"'");
				if(old_black!=null){
					result.set("code", 0);
					result.set("msg", "该零件来料二维码已经拉黑");
				}else{
					List<Record> check_item = Db.use("dc").find("select * from system.DATA_GC_LHDZ_TESTING_RULE where is_test ='是' and check_measurement like '%"+get("product_no").split("-")[0]+"%'");
					StringBuffer sb =new StringBuffer();
					Boolean flag = true;
					for (Record record : check_item) {
						//三坐标数据校验
						Record check_sanzb = Db.use("dc").findFirst("select * from system.DATA_GC_LHDZ_SANZB where name ='"+record.getStr("check_name")+"' and measurement ='"+record.getStr("check_measurement")+"'and barcode ='"+new_barcode+"' order by create_time desc");
						//比对仪数据校验
						//合格的情况：1、三坐标数据合格2、没有三坐标数据，但是比对仪数据合格3没有三坐标数据，但是OD规数据合格,采用退一法保留4位小数
						if(check_sanzb!=null){
							if(BigDecimal.valueOf(Double.parseDouble(check_sanzb.get("value"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("analysis_usl"))).setScale(4, BigDecimal.ROUND_DOWN))==1){
								sb.append(record.getStr("check_name")+"的检测值为"+check_sanzb.get("value")+",大于上限值"+record.get("analysis_usl")+"; ");
								flag =false;
							}
							if(BigDecimal.valueOf(Double.parseDouble(check_sanzb.get("value"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("analysis_lsl"))).setScale(4, BigDecimal.ROUND_DOWN))==-1){
								sb.append(record.getStr("check_name")+"的检测值为"+check_sanzb.get("value")+",小余下限值"+record.get("analysis_lsl")+"; ");
								flag =false;
							}
						}else{
							Record check_bidy = Db.use("dc").findFirst("select * from system.DATA_GC_LHDZ_BIDY where name ='"+record.getStr("check_name")+"' and barcode ='"+new_barcode+"' order by create_time desc");
							if(check_bidy!=null){
								if(BigDecimal.valueOf(Double.parseDouble(check_bidy.get("value"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("analysis_usl"))).setScale(4, BigDecimal.ROUND_DOWN))==1){
									sb.append(record.getStr("check_name")+"的检测值为"+check_bidy.get("value")+",大于上限值"+record.get("analysis_usl")+"; ");
									flag =false;
								}
								if(BigDecimal.valueOf(Double.parseDouble(check_bidy.get("value"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("analysis_lsl"))).setScale(4, BigDecimal.ROUND_DOWN))==-1){
									sb.append(record.getStr("check_name")+"的检测值为"+check_bidy.get("value")+",小余下限值"+record.get("analysis_lsl")+"; ");
									flag =false;
								}
							}else{
								//如果没有比对仪的数据,则看是否是属于OD规检测项。
								if(record.get("IS_OD")!=null&&"".equals(record.get("IS_OD"))){
									Record check_od = Db.use("dc").findFirst("select regexp_replace(value,'[^0-9||.]') realValue,t.* from system.DATA_GC_LHDZ_30_40 t where type ='"+record.getStr("is_od")+"' and barcode like '%"+new_barcode+"%' order by create_time desc");
									if(check_od!=null){
										if(BigDecimal.valueOf(Double.parseDouble(check_od.get("realValue"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("OD_SX"))).setScale(4, BigDecimal.ROUND_DOWN))==1){
											sb.append(record.getStr("check_name")+"的OD规检测值为"+check_od.get("realValue")+",大于上限值"+record.get("OD_SX")+"; ");
											flag =false;
										}
										if(BigDecimal.valueOf(Double.parseDouble(check_od.get("realValue"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("OD_XX"))).setScale(4, BigDecimal.ROUND_DOWN))==-1){
											sb.append(record.getStr("check_name")+"的OD规检测值为"+check_od.get("realValue")+",小余下限值"+record.get("OD_XX")+"; ");
											flag =false;
										}
									}else{
										sb.append("没有找到"+record.getStr("check_name")+"的检测数据; ");
										flag =false;
									}
								}else{
									sb.append("没有找到"+record.getStr("check_name")+"的检测数据; ");
									flag =false;
								}
							}
						}
					}
					//判断90序清洗数据
					if(!flag){
						result.set("code", 0);
						result.set("msg", sb.toString());
					}else{
						result.set("code", 1);
						result.set("msg", "三坐标数据合格");
					}
				}
			}
		}
		renderJson(result);
	}
	
	public void test(){
		StringBuffer sb =new StringBuffer();
		Boolean flag = true;
		List<Record> check_item = Db.use("dc").find("select * from system.DATA_GC_LHDZ_TESTING_RULE where is_test ='是' and check_measurement like '%FL10.0028.97程序1%'");
		for (Record record : check_item) {
			if(record.get("IS_OD")!=null&&!"".equals(record.get("IS_OD"))){
				Record check_od = Db.use("dc").findFirst("select regexp_replace(value,'[^0-9||.]') realValue,t.* from system.DATA_GC_LHDZ_30_40 t where type ='"+record.getStr("is_od")+"' and barcode like '%L1Y208A0001DA02201220352%' order by create_time desc");
				if(check_od!=null){
					if(BigDecimal.valueOf(Double.parseDouble(check_od.get("realValue"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("OD_SX"))).setScale(4, BigDecimal.ROUND_DOWN))==1){
						sb.append(record.getStr("check_name")+"的OD规检测值为"+check_od.get("realValue")+",大于上限值"+record.get("OD_SX")+"; ");
						flag =false;
					}
					if(BigDecimal.valueOf(Double.parseDouble(check_od.get("realValue"))).setScale(4, BigDecimal.ROUND_DOWN).compareTo(BigDecimal.valueOf(Double.parseDouble(record.get("OD_XX"))).setScale(4, BigDecimal.ROUND_DOWN))==-1){
						sb.append(record.getStr("check_name")+"的OD规检测值为"+check_od.get("realValue")+",小余下限值"+record.get("OD_XX")+"; ");
						flag =false;
					}
				}else{
					sb.append("没有找到"+record.getStr("check_name")+"的检测数据; ");
					flag =false;
				}
			}
		}
		renderText(sb.toString());
		
	}
	public static void main(String[] args) {
		/*String str ="F1201350607111720001";
		String str2 = "F01RD0N"+str.substring(12, 15)+"-0"+str.substring(11,12);
		System.out.println(str2);*/
		
		BigDecimal c = new BigDecimal("2.224667").setScale(4, BigDecimal.ROUND_DOWN);
		System.out.println(c);
	}
}
