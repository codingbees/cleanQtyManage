package com.ray.controller.customerQrcode;

import java.util.Date;
import java.util.List;

import com.jfinal.core.Controller;
import com.jfinal.kit.Ret;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.ray.common.model.TraceWorkflowCustomerQrcodeHistory;
import com.ray.common.model.TraceWorkflowCustomerQrcodeRule;

public class CustomerQrcodeController extends Controller {
	/**
	 * @author Lei
	 * @contact 346883997@qq.com
	 * @time 2021年4月8日 下午5:26:56
	 */
	public void getProducts() {
		List<Record> products = Db.find("select distinct productno label,productno value from trace_workflow_customer_qrcode_rule");
		for (Record product : products) {
			product.set("children", Db.find("select type label,type value from trace_workflow_customer_qrcode_rule where productno ='"+product.getStr("value")+"'"));
		}
		renderJson(products);
	}
	/**
	 * @author Lei
	 * @contact 346883997@qq.com
	 * @time 2021年4月8日 下午5:42:03
	 */
	public void getRule() {
		TraceWorkflowCustomerQrcodeRule rule = TraceWorkflowCustomerQrcodeRule.dao.findFirst("select * from trace_workflow_customer_qrcode_rule where productno='"+get("productno")+"' and type='"+get("type")+"'");
		renderJson(rule);
	}
	/**
	 * @author Lei
	 * @contact 346883997@qq.com
	 * @time 2021年4月9日 上午9:13:44
	 * 判定客户盒标签或公司内部盒标签是否重码。
	 */
	public void bindCustomerQrcode() {
		StringBuffer failMsg =new StringBuffer();
		Boolean flag = true;
		if(!TraceWorkflowCustomerQrcodeHistory.dao.find("select * from trace_workflow_customer_qrcode_history where inside_code ='"+get("inside_code")+"'").isEmpty()){
			flag=false;
			failMsg.append("内部盒标签已被绑定\r\n");
		}
		if(!TraceWorkflowCustomerQrcodeHistory.dao.find("select * from trace_workflow_customer_qrcode_history where customer_code ='"+get("customer_code")+"'").isEmpty()){
			flag=false;
			failMsg.append("客户盒标签已被绑定\r\n");
		}
		if(flag){
			TraceWorkflowCustomerQrcodeHistory item = getModel(TraceWorkflowCustomerQrcodeHistory.class,"");
			item.setCreateTime(new Date());
			item.save();
			renderJson(Ret.ok());
		}else{
			renderJson(Ret.fail("msg", failMsg.toString()));
		}
	}
}
