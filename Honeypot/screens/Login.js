import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Button,TextInput, Text, Image, Alert, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, PanResponder, Animated } from 'react-native';
import { images } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateEmail, validatePassword } from './Validation';
import { useFocusEffect } from '@react-navigation/native';
import { httpClient } from './HTTPClient';
import CaptchaSlider from './other/CaptchaSlider'; // Assuming CaptchaSlider is in the same directory
import { EvilIcons } from '@expo/vector-icons';
// import { TextInput  } from "@react-native-material/core";

const Login = ({ navigation }) => {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerification = (verified) => {
    setIsVerified(verified);
    console.log('Verification status:', verified);
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [captchaError, setcaptchaError] = useState('');

  
  const handleLogin = useCallback(async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    } else {
      setEmailError('');
    }

    if (!validatePassword(password)) {
      setPasswordError('Please enter a valid password');
      return;
    } else {
      setPasswordError('');
    }
    if (!isVerified) {
      setcaptchaError('Slide to finish');
      
      return;
    } else {
      setcaptchaError('');
    }

    httpClient.post('/login', { email, password }).then(async response => {
      const result = response.data;      
      if (result.token) {
        await AsyncStorage.setItem("token", result.token);
        // You can also store user information if needed
        await AsyncStorage.setItem("user", JSON.stringify(result.user));

        navigation.navigate('Auth');
        setIsLoading(false);
      } else {
        Alert.alert("Login Failed", result.message || "Invalid credentials");
        setIsLoading(false);
      }
    })
    .catch(error => {
      console.log(error);
      Alert.alert("Login Failed", "An error occurred while trying to login");
      setIsLoading(false);
    });

  }, [email, password, navigation, isVerified]);

  const tokenLogin = useCallback(async () => {
    try {
      const tokenString = await AsyncStorage.getItem('token');
      if (!tokenString) {
        console.log('Token not found');
        return;
      }else{
        navigation.navigate('LoadingPage');
      }
    } catch (error) {
      console.error('Error retrieving the token:', error);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      tokenLogin();
    }, [tokenLogin])
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={images.background}
        style={styles.container}>
        <View style={styles.body}>
          <Image source={images.logo2} resizeMode='contain' style={styles.logo} />
        </View>
        <ScrollView style={styles.background}>
          <View style={{flexDirection:'column'}}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Sign in to continue.</Text>
          </View>
          <View style={{flexDirection:'column'}}>
            <View style={styles.boxInput}>
              <Text style={styles.subtext}>E-mail</Text>
              <View style={styles.inputContainer}>
                <FontAwesomeIcon icon={faEnvelope} size={25}/>
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
            <View style={styles.boxInput}>
              <Text style={styles.subtext}>Password</Text>
              <View style={styles.inputContainer}>
                <FontAwesomeIcon icon={faLock} size={25}/>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>
          </View>
          <View style={styles.boxCaptcha}>
            {!isVerified ? <CaptchaSlider onVerified={handleVerification}/> :
            <View style={styles.containerbee}>
              <Image source={{ uri: 'https://www.proag.com/wp-content/uploads/2019/09/Honey-bee-2-5-300x150.jpg' }} 
                style={styles.image} />
              <View style={styles.overlay} />
              <EvilIcons name="check" size={100} color="green" style={styles.icon} />
              <Text style={styles.textCaptcha}>SUCCESS</Text>
            </View> }
            {captchaError ? <Text style={styles.errorText}>{captchaError}</Text> : null}
          </View>
          {/* disabled={isLoading} */}
          <TouchableOpacity style={styles.button} onPress={handleLogin} >
            {!isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  boxCaptcha:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerbee:{
    width: 300,
    height: 150,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  icon: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    transform: [{ translateX: -20 }, { translateY: -50 }], // เลื่อนตำแหน่งให้ไอคอนอยู่กึ่งกลาง
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // สีทึบพร้อมค่า opacity
    borderRadius: 10,
  },
  textCaptcha:{
    color:'green',
    position: 'absolute',
    top: '50%',
    left: '40%',
    transform: [{ translateX: -40 }, { translateY: 10 }],
    fontSize: 30,
    fontFamily:'IBMPlexSans-SemiBold'
  },
  container: {
    flex: 1,
  },
  body: {
    paddingTop: 30,
    paddingBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 170,
    height: 170,
    backgroundColor: '#fff',
    borderRadius: 25,
  },
  background: { 
    backgroundColor: '#fff',
    padding: 30,
    borderTopRightRadius: 100,
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
    color: '#000',
    fontFamily:'IBMPlexSans-Bold'

  },
  subtitle: {
    fontSize: 25,
    textAlign: 'center',
    color: '#000',
    fontFamily:'IBMPlexSans-Medium'
  },
  subtext: {
    fontSize: 18,
    color: '#000',
    fontFamily:'IBMPlexSans-SemiBold'
  },
  boxInput: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    fontSize: 22,
    height: 40,
    paddingLeft: 8,
    borderRadius: 10,
    flex:1,
    fontFamily:'IBMPlexSans-Regular',
    // opacity: 0.54444
  },
  inputCaptcha:{
    fontSize: 22,
    backgroundColor: '#fff',
    borderWidth:1,
    flex:1,
    marginRight:10,
    borderRadius:10,
    padding:10
  },
  btncaptcha:{
    backgroundColor:'tomato',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    padding:10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cdcbcb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingLeft: 20,
  },
  button: {
    marginTop:10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: 'tomato',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 1,
  },
  
});

export default Login;
