import type { AppPermissionTreeNode, AppPermissionTreeResponse } from "@goi/contracts"
import { Button, Modal, message, Space, Spin, Tag, Tree } from "antd"
import { useCallback, useEffect, useState } from "react"
import { getPermissionTree } from "@/api/service/app/permission"
import { getRolePermissions, updateRolePermissions } from "@/api/service/app/role"

interface PermissionModalProps {
  open: boolean
  roleId?: string
  onClose: () => void
  onSuccess: () => void
}

export function PermissionModal({ open, roleId, onClose, onSuccess }: PermissionModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [treeData, setTreeData] = useState<AppPermissionTreeResponse>([])
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const fetchData = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const [treeRes, permissionsRes] = await Promise.all([getPermissionTree(), getRolePermissions(id)])

      if (treeRes.code === 200) {
        setTreeData(treeRes.data || [])
        // Expand all by default
        const getAllKeys = (data: AppPermissionTreeResponse): string[] => {
          let keys: string[] = []
          data.forEach((item: AppPermissionTreeNode) => {
            keys.push(item.key)
            if (item.children) {
              keys = keys.concat(getAllKeys(item.children))
            }
          })
          return keys
        }
        setExpandedKeys(getAllKeys(treeRes.data || []))
      }

      if (permissionsRes.code === 200) {
        setCheckedKeys(permissionsRes.data || [])
      }
    } catch (error) {
      console.error(error)
      message.error("获取权限数据失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && roleId) {
      fetchData(roleId)
    }
  }, [open, roleId, fetchData])

  const handleOk = async () => {
    if (!roleId) return

    try {
      setConfirmLoading(true)

      // Filter out module IDs (which are not leaf nodes in our permission context usually,
      // Let's flatten the tree to find which keys are permissions and modules
      const permissionIds = new Set<string>()
      const moduleIds = new Set<string>()

      const traverse = (nodes: AppPermissionTreeResponse) => {
        nodes.forEach((node) => {
          if (node.type === "permission") {
            permissionIds.add(node.key)
          } else if (node.type === "module") {
            moduleIds.add(node.key)
          }
          if (node.children) {
            traverse(node.children)
          }
        })
      }
      traverse(treeData)

      const finalPermissionIds = checkedKeys.filter((key) => permissionIds.has(key))
      const finalModuleIds = checkedKeys.filter((key) => moduleIds.has(key))

      const { code, message: msg } = await updateRolePermissions({
        roleId,
        permissionIds: finalPermissionIds,
        moduleIds: finalModuleIds,
      })

      if (code === 200) {
        message.success("权限更新成功")
        onSuccess && onSuccess()
        onClose()
      } else {
        message.error(msg || "权限更新失败")
      }
    } catch (error) {
      console.error(error)
      message.error("权限更新失败")
    } finally {
      setConfirmLoading(false)
    }
  }

  const onCheck = (checked: any) => {
    // If checkStrictly is true, checked is { checked: string[], halfChecked: string[] }
    // If false, checked is string[]
    // We'll use default behavior (checkStrictly=false) for better UX (auto check/uncheck children)
    setCheckedKeys(checked as string[])
  }

  const handleSelectAll = () => {
    const allKeys: string[] = []
    const traverse = (nodes: AppPermissionTreeResponse) => {
      nodes.forEach((node) => {
        allKeys.push(node.key)
        if (node.children) {
          traverse(node.children)
        }
      })
    }
    traverse(treeData)
    setCheckedKeys(allKeys)
  }

  const handleClear = () => {
    setCheckedKeys([])
  }

  return (
    <Modal
      title="分配权限"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={confirmLoading}
      width={600}
    >
      <Spin spinning={loading}>
        <div className="mb-4">
          <Space>
            <Button
              size="small"
              onClick={handleSelectAll}
            >
              全选
            </Button>
            <Button
              size="small"
              onClick={handleClear}
            >
              清空
            </Button>
          </Space>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <Tree
            checkable
            treeData={treeData}
            checkedKeys={checkedKeys}
            expandedKeys={expandedKeys}
            onExpand={(expanded) => setExpandedKeys(expanded as string[])}
            onCheck={onCheck}
            fieldNames={{ title: "title", key: "key", children: "children" }}
            titleRender={(node: any) => (
              <span className="flex items-center gap-2">
                {node.type === "module" ? (
                  <Tag
                    color="blue"
                    bordered={false}
                    className="mr-0"
                  >
                    路由
                  </Tag>
                ) : (
                  <Tag
                    color="cyan"
                    bordered={false}
                    className="mr-0"
                  >
                    权限
                  </Tag>
                )}
                {node.title}
              </span>
            )}
          />
        </div>
      </Spin>
    </Modal>
  )
}
