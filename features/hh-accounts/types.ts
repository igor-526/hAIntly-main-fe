export type HhAccount = {
  id: string;
  hh_user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
};

export type HhAccountsSnapshot = {
  accounts: HhAccount[];
  active_account_id: string | null;
};

export type HhOAuthMessage = { type: "haintly:hh-oauth-success" };
