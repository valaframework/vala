import {
  defaultOptionsServer,
  RequestSemType,
  Route,
  ServerOptions,
} from "./types.ts";
import RequestSem from "./request.ts";
import router from "./router.ts";

class ValaFramework {
  private request: RequestSem = new RequestSem();
  private pathStaticFiles = "";

  controllers(controllers: Array<any>) {
    controllers.map((controllerClass: any) => {
      const ctrl = new controllerClass();
      if (ctrl.getPathController) {
        const { controller, path } = ctrl.getPathController();
        router.setRouterController(controller, path);
      }
    });
  }

  services(services: Array<any>) {
    services.map((service: any) => new service());
  }

  events(events: Array<any>) {
    events.map((event: any) => new event());
  }

  use(middleware: Function) {
    router.addMiddleware(middleware);
  }

  static(path: string) {
    this.pathStaticFiles = path;
  }

  setCors() {
  }

  private async notFound(requestEvent: Deno.RequestEvent) {
    const url: URL = new URL(requestEvent.request.url);
    const notFoundResponse = new Response(
      "Cannot " + requestEvent.request.method + " " + url.pathname,
      { status: 404, statusText: "404 not found" },
    );

    return await requestEvent.respondWith(notFoundResponse);
  }

  private handler(requestEvent: Deno.RequestEvent): Route | null {
    const urlTemp: URL = new URL(requestEvent.request.url);
    return router.handler(requestEvent, urlTemp.pathname);
  }

  parseDirStaticFolder() {
    const init = new RegExp("^/");
    let dir: string = this.pathStaticFiles;
    if (!init.test(dir)) {
      dir = "/" + dir;
    }

    return dir;
  }

  async recursiveFolder(path: string) {
    const files: string[] = [];
    const getFiles = async (path: string) => {
      for await (const dirEntry of Deno.readDir(path)) {
        if (dirEntry.isDirectory) {
          await getFiles(path + "/" + dirEntry.name);
        } else if (dirEntry.isFile) {
          files.push(path + "/" + dirEntry.name);
        }
      }
    };

    await getFiles(path);
    return files;
  }

  private searchFile(files: string[], path: string) {
    return new Promise((resolve) => {
      const file = files.find((e) => {
        const parse: string = "/" + e.split("/").pop();
        if (parse === path) return e;
      });

      resolve(file == undefined ? null : file);
    });
  }

  private async searchFileStatics(requestEvent: Deno.RequestEvent) {
    const url: URL = new URL(requestEvent.request.url);
    const files = await this.recursiveFolder("." + this.parseDirStaticFolder());
    const file = await this.searchFile(files, url.pathname);

    if (file != null) {
      const xfile = await Deno.open(decodeURIComponent(<string> file), {
        read: true,
      });
      await requestEvent.respondWith(
        new Response(xfile.readable, { status: 200 }),
      );
    } else {
      await this.notFound(requestEvent);
    }
  }

  private async httpHandler(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      const hand: Route | null = this.handler(requestEvent);
      if (hand != null) {
        const context: RequestSemType = await this.request.main(
          requestEvent,
          hand,
        );
        router.middlewares(context.context, hand);
      } else {
        await this.searchFileStatics(requestEvent);
      }
    }
  }

  async serve(options: ServerOptions) {
    const opts: ServerOptions = {
      ...defaultOptionsServer,
      ...options,
    };

    const server = Deno.listen(opts);
    if (opts.running != undefined) {
      opts.running(`Server running in port ${opts.port}`);
    }
    for await (const conn of server) {
      await this.httpHandler(conn).catch((err: any) => console.log("->", err));
    }
  }
}

export default ValaFramework;
