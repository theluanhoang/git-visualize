import { User } from '@/types/user';
import { UserCard } from './UserCard';

export interface UserListProps {
  users: User[];
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onSendEmail?: (user: User) => void;
}

export function UserList({ 
  users, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSendEmail 
}: UserListProps) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onSendEmail={onSendEmail}
        />
      ))}
    </div>
  );
}
