import React, { useState, useRef } from 'react';
import { View, Image, PanResponder, Animated, Alert } from 'react-native';

const CaptchaSlider = ({onVerified }) => {
  const [sliderPosition] = useState(new Animated.ValueXY());
  const [highlightColor] = useState(new Animated.Value(0));
  const [borderWidth] = useState(new Animated.Value(1));
  const [isVerified, setIsVerified] = useState(false); // ใช้ติดตามสถานะการยืนยัน

  const correctPosition = 150; // กำหนดตำแหน่งที่ถูกต้อง

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !isVerified, // ปิดการตอบสนองเมื่อถูกยืนยัน
      onPanResponderMove: (e, gesture) => {
        if (!isVerified) { // ตรวจสอบสถานะการยืนยัน
          sliderPosition.setValue({ x: gesture.dx, y: 0 });

          if (gesture.dx >= correctPosition && gesture.dx <= correctPosition + 10) {
            Animated.timing(highlightColor, {
              toValue: 0,
              duration: 100,
              useNativeDriver: false,
            }).start();

            Animated.timing(borderWidth, {
              toValue: 0, // ลบขอบออกเมื่ออยู่ในตำแหน่งที่ถูกต้อง
              duration: 100,
              useNativeDriver: false,
            }).start();
          } else {
            Animated.timing(highlightColor, {
              toValue: 1,
              duration: 100,
              useNativeDriver: false,
            }).start();

            Animated.timing(borderWidth, {
              toValue: 1, // แสดงขอบเมื่ออยู่ในตำแหน่งอื่น
              duration: 100,
              useNativeDriver: false,
            }).start();
          }
        }
      },
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx >= correctPosition && gesture.dx <= correctPosition + 10) {
          setIsVerified(true); // ตั้งค่าเป็นยืนยันแล้ว
          onVerified(true); // ส่งค่า true กลับไปยัง mainpage

          Alert.alert('Success', 'You have been verified!');
        } else {
          Animated.spring(sliderPosition, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          Animated.timing(highlightColor, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }).start();

          Animated.timing(borderWidth, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const animatedBackgroundColor = highlightColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', 'rgba(252, 15, 3, 0.5)'],
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Image 
        source={{ uri: 'https://www.proag.com/wp-content/uploads/2019/09/Honey-bee-2-5-300x150.jpg' }} 
        style={{ width: 300, height: 150 }} 
      />
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          sliderPosition.getLayout(),
          styles.sliderPiece,
          { backgroundColor: animatedBackgroundColor, borderWidth: borderWidth },
        ]}
      />
    </View>
  );
};

const styles = {
  sliderPiece: {
    width: 50,
    height: 150,
    position: 'absolute',
    top: 0,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
};

export default CaptchaSlider;
