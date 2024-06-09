const getMiddlewares = (proxy) => {
  const webSocketProxies = [];
  const middlewares = [];
  if (proxy) {
    const { createProxyMiddleware } = require("http-proxy-middleware");

    /**
     * @param {ProxyConfigArrayItem} proxyConfig
     * @returns {RequestHandler | undefined}
     */
    const getProxyMiddleware = (proxyConfig) => {
      // It is possible to use the `bypass` method without a `target` or `router`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        const context = proxyConfig.context || proxyConfig.path;

        return createProxyMiddleware(
          /** @type {string} */ (context),
          proxyConfig
        );
      }

      if (proxyConfig.router) {
        return createProxyMiddleware(proxyConfig);
      }

      // TODO improve me after drop `bypass` to always generate error when configuration is bad
      // if (!proxyConfig.bypass) {
      //   util.deprecate(
      //     () => {},
      //     `Invalid proxy configuration:\n\n${JSON.stringify(
      //       proxyConfig,
      //       null,
      //       2
      //     )}\n\nThe use of proxy object notation as proxy routes has been removed.\nPlease use the 'router' or 'context' options. Read more at https://github.com/chimurai/http-proxy-middleware/tree/v2.0.6#http-proxy-middleware-options`,
      //     "DEP_WEBPACK_DEV_SERVER_PROXY_ROUTES_ARGUMENT"
      //   )();
      // }
    };

    /**
     * Assume a proxy configuration specified as:
     * proxy: [
     *   {
     *     context: "value",
     *     ...options,
     *   },
     *   // or:
     *   function() {
     *     return {
     *       context: "context",
     *       ...options,
     *     };
     *   }
     * ]
     */
    proxy.forEach((proxyConfigOrCallback) => {
      /**
       * @type {RequestHandler}
       */
      let proxyMiddleware;

      let proxyConfig =
        typeof proxyConfigOrCallback === "function"
          ? proxyConfigOrCallback()
          : proxyConfigOrCallback;

      proxyMiddleware =
        /** @type {RequestHandler} */
        (getProxyMiddleware(proxyConfig));

      if (proxyConfig.ws) {
        webSocketProxies.push(proxyMiddleware);
      }

      /**
       * @param {Request} req
       * @param {Response} res
       * @param {NextFunction} next
       * @returns {Promise<void>}
       */
      const handler = async (req, res, next) => {
        if (typeof proxyConfigOrCallback === "function") {
          const newProxyConfig = proxyConfigOrCallback(req, res, next);

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;

            const socket = req.socket != null ? req.socket : req.connection;
            // @ts-ignore
            const server = socket != null ? socket.server : null;

            if (server) {
              server.removeAllListeners("close");
            }

            proxyMiddleware =
              /** @type {RequestHandler} */
              (getProxyMiddleware(proxyConfig));
          }
        }

        // - Check if we have a bypass function defined
        // - In case the bypass function is defined we'll retrieve the
        // bypassUrl from it otherwise bypassUrl would be null
        // TODO remove in the next major in favor `context` and `router` options
        const isByPassFuncDefined = typeof proxyConfig.bypass === "function";
        // if (isByPassFuncDefined) {
        //   util.deprecate(
        //     () => {},
        //     "Using the 'bypass' option is deprecated. Please use the 'router' or 'context' options. Read more at https://github.com/chimurai/http-proxy-middleware/tree/v2.0.6#http-proxy-middleware-options",
        //     "DEP_WEBPACK_DEV_SERVER_PROXY_BYPASS_ARGUMENT"
        //   )();
        // }
        const bypassUrl = isByPassFuncDefined
          ? await /** @type {ByPass} */ (proxyConfig.bypass)(
              req,
              res,
              proxyConfig
            )
          : null;

        if (typeof bypassUrl === "boolean") {
          // skip the proxy
          res.statusCode = 404;
          req.url = "";
          next();
        } else if (typeof bypassUrl === "string") {
          // byPass to that url
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      };

      middlewares.push({
        name: "http-proxy-middleware",
        middleware: handler,
      });
      // Also forward error requests to the proxy so it can handle them.
      middlewares.push({
        name: "http-proxy-middleware-error-handler",
        middleware:
          /**
           * @param {Error} error
           * @param {Request} req
           * @param {Response} res
           * @param {NextFunction} next
           * @returns {any}
           */
          (error, req, res, next) => handler(req, res, next),
      });
    });
  }
  return {
    middlewares,
    webSocketProxies,
  };
};

module.exports = getMiddlewares;
