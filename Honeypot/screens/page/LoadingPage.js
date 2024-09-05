import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { images } from '../../constants'; // Ensure this import path is correct
import fetchFonts from '../other/fonts';

const LoadingPage = ({ navigation }) => {
    
    useFocusEffect(
        React.useCallback(() => {
            fetchFonts();
            const fetchDataWithDelay = async () => {
                await new Promise(resolve => setTimeout(resolve, 2000));
                navigation.navigate('Auth');
            };
            fetchDataWithDelay();
        }, [navigation])
    );

    return (
        <ImageBackground source={images.background} style={styles.container}>
            <Image source={images.logo} resizeMode="contain" style={styles.logo} />
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading data, please wait...</Text>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontFamily:'IBMPlexSans-SemiBold'
    },
});

export default LoadingPage;
