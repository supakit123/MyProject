import * as Font from 'expo-font';

const fetchFonts = () => {
  return Font.loadAsync({
    'Nunito-Bold': require('../../assets/fonts/Nunito-Bold.ttf'), 
    'Nunito-Regular': require('../../assets/fonts/Nunito-Regular.ttf'), 

    'IBMPlexSans-Bold': require('../../assets/fonts/IBMPlexSans-Bold.ttf'), 
    'IBMPlexSans-ExtraLight': require('../../assets/fonts/IBMPlexSans-ExtraLight.ttf'), 
    'IBMPlexSans-Italic': require('../../assets/fonts/IBMPlexSans-Italic.ttf'), 
    'IBMPlexSans-Light': require('../../assets/fonts/IBMPlexSans-Light.ttf'), 
    'IBMPlexSans-Medium': require('../../assets/fonts/IBMPlexSans-Medium.ttf'), 
    'IBMPlexSans-Regular': require('../../assets/fonts/IBMPlexSans-Regular.ttf'), 
    'IBMPlexSans-SemiBold': require('../../assets/fonts/IBMPlexSans-SemiBold.ttf'), 
    'IBMPlexSans-Thin': require('../../assets/fonts/IBMPlexSans-Thin.ttf'), 
  });
};

export default fetchFonts;
