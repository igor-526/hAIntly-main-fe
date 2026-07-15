"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert, AppBar, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, FormControl, IconButton, List, ListItem, ListItemButton, ListItemText, Menu, MenuItem, Paper, Select, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { useHhAccounts } from "./use-hh-accounts";
import { FilterDrawer } from "@/features/filters/filter-drawer";
import type { HhAccount } from "./types";

const accountName = (account: HhAccount) => account.display_name ?? account.email ?? `HH ${account.hh_user_id}`;

type AccountsDrawerProps = {
  accounts: HhAccount[]; active: HhAccount; pending: boolean; error?: string;
  connect: () => Promise<void>; select: (id: string) => Promise<void>; remove: (id: string) => Promise<boolean>;
};

function AccountsDrawer({ accounts, active, pending, error, connect, select, remove }: AccountsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<HhAccount | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const deleteInFlight = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeDrawer = () => { if (!pending) setOpen(false); };
  const closeDialog = () => { if (!deleteInFlight.current && !pending) setTarget(null); };
  const confirmDelete = async () => {
    if (!target || deleteInFlight.current) return;
    deleteInFlight.current = true; setSubmitting(true);
    const removed = await remove(target.id);
    deleteInFlight.current = false; setSubmitting(false);
    if (removed) setTarget(null);
  };
  return <>
    <Button ref={trigger} color="inherit" variant="outlined" aria-label={`Активный аккаунт HH: ${accountName(active)}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(true)} disabled={pending} sx={{ textTransform:"none" }}>
      HH: {accountName(active)}
    </Button>
    <Drawer anchor="top" open={open} onClose={(_, reason) => { if (!pending && (reason === "escapeKeyDown" || reason === "backdropClick")) closeDrawer(); }} slotProps={{ transition: { onExited: () => trigger.current?.focus() } }}>
      <Box role="dialog" aria-label="Управление аккаунтами HH" sx={{ width:"100%", maxWidth:960, mx:"auto", p:{xs:2,sm:3} }}>
        <Stack direction="row" sx={{justifyContent:"space-between",alignItems:"center",mb:1}}><Typography variant="h6">Аккаунты HeadHunter</Typography><IconButton aria-label="Закрыть управление аккаунтами HH" disabled={pending} onClick={closeDrawer}>×</IconButton></Stack>
        {error && <Alert severity="error" sx={{mb:1}}>{error}</Alert>}
        <List aria-label="Подключённые профили">
          {accounts.map(account => <ListItem key={account.id} disablePadding secondaryAction={<Button color="error" disabled={pending} onClick={() => setTarget(account)}>Удалить</Button>}>
            <ListItemButton selected={account.id === active.id} disabled={pending} onClick={() => { if (account.id !== active.id) void select(account.id); }}>
              <Avatar src={account.avatar_url ?? undefined} sx={{mr:2}}>{accountName(account).slice(0,1)}</Avatar><ListItemText primary={accountName(account)} secondary={account.email}/>{account.id === active.id && <Chip label="Активен" color="primary" size="small" sx={{mr:8}}/>}
            </ListItemButton>
          </ListItem>)}
        </List>
        <Divider sx={{my:2}}/><Stack direction={{xs:"column",sm:"row"}} sx={{gap:1}}><Button variant="contained" disabled={pending} onClick={() => { setOpen(false); void connect(); }}>Добавить аккаунт</Button><Button disabled={pending} onClick={closeDrawer}>Закрыть</Button></Stack>
      </Box>
    </Drawer>
    <Dialog open={!!target} onClose={(_, reason) => { if (reason !== "backdropClick" || !submitting) closeDialog(); }} disableEscapeKeyDown={submitting || pending} aria-labelledby="delete-account-title">
      <DialogTitle id="delete-account-title">Удалить аккаунт HH?</DialogTitle>
      <DialogContent><DialogContentText>Профиль «{target ? accountName(target) : ""}» будет отвязан от HAIntly. Это действие нельзя отменить.</DialogContentText>{error && <Alert severity="error" sx={{mt:2}}>{error}</Alert>}</DialogContent>
      <DialogActions><Button disabled={submitting || pending} onClick={closeDialog}>Отмена</Button><Button color="error" variant="contained" disabled={submitting || pending} onClick={() => void confirmDelete()}>{submitting || pending ? "Удаляем…" : "Удалить"}</Button></DialogActions>
    </Dialog>
  </>;
}

function WorkspaceShell() {
  const root = useRef<HTMLDivElement>(null); const [left, setLeft] = useState(46); const resize=(next:number)=>setLeft(Math.max(32,Math.min(68,next)));
  const [filtersOpen, setFiltersOpen] = useState(false);
  return <Box ref={root} component="section" sx={{ flex:1, display:{xs:"flex",md:"grid"}, flexDirection:"column", gridTemplateColumns:`minmax(20rem,${left}%) .6rem minmax(20rem,1fr)`, p:2, overflow:"auto", gap:{xs:2,md:0} }}>
    <Paper component="article" variant="outlined" sx={{p:2,borderRadius:{xs:2,md:"12px 0 0 12px"}}}><Stack direction="row" sx={{justifyContent:"space-between"}}><Box><Typography variant="overline" color="primary">Поиск работы</Typography><Typography variant="h5">Вакансии</Typography></Box><Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFiltersOpen(true)} sx={{ textTransform: "none" }}>Фильтры</Button></Stack><FormControl fullWidth sx={{mt:2}}><Select disabled value="future"><MenuItem value="future">Резюме появятся на следующем этапе</MenuItem></Select></FormControl><Empty title="Список вакансий пока пуст" text="Сбор вакансий будет доступен в следующем обновлении."/></Paper>
    <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    <Box role="separator" aria-label="Изменить ширину панелей" aria-orientation="vertical" tabIndex={0} sx={{display:{xs:"none",md:"block"},cursor:"col-resize",bgcolor:"primary.100"}} onPointerDown={event=>{const el=root.current;if(!el)return;event.currentTarget.setPointerCapture(event.pointerId);const move=(e:PointerEvent)=>resize(((e.clientX-el.getBoundingClientRect().left)/el.clientWidth)*100);const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)}} onKeyDown={e=>{if(e.key==="ArrowLeft")resize(left-4);if(e.key==="ArrowRight")resize(left+4)}}/>
    <Paper component="article" variant="outlined" sx={{p:2,borderRadius:{xs:2,md:"0 12px 12px 0"},display:"flex",flexDirection:"column"}}><Typography variant="overline" color="primary">Карточка вакансии</Typography><Typography variant="h5">Информация и AI</Typography><Empty title="Выберите вакансию" text="Здесь появятся детали, оценка релевантности и сопроводительное письмо."/><Stack direction="row" sx={{gap:1,flexWrap:"wrap"}}><Button disabled>Оценить релевантность</Button><Button disabled>Создать письмо</Button></Stack></Paper>
  </Box>;
}
function Empty({title,text}:{title:string;text:string}){return <Stack sx={{alignItems:"center",justifyContent:"center",textAlign:"center",minHeight:190,flex:1,color:"text.secondary"}}><Typography color="text.primary" sx={{fontWeight:700}}>{title}</Typography><Typography>{text}</Typography></Stack>}

export function HhWorkspace() {
  const hh=useHhAccounts(); const auth=useAuth(); const router=useRouter(); const active=hh.accounts.find(a=>a.id===hh.activeId); const [profileAnchor,setProfileAnchor]=useState<HTMLElement|null>(null);
  useEffect(()=>{if(auth.status==="anonymous")router.replace("/login")},[auth.status,router]);
  return <Box sx={{minHeight:"100vh",display:"flex",flexDirection:"column",bgcolor:"background.default"}}>
    <AppBar position="static" color="inherit" elevation={0} sx={{borderBottom:1,borderColor:"divider"}}><Toolbar sx={{gap:1}}><Typography component={Link} href="/" variant="h5" color="primary" sx={{fontWeight:800,textDecoration:"none",flexGrow:1}}>HAIntly</Typography>
      {hh.loading?<Typography role="status">Загружаем HH…</Typography>:hh.accounts.length===0?<Button variant="contained" disabled={hh.pending} onClick={hh.connect}>{hh.pending?"Открываем HH…":"Войти через HH"}</Button>:active?<AccountsDrawer accounts={hh.accounts} active={active} pending={hh.pending} error={hh.error} connect={hh.connect} select={hh.select} remove={hh.remove}/>:null}
      <Tooltip title="Меню профиля"><IconButton aria-label="Меню профиля" onClick={e=>setProfileAnchor(e.currentTarget)}><Avatar sx={{width:34,height:34}}>П</Avatar></IconButton></Tooltip><Menu anchorEl={profileAnchor} open={!!profileAnchor} onClose={()=>setProfileAnchor(null)}><MenuItem disabled>Настройки</MenuItem><MenuItem disabled={auth.logoutPending} onClick={()=>{setProfileAnchor(null);void auth.logout()}}>{auth.logoutPending?"Выходим…":"Выход"}</MenuItem></Menu>
    </Toolbar></AppBar>
    {auth.logoutError&&<Alert severity="error" action={<Button color="inherit" disabled={auth.logoutPending} onClick={()=>void auth.logout()}>Повторить выход</Button>}>{auth.logoutError}</Alert>}
    {hh.error&&!active&&<Alert severity="error" action={<Button color="inherit" onClick={()=>void hh.load()}>Повторить</Button>}>{hh.error}</Alert>}
    {!hh.loading&&!active?<Stack component="main" spacing={2} sx={{alignItems:"center",justifyContent:"center",textAlign:"center",m:"auto",p:3,maxWidth:600}}><Typography variant="overline" color="primary">Начало работы</Typography><Typography variant="h3">Подключите аккаунт HeadHunter</Typography><Typography color="text.secondary">После подключения здесь появится рабочая область с резюме и вакансиями.</Typography><Button variant="contained" disabled={hh.pending} onClick={hh.connect}>{hh.pending?"Открываем HH…":"Подключить HH"}</Button></Stack>:active?<WorkspaceShell/>:null}
  </Box>;
}
