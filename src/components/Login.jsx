import React, { useContext, useState } from "react";
import { signInWithGoogle, signInEmail, signUpEmail, signOut } from "../firebase";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div>{user.displayName ?? user.email}</div>
        <button className="btn" onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="p-2">
      <button className="bg-white px-3 py-1 rounded shadow mr-2" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <div className="inline-block ml-2">
        <input className="border px-2 py-1 mr-1" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border px-2 py-1 mr-1" placeholder="password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button className="bg-blue-500 text-white px-2 py-1 rounded mr-1" onClick={()=>signInEmail(email,pw)}>Sign in</button>
        <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={()=>signUpEmail(email,pw)}>Sign up</button>
      </div>
    </div>
  );
}
