"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { plans } from "@/components/premium";
import { useAbstraxionSigningClient } from "@burnt-labs/abstraxion";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { TiTick } from "react-icons/ti";
import { X } from "lucide-react";


const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface userType {
  name: string;
  email: string;
  xion_id: string;
  points: number;
}

const Credits = () => {
  const [user, setUser] = useState<userType>({
    name: "",
    email: "",
    xion_id: "",
    points: 0,
  });
  // const { client: signingClient } = useAbstraxionSigningClient();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
  const { client: signingClient } = useAbstraxionSigningClient();

  const api=process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      const address = localStorage.getItem("address");
      try {
        const res = await fetch(`${api}/api/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });

        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [router]);

  const buyCreditsFromXion = async (bundle: string,coins:string, price: string) => {
    const msg = {
      buy_credits: { bundle: bundle },
    };
    setLoading(true);
    try {
      if (signingClient) {
        await signingClient.execute(
          user?.xion_id,
          contractAddress,
          msg,
          "auto",
          `Purchase of ${bundle} bundle for X-Chat`,
          [
            {
              denom: "uxion",
              amount: price?.toString() || "0",
            },
          ]
        );

        toast.success(`Successfully purchased ${coins} credits!`);
      }
    } catch (error: any) {
      if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds in your wallet. Please add more XION.");
      }
      // toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div>
       
          <Header
            title="Buy Points"
            subtitle="Choose a package that suits your needs!"
          />
      
        <div>
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 p-2 mt-2  mr-4 rounded-full cursor-pointer "
          >
            <X size={30} />
          </button>
        </div>
      </div>

      <section className="mt-8 grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="rounded-2xl border hover:scale-110 border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
          >
            <div className="flex flex-col items-center gap-4">
              <div className=" p-3    ">
                <img
                  src={plan.icon}
                  alt={plan.name}
                  className="h-18 w-18 rounded-full object-contain "
                />
              </div>

              <h3 className="text-xl font-bold text-purple-700 mt-2">
                {plan.name}
              </h3>

              <p className="text-3xl font-extrabold text-gray-800">
                {plan.price} <span className="text-base font-medium">XION</span>
              </p>

              <p className="text-gray-500 text-sm">{plan.credits} Points</p>
            </div>

            <ul className="mt-6 space-y-4 text-sm text-gray-600">
              {plan.inclusions.map((inclusion) => (
                <li key={inclusion.label} className="flex items-center gap-3">
                  {inclusion.isIncluded ? (
                    <TiTick className="text-green-500 h-5 w-5" />
                  ) : (
                    <span className="h-5 w-5 text-red-500">✗</span>
                  )}
                  <span>{inclusion.label}</span>
                </li>
              ))}
            </ul>

            <Button
              className="mt-8 w-full py-3 rounded-xl text-lg font-medium bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              disabled={loading}
              onClick={() => buyCreditsFromXion(plan.name,plan.credits, `${plan?.price*1000000}`)}
            >
              {loading ? "Processing..." : "Buy Now"}
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Credits;
