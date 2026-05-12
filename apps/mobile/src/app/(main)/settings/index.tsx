import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  useCategories,
  useDeleteCategory,
  useUpdateCategory,
  type Category,
  type Workspace,
} from '@todo-list/core';
import { supabase } from '@/lib/supabase';
import { useLogout } from '@/lib/auth/logout';
import { CategoryFormSchema, PALETTE } from '@/lib/forms/schemas';

const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '0.0.1';

type AccountInfo = {
  email?: string;
  displayName?: string;
  provider?: string;
};

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-4 px-4">
      <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</Text>
      <View className="overflow-hidden rounded-lg border border-border bg-card">
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  label,
  value,
  action,
  disabled,
}: {
  label: string;
  value?: string;
  action?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <View
      className={
        disabled
          ? 'flex-row items-center justify-between border-b border-border bg-muted px-4 py-3'
          : 'flex-row items-center justify-between border-b border-border px-4 py-3'
      }
    >
      <Text className={disabled ? 'text-muted-foreground' : 'text-foreground'}>{label}</Text>
      {value !== undefined ? <Text className="text-muted-foreground">{value}</Text> : null}
      {action}
    </View>
  );
}

function CategoryManagementSection({
  workspace,
  title,
}: {
  workspace: Workspace;
  title: string;
}) {
  const { data: categories = [] } = useCategories({ client: supabase, workspace });
  const updateCategory = useUpdateCategory({ client: supabase });
  const deleteCategory = useDeleteCategory({ client: supabase });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState<string>(PALETTE[0]);

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setDraftName(category.name);
    setDraftColor(category.color || PALETTE[0]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName('');
    setDraftColor(PALETTE[0]);
  };

  const saveEdit = async (category: Category) => {
    const parsed = CategoryFormSchema.safeParse({
      name: draftName.trim(),
      color: draftColor,
    });
    if (!parsed.success) {
      Alert.alert('입력 오류', parsed.error.issues[0]?.message ?? '분류 입력을 확인해 주세요.');
      return;
    }
    try {
      await updateCategory.mutateAsync({ id: category.id, patch: parsed.data });
      cancelEdit();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
      Alert.alert('분류 수정 실패', msg);
    }
  };

  const confirmDelete = (category: Category) => {
    Alert.alert(
      '분류 삭제',
      `'${category.name}' 분류만 삭제합니다. 연결된 Epic 과 Sub 는 삭제되지 않고 '분류 없음'으로 전환됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory.mutateAsync({ id: category.id, workspace });
              if (editingId === category.id) cancelEdit();
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : '다시 시도해 주세요.';
              Alert.alert('분류 삭제 실패', msg);
            }
          },
        },
      ],
    );
  };

  return (
    <SettingsSection title={title}>
      {categories.length === 0 ? (
        <View className="border-b border-border px-4 py-3">
          <Text className="text-sm text-muted-foreground">등록된 분류가 없습니다.</Text>
        </View>
      ) : (
        categories.map((category) => {
          const editing = editingId === category.id;
          return (
            <View key={category.id} className="border-b border-border px-4 py-3">
              {editing ? (
                <View className="gap-2">
                  <TextInput
                    value={draftName}
                    onChangeText={setDraftName}
                    maxLength={50}
                    className="rounded-md border border-border px-3 py-2 text-foreground"
                    accessibilityLabel={`${category.name} 분류 이름`}
                  />
                  <View className="flex-row flex-wrap gap-2">
                    {PALETTE.map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => setDraftColor(color)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: draftColor === color }}
                        accessibilityLabel={`${color} 색상 선택`}
                        className={`h-8 w-8 rounded-full ${
                          draftColor === color ? 'border-2 border-foreground' : 'border border-border'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </View>
                  <View className="flex-row justify-end gap-2">
                    <Pressable
                      onPress={cancelEdit}
                      className="rounded-md border border-border px-3 py-2"
                      accessibilityRole="button"
                      accessibilityLabel="분류 수정 취소"
                    >
                      <Text className="text-xs text-foreground">취소</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void saveEdit(category)}
                      disabled={updateCategory.isPending}
                      className="rounded-md bg-primary px-3 py-2"
                      accessibilityRole="button"
                      accessibilityLabel="분류 저장"
                    >
                      <Text className="text-xs text-primary-foreground">저장</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center justify-between gap-3">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <View
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color || '#9CA3AF' }}
                    />
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {category.name}
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <Pressable onPress={() => startEdit(category)} accessibilityRole="button">
                      <Text className="text-xs text-primary">수정</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => confirmDelete(category)}
                      accessibilityRole="button"
                      accessibilityLabel={`${category.name} 분류 삭제`}
                    >
                      <Text className="text-xs text-red-600">삭제</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </SettingsSection>
  );
}

export default function SettingsScreen() {
  const logout = useLogout();
  const [user, setUser] = useState<AccountInfo | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
      const appMeta = (data.user?.app_metadata ?? {}) as Record<string, unknown>;
      const displayName =
        (typeof meta.name === 'string' && meta.name) ||
        (typeof meta.full_name === 'string' && meta.full_name) ||
        undefined;
      const provider =
        (typeof appMeta.provider === 'string' && appMeta.provider) || undefined;
      setUser({
        email: data.user?.email ?? undefined,
        displayName,
        provider,
      });
    });
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="mt-4 px-4">
        <View className="flex-row items-center gap-3 rounded-lg border border-border bg-card p-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Text className="text-base font-semibold text-primary-foreground">
              {user?.displayName?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? '?'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              {user?.displayName ?? '이름 미설정'}
            </Text>
            <Text className="text-xs text-muted-foreground">{user?.email ?? '—'}</Text>
            {user?.provider ? (
              <Text className="mt-0.5 text-xs text-muted-foreground">로그인: {user.provider}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <SettingsSection title="계정">
        <SettingsRow label="소셜 계정 연동" value="곧 제공 예정" disabled />
        <SettingsRow label="알림 설정" value="곧 제공 예정" disabled />
      </SettingsSection>

      <SettingsSection title="테마">
        <SettingsRow label="화면 모드" value="시스템" disabled />
      </SettingsSection>

      <CategoryManagementSection workspace="life" title="생활 분류" />
      <CategoryManagementSection workspace="work" title="업무 분류" />

      <SettingsSection title="정보">
        <SettingsRow label="버전" value={APP_VERSION} />
        <SettingsRow
          label="로그아웃"
          action={
            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              className="rounded-md border border-red-600 px-3 py-1"
            >
              <Text className="text-xs text-red-600">로그아웃</Text>
            </Pressable>
          }
        />
      </SettingsSection>
    </ScrollView>
  );
}
