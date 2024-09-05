import { View, Text, ImageBackground, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import React, { useCallback, useState } from 'react';
import { images } from '../constants';
import fetchFonts from './other/fonts'; 
import { useFocusEffect } from '@react-navigation/native';

const Welcome = ({ navigation }) => {
  
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchFonts();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchDataWithDelay = async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsLoading(false);
      };
      fetchDataWithDelay();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Image source={images.honeypot} resizeMode="contain" style={styles.honeypot} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground 
        source={images.background}
        style={styles.background}>
        <Image
          source={images.logo}
          resizeMode='contain'
          style={styles.logo}
        />
        <Text style={[styles.title,{borderBottomWidth:1,borderColor:'#fff'}]}>Welcome</Text>
        <View style={{backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', borderRadius:20,padding:10}}>
          <Text style={styles.subtitle}>A Decoy System for the Detection</Text>
          <Text style={styles.subtitle}>Alerts of Cyber Threats using</Text>
          <Text style={styles.subtitle}>a Low Interaction Honeypot.</Text>
        </View>
        <View style={{ marginTop: 72 }}>
          <Pressable style={styles.button} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.text}>Start</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#000'
  },
  logo: {
      width: 200,
      height: 200,
      marginTop: 20,
  },
  loadingText: {
      marginTop: 20,
      color: '#fff',
      fontSize: 16,
  }, 
  background: { 
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  honeypot: {
    width: 300, 
    height: 300,
    marginBottom: 20
  },
  title: {
    fontSize: 50,
    color: '#fff',
    marginBottom: 10,
    fontFamily:'IBMPlexSans-SemiBold'
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
    fontFamily:'IBMPlexSans-Light'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#c43c1e',
    borderRadius:10
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: 'white',
  },
});

export default Welcome;
