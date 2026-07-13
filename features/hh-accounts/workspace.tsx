"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useHhAccounts } from "./use-hh-accounts";
import type { HhAccount } from "./types";

const accountName = (account: HhAccount) => account.display_name ?? account.email ?? `HH ${account.hh_user_id}`;

type AccountMenuProps = {
  accounts: HhAccount[];
  active: HhAccount;
  pending: boolean;
  connect: () => Promise<void>;
  select: (id: string) => Promise<void>;
  remove: (id: string) => Promise<boolean>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onDeleteSuccess: () => void;
};

function AccountMenu({ accounts, active, pending, connect, select, remove, triggerRef, onDeleteSuccess }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const deleteInFlight = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const closeMenu = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const closeDialog = () => {
    if (deleteInFlight.current) return;
    setConfirming(false);
    setSubmitting(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const confirmDelete = async () => {
    if (deleteInFlight.current) return;
    deleteInFlight.current = true;
    setSubmitting(true);
    const removed = await remove(active.id);
    deleteInFlight.current = false;
    setSubmitting(false);
    if (removed) { setConfirming(false); onDeleteSuccess(); }
  };
  const openMenu = () => {
    if (pending) return;
    setOpen(true);
    requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus());
  };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    if (confirming) requestAnimationFrame(() => cancel.current?.focus());
  }, [confirming]);

  const menuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % items.length;
    if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    if (next >= 0) { event.preventDefault(); items[next]?.focus(); }
    if (event.key === "Escape") { event.preventDefault(); closeMenu(); }
  };
  const dialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && !pending && !submitting) { event.preventDefault(); closeDialog(); }
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
    if (!controls.length) return;
    const index = controls.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.shiftKey ? (index <= 0 ? controls.length - 1 : index - 1) : (index === controls.length - 1 ? 0 : index + 1);
    event.preventDefault(); controls[next]?.focus();
  };

  return <>
    <div className="account-menu" ref={root}>
      <button ref={triggerRef} className="account-trigger" type="button" aria-label={`Активный аккаунт HH: ${accountName(active)}`} aria-expanded={open} aria-haspopup="menu" aria-controls={open ? menuId : undefined} disabled={pending} onClick={() => open ? closeMenu(false) : openMenu()} onKeyDown={(event) => { if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) { event.preventDefault(); openMenu(); } }}>
        <span><small>Аккаунт HH</small>{accountName(active)}</span><span aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open && <div id={menuId} className="account-dropdown" role="menu" aria-label="Управление аккаунтами HH" onKeyDown={menuKeyDown}>
        <div className="account-list" role="group" aria-label="Подключённые профили">
          {accounts.map((account) => <button key={account.id} type="button" role="menuitem" className="account-option" aria-current={account.id === active.id ? "true" : undefined} disabled={pending} onClick={() => { if (account.id !== active.id) void select(account.id); closeMenu(false); }}><span>{accountName(account)}</span>{account.id === active.id && <span className="active-mark">Активен</span>}</button>)}
        </div>
        <div className="account-menu-actions">
          <button type="button" role="menuitem" disabled={pending} onClick={() => { closeMenu(false); void connect(); }}>Добавить аккаунт</button>
          <button type="button" role="menuitem" className="menu-danger" disabled={pending} onClick={() => { setOpen(false); setConfirming(true); }}>Удалить аккаунт</button>
        </div>
      </div>}
    </div>
    {confirming && <div className="modal-overlay" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget && !pending && !submitting) closeDialog(); }}>
      <div className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} onKeyDown={dialogKeyDown}>
        <h2 id={titleId}>Удалить аккаунт HH?</h2>
        <p id={descriptionId}>Профиль «{accountName(active)}» будет отвязан от HAIntly. Это действие нельзя отменить.</p>
        <div className="dialog-actions"><button ref={cancel} type="button" className="secondary" disabled={pending || submitting} onClick={closeDialog}>Отмена</button><button type="button" className="danger-solid" disabled={pending || submitting} onClick={() => void confirmDelete()}>{pending || submitting ? "Удаляем…" : "Удалить"}</button></div>
      </div>
    </div>}
  </>;
}

