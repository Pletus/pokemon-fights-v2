import "./App.css";
import Cards from "./Cards";

function Main() {
  return (
    <>
      <section className="background-image h-screen w-screen">
        <div className="pt-8 md:pt-40 lg:pt-40 xl:pt-40 2xl:pt-40 px-8 md:px-12 lg:px-24 lg:w-2/3">
          <h1 className="font text-6xl font-medium">
            Find all your favorite Pokemon
          </h1>
          <br />
          <p className="font text-3xl font-medium pt-4">
            You can know the type of Pokemon, its strengths, disadvantages and
            abilities
          </p>
        </div>
      </section>
      <Cards />
    </>
  );
}

export default Main;
