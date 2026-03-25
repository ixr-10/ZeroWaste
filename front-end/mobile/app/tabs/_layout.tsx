import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import 'react-native-reanimated';



export const unstable_settings = {
  anchor: '(tabs)',
};

export default function TabLayout() {
  

  return (
      <Tabs screenOptions={{
        tabBarStyle:{backgroundColor : "#A4B18A80" ,  } ,
        }}>
        <Tabs.Screen name="index" options={{  title:"Home" ,
         headerShown: false ,  
          tabBarIcon: ({ color, size }) => (<Ionicons name="home-outline" color={"black"} size={20} />) ,
          tabBarActiveTintColor : "black",
         }} 
          />

        

        <Tabs.Screen name="Notifications" options={{ tabBarIcon : ({color , size}) => (<Ionicons name="notifications-outline" color={"black"} size={20}/>) ,
          tabBarActiveTintColor : "black" ,       
          headerShown: false 
        }} />

        <Tabs.Screen name="Profile" options={{ tabBarIcon : ({color , size}) => (<Ionicons name="person-outline" color={"black"} size={20}/>) ,
          tabBarActiveTintColor : "black" , 
          headerShown: false 
        }} />

        <Tabs.Screen name="slides" options={{ tabBarIcon : ({color , size}) => (<Ionicons name="camera-outline" color={"black"} size={20}/>) ,
          tabBarActiveTintColor : "black" , 
          headerShown: false ,
        }} />
    
      </Tabs>

      
      
    );
}
