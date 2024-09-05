import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ImageBackground, Button, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPhone, faEnvelope, faScroll, faPencil, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Account = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      getToken();
    }, [])
  );

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
  
  const logOut = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to Log Out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={{uri: user.profile}} resizeMode='cover' style={styles.image} />
      <View style={styles.body}>
        <View style={{paddingRight:30,paddingLeft:120,paddingBottom:10}}>
          <TouchableOpacity style={styles.button} onPress={() => {navigation.navigate('MEdit')}}>
            <FontAwesomeIcon icon={faPencil} style={styles.icon} />
            <Text style={styles.buttonText}>Edit profile information</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{paddingLeft:10,paddingRight:10}}>
          <View style={styles.info}>
            <Text style={[styles.infoText, styles.h1]}>E-mail :</Text>
            <View style={styles.infoContainer}>
                <FontAwesomeIcon icon={faEnvelope} style={styles.icon} size={20} />
                <Text style={styles.h2}>{user.email}</Text>
            </View>
          </View>

          {user.phone && (
            <View style={styles.info}>
              <Text style={[styles.infoText, styles.h1]}>Phone :</Text>
              <View style={styles.infoContainer}>
                <FontAwesomeIcon icon={faPhone} style={styles.icon} size={20} />
                <Text style={[styles.infoText, styles.h2]}>{user.phone}</Text>
              </View>
            </View>
            
          )}
          {user.line_token && (
            <View style={styles.info}>
              <Text style={[styles.infoText, styles.h1]}>Line token :</Text>
              <View style={styles.infoContainer}>
                <FontAwesomeIcon icon={faCommentDots} style={styles.icon} size={20} />
                <Text style={[styles.infoText, styles.h2]}>{user.line_token}</Text>
              </View>
            </View>
          )}
          {user.description && (
            <View style={styles.info}>
              <Text style={[styles.infoText, styles.h1]}>Description :</Text>
              <View style={styles.infoContainer}>
                <FontAwesomeIcon icon={faScroll} style={[styles.icon, {marginBottom:10}]} />
                <Text style={[styles.infoText,styles.h2]}>{user.description}</Text>
              </View>
            </View>
          )}
          <TouchableOpacity style={[styles.button,{backgroundColor:'#5555'}]} onPress={()=>{logOut()}}>
            <Text style={[styles.buttonText,{color:'red'}]}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: user.profile }} style={styles.profileImage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'absolute',
    top: 90,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 10,
  },
  image: {
    height: 150,
    
  },
  body: {
    flex: 1,
    backgroundColor: '#000',
    // padding: 10,
    paddingTop: 8,
  },
  h1: {
    fontSize: 22,
    fontFamily:'IBMPlexSans-Medium',
    color: '#fff',
  },
  h2: {
    flex:1,
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    fontFamily:'IBMPlexSans-Thin',
  },
  infoContainer: {
    
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderBottomColor:'#555',
  },
  info:{
    marginBottom: 25,
  },
  icon: {
    marginRight: 10,
    color: '#fff',
  },
  infoText: {
    fontSize: 18,
    color: '#fff',
  },
  button: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily:'IBMPlexSans-SemiBold'
  },
});

export default Account;
