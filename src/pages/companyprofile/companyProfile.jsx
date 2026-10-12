import React from "react";
import HeroImage from "../../assets/images/compro.png";
import CompanyProfilePDF from "../../assets/PDF/bolde-compro.pdf";

const CompanyProfile = () => {
    return (
    <div
      className="
      w-full
      max-w-[1400px]
      mx-auto

      px-4          /* HP */
      sm:px-4       /* tablet */
      lg:px-4       /* laptop */
      xl:px-4       /* desktop besar */
      2xl:px-4      /* layar besar */
    "
    >

            {/* HERO SECTION */}
<div className="max-w-[1200px] mx-auto px-0 sm:px-4 pt-6 sm:pt-8">
                <div
    className="
      relative
      h-[240px] sm:h-[320px] lg:h-[380px]
      rounded-2xl
      overflow-hidden
      bg-center bg-cover
    "
                        style={{ backgroundImage: `url(${HeroImage})` }}
                >
 {/* SHADOW */}
    <div className="absolute inset-0 bg-overlay z-[1]" />
    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/80 to-transparent z-[2]" />

    {/* CONTENT */}
    <div
      className="
        absolute bottom-6 sm:bottom-10
        left-4 right-4 sm:left-10 sm:right-10
        z-[3]
      "
    >
      <div
        className="
          flex flex-col sm:flex-row
          sm:items-end
          sm:justify-between
          gap-4
        "
      >
        {/* TITLE */}
        <h1
          className="
            text-xl sm:text-3xl lg:text-4xl
            font-bold
            leading-snug
            uppercase
            max-w-[650px]
            text-white
          "
        >                                Innovating The Life <br />
                                With World-Class Products
                            </h1>

                            {/* VIEW PDF */}
       {/* VIEW PDF */}
        <a
          href={CompanyProfilePDF}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex-shrink-0
            bg-[#143b6b] hover:bg-brand-first
            px-8 py-3
            rounded-full
            text-sm font-semibold
            shadow-lg
            inline-flex justify-center items-center
            w-full sm:w-auto
            text-surface-background
          "
        >                                View PDF
                            </a>

                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-[1200px] mx-auto px-4 py-14">

                {/* ABOUT US */}
                <section className="mb-14">
                    <h2 className="text-2xl font-bold mb-6">ABOUT US</h2>

                    <p className="text-sm text-text-primary mb-5 text-justify">
                        PT Bolde Inovasi Global is a subsidiary of PT Bolde Indonesia,
                        established in 2005, is a prominent player in the home appliance
                        industry. We dedicated to specializing in and distributing
                        cutting-edge and user-friendly home appliance products widely
                        recognized under the brand name “BOLDE”, “ROCKKY”, “Kitchenmaster”,
                        “Organic Green” and “Sundbaby”.
                    </p>

                    <p className="text-sm text-text-primary mb-5 text-justify">
                        Our product line covers a five main of categories, including Mops,
                        Cookware, Electronics Appliances, Utensils and Others. Driven by a
                        culture of innovation and environmental awareness, we committed to
                        producing top-notch home appliance solutions. Our products not only
                        streamline daily tasks but also promote a greener, more eco-friendly
                        lifestyle. Additionally, Bolde is committed to attaining world-class
                        company recognition.
                    </p>

                    <p className="text-sm text-text-primary text-justify">
                        With a strong and growing national presence, we proudly operate more
                        than 1.300 outlets, 63 official brand stores, and 45 service center
                        across Indonesia. In addition to our core operations in Tangerang
                        and Jakarta, our distribution capabilities are further enhanced
                        through strategically positioned branch depots in seven major cities:
                        Bandung, Semarang, Surabaya, Makassar, Samarinda, Palembang and Medan,
                        enabling us to deliver consistent service and support throughout the
                        country.
                    </p>
                </section>

                {/* PRODUCT */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">PRODUCT</h2>

                    <p className="text-sm text-text-primary mb-5 text-justify">
                        We offers a comprehensive range of household products across five
                        major categories. Our mop product segment comprises 35 SKUs, widely
                        recognized under the BOLDe Super Mop brand, which has become a
                        trusted name in many Indonesian households. In the cookware
                        category, we offer 75 SKUs marketed under popular brands such as
                        BOLDe Super Pan and Organic Green, known for their innovation and
                        durability.
                    </p>

                    <p className="text-sm text-text-primary mb-5 text-justify">
                        Our home electronics line features 77 SKUs, developed under
                        distinguished brands including BOLDe Super Blend, Super Mix,
                        Super Hoover, and Super Pan, reflecting our commitment to modern,
                        high-performing appliances. We also provide a wide range of kitchen
                        utensils, totaling 81 SKUs, under established labels such as BOLDe
                        Super Utensils and Super Knife, which are widely embraced by the
                        market.
                    </p>

                    <p className="text-sm text-text-primary text-justify">
                        In addition, we continue to expand our product portfolio with
                        lifestyle and home accessories, including items like the BOLDe
                        Super Bottle and the BOLDe Meal Box (Harry Potter Edition),
                        offering convenience and style for everyday use.
                    </p>
                </section>

                {/* SPACER */}
                <div className="h-20" />
            </div>
        </div>
    );
};

export default CompanyProfile;
