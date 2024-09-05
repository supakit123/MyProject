import { Alert, Animated, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import React from 'react';
import { AntDesign, Entypo } from '@expo/vector-icons';

export default class PopupMenu extends React.Component {
    animation = new Animated.Value(0);

    toggleMenu = () => {
        const toValue = this.open ? 0 : 1;
        Animated.spring(this.animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();

        this.open = !this.open;
    };
    render() {
        const pinStyle = {
            transform: [
                { scale: this.animation },
                {
                    translateX: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -80],
                    }),
                },
            ],
        };
        const thumbStyle = {
            transform: [
                { scale: this.animation },
                {
                    translateX: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -140],
                    }),
                },
            ],
        };
        const rotation = {
            transform: [
                {
                    rotate: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "45deg"],
                    }),
                },
            ],
        };
        const opacity = this.animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        });

        return (
            <View style={[styles.container, this.props.style]}>
                <TouchableNativeFeedback onPress={this.clearLog}>
                    <Animated.View style={[styles.button, styles.secondary, thumbStyle, { opacity }]}>
                      <Entypo name="trash" size={24} color="#F02A4B" />
                    </Animated.View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={this.logOut}>
                    <Animated.View style={[styles.button, styles.secondary, pinStyle, { opacity }]}>
                      <Entypo name="log-out" size={24} color="#F02A4B" />
                    </Animated.View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={this.toggleMenu}>
                    <Animated.View style={[styles.button, styles.menu, rotation]}>
                      <AntDesign name="plus" size={24} color="#fff" />
                    </Animated.View>
                </TouchableNativeFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        right:10,
        alignItems: 'flex-end',
        // position: 'absolute',
        paddingBottom:10,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowRadius: 10,
        shadowColor: '#F02A4B',
        shadowOpacity: 0.3,
        shadowOffset: { height: 10 },
    },
    menu: {
        backgroundColor: '#F02A4B',
    },
    secondary: {
        width: 48,
        height: 48,
        borderRadius: 48 / 2,
        backgroundColor: '#fff',
        position: 'absolute',
    },
});
