"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart2, Briefcase } from "lucide-react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const allReportCards = [
    {
        title: "Service & Inventory Insights",
        description: "Analyze call center performance and inventory status.",
        href: "/dashboard/csd",
        icon: <BarChart2 className="w-8 h-8 text-primary" />,
        role: "csd"
    },
    {
        title: "Pre-Sales Bid Analysis",
        description: "Track and evaluate bidding and tender performance.",
        href: "/dashboard/presales",
        icon: <Briefcase className="w-8 h-8 text-primary" />,
        role: "presales"
    }
]

export default function ReportHubPage() {
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const auth = getAuth(db.app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserRoles(data.roles || []);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    const filteredReportCards = allReportCards.filter(card => 
        userRoles.includes('admin') || userRoles.includes(card.role)
    );
    
    if(loading) {
        return <p>Loading reports...</p>
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Momentum BI</h1>
                <p className="text-muted-foreground mt-2">Select a report to view the corresponding dashboard.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                {filteredReportCards.length > 0 ? filteredReportCards.map((card) => (
                    <Link href={card.href} key={card.title}>
                        <Card className="shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4">
                                {card.icon}
                                <div>
                                    <CardTitle className="font-headline">{card.title}</CardTitle>
                                    <CardDescription>{card.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-end justify-end">
                                <div className="flex items-center text-sm font-medium text-primary">
                                    View Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                )) : (
                    <div className="md:col-span-2 text-center text-muted-foreground">
                        <p>You do not have access to any reports.</p>
                        <p>Please contact an administrator to request access.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
