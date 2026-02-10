import { Button, Col, Form, Input, Row, Select, Space } from "antd"
import type { FormInstance } from "antd/es/form"

export interface FilterField {
  name: string
  label: string
  type: "input" | "select"
  options?: { label: string; value: string | number | boolean }[]
  // biome-ignore lint/suspicious/noExplicitAny: <real unknown type>
  props?: Record<string, any> // Additional props for the input component
}

interface FilterFormProps {
  form: FormInstance
  fields: FilterField[]
  // biome-ignore lint/suspicious/noExplicitAny: <real unknown type>
  onSearch: (values: any) => void
  onReset: () => void
}

export function FilterForm({ form, fields, onSearch, onReset }: FilterFormProps) {
  return (
    <Form
      form={form}
      onFinish={onSearch}
      className="mb-4"
    >
      <Row gutter={[16, 16]}>
        {fields.map((field) => (
          <Col key={field.name}>
            <Form.Item
              name={field.name}
              label={field.label}
              className="mb-0"
            >
              {field.type === "input" && (
                <Input
                  placeholder={`请输入${field.label}`}
                  allowClear
                  {...field.props}
                />
              )}
              {field.type === "select" && (
                <Select
                  placeholder={`请选择${field.label}`}
                  allowClear
                  options={field.options}
                  style={{ width: 120 }}
                  {...field.props}
                />
              )}
            </Form.Item>
          </Col>
        ))}
        <Col>
          <Form.Item className="mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
              >
                搜索
              </Button>
              <Button onClick={onReset}>重置</Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}
