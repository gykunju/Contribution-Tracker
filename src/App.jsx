import { useState, useEffect, Suspense, lazy } from "react";
import { createClient } from "@supabase/supabase-js";
import illustration1 from './assets/undraw_mobile-payments_0u42.svg'
import illustration2 from './assets/undraw_data-processing_z2q6.svg'

import "./App.css";
import OfflineImage from "./components/OfflineImage";

// Lazy-load non-critical components
const TransactionsTable = lazy(() => import("./TransactionsTable"));

// Optimize imports by dynamically importing only required icons
const GrMoney = lazy(() =>
  import("react-icons/gr").then((mod) => ({ default: mod.GrMoney }))
);
const BsPerson = lazy(() =>
  import("react-icons/bs").then((mod) => ({ default: mod.BsPerson }))
);
const MdOutlineGroups = lazy(() =>
  import("react-icons/md").then((mod) => ({ default: mod.MdOutlineGroups }))
);

const IoPersonCircleOutline = lazy(() =>
  import("react-icons/io5").then((mod) => ({
    default: mod.IoPersonCircleOutline,
  }))
);
import { BiLogOut } from "react-icons/bi";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([])
  const [members, setMembers] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [addTransaction, setAddTransaction] = useState(false);
  // Check for an active session on page load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
        localStorage.setItem(
          "user",
          data.session.user.user_metadata.first_name
        );
      }
      setIsLoading(false); // Always set loading to false after check
    };
    checkSession();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true); // Start loading
      // Fetch members
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("*");
      if (membersError) throw membersError;
      
      setMembers(members)
      //add data to localStorage
      localStorage.setItem("members", members.map(member => member.name));
      console.log(localStorage.getItem("members"));

      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (transactionsError) throw transactionsError;

      // Merge data based on member ID
      const mergedData = transactions.map((transaction) => {
        const member = members.find((m) => m.id === transaction.member);
        return {
          ...transaction,
          memberName: member ? member.name : "Unknown",
          memberEmail: member ? member.email : "Unknown",
          memberPermission: member ? member.permission : "user",
          memberId: member ? member.id : null
        };
      });

      console.log(mergedData)

      setAllData(mergedData)

      // Calculate total contributions
      const totalContribution = mergedData.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );

      // Calculate current contributor's contributions
      const currentUser = localStorage.getItem("user");
      const currentEmail = localStorage.getItem("email");
      const currentUserContributions = mergedData
        .filter((transaction) => transaction.memberEmail === currentEmail)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
        // Get the number of unique contributors
        const uniqueContributors = new Set(
          mergedData.map((transaction) => transaction.memberName)
        ).size;
        

      // get the current user's permissions
      let permission;
      try{
        permission = members.find(
          (member) => member.email === currentEmail
        ).permission;
      } catch(e) {
        permission = 'user'
      }

      // Store calculated values in localStorage
      localStorage.setItem("totalContribution", totalContribution);
      console.log(localStorage.getItem('totalContribution'))
      localStorage.setItem(
        "currentUserContributions",
        currentUserContributions
      );
      localStorage.setItem("uniqueContributors", uniqueContributors);
      localStorage.setItem("permission", permission);

      // setting the data to be only the users
      const userData = mergedData.filter(
        (transaction) => transaction.memberEmail == currentEmail
      );

      setData(userData);

      // getting member id 

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  async function handleSignUp(e) {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    
    if (error ) {
      console.error("Error signing up:", error);
      setErrors(error.message);
    } else {
      setIsLoggedIn(true);
      localStorage.setItem("user", data.user.user_metadata.first_name);
      localStorage.setItem("email", data.user.user_metadata.email);
    }
      const memberData = {
        name: firstName + " " + lastName,
        email: email,
      }
      
      const { error: err } = await supabase
      .from("members")
      .insert([memberData])

      if (err) {
        throw err
      }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error("Error logging in:", error);
      setErrors(error.message);
    } else {
      setIsLoggedIn(true);
      localStorage.setItem("user", data.user.user_metadata.first_name);
      localStorage.setItem("email", data.user.user_metadata.email);
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setErrors(null);
      setIsSigningUp(false);
      setIsLoggedIn(false);
      localStorage.clear();
    }
  };

  async function handleTransactionSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const transaction = {
        member: formData.get("member"),
        amount: Number(formData.get("amount")),
      };

      const { error } = await supabase
        .from("transactions")
        .insert([transaction]);

      if (error) throw error;

      // Refresh data and close modal
      await fetchData();

      setAddTransaction(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen overflow-hidden bg-[#EAE7DC]">
        {/* Left Section - Welcome Messages */}
          <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#EAE7DC] to-[#D8C3A5] relative overflow-hidden">
            <div
              className={`absolute inset-0 flex items-center justify-center p-12 transition-transform duration-700 ease-in-out transform 
              ${isSigningUp ? "translate-x-0" : "-translate-x-full"}`}
            >
              <div className="max-w-md space-y-6">
                <h1 className="text-4xl font-bold text-[#8E8D8A]">
            Join GEL Investment Sacco
                </h1>
                <p className="text-lg text-[#8E8D8A] font-medium">
            Create an account and start tracking your contributions with
            ease
                </p>
                <OfflineImage
            src={illustration2}
            alt="Sign up illustration"
            className="mt-10 max-h-60 w-full max-w-md mx-auto"
                />
              </div>
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center p-12 transition-transform duration-700 ease-in-out transform 
              ${!isSigningUp ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="max-w-md space-y-6">
                <h1 className="text-4xl font-bold text-[#8E8D8A]">
            Welcome to GEL Investment Sacco
                </h1>
                <p className="text-lg text-[#8E8D8A] font-medium">
            Sign in to continue managing your contributions
                </p>
                <OfflineImage
            src={illustration1}
            alt="log in illustration"
            className="mt-10 w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Forms */}
        <div className="w-full lg:w-1/2 relative min-h-screen flex flex-col bg-[#EAE7DC]/90">
          {/* Forms Container */}
          <div className="flex-1 relative overflow-hidden">
            {/* Signup Form Container */}
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out transform
        ${isSigningUp ? "translate-x-0" : "translate-x-full"}`}
            >
              {/* Signup Form Content */}
              <div className="w-full h-full flex justify-center items-center p-6 lg:p-12">
                <div className="max-w-md mx-auto space-y-8 border-2 border-[#D8C3A5] rounded-xl p-10 bg-white/80 backdrop-blur-sm shadow-lg">
                  <h2 className="text-3xl font-bold text-[#bd655f]">
                    Create Account
                  </h2>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-3 py-2 rounded-lg bg-white/90 border-2 border-[#D8C3A5] 
                focus:outline-none focus:border-[#bd655f] text-[#8E8D8A]"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[#D8C3A5] 
                focus:outline-none focus:border-[#bd655f] text-[#8E8D8A]"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[#D8C3A5] 
                focus:outline-none focus:border-[#bd655f] text-[#8E8D8A]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[#D8C3A5] 
                focus:outline-none focus:border-[#bd655f] text-[#8E8D8A]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors && (
                      <p className="text-[#E85A4F] text-sm">{errors}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-[#bd655f] text-white font-medium 
                hover:bg-[#E85A4F] transform hover:scale-[1.02] transition-all duration-300
                shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Login Form Container */}
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out transform 
        ${!isSigningUp ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="w-full h-full flex justify-center items-center p-6 lg:p-12">
                <div
                  className="max-w-md mx-auto p-10 border-2 border-[#D8C3A5] rounded-xl space-y-8 
          bg-white/80 backdrop-blur-sm shadow-lg"
                >
                  <h2 className="text-3xl font-bold text-[#bd655f]">
                    Welcome Back
                  </h2>
                  <form onSubmit={handleLogin} className="space-y-6">
                    {/* ... existing input fields with updated styling ... */}
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-3 py-2 rounded-lg bg-white/90 border-2 border-[#D8C3A5] 
                focus:outline-none focus:border-[#bd655f] text-[#8E8D8A]
                hover:border-[#bd655f] transition-colors"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-lg bg-white border-2 border-[#D8C3A5] 
                focus:outline-none focus:border-[#E98074] text-[#8E8D8A]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors && (
                      <p className="text-[#E85A4F] text-sm">{errors}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-[#bd655f] text-white font-medium 
                hover:bg-[#E85A4F] transform hover:scale-[1.02] transition-all duration-300
                shadow-md hover:shadow-lg"
                    >
                      Log In
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Form Switch Button Container */}
          <div className="p-6 flex justify-center">
            <button
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="px-8 py-3 bg-[#bd655f] text-white rounded-lg hover:bg-[#E85A4F] 
        transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              {isSigningUp
                ? "Already have an account? Sign In"
                : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-zinc-900">
          <div className="loader"></div>
        </div>
      }
    >
      <div className=" min-h-screen p-6 space-y-6 bg-[#EAE7DC]">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-[#bd655f] text-xl font-bold sm:text-3xl xs:text-2xl">
            CONTRIBUTION OVERVIEW{" "}
            <span className="text-[#cb8f8a]">
              [ {localStorage.getItem("user").toUpperCase()} ]
            </span>
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-2 py-2 border-2 border-[#bd655f] hover:bg-[#bd655f] hover:text-zinc-200 
            rounded-lg transition-colors duration-200 text-[#bd655f]"
          >
            <BiLogOut className="text-lg" />
            <span className="text-sm  font-medium">Logout</span>
          </button>
        </div>
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(10px)", // Blur only the background
            zIndex: -1, // Ensure it stays behind the content
          }}
        ></div>

        {localStorage.getItem("permission") === "admin" && (
          <button
            onClick={() => setAddTransaction(true)}
            className="px-6 py-2 bg-[#bd655f] text-white rounded-lg
              hover:bg-[#E85A4F] transform hover:scale-[1.02] 
              transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Add Transaction
          </button>
        )}

        {addTransaction && (
          <div className="absolute inset-0 flex justify-center items-center backdrop-blur-md bg-black/50 z-50 p-4">
            <div className="bg-[#c8c0b5] p-6 rounded-lg shadow-lg w-96">
              <h1 className="text-lg font-medium">Add Transaction</h1>
              <form onSubmit={handleTransactionSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Member
                  </label>
                  <select
                    name="member"
                    className="w-full px-1 py-2 border-2 rounded-lg"
                    required
                  >
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    step={10}
                    name="amount"
                    className="w-full px-3 py-2 border-2 rounded-lg"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setAddTransaction(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Contribution Card */}
          <div className="bg-white/80 border-2 border-[#D8C3A5] rounded-xl p-4 flex items-center space-x-4">
            <GrMoney className="text-[#D8C3A5] text-5xl lg:text-6xl" />
            <div>
              <p className="text-zinc-500 text-base lg:text-lg">
                Total Contribution
              </p>
              <h2 className="text-zinc-500 text-2xl lg:text-3xl font-bold">
                Ksh. {localStorage.getItem("totalContribution")}
              </h2>
            </div>
          </div>

          {/* Your Contributions Card */}
          <div className="bg-white/80 border-2 border-[#D8C3A5] rounded-xl p-4 flex items-center space-x-4">
            <BsPerson className="text-[#D8C3A5] text-5xl lg:text-6xl" />
            <div>
              <p className="text-zinc-500 text-base lg:text-lg">
                Your Contributions
              </p>
              <h2 className="text-zinc-500 text-2xl lg:text-3xl font-bold">
                Ksh. {localStorage.getItem("currentUserContributions")}
              </h2>
            </div>
          </div>

          {/* Contributors Card */}
          <div className="bg-white/80 border-2 border-[#D8C3A5] rounded-xl p-4 flex items-center space-x-4">
            <MdOutlineGroups className="text-[#D8C3A5] text-5xl lg:text-6xl" />
            <div>
              <p className="text-zinc-500 text-base lg:text-lg">
                No. of Contributors
              </p>
              <h2 className="text-zinc-500 text-2xl lg:text-3xl font-bold">
                {localStorage.getItem("uniqueContributors")}
              </h2>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[#EAE7DC]  drop-shadow-2xl rounded-xl backdrop-blur-[10px]">
          <h2 className="text-2xl sm:text-xl xs:text-lg text-[#bd655f] font-medium mb-4">
            Transactions
          </h2>
          <TransactionsTable
            data={
              localStorage.getItem("permission") === "admin"
                ? allData
                : data
            }
          />
        </div>
      </div>
    </Suspense>
  );
}

export default App;
