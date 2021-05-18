package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseTraceWorkflowCleanbinding<M extends BaseTraceWorkflowCleanbinding<M>> extends Model<M> implements IBean {

	/**
	 * ID
	 */
	public void setId(java.lang.Integer id) {
		set("id", id);
	}
	
	/**
	 * ID
	 */
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 零件号
	 */
	public void setPartNo(java.lang.String partNo) {
		set("part_no", partNo);
	}
	
	/**
	 * 零件号
	 */
	public java.lang.String getPartNo() {
		return getStr("part_no");
	}

	/**
	 * 批次号
	 */
	public void setBatchNo(java.lang.String batchNo) {
		set("batch_no", batchNo);
	}
	
	/**
	 * 批次号
	 */
	public java.lang.String getBatchNo() {
		return getStr("batch_no");
	}

	/**
	 * 数量
	 */
	public void setQuantity(java.lang.String quantity) {
		set("quantity", quantity);
	}
	
	/**
	 * 数量
	 */
	public java.lang.String getQuantity() {
		return getStr("quantity");
	}

	/**
	 * 清洗框二维码
	 */
	public void setCleanBoxNo(java.lang.String cleanBoxNo) {
		set("clean_box_no", cleanBoxNo);
	}
	
	/**
	 * 清洗框二维码
	 */
	public java.lang.String getCleanBoxNo() {
		return getStr("clean_box_no");
	}

	/**
	 * 清洗绑定时间
	 */
	public void setCreateTime(java.util.Date createTime) {
		set("create_time", createTime);
	}
	
	/**
	 * 清洗绑定时间
	 */
	public java.util.Date getCreateTime() {
		return get("create_time");
	}

	/**
	 * 盒子状态：0=已清空，1=已上料待洗，2=已洗待用，3=已用
	 */
	public void setCleanBoxStatus(java.lang.Integer cleanBoxStatus) {
		set("clean_box_status", cleanBoxStatus);
	}
	
	/**
	 * 盒子状态：0=已清空，1=已上料待洗，2=已洗待用，3=已用
	 */
	public java.lang.Integer getCleanBoxStatus() {
		return getInt("clean_box_status");
	}

}