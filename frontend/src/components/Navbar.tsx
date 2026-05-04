import { Apple, LogOut } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function Navbar() {

  const { logout, username } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <Apple className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              FoodStock
            </h1>
            <p className="text-xs text-slate-500">
              Gestion de stock
            </p>
          </div>
        </div>

        {/* USER */}
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback className="bg-green-100 text-green-700">
              {username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="hover:bg-green-100"
          >
            <LogOut className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}