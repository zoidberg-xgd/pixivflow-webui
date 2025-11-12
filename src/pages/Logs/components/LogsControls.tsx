import { Space, Button, Switch, Tooltip, Popconfirm } from 'antd';
import {
  ReloadOutlined,
  ClearOutlined,
  DownloadOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface LogsControlsProps {
  autoRefresh: boolean;
  autoScroll: boolean;
  isLoading: boolean;
  isClearing: boolean;
  hasLogs: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
  onAutoScrollChange: (checked: boolean) => void;
  onRefresh: () => void;
  onScrollToBottom: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function LogsControls({
  autoRefresh,
  autoScroll,
  isLoading,
  isClearing,
  hasLogs,
  onAutoRefreshChange,
  onAutoScrollChange,
  onRefresh,
  onScrollToBottom,
  onExport,
  onClear,
}: LogsControlsProps) {
  const { t } = useTranslation();

  return (
    <Space>
      <Switch
        checked={autoRefresh}
        onChange={onAutoRefreshChange}
        checkedChildren={t('logs.autoRefresh')}
        unCheckedChildren={t('logs.manualRefresh')}
      />
      {autoRefresh && (
        <Switch
          checked={autoScroll}
          onChange={onAutoScrollChange}
          checkedChildren={t('logs.autoScroll')}
          unCheckedChildren={t('logs.manualScroll')}
          size="small"
        />
      )}
      <Button
        icon={<ReloadOutlined />}
        onClick={onRefresh}
        loading={isLoading}
      >
        {t('logs.refresh')}
      </Button>
      <Tooltip title={t('logs.scrollToBottom')}>
        <Button
          icon={<VerticalAlignBottomOutlined />}
          onClick={onScrollToBottom}
        />
      </Tooltip>
      <Button
        icon={<DownloadOutlined />}
        onClick={onExport}
        disabled={!hasLogs}
      >
        {t('logs.export')}
      </Button>
      <Popconfirm
        title={t('logs.confirmClear')}
        onConfirm={onClear}
        okText={t('common.ok')}
        cancelText={t('common.cancel')}
      >
        <Button
          danger
          icon={<ClearOutlined />}
          loading={isClearing}
        >
          {t('logs.clearLogs')}
        </Button>
      </Popconfirm>
    </Space>
  );
}

