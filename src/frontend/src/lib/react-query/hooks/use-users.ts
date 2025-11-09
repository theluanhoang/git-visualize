import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/react-query/query-keys';
import { UserFormData, UserUpdateData, UserCreateData } from '@/lib/schemas/user';

const usersApi = {
  getAll: async () => {
    const users = [
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: null,
        role: 'student' as 'student' | 'instructor' | 'admin',
        status: 'active' as 'active' | 'inactive' | 'banned',
        joinedAt: '2024-01-15',
        lastActive: '2024-01-20',
        lessonsCompleted: 5,
        totalTimeSpent: '2h 30m',
        progress: 75,
        achievements: 3
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        avatar: null,
        role: 'student' as 'student' | 'instructor' | 'admin',
        status: 'active' as 'active' | 'inactive' | 'banned',
        joinedAt: '2024-01-14',
        lastActive: '2024-01-19',
        lessonsCompleted: 3,
        totalTimeSpent: '1h 45m',
        progress: 45,
        achievements: 1
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        avatar: null,
        role: 'instructor' as 'student' | 'instructor' | 'admin',
        status: 'active' as 'active' | 'inactive' | 'banned',
        joinedAt: '2024-01-10',
        lastActive: '2024-01-20',
        lessonsCompleted: 8,
        totalTimeSpent: '4h 15m',
        progress: 100,
        achievements: 5
      },
      {
        id: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        avatar: null,
        role: 'student' as 'student' | 'instructor' | 'admin',
        status: 'inactive' as 'active' | 'inactive' | 'banned',
        joinedAt: '2024-01-05',
        lastActive: '2024-01-12',
        lessonsCompleted: 2,
        totalTimeSpent: '1h 20m',
        progress: 25,
        achievements: 0
      },
      {
        id: 5,
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        avatar: null,
        role: 'admin' as 'student' | 'instructor' | 'admin',
        status: 'active' as 'active' | 'inactive' | 'banned',
        joinedAt: '2024-01-01',
        lastActive: '2024-01-20',
        lessonsCompleted: 12,
        totalTimeSpent: '6h 30m',
        progress: 100,
        achievements: 8
      }
    ];
    return users;
  },
  
  getById: async (id: number) => {
    return {
      id,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      avatar: null,
      role: 'student' as 'student' | 'instructor' | 'admin',
      status: 'active' as 'active' | 'inactive' | 'banned',
      bio: '',
      website: '',
      location: '',
      timezone: 'Asia/Ho_Chi_Minh',
      language: 'vi'
    };
  },
  
  create: async (data: UserCreateData) => {
    return { id: Date.now(), ...data };
  },
  
  update: async (id: number, data: UserUpdateData) => {
    return { id, ...data };
  },
  
  delete: async (id: number) => {
    return { success: true };
  },
  
  toggleStatus: async (id: number, status: 'active' | 'inactive' | 'banned') => {
    return { id, status };
  }
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: usersApi.getAll,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(String(id)),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateData }) => 
      usersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(String(id)) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' | 'banned' }) => 
      usersApi.toggleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
