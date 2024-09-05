import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Alert, ScrollView, ImageBackground } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from '../HTTPClient';
import { Entypo, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { images } from '../../constants';

const ListUser = ({ navigation }) => {
    const [user, setUser] = useState({});

    const [userList, setUserList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 7;

    useFocusEffect(
        React.useCallback(() => {
          getToken();
          getUserList();
        }, [])
    );
    
    const getUserList = ()=> {
        httpClient.get(`/user`)
        .then((response) => {
            const filteredUsers = response.data.filter(user => user.id !== 1);
            setUserList(filteredUsers);
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
            Alert.alert('Error fetching users');
        });
    }

    const getToken = async () => {
        try {
          const tokenString = await AsyncStorage.getItem('user');
          if (tokenString) {
            const tokenObject = JSON.parse(tokenString);
            if (tokenObject) {
              // console.log('Retrieved token:', tokenObject);
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

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = userList.slice(indexOfFirstUser, indexOfLastUser);
    const nextPage = () => {
        if (currentPage < Math.ceil(userList.length / usersPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={images.logo} resizeMode='contain' style={{width: 50, height: 50}} />
                <Text style={styles.title}> HONEYPOT</Text>
                <View style={styles.infoContainer}>
                    <TouchableOpacity onPress={() => {navigation.navigate('Signup')}} style={styles.button}>
                        <Text style={styles.buttonText}>Registration  </Text>
                        <FontAwesomeIcon icon={faUserPlus} size={20} style={styles.icon} />
                    </TouchableOpacity>
                </View>  
            </View>
            <ScrollView style={styles.body}>
                {currentUsers.map((val) => {
                    if (user.roleID == 1 || (user.roleID == 2 && val.roleID > 2)){
                        if (val.id !== user.id) {
                            return (
                                <TouchableOpacity key={val.id} style={styles.boxList} onPress={() => navigation.navigate('UEdit', {id: val.id})}>
                                    <Image source={{ uri: val.profile }} style={styles.listProfile} />
                                    <View style={{marginLeft:10}}>
                                        <Text style={styles.h3}>{val.email}</Text>
                                        {val.roleID == 2 && 
                                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                                <FontAwesome5 name="users" size={16} color="tomato" />
                                                <Text style={styles.h2}> Admin </Text>
                                                <FontAwesome name="phone" size={16} color="tomato" />
                                                <Text style={styles.h2}> {val.phone}</Text>
                                            </View>
                                        }
                                        {val.roleID == 3 && 
                                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                                <FontAwesome name="user" size={16} color="tomato" />
                                                <Text style={styles.h2}> User </Text>
                                                <FontAwesome name="phone" size={16} color="tomato" />
                                                <Text style={styles.h2}> {val.phone}</Text>
                                            </View>
                                        }
                                    </View>
                                    <View style={{flex:1,justifyContent:'flex-end',flexDirection:'row'}}>
                                        <Entypo name="dots-three-vertical" size={24} color="#fff"/>
                                    </View>
                                </TouchableOpacity>
                            )
                        }
                    }
                })}
            </ScrollView>
            <View style={styles.pagination}>
                <TouchableOpacity onPress={prevPage} disabled={currentPage === 1} style={styles.pageButton}>
                    <Text style={styles.pageButtonText}>Previous</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>{currentPage}</Text>
                <TouchableOpacity onPress={nextPage} disabled={currentPage === Math.ceil(userList.length / usersPerPage)} style={styles.pageButton}>
                    <Text style={styles.pageButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    header: {
        paddingLeft:10,
        paddingRight:10,
        alignItems: 'center',
        backgroundColor: '#1c1e21',
        flexDirection: 'row',
        justifyContent:'space-between',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 10,
        borderWidth: 1,
        borderColor: '#fff',
    },
    body: {
        padding: 10,
        marginBottom:10,
    },
    boxList: {
        flex:1,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: 'row',
        
        backgroundColor:'#1c1e21',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    listProfile: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    title:{
        color:'tomato',
        fontFamily:'IBMPlexSans-Bold',
        fontSize:20,
    },
    h1: {
        fontSize: 18,
        fontFamily:'IBMPlexSans-Bold',
        color:'#fff',

    },
    h2: {
        fontSize: 16,
        fontFamily:'IBMPlexSans-Light',
        color:'#fff',
    },
    h3: {
        fontSize: 16,
        fontFamily:'IBMPlexSans-Medium',
        color:'#fff',
    },
    h4:{
        fontSize: 16,
        fontFamily:'IBMPlexSans-Regular',
        color:'#fff',
    },
    nav: {
        backgroundColor: '#1c1e21',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth:1
    },
    navItem: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    btnColor:{
        color:'#ff6600',
    },
    infoContainer: {
        flex:1,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'flex-end'
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
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily:'IBMPlexSans-SemiBold'
    },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#1c1e21',
    },
    pageButton: {
        padding: 10,
        backgroundColor: 'tomato',
        borderRadius: 5,
    },
    pageButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    pageInfo: {
        color: '#fff',
        fontSize: 16,
    }
});

export default ListUser;
