import { decode, encode } from "../helpers/base64.helper.ts";

class SecurityServices {
  uuid(): string {
    let date: number = new Date().getTime();
    const uuid: string = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(
      /[xy]/g,
      (c: any) => {
        const result: number = (date + Math.random() * 16) % 16 | 0;
        date = Math.floor(date / 16);
        return (c == "x" ? result : (result & 0x3 | 0x8)).toString(16);
      },
    );
    return uuid;
  }

  private toHex(arr: ArrayBuffer): string {
    return [...new Uint8Array(arr)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  }

  private async importKey(
    key: string,
    algorithm: HmacImportParams = { name: "HMAC", hash: "SHA-256" },
    exportable: boolean = false,
    keyUsages: KeyUsage[] = ["sign", "verify"],
  ) {
    return await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      algorithm,
      exportable,
      keyUsages,
    );
  }

  async sha256(
    secret: string,
    message: string,
    method: string = "",
  ) {
    const hash = await crypto.subtle.sign(
      { name: "HMAC", hash: "SHA-256" },
      await this.importKey(secret, { name: "HMAC", hash: "SHA-256" }),
      new TextEncoder().encode(message),
    );

    const digets = await crypto.subtle.digest({ name: "SHA-256" }, hash);

    switch (method) {
      case "hex":
        return this.toHex(hash);
      case "hexdigest":
        return this.toHex(digets);
      case "base64":
        return btoa(String.fromCharCode(...new Uint8Array(hash)));
      case "base64digest":
        return btoa(String.fromCharCode(...new Uint8Array(digets)));
      default:
        return this.toHex(hash);
    }
  }

  async createJWT(header: any, payload: any, secret: string): Promise<string> {
    const bHdr = encode(new TextEncoder().encode(JSON.stringify(header)));
    const bPyld = encode(new TextEncoder().encode(JSON.stringify(payload)));
    const oTkn = `${bHdr}.${bPyld}`;
    const s: string = await this.sha256(secret, oTkn);
    return oTkn + "." + s.toString();
  }

  async verifyJWT(token: string, secret: string) {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return;
    }
    const s: string = await this.sha256(secret, `${parts[0]}.${parts[1]}`);
    const calcSign = s.toString();
    if (calcSign !== parts[2]) return;

    const pyld = JSON.parse(new TextDecoder().decode(decode(parts[1])));
    if (pyld.exp && Date.now() > pyld.exp) {
      return;
    }
    return pyld;
  }
}

export default SecurityServices;

