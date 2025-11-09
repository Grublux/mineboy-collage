declare module 'speakeasy' {
  export function totp(options: {
    secret: string;
    encoding?: string;
    window?: number;
    token?: string;
  }): string;

  export namespace totp {
    function verify(options: {
      secret: string;
      encoding?: string;
      window?: number;
      token: string;
    }): boolean;
  }

  export function generateSecret(options: {
    length?: number;
    name?: string;
    issuer?: string;
  }): {
    base32: string;
    otpauth_url?: string;
  };

  export function otpauthURL(options: {
    secret: string;
    label: string;
    issuer: string;
    encoding?: string;
  }): string;
}

