import { cookies } from "next/headers";
import { Item, ItemAccess } from "../api/items/route";
import { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "@/firebase/server";

export default async function AdminPage() {
    const cookieStore = cookies();
    const authToken = cookieStore.get("firebaseIdToken")?.value;

    if (!authToken || !auth) {
        return <h1 className="text-white text-xl mb-10">Restricted page</h1>;
        // return redirect("/");
    }

    let user: DecodedIdToken | null = null;
    try {
        user = await auth.verifyIdToken(authToken);
    } catch (error) {
        // One possible error is the token being expired, return forbidden
        console.log(error);
    }

    if (!user) {
        return <h1 className="text-white text-xl mb-10">Restricted page</h1>;
        // return redirect("/");
    }

    const isAdmin = user.role === "admin";

    if (!isAdmin) {
        return <h1 className="text-white text-xl mb-10">Restricted page</h1>;
        // return redirect("/");
    }

    let items: Item[] = [];
    const response = await fetch(`${process.env.API_URL}/api/items`, {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
    if (response.ok) {
        const itemsJson = await response.json();
        if (itemsJson && itemsJson.length > 0) items = itemsJson;
    }

    return (
        <div>
            <h1 className="text-white text-xl mb-10">Admin Page</h1>
            {items.map((item) => {
                return (
                    <div
                        key={item.id}
                        className="flex items-center justify-between w-full gap-20 bg-slate-100/10 rounded text-slate-200 text-sm font-semibold px-2 py-1 mb-2"
                    >
                        <p>{item.title}</p>
                        <span
                            className={`${
                                item.access === ItemAccess.ADMIN
                                    ? "bg-orange-400"
                                    : item.access === ItemAccess.PRO
                                    ? "bg-emerald-400"
                                    : item.access === ItemAccess.USER
                                    ? "bg-pink-600"
                                    : "bg-slate-400"
                            } text-white text-xs px-2 py-1 rounded-full`}
                        >
                            {item.access}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
