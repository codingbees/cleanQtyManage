package com.ray.common.model;

import com.jfinal.plugin.activerecord.ActiveRecordPlugin;

/**
 * Generated by JBolt, do not modify this file.
 * <pre>
 * Example:
 * public void configPlugin(Plugins me) {
 *     ActiveRecordPlugin arp = new ActiveRecordPlugin(...);
 *     _MappingKit.mapping(arp);
 *     me.add(arp);
 * }
 * </pre>
 */
public class _MappingKit {
	
	public static void mapping(ActiveRecordPlugin arp) {
		arp.addMapping("data_button", "id", DataButton.class);
		arp.addMapping("data_field", "id", DataField.class);
		arp.addMapping("data_object", "id", DataObject.class);
		arp.addMapping("data_task", "id", DataTask.class);
		arp.addMapping("dicts", "id", Dicts.class);
		arp.addMapping("file", "id", File.class);
		arp.addMapping("menu", "id", Menu.class);
		arp.addMapping("permissions", "id", Permissions.class);
		arp.addMapping("role_permission", "id", RolePermission.class);
		arp.addMapping("roles", "id", Roles.class);
		arp.addMapping("serial_number", "id", SerialNumber.class);
		arp.addMapping("user_role", "id", UserRole.class);
		arp.addMapping("yw_test", "id", YwTest.class);
		arp.addMapping("yw_test_son", "id", YwTestSon.class);
	}
}

