"use client";

import { Table, Button, notification, Flex, Typography } from "antd";
import { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { showLoading, hideLoading } from "@/redux/loaderSlice";
import {
  GetAllTheatresByOwner,
  DeleteTheatre,
} from "../../../services/theatre";
import { useDispatch, useSelector } from "react-redux";
import TheatreForm from "./TheatreForm";
import Shows from "./Shows";

const { Text, Title } = Typography;

const TheatreList = () => {
  const { user } = useSelector((state) => state.users);

  const [openShowsModal, setOpenShowsModal] = useState(false);
  const [showTheatreFormModal, setShowTheatreFormModal] = useState(false);
  const [formType, setFormType] = useState("add");
  const [theatres, setTheatres] = useState([]);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllTheatresByOwner({
        owner: user._id,
      });
      if (response.success) {
        setTheatres(response.data);
      } else {
        notification.error({ message: response.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      notification.error({ message: error.message });
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(showLoading());
      const response = await DeleteTheatre({ theatreId: id });
      if (response.success) {
        notification.success({ message: response.message });
        getData();
      } else {
        notification.error({ message: response.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      notification.error({ message: error.message });
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (text, record) => {
        if (text) {
          return "Approved";
        } else {
          return "Pending / Blocked";
        }
      },
      key: "isActive",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <Flex gap={8}>
            <Button
              type="text"
              onClick={() => {
                console.log(record);
                setSelectedTheatre(record);
                setFormType("edit");
                setShowTheatreFormModal(true);
              }}
            >
              <EditOutlined />
            </Button>
            <Button type="text" onClick={() => handleDelete(record._id)}>
              <DeleteOutlined />
            </Button>
            {record.isActive && (
              <Button
                onClick={() => {
                  setSelectedTheatre(record);
                  setOpenShowsModal(true);
                }}
              >
                Shows
              </Button>
            )}
          </Flex>
        );
      },
      key: "action",
    },
  ];

  useEffect(() => {
    getData();
    console.log(theatres);
  }, []);

  return (
    <div>
      <Flex align="start" justify="space-between">
        <Title level={4}>Theatres</Title>
        <Button
          onClick={() => {
            setShowTheatreFormModal(true);
            setFormType("add");
          }}
        >
          Add Theatre
        </Button>
      </Flex>
      <Table dataSource={theatres} columns={columns} />
      {showTheatreFormModal && (
        <TheatreForm
          showTheatreFormModal={showTheatreFormModal}
          setShowTheatreFormModal={setShowTheatreFormModal}
          selectedTheatre={selectedTheatre}
          getData={getData}
          formType={formType}
        />
      )}
      {openShowsModal && (
        <Shows
          openShowsModal={openShowsModal}
          setOpenShowsModal={setOpenShowsModal}
          theatre={selectedTheatre}
        />
      )}
    </div>
  );
};

export default TheatreList;
