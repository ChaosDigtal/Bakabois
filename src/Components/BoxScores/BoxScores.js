import React, { useState, useEffect, useRef } from "react";
import Boxscore from "../Boxscore/Boxscore";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import { Carousel } from "primereact/carousel";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import axios from "axios";
import "./BoxScores.css";

function BoxScores(props) {
  const [leagueName, setLeagueName] = useState("");
  const [teams, setTeams] = useState(null);
  const [matchs, setMatchs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [value, setValue] = useState(-1);
  const [numVisible, setNumVisible] = useState(-1);
  const [playerList, setPlayerList] = useState([
    {
      "role": "QB",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "RB",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "RB",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "WR",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "WR",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "WR",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "TE",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "FLX",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "D/ST",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    },
    {
      "role": "K",
      "away": {
        "name": "Empty",
        "score": "-"
      },
      "home": {
        "name": "Empty",
        "score": "-"
      }
    }
  ]);

  if (numVisible === -1) {
    if (window.innerWidth <= 576)
      setNumVisible(1);
    else if (window.innerWidth <= 768)
      setNumVisible(2);
    else if (window.innerWidth <= 992)
      setNumVisible(3);
    else if (window.innerWidth <= 1200)
      setNumVisible(5);
    else
      setNumVisible(7);
  }

  let scoringPeriod = props.matchupPeriodId;

  const logoURL = (url) => {
    const imageExtensions = [".jpg", ".jpeg", ".gif", ".bmp", ".png", ".svg"];
    const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
    if (imageExtensions.includes(extension) === false)
      return "https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg";
    return url;
  };

  useEffect(() => {
    console.log(value);
    if(window.innerWidth <= 576 && matchs.length > 0)
      showBoxScore(matchs[value].leagueID, matchs[value].id)
  }, [value])

  useEffect(() => {
    setValue(props.value);
    var _matchs = [];
    var _leagueName = "";
    var _value;
    console.log(props.leagueID);
    axios
      .get(
        "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2023/segments/0/leagues/1446375?scoringPeriodId=" +
        scoringPeriod +
        "&view=mBoxscore&view=mMatchupScore&view=mRoster&view=mSettings&view=mStatus&view=mTeam&view=modular&view=mNav",
        {}
      )
      .then((response) => {
        let result = response["data"];
        console.log(result);
        _leagueName = result["settings"]["name"];
        var _teams = {};
        result["teams"].forEach((team) => {
          let managerName = "";
          result["members"].forEach((member) => {
            if (team["owners"] !== undefined) {
              team["owners"].forEach((owner) => {
                if (member["id"] === owner) {
                  if (managerName !== "") managerName += ", ";
                  managerName += member["firstName"] + " " + member["lastName"];
                }
              });
            }
          });
          if (managerName === "") managerName = "None";
          _teams[team["id"].toString()] = {
            name: team["name"],
            logo: logoURL(team["logo"]),
            manager: managerName,
          };
        });
        result["schedule"].forEach((match) => {
          if (match["matchupPeriodId"].toString() === props.matchupPeriodId) {
            let home_team = _teams[match["home"]["teamId"].toString()];
            let away_team = _teams[match["away"]["teamId"].toString()];
            let match_data = {
              home: {
                name: home_team["name"],
                logo: home_team["logo"],
                score: match["home"]["adjustment"],
                div: "0-0-0",
                  // match["home"]["cumulativeScore"]["wins"] +
                  // "-" +
                  // match["home"]["cumulativeScore"]["losses"] +
                  // "-" +
                  // match["home"]["cumulativeScore"]["ties"],
                manager: home_team["manager"],
              },
              away: {
                name: away_team["name"],
                logo: away_team["logo"],
                score: match["away"]["adjustment"],
                div: "0-0-0",
                  // match["away"]["cumulativeScore"]["wins"] +
                  // "-" +
                  // match["away"]["cumulativeScore"]["losses"] +
                  // "-" +
                  // match["away"]["cumulativeScore"]["ties"],
                manager: away_team["manager"],
              },
              id: match["id"].toString(),
              leagueID: 1446375,
            };
            if (
              props.leagueID === 1446375 &&
              match_data["id"] === props.matchId
            ) {
              setCurrent(match_data);
              _value = _matchs.length;
            }
            _matchs.push(match_data);
          }
        });
        axios
          .get(
            "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2023/segments/0/leagues/1869404038?scoringPeriodId=" +
            scoringPeriod +
            "&view=mBoxscore&view=mMatchupScore&view=mRoster&view=mSettings&view=mStatus&view=mTeam&view=modular&view=mNav",
            {}
          )
          .then((response) => {
            result = response["data"];
            console.log(result);
            setLeagueName(_leagueName + ", " + result["settings"]["name"]);
            _teams = {};
            result["teams"].forEach((team) => {
              let managerName = "";
              result["members"].forEach((member) => {
                if (team["owners"] !== undefined) {
                  team["owners"].forEach((owner) => {
                    if (member["id"] === owner) {
                      if (managerName !== "") managerName += ", ";
                      managerName +=
                        member["firstName"] + " " + member["lastName"];
                    }
                  });
                }
              });
              if (managerName === "") managerName = "None";
              _teams[team["id"].toString()] = {
                name: team["name"],
                logo: logoURL(team["logo"]),
                manager: managerName,
              };
            });
            setTeams(_teams);
            result["schedule"].forEach((match) => {
              if (
                match["matchupPeriodId"].toString() === props.matchupPeriodId
              ) {
                let home_team = _teams[match["home"]["teamId"].toString()];
                let away_team = _teams[match["away"]["teamId"].toString()];
                let home_div = "0-0-0";
                if (match["home"]["cumulativeScore"] !== undefined)
                  home_div =
                    match["home"]["cumulativeScore"]["wins"] +
                    "-" +
                    match["home"]["cumulativeScore"]["losses"] +
                    "-" +
                    match["home"]["cumulativeScore"]["ties"];
                let away_div = "0-0-0";
                if (match["away"]["cumulativeScore"] !== undefined)
                  away_div =
                    match["away"]["cumulativeScore"]["wins"] +
                    "-" +
                    match["away"]["cumulativeScore"]["losses"] +
                    "-" +
                    match["away"]["cumulativeScore"]["ties"];

                let match_data = {
                  home: {
                    name: home_team["name"],
                    logo: home_team["logo"],
                    score: match["home"]["adjustment"],
                    div: home_div,
                    manager: home_team["manager"],
                  },
                  away: {
                    name: away_team["name"],
                    logo: away_team["logo"],
                    score: match["away"]["adjustment"],
                    div: away_div,
                    manager: away_team["manager"],
                  },
                  id: match["id"].toString(),
                  leagueID: 1869404038,
                };
                if (
                  props.leagueID === 1869404038 &&
                  match_data["id"] === props.matchId
                ) {
                  setCurrent(match_data);
                  _value = _matchs.length;
                }
                _matchs.push(match_data);
              }
            });
            console.log(_matchs.length);
            setMatchs(_matchs);
            if (_value > _matchs.length - 7)
              _value = _matchs.length - 7;
            if (props.value === -1)
              setValue(_value);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [props]);

  const responsiveOptions = [
    {
      breakpoint: '1200px',
      numVisible: 5,
      numScroll: 1
    },
    {
      breakpoint: '992px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '576px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  const showBoxScore = (leagueID, matchId) => {
    console.log(matchId, typeof matchId);
    props.showBoxScore(leagueID, matchId, value);
  };

  const matchTemplate = (match) => {
    let currentItem = "";
    if (match["id"] === current.id && match.leagueID === props.leagueID) currentItem = " current";
    return (
      <div className="boxscores-match">
        <div
          className={"match-area" + currentItem}
          onClick={(e) => showBoxScore(match.leagueID, match.id)}
        >
          <div className="away">
            <div className="team-info">
              <div className="team-logo">
                <img src={match.away.logo} alt="" width="20px" height="20px" />
              </div>
              <div className="team-name">
                <span>{match.away.name}</span>
              </div>
            </div>
            <div className="score">
              <span>{match.away.score}</span>
            </div>
          </div>
          <div className="home">
            <div className="team-info">
              <div className="team-logo">
                <img src={match.home.logo} alt="" width="20px" height="20px" />
              </div>
              <div className="team-name">
                <span>{match.home.name}</span>
              </div>
            </div>
            <div className="score">
              <span>{match.home.score}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const awayScoreTemplate = (record) => {
    return (
      <div className="flex justify-content-between">
        <div>
          {record.away.name}
        </div>
        <div>
          {record.away.score}
        </div>
      </div>
    )
  }

  const homeScoreTemplate = (record) => {
    return (
      <div className="flex justify-content-between">
        <div>
          {record.away.score}
        </div>
        <div>
          {record.away.name}
        </div>
      </div>
    )
  }

  const roleTemplate = (record) => {
    return (
      <div className="text-center">
        {record.role}
      </div>
    )
  }

  return (
    <div className="boxscores">
      {teams !== null && (
        <>
          <div className="header-matchups">
            <div className="header">
              <div className="-logo">
                <span>NFL Week {props.matchupPeriodId}
                </span>
              </div>
              <div className="hidden sm:block league-name">
                <span>{leagueName}</span>
              </div>
            </div>
            <div className="matchups">
              <div className="card">
                <Carousel
                  value={matchs}
                  page={value}
                  onPageChange={(event) => {setValue(event.page)}}
                  numScroll={1}
                  numVisible={numVisible}
                  // responsiveOptions={responsiveOptions}
                  itemTemplate={matchTemplate}
                /></div>
            </div>
          </div>
          <div className="hidden lg:flex teams">
            <div className="boxscores-away">
              <div className="away-team">
                <div className="away-logo">
                  <Avatar image={current.away.logo} shape="circle" />
                </div>
                <div className="away-info">
                  <div className="away-name">
                    <span>{current.away.name}</span>
                  </div>
                  <div className="away-div">{current.away.div}</div>
                  <div className="away-manager">{current.away.manager}</div>
                </div>
              </div>
              <div className="away-score">{current.away.score}</div>
            </div>
            <div className="boxscores-home">
              <div className="home-score">{current.home.score}</div>
              <div className="home-team">
                <div className="home-info">
                  <div className="home-name">
                    <span>{current.home.name}</span>
                  </div>
                  <div className="home-div">{current.home.div}</div>
                  <div className="home-manager">{current.home.manager}</div>
                </div>
                <div className="home-logo">
                  <Avatar image={current.home.logo} shape="circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex boxscore-container">
            <Boxscore
              name={current.away.name}
              logo={current.away.logo}
              matchupPeriodId={props.matchupPeriodId}
            ></Boxscore>
            <Boxscore
              name={current.home.name}
              logo={current.home.logo}
              matchupPeriodId={props.matchupPeriodId}
            ></Boxscore>
          </div>
          <div className="lg:hidden block boxscore-container mobile text-sm">
            <div className="flex">
              <div className="team-header text-center" style={{"width": "50%"}}>
                <div className="">
                  <Avatar image={current.away.logo} shape="circle" />
                </div>
                <div className="surface-overlay white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{"max-width":"100%"}}>
                  {current.away.name}
                </div>
                <div className="">
                  {current.away.score}
                </div>
              </div>
              <div className="team-header text-center" style={{"width": "50%"}}>
                <div className="">
                  <Avatar image={current.home.logo} shape="circle" />
                </div>
                <div className="surface-overlay white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{"max-width":"100%"}}>
                  {current.home.name}
                </div>
                <div className="">
                  {current.home.score}
                </div>
              </div>
            </div>
            <DataTable value={playerList} selectionMode="single" showGridlines>
              <Column body={awayScoreTemplate}></Column>
              <Column body={roleTemplate} style={{ "background-color": "var(--surface-300)", "max-width": "40px" }}></Column>
              <Column body={homeScoreTemplate}></Column>
            </DataTable>
          </div>
        </>
      )}
    </div>
  );
}

export default BoxScores;
