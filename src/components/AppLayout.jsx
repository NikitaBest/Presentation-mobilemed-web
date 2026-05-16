/**
 * Оболочка экрана: колонка на всю ширину, отступы задаёт родитель (.app-root).
 */
export function AppLayout({ children }) {
  return <div className="app-layout">{children}</div>
}
