import { Spin, Flex } from "antd";
import styles from './loader.module.css';

const loader = () => {
  return (
    <Flex align="center" justify="center" className={styles.loader}>
      <Spin />
    </Flex>
  );
};

export default loader;
