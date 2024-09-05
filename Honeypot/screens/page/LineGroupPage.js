import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Modal, Alert, Linking } from 'react-native'
import React, { useState } from 'react'
import { AntDesign, Entypo, Feather, FontAwesome5, FontAwesome6, Fontisto, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { httpClient } from '../HTTPClient';

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const LineGroupPage = ({navigation, route }) => {
    const { h_id } = route.params;

    const [showSearch, setShowSearch] = useState(false);
    const [isLoading, setLoading] = useState(true);

    const [search, setSearch] = useState('');

    const [listLine, setListLine] = useState([]);

    const [port, setPort] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItem2, setSelectedItem2] = useState(null);
    
    const [lineName, setLineName] = useState('');
    const [image, setImage] = useState('');
    const [profile, setProfile] = useState('');
    const [description, setDescription] = useState('');
    const [token, setToken] = useState('');
    const [l_id, setlineID] = useState('');

    const [checkImage, setCheckImage] = useState(true);
    useFocusEffect(
        React.useCallback(() => {
            dbLine();
            nodeHoneypot()
            const intervalId = setInterval(() => {
                dbLine();
            }, 5000);
            return () => clearInterval(intervalId); // Clear interval on component unmount
        }, [])
    );
    const nodeHoneypot = async () => {
        const id = h_id;
        try {
          const response = await httpClient.get(`/honeypot`, { params: { id } });
          const data = response.data[0];
          setPort(data);
          
        } catch (error) {
          console.error('Error fetching data:', error);
          Alert.alert('Error fetching data', error.message);
        } 
    };
    const dbLine =async ()=>{
        try {
            const response = await httpClient.get(`/line/honeypot`, { params: { h_id } });
            const data = response.data;
            setListLine(data);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error fetching data', error.message);
        } finally {
            setLoading(false);
        }
    }
    const handleDelete = ()=>{
        const id = l_id;
        
        Alert.alert(
            'Confirmation',
            'Are you sure you want to delete Line Groub?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: async () => {
                    try {
                        const response = await httpClient.delete(`/line/delete`, { 
                          params: { id } 
                        });
                        console.log('Groub line deleted successfully:', response.data);
                      } catch (error) {
                        console.error('Error deleting Groub line:', error);
                        Alert.alert('Error deleting Groub line', error.message);
                      }
                },
              },
            ],
            { cancelable: false }
        );
    }
    const handleUpdate = () => {
        const Data = {
          name: lineName,
          image: image,
          profile: profile,
          description: description,
          token: token,
          id: l_id,
        };
        httpClient.put(`/line/update`, Data)
        .then((response) => {
            alert("Update Line Groub Success");
        })
        .catch((error) => {
            console.error('Error updating :', error);
        });
    };
    
    const handlepickImage = async (checkImage) => {    
        if (checkImage) {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                alert("You've refused to allow this app to access your photos!");
                return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                const resizedImage = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 200, height: 200 } }], // ปรับขนาดตามต้องการ
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );
                const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                setProfile(`data:image/jpeg;base64,${base64}`);
            }
        }else {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                alert("You've refused to allow this app to access your photos!");
                return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                const resizedImage = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 200, height: 200 } }], // ปรับขนาดตามต้องการ
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );
                const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                setImage(`data:image/jpeg;base64,${base64}`);
            }
        }
        
    };
    const setDataLine = async (id)=>{
        setlineID(id)
        try {
            const response = await httpClient.get(`/line`, { params: { id } });
            const data = response.data[0];
            
            setLineName(data.name || '');
            setDescription(data.description || '');
            setToken(data.token || '');
            setProfile(data.profile || '');
            setImage(data.image || '');
            
            
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error fetching data', error.message);
        }
    }
    const newLineGroub=async (h_id)=>{
        try {
            const response = await httpClient.post(`/line/newGroub`, { h_id });
            alert("Create Line Groub Success");
        } catch (error) {
            console.error('Error insert data:', error);
            Alert.alert('Error insert data', error.message);
        }finally{
            setLoading(true);
        }
    }
    const showListLine = ({item, index})=>{
        const isModalVisible = selectedItem?.id === item.id;
        const isModalVisible2 = selectedItem2?.id === item.id;
        
        
        return (
            <View style={{flex:1,flexDirection:'row',marginBottom:20,justifyContent:'center'}}>

                <TouchableOpacity style={styles.boxList} onPress={() => setSelectedItem(item)}>
                    {item.profile == ''? (
                        <Fontisto name="line" size={50} color="#00cc22" />
                    ):(
                        <Image source={{uri: item.profile}} resizeMode='contain' style={{borderRadius:25,width: 50, height: 50}}/>
                    )}
                    {item.name == '' ?(
                        <View style={{marginLeft:10,flex:1}}>
                            <Text style={[styles.h3,{color:'#00cc22'}]}> New Groub here!!</Text>
                        </View>
                    ):(
                        <View style={{marginLeft:10,flex:1}}>
                            <Text style={styles.h3}>{item.name}</Text>
                            <Text style={styles.h2}>{item.description}</Text>
                        </View>
                    )}
                    
                    <TouchableOpacity style={{justifyContent:'center'}} onPress={()=>{setSelectedItem2(item);setDataLine(item.id)}} >
                        <MaterialIcons name="edit-note" size={35} color="#fff" />
                    </TouchableOpacity>
                </TouchableOpacity>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        setSelectedItem(null)
                    }}>
                        
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={{flexDirection:'row',justifyContent:'center',marginBottom:10}}>
                                <FontAwesome5 name="grip-lines" size={24} color="gray" />

                                <TouchableOpacity style={[styles.button, styles.buttonClose,{right:-10}]} onPress={() => {setSelectedItem(null)}}>
                                    <Fontisto name="close" size={30} color="red" />
                                </TouchableOpacity>
                            </View>
                            {item.image == '' ? (
                                <View style={{alignItems:'center',marginVertical:10}}>
                                    <MaterialCommunityIcons name="qrcode-remove" size={50} color="#fff" />
                                    <Text style={[styles.h1,{textAlign:'center'}]}>QR empty Please insert for join groub</Text>
                                </View>
                                
                            ):(
                                <View style={{alignItems:'center',marginVertical:10}}>
                                    <Image source={{uri: item.image}} resizeMode='contain' style={{width: 200, height: 200,marginBottom:20}}/>
                                    <MaterialCommunityIcons name="qrcode-scan" size={50} color="#00cc22" />
                                    <Text style={[styles.h1,{marginBottom:10,textAlign:'center'}]}>Scan to join Line Groub</Text>
                                </View>
                            )}
                            
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible2}
                    onRequestClose={() => {
                        setSelectedItem2(null)
                    }}>
                        
                    <View style={[styles.centeredView]}>
                        <View style={[styles.modalView,{height:'80%'}]}>
                            <View style={{flexDirection:'row',justifyContent:'center',marginBottom:10}}>
                                <FontAwesome5 name="grip-lines" size={24} color="gray" />
                                <TouchableOpacity style={[styles.button, styles.buttonClose,{right:-10}]} onPress={() => {setSelectedItem2(null)}}>
                                    <Fontisto name="close" size={30} color="red" />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.h1,{marginBottom:10,textAlign:'center'}]}>Edit groub line</Text>
                            <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
                                <View style={{flex:1,alignItems:'center'}}>
                                    <TouchableOpacity style={[styles.profile]} onPress={()=>{handlepickImage(checkImage)}} >
                                        {profile && <Image source={{ uri: profile }} style={styles.image} />}
                                        <MaterialIcons name="edit" size={24} color="#fff" style={styles.cameraIcon}/>
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex:1,flexDirection:'row',alignItems:'flex-end',marginBottom:10}}>
                                    <TouchableOpacity style={{backgroundColor:'#000',padding:5,borderWidth:1,borderColor:'gray'}} onPress={()=>{handlepickImage(!checkImage)}} >
                                        <MaterialCommunityIcons name="qrcode-plus" size={50} color="#fff" />
                                    </TouchableOpacity>
                                    <View>
                                        {image == '' ?(
                                            <Text style={[styles.h3,{color:'red'}]}> QR Empty (Click to insert)</Text>
                                        ):(
                                            <Text style={styles.h3}> QR-Code Already</Text>
                                        )}
                                    </View>
                                </View>
                                <View >
                                    <Text style={[styles.h3,{marginBottom:5}]}>Name Groub</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={lineName}
                                            placeholderTextColor='gray'
                                            placeholder='Enter your Name Groub'
                                            onChangeText={setLineName}
                                        />
                                    </View>
                                    <Text style={[styles.h3,{marginBottom:5}]}>Description</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={description}
                                            placeholderTextColor='gray'
                                            placeholder='Enter your Description'
                                            onChangeText={setDescription}
                                        />
                                    </View>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={[styles.h3,{marginBottom:5}]}>Token</Text>
                                        <TouchableOpacity style={{marginLeft:10}} onPress={() => Linking.openURL('https://notify-bot.line.me/th/')}>
                                            <Feather name="external-link" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            value={token}
                                            placeholderTextColor='gray'
                                            placeholder='Enter your Token'
                                            onChangeText={setToken}
                                        />
                                    </View>
                                </View>
                                <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:20}}>
                                    <TouchableOpacity onPress={()=>{handleDelete()}} style={{flexDirection:'row',backgroundColor:'#000',padding:5,borderWidth:1,borderColor:'red',justifyContent:'center'}}>
                                        <Text style={[styles.h3,{color:'red'}]}>Delete </Text>
                                        <MaterialCommunityIcons name="delete-empty-outline" size={24} color="red" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=>{handleUpdate()}} style={{flexDirection:'row',backgroundColor:'#000',padding:5,borderWidth:1,borderColor:'#00cc22',justifyContent:'center'}}>
                                        <Text style={[styles.h3,{color:'#00cc22'}]}>Save </Text>
                                        <Feather name="save" size={24} color="#00cc22" />
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>{navigation.navigate('PermissionPage',{h_id:h_id})}}>
                    <Ionicons name="arrow-back-sharp" size={30} color="#fff" />
                </TouchableOpacity>
                <View style={{marginLeft:20}}>
                    <Text style={styles.title}>Node Name: {port.name}</Text>
                    <Text style={styles.title}>Node IP: {port.local}</Text>
                </View>
                <View style={{flex:1,flexDirection:'row', justifyContent:'flex-end'}}>
                    <TouchableOpacity onPress={()=>{setShowSearch(prev => !prev)}} style={{backgroundColor:'rgba(255,255,255, 0.19)',padding:10,borderRadius:100,justifyContent:'center'}} >
                        {showSearch ?(
                            <AntDesign name="close" size={24} color="#fff" />
                        ) : (
                            <Fontisto name="search" size={24} color="#fff"/>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>{newLineGroub(h_id)}}  style={{backgroundColor:'rgba(255,255,255, 0.19)',padding:10,borderRadius:100,justifyContent:'center',marginLeft:10}}>
                        <Entypo name="circle-with-plus" size={24} color="#fff" />
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
                        onChangeText={(text) => setSearch(text)} 
                        underlineColorAndroid="transparent"
                    />):(null)
                }
            </View>
            {isLoading ? (
                <View style={{flex:1,justifyContent:'center'}}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            ):(
                <View style={{flex:1}}>
                    <FlatList
                        data={listLine}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={showListLine}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    infoContainer: {        
        flexDirection:'row',
        alignItems: 'center',
        padding:10,
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
        fontSize:18,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 10,
        borderWidth: 1,
        borderColor: '#fff',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'tomato',
        padding: 5,
        borderRadius: 5,
    },
    input: {
        color:'#fff',
        fontSize: 16,
        height: 40,
        flex:1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingLeft: 20,
        borderColor:'gray',
        borderBottomWidth:1,
        backgroundColor:'#000',
        marginBottom:20
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
    boxList:{
        flexDirection:'row',
        backgroundColor:'#1c1e21',
        padding:20,
        borderRadius:20,
        borderWidth:1,
        borderColor:'gray',
        width:'90%',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor:'rgba(0,0,0,0.2)'
    },
    modalView: {
        width:'80%',
        height:'50%',
        backgroundColor: '#1c1e21',
        borderRadius: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop:10,
        borderColor:'gray',
        borderWidth:1
    },
    buttonClose: {
        backgroundColor: '#1c1e21',
        position:'absolute',
        alignItems:'center',
        
    },
    profile:{
        alignItems:'center',
        justifyContent:'center',
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'gray',
        width: 100,
        height: 100,
        position: 'relative', 
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#000',
    },
    cameraIcon: {
        position: 'absolute',
        right: -5,
        bottom: -9, 
        backgroundColor:'gray',
        padding:5,
        borderRadius:100
    },
});

export default LineGroupPage