"use client";

import { useRouter } from "next/navigation";
import { Layout, Typography, notification, Flex, Avatar } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { GetCurrentUser } from "../../services/user";
import { useDispatch, useSelector } from "react-redux";
import setUser from "@/redux/usersSlice";
import { useEffect } from "react";

const { Header } = Layout;

const AppHeader = () => {

  const router = useRouter();

  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const getUserInfo = async () => {
    try {
      const response = await GetCurrentUser();
      if(response.success){
        dispatch(setUser(response.data))
      }else {
        notification.error({message: response.message})
      }
    }catch (err) {
      notification.error({message: err.message})
    }
  }

  useEffect(() => {
    if(localStorage.getItem("token")){
      getUserInfo();
    }else{
      router.push("/login");
    }
  }, [])

  return (
    user && 
    (<Header>
      <Typography.Link href="/" level={3}>Book My Show</Typography.Link>
      <Flex>
        <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
        <Typography.Text>{user.name}</Typography.Text>
        <LogoutOutlined />
      </Flex>
    </Header>)
  );
};

export default AppHeader;
