import { HttpMethod, Route } from "./types.ts";
import ApplicationService from "./services.ts";
import router from "./router.ts";

export function Controller<T extends { new (...instance: any[]): Object }>(
  _name: string,
) {
  return (fn: T): any =>
    class extends fn {
      pathController: string = _name === "/" ? "" : _name;
      controller: string = fn.name;
      constructor(...args: any[]) {
        super(...args);
      }
    };
}

export function Get(path: string, middleware?: any) {
  return (target: any, fn: string, _: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.GET,
      controller: _.value,
      middleware: middleware,
      metadata: new target.constructor(),
    };

    router.addRoutes(route);
  };
}

export function Post(path: string, middleware?: any) {
  return (target: any, fn: string, _: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.POST,
      controller: _.value,
      middleware: middleware,
      metadata: new target.constructor(),
    };

    router.addRoutes(route);
  };
}

export function Put(path: string, middleware?: any) {
  return (target: any, fn: string, _: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.PUT,
      controller: _.value,
      middleware: middleware,
      metadata: new target.constructor(),
    };

    router.addRoutes(route);
  };
}

export function Delete(path: string, middleware?: any) {
  return (target: any, fn: string, _: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.DELETE,
      controller: _.value,
      middleware: middleware,
      metadata: new target.constructor(),
    };

    router.addRoutes(route);
  };
}

export function Patch(path: string, middleware?: any) {
  return (target: any, fn: string, _: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.PATCH,
      controller: _.value,
      middleware: middleware,
      metadata: new target.constructor(),
    };

    router.addRoutes(route);
  };
}

export function Options(path: string, middleware?: any) {
  return (target: any, fn: string, _: PropertyDescriptor) => {
    const route: Route = {
      path: path,
      classController: target.constructor["name"],
      method: HttpMethod.OPTIONS,
      controller: _.value,
      middleware: middleware,
      metadata: new target.constructor(),
    };

    router.addRoutes(route);
  };
}

export function Event(path: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApplicationService.events.subscribe(path, target[propertyKey]);
    return descriptor;
  };
}

export function Service(target: Function) {
  const names = Object.getOwnPropertyNames(target.prototype);
  const methods = Object.getOwnPropertyDescriptors(target.prototype);
  const serv: Record<any, Function> = {};

  for (const key of names) {
    if (key !== "constructor") {
      serv[key] = methods[key].value;
    }
  }

  ApplicationService.service[target.name] = serv;
}
