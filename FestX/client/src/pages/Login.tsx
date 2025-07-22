import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Login = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => {
      return apiRequest("POST", "/api/login", values);
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        // Use the auth context to log in
        login(data);
        
        toast({
          title: "Login successful!",
          description: `Welcome back, ${data.username}!`,
        });
        
        // Redirect to home page
        setLocation("/");
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (values: Omit<RegisterFormValues, "confirmPassword">) => {
      return apiRequest("POST", "/api/users", values);
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        toast({
          title: "Registration successful!",
          description: "Your account has been created! You can now login.",
        });
        
        // Switch to login tab after successful registration
        setActiveTab("login");
        loginForm.setValue("username", registerForm.getValues().username);
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  // Demo login
  const handleDemoLogin = () => {
    const demoUser = {
      username: "admin",
      password: "password123",
    };
    
    loginMutation.mutate(demoUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">FestX</h2>
          <p className="text-zinc-400">Discover and join the best events on campus</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Welcome back</CardTitle>
                <CardDescription className="text-zinc-400">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form 
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                              <Input 
                                placeholder="Enter your username" 
                                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Log in"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="relative w-full my-4">
                  <Separator className="bg-zinc-800" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-2 text-xs text-zinc-500">
                    OR
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  onClick={handleDemoLogin}
                >
                  Demo Login
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Create an account</CardTitle>
                <CardDescription className="text-zinc-400">
                  Register to start discovering campus events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form 
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)} 
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                              <Input 
                                placeholder="Choose a username" 
                                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                              <Input 
                                type="email" 
                                placeholder="your.email@university.edu" 
                                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;