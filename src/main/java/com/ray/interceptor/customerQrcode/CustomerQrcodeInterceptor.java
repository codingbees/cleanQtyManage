package com.ray.interceptor.customerQrcode;

import com.jfinal.plugin.activerecord.Db;
import com.ray.common.interceptor.AopContext;
import com.ray.common.interceptor.MetaObjectIntercept;

public class CustomerQrcodeInterceptor extends MetaObjectIntercept {
	@Override
	public String addBefore(AopContext ac) throws Exception {
		if(!Db.find("select * from trace_workflow_customer_qrcode_rule where productno='"+ac.record.get("productno")+"' and type='"+ac.record.get("type")+"'").isEmpty()){
			return "该零件号的基地/包装/客户/产品状态区分已存在请重新创建";
		}else{
			return super.addBefore(ac);
		}
	}
	@Override
	public String updateBefore(AopContext ac) throws Exception {
		if(!Db.find("select * from trace_workflow_customer_qrcode_rule where productno='"+ac.record.get("productno")+"' and type='"+ac.record.get("type")+"' and id!="+ac.record.get("id")).isEmpty()){
			return "该零件号的基地/包装/客户/产品状态区分已存在,无法修改";
		}else{
			return super.updateAfter(ac);
		}
	}
	
	
}
