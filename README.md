# Vala Framework for Deno JS
_Fast, simple, minimalist web framework for Deno._

```javascript
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
const app = new Application();
app.controllers([MyController]);
await app.serve({port: 8000})
```

### Features

- Server written 100% for Native Deno
- Decorators for handling controllers, events, services and routes
- File upload features
- Methods for working with events
- Methods for encryption and security algorithms
- Environment Variables
- Middlewares
- Serve static files

The main idea of vala is to allow development quickly, easily and simply.

## Import the module
We import vala from its url

```javascript
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
```

## Starting the server
We started our first server.

```javascript
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
const app = new Application();
await app.serve({port:4242})
```

## Controllers

The controllers in vala are in charge of handling the routes and their methods, then we will create a new controller and register it on our server.

```javascript
// MyController.ts
import { Context, Controller, Get, Post } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";

@Controller('') // we indicate the initial path
class MyController {
    @Get('/') // We indicate the route for this method
    async myMethod(ctx:Context){
        return await ctx.response.json({message:"Hello world"});
    }
    
    @Get('/params/:id') // We indicate a route with parameters
    async myMethod2(ctx:Context){
        return await ctx.response.json({id:ctx.params.id});
    }
    
    @Post('/data') // We indicate a route of type post
    async myMethod3(ctx:Context){
        const data = ctx.request.body;
        if(data){
            return await ctx.response.json({data:data});    
        } else {
            return await ctx.response.json({err:"Error"}, {status:500});
        }
        
    }
}

// export controller
export default MyController;
```

We already have our first controller created, it's time to register it in the application, for this we go to our main file and register it.

```javascript
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
// import controller
import MyController from './MyController.ts'
const app = new Application();
// We register the controller
app.controllers([MyController])

await app.serve({port:4242})
```
From now on we have the following APIs available

| Method | url |
|:---------|:-----------|
**GET** | **/** |
**GET** | **/params/:id** |
**POST** | **/data** |

# Context
Basically, the context is an object that stores the request and the response methods of the request.
```javascript
// example

ctx = {
    request, // Object of the request
    response, // Object of the response
    body, // Object with the request body
    files, // Object with the request files
    headers, // Object with the request headers
    query, // Object with the request query URL
    params, // Object with the request parameters
}

ctx.response = {
    json, // Method that returns a json as response (ex: ctx.response.json({msg:"vala"})) 
    text, // Method that returns a string as response (ex: ctx.response.text("vala")
    send // Method that returns a Response object as a response (ex: ctx.response.send(new Request(""))
}
```

#### Some methods of Vala 

upload files:
```javascript
import { Vala } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
Vala.files.upload(file)
```

read environment variables:
```javascript
import { Vala } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
// .env file
console.log(Vala.env)
```
Sign with HMAC SHA-256:
```javascript
import { Vala } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
const signature = await Vala.security.sha256("SECRET_KEY","MESSAGE");
```

Generate UUID:
```javascript
import { Vala } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
const UUID = await Vala.security.uuid();
```

## Events
Vala allows to work with events, for this we can register an event class or we can also use the event decorator in our. controllers, we see some examples

```javascript
// MyEvents.ts
import { Event } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
// example event class
class MyEvents {
    @Event("event_print")
    printData(data:any){
        console.log(data);
    }
}

export default MyEvents;
```
Now we register our event class in our application, for this we go to the main application file and with the events method

```javascript
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
// import event class
import MyEvents from './MyEvents.ts'
....
// We register the event
app.events([MyEvents])

await app.serve({port:4242})
```

We can also create events from controllers or service
```javascript
import { Context, Controller, Event } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";

@Controller('/main') // we indicate the initial path
class MyController {
    ...
    @Event("event_print")
    printData(data:any){
        console.log(data);
    }
}

// export controller
export default MyController;
```
Call an event:
```javascript
import { Vala } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
Vala.events.dispatch("event_print", "DATA")
```
# Services
Vala nos permite crear y registrar servicios los cuales podemos acceder desde el Objeto Vala.

```javascript
// MyService.ts
import { Service } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";

@Service
class MyServices {
    printData(data:any){
        console.log(data);
    }
}

export default MyServices;
```

As in the previous steps, we register the service in our application.

```javascript
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
// import service class
import MyService from './MyService.ts'
....
// We register the service
app.services([MyService])

await app.serve({port:4242})
```

From now on we can access our service from the Vala object, let's see an example

```javascript
import { Context, Controller, Get, Vala } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";

@Controller('/main') // we indicate the initial path
class MyController {
    ...
    @Get("/:id")
    async main(ctx:Context){
        // We access the service
        Vala.services.MyServices.printData(ctx.params.id);
        return await ctx.response.json({msg:"Vala"});
    }
}

// export controller
export default MyController;
```

# Middlewares
Vala, it allows us to use middlewares for a particular route as a global scope, we see some examples
```javascript
// Middleware global
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
...
// We register the middleware
app.use(middleware);
...
await app.serve({port:4242})
```
Middleware for a route
```javascript
import { Context, Controller, Get } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";

@Controller('/main') // we indicate the initial path
class MyController {
    ...
    @Get("/:id",[middleware]) // We register the middleware in the route
    async main(ctx:Context){
        return await ctx.response.json({msg:"Vala"});
    }
}

// export controller
export default MyController;
```

# Serve static files
Vala also allows you to serve static files, you just have to indicate the path of the directory where the files will be found and that's it

```javascript
import { Application } from "https://deno.land/x/vala@LAST_VERSION/mod.ts";
...
app.static("public");
...
await app.serve({port:4242})
```

>There are still many more things to develop for Vala, we are in the process of adding new features, your feedback is very important to us.
>Thank you for using Vala.

## License

MIT