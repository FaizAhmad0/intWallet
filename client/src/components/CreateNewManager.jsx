import React, { useState } from "react";
import { Button, Modal, Input, Form, message } from "antd";
import API from "../utils/api";

const CreateNewManager = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    form.resetFields();
    setOpen(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await API.post(`/admin/create-manager`, values);
      message.success("Manager created successfully!");
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error creating manager:", error);
      message.error("Failed to create manager.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button className="font-bold" type="primary" onClick={handleOpen}>
          Create New Manager
        </Button>
      </div>

      <Modal
        title="Create New Manager"
        open={open}
        onCancel={handleClose}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Manager Name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Manager Email" />
          </Form.Item>

          <Form.Item
            label="Primary Contact"
            name="primaryContact"
            rules={[{ required: true, message: "Please enter contact" }]}
          >
            <Input placeholder="Contact Number" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Manager
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateNewManager;
