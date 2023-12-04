import Storage from "react-native-storage";


export default function store(){
    const storage = new Storage({
        size: 1000,
        storageBackend: window.localStorage,

        defaultExpires: null,

        enableCache: true,
    })

    // this.put = function (key,value){
    //     storage.save({
    //         key: key,
    //         data: value,
    //     })
    // }

    // this.get = function (key){
    //     return storage.load({
    //         key: key
    //     })
    // }

}