function WorkspaceShell() {
  const root = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(46);
  const resize = (next: number) => setLeft(Math.max(32, Math.min(68, next)));
  return <section ref={root} className="workspace" style={{ "--left-pane": `${left}%` } as React.CSSProperties}>
    <article className="workspace-pane vacancies-pane"><div className="panel-heading"><div><span className="eyebrow">Поиск работы</span><h2>Вакансии</h2></div><button disabled>Фильтры</button></div><label>Резюме<select disabled><option>Резюме появятся на следующем этапе</option></select></label><div className="shell-empty"><strong>Список вакансий пока пуст</strong><span>Сбор вакансий будет доступен в следующем обновлении.</span></div></article>
    <div className="resizer" role="separator" aria-label="Изменить ширину панелей" aria-orientation="vertical" tabIndex={0}
      onPointerDown={(event) => { const element = root.current; if (!element) return; event.currentTarget.setPointerCapture(event.pointerId); const move = (moveEvent: PointerEvent) => resize(((moveEvent.clientX - element.getBoundingClientRect().left) / element.clientWidth) * 100); const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); }; window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); }}
      onKeyDown={(event) => { if (event.key === "ArrowLeft") resize(left - 4); if (event.key === "ArrowRight") resize(left + 4); }} />
    <article className="workspace-pane details-pane"><div><span className="eyebrow">Карточка вакансии</span><h2>Информация и AI</h2></div><div className="shell-empty"><strong>Выберите вакансию</strong><span>Здесь появятся детали, оценка релевантности и сопроводительное письмо.</span></div><div className="ai-actions"><button disabled>Оценить релевантность</button><button disabled>Создать письмо</button></div></article>
  </section>;
}

export function HhWorkspace() {
  const hh = useHhAccounts();
  const active = hh.accounts.find((account) => account.id === hh.activeId);
  const accountTrigger = useRef<HTMLButtonElement>(null);
  const [restoreAccountFocus, setRestoreAccountFocus] = useState(false);
  useEffect(() => {
    if (!restoreAccountFocus || hh.loading || !active || !accountTrigger.current) return;
    accountTrigger.current.focus();
    setRestoreAccountFocus(false);
  }, [restoreAccountFocus, hh.loading, active]);
  return <div className="app-shell">
    <header className="app-header"><Link className="brand" href="/">HAIntly</Link><div className="header-actions">
      {hh.loading ? <span role="status">Загружаем HH…</span> : hh.accounts.length === 0 ? <button disabled={hh.pending} onClick={hh.connect}>{hh.pending ? "Открываем HH…" : "Войти через HH"}</button> : active ? <AccountMenu accounts={hh.accounts} active={active} pending={hh.pending} connect={hh.connect} select={hh.select} remove={hh.remove} triggerRef={accountTrigger} onDeleteSuccess={() => setRestoreAccountFocus(true)} /> : null}
      <details className="profile-menu"><summary aria-label="Меню профиля">Профиль</summary><div><button disabled>Настройки</button><button disabled>Выход</button></div></details>
    </div></header>
    {hh.error && <div className="error-banner" role="alert"><span>{hh.error}</span><button onClick={() => void hh.load()}>Повторить</button></div>}
    {!hh.loading && !active ? <main className="connect-empty"><span className="eyebrow">Начало работы</span><h1>Подключите аккаунт HeadHunter</h1><p>После подключения здесь появится рабочая область с резюме и вакансиями.</p><button disabled={hh.pending} onClick={hh.connect}>{hh.pending ? "Открываем HH…" : "Подключить HH"}</button></main> : active ? <WorkspaceShell /> : null}
  </div>;
}
