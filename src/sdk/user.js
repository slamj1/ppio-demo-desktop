/* eslint-disable */
var path = require("path")
var exec = require('child_process').exec
var jayson = require('jayson')

module.exports = {
  ppioExe: path.join(process.env['PPIO_HOME'], '/bin', 'ppio'),
  env: "",
  daemonStart: function daemonStart(params, callback) {
  
    console.log('daemonStart params=' + params)
    
    //console.log('init: PPIO_HOME=' + process.env['PPIO_HOME']);
    
    /*
    var ppioExe;
    if (/Windows NT/.test(ua)) {
        console.log("windows");
        ppioExe = process.env['PPIO_HOME'] + '\bin\ppio.exe'
    } else {
        console.log("others");
        ppioExe = process.env['PPIO_HOME'] + '/bin/ppio'
    }
    */
    
    console.log('daemonStart exec ppioExe=' + this.ppioExe)
    
    /*
    var params = {
        rpchost: "127.0.0.1",
        rpcport: 18066,
        objectHash: "12345678"
    };
    */

    execCmd(this.ppioExe, 'daemon start', params, callback)
    
  },

  daemonStop: function daemonStop(params, callback) {
    execRPC('DaemonStop', params, callback)
  },
  
  daemonStopCmd: function daemonStopCmd(params, callback) {
    execCmd(this.ppioExe, 'daemon stop', params, callback)
  },
  
  configShow: function configShow(params, callback) {
    execRPC('ConfigShow', params, callback)
  },
  
  metadataPut: function MetadataGet(params, callback) {
    execRPC('MetadataPut', params, callback)
  },
  
  metadataPut: function MetadataGet(params, callback) {
    execRPC('MetadataGet', params, callback)
  },

  netId: function NetId(params, callback) {
    execRPC('NetId', params, callback)
  },
  
  netPeers: function NetPeers(params, callback) {
    execRPC('NetPeers', params, callback)
  },
  
  netServers: function NetServers(params, callback) {
    execRPC('NetServers', params, callback)
  },
  
  objectImport: function ObjectImport(params, callback) {
    execRPC('ObjectImport', params, callback)
  },
  
  objectExport: function ObjectExport(params, callback) {
    execRPC('ObjectExport', params, callback)
  },
  
  objectPut: function objectPut(params, callback) {
    execRPC('ObjectPut', params, callback)
  },
    
  objectGet: function ObjectGet(params, callback) {
    execRPC('ObjectGet', params, callback)
  },
    
  objectCopy: function objectCopy(params, callback) {
    execRPC('objectCopy', params, callback)
  },
    
  ObjectStatus: function ObjectStatus(params, callback) {
    execRPC('ObjectStatus', params, callback)
  },
    
  objectList: function ObjectList(params, callback) {
    execRPC('ObjectList', params, callback)
  },
    
  objectDelete: function ObjectDelete(params, callback) {
    execRPC('ObjectDelete', params, callback)
  },
    
  objectRenew: function ObjectRenew(params, callback) {
    execRPC('ObjectRenew', params, callback)
  },
    
  objectUpdateAcl: function ObjectUpdateAcl(params, callback) {
    execRPC('ObjectUpdateAcl', params, callback)
  },
    
  objectAuth: function ObjectAuth(params, callback) {
    execRPC('ObjectAuth', params, callback)
  },
    
  storageObject: function StorageObject(params, callback) {
    execRPC('StorageObject', params, callback)
  },
  
  storageObjects: function StorageObjects(params, callback) {
    execRPC('StorageObjects', params, callback)
  },
  
  metadataPut: function MetadataGet(params, callback) {
    execRPC('MetadataGet', params, callback)
  },
  
  metadataPut: function StorageSegments(params, callback) {
    execRPC('StorageSegments', params, callback)
  },
  
  walletId: function walletId(params, callback) {
    execRPC('WalletId', params, callback)
  },
  
  walletIdRPC: function walletIdRPC(params, callback) {
    execRPC(this.ppioExe, 'wallet id', params, callback)
  },
  
  walletIdCmd: function walletIdCmd(params, callback) {
    execCmd(this.ppioExe, 'wallet id', params, callback)
  },
  
  walletBalance: function walletBalance(params, callback) {
    execRPC('walletBalance', params, callback)
  },
  
  //holder for end, 
  holder: function holder(){}
}

function execCmd(ppioExe, subcmd, params, callback) {
  console.log('execCmd subcmd=' + subcmd + " params=" + params);
  
  subcmd = ppioExe + " " + subcmd
  var args = params2args(params)
  console.log('execCmd args=' + args)
  
  var cmd = [
    this.env,
    subcmd,
    args.join(' ')
  ].join(" ")
  console.log('execCmd cmd=' + cmd)
  
  exec(cmd, 
     function(err, stdout, stderr) {
       if (err !== null) {
           console.log('execCmd error: ' + err + " cmd=" + cmd);
           callback(err, "");
       } else {
           console.log('execCmd succeed: cmd=' + cmd);
           console.log('execCmd succeed: callback=' + callback);
           if (typeof callback !== 'undefined') {
               callback(stdout);
//             } else {
//                 util.puts(stdout);
           }
        }
     }
  );
  console.log('execCmd exec cmd=' + cmd + ' done')
}

