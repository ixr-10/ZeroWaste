
import { Image,  TouchableOpacity, View, StyleSheet} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';


export default function header2 ({showBack = false}){
  return (
    <View style={styles.container}>
      {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}   // goes back to previous screen
            
            >
            <Ionicons name="arrow-back-circle-outline" size={32} color="black" style={{top: 20,}} />
          </TouchableOpacity>
      ) : (
         <View style={{ width: 32 }} />
      )}
      <Image source={require('../assets/images/logo.png')} style={styles.logo}/>
    </View>
  )

}

const styles = StyleSheet.create({
  logo : {width:36,height:29.03,resizeMode: 'contain',  // ⬅️ key
    top: 20,               // distance from top
    right: 20,},
   container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
    paddingTop: 0,
    marginTop: 0,
  },

});