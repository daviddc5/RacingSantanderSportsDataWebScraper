import React from "react";
import "./History.css";

const History = () => {
  return (
    <section className="history-page">
      <div className="container">
        <h2>A LEGACY IN GREEN AND WHITE</h2>
        <div className="history-grid">
          <div className="history-text">
            <h3>The Founding Years</h3>
            <p>
              Real Racing Club de Santander was founded on 14 June 1913. Its
              first match was a local derby, a sign of the passionate support
              that would define the club for over a century. The "Real" (Royal)
              title was granted by King Alfonso XIII in 1914, solidifying its
              prestigious status early in its existence.
            </p>

            <h3>Founders of La Liga</h3>
            <p>
              Racing de Santander holds a special place in Spanish football
              history as one of the ten founding clubs of La Liga in 1929. The
              team finished the inaugural season in last place but avoided
              relegation by winning a playoff, a dramatic start to their
              top-flight journey. The early decades saw them competing with the
              giants of Spanish football.
            </p>
          </div>
          <div className="history-image">
            <img
              src="/images/racing1929.jpg"
              alt="Vintage Racing de Santander team"
            />
            <figcaption>The 1929 founding squad.</figcaption>
          </div>
          <div className="history-image">
            <img
              src="/images/racingSantanderOldStadium.jpg"
              alt="Old photo of the stadium"
            />
            <figcaption>The old Campos de Sport de El Sardinero.</figcaption>
          </div>
          <div className="history-text">
            <h3>European Adventures</h3>
            <p>
              One of the most glorious periods came in the 2007-08 season under
              manager Marcelino García Toral. The team finished 6th in La Liga,
              their best-ever finish, qualifying for the UEFA Cup for the first
              time in their history. The subsequent European campaign, where
              they faced teams like Manchester City and Paris Saint-Germain, is
              remembered fondly by all fans as a testament to the club's
              potential.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default History;
