import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import EventDetails from "@/pages/EventDetails";
import CreateEvent from "@/pages/CreateEvent";
import Calendar from "@/pages/Calendar";
import MyEvents from "@/pages/MyEvents";
import Dashboard from "@/pages/Dashboard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth, AuthProvider } from "@/contexts/AuthContext";

function Router() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // We don't need this effect anymore as auth state is properly managed now
  
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {isAuthenticated && <Navbar />}
      <main className={`flex-grow ${!isAuthenticated ? 'p-0' : ''}`}>
        <Switch>
          <Route path="/login">
            {!isAuthenticated ? <Login /> : <Redirect to="/" />}
          </Route>
          
          {/* Protected routes */}
          <Route path="/">
            {isAuthenticated ? <Home /> : <Redirect to="/login" />}
          </Route>
          <Route path="/events/:id">
            {(params) => (
              isAuthenticated ? <EventDetails /> : <Redirect to="/login" />
            )}
          </Route>
          <Route path="/create">
            {isAuthenticated ? <CreateEvent /> : <Redirect to="/login" />}
          </Route>
          <Route path="/calendar">
            {isAuthenticated ? <Calendar /> : <Redirect to="/login" />}
          </Route>
          <Route path="/my-events">
            {isAuthenticated ? <MyEvents /> : <Redirect to="/login" />}
          </Route>
          <Route path="/dashboard">
            {isAuthenticated ? <Dashboard /> : <Redirect to="/login" />}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
      {isAuthenticated && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
