-- 系统用户（登录账号）
CREATE TABLE IF NOT EXISTS "sys_user" (
	"user_id" varchar(32) PRIMARY KEY NOT NULL, -- 用户ID（字符串主键）
	"username" varchar(30) NOT NULL, -- 用户名（唯一）
	"password" varchar(100) NOT NULL, -- 密码哈希
	"salt" varchar(16) NOT NULL, -- 密码盐
	"email" varchar(50) DEFAULT '' NOT NULL, -- 邮箱
	"phone" varchar(11) DEFAULT '' NOT NULL, -- 手机号
	"is_disabled" boolean DEFAULT false NOT NULL, -- 是否禁用
	"is_deleted" boolean DEFAULT false NOT NULL, -- 是否删除（软删除标记）
	"create_time" date NOT NULL, -- 创建日期
	"update_time" date NOT NULL -- 更新日期
);

CREATE UNIQUE INDEX IF NOT EXISTS "sys_user_username_uq" ON "sys_user" USING btree ("username");

-- 财务账本
CREATE TABLE IF NOT EXISTS "ff_book" (
	"book_id" varchar(32) PRIMARY KEY NOT NULL, -- 账本ID（字符串主键）
	"name" varchar(50) NOT NULL, -- 账本名称
	"currency" varchar(10) DEFAULT 'CNY' NOT NULL, -- 默认币种（MVP 建议单币种）
	"timezone" varchar(50) DEFAULT 'Asia/Shanghai' NOT NULL, -- 账本时区（用于本月/本周等边界计算）
	"owner_user_id" varchar(32) NOT NULL, -- 账本所有者用户ID
	"is_deleted" boolean DEFAULT false NOT NULL, -- 是否删除（软删除标记）
	"create_time" date NOT NULL, -- 创建日期
	"update_time" date NOT NULL, -- 更新日期
	CONSTRAINT "ff_book_owner_user_fk" FOREIGN KEY ("owner_user_id") REFERENCES "sys_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ff_book_owner_user_id_idx" ON "ff_book" USING btree ("owner_user_id");

-- 账本成员关系（用户在账本内的角色与可见范围）
CREATE TABLE IF NOT EXISTS "ff_book_member" (
	"member_id" varchar(32) PRIMARY KEY NOT NULL, -- 成员关系ID（字符串主键）
	"book_id" varchar(32) NOT NULL, -- 账本ID
	"user_id" varchar(32) NOT NULL, -- 用户ID
	"role_code" varchar(20) NOT NULL, -- 角色编码（Owner/Admin/Member/Guest）
	"scope_type" varchar(20) DEFAULT 'all' NOT NULL, -- 范围类型（all/self/accounts/categories）
	"scope" jsonb DEFAULT '{}'::jsonb NOT NULL, -- 范围明细（json，按 scope_type 解释，例如 {"accounts":[...]}）
	"is_deleted" boolean DEFAULT false NOT NULL, -- 是否删除（软删除标记）
	"create_time" date NOT NULL, -- 创建日期
	"update_time" date NOT NULL, -- 更新日期
	CONSTRAINT "ff_book_member_book_fk" FOREIGN KEY ("book_id") REFERENCES "ff_book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "ff_book_member_user_fk" FOREIGN KEY ("user_id") REFERENCES "sys_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ff_book_member_book_user_uq" ON "ff_book_member" USING btree ("book_id", "user_id");
CREATE INDEX IF NOT EXISTS "ff_book_member_user_id_idx" ON "ff_book_member" USING btree ("user_id");

-- 接口权限点（能力控制）
-- 权限模块（用于映射前端路由与页面权限编码）
CREATE TABLE IF NOT EXISTS "sys_module" (
	"module_id" varchar(32) PRIMARY KEY NOT NULL, -- 模块ID（字符串主键）
	"parent_id" varchar(32), -- 父模块ID（可为空，关联 sys_module.module_id）
	"name" varchar(80) NOT NULL, -- 模块名称
	"route_path" varchar(200) NOT NULL, -- 前端路由路径（如 /sys-manage/role）
	"permission_code" varchar(80) NOT NULL, -- 页面权限编码（如 role/user/permission）
	"sort" integer DEFAULT 0 NOT NULL, -- 排序值（升序）
	"is_deleted" boolean DEFAULT false NOT NULL, -- 是否删除（软删除标记）
	"create_time" date NOT NULL, -- 创建日期
	"update_time" date NOT NULL, -- 更新日期
	CONSTRAINT "sys_module_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "sys_module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "sys_module_route_path_uq" ON "sys_module" USING btree ("route_path");
CREATE UNIQUE INDEX IF NOT EXISTS "sys_module_permission_code_uq" ON "sys_module" USING btree ("permission_code");
CREATE INDEX IF NOT EXISTS "sys_module_parent_id_idx" ON "sys_module" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "sys_module_sort_idx" ON "sys_module" USING btree ("sort");

-- 接口权限点（能力控制）
CREATE TABLE IF NOT EXISTS "sys_permission" (
	"permission_id" varchar(32) PRIMARY KEY NOT NULL, -- 权限ID（字符串主键）
	"code" varchar(80) NOT NULL, -- 权限编码（如 book:create、transaction:delete）
	"name" varchar(80) DEFAULT '' NOT NULL, -- 权限名称
	"module_id" varchar(32) DEFAULT '' NOT NULL, -- 所属模块ID（关联 sys_module）
	"is_disabled" boolean DEFAULT false NOT NULL, -- 是否禁用
	"is_deleted" boolean DEFAULT false NOT NULL, -- 是否删除（软删除标记）
	"create_time" date NOT NULL, -- 创建日期
	"update_time" date NOT NULL, -- 更新日期
	CONSTRAINT "sys_permission_module_fk" FOREIGN KEY ("module_id") REFERENCES "sys_module"("module_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "sys_permission_code_uq" ON "sys_permission" USING btree ("code");
CREATE INDEX IF NOT EXISTS "sys_permission_module_id_idx" ON "sys_permission" USING btree ("module_id");

-- 系统角色（用于权限点集合）
CREATE TABLE IF NOT EXISTS "sys_role" (
	"role_id" varchar(32) PRIMARY KEY NOT NULL, -- 角色ID（字符串主键）
	"role_code" varchar(30) NOT NULL, -- 角色编码（如 Owner/Admin/Member/Guest）
	"role_name" varchar(50) NOT NULL, -- 角色名称
	"is_disabled" boolean DEFAULT false NOT NULL, -- 是否禁用
	"is_deleted" boolean DEFAULT false NOT NULL, -- 是否删除（软删除标记）
	"create_time" date NOT NULL, -- 创建日期
	"update_time" date NOT NULL -- 更新日期
);

CREATE UNIQUE INDEX IF NOT EXISTS "sys_role_role_code_uq" ON "sys_role" USING btree ("role_code");

CREATE TABLE IF NOT EXISTS "sys_role_permission" (
	"role_id" varchar(32) NOT NULL, -- 角色ID
	"permission_id" varchar(32) NOT NULL, -- 权限ID
	"create_time" date NOT NULL, -- 创建日期
	PRIMARY KEY ("role_id", "permission_id"),
	CONSTRAINT "sys_role_permission_role_fk" FOREIGN KEY ("role_id") REFERENCES "sys_role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "sys_role_permission_permission_fk" FOREIGN KEY ("permission_id") REFERENCES "sys_permission"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE
);
