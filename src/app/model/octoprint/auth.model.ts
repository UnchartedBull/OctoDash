/* eslint-disable camelcase */

export interface OctoprintLogin {
  _is_external_client: boolean;
  _login_mechanism: string;
  active: boolean;
  admin: boolean;
  apikey: string;
  groups: Array<string>;
  name: string;
  needs: {
    groups: Array<string>;
    role: Array<string>;
  };
  permissions: Array<string>;
  roles: Array<string>;
  session: string;
  user: boolean;
}

export interface AppToken {
  app_token: string;
}

export interface TokenSuccess {
  api_key: string;
}
