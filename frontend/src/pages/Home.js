import React from 'react';

const Home = () => {
  return (
    <section className="relative min-w-[30rem]" id="dashboard">
      <div className="bg-primary-400 z-0 w-full h-full absolute top-1 left-0 rounded-lg"></div>
      <div className="p-6 bg-white rounded-lg divide-y relative z-20">
        <h3 className="text-xl font-semibold pb-4">
          Dashboard Administratif Dosen
        </h3>
        <p className="pt-4">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard dummy text
          ever since the 1500s, when an unknown printer took a galley of type
          and scrambled it to make a type specimen book. It has survived not
          only five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged.
        </p>
      </div>
    </section>
  );
};

export default Home;
