package com.ray.common.model;

import com.ray.common.model.base.BaseDataAppVersion;

/**
 * 
 * Generated by JBolt.
 */
@SuppressWarnings("serial")
public class DataAppVersion extends BaseDataAppVersion<DataAppVersion> {
	//建议将dao放在Service中只用作查询 
	public static final DataAppVersion dao = new DataAppVersion().dao();
	//在Service中声明 可直接复制过去使用
	//private DataAppVersion dao = new DataAppVersion().dao();  
}