'use client';

import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { subjects } from '@/data/mock';
import type { ExternalExpert } from '@/data/mock';

interface ExpertRegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (expert: Omit<ExternalExpert, 'id' | 'status' | 'createdAt'>) => void;
}

export default function ExpertRegisterModal({
  open,
  onClose,
  onSubmit,
}: ExpertRegisterModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        name: values.name,
        phone: values.phone,
        subjects: values.subjects || [],
      });
      form.resetFields();
      onClose();
      message.success('外部专家添加成功！');
    });
  };

  return (
    <Modal
      title="外部专家入驻"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="确认入驻"
      cancelText="取消"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="name"
          label="专家姓名"
          rules={[{ required: true, message: '请输入专家姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号码"
          rules={[
            { required: true, message: '请输入手机号码' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
          ]}
        >
          <Input placeholder="请输入手机号码" maxLength={11} />
        </Form.Item>

        <Form.Item
          name="subjects"
          label="擅长学科"
        >
          <Select
            mode="multiple"
            placeholder="选择擅长的学科（可多选）"
            options={subjects.map(s => ({
              value: s.id,
              label: (
                <span>
                  <span
                    className="inline-block w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </span>
              ),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
