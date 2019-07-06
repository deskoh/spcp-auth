# SingPass Authentication using MockPass

Working example using [MockPass](https://github.com/opengovsg/mockpass), a mock SingPass/CorpPass server and [spcp-auth-client](https://github.com/opengovsg/spcp-auth-client).

## QuickStart

```sh
# Install dependencies
npm i --prefix=mockpass
npm i

# Starts MockPass
npm start --prefix mockpass

# Starts Client
npm run dev

# Go to http://localhost:5000/private
# See Hello World in browser.
```

## VS Code Debugging

[Compount Launch Configurations](https://code.visualstudio.com/docs/editor/debugging#_compound-launch-configurations) can be used to start debug sesssions for Client and MockPass in parallel.

Breakpoints can be set in `mockpass\node_modules\@opengovsg\mockpass\lib\express\spcp.js` understand SingPass authentication flow.
