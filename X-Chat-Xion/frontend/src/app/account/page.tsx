"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCoins, FaRocketchat } from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IoArrowBackCircle } from "react-icons/io5";
import {
  useAbstraxionAccount,
  useAbstraxionClient,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

interface userType {
  name: string;
  email: string;
  xion_id: string;
  points: number;
}

const ProfilePage = () => {
  const [user, setUser] = useState<userType>({
    name: "",
    email: "",
    xion_id: "",
    points: 0,
  });
  const [chatCount, setChatCount] = useState<number>(0);
  const router = useRouter();

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

  const { client: queryClient } = useAbstraxionClient();
  const { data: account } = useAbstraxionAccount();
  const [creditBalance, setCreditBalance] = React.useState<number>(0);
  const [transactions, setTransactions] = React.useState<
    {
      credits: string;
      label: string;
      timestamp: number;
    }[]
  >([]);

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

  useEffect(() => {
    const address = localStorage.getItem("address");
    const fetchChats = async () => {
      try {
        const res = await fetch(
          `${api}/api/chat/getConversations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          }
        );

        if (!res.ok) throw new Error("Failed to fetch conversations");
        const data = await res.json();
        setChatCount(data.conversationsCount);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
    };
    fetchChats();
  }, [router]);


  const getInfoFromXion = async () => {
    try {
      if (queryClient) {
        const user_res = await queryClient.queryContractSmart(contractAddress, {
          get_user: {
            address: account?.bech32Address,
          },
        });
        setCreditBalance(user_res?.user?.credit_balance);

        const transaction_res = await queryClient.queryContractSmart(
          contractAddress,
          {
            get_transactions: {
              address: account?.bech32Address,
            },
          }
        );

        let req_txn = transaction_res?.transactions?.map(
          (txn: { credits: string; label: string; timestamp: string }) => ({
            credits: txn?.credits,
            label: txn?.label,
            timestamp: Number(txn?.timestamp) * 1000,
          })
        );
        
        setTransactions(req_txn);
      }
    } catch (error) {
      console.error("Error querying contract:", error);
    }
  };

  useEffect(() => {
    getInfoFromXion();
  }, [router]);

  return (
    <div className="min-h-screen px-4 py-8 md:px-10">
      <div className="flex justify-between mb-6">
        <div>
          <Header title={`Greetings! ${user.name}`} subtitle={" "} />
        </div>
        <div>
          <button
            className="text-lg font-semibold py-2 px-4 rounded-lg shadow-lg cursor-pointer transition duration-300"
            onClick={() => router.push("/chat")}
          >
            <IoArrowBackCircle  size={45}/>
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-orange-600 font-medium">
        <span className="bg-orange-100 px-3 py-1 rounded-full italic">
          {user.xion_id}
        </span>
      </div>

      <section className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 dark:bg-gray-600 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-lg  font-semibold dark:text-gray-300 mb-2">
              Points Available
            </p>
            <div className="flex items-center gap-4">
              <FaCoins className="w-10 h-10 text-yellow-300" />
              <h2 className="text-4xl font-bold dark:text-gray-300">
                {creditBalance}
              </h2>
            </div>
          </div>
          <div className="text-black mr-10">
            <button
              className="bg-green-500 hover:scale-110 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
              onClick={() => router.push("/plans")}
            >
              Buy More
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl dark:bg-gray-700 shadow-md flex flex-col justify-between">
          <p className="text-lg font-semibold dark:text-gray-300 text-gray-600 mb-2">
            Active Chats
          </p>
          <div className="flex items-center gap-4">
            <FaRocketchat className="h-9 w-9 dark:text-gray-300 text-black" />
            <h2 className="text-3xl font-bold dark:text-gray-300 text-gray-800">
              {chatCount}
            </h2>
          </div>
        </div>
      </section>

      {/* Transactions Table */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Transactions</h2>
        <div className="rounded-xl shadow overflow-hidden bg-black">
          <ScrollArea className="h-[430px]">
          <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Label</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn, index) => {
            const date = new Date(txn.timestamp);
            const formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            const formattedTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {formattedDate} {formattedTime}
                </TableCell>
                <TableCell>{txn.credits} credits</TableCell>
                <TableCell>{txn.label}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
