import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TextInput, TouchableOpacity, ActivityIndicator, Platform, Button, LogBox, Image, Switch } from 'react-native';
import { httpClient } from '../HTTPClient';
import { Ionicons, AntDesign, Entypo, Fontisto } from '@expo/vector-icons';
import { images } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PortPage = ({ navigation, route }) => {
  const [data, setData] = useState([
    { id: 1, title: 'FTP', port:"21" },
    { id: 2, title: 'SSH', port:"22" },
    { id: 3, title: 'Telnet', port:"23" },
    { id: 4, title: 'SMTP', port:"25" },
    { id: 5, title: 'DNS', port:"53" },
    { id: 6, title: 'DHCP', port:"67" },
    { id: 7, title: 'HTTP', port:"80" },
    { id: 8, title: 'POP3', port:"110" },
    { id: 9, title: 'NetBIOS', port:"137" },
    { id: 10, title: 'IMAP4', port:"143" },
    { id: 11, title: 'HTTPS', port:"443" },
    { id: 12, title: 'Microsoft-DS', port:"445" },
    { id: 13, title: 'FTP', port:"20" },
    { id: 14, title: 'DHCP', port:"68" },
  ]);

  const { h_id } = route.params;

  const [showSearch, setShowSearch] = useState(false);

  const [search, setSearch] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [ports, setPorts] = useState([]);
  const [PortList, setPortList] = useState([]);

  const [isEnabled, setIsEnabled] = useState(false);

  const [honeypot, setHoneypot] = useState([]);
  
  const [intervalId, setIntervalId] = useState(null);
  const [isRunning, setIsRunning] = useState(true);
  const [user, setUser] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      getToken()
      if (isRunning) {
        getLog();
        honeypotNode();
        const id = setInterval(() => {
          console.log("runing---port");
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
    const id = h_id;
    try {
      const response = await httpClient.get(`/port`, { params: { id } });
      const data = response.data;
      setPorts(data);
      setPortList(data);
      // console.log(data);
      
      
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error fetching data', error.message);
    } finally {
      setLoading(false);
    }
  };
  const honeypotNode = async () => {
    const id = h_id;
    try {
      const response = await httpClient.get(`/honeypot`, { params: { id } });
      const data = response.data[0];
      setHoneypot(data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error fetching data', error.message);
    } 
  };
  
  const searchFilter = (text) => {
    if (text) {
      const newData = ports.filter((item) => {
        const itemport = item.port ? item.port.toUpperCase() : '';
        const itemservice_name = item.service_name ? item.service_name.toUpperCase() : '';
        const textData = text.toUpperCase();
        return itemport.indexOf(textData) > -1 || itemservice_name.indexOf(textData) > -1;
      });
      setPortList(newData);
      setSearch(text);
    } else {
      setPortList(data);
      setSearch(text);
    }
  };

  const PortLists = ({ item }) => {
    let statusSwitch;
    let port;
    const toggleSwitch = (value) => {
      setIsEnabled(value);
      if (value) {
        httpClient.put(`/update/status`,{
            port: port,
            status: 1
        }).then(()=>{
          console.log("Success");
        }).catch(error => {
          console.error('Error updating port status:', error);
        });
        
      }else{
        httpClient.put(`/update/status`,{
            port: port,
            status: 2
        }).then(()=>{
          console.log("Success");
          
        }).catch(error => {
          console.error('Error updating port status:', error);
        });
      }
    }
    let statusText = <Ionicons name="remove-outline" size={24} color="gray" />;
    
    let colordot = <Entypo name="dot-single" size={24} color="black" />;
    ports.forEach((val) => {
      
      if (val.port == item.port) {
        if (val.status == 1) {
          colordot = <Entypo name="dot-single" size={24} color="green" />;
          statusText = <Text style={[styles.h2,{color: 'green'}]} key={val.port}>RUNING </Text>;

          statusSwitch =<Switch
            trackColor={{false: 'red', true: 'green'}}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={true}
          />
          port = val.port
        } else if (val.status == 2) {
          colordot = <Entypo name="dot-single" size={24} color="red" />;
          statusText = <Text style={[styles.h2,{color: 'red'}]} key={val.port}>STOP</Text>;

          statusSwitch = <Switch
            trackColor={{false: 'red', true: 'green'}}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={false}
          />
          port = val.port
        }
      }
    });
    
    let portTitle = <Text style={[styles.h2,{color: '#fff'}]}>{item.service_name}</Text>;

    if (item.service_name == '') {
      const currentPort = data.find(val => val.port === item.port);
      if (currentPort) {
        portTitle = <Text style={[styles.h2,{color: '#fff'}]}>{currentPort.title}</Text>;
      }else{
        portTitle = <Text style={[styles.h2,{color: '#fff'}]}>No Name</Text>;
      }
    }
    
    
  
    return (
      <View style={styles.containerlist}>
        <TouchableOpacity style={styles.body} onPress={() => {navigation.navigate('LogPage', { h_id: h_id, port: item.port })}}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.h3}>Port Number: {item.port} </Text>
              <View style={{flexDirection:'row'}}>
                {colordot}
                <Text style={styles.h4}>Service: {portTitle}</Text>
              </View>
            </View>
              {user.roleID >= 2 ?(null):(statusSwitch)}
            <View style={{width:'30%',justifyContent:'space-between', flexDirection: 'row',alignItems:'center' }}>
              {statusText}
              <AntDesign name="caretright" size={24} color="black" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.navigate('Auth')}>
          <Ionicons name="arrow-back-circle" size={50} color="#fff" />
        </TouchableOpacity>
        <View style={{marginLeft:20}}>
          <Text style={styles.title}>Node name: {honeypot.name}</Text>
          <Text style={styles.h2}>Node IP: {honeypot.local}</Text>
        </View>
      
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
          />):(null)}
      </View>
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          ports.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Image source={images.logo} resizeMode='contain' style={{width: 100, height: 100}}/>
              <Text style={styles.h2}>Page Empty</Text>
            </View>
          ) : (
            <FlatList
              data={PortList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={PortLists}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  containerlist: {
    flex: 1,
    padding: 10,
  },
  back:{
    color:'#fff'
  },
  search: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: '#1c1e21',
    alignItems: 'center',
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
  body: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1c1e21',
    borderRadius: 20,
    flexDirection: 'row',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'tomato',
    padding: 5,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontFamily:'IBMPlexSans-Bold',
    color: 'tomato',
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
  dateText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PortPage;
