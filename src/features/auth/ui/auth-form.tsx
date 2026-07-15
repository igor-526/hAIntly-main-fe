"use client";
import { Alert, Button, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useLogin } from "../hooks/use-login";
export function AuthForm() {
  const f = useLogin();
  return <Paper component="section" elevation={8} aria-labelledby="auth-title" sx={{ width: "100%", maxWidth: 440, p: { xs: 3, sm: 4 } }}>
    <Typography id="auth-title" variant="h4" color="primary" sx={{fontWeight:800,textAlign:"center",mb:3}}>HAIntly</Typography>
    <ToggleButtonGroup exclusive fullWidth value={f.mode} aria-label="Режим формы" onChange={(_, value) => { if (value) f.switchMode(value); }} sx={{ mb: 3, gap: 1, "& .MuiToggleButtonGroup-grouped": { borderRadius: "10px!important", border: "1px solid!important" } }}>
      <ToggleButton value="login">Вход</ToggleButton><ToggleButton value="register">Регистрация</ToggleButton>
    </ToggleButtonGroup>
    <Stack component="form" noValidate spacing={2} onSubmit={e => { e.preventDefault(); void f.submit(); }}>
      <TextField label="Email" type="email" autoComplete="email" value={f.mode === "login" ? f.login.email : f.register.email} error={!!f.errors.email} helperText={f.errors.email} onChange={e => f.mode === "login" ? f.setLogin(v => ({...v,email:e.target.value})) : f.setRegister(v => ({...v,email:e.target.value}))}/>
      <TextField label="Пароль" type="password" autoComplete={f.mode === "login" ? "current-password" : "new-password"} value={f.mode === "login" ? f.login.password : f.register.password} error={!!f.errors.password} helperText={f.errors.password} onChange={e => f.mode === "login" ? f.setLogin(v => ({...v,password:e.target.value})) : f.setRegister(v => ({...v,password:e.target.value}))}/>
      {f.submitError && <Alert severity="error" role="alert">{f.submitError}</Alert>}{f.success && <Alert severity="success" role="status">{f.success}</Alert>}
      <Button type="submit" variant="contained" size="large" disabled={f.pending}>{f.pending ? "Подождите…" : f.mode === "login" ? "Войти" : "Зарегистрироваться"}</Button>
    </Stack>
  </Paper>;
}
