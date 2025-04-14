import { useState, useEffect, Suspense, lazy } from "react";
import { createClient } from "@supabase/supabase-js";
// Lazy-load the background image
import backgroundImage from './assets/login.png'
import "./App.css";

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
import { BiLogOut } from "react-icons/bi";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // Toggle between signup and login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Check for an active session on page load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
      }
      localStorage.setItem("user", data.session.user.user_metadata.first_name);
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

      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*");
      if (transactionsError) throw transactionsError;

      // Merge data based on member ID
      const mergedData = transactions.map((transaction) => {
        const member = members.find((m) => m.id === transaction.member);
        return {
          ...transaction,
          memberName: member ? member.name : "Unknown",
          memberEmail: member ? member.email : "Unknown",
        };
      });

      setData(mergedData);

      // Calculate total contributions
      const totalContribution = mergedData.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );

      // Calculate current contributor's contributions
      const currentUser = localStorage.getItem("user");
      const currentEmail = localStorage.getItem('email')
      const currentUserContributions = mergedData
        .filter(
          (transaction) => transaction.memberEmail === currentEmail
        )
        .reduce((acc, transaction) => acc + transaction.amount, 0);

      // Get the number of unique contributors
      const uniqueContributors = new Set(
        mergedData.map((transaction) => transaction.memberName)
      ).size;

      // Store calculated values in localStorage
      localStorage.setItem("totalContribution", totalContribution);
      localStorage.setItem(
        "currentUserContributions",
        currentUserContributions
      );
      localStorage.setItem("uniqueContributors", uniqueContributors);
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
    console.log(data);
    if (error) {
      console.error("Error signing up:", error);
      setErrors(error.message);
    } else {
      setIsLoggedIn(true);
      localStorage.setItem("user", data.user.user_metadata.first_name);
      localStorage.setItem("email", data.user.user_metadata.email);
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
      localStorage.setItem('email', data.user.user_metadata.email)
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

  if (!isLoggedIn) {
    return (
      <div
      className="flex items-center bg-zinc-900 justify-center min-h-screen bg-cover bg-center p-6"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundColor: "rgba(2, 2, 2, 2)", // Add a dark overlay
        backgroundBlendMode: "darken", // Blend the overlay with the image
        backdropFilter: "blur(8px)", // Apply blur effect to the background image
      }}
      >
      <div className="border-2 border-zinc-700 bg-opacity-100 p-8 rounded-lg shadow-lg max-w-md">
        <h2 className="text-3xl font-bold text-zinc-200 text-center mb-6">
        {isSigningUp ? "Create an Account" : "Log In"}
        </h2>
        <form
        onSubmit={isSigningUp ? handleSignUp : handleLogin}
        className="space-y-4"
        >
        {isSigningUp && (
          <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="text-md text-zinc-100 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="text-md text-zinc-100 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          className="text-md text-zinc-100 border border-zinc-700 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="text-md text-zinc-100 border border-zinc-700 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          {errors && (
          <p className="text-red-500 text-sm text-center">{errors}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          {isSigningUp ? "Sign Up" : "Log In"}
        </button>
        </form>
        <p className="text-zinc-200 text-center mt-4">
        {isSigningUp
          ? "Already have an account? "
          : "Don't have an account? "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => setIsSigningUp(!isSigningUp)}
        >
          {isSigningUp ? "Log In" : "Sign Up"}
        </span>
        </p>
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
    <Suspense fallback={<div>Loading...</div>}>
      <div
        className="bg-zinc-900 min-h-screen p-6 space-y-6"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundColor: "rgba(2, 2, 2, 2)", // Add a dark overlay
          backgroundBlendMode: "", // Blend the overlay with the image
          // backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-zinc-200 text-xl font-bold sm:text-3xl xs:text-2xl">
            CONTRIBUTION OVERVIEW ({localStorage.getItem("user")})
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 
              text-zinc-200 rounded-lg transition-colors duration-200"
          >
            <BiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(10px)", // Blur only the background
            zIndex: -1, // Ensure it stays behind the content
          }}
        ></div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="border-2 border-zinc-700 rounded-xl p-4 space-x-4 flex flex-row items-center w-full sm:w-1/3 xs:w-full">
            <GrMoney className="text-zinc-500 text-7xl sm:text-6xl xs:text-5xl" />
            <div>
              <p className="text-zinc-500 text-xl sm:text-xl xs:text-base">
                Total Contribution
              </p>
              <h2 className="text-zinc-200 text-5xl sm:text-4xl xs:text-3xl font-bold">
                ${localStorage.getItem("totalContribution")}
              </h2>
            </div>
          </div>

          <div className="border-2 border-zinc-700 rounded-xl p-4 space-x-4 flex flex-row items-center w-full sm:w-1/3 xs:w-full">
            <BsPerson className="text-zinc-500 text-7xl sm:text-6xl xs:text-5xl" />
            <div>
              <p className="text-zinc-500 text-xl sm:text-lg xs:text-base">
                Your Contributions
              </p>
              <h2 className="text-zinc-200 text-5xl sm:text-4xl xs:text-3xl font-bold">
                ${localStorage.getItem("currentUserContributions")}
              </h2>
            </div>
          </div>

          <div className="border-2 border-zinc-700 rounded-xl p-4 space-x-4 flex flex-row items-center w-full sm:w-1/3 xs:w-full">
            <MdOutlineGroups className="text-zinc-500 text-7xl sm:text-6xl xs:text-5xl" />
            <div>
              <p className="text-zinc-500 text-xl sm:text-lg xs:text-base">
                No. of Contributors
              </p>
              <h2 className="text-zinc-200 text-5xl pl-5 sm:text-4xl xs:text-3xl font-bold">
                {localStorage.getItem("uniqueContributors")}
              </h2>
            </div>
          </div>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-xl backdrop-blur-[.2px]">
          <h2 className="text-2xl sm:text-xl xs:text-lg text-zinc-200 font-medium mb-4">
            Transactions
          </h2>
          <TransactionsTable data={data} />
        </div>
      </div>
    </Suspense>
  );
}

export default App;
