import firebase from "firebase";
var firebaseConfig = {
    apiKey: "AIzaSyC76xxOmkSiRGJxAzHfBEDVX5c745iyWB8",
    authDomain: "webrtcchatapp-3d1a2.firebaseapp.com",
    projectId: "webrtcchatapp-3d1a2",
    storageBucket: "webrtcchatapp-3d1a2.appspot.com",
    messagingSenderId: "706540255978",
    appId: "1:706540255978:web:1f544eed76382ac3d9b593"
  };
  
  const fire = firebase.initializeApp(firebaseConfig);
  export default fire;