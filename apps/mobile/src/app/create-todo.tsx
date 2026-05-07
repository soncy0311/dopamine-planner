import { Redirect } from 'expo-router';

// sub-prd-09 §7 — `/create-todo` deep link redirect alias.
// 1 release cycle 후 본 파일 자체 제거 예정 (sub-prd-09 §미해결 §5).
export default function CreateTodoRedirect() {
  return <Redirect href="/epic-form" />;
}
