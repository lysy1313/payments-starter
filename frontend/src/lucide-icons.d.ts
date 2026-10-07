// Типы для прямых импортов отдельных иконок; не загружаем весь barrel-модуль.
declare module 'lucide-react/dist/esm/icons/*.mjs' {
  import type { LucideIcon } from 'lucide-react';
  const icon: LucideIcon;
  export default icon;
}
