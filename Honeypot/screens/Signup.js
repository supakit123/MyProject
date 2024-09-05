import React, { useState, useEffect} from 'react';
import { View, Image, Text, TextInput, TouchableOpacity , StyleSheet ,ImageBackground,Alert, ScrollView, Linking} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {  faArrowLeft, faEnvelope, faLock, faPhone, faCamera, faEye} from '@fortawesome/free-solid-svg-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { SelectList } from 'react-native-dropdown-select-list'
import { validateEmail,validatePassword, validatePhone } from './Validation';
import { httpClient } from './HTTPClient';
import { Entypo, Feather } from '@expo/vector-icons';


const Signup = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [description, setDescription] = useState('');
  const [line_token, setLineToken] = useState('');
  const [profile, setProfile] = useState('');
  const [roleID, setRoleID] = useState(null);

  const [secureText, setSecureText] = useState(true);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [lineTokenError, setLineTokenError] = useState('');


  const data = [
    { key: 2, value: 'Admin'},
    { key: 3, value: 'User'},
  ];

  const log = async () => {
    console.log(roleID);
  };
  const handleSecureText = ()=>{
    setSecureText(!secureText)
    console.log(secureText);
  }

  const handlepickImage = async () => {

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
  };

  const handleSignUp = () => {
    const userData = {
      email: email,
      password: password,
      roleID: roleID,
      phone: phone,
      description: description,
      profile: profile,
      line_token: line_token,
    };

    const errors = {};

    if (!validateEmail(email)) {
      errors.emailError = 'อีเมลไม่ถูกต้อง';
    }

    if (!validatePassword(password)) {
      errors.passwordError = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!validatePhone(phone)) {
      errors.phoneError = 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วยเลข 0 และเป็นตัวเลขมีทั้งหมด 10 ตัว';
    }
    if (!roleID){
      errors.roleError = 'กรุณาเลือกบทบาท';
    }
    if (!profile){
      errors.profileError = 'กรุณาเลือกรูปโปรไฟล์';
    }if (!line_token){
      errors.lineTokenError = 'กรุณากรอก Line Token';
    }

    if (Object.keys(errors).length > 0) {
      setEmailError(errors.emailError || '');
      setPasswordError(errors.passwordError || '');
      setPhoneError(errors.phoneError || '');
      setRoleError(errors.roleError || '');
      setProfileError(errors.profileError || '');
      setLineTokenError(errors.lineTokenError || '');
      return;
    }
    setEmailError('');
    setPasswordError('');
    setPhoneError('');
    setRoleError('');
    setProfileError('');
    setLineTokenError('');
  
    httpClient.post(`/create`, userData).then((response) => {
      Alert.alert('Success', 'User created successfully');
      navigation.navigate('Auth')
    })
    .catch((error) => {
      Alert.alert('Error', 'Failed to create user');
      console.error('Error updating user:', error);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
          
          <ScrollView style={[styles.background,styles.shadow]}>
              <TouchableOpacity style={{flexDirection:'row',alignItems:'center',marginBottom:10}} onPress={()=>{navigation.navigate('Auth')}}>
                <FontAwesomeIcon icon={faArrowLeft} size={25} color='#fff' />
                <Text style={[styles.title,{textAlign:'center'}]}>  REGISTRATION</Text>
              </TouchableOpacity>           
              <View style={{alignItems:'center'}}>
                <TouchableOpacity style={styles.profile} onPress={handlepickImage} >
                  {profile && <Image source={{ uri: profile }} style={styles.image} />}
                  <Entypo name="camera" size={24} color="#fff" style={styles.cameraIcon}/>
                  </TouchableOpacity>
                {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
              </View>
              <View style={styles.boxInput}>
                <Text style={styles.subtext}>E-mail</Text>
                <View style={styles.inputContainer}>
                  <FontAwesomeIcon icon={faEnvelope} size={20} color='#fff'/>
                  <TextInput
                    style={styles.input}
                    value={email}
                    placeholderTextColor='gray'
                    placeholder='Enter your email'
                    onChangeText={setEmail}
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>
              <View style={styles.boxInput}>
                <Text style={styles.subtext}>Password</Text>
                <View style={styles.inputContainer}>
                  <FontAwesomeIcon icon={faLock} size={20} color='#fff'/>
                  <TextInput
                    style={styles.input}
                    value={password}
                    placeholderTextColor='gray'
                    placeholder='Enter your Password'
                    onChangeText={setPassword}
                    secureTextEntry={secureText}
                  />
                  <TouchableOpacity onPress={handleSecureText}>
                    <FontAwesomeIcon icon={faEye} size={20} color='#fff'/>
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              <View style={styles.boxInput}>
                <Text style={styles.subtext}>Phone</Text>
                <View style={styles.inputContainer}>
                  <FontAwesomeIcon icon={faPhone} size={20} color='#fff' />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    placeholderTextColor='gray'
                    placeholder='Enter your Phone'
                    onChangeText={setPhone}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              </View>
              <View style={styles.boxInput}>
                <Text style={styles.subtext}>Role </Text>
                {roleError ? <Text style={styles.errorText}>{roleError}</Text> : null}
                <SelectList 
                  setSelected={setRoleID} 
                  data={data} 
                  search={false}
                  defaultOption={{ key: 0 , value:'Select Role'}}
                  boxStyles={styles.selectList}
                  inputStyles={styles.textselect}
                  dropdownTextStyles={styles.textselect}
                  dropdownStyles={styles.selectList}
                  fontFamily='IBMPlexSans-Regular'
                />
              </View>

              <View style={styles.boxInput}>
                <Text style={styles.subtext}>Description</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={description}
                    placeholderTextColor='gray'
                    placeholder='Enter your Description'
                    onChangeText={setDescription}
                  />
                </View>
              </View>

              <View style={styles.boxInput}>
                <View style={{flexDirection:'row', alignItems:'center',justifyContent:'center'}}>
                  <Text style={styles.subtext}>Line Token</Text>
                  {/* <Text style={{color: 'blue'}}>
                    get line token
                  </Text> */}
                  <TouchableOpacity style={{marginLeft:10}} onPress={() => Linking.openURL('https://notify-bot.line.me/th/')}>
                    <Feather name="external-link" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={line_token}
                    placeholderTextColor='gray'
                    placeholder='Enter your Line Token'
                    onChangeText={setLineToken}
                  />
                </View>
                {lineTokenError ? <Text style={styles.errorText}>{lineTokenError}</Text> : null}
              </View>

              <TouchableOpacity style={[styles.button,{marginBottom:30}]} onPress={()=>{handleSignUp()}}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding:20,
    backgroundColor:'#000'
  },
  background: { 
    padding: 20,
    backgroundColor: '#1c1e21',
    borderRadius:20,
    borderWidth:1,
    borderColor:'gray',
  },
  title:{
    color:'tomato',
    fontFamily:'IBMPlexSans-Bold',
    fontSize:20,
    textAlign:'center'
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
  shadow:{
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    color:'#fff',
    fontSize: 16,
    height: 40,
    flex:1,
    marginLeft:10
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
    backgroundColor:'#000'
  },
  selectList: {
    borderRadius: 10,
    backgroundColor:'#000'
  },
  textselect:{
    color: '#fff',
    fontSize: 16,
  },
  subtext: {
    fontSize: 18,
    color: '#fff',
    fontFamily:'IBMPlexSans-Regular',
    
  },
  boxInput: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom:10
  },
  roleSelect:{
    flexDirection:'column',
    alignItems:'center',
    backgroundColor:'#c43c1e',
    padding:10,
    borderRadius:20
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#c43c1e',
    shadowColor: '#c43c1e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  errorText: {
    color: 'red',
    marginBottom: 1,
  },
});


export default Signup;
