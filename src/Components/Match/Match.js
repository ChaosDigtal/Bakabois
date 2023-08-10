import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import "./Match.css";

function Match(props) {
  const showBoxScore = () => {
    props.showBoxScore(props.id);
  };
  return (
    <div className="match">
      <div className="teams">
        <div className="away">
          <div className="team-info">
            <div className="team-logo">
              <Avatar image={props.away.logo} size="large" shape="circle" />
            </div>
            <div className="team-name">
              <span>{props.away.name}</span>
            </div>
          </div>
          <div className="score">
            <span>{props.away.score}</span>
          </div>
        </div>
        <div className="home">
          <div className="team-info">
            <div className="team-logo">
              <Avatar image={props.home.logo} size="large" shape="circle" />
            </div>
            <div className="team-name">
              <span>{props.home.name}</span>
            </div>
          </div>
          <div className="score">
            <span>{props.home.score}</span>
          </div>
        </div>
      </div>
      <div className="tools">
        <div className="box-score">
          <Button label="Box score" text raised onClick={showBoxScore} />
        </div>
      </div>
    </div>
  );
}

export default Match;
