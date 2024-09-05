import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import join from 'url-join'

//192.168.255.132:3001
//192.168.124.160:3002
// 192.168.23.132:3001

//192.168.255.124:3002
// 192.168.255.85:3002
// 192.168.255.34:3002   34
//192.168.43.16:3002
var isAbsoluteURLRegex = /^(?:\w+:)\/\//;

axios.interceptors.request.use(async(config)=>{
    if(!isAbsoluteURLRegex.test(config.url)){
        const jwtToken = await AsyncStorage.getItem("token") 
               
        if(jwtToken != null){
            config.headers={'x-access-token' : jwtToken}
        }
        config.url = join('http://192.168.148.132:3001',config.url);
    }
    return config;
});

export const httpClient = axios