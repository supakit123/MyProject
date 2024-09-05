import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput, FlatList, Modal, Pressable, Button, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native';
import { images } from '../../constants';
import { httpClient, IP } from '../HTTPClient';
import { FontAwesome, Ionicons, FontAwesome6, Fontisto, AntDesign, Feather} from '@expo/vector-icons';

import {LinearGradient} from 'expo-linear-gradient';
 
const MainPage = ({ navigation }) => {
    const [showSearch, setShowSearch] = useState(false);

    const [user, setUser] = useState({});
    const [isLoading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [honeypotList, setHoneypotList] = useState([]);
    const [honeypots, setHoneypots] = useState([]);

    const [intervalId, setIntervalId] = useState(null);
    const [isRunning, setIsRunning] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            getToken();
            if (isRunning) {
                getLog();
                const id = setInterval(() => {
                    console.log("runing---main");
                    
                    getLog();
                }, 2000);

                setIntervalId(id);
                return () => {
                    if (id) {
                        clearInterval(id);
                    }
                };
            }
            // return () => clearInterval(intervalId);
            }, [isRunning])
    );
    const toggleInterval = () => {
        if (isRunning) {
            clearInterval(intervalId);
            setIsRunning(false);

        } else {
            setIsRunning(true);
        }
    };
    const set_ShowSearch =()=>{
        if (showSearch) {
            setShowSearch(false);
            toggleInterval();
        } else {
            setShowSearch(true);
            toggleInterval();
            setSearch('');
        }
    }
    const getLog = async () => {
        try {
            const response = await httpClient.get(`/honeypot`);
            const data = response.data;
            setHoneypots(data);
            setHoneypotList(data); 
            
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error fetching data', error.message);
        } finally {
            setLoading(false);
        }
    }
    
    const getToken = async () => {
        try {
            const tokenString = await AsyncStorage.getItem('user');
            if (tokenString) {
                const tokenObject = JSON.parse(tokenString);
                if (tokenObject) {
                    setUser(tokenObject);
                } else {
                    console.error('Error parsing token JSON');
                }
            } else {
                console.error('Token not found');
            }
        } catch (error) {
            console.error('Error retrieving the token:', error);
        } 
    };
    const searchFilter = (text) => {
        if (text) {
            const newData = honeypots.filter((item) => {
                const itemName = item.name ? item.name.toUpperCase() : ''.toUpperCase();
                const itemlocal = item.local ? item.local.toUpperCase() : ''.toUpperCase();
                const itemstatus = item.status ? item.status.toUpperCase() : ''.toUpperCase();
                const textData = text.toUpperCase();
                return itemName.indexOf(textData) > -1 || itemlocal.indexOf(textData) > -1 || itemstatus.indexOf(textData) > -1;
            });
            setHoneypotList(newData);
            setSearch(text);
        } else {
            setHoneypotList(honeypots);
            setSearch(text);
        }
    }
    const listHoneypot = ({ item,index }) => {
        let statusText = <Text style={{color: 'black'}}> - </Text>;
        let colorIcon = <FontAwesome6 name="hashnode" size={35} color="black" />

        const currentHoneypot = honeypots.find(val => val.id === item.id);
        if (currentHoneypot) {
            if (currentHoneypot.status == "Active") {
                statusText = <Text style={{color: 'green'}} key={currentHoneypot.port}>{item.status}</Text>;
                colorIcon = <FontAwesome6 name="hashnode" size={35} color="green" />
            } else if (currentHoneypot.status == "InActive") {
                statusText = <Text style={{color: 'red'}} key={currentHoneypot.port}>{item.status}</Text>;
                colorIcon = <FontAwesome6 name="hashnode" size={35} color="red" />
            }
        }
        return (
            <View style={styles.containerHoneypot}>
                <LinearGradient colors={['#1c1e21', '#1c1e21']}start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}  style={styles.gradient}>
                <TouchableOpacity style={styles.bodyHoneypot} onPress={() => {navigation.navigate('PortPage', {h_id: item.id})}}>
                    <View style={{justifyContent:'center', alignItems:'center',flexDirection:'row',marginRight:10}}>
                        {colorIcon}
                    </View>
                    <View style={{flex:1}}>
                        <View style={{flexDirection:'row'}}>
                            <View style={{flex:1}}>
                                <Text style={styles.h1}>Nodename : {item.name}  </Text>
                                <Text style={styles.h2}>IP-Node : {item.local}</Text>
                                <Text style={styles.h2}>description : {item.description}</Text>
                            </View>
                        </View>
                        
                        <View style={{flexDirection:'row', justifyContent:'space-between',flex:1}}>
                            <Text style={styles.h3}>
                                Status: {statusText}
                            </Text>
                            {user.roleID > 2 ?(null) : (
                                <TouchableOpacity style={styles.button} onPress={()=> {navigation.navigate('PermissionPage',{h_id: item.id})}}>
                                    <Feather name="settings" size={24} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
                </LinearGradient>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={images.logo} resizeMode='contain' style={{width: 50, height: 50}} />
                <Text style={styles.title}> HONEYPOT</Text>
                <View style={{flex:1,flexDirection:'row', justifyContent:'flex-end'}}>
                    <TouchableOpacity onPress={()=>{set_ShowSearch()}} style={{backgroundColor:'rgba(255,255,255, 0.19)',padding:10,borderRadius:100}} >
                        {showSearch ?(
                            <AntDesign name="close" size={24} color="#fff" />
                        ) : (
                            <Fontisto name="search" size={24} color="#fff"/>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.infoContainer}>
                {showSearch ? (
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Search..." 
                        placeholderTextColor='#fff'
                        value={search} 
                        onChangeText={(text) => searchFilter(text)} 
                        underlineColorAndroid="transparent"
                        
                    />):(null)
                }
            </View>
            {isLoading ? (
                <View style={{flex:1, justifyContent:'center'}}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ) : (
                honeypots.length === 0 ? (
                    <View style={{flex:1}}>
                      <Image source={images.logo} resizeMode='contain' style={{width: 100, height: 100}}/>
                      <Text style={styles.h2}>Page Empty</Text>
                    </View>
                  ) : (
                    <View style={{flex:1}}>
                        <FlatList
                        data={honeypotList}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={listHoneypot}
                        />
                    </View>
                  )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor:'#000'
    },
    header: {
        padding:10,
        alignItems: 'center',
        backgroundColor: '#1c1e21',
        flexDirection: 'row',
        // borderBottomLeftRadius:20,
        // borderBottomRightRadius:20
    },
    title:{
        color:'tomato',
        fontFamily:'IBMPlexSans-Bold',
        fontSize:20,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 10,
        borderWidth: 1,
        borderColor: '#fff',
    },
    btnColor: {
        color: '#ff6600',
    },
    searchInput: {
        color:'#fff',
        width:"100%",
        backgroundColor: 'rgba(255,255,255, 0.19)',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        // opacity:0.5
    },
    infoContainer: {        
        flexDirection:'row',
        alignItems: 'center',
        padding:10,
    },
    icon: {
        marginRight: 10,
        color: '#fff',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'tomato',
        padding: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    itemStyle: {
        padding: 10,
    },
    containerHoneypot: {
        flex:1,
        padding:10,
    },
    bodyHoneypot: {
        flexDirection:'row',
    },
    gradient:{
        padding:10,
        borderRadius:20,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    itemStyleH: {
        color:'#fff',
        marginBottom:-5,
        fontFamily:'IBMPlexSans-Medium'
    },
    modalView: {
        width:'95%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
        backgroundColor:'rgba(0,0,0,0.5)',
        padding:10
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    h1: {
        fontSize: 18,
        fontFamily:'IBMPlexSans-Bold',
        color: '#fff',
    },
    h2: {
        fontSize: 16,
        fontFamily:'IBMPlexSans-Light',
        color: '#fff',
    },
    h3: {
        fontSize: 16,
        fontFamily:'IBMPlexSans-Medium',
        color: '#fff',
    },
    h4:{
        fontSize: 16,
        fontFamily:'IBMPlexSans-Regular',
        color: '#fff',
    },
    permissStyle:{
        borderWidth:1,
        padding:10,
        borderRadius:10,
        borderColor:'#a9a9a9'
    },
    glowingText:{
        color: 'tomato', // สีของข้อความ
        textShadowColor: 'rgba(255, 128, 0, 0.7)', // สีของเงาที่จะทำให้เกิดเอฟเฟกต์เรืองแสง
        textShadowOffset: { width: 0, height: 0 }, // ตำแหน่งของเงา
        textShadowRadius: 10, // ความกว้างของเงาเพื่อทำให้เกิดเอฟเฟกต์เรืองแสง
    },
});

export default MainPage;
