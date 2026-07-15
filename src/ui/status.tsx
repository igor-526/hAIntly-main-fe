import { Alert, Button, CircularProgress, Stack, Typography } from "@mui/material";

export function Status({ text, retry }: { text: string; retry?: () => unknown }) {
  return <Stack component="main" role="status" spacing={2} sx={{ minHeight: "100vh", p: 2, alignItems: "center", justifyContent: "center" }}>
    {retry ? <Alert severity="error">{text}</Alert> : <><CircularProgress /><Typography>{text}</Typography></>}
    {retry && <Button variant="contained" onClick={() => retry()}>Повторить</Button>}
  </Stack>;
}
