import { z } from 'zod';

export const TodoFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내'),
  description: z.string().max(2000, '설명은 2000자 이내').optional(),
  categoryId: z.string().uuid('분류를 선택해주세요'),
  epicId: z.string().uuid('Epic 을 선택해주세요'),
  registeredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '유효한 날짜가 아닙니다'),
});
export type TodoFormValues = z.infer<typeof TodoFormSchema>;

export const CategoryFormSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내'),
  color: z.string().regex(/^#([0-9a-f]{6})$/i, '팔레트 색상이 아닙니다'),
});
export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export const EpicFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내'),
  description: z.string().max(2000).optional(),
  priority: z.enum(['high', 'medium', 'low']),
  categoryId: z.string().uuid('분류를 선택해주세요'),
});
export type EpicFormValues = z.infer<typeof EpicFormSchema>;
