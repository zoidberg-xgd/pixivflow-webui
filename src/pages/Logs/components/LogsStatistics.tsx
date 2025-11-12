import { Card, Row, Col, Statistic, Badge } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface LogsStatisticsProps {
  total: number;
  error: number;
  warn: number;
  info: number;
}

export function LogsStatistics({ total, error, warn, info }: LogsStatisticsProps) {
  const { t } = useTranslation();

  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title={t('logs.totalLogs')}
            value={total}
            prefix={<FileTextOutlined />}
            valueStyle={{ fontSize: '20px' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title={t('logs.errors')}
            value={error}
            prefix={<Badge status="error" />}
            valueStyle={{ color: '#cf1322', fontSize: '20px' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title={t('logs.warnings')}
            value={warn}
            prefix={<Badge status="warning" />}
            valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title={t('logs.info')}
            value={info}
            prefix={<Badge status="processing" />}
            valueStyle={{ color: '#1890ff', fontSize: '20px' }}
          />
        </Card>
      </Col>
    </Row>
  );
}

