import { Notifications, SystemSetting } from "@/lib/types/systemTypes";

type SystemProps = {
  systemSettings: SystemSetting[];
  notifications: Notifications[];
};

export default function System({ systemSettings, notifications }: SystemProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold">System Settings</h2>
      <ul>
        {systemSettings.map((setting) => (
          <li key={setting.id}>
            {setting.key}: {setting.trial_enabled ? "Enabled" : "Disabled"}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-4">Notifications</h2>
      <ul>
        {notifications.map((note) => (
          <li key={note.id}>
            <strong>{note.title}</strong>: {note.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
