// src/pages/admin-dashboard.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


// Global Layout Framework Modules
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

// Data & Mock Archetypes
import { mockCartData } from "@/lib/products";

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    // Application UI states
    const [activeTab, setActiveTab] = useState<
        "showroom" | "carts" | "orders" | "contact"
    >("showroom");
    const [carts, setCarts] = useState(mockCartData);
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    // const fileName = product.image.split("/").pop();
    const [preview, setPreview] = useState("");
    // const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    // Search & Filter Logic States
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    // Pagination Configuration State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [email, setEmail] = useState("");
    // const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // New Specimen Creation States
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState("");
    const [tag, setTag] = useState("");
    interface Category {
        id: string;
        name: string;
    }

    const [categories, setCategories] = useState<Category[]>([]);

    const [contactMessages, setContactMessages] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [contactSearch, setContactSearch] = useState("");
    const [contactStatus, setContactStatus] = useState("all");

    const [successMessage, setSuccessMessage] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        getCategories();
        getProducts();
        getOrders();
        getContactMessages();
        const checkAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setIsAuthenticated(!!session);
        };

        checkAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsAuthenticated(!!session);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const uploadImage = async (file: File) => {
        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);


        return data.publicUrl;
    };

    const getOrders = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select(`
            *,
            order_items(
                *,
                products(*)
            )
        `);

        if (error) {
            console.error(error);
            return;
        }

        setOrders(data || []);

        if (data && data.length > 0) {
            setSelectedOrder(data[0]);
        }
    };

    const getProducts = async () => {
        const { data, error } = await supabase
            .from("products")
            .select(`
      *,
      categories(name)
    `);

        if (error) {
            console.error(error);
            return;
        }

        setProducts(data || []);
    };
    const getContactMessages = async () => {
        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Contact messages error:", error);
            return;
        }

        setContactMessages(data || []);

        if (data && data.length > 0 && !selectedContact) {
            setSelectedContact(data[0]);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setAuthError("");

        if (!email || !password) {
            setAuthError("Please enter your email and password.");
            return;
        }

        setIsLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsLoading(false);

        if (error) {
            console.error("Admin login error:", error);
            setAuthError("Invalid email or password.");
            return;
        }

        if (data.user) {
            setIsAuthenticated(true);
            setAuthError("");
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        setSuccessMessage("");

        if (!name || !price || !categoryId) {
            return;
        }

        setIsCreating(true);

        try {
            let imageUrl = "";

            // Upload image if selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            // Create product
            const { error } = await supabase
                .from("products")
                .insert({
                    name: name.trim(),
                    price: Number(price),
                    category_id: categoryId,
                    tag: tag.trim() || null,
                    image: imageUrl || null,
                });

            if (error) {
                console.error("Product creation error:", error);
                throw error;
            }

            // Refresh product list
            await getProducts();

            // Clear form
            setName("");
            setPrice("");
            setTag("");
            setCategoryId("");
            setImageFile(null);
            setPreview("");

            // Clear file input manually
            const fileInput = document.getElementById(
                "product-image-input"
            ) as HTMLInputElement | null;

            if (fileInput) {
                fileInput.value = "";
            }

            // Show success message
            setSuccessMessage(
                `"${name}" has been added successfully to the showroom.`
            );

            // Automatically hide message after 4 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);

        } catch (error) {
            console.error("Failed to create product:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);

        setName(product.name || "");
        setPrice(String(product.price || ""));
        setCategoryId(product.category_id || "");
        setTag(product.tag || "");
        setPreview(product.image || "");
        setImageFile(null);
    };

    const deleteProduct = async (id: string) => {

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            console.log(error.message);
            return;
        }

        getProducts();
    };
    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        setSuccessMessage("");
        setAuthError("");

        const { error } = await supabase
            .from("products")
            .update({
                name: name.trim(),
                price: Number(price),
                category_id: categoryId,
                tag: tag.trim() || null,
                image: editingProduct.image || null,
            })
            .eq("id", editingProduct.id);

        if (error) {
            console.error("Product update error:", error);
            setAuthError(`Failed to update product: ${error.message}`);
            return;
        }

        await getProducts();

        setSuccessMessage(
            `"${name}" updated successfully.`
        );

        setEditingProduct(null);
        setName("");
        setPrice("");
        setCategoryId("");
        setTag("");
        setPreview("");
        setImageFile(null);

        const fileInput = document.getElementById(
            "product-image-input"
        ) as HTMLInputElement | null;

        if (fileInput) {
            fileInput.value = "";
        }

        setTimeout(() => {
            setSuccessMessage("");
        }, 4000);
    };
    interface Product {
        categories?: { name: string; };
        id: string;
        name: string;
        price: number;
        tag?: string;
        image?: string;
        category_id: string;
    }
    const [products, setProducts] = useState<Product[]>([]);

    // get categories
    const getCategories = async () => {
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        if (error) {
            console.error(error);
            return;
        }

        setCategories(data || []);

        // Select the first category by default
        if (data && data.length > 0 && !categoryId) {
            setCategoryId(data[0].id);
        }
    };
    // ================= COMPUTED SEARCH, FILTER, AND PAGINATION VALUES =================
    const filteredProducts = products.filter((p) => {
        const search = searchQuery.toLowerCase();

        const matchesSearch =
            p.name.toLowerCase().includes(search) ||
            (p.tag ?? "").toLowerCase().includes(search);

        const matchesCategory =
            filterCategory === "All" ||
            p.categories?.name === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Slice array strictly for the calculated view matrix segment
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProductsPage = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    const updateContactStatus = async (
        id: string,
        status: "new" | "read" | "replied" | "archived"
    ) => {
        const { error } = await supabase
            .from("contact_messages")
            .update({ status })
            .eq("id", id);

        if (error) {
            console.error("Failed to update contact:", error);
            return;
        }

        setContactMessages((current) =>
            current.map((message) =>
                message.id === id
                    ? { ...message, status }
                    : message
            )
        );

        setSelectedContact((current: { id: string; }) =>
            current?.id === id
                ? { ...current, status }
                : current
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col min-h-screen bg-[#0d0d0c]">
                <Header />
                <div className="flex-1 flex items-center justify-center text-[#f4efe6] px-4 pt-24 pb-12">
                    <div className="w-full max-w-md border border-[#3a352a]/40 bg-[#141311] p-8 text-center rounded-none shadow-xl">
                        <p className="font-serif text-xs tracking-[0.25em] text-[#c5a880] uppercase mb-1">Maison Lira</p>
                        <h1 className="font-serif text-2xl tracking-wider mb-6">Atelier Vault Gate</h1>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#1c1a17] border-[#3a352a] text-[#f4efe6] rounded-none text-center tracking-widest placeholder-[#6e6555] focus-visible:ring-[#c5a880]"

                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#1c1a17] border-[#3a352a] text-[#f4efe6] rounded-none text-center tracking-widest placeholder-[#6e6555] focus-visible:ring-[#c5a880]"

                            />
                            {authError && <p className="text-red-400 text-xs italic font-serif">{authError}</p>}
                            <Button type="submit" className="w-full bg-[#c5a880] text-[#0d0d0c] rounded-none hover:bg-[#b0936b] tracking-widest font-serif text-xs uppercase">
                                Unlock Terminal
                            </Button>
                        </form>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0d0d0c] text-[#f4efe6]">
            <Header />

            <div className="flex-1 max-w-8xl w-full mx-auto px-6 pt-28 pb-16 flex flex-col md:flex-row gap-8">

                {/* ATELIER SIDEBAR OPTION NODE */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <div className="p-4 border border-[#22201c] bg-[#141311] mb-2">
                        <p className="font-serif text-[#c5a880] tracking-wide text-sm">Maison Console</p>
                        <p className="text-[10px] text-[#a8a296] font-mono uppercase mt-0.5">Control Panel v2.6</p>
                    </div>

                    <button
                        onClick={() => setActiveTab("showroom")}
                        className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest transition-all rounded-none border font-mono ${activeTab === "showroom"
                            ? "bg-[#c5a880] text-[#0d0d0c] border-[#c5a880]"
                            : "bg-[#141311] text-[#a8a296] border-[#22201c] hover:border-[#3a352a] hover:text-[#f4efe6]"
                            }`}
                    >
                        ✦ Showroom Control
                    </button>

                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest transition-all rounded-none border font-mono ${activeTab === "orders"
                            ? "bg-[#c5a880] text-[#0d0d0c] border-[#c5a880]"
                            : "bg-[#141311] text-[#a8a296] border-[#22201c] hover:border-[#3a352a] hover:text-[#f4efe6]"
                            }`}
                    >
                        ✦ Order Ledgers
                    </button>

                    <button
                        onClick={() => setActiveTab("carts")}
                        className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest transition-all rounded-none border font-mono ${activeTab === "carts"
                            ? "bg-[#c5a880] text-[#0d0d0c] border-[#c5a880]"
                            : "bg-[#141311] text-[#a8a296] border-[#22201c] hover:border-[#3a352a] hover:text-[#f4efe6]"
                            }`}
                    >
                        ✦ Cart Intelligence
                    </button>
                    <button
                        onClick={() => setActiveTab("contact")}
                        className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest transition-all rounded-none border font-mono ${activeTab === "contact"
                            ? "bg-[#c5a880] text-[#0d0d0c] border-[#c5a880]"
                            : "bg-[#141311] text-[#a8a296] border-[#22201c] hover:border-[#3a352a] hover:text-[#f4efe6]"
                            }`}
                    >
                        ✦ Contact Messages

                        {contactMessages.filter(
                            (message) => message.status === "new"
                        ).length > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 bg-[#0d0d0c] text-[#c5a880] text-[9px]">
                                    {
                                        contactMessages.filter(
                                            (message) => message.status === "new"
                                        ).length
                                    }
                                </span>
                            )}
                    </button>

                    <div className="mt-auto pt-6">
                        <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="w-full border-[#3a352a] text-[#a8a296] hover:bg-[#1c1a17] hover:text-red-400 rounded-none text-xs tracking-wider uppercase font-mono">
                            Lock Terminal
                        </Button>
                    </div>
                </aside>

                {/* DYNAMIC WORKSPACE COMPONENT */}
                <main className="flex-1 min-w-0 space-y-6">

                    {/* TAB AREA 1: SHOWROOM MANAGER WITH SEARCH/FILTER/PAGINATION */}
                    {activeTab === "showroom" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Add New Artifact Form */}
                            <Card className="bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none h-fit">
                                <CardHeader>
                                    <CardTitle className="font-serif text-lg text-[#c5a880]">Forge New Specimen</CardTitle>
                                    <CardDescription className="text-[#a8a296] text-xs">Inject items into catalog arrays.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {successMessage && (
                                        <div className="mb-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                                            <p className="text-xs text-emerald-400 font-mono">
                                                ✓ {successMessage}
                                            </p>
                                        </div>
                                    )}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();

                                            if (editingProduct) {
                                                handleUpdateProduct();
                                            } else {
                                                handleCreateProduct(e);
                                            }
                                        }}
                                        className="space-y-4"
                                    >                                          <div>
                                            <label className="text-[10px] uppercase text-[#a8a296] tracking-wider block mb-1">Item Headline</label>
                                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Aurelia Cuff" className="bg-[#1c1a17] border-[#22201c] rounded-none text-sm focus-visible:ring-[#c5a880]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase text-[#a8a296] tracking-wider block mb-1">Category</label>
                                                <select
                                                    value={categoryId}
                                                    onChange={(e) => setCategoryId(e.target.value)}
                                                    className="w-full h-9 bg-[#1c1a17] border border-[#22201c] text-xs text-[#f4efe6] px-2"
                                                >
                                                    {categories.map((category) => (
                                                        <option
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase text-[#a8a296] tracking-wider block mb-1">Price (USD)</label>
                                                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1850" className="bg-[#1c1a17] border-[#22201c] rounded-none text-sm focus-visible:ring-[#c5a880]" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-[#a8a296] tracking-wider block mb-1">Product Image</label>

                                            <input
                                                id="product-image-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];

                                                    if (!file) return;

                                                    setImageFile(file);
                                                    setPreview(URL.createObjectURL(file));
                                                }}
                                            />

                                            {preview && (
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="mt-3 w-32 h-32 object-cover rounded border"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-[#a8a296] tracking-wider block mb-1">Curated Flag Tag</label>
                                            <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g., Limited" className="bg-[#1c1a17] border-[#22201c] rounded-none text-sm focus-visible:ring-[#c5a880]" />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isCreating}
                                            className="w-full bg-[#c5a880] text-[#0d0d0c] rounded-none hover:bg-[#b0936b] disabled:opacity-50"
                                        >
                                            {isCreating
                                                ? editingProduct
                                                    ? "Saving Changes..."
                                                    : "Adding Product..."
                                                : editingProduct
                                                    ? "Save Changes"
                                                    : "Forge Specimen"}
                                        </Button>
                                        {editingProduct && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingProduct(null);
                                                    setName("");
                                                    setPrice("");
                                                    setCategoryId("");
                                                    setTag("");
                                                    setPreview("");
                                                    setImageFile(null);

                                                    const fileInput = document.getElementById(
                                                        "product-image-input"
                                                    ) as HTMLInputElement | null;

                                                    if (fileInput) {
                                                        fileInput.value = "";
                                                    }
                                                }}
                                                className="w-full border-[#3a352a] text-[#a8a296] rounded-none hover:bg-[#1c1a17]"
                                            >
                                                Cancel Edit
                                            </Button>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Showroom Data Table Output */}
                            <Card className="lg:col-span-2 bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none flex flex-col">
                                <CardHeader className="pb-4">
                                    <CardTitle className="font-serif text-lg text-[#c5a880]">Active Catalog Matrix</CardTitle>

                                    {/* Dynamic Control Deck for Filtering and Real-Time Searching */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                        <div className="sm:col-span-2">
                                            <Input
                                                placeholder="Search specimens by name..."
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setCurrentPage(1); // Reset page balance point
                                                }}
                                                className="bg-[#1c1a17] border-[#22201c] rounded-none text-xs focus-visible:ring-[#c5a880]"
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={filterCategory}
                                                onChange={(e) => {
                                                    setFilterCategory(e.target.value);
                                                    setCurrentPage(1); // Reset page balance point
                                                }}
                                                className="w-full h-9 bg-[#1c1a17] border border-[#22201c] text-xs text-[#f4efe6] px-2 focus:outline-none"
                                            >
                                                <option value="All">All Categories</option>
                                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="border-b border-[#22201c]">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Item Details</TableHead>
                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Category</TableHead>
                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Name</TableHead>
                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Price</TableHead>
                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Badge</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentProductsPage.map((p) => (
                                                    <TableRow key={p.id} className="border-b border-[#22201c]/40 hover:bg-[#1c1a17]/40">
                                                        <TableCell>
                                                            <img
                                                                src={p.image}
                                                                alt={p.name}
                                                                className="w-16 h-16 object-cover rounded"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = "/placeholder.png";
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-[10px] tracking-wide uppercase font-mono text-[#a8a296]">{p.categories?.name}</TableCell>
                                                        <TableCell className="text-[10px] tracking-wide uppercase font-mono text-[#a8a296]">{p.name}</TableCell>
                                                        <TableCell className="font-serif text-xs text-[#c5a880]">${p.price.toLocaleString()}</TableCell>

                                                        <TableCell>
                                                            {p.tag ? <Badge className="bg-[#3a352a]/50 text-[#c5a880] border border-[#c5a880]/30 rounded-none text-[9px] font-mono uppercase">{p.tag}</Badge> : <span className="text-[10px] text-[#5c564c] font-mono">Standard</span>}
                                                        </TableCell>
                                                        <TableCell> <Button
                                                            className="m-2"
                                                            onClick={() => handleEdit(p)}>
                                                            Edit
                                                        </Button>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => deleteProduct(p.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </TableCell>

                                                    </TableRow>
                                                ))}
                                                {currentProductsPage.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-xs italic text-[#6e6555] font-serif">
                                                            No items match your active search patterns.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* ================= PAGINATION CONTROL INTERFACE ================= */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between border-t border-[#22201c] pt-4 mt-6">
                                            <p className="text-[11px] font-mono text-[#a8a296]">
                                                Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} Specimens
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={currentPage === 1}
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    className="border-[#22201c] text-[#a8a296] hover:bg-[#1c1a17] hover:text-[#c5a880] rounded-none h-8 text-[11px] font-mono uppercase"
                                                >
                                                    ◀ Prev
                                                </Button>
                                                <div className="flex items-center px-3 text-xs font-mono text-[#c5a880]">
                                                    {currentPage} / {totalPages}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    className="border-[#22201c] text-[#a8a296] hover:bg-[#1c1a17] hover:text-[#c5a880] rounded-none h-8 text-[11px] font-mono uppercase"
                                                >
                                                    Next ▶
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* TAB AREA 2: ORDER MANAGEMENT SYSTEM */}
                    {activeTab === "orders" && (
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                            <Card className="xl:col-span-3 bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none">
                                <CardHeader>
                                    <CardTitle className="font-serif text-lg text-[#c5a880]">Maison Orders Ledger</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader className="border-b border-[#22201c]">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Order ID</TableHead>
                                                <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Patron Name</TableHead>
                                                <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Valuation</TableHead>
                                                <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Fulfillment</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow
                                                    key={order.id}
                                                    onClick={() => setSelectedOrder(order)}
                                                    className={`border-b border-[#22201c]/40 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? "bg-[#1c1a17]" : "hover:bg-[#1c1a17]/40"
                                                        }`}
                                                >
                                                    <TableCell className="font-mono text-xs text-[#c5a880]">{order.id}</TableCell>
                                                    <TableCell className="font-medium text-xs">{order.customer_name}</TableCell>
                                                    <TableCell className="font-serif text-xs">${order.total.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <Badge className={`rounded-none font-mono text-[9px] uppercase ${order.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                                            }`}>{order.status}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card className="xl:col-span-2 bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none h-fit">
                                {selectedOrder ? (
                                    <>
                                        <CardHeader className="border-b border-[#22201c]/60 pb-4">
                                            <div className="flex items-center justify-between">
                                                <p className="font-mono text-xs text-[#c5a880]">{selectedOrder.id}</p>
                                                <span className="text-[10px] text-[#a8a296] font-mono">{selectedOrder.date}</span>
                                            </div>
                                            <CardTitle className="font-serif text-lg text-[#f4efe6] mt-2">Patron Architectural Dossier</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-5 space-y-6 text-xs">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">Identity Specs</h4>
                                                <div className="bg-[#0d0d0c] p-3 border border-[#22201c]/80 space-y-2">
                                                    <p><span className="text-[#a8a296] font-mono">Profile Name:</span> {selectedOrder.customer_name}</p>
                                                    <p><span className="text-[#a8a296] font-mono">Secure Email:</span> {selectedOrder.customer_email}</p>
                                                    <p><span className="text-[#a8a296] font-mono">Secure Phone:</span> {selectedOrder.customer_phone}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">Logistics Node</h4>
                                                <div className="bg-[#0d0d0c] p-3 border border-[#22201c]/80">
                                                    <p className="leading-relaxed"><span className="text-[#a8a296] font-mono">Destination:</span> {selectedOrder.shipping_address}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">Vault Line Manifest</h4>
                                                <div className="divide-y divide-[#22201c]/60">
                                                    {selectedOrder.order_items?.map((item: any) => (
                                                        <div key={`${item.product_id}-${item.quantity}`} className="py-2.5 flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium">{item.name}</p>
                                                                <p className="text-[10px] text-[#a8a296] font-mono">Qty: {item.qty}</p>
                                                            </div>
                                                            <span className="font-serif text-[#c5a880]">${item.price.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-[#22201c] flex justify-between items-center">
                                                <span className="font-mono text-[10px] uppercase tracking-wider text-[#a8a296]">Total Staged Value</span>
                                                <span className="font-serif text-xl text-[#c5a880]">${selectedOrder.total.toLocaleString()}</span>
                                            </div>
                                        </CardContent>
                                    </>
                                ) : (
                                    <div className="p-8 text-center font-serif text-xs italic text-[#6e6555]">
                                        Select an order signature to display identity manifests.
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* TAB AREA 3: LIVE CARTS TELEMETRY */}
                    {activeTab === "carts" && (
                        <Card className="bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none">
                            <CardHeader>
                                <CardTitle className="font-serif text-lg text-[#c5a880]">Live Cart Tracking Matrix</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader className="border-b border-[#22201c]">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Cart Handle</TableHead>
                                            <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Patron</TableHead>
                                            <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Staged Pieces</TableHead>
                                            <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Total Value</TableHead>
                                            <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">Live Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {carts.map((cart) => (
                                            <TableRow key={cart.id} className="border-b border-[#22201c]/40 hover:bg-[#1c1a17]/40">
                                                <TableCell className="font-mono text-[#c5a880] text-xs">{cart.id}</TableCell>
                                                <TableCell className="font-medium text-xs">{cart.user}</TableCell>
                                                <TableCell className="text-xs text-[#a8a296] max-w-xs truncate">{cart.items.join(", ")} ({cart.itemsCount})</TableCell>
                                                <TableCell className="font-serif text-xs text-[#c5a880]">${cart.total.toLocaleString()}</TableCell>

                                                <TableCell>
                                                    <Badge className={`rounded-none font-mono text-[9px] uppercase ${cart.status === 'Active Checkout' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                                                        cart.status === 'Abandoned' ? 'bg-rose-950 text-rose-400 border border-rose-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-700/50'
                                                        }`}>{cart.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                    {/* ============================================================
    TAB AREA 4: CONTACT MESSAGES
============================================================ */}

                    {activeTab === "contact" && (
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                            {/* ====================================================
            MESSAGE LIST
        ==================================================== */}

                            <Card className="xl:col-span-3 bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none">

                                <CardHeader className="border-b border-[#22201c]">

                                    <div className="flex items-center justify-between">

                                        <div>
                                            <CardTitle className="font-serif text-lg text-[#c5a880]">
                                                Maison Correspondence
                                            </CardTitle>

                                            <CardDescription className="text-[#a8a296] text-xs mt-1">
                                                Client inquiries received through the concierge.
                                            </CardDescription>
                                        </div>

                                        <Badge className="rounded-none bg-[#3a352a]/40 text-[#c5a880] border border-[#c5a880]/30 font-mono text-[9px] uppercase">
                                            {
                                                contactMessages.filter(
                                                    (m) => m.status === "new"
                                                ).length
                                            } New
                                        </Badge>

                                    </div>


                                    {/* SEARCH + FILTER */}

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

                                        <div className="sm:col-span-2">

                                            <Input
                                                value={contactSearch}
                                                onChange={(e) =>
                                                    setContactSearch(e.target.value)
                                                }
                                                placeholder="Search client, email or subject..."
                                                className="bg-[#1c1a17] border-[#22201c] rounded-none text-xs focus-visible:ring-[#c5a880]"
                                            />

                                        </div>


                                        <select
                                            value={contactStatus}
                                            onChange={(e) =>
                                                setContactStatus(e.target.value)
                                            }
                                            className="w-full h-9 bg-[#1c1a17] border border-[#22201c] text-xs text-[#f4efe6] px-2 focus:outline-none"
                                        >
                                            <option value="all">
                                                All Messages
                                            </option>

                                            <option value="new">
                                                New
                                            </option>

                                            <option value="read">
                                                Read
                                            </option>

                                            <option value="replied">
                                                Replied
                                            </option>

                                            <option value="archived">
                                                Archived
                                            </option>
                                        </select>

                                    </div>

                                </CardHeader>


                                <CardContent className="p-0">

                                    <div className="overflow-x-auto">

                                        <Table>

                                            <TableHeader className="border-b border-[#22201c]">

                                                <TableRow className="hover:bg-transparent border-none">

                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">
                                                        Client
                                                    </TableHead>

                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">
                                                        Subject
                                                    </TableHead>

                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">
                                                        Status
                                                    </TableHead>

                                                    <TableHead className="text-[#a8a296] uppercase text-[10px] tracking-wider">
                                                        Date
                                                    </TableHead>

                                                </TableRow>

                                            </TableHeader>


                                            <TableBody>

                                                {contactMessages
                                                    .filter((message) => {

                                                        const search =
                                                            contactSearch.toLowerCase();

                                                        const matchesSearch =
                                                            message.name
                                                                ?.toLowerCase()
                                                                .includes(search) ||
                                                            message.email
                                                                ?.toLowerCase()
                                                                .includes(search) ||
                                                            message.subject
                                                                ?.toLowerCase()
                                                                .includes(search);

                                                        const matchesStatus =
                                                            contactStatus === "all" ||
                                                            message.status === contactStatus;

                                                        return (
                                                            matchesSearch &&
                                                            matchesStatus
                                                        );
                                                    })
                                                    .map((message) => (

                                                        <TableRow
                                                            key={message.id}
                                                            onClick={() => {
                                                                setSelectedContact(message);

                                                                if (
                                                                    message.status === "new"
                                                                ) {
                                                                    updateContactStatus(
                                                                        message.id,
                                                                        "read"
                                                                    );
                                                                }
                                                            }}
                                                            className={`border-b border-[#22201c]/40 cursor-pointer transition-colors ${selectedContact?.id === message.id
                                                                ? "bg-[#1c1a17]"
                                                                : "hover:bg-[#1c1a17]/40"
                                                                }`}
                                                        >

                                                            <TableCell>

                                                                <div className="flex items-center gap-3">

                                                                    <div className="w-9 h-9 flex items-center justify-center border border-[#c5a880]/30 text-[#c5a880] font-serif">
                                                                        {message.name
                                                                            ?.charAt(0)
                                                                            ?.toUpperCase()}
                                                                    </div>

                                                                    <div>

                                                                        <p className="text-xs font-medium">
                                                                            {message.name}
                                                                        </p>

                                                                        <p className="text-[10px] text-[#a8a296] mt-1">
                                                                            {message.email}
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            </TableCell>


                                                            <TableCell>

                                                                <p className="text-xs">
                                                                    {message.subject ||
                                                                        "No Subject"}
                                                                </p>

                                                                <p className="text-[10px] text-[#6e6555] mt-1 max-w-[220px] truncate">
                                                                    {message.message}
                                                                </p>

                                                            </TableCell>


                                                            <TableCell>

                                                                <Badge
                                                                    className={`rounded-none font-mono text-[9px] uppercase ${message.status === "new"
                                                                        ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                                                                        : message.status === "read"
                                                                            ? "bg-blue-950 text-blue-400 border border-blue-500/30"
                                                                            : message.status === "replied"
                                                                                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                                                                : "bg-zinc-900 text-zinc-400 border border-zinc-700/50"
                                                                        }`}
                                                                >
                                                                    {message.status}
                                                                </Badge>

                                                            </TableCell>


                                                            <TableCell>

                                                                <span className="text-[10px] text-[#a8a296] font-mono">
                                                                    {new Date(
                                                                        message.created_at
                                                                    ).toLocaleDateString()}
                                                                </span>

                                                            </TableCell>

                                                        </TableRow>

                                                    ))}


                                                {contactMessages.length === 0 && (

                                                    <TableRow>

                                                        <TableCell
                                                            colSpan={4}
                                                            className="text-center py-16 text-xs italic text-[#6e6555] font-serif"
                                                        >
                                                            No correspondence has been received.
                                                        </TableCell>

                                                    </TableRow>

                                                )}

                                            </TableBody>

                                        </Table>

                                    </div>

                                </CardContent>

                            </Card>


                            {/* ====================================================
            MESSAGE DETAIL
        ==================================================== */}

                            <Card className="xl:col-span-2 bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none h-fit">

                                {selectedContact ? (

                                    <>

                                        <CardHeader className="border-b border-[#22201c]/60">

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#c5a880]">
                                                        Correspondence
                                                    </p>

                                                    <CardTitle className="font-serif text-xl mt-2">
                                                        {selectedContact.subject ||
                                                            "No Subject"}
                                                    </CardTitle>

                                                </div>

                                                <Badge
                                                    className={`rounded-none font-mono text-[9px] uppercase ${selectedContact.status === "new"
                                                        ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                                                        : selectedContact.status === "replied"
                                                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                                            : "bg-zinc-900 text-zinc-400 border border-zinc-700/50"
                                                        }`}
                                                >
                                                    {selectedContact.status}
                                                </Badge>

                                            </div>

                                        </CardHeader>


                                        <CardContent className="pt-5 space-y-6">

                                            {/* CLIENT */}

                                            <div>

                                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880] mb-3">
                                                    Client Identity
                                                </h4>

                                                <div className="bg-[#0d0d0c] border border-[#22201c]/80 p-4 space-y-2">

                                                    <p className="text-xs">
                                                        <span className="text-[#a8a296] font-mono">
                                                            Name:
                                                        </span>{" "}
                                                        {selectedContact.name}
                                                    </p>

                                                    <p className="text-xs">
                                                        <span className="text-[#a8a296] font-mono">
                                                            Email:
                                                        </span>{" "}
                                                        <a
                                                            href={`mailto:${selectedContact.email}`}
                                                            className="text-[#c5a880] hover:underline"
                                                        >
                                                            {selectedContact.email}
                                                        </a>
                                                    </p>

                                                    <p className="text-xs">
                                                        <span className="text-[#a8a296] font-mono">
                                                            Received:
                                                        </span>{" "}
                                                        {new Date(
                                                            selectedContact.created_at
                                                        ).toLocaleString()}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* MESSAGE */}

                                            <div>

                                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880] mb-3">
                                                    Message
                                                </h4>

                                                <div className="bg-[#0d0d0c] border border-[#22201c]/80 p-5">

                                                    <p className="text-xs leading-7 text-[#d6d0c6] whitespace-pre-wrap">
                                                        {selectedContact.message}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* ACTIONS */}

                                            <div className="space-y-3">

                                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">
                                                    Correspondence Actions
                                                </h4>


                                                <div className="grid grid-cols-2 gap-2">

                                                    {selectedContact.status !== "read" && (
                                                        <Button
                                                            onClick={() =>
                                                                updateContactStatus(
                                                                    selectedContact.id,
                                                                    "read"
                                                                )
                                                            }
                                                            className="bg-[#c5a880] text-[#0d0d0c] rounded-none hover:bg-[#b0936b] text-[10px] uppercase tracking-wider"
                                                        >
                                                            Mark Read
                                                        </Button>
                                                    )}


                                                    <Button
                                                        onClick={() =>
                                                            updateContactStatus(
                                                                selectedContact.id,
                                                                "replied"
                                                            )
                                                        }
                                                        className="bg-[#1c1a17] border border-[#3a352a] text-[#c5a880] rounded-none hover:bg-[#22201c] text-[10px] uppercase tracking-wider"
                                                    >
                                                        Mark Replied
                                                    </Button>


                                                    <a
                                                        href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject ||
                                                            "Your inquiry to Maison Lira"
                                                            }`}
                                                        className="flex items-center justify-center bg-[#1c1a17] border border-[#3a352a] text-[#a8a296] hover:text-[#c5a880] hover:border-[#c5a880] py-2 px-3 text-[10px] uppercase tracking-wider transition-colors"
                                                    >
                                                        Reply by Email
                                                    </a>


                                                    <Button
                                                        onClick={() =>
                                                            updateContactStatus(
                                                                selectedContact.id,
                                                                "archived"
                                                            )
                                                        }
                                                        variant="outline"
                                                        className="border-[#3a352a] text-[#a8a296] hover:bg-[#1c1a17] hover:text-[#c5a880] rounded-none text-[10px] uppercase tracking-wider"
                                                    >
                                                        Archive
                                                    </Button>

                                                </div>

                                            </div>

                                        </CardContent>

                                    </>

                                ) : (

                                    <div className="p-10 text-center">

                                        <p className="font-serif text-sm italic text-[#6e6555]">
                                            Select a correspondence to display its dossier.
                                        </p>

                                    </div>

                                )}

                            </Card>

                        </div>
                    )}

                </main>
            </div>

        </div>
    );
}