class FormatService {
  currency(
    value: number,
    currency: string = "USD",
    timeZone: string = "es-CL",
  ): string {
    return new Intl.NumberFormat(timeZone, {
      style: "currency",
      currency: currency,
    }).format(value);
  }

  queryParams(obj: Record<any, any>): string {
    let query: string = "";

    if (Object.keys(obj).length !== 0) {
      query = `?${
        Object.entries(obj).map(([key, val]) => `${key}=${val}`).join("&")
      }`;
    }

    return query;
  }
}

export default FormatService;
