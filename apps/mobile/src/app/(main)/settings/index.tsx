import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import {
  useCategories,
  useCompletedEpicsByCategoryPeriod,
  useDeleteCategory,
  useUpdateCategory,
  type Category,
  type EpicIssue,
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

const PRIORITY_LABEL: Record<EpicIssue['priority'], string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

function formatDate(value: string | null): string {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${year}.${month}.${day}` : value;
}

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

function CompletedEpicList({ epics }: { epics: EpicIssue[] }) {
  if (epics.length === 0) {
    return (
      <View className="rounded-md bg-muted px-3 py-2">
        <Text className="text-xs text-muted-foreground">완료된 Epic 이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="gap-1.5">
      {epics.map((epic) => (
        <View key={epic.id} className="rounded-md bg-muted px-3 py-2">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="min-w-0 flex-1 text-sm font-medium text-foreground" numberOfLines={1}>
              {epic.title}
            </Text>
            <Text className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">
              100%
            </Text>
          </View>
          <View className="mt-1 flex-row flex-wrap gap-x-3 gap-y-1">
            <Text className="text-[11px] text-muted-foreground">
              우선순위 {PRIORITY_LABEL[epic.priority]}
            </Text>
            <Text className="text-[11px] text-muted-foreground">
              완료일 {formatDate(epic.completedDate)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

type CompletedEpicPeriodMode = 'month' | 'day';

function CompletedEpicArchivePanel({
  category,
  periodMode,
  month,
  day,
  epics,
  isLoading,
  isError,
  onPeriodModeChange,
  onMonthChange,
  onDayChange,
  onClose,
}: {
  category: Category;
  periodMode: CompletedEpicPeriodMode;
  month: string;
  day: string;
  epics: EpicIssue[];
  isLoading: boolean;
  isError: boolean;
  onPeriodModeChange: (mode: CompletedEpicPeriodMode) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <View className="mt-2 gap-3 rounded-md border border-primary bg-muted p-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: category.color || '#9CA3AF' }}
          />
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {category.name} 완료 Epic
          </Text>
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="완료 Epic 조회 닫기">
          <Text className="text-xs text-muted-foreground">닫기</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap items-center gap-2">
        <View className="flex-row rounded-md border border-border bg-card p-0.5">
          {(['month', 'day'] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => onPeriodModeChange(mode)}
              accessibilityRole="button"
              accessibilityState={{ selected: periodMode === mode }}
              className={`rounded px-3 py-2 ${
                periodMode === mode ? 'bg-primary' : 'bg-card'
              }`}
            >
              <Text
                className={
                  periodMode === mode
                    ? 'text-xs text-primary-foreground'
                    : 'text-xs text-muted-foreground'
                }
              >
                {mode === 'month' ? '월별' : '일별'}
              </Text>
            </Pressable>
          ))}
        </View>
        {periodMode === 'month' ? (
          <TextInput
            value={month}
            onChangeText={onMonthChange}
            placeholder="YYYY-MM"
            maxLength={7}
            className="min-w-28 rounded-md border border-border bg-card px-3 py-2 text-foreground"
            accessibilityLabel="완료 Epic 조회 월"
          />
        ) : (
          <TextInput
            value={day}
            onChangeText={onDayChange}
            placeholder="YYYY-MM-DD"
            maxLength={10}
            className="min-w-36 rounded-md border border-border bg-card px-3 py-2 text-foreground"
            accessibilityLabel="완료 Epic 조회 날짜"
          />
        )}
      </View>

      {isLoading ? (
        <View className="rounded-md bg-card px-3 py-3">
          <Text className="text-sm text-muted-foreground">완료 Epic 을 불러오는 중입니다.</Text>
        </View>
      ) : isError ? (
        <View className="rounded-md bg-card px-3 py-3">
          <Text className="text-sm text-red-600">완료 Epic 을 불러오지 못했습니다.</Text>
        </View>
      ) : (
        <CompletedEpicList epics={epics} />
      )}
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [periodMode, setPeriodMode] = useState<CompletedEpicPeriodMode>('month');
  const [month, setMonth] = useState(() => todayIso().slice(0, 7));
  const [day, setDay] = useState(() => todayIso());
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );
  const period = useMemo(
    () =>
      periodMode === 'month'
        ? { mode: 'month' as const, value: month || todayIso().slice(0, 7) }
        : { mode: 'day' as const, value: day || todayIso() },
    [periodMode, month, day],
  );
  const {
    data: selectedCompletedEpics = [],
    isLoading: completedEpicsLoading,
    isError: completedEpicsError,
  } = useCompletedEpicsByCategoryPeriod({
    client: supabase,
    workspace,
    categoryId: selectedCategoryId,
    period,
  });

  useEffect(() => {
    if (selectedCategoryId && !selectedCategory) setSelectedCategoryId(null);
  }, [selectedCategoryId, selectedCategory]);

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
              if (selectedCategoryId === category.id) setSelectedCategoryId(null);
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
        <>
          {categories.map((category) => {
          const editing = editingId === category.id;
          return (
            <View
              key={category.id}
              className={`gap-3 border-b border-border px-4 py-3 ${
                selectedCategoryId === category.id ? 'bg-muted' : ''
              }`}
            >
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
                  <Pressable
                    onPress={() => setSelectedCategoryId(category.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedCategoryId === category.id }}
                    accessibilityLabel={`${category.name} 완료 Epic 조회`}
                    className="min-w-0 flex-1 flex-row items-center gap-2"
                  >
                    <View
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color || '#9CA3AF' }}
                    />
                    <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                      {category.name}
                    </Text>
                  </Pressable>
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
          })}
          {selectedCategory ? (
            <View className="border-b border-border px-4 py-3">
              <CompletedEpicArchivePanel
                category={selectedCategory}
                periodMode={periodMode}
                month={month}
                day={day}
                epics={selectedCompletedEpics}
                isLoading={completedEpicsLoading}
                isError={completedEpicsError}
                onPeriodModeChange={setPeriodMode}
                onMonthChange={setMonth}
                onDayChange={setDay}
                onClose={() => setSelectedCategoryId(null)}
              />
            </View>
          ) : null}
        </>
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
