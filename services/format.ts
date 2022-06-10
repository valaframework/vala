class FormatService {
  currency(
    value: number,
    currency: string = "USD",
    timeZone: string = "en-US",
  ): string {
    return new Intl.NumberFormat(timeZone, {
      style: "currency",
      currency: currency,
    }).format(value);
  }

  queryParams(obj: Record<any, any>): string {
    let query: string = "";

    if (Object.keys(obj).length !== 0) {
      query = `${
        Object.entries(obj).sort().map(([key, val]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
        ).join("&")
      }`;
    }

    return query;
  }

  arrayChunk(original: Array<any>, chunk_size: number): Array<any> {
    let index = 0;
    const temp = [];

    for (index = 0; index < original.length; index += chunk_size) {
      temp.push(original.splice(index, index + chunk_size));
    }

    return temp;
  }

}

export default FormatService;
