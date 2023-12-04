

export default function keyth(){
    let keyth = require('keythereum');
    let keyobj = keyth.importFromFile("5e84de7bd940923649a0c07759b819a994d058f1", 'D:\\Personal\\学生科研\\final\\node\\keystore\\UTC--2022-05-22T08-22-09.180330800Z--5e84de7bd940923649a0c07759b819a994d058f1')
    let privateKey = keyobj.recover('123', keyobj);
    console.log(privateKey.toString('hex'));
}
