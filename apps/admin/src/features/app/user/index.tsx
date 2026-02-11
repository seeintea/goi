import type { AppUser } from "@goi/contracts"
import { Button, Card, Form, message, Popconfirm, Space, Switch, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect } from "react"
import { type AppUserListQuery, deleteAppUser, listAppUsers, updateAppUser } from "@/api/service/app/user"
import { type FilterField, FilterForm } from "@/components/filter-form"
import { ShortId } from "@/components/short-id"
import { useModal } from "@/hooks/use-modal"
import { useTable } from "@/hooks/use-table"
import { ResetPwdModal } from "./components/reset-pwd-modal"
import { UserModal } from "./components/user-modal"

export function User() {
  const [form] = Form.useForm()
  const isDisabled = Form.useWatch("isDisabled", form)
  const isDeleted = Form.useWatch("isDeleted", form)

  const { tableProps, search, refresh } = useTable<AppUser, AppUserListQuery>(listAppUsers, {
    form,
    defaultParams: {
      username: undefined,
      userId: undefined,
      isDisabled: undefined,
      isDeleted: undefined,
    },
  })

  // Watch for isDisabled and isDeleted changes to enforce bi-directional mutual exclusion
  useEffect(() => {
    if (isDisabled === false) {
      // If status is Enabled (false), isDeleted cannot be true
      const currentIsDeleted = form.getFieldValue("isDeleted")
      if (currentIsDeleted === true) {
        form.setFieldValue("isDeleted", undefined)
      }
    }
  }, [isDisabled, form])

  useEffect(() => {
    if (isDeleted === true) {
      // If isDeleted is true, isDisabled cannot be false (Enabled)
      const currentIsDisabled = form.getFieldValue("isDisabled")
      if (currentIsDisabled === false) {
        form.setFieldValue("isDisabled", undefined)
      }
    }
  }, [isDeleted, form])

  const userModal = useModal<AppUser>()
  const resetPwdModal = useModal<{ userId: string; username: string }>()

  const handleCreate = () => {
    userModal.show()
  }

  const handleEdit = (record: AppUser) => {
    userModal.show(record)
  }

  const handleResetPassword = (record: AppUser) => {
    resetPwdModal.show({ userId: record.userId, username: record.username })
  }

  const handleDelete = async (record: AppUser) => {
    try {
      const { code, message: msg } = await deleteAppUser(record.userId)
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

  const handleStatusChange = async (checked: boolean, record: AppUser) => {
    try {
      const { code, message: msg } = await updateAppUser({
        userId: record.userId,
        isDisabled: !checked, // Switch checked means enabled (isDisabled=false)
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

  const columns: ColumnsType<AppUser> = [
    {
      title: "用户ID",
      dataIndex: "userId",
      key: "userId",
      align: "center",
      width: 120,
      render: (text) => <ShortId id={text} />,
    },
    {
      title: "用户名",
      align: "center",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "邮箱",
      align: "center",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "状态",
      dataIndex: "isDisabled",
      key: "isDisabled",
      width: 100,
      render: (isDisabled: boolean, record) => (
        <Switch
          checked={!isDisabled}
          onChange={(checked) => handleStatusChange(checked, record)}
          loading={tableProps.loading && userModal.data?.userId === record.userId} // Simple loading check might need refinement
        />
      ),
    },
    {
      title: "是否删除",
      align: "center",
      dataIndex: "isDeleted",
      key: "isDeleted",
      width: 100,
      render: (isDeleted: boolean) => (
        <Tag color={isDeleted ? "default" : "processing"}>{isDeleted ? "已删除" : "未删除"}</Tag>
      ),
    },
    {
      title: "创建时间",
      align: "center",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString() : "-"),
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除用户 "${record.username}" 吗？此操作不可恢复。`}
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filterFields: FilterField[] = [
    { name: "username", label: "用户名", type: "input" },
    { name: "userId", label: "用户ID", type: "input" },
    {
      name: "isDisabled",
      label: "状态",
      type: "select",
      options: [
        { label: "启用", value: false },
        { label: "禁用", value: true },
      ],
    },
    {
      name: "isDeleted",
      label: "是否删除",
      type: "select",
      options: [
        { label: "未删除", value: false },
        { label: "已删除", value: true },
      ],
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
          新增用户
        </Button>
      </div>

      <Table
        columns={columns}
        {...tableProps}
        rowKey={"userId"}
      />

      <UserModal
        open={userModal.open}
        record={userModal.data || null}
        onOpenChange={userModal.setOpen}
        onSuccess={refresh}
      />

      {resetPwdModal.data && (
        <ResetPwdModal
          open={resetPwdModal.open}
          userId={resetPwdModal.data.userId}
          username={resetPwdModal.data.username}
          onOpenChange={resetPwdModal.setOpen}
          onSuccess={() => {
            // No need to refresh list for password reset
          }}
        />
      )}
    </Card>
  )
}
