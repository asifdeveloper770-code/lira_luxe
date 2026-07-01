import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { SectionLabel } from "@/components/Reveal";


export default function CheckoutPage() {
    const { cart } = useCart();

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        zip: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const continueToPayment = () => {
        localStorage.setItem(
            "checkout",
            JSON.stringify(form)
        );

        alert(
            "Next step will redirect to Stripe."
        );
    };

    return (
        <div className="container-luxe pt-32 pb-20">
            <div className="text-center">
                <SectionLabel>
                    Votre Bag
                </SectionLabel>

                <h1 className="mt-6 font-serif text-5xl md:text-6xl">
                    Checkout{" "}

                </h1>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mt-10">
                <div className="space-y-4 max-w-2xl mx-auto p-4">
                    {/* Row 1: Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <SectionLabel>Name</SectionLabel>
                            <input
                                type="text"
                                name="name"
                                // value={formData.name || ''}
                                placeholder="Full Name"
                                onChange={handleChange}
                                className="w-full border p-3 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors duration-200"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <SectionLabel>Email</SectionLabel>
                            <input
                                type="email"
                                name="email"
                                // value={formData.email || ''}
                                placeholder="Email Address"
                                onChange={handleChange}
                                className="w-full border p-3 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors duration-200"
                            />
                        </div>
                    </div>

                    {/* Row 2: Phone */}
                    <div className="flex flex-col gap-1.5">
                        <SectionLabel>Phone</SectionLabel>
                        <input
                            type="tel"
                            name="phone"
                            //   value={formData.phone || ''}
                            placeholder="Phone Number"
                            onChange={handleChange}
                            className="w-full border p-3 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors duration-200"
                        />
                    </div>

                    {/* Row 3: Full Address */}
                    <div className="flex flex-col gap-1.5">
                        <SectionLabel>Address</SectionLabel>
                        <input
                            type="text"
                            name="address"
                            //   value={formData.address || ''}
                            placeholder="Street Address, Apartment, Suite"
                            onChange={handleChange}
                            className="w-full border p-3 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors duration-200"
                        />
                    </div>

                    {/* Row 4: City, Country, and ZIP */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <SectionLabel>City</SectionLabel>
                            <input
                                type="text"
                                name="city"
                                // value={formData.city || ''}
                                placeholder="City"
                                onChange={handleChange}
                                className="w-full border p-3 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors duration-200"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <SectionLabel>Country</SectionLabel>
                            <input
                                type="text"
                                name="country"
                                // value={formData.country || ''}
                                placeholder="Country"
                                onChange={handleChange}
                                className="w-full border p-3 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors duration-200"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <SectionLabel>Zip Code</SectionLabel>
                            <input
                                type="text"
                                name="zip"
                                // value={formData.zip || ''}
                                placeholder="ZIP Code"
                                onChange={handleChange}
                                className="w-full border p-3 hover:border-gold focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors duration-200"
                            />
                        </div>
                    </div>
                </div>


                <aside className="bg-card/70 border border-border p-8 h-fit">

                    <h3 className="font-serif text-2xl">
                        Order Summary
                    </h3>
                    <div className="hairline my-6" />


                    {cart.map((item) => (
                        <dl className="space-y-3 text-sm">

                            <div
                                key={item.id}
                                className="flex justify-between"
                            >
                                <dt className="text-foreground/70 text-md font-serif ">
                                    {item.name} × <span className="gradient-gold-text">{item.quantity}</span>
                                </dt>

                                <dd className="gradient-gold-text">
                                    $
                                    {(item.price * item.quantity).toFixed(2)}
                                </dd>
                            </div>
                        </dl>
                    ))}

                    <div className="hairline my-6" />

                    <div className="flex justify-between items-end">

                        <span className="text-[11px] tracking-[0.32em] uppercase text-foreground/60">Total</span>

                        <span className="font-serif text-3xl gradient-gold-text">
                            ${subtotal.toFixed(2)}
                        </span>

                    </div>

                    <button
                        onClick={continueToPayment}
                        className="btn-gold w-full mt-8"
                    >
                        Continue to Payment
                    </button>

                </aside>

            </div>

        </div>
    );
}