import { Space, Input, Select, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Search } = Input;
const { Option } = Select;

interface LogsFiltersProps {
  searchText: string;
  levelFilter?: string;
  pageSize: number;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onLevelFilterChange: (value?: string) => void;
  onPageSizeChange: (value: number) => void;
}

export function LogsFilters({
  searchText,
  levelFilter,
  pageSize,
  onSearchChange,
  onSearch,
  onLevelFilterChange,
  onPageSizeChange,
}: LogsFiltersProps) {
  const { t } = useTranslation();

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Row gutter={16}>
        <Col span={8}>
          <Search
            placeholder={t('logs.searchPlaceholder')}
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={onSearch}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder={t('logs.filterLevel')}
            allowClear
            style={{ width: '100%' }}
            value={levelFilter}
            onChange={onLevelFilterChange}
          >
            <Option value="DEBUG">DEBUG</Option>
            <Option value="INFO">INFO</Option>
            <Option value="WARN">WARN</Option>
            <Option value="ERROR">ERROR</Option>
            <Option value="FATAL">FATAL</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select
            value={pageSize}
            onChange={onPageSizeChange}
            style={{ width: '100%' }}
          >
            <Option value={50}>50 {t('logs.pageSize')}</Option>
            <Option value={100}>100 {t('logs.pageSize')}</Option>
            <Option value={200}>200 {t('logs.pageSize')}</Option>
            <Option value={500}>500 {t('logs.pageSize')}</Option>
            <Option value={1000}>1000 {t('logs.pageSize')}</Option>
          </Select>
        </Col>
      </Row>
    </Space>
  );
}

