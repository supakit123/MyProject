import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TextInput, TouchableOpacity, ActivityIndicator, Platform, Button, Image, Modal, Pressable, ScrollView } from 'react-native';
import { httpClient } from '../HTTPClient';
import axios from 'axios';
import { Ionicons, Entypo, Fontisto, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { validateDate } from '../Validation';
import { images } from '../../constants';


const ITEMS_PER_PAGE = 5;

const LogPage = ({ navigation, route }) => {
  const { h_id, port } = route.params;

  const [search, setSearch] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [logList, setLogList] = useState([]);
  const [logs, setLogs] = useState([]);

  const [honeypot, setHoneypot] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const [datePicker, setDatePicker] = useState(false);
  const [show_DatePicker, set_ShowDatePicker] = useState(false);

  const [fromYear, setFromYear] = useState('');
  const [fromMonth, setFromMonth] = useState('');
  const [fromDay, setFromDay] = useState('');
  const [toYear, setToYear] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [toDay, setToDay] = useState(''); 

  let fromDate ;
  let toDate ;
  
  const [fromError, setFromError] = useState('');
  const [toError, setToError] = useState('');

  const [intervalId, setIntervalId] = useState(null);
  const [isRunning, setIsRunning] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = logList.slice(startIndex, endIndex);

   useFocusEffect(
    React.useCallback(() => {
      if (isRunning) {
        getLog();
        honeypotNode();
        const id = setInterval(() => {
          // console.log("runing---log");
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
    if(!show_DatePicker){
      if (showSearch) {
        setShowSearch(false);
        toggleInterval();
      } else {
        setShowSearch(true);
        toggleInterval();
        setSearch('')
      }
    }else{
      Alert.alert("Cannot Search","Please Cancel Search Date..")
    }
  }
  const set_DatePicker =()=>{
    if(!showSearch){
      if (show_DatePicker) {
        toggleInterval();
        set_ShowDatePicker(false);
        setDatePicker(false);

      } else {
        toggleInterval();
        set_ShowDatePicker(true);
        setDatePicker(true);
        clearDate();
      }
    }else{
      Alert.alert("Cannot Search Time Period","Please Cancel Search..")
    }
  }
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
  const filterNumericInput = (text) => text.replace(/[^0-9]/g, '');
  const checkDates = () => {
    const fromError = validateDate(fromYear, fromMonth, fromDay);
    const toError = validateDate(toYear, toMonth, toDay);

    setFromError(fromError);
    setToError(toError);

    if (!fromError && !toError) {
      fromDate = `${fromYear.padStart(4, '0')}-${fromMonth.padStart(2, '0')}-${fromDay.padStart(2, '0')}`;
      toDate = `${toYear.padStart(4, '0')}-${toMonth.padStart(2, '0')}-${toDay.padStart(2, '0')}`;
      
      search_date(fromDate, toDate)
      console.log("Valid dates:", fromDate, toDate);
    } else {
      console.log("Invalid dates:", fromError, toError);
    }
  };

  const clearDate =()=>{
    setFromYear(null);
    setFromMonth(null);
    setFromDay(null);
    setToYear(null);
    setToMonth(null);
    setToDay(null);

    setFromError(null);
    setToError(null);
  }

  const getLog = async () => {
    try {
      const response = await httpClient.get(`/logs`, { params: { h_id } });
      // console.log(response.data);
      const filteredData = response.data.filter(val => val.port == port);

      if (filteredData.length > 0) {
        setLogList(filteredData);
        setLogs(filteredData);
      }
      
      // getHoneypot();
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error fetching data', error.message);
    } finally {
      setLoading(false);
    }
  };

  const search_date = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    if (start && end) {
      const newData = logs.filter((item) => {
        const itemDate = new Date(item.date); // แปลงวันที่ใน logs เป็น Date object
        return itemDate >= start && itemDate <= end; // ตรวจสอบว่าอยู่ในช่วงวันที่หรือไม่
      });
      setLogList(newData); // อัพเดท log list
    } else {
      setLogList(logs); // ถ้าไม่มีวันที่กำหนดมา ให้แสดง logs ทั้งหมด
    }
  };

  const searchFilter = (text) => {
    if (text) {
      const newData = logs.filter((item) => {
        const itemName = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const itemDate = item.date ? item.date.toUpperCase() : ''.toUpperCase();
        const itemIP = item.ip_address ? item.ip_address.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemName.indexOf(textData) > -1 || itemDate.indexOf(textData) > -1 || itemIP.indexOf(textData) > -1;
      });
      setLogList(newData);
      setSearch(text);
    } else {
      setLogList(logs);
      setSearch(text);
    }
  };

  const deleteLog = (id) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this log?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            httpClient.delete(`/delete/log`, { params: { id } })
            .catch((error) => {
              console.error('Error deleting Log:', error);
              Alert.alert('Error', 'Failed to delete Log');
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const clearLog = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete all logs?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            httpClient.delete(`/delete/log`,{ params: { h_id } }).then(()=>{
              currentData = logList.slice(startIndex, endIndex);
            })
            .catch((error) => {
                console.error('Error deleting logs:', error);
                Alert.alert('Error deleting logs', error.message);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * ITEMS_PER_PAGE < logList.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  const logLists = ({ item }) => {
    return (
      <View style={styles.containerlist}>
        <View style={styles.body} onPress={()=>{console.log(item.id)}}>
          <View style={{ flex: 1 }}>
            <Text style={styles.h1}>Service: {item.name}</Text>
            <Text style={styles.h2}>message: {item.message}</Text>
            <Text style={styles.h2}>date: {item.date}</Text>
            <Text style={[styles.h3,{color:'yellow'}]}>Address Detect: {item.ip_address}</Text>
          </View>
          <View style={{alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => deleteLog(item.id)} style={{}}>
              <Entypo name="trash" size={24} color="red" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TouchableOpacity onPress={() => {navigation.navigate('PortPage', {h_id: h_id})}}>
          <Ionicons name="arrow-back-circle" size={50} color="#fff" />
        </TouchableOpacity>
        <View style={{flex:1,marginLeft:10}}>
          <Text style={styles.title}>Node name: {honeypot.name}</Text>
          <Text style={styles.h2}>Node IP: {honeypot.local} Service: {port}</Text>
        </View>

        {currentPage < 1 ? (
          <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
            <TouchableOpacity onPress={()=>{set_ShowSearch()}} style={{backgroundColor:'rgba(255,255,255, 0.19)',padding:10,borderRadius:100}} >
              {showSearch ?(
                <AntDesign name="close" size={24} color="#fff" />
              ) : (
                <Fontisto name="search" size={24} color="#fff"/>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:'rgba(255,255,255, 0.19)',padding:10,borderRadius:100,marginLeft:10}} onPress={() => {set_DatePicker()}}>
              
              {show_DatePicker ?(
                <AntDesign name="close" size={24} color="#fff" />
              ) : (
                <Fontisto name="date" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ):(null)}
        <Modal 
          animationType="slide"
          transparent={true}
          visible={datePicker}
          onRequestClose={() => {
          }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={{flexDirection:'row',justifyContent:'center',marginBottom:10}}>
                  <FontAwesome5 name="grip-lines" size={24} color="gray" />

                  <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => {setDatePicker(false)}}>
                    <Fontisto name="close" size={30} color="red" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.h1}>Choose a time period.</Text>
                <ScrollView  showsVerticalScrollIndicator={false}>
                  <View style={{ flex:1}}>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                      <View style={styles.searchModal}>
                        <TextInput
                          style={styles.modalSearch}
                          placeholder="Year"
                          placeholderTextColor='#fff'
                          value={fromYear}
                          onChangeText={(text) => setFromYear(filterNumericInput(text))}
                          keyboardType="numeric"
                        />
                        <MaterialCommunityIcons name="slash-forward" size={24} color="#fff" />
                        <TextInput
                          style={styles.modalSearch}
                          placeholder="Month"
                          placeholderTextColor='#fff'
                          value={fromMonth}
                          onChangeText={(text) => setFromMonth(filterNumericInput(text))}
                          keyboardType="numeric"
                        />
                        <MaterialCommunityIcons name="slash-forward" size={24} color="#fff" />
                        <TextInput
                          style={styles.modalSearch}
                          placeholder="Day"
                          placeholderTextColor='#fff'
                          value={fromDay}
                          onChangeText={(text) => setFromDay(filterNumericInput(text))}
                          keyboardType="numeric"
                        />
                      </View>
                      {fromError ? <Text style={styles.errorText}>{fromError}</Text> : null}
                      <Text style={[styles.h1, { marginBottom: 10 }]}>To</Text>
                      <View style={styles.searchModal}>
                        <TextInput
                          style={styles.modalSearch}
                          placeholder="Year"
                          placeholderTextColor='#fff'
                          value={toYear}
                          onChangeText={(text) => setToYear(filterNumericInput(text))}
                          keyboardType="numeric"
                        />
                        <MaterialCommunityIcons name="slash-forward" size={24} color="#fff" />
                        <TextInput
                          style={styles.modalSearch}
                          placeholder="Month"
                          placeholderTextColor='#fff'
                          value={toMonth}
                          onChangeText={(text) => setToMonth(filterNumericInput(text))}
                          keyboardType="numeric"
                        />
                        <MaterialCommunityIcons name="slash-forward" size={24} color="#fff" />
                        <TextInput
                          style={styles.modalSearch}
                          placeholder="Day"
                          placeholderTextColor='#fff'
                          value={toDay}
                          onChangeText={(text) => setToDay(filterNumericInput(text))}
                          keyboardType="numeric"
                        />
                      </View>
                      {toError ? <Text style={styles.errorText}>{toError}</Text> : null}
                    </View>
                    <View style={{flex:1,flexDirection:'row',justifyContent:'space-between'}}>
                      <TouchableOpacity style={styles.button} onPress={()=>{clearDate()}}>
                        <Text style={styles.h3}> Clear Date</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.button} onPress={()=>{checkDates()}}>
                        <Text style={styles.h3}> search</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
        </Modal>
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
        <TouchableOpacity onPress={()=>{clearLog()}} style={styles.button}>
          <MaterialCommunityIcons name="notification-clear-all" size={24} color="#fff" />
          <Text style={{color:'#fff'}}> clearLog</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          logs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Image source={images.logo} resizeMode='contain' style={{width: 100, height: 100}}/>
              <Text style={styles.h2}>Page Empty</Text>
            </View>
          ) : (
            <FlatList
              data={currentData}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              ListEmptyComponent={<Text>No logs available</Text>}
              renderItem={logLists}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          )
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          color='tomato'
          title="Previous"
          onPress={handlePreviousPage}
          disabled={currentPage === 0}
        />
        <Text style={styles.h1}>Page {currentPage + 1}</Text>
        <Button
          color='tomato'
          title="Next"
          onPress={handleNextPage}
          disabled={(currentPage + 1) * ITEMS_PER_PAGE >= logList.length}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    backgroundColor: '#1c1e21',
    padding:10
  },
  //modal
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
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop:10,
    alignItems:'center',
    borderColor:'gray',
    borderWidth:1
  },
  buttonClose: {
    backgroundColor: '#1c1e21',
    position:'absolute',
    alignItems:'center',
    right:-130
  },
  modalSearch:{
    color:'#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    borderBottomWidth:1,
    borderBottomColor:'#fff'
  },
  searchModal:{
    flexDirection:'row',
    alignItems:'center',
    marginBottom:10,
    // backgroundColor:'rgba(255,255,255, 0.19)',

  },
  errorText:{
    color: 'red',
    fontSize: 14,
    marginVertical: 10,
    fontFamily:'IBMPlexSans-Regular'
  },

  //View
  dateTimePicker: {
    width: 320, // ความกว้างของ DateTimePicker
    height: 260, // ความสูงของ DateTimePicker
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  containerlist: {
    flex: 1,
    padding: 10,
  },
  search: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:'#1c1e21'
  },
  searchInput: {
    flex:1,
    color:'#fff',
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

export default LogPage;
