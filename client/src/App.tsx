import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Characters from "@/pages/characters";
import Bestiary from "@/pages/bestiary";
import Spellbook from "@/pages/spellbook";
import Regions from "@/pages/regions";
import Locations from "@/pages/locations";
import Map from "@/pages/map";
import Lore from "@/pages/lore";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/map" component={Map} />
        <Route path="/characters" component={Characters} />
        <Route path="/bestiary" component={Bestiary} />
        <Route path="/spellbook" component={Spellbook} />
        <Route path="/regions" component={Regions} />
        <Route path="/locations" component={Locations} />
        <Route path="/lore" component={Lore} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
