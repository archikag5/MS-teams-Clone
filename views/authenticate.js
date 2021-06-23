import React, {useState,useEffect} from 'react';
import fire from'./fire';
import Login from './Login';

const Authenticate = () => {
    const [user,setUser]=usesState('');
    const [email,setEmail]=usesState('');
    const [emailerror,setEmailError]=usesState('');
    const [password,setPassword]=usesState('');
    const [passworderror,setPasswordError]=usesState('');
    const [hasAccount,setHasAccount]=usesState(false);

    const handlelogin = () => {
      setEmailError(''); setPasswordError('');
        fire.auth().signInWithEmailAndPassword(email,password)
        .catch(err => {
            switch(err.code){
                case "auth/invalid-email":
                case "auth/user-diabled":
                case "auth/user-not-found ":
                    setEmailError(err.message);
                    break;
                case "auth/wrong-password":
                    setPasswordError(err.message);
                    break; 

            }
        })
    };
    const handleSignin = () => {
      setEmailError(''); setPasswordError('');
        fire.auth().createUserWithEmailAndPassword(email,password)
        .catch(err => {
            switch(err.code){
                case "auth/email-already-used":
                case "auth/invalid-email":
                    setEmailError(err.message);
                    break;
                case "auth/weak-password":
                    setPasswordError(err.message);
                    break; 

            }
        })
    };
    const handleLogout = () => {
        fire.auth().signOut();
    };
    const authListener = () => {
        fire.auth().onAuthSteChanged((user)=>{
            if(user){
                setEmail(''); 
                setPassword('');
                setUser(user)
            }
            else
            {
                setUser("");
            }
        });
    };
    useEffect(()=>{
      authListener();
    },[]);
    return (
      <div className = "Authenticate">
        <Login
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          emailerror={setEmailError}
          passworderror={setPasswordError}
          handlelogin={handlelogin}
          hasAccount={hasAccount}
          setHasAccount={setHasAccount}
          handleSignin={handleSignin}
        />
        </div>
    );
};
export default Authenticate;
