import { Button, Card, Form, message, Popconfirm, Space, Switch, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import type { AppRole, AppRoleListQuery } from "@/api/service/app/role"
import { deleteAppRole, listAppRoles, updateAppRoleStatus } from "@/api/service/app/role"
import { type FilterField, FilterForm } from "@/components/filter-form"
import { ShortId } from "@/components/short-id"
import { useModal } from "@/hooks/use-modal"
import { useTable } from "@/hooks/use-table"
import { PermissionModal } from "./components/permission-modal"
import { RoleModal } from "./components/role-modal"

export function RoleList() {
  const [form] = Form.useForm()

  const { tableProps, search, refresh } = useTable<AppRole, AppRoleListQuery>(listAppRoles, {
    form,
    defaultParams: {
      roleCode: undefined,
      roleName: undefined,
      userId: undefined,
      username: undefined,
      isDeleted: undefined,
    },
  })

  const roleModal = useModal<AppRole>()
  const permissionModal = useModal<AppRole>()

  const handleCreate = () => {
    roleModal.show()
  }

  const handleEdit = (record: AppRole) => {
    roleModal.show(record)
  }

  const handlePermission = (record: AppRole) => {
    permissionModal.show(record)
  }

  const handleDelete = async (record: AppRole) => {
    try {
      const { code, message: msg } = await deleteAppRole(record.roleId)
      if (code === 200) {
        message.success("删除成功")
        refresh()
      } else {
        message.error(msg || "删除失败")
      }
    } catch (error) {
      console.error(error)
      message.error("删除失败")
    }
  }

  const handleStatusChange = async (record: AppRole, checked: boolean) => {
    try {
      const { code, message: msg } = await updateAppRoleStatus({
        roleId: record.roleId,
        isDisabled: checked,
      })
      if (code === 200) {
        message.success("状态更新成功")
        refresh()
      } else {
        message.error(msg || "状态更新失败")
      }
    } catch (error) {
      console.error(error)
      message.error("状态更新失败")
    }
  }

  const columns: ColumnsType<AppRole> = [
    {
      title: "角色ID",
      dataIndex: "roleId",
      align: "center",
      width: 100,
      render: (id: string) => <ShortId id={id} />,
    },
    {
      title: "家庭ID",
      dataIndex: "familyId",
      align: "center",
      width: 150,
      render: (id: string) => (id ? <ShortId id={id} /> : "-"),
    },
    {
      title: "角色编码",
      dataIndex: "roleCode",
      align: "center",
      width: 150,
      render: (code: string) => <Tag color="geekblue">{code || "-"}</Tag>,
    },
    {
      title: "角色名称",
      dataIndex: "roleName",
      align: "center",
      width: 150,
    },
    {
      title: "状态",
      dataIndex: "isDisabled",
      align: "center",
      width: 100,
      render: (isDisabled: boolean, record) => {
        if (!record.allowDisable) {
          return isDisabled ? "禁用" : "启用"
        }
        return (
          <Switch
            checked={!isDisabled}
            onChange={(checked) => handleStatusChange(record, checked)}
          />
        )
      },
    },
    {
      title: "删除状态",
      dataIndex: "isDeleted",
      align: "center",
      width: 100,
      render: (isDeleted: boolean) => <Tag color={isDeleted ? "red" : "green"}>{isDeleted ? "已删除" : "未删除"}</Tag>,
    },
    {
      title: "创建时间",
      align: "center",
      dataIndex: "createdAt",
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handlePermission(record)}
            className="p-0"
          >
            权限
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
            className="p-0"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
            disabled={!record.allowDelete}
          >
            <Button
              type="link"
              size="small"
              danger
              className="p-0"
              disabled={!record.allowDelete}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filterFields: FilterField[] = [
    { name: "roleCode", label: "角色编码", type: "input" },
    { name: "roleName", label: "角色名称", type: "input" },
    {
      name: "userId",
      label: "用户ID",
      type: "input",
      props: {
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.value) {
            form.setFieldValue("username", undefined)
          }
        },
      },
    },
    {
      name: "username",
      label: "用户名",
      type: "input",
      props: {
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.value) {
            form.setFieldValue("userId", undefined)
          }
        },
      },
    },
    {
      name: "isDeleted",
      label: "删除状态",
      type: "select",
      options: [
        { label: "未删除", value: false },
        { label: "已删除", value: true },
      ],
      props: {
        allowClear: true,
      },
    },
  ]

  return (
    <Card>
      <FilterForm
        form={form}
        fields={filterFields}
        onSearch={search.submit}
        onReset={search.reset}
      />

      <div className="mb-4">
        <Button
          type="primary"
          onClick={handleCreate}
        >
          新增角色
        </Button>
      </div>

      <Table
        {...tableProps}
        columns={columns}
        scroll={{ x: 1000 }}
        rowKey="roleId"
      />

      <RoleModal
        open={roleModal.open}
        record={roleModal.data}
        onOpenChange={roleModal.hide}
        onSuccess={refresh}
      />
      <PermissionModal
        open={permissionModal.open}
        roleId={permissionModal.data?.roleId}
        onClose={permissionModal.hide}
        onSuccess={refresh}
      />
    </Card>
  )
}
