"use client";

import { Flex, Table, message, notification, Button } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/redux/loaderSlice";
import { GetAllTheatres, UpdateTheatre } from "../../../services/theatre";

const TheatreList = () => {
  const [theatres, setTheatres] = useState([]);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllTheatres();
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

  const handleStatusChange = async (theatre) => {
    try {
      dispatch(showLoading());
      const response = await UpdateTheatre({
        theatreId: theatre._id,
        ...theatre, 
        isActive: !theatre.isActive,
      });
      if (response.success) {
        notification.success({
          message: response.message,
        })
        getData();
      } else {
        notification.error({
          message: response.message,
        })
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      message.error(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

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
      title: "Owner",
      dataIndex: "owner",
      render: (_, record) => {
        return record?.owner?.name;
      },
      key: "owner",
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
            {record?.isActive && (
              <Button
                onClick={() => {
                  handleStatusChange(record);
                }}
              >
                Block
              </Button>
            )}
            {!record?.isActive && (
              <Button
                onClick={() => {
                  handleStatusChange(record);
                }}
              >
                Approve
              </Button>
            )}
          </Flex>
        );
      },
      key: "action",
    },
  ];
  
  return (
    <div>
      <Table columns={columns} dataSource={theatres} />
    </div>
  );
};

export default TheatreList;
