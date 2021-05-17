package com.ray.common.model.base;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * 
 * Generated by JBolt, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseDataField<M extends BaseDataField<M>> extends Model<M> implements IBean {

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
	 * object_id
	 */
	public void setDataObjectId(java.lang.Integer dataObjectId) {
		set("data_object_id", dataObjectId);
	}
	
	/**
	 * object_id
	 */
	public java.lang.Integer getDataObjectId() {
		return getInt("data_object_id");
	}

	/**
	 * 排序索引
	 */
	public void setOrderNum(java.lang.Integer orderNum) {
		set("order_num", orderNum);
	}
	
	/**
	 * 排序索引
	 */
	public java.lang.Integer getOrderNum() {
		return getInt("order_num");
	}

	/**
	 * 英文名
	 */
	public void setEn(java.lang.String en) {
		set("en", en);
	}
	
	/**
	 * 英文名
	 */
	public java.lang.String getEn() {
		return getStr("en");
	}

	/**
	 * 中文名
	 */
	public void setCn(java.lang.String cn) {
		set("cn", cn);
	}
	
	/**
	 * 中文名
	 */
	public java.lang.String getCn() {
		return getStr("cn");
	}

	/**
	 * 主键是否自增长
	 */
	public void setIsAuto(java.lang.Boolean isAuto) {
		set("is_auto", isAuto);
	}
	
	/**
	 * 主键是否自增长
	 */
	public java.lang.Boolean getIsAuto() {
		return getBoolean("is_auto");
	}

	/**
	 * 控件类型
	 */
	public void setType(java.lang.String type) {
		set("type", type);
	}
	
	/**
	 * 控件类型
	 */
	public java.lang.String getType() {
		return getStr("type");
	}

	/**
	 * 控件配置
	 */
	public void setTypeConfig(java.lang.String typeConfig) {
		set("type_config", typeConfig);
	}
	
	/**
	 * 控件配置
	 */
	public java.lang.String getTypeConfig() {
		return getStr("type_config");
	}

	/**
	 * 排列
	 */
	public void setAlign(java.lang.String align) {
		set("align", align);
	}
	
	/**
	 * 排列
	 */
	public java.lang.String getAlign() {
		return getStr("align");
	}

	/**
	 * 是否可查询
	 */
	public void setIsQuery(java.lang.Boolean isQuery) {
		set("is_query", isQuery);
	}
	
	/**
	 * 是否可查询
	 */
	public java.lang.Boolean getIsQuery() {
		return getBoolean("is_query");
	}

	/**
	 * 是否可显示
	 */
	public void setIsShow(java.lang.Boolean isShow) {
		set("is_show", isShow);
	}
	
	/**
	 * 是否可显示
	 */
	public java.lang.Boolean getIsShow() {
		return getBoolean("is_show");
	}

	/**
	 * 是否禁用
	 */
	public void setIsDisable(java.lang.Boolean isDisable) {
		set("is_disable", isDisable);
	}
	
	/**
	 * 是否禁用
	 */
	public java.lang.Boolean getIsDisable() {
		return getBoolean("is_disable");
	}

	/**
	 * 是否可排序
	 */
	public void setIsOrder(java.lang.Boolean isOrder) {
		set("is_order", isOrder);
	}
	
	/**
	 * 是否可排序
	 */
	public java.lang.Boolean getIsOrder() {
		return getBoolean("is_order");
	}

	/**
	 * 是否可新增
	 */
	public void setIsAdd(java.lang.Boolean isAdd) {
		set("is_add", isAdd);
	}
	
	/**
	 * 是否可新增
	 */
	public java.lang.Boolean getIsAdd() {
		return getBoolean("is_add");
	}

	/**
	 * 是否可修改
	 */
	public void setIsUpdate(java.lang.Boolean isUpdate) {
		set("is_update", isUpdate);
	}
	
	/**
	 * 是否可修改
	 */
	public java.lang.Boolean getIsUpdate() {
		return getBoolean("is_update");
	}

	/**
	 * 是否可行内修改
	 */
	public void setIsLineUpdate(java.lang.Boolean isLineUpdate) {
		set("is_line_update", isLineUpdate);
	}
	
	/**
	 * 是否可行内修改
	 */
	public java.lang.Boolean getIsLineUpdate() {
		return getBoolean("is_line_update");
	}

	/**
	 * 是否可修改数据校验
	 */
	public void setUpdateValidate(java.lang.String updateValidate) {
		set("update_validate", updateValidate);
	}
	
	/**
	 * 是否可修改数据校验
	 */
	public java.lang.String getUpdateValidate() {
		return getStr("update_validate");
	}

	/**
	 * 是否可编辑
	 */
	public void setIsEdit(java.lang.Boolean isEdit) {
		set("is_edit", isEdit);
	}
	
	/**
	 * 是否可编辑
	 */
	public java.lang.Boolean getIsEdit() {
		return getBoolean("is_edit");
	}

	/**
	 * 是否必填
	 */
	public void setIsRequired(java.lang.Boolean isRequired) {
		set("is_required", isRequired);
	}
	
	/**
	 * 是否必填
	 */
	public java.lang.Boolean getIsRequired() {
		return getBoolean("is_required");
	}

	/**
	 * 是否多选项
	 */
	public void setIsMultiple(java.lang.Boolean isMultiple) {
		set("is_multiple", isMultiple);
	}
	
	/**
	 * 是否多选项
	 */
	public java.lang.Boolean getIsMultiple() {
		return getBoolean("is_multiple");
	}

	/**
	 * 是否虚拟字段
	 */
	public void setIsFictitious(java.lang.Boolean isFictitious) {
		set("is_fictitious", isFictitious);
	}
	
	/**
	 * 是否虚拟字段
	 */
	public java.lang.Boolean getIsFictitious() {
		return getBoolean("is_fictitious");
	}

	/**
	 * 虚拟字段来源sql
	 */
	public void setFictitiousSql(java.lang.String fictitiousSql) {
		set("fictitious_sql", fictitiousSql);
	}
	
	/**
	 * 虚拟字段来源sql
	 */
	public java.lang.String getFictitiousSql() {
		return getStr("fictitious_sql");
	}

	/**
	 * 输入提示
	 */
	public void setPlaceholder(java.lang.String placeholder) {
		set("placeholder", placeholder);
	}
	
	/**
	 * 输入提示
	 */
	public java.lang.String getPlaceholder() {
		return getStr("placeholder");
	}

	/**
	 * 格式化
	 */
	public void setFormatter(java.lang.String formatter) {
		set("formatter", formatter);
	}
	
	/**
	 * 格式化
	 */
	public java.lang.String getFormatter() {
		return getStr("formatter");
	}

	/**
	 * UI校验表达式
	 */
	public void setValidator(java.lang.String validator) {
		set("validator", validator);
	}
	
	/**
	 * UI校验表达式
	 */
	public java.lang.String getValidator() {
		return getStr("validator");
	}

	/**
	 * 默认值表达式
	 */
	public void setDefaulter(java.lang.String defaulter) {
		set("defaulter", defaulter);
	}
	
	/**
	 * 默认值表达式
	 */
	public java.lang.String getDefaulter() {
		return getStr("defaulter");
	}

	/**
	 * 控件宽度
	 */
	public void setWidth(java.lang.Integer width) {
		set("width", width);
	}
	
	/**
	 * 控件宽度
	 */
	public java.lang.Integer getWidth() {
		return getInt("width");
	}

	/**
	 * 控件高度
	 */
	public void setHeight(java.lang.Integer height) {
		set("height", height);
	}
	
	/**
	 * 控件高度
	 */
	public java.lang.Integer getHeight() {
		return getInt("height");
	}

	/**
	 * 配置
	 */
	public void setConfig(java.lang.String config) {
		set("config", config);
	}
	
	/**
	 * 配置
	 */
	public java.lang.String getConfig() {
		return getStr("config");
	}

	/**
	 * 状态：0=正常，10=只读，20=隐藏，50=禁用
	 */
	public void setAddStatus(java.lang.Integer addStatus) {
		set("add_status", addStatus);
	}
	
	/**
	 * 状态：0=正常，10=只读，20=隐藏，50=禁用
	 */
	public java.lang.Integer getAddStatus() {
		return getInt("add_status");
	}

	/**
	 * 状态：0=正常，10=只读，20=隐藏，50=禁用
	 */
	public void setUpdateStatus(java.lang.Integer updateStatus) {
		set("update_status", updateStatus);
	}
	
	/**
	 * 状态：0=正常，10=只读，20=隐藏，50=禁用
	 */
	public java.lang.Integer getUpdateStatus() {
		return getInt("update_status");
	}

	/**
	 * 数据类型
	 */
	public void setDataType(java.lang.Integer dataType) {
		set("data_type", dataType);
	}
	
	/**
	 * 数据类型
	 */
	public java.lang.Integer getDataType() {
		return getInt("data_type");
	}

	/**
	 * 数据类型名称
	 */
	public void setDataTypeName(java.lang.String dataTypeName) {
		set("data_type_name", dataTypeName);
	}
	
	/**
	 * 数据类型名称
	 */
	public java.lang.String getDataTypeName() {
		return getStr("data_type_name");
	}

	/**
	 * 整数位长度
	 */
	public void setDataSize(java.lang.Integer dataSize) {
		set("data_size", dataSize);
	}
	
	/**
	 * 整数位长度
	 */
	public java.lang.Integer getDataSize() {
		return getInt("data_size");
	}

	/**
	 * 小数位长度
	 */
	public void setDataDecimal(java.lang.Integer dataDecimal) {
		set("data_decimal", dataDecimal);
	}
	
	/**
	 * 小数位长度
	 */
	public java.lang.Integer getDataDecimal() {
		return getInt("data_decimal");
	}

}
