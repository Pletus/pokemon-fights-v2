import React, { useState, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import Cards from "./Cards";

function Main() {
  const [showH2, setShowH2] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  return (
    <>
      <section className="background-image flex items-start justify-start overflow-x-hidden">
        <div className="px-8 md:px-12 lg:px-24 pt-20 md:pt-32 lg:pt-40 text-left max-w-3xl">

          {/* H1 animado */}
          <TypeAnimation
            sequence={[
              "Find all your favorite Pokémon",
              () => {
                // H1 terminó, ocultamos su cursor y mostramos H2
                setCursorVisible(false);
                setTimeout(() => setShowH2(true), 100); // ligero delay antes de H2
              },
            ]}
            wrapper="h1"
            cursor={cursorVisible}
            repeat={0}
            className="hero-title text-5xl md:text-6xl lg:text-7xl"
          />

          {/* H2 animado, aparece solo después de H1 */}
          {showH2 && (
            <TypeAnimation
              sequence={["Discover types, strengths, weaknesses, and abilities!"]}
              wrapper="h2"
              cursor={true} // cursor visible durante H2
              repeat={0}
              className="hero-subtitle text-lg md:text-2xl mt-6"
            />
          )}

        </div>
      </section>
    </>
  );
}

export default Main;
