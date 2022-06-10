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
}

export default SecurityServices;
