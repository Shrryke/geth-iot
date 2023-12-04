
export default function dpos(){

    const http= require("http")
    const options={
        host:'127.0.0.1',
        port:'8545',
        method: 'POST',
        headers:{
            'Content-Type':'application/json',
            'Accept':'application/json'
        }
    }

    const request=async function (postData,cb){
        var postData = JSON.stringify(postData)
        var req = await http.request(options, function(res) {
            res.setEncoding('utf8');
            var str = "";
            res.on('data', function (chunk) {
                str+=chunk;
            });
            res.on('end', function () {
                cb(null,str);
            });
        });
        req.on('error', function(e) {
            cb(e.message);
        });
        req.write(postData);
        req.end();
    }



    this.getValidators=async function (cb) {
        const data = {
            "jsonrpc": "2.0",
            "method": "dpos_getValidators",
            "params": [],
            "id": 67
        }
        await request(data, async function (err, res) {
            if (err) {
                console.log(err);
            }
            console.log(res)
            cb(res)
        })
    }

    this.stop=function (){

    }
}