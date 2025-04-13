export type SystemSetting = {
  id: string;
  key: string;
  trial_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Notifications = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
