let _jwt: string | null = null;

export function setJwt(token: string | null) {
  _jwt = token;
}

export function getJwt(): string | null {
  return _jwt;
}

export function clearJwt() {
  _jwt = null;
}

export function hasJwt(): boolean {
  return _jwt !== null && _jwt.length > 0;
}
