"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";

export default function NavBar() {
    const pathname = usePathname();
    const auth = useAuth();

    const isAdminPage = pathname?.includes("/admin");
    const isProPage = pathname?.includes("/pro");
    const isUserPage = pathname?.includes("/user");

    const loginGoogle = () => {
        auth?.loginGoogle()
            .then(() => {
                console.log("Logged in!");
            })
            .catch(() => {
                console.error("Something went wrong");
            });
    };

    const logout = () => {
        auth?.logout()
            .then(() => {
                console.log("Logged out!");
            })
            .catch(() => {
                console.error("Something went wrong");
            });
    };

    return (
        <div className="fixed top-12 left-0 w-full flex items-center justify-center">
            <div className="flex items-center bg-slate-200/10 gap-2 py-1 px-2 rounded-lg border border-slate-300/10 shadow mb-12">
                {auth?.currentUser && !auth.isPro && !auth.isAdmin && (
                    <div className="bg-pink-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
                        User
                    </div>
                )}
                {auth?.currentUser && auth.isPro && !auth.isAdmin && (
                    <div className="bg-emerald-600 text-white text-sm font-semibold px-2 py-1 rounded-full">
                        Pro
                    </div>
                )}
                {auth?.currentUser && auth.isAdmin && (
                    <div className="bg-orange-400 text-white text-sm font-semibold px-2 py-1 rounded-full">
                        Admin
                    </div>
                )}
                {!auth?.currentUser && (
                    <button
                        className="text-white text-sm font-semibold bg-orange-700 p-2 border-white/10 shadow rounded-md hover:bg-orange-900 transition mr-12"
                        onClick={loginGoogle}
                    >
                        Sign in with google
                    </button>
                )}
                {auth?.currentUser && (
                    <button
                        className="text-white text-sm font-semibold bg-gray-800 p-2 border-white/10 shadow rounded-md hover:bg-gray-900 transition"
                        onClick={logout}
                    >
                        Log out
                    </button>
                )}
                {auth?.currentUser && (
                    <div className="mr-12">
                        <p className="text-white text-sm font-semibold">
                            {auth.currentUser.displayName}
                        </p>
                        <p className="text-gray-400 text-xs font-semibold">
                            {auth.currentUser.email}
                        </p>
                    </div>
                )}
                {(isUserPage || isAdminPage || isProPage) && (
                    <Link
                        href={"/"}
                        className="text-white text-sm font-semibold p-2 hover:bg-slate-900 rounded-md transition"
                    >
                        Go to Home page
                    </Link>
                )}
                {!isUserPage && (
                    <Link
                        href={"user"}
                        className="text-white text-sm font-semibold p-2 hover:bg-slate-900 rounded-md transition"
                    >
                        Go to User page
                    </Link>
                )}
                {!isProPage && (
                    <Link
                        href={"pro"}
                        className="text-white text-sm font-semibold p-2 hover:bg-slate-900 rounded-md transition"
                    >
                        Go to Pro page
                    </Link>
                )}
                {!isAdminPage && (
                    <Link
                        href={"admin"}
                        className="text-white text-sm font-semibold p-2 hover:bg-slate-900 rounded-md transition"
                    >
                        Go to Admin page
                    </Link>
                )}
            </div>
        </div>
    );
}