function execRPC(method, params, callback) {
  console.log('execRPC method=' + method + " params=" + params);
  
  rpcport = 18066
  if (params["--rpcport"]) {
    rpcport = params["--rpcport"]
  }
  console.log('execRPC rpcport=', rpcport)
  
  client = jayson.client.http({port: rpcport, path: '/rpc'})
  console.log('execRPC client=', client)
  
  //var method = subcmd2method(subcmd)
  var methodParams = params2RpcParams(method, params)
  console.log('execRPC method=' + methodParams.rpcMethod)
  console.log('execRPC method=' + methodParams.rpcParams)

  client.request(
      methodParams.rpcMethod, 
      methodParams.rpcParams, 
      function(err, response) {
          console.log('execRPC: err=', err)
          console.log('execRPC: response=', response)
          if (err) {
            callback(err, "");
          } else {
            result = response.result
            console.log('execRPC: result=' + result)
            if (typeof callback !== 'undefined') {
              callback(err, result);
            }
          }
      }
  )
}

/**
* "wallet id" -> "WalletId"
*/
function subcmd2method(subcmd) {
console.log('subcmd2method, subcmd=' + subcmd)
splits = subcmd.split(" ")
var len = splits.length
var method = ""
for(var i = 0; i < len; i++){
  var SPLIT = splits[i].toUpperCase()
  method += (SPLIT[0] + splits[i].substring(1))
}
console.log('subcmd2method, method=' + method)
return method
}


// FIXME: rpc must be in order
function params2args(params) {
  
  console.log('params2args, params=' + params)
  
  var args = []
  
  /*
  var params = {
      objectHash: "127.0.0.1",
  };
  */
  
  /*
  console.log('params2args, options=' + options)
  var options = {
      rpchost: "127.0.0.1",
      rpcport: 18066
  };
  
  if (options) {
    args = Object.keys(options).map(function(key) {
      return "--" + key + "=" + '"' + options[key] + '"'
    })
  }
  
  if (params) {
    args = Object.keys(params).map(function(key) {
      return '"' + params[key] + '"'
    })
  }
  */
  
  if (params) {
    args = Object.keys(params).map(function(key) {
      if (key == "objectHash") {
        return ""
      }
      return "--" + key + "=" + '"' + params[key] + '"'
    })
  }
  
  console.log('params2args, params=' + args)
  
  if (params['objectHash']) {
    args[args.length] = params['objectHash'];
  }
  
  console.log('params2args, params=' + args)
  
  return args
}

//> curl --data 
// '{"id":1,"jsonrpc":"2.0","method":"ObjectExport",
//    "params":["7547DF322CBAF84FD02248133BF5A1C2FAE7296960ECED0EF6BDE2FF3EF37CF8","","","/home/u/ppio.txt"]}' http://127.0.0.1:18066
function params2RpcParams(method, params) {
  
  console.log('params2RpcArgs, method=' + method)
  console.log('params2RpcArgs, params=' + params)
  
  var rpcMethod = method
  var rpcParams = []
  
  if (method == "ConfigShow") {

  } else if (method == "DaemonStop") {
  
  } else if (method == "MetadataPut") {
    rpcParams[0] = params["metadata"]
    rpcParams[1] = params["encoding"]
  } else if (method == "MetadataGet") {
    rpcParams[0] = params["encoding"]
  } else if (method == "NetId") {
  
  } else if (method == "NetPeers") {
      
  } else if (method == "NetServers") {
      rpcMethod = "ListServers"
  } else if (method == "ObjectImport") {
    rpcParams[0] = params["localPath"]
    rpcParams[1] = params["encrypt"]
    rpcParams[2] = params["key"]
  } else if (method == "ObjectExport") {
    rpcParams[0] = params["objectHash"]
    rpcParams[1] = params["encrypt"]
    rpcParams[2] = params["key"]
    rpcParams[3] = params["output"]
  } else if (method == "ObjectPut") {
    rpcParams[0] = params["objectHash"]
    rpcParams[1] = params["copies"]
    rpcParams[2] = params["duration"]
    rpcParams[3] = params["gasprice"]
    rpcParams[4] = params["acl"]
  } else if (method == "ObjectGet") {
    rpcParams[0] = params["objectHash"]
    rpcParams[1] = params["gasprice"]
    rpcParams[2] = params["owner"]
    rpcParams[3] = params["accessDuration"]
    rpcParams[4] = params["accessSignature"]
    rpcParams[5] = params["auth"]
  } else if (method == "ObjectCopy") {
    rpcParams[0] = params["objectHash"]
    rpcParams[1] = params["copies"]
    rpcParams[2] = params["duration"]
    rpcParams[3] = params["gasprice"]
    rpcParams[4] = params["acl"]
    rpcParams[4] = params["auth"]
    rpcParams[4] = params["owner"]
  } else if (method == "ObjectStatus") {
    rpcParams[0] = params["objectHash"]
  } else if (method == "ObjectList") {
  
  } else if (method == "ObjectDelete") {
    rpcParams[0] = params["objectHash"]
  } else if (method == "ObjectRenew") {
    rpcParams[0] = params["objectHash"]
    rpcParams[1] = params["copies"]
    rpcParams[2] = params["duration"]
    rpcParams[3] = params["gasprice"]
    rpcParams[4] = params["acl"]
  } else if (method == "ObjectUpdateAcl") {
    rpcParams[0] = params["objectHash"]
    rpcParams[4] = params["acl"]
  } else if (method == "ObjectAuth") {
    rpcParams[0] = params["objectHash"]
    rpcParams[1] = params["accessor"]
    rpcParams[2] = params["duration"]
  } else if (method == "StorageObject") {
    rpcParams[0] = params["objectHash"]
  } else if (method == "StorageObjects") {
  } else if (method == "StorageSegments") {
  } else if (method == "WalletAddress") {
  } else if (method == "WalletId") {
    rpcMethod = "NetId"
  } else {
    console.log('params2RpcArgs, wrong rpc method=' + method)
  }
  
  return {
      rpcMethod: rpcMethod,
      rpcParams: rpcParams
  };
}
