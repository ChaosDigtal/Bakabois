import React, { useState, useEffect, useRef } from "react";
import Boxscore from "../Boxscore/Boxscore";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Row } from 'primereact/row';
import { Avatar } from "primereact/avatar";
import { Carousel } from "primereact/carousel";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import axios from "axios";
import "./BoxScores.css";
import { ColumnGroup } from "primereact/columngroup";

function BoxScores(props) {
  const [leagueName, setLeagueName] = useState("");
  const [teams, setTeams] = useState(null);
  const [matchs, setMatchs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [value, setValue] = useState(-1);
  const [numVisible, setNumVisible] = useState(-1);
  const [playerList, setPlayerList] = useState([]);
  const [awayPlayerList, setAwayPlayerList] = useState([]);
  const [homePlayerList, setHomePlayerList] = useState([]);
  const [compareList, setCompareList] = useState([]);

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
    if (window.innerWidth <= 576 && matchs.length > 0)
      showBoxScore(matchs[value].leagueID, matchs[value].id)
  }, [value])

  useEffect(() => {
    setValue(props.value);
    var _matchs = [];
    var _leagueName = "";
    var _value;
    axios
      .get(
        "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2023/segments/0/leagues/1446375?scoringPeriodId=" +
        scoringPeriod +
        "&view=mBoxscore&view=mMatchupScore&view=mRoster&view=mSettings&view=mStatus&view=mTeam&view=modular&view=mNav",
        {}
      )
      .then((response) => {
        let result = response["data"];
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
          team["roster"]["entries"].forEach(player => {
            _teams[team["id"].toString()][player["playerId"]] = player["playerPoolEntry"]["ratings"]["0"]["positionalRanking"];
          });
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
                projs: 0.0
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
                projs: 0.0
              },
              id: match["id"].toString(),
              leagueID: 1446375,
            };
            if (
              props.leagueID === 1446375 &&
              match_data["id"] === props.matchId
            ) {
              _value = _matchs.length;

              let away_proj = 0.0, home_proj = 0.0;
              let _awayPlayerList = new Array(9);
              let cQB = 0, cRB = 0, cWR = 0, cTE = 0, cK = 0;
              let pRB = [1, 2, 6], pWR = [3, 4, 6];
              match["away"]["rosterForCurrentScoringPeriod"]["entries"].forEach(player => {
                let id = player["playerPoolEntry"]["id"];
                let fullName = player["playerPoolEntry"]["player"]["fullName"];
                let lastName = player["playerPoolEntry"]["player"]["lastName"];
                let pos = player["playerPoolEntry"]["player"]["defaultPositionId"];
                let proj = player["playerPoolEntry"]["player"]["stats"][0]["appliedTotal"];
                if (pos === 1) {
                  if (cQB === 0) {
                    cQB = 1;
                    away_proj += proj;
                    _awayPlayerList[0] = {
                      name: fullName,
                      pos: "QB",
                      prk: (away_team[id] === 0 ? "---" : away_team[id]),
                      proj: proj.toFixed(1),
                      avg: "---"
                    }
                  }
                } else if (pos === 2) {
                  for (var i = 0; i < 3; ++i) {
                    if (_awayPlayerList[pRB[i]] === undefined) {
                      away_proj += proj;
                      _awayPlayerList[pRB[i]] = {
                        name: fullName,
                        pos: "RB",
                        prk: (away_team[id] === 0 ? "---" : away_team[id]),
                        proj: proj.toFixed(1),
                        avg: "---"
                      }
                      break;
                    }
                  };
                } else if (pos === 3) {
                  for (var i = 0; i < 3; ++i) {
                    if (_awayPlayerList[pWR[i]] === undefined) {
                      away_proj += proj;
                      _awayPlayerList[pWR[i]] = {
                        name: fullName,
                        pos: "WR",
                        prk: (away_team[id] === 0 ? "---" : away_team[id]),
                        proj: proj.toFixed(1),
                        avg: "---"
                      }
                      break;
                    }
                  };
                } else if (pos === 4) {
                  if (cTE === 0) {
                    cTE = 1;
                    away_proj += proj;
                    _awayPlayerList[5] = {
                      name: fullName,
                      pos: "TE",
                      prk: (away_team[id] === 0 ? "---" : away_team[id]),
                      proj: proj.toFixed(1),
                      avg: "---"
                    }
                  }
                } else if (pos === 5) {
                  if (cK === 0) {
                    cK = 1;
                    away_proj += proj;
                    _awayPlayerList[8] = {
                      name: fullName,
                      pos: "K",
                      prk: (away_team[id] === 0 ? "---" : away_team[id]),
                      proj: proj.toFixed(1),
                      avg: "---"
                    }
                  }
                } else if (lastName === "D/ST") {
                  away_proj += proj;
                  _awayPlayerList[7] = {
                    name: fullName,
                    pos: "D/ST",
                    prk: (away_team[id] === 0 ? "---" : away_team[id]),
                    proj: proj.toFixed(1),
                    avg: "---"
                  }
                }
              });
              setAwayPlayerList(_awayPlayerList);

              let _homePlayerList = new Array(9);
              cQB = 0; cRB = 0; cWR = 0; cTE = 0; cK = 0;
              match["home"]["rosterForCurrentScoringPeriod"]["entries"].forEach(player => {
                let id = player["playerPoolEntry"]["id"];
                let fullName = player["playerPoolEntry"]["player"]["fullName"];
                let lastName = player["playerPoolEntry"]["player"]["lastName"];
                let pos = player["playerPoolEntry"]["player"]["defaultPositionId"];
                let proj = player["playerPoolEntry"]["player"]["stats"][0]["appliedTotal"];
                if (pos === 1) {
                  if (cQB === 0) {
                    cQB = 1;
                    home_proj += proj;
                    _homePlayerList[0] = {
                      name: fullName,
                      pos: "QB",
                      prk: (home_team[id] === 0 ? "---" : home_team[id]),
                      proj: proj.toFixed(1),
                      avg: "---"
                    }
                  }
                } else if (pos === 2) {
                  for (var i = 0; i < 3; ++i) {
                    if (_homePlayerList[pRB[i]] === undefined) {
                      home_proj += proj;
                      _homePlayerList[pRB[i]] = {
                        name: fullName,
                        pos: "RB",
                        prk: (home_team[id] === 0 ? "---" : home_team[id]),
                        proj: proj.toFixed(1),
                        avg: "---"
                      }
                      break;
                    }
                  };
                } else if (pos === 3) {
                  for (var i = 0; i < 3; ++i) {
                    if (_homePlayerList[pWR[i]] === undefined) {
                      home_proj += proj;
                      _homePlayerList[pWR[i]] = {
                        name: fullName,
                        pos: "WR",
                        prk: (home_team[id] === 0 ? "---" : home_team[id]),
                        proj: proj.toFixed(1),
                        avg: "---"
                      }
                      break;
                    }
                  };
                } else if (pos === 4) {
                  if (cTE === 0) {
                    cTE = 1;
                    home_proj += proj;
                    _homePlayerList[5] = {
                      name: fullName,
                      pos: "TE",
                      prk: (home_team[id] === 0 ? "---" : home_team[id]),
                      proj: proj.toFixed(1),
                      avg: "---"
                    }
                  }
                } else if (pos === 5) {
                  if (cK === 0) {
                    cK = 1;
                    home_proj += proj;
                    _homePlayerList[8] = {
                      name: fullName,
                      pos: "K",
                      prk: (home_team[id] === 0 ? "---" : home_team[id]),
                      proj: proj.toFixed(1),
                      avg: "---"
                    }
                  }
                } else if (lastName === "D/ST") {
                  home_proj += proj;
                  _homePlayerList[7] = {
                    name: fullName,
                    pos: "D/ST",
                    prk: (home_team[id] === 0 ? "---" : home_team[id]),
                    proj: proj.toFixed(1),
                    avg: "---"
                  }
                }
              });
              setHomePlayerList(_homePlayerList);

              let _compareList = [];
              let _playerList = [];
              for (var i = 0; i < _awayPlayerList.length; ++i) {
                _compareList.push({
                  flag: (parseFloat(_awayPlayerList[i]["proj"]) >= parseFloat(_homePlayerList[i]["proj"])),
                  role: (i === 6 ? "FLEX" : _awayPlayerList[i]["pos"])
                })
                _playerList.push({
                  role: (i === 6 ? "FLEX" : _awayPlayerList[i]["pos"]),
                  away: {
                    name: _awayPlayerList[i]["name"],
                    score: _awayPlayerList[i]["proj"]
                  },
                  home: {
                    name: _homePlayerList[i]["name"],
                    score: _homePlayerList[i]["proj"]
                  }
                })
              }

              _compareList.push({
                flag: (away_proj >= home_proj),
                role: "TEAM"
              });

              setCompareList(_compareList);

              setPlayerList(_playerList);

              match_data["away"]["proj"] = away_proj.toFixed(1);
              match_data["home"]["proj"] = home_proj.toFixed(1);
              setCurrent(match_data);
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
              team["roster"]["entries"].forEach(player => {
                _teams[team["id"].toString()][player["playerId"]] = player["playerPoolEntry"]["ratings"]["0"]["positionalRanking"];
              });
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
                    proj: 0.0
                  },
                  away: {
                    name: away_team["name"],
                    logo: away_team["logo"],
                    score: match["away"]["adjustment"],
                    div: away_div,
                    manager: away_team["manager"],
                    proj: 0.0
                  },
                  id: match["id"].toString(),
                  leagueID: 1869404038,
                };
                if (
                  props.leagueID === 1869404038 &&
                  match_data["id"] === props.matchId
                ) {
                  _value = _matchs.length;

                  let away_proj = 0.0, home_proj = 0.0;
                  let _awayPlayerList = new Array(9);
                  let cQB = 0, cRB = 0, cWR = 0, cTE = 0, cK = 0;
                  let pRB = [1, 2, 6], pWR = [3, 4, 6];
                  match["away"]["rosterForCurrentScoringPeriod"]["entries"].forEach(player => {
                    let id = player["playerPoolEntry"]["id"];
                    let fullName = player["playerPoolEntry"]["player"]["fullName"];
                    let lastName = player["playerPoolEntry"]["player"]["lastName"];
                    let pos = player["playerPoolEntry"]["player"]["defaultPositionId"];
                    let proj = player["playerPoolEntry"]["player"]["stats"][0]["appliedTotal"];
                    if (pos === 1) {
                      if (cQB === 0) {
                        cQB = 1;
                        away_proj += proj;
                        _awayPlayerList[0] = {
                          name: fullName,
                          pos: "QB",
                          prk: (away_team[id] === 0 ? "---" : away_team[id]),
                          proj: proj.toFixed(1),
                          avg: "---"
                        }
                      }
                    } else if (pos === 2) {
                      for (var i = 0; i < 3; ++i) {
                        if (_awayPlayerList[pRB[i]] === undefined) {
                          away_proj += proj;
                          _awayPlayerList[pRB[i]] = {
                            name: fullName,
                            pos: "RB",
                            prk: (away_team[id] === 0 ? "---" : away_team[id]),
                            proj: proj.toFixed(1),
                            avg: "---"
                          }
                          break;
                        }
                      };
                    } else if (pos === 3) {
                      for (var i = 0; i < 3; ++i) {
                        if (_awayPlayerList[pWR[i]] === undefined) {
                          away_proj += proj;
                          _awayPlayerList[pWR[i]] = {
                            name: fullName,
                            pos: "WR",
                            prk: (away_team[id] === 0 ? "---" : away_team[id]),
                            proj: proj.toFixed(1),
                            avg: "---"
                          }
                          break;
                        }
                      };
                    } else if (pos === 4) {
                      if (cTE === 0) {
                        cTE = 1;
                        away_proj += proj;
                        _awayPlayerList[5] = {
                          name: fullName,
                          pos: "TE",
                          prk: (away_team[id] === 0 ? "---" : away_team[id]),
                          proj: proj.toFixed(1),
                          avg: "---"
                        }
                      }
                    } else if (pos === 5) {
                      if (cK === 0) {
                        cK = 1;
                        away_proj += proj;
                        _awayPlayerList[8] = {
                          name: fullName,
                          pos: "K",
                          prk: (away_team[id] === 0 ? "---" : away_team[id]),
                          proj: proj.toFixed(1),
                          avg: "---"
                        }
                      }
                    } else if (lastName === "D/ST") {
                      away_proj += proj;
                      _awayPlayerList[7] = {
                        name: fullName,
                        pos: "D/ST",
                        prk: (away_team[id] === 0 ? "---" : away_team[id]),
                        proj: proj.toFixed(1),
                        avg: "---"
                      }
                    }
                  });
                  setAwayPlayerList(_awayPlayerList);

                  let _homePlayerList = new Array(9);
                  cQB = 0; cRB = 0; cWR = 0; cTE = 0; cK = 0;
                  match["home"]["rosterForCurrentScoringPeriod"]["entries"].forEach(player => {
                    let id = player["playerPoolEntry"]["id"];
                    let fullName = player["playerPoolEntry"]["player"]["fullName"];
                    let lastName = player["playerPoolEntry"]["player"]["lastName"];
                    let pos = player["playerPoolEntry"]["player"]["defaultPositionId"];
                    let proj = player["playerPoolEntry"]["player"]["stats"][0]["appliedTotal"];
                    if (pos === 1) {
                      if (cQB === 0) {
                        cQB = 1;
                        home_proj += proj;
                        _homePlayerList[0] = {
                          name: fullName,
                          pos: "QB",
                          prk: (home_team[id] === 0 ? "---" : home_team[id]),
                          proj: proj.toFixed(1),
                          avg: "---"
                        }
                      }
                    } else if (pos === 2) {
                      for (var i = 0; i < 3; ++i) {
                        if (_homePlayerList[pRB[i]] === undefined) {
                          home_proj += proj;
                          _homePlayerList[pRB[i]] = {
                            name: fullName,
                            pos: "RB",
                            prk: (home_team[id] === 0 ? "---" : home_team[id]),
                            proj: proj.toFixed(1),
                            avg: "---"
                          }
                          break;
                        }
                      };
                    } else if (pos === 3) {
                      for (var i = 0; i < 3; ++i) {
                        if (_homePlayerList[pWR[i]] === undefined) {
                          home_proj += proj;
                          _homePlayerList[pWR[i]] = {
                            name: fullName,
                            pos: "WR",
                            prk: (home_team[id] === 0 ? "---" : home_team[id]),
                            proj: proj.toFixed(1),
                            avg: "---"
                          }
                          break;
                        }
                      };
                    } else if (pos === 4) {
                      if (cTE === 0) {
                        cTE = 1;
                        home_proj += proj;
                        _homePlayerList[5] = {
                          name: fullName,
                          pos: "TE",
                          prk: (home_team[id] === 0 ? "---" : home_team[id]),
                          proj: proj.toFixed(1),
                          avg: "---"
                        }
                      }
                    } else if (pos === 5) {
                      if (cK === 0) {
                        cK = 1;
                        home_proj += proj;
                        _homePlayerList[8] = {
                          name: fullName,
                          pos: "K",
                          prk: (home_team[id] === 0 ? "---" : home_team[id]),
                          proj: proj.toFixed(1),
                          avg: "---"
                        }
                      }
                    } else if (lastName === "D/ST") {
                      home_proj += proj;
                      _homePlayerList[7] = {
                        name: fullName,
                        pos: "D/ST",
                        prk: (home_team[id] === 0 ? "---" : home_team[id]),
                        proj: proj.toFixed(1),
                        avg: "---"
                      }
                    }
                  });
                  setHomePlayerList(_homePlayerList);

                  let _compareList = [];
                  let _playerList = [];
                  for (var i = 0; i < _awayPlayerList.length; ++i) {
                    _compareList.push({
                      flag: (parseFloat(_awayPlayerList[i]["proj"]) >= parseFloat(_homePlayerList[i]["proj"])),
                      role: (i === 6 ? "FLEX" : _awayPlayerList[i]["pos"])
                    })
                    _playerList.push({
                      role: (i === 6 ? "FLEX" : _awayPlayerList[i]["pos"]),
                      away: {
                        name: _awayPlayerList[i]["name"],
                        score: _awayPlayerList[i]["proj"]
                      },
                      home: {
                        name: _homePlayerList[i]["name"],
                        score: _homePlayerList[i]["proj"]
                      }
                    })
                  }

                  _compareList.push({
                    flag: (away_proj >= home_proj),
                    role: "TEAM"
                  });

                  setCompareList(_compareList);

                  setPlayerList(_playerList);

                  match_data["away"]["proj"] = away_proj.toFixed(1);
                  match_data["home"]["proj"] = home_proj.toFixed(1);
                  setCurrent(match_data);
                }
                _matchs.push(match_data);
              }
            });

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
        <div className="text-center">
          {record.away.name}
        </div>
        <div>
          <div className="text-middle">{record.away.score}</div>
        </div>
      </div>
    )
  }

  const homeScoreTemplate = (record) => {
    return (
      <div className="flex justify-content-between">
        <div>
          <div className="text-middle">{record.home.score}</div>
        </div>
        <div className="text-center">
          {record.home.name}
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

  // const headerGroup = (
  //     <ColumnGroup>
  //         <Row>
  //             <Column header = "Team Name" rowSpan
  //         </Row>
  //     </ColumnGroup>
  // );

  const advAwayTemplate = (data, props) => {
    if (data["flag"] === true)
      return (<i className="pi pi-check" style={{ color: 'green', fontSize: '1rem' }}></i>);
    return (<div></div>)
  }

  const advHomeTemplate = (data, props) => {
    if (data["flag"] === false)
      return (<i className="pi pi-check" style={{ color: 'green', fontSize: '1rem' }}></i>);
    return (<div></div>)
  }

  const awayFooterGroup = (
    <ColumnGroup>
      <Row>
        <Column colSpan={2} />
        <Column footer="Total" colSpan={1} />
        <Column footer="---" colSpan={1} />
        <Column footer={current === null ? "" : current.away.proj} colSpan={1} />
      </Row>
    </ColumnGroup>
  );

  const compareFooterGroup = (
    <ColumnGroup>
      <Row>
        <Column colSpan={1} footer={current === null ? "" : ((current.home.proj - current.away.proj > 0.0 ? "+" : "") + (current.home.proj - current.away.proj).toFixed(1))} />
        <Column colSpan={1} footer="LINE" />
        <Column colSpan={1} footer={current === null ? "" : ((current.away.proj - current.home.proj > 0.0 ? "+" : "") + (current.away.proj - current.home.proj).toFixed(1))} />
      </Row>
    </ColumnGroup>
  )

  const homeFooterGroup = (
    <ColumnGroup>
      <Row>
        <Column footer={current === null ? "" : current.home.proj} colSpan={1} />
        <Column footer="---" colSpan={1} />
        <Column footer="Total" colSpan={1} />
        <Column colSpan={2} />
      </Row>
    </ColumnGroup>
  );

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
                  onPageChange={(event) => { setValue(event.page) }}
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
              <div className="away-score text-600">{current.away.proj}</div>
            </div>
            <div className="boxscores-home">
              <div className="home-score text-600">{current.home.proj}</div>
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
            <div className="boxscore-away card">
              <DataTable value={awayPlayerList} stripedRows footerColumnGroup={awayFooterGroup}>
                <Column field="name" header="Name" />
                <Column field="pos" header="Pos" />
                <Column field="prk" header="PRK" />
                <Column field="avg" header="AVG" />
                <Column field="proj" header="PROJ" />
              </DataTable>
            </div>
            <div className="boxscore-compare card">
              <DataTable value={compareList} stripedRows footerColumnGroup={compareFooterGroup}>
                <Column body={advAwayTemplate} header="ADV" />
                <Column field="role" header="POS" />
                <Column body={advHomeTemplate} header="ADV" />
              </DataTable>
            </div>
            <div className="boxscore-home card">
              <DataTable value={homePlayerList} stripedRows footerColumnGroup={homeFooterGroup}>
                <Column field="proj" header="PROJ" />
                <Column field="avg" header="AVG" />
                <Column field="prk" header="PRK" />
                <Column field="pos" header="Pos" />
                <Column field="name" header="Name" />
              </DataTable>
            </div>
          </div>
          <div className="lg:hidden block boxscore-container mobile text-sm">
            <div className="flex mb-2">
              <div className="team-header text-center" style={{ "width": "50%" }}>
                <div className="">
                  <Avatar image={current.away.logo} shape="circle" />
                </div>
                <div className="font-bold surface-overlay white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{ "max-width": "100%" }}>
                  {current.away.name}
                </div>
                <div className="text-base font-bold">
                  {current.away.proj}
                </div>
              </div>
              <div className="team-header text-center" style={{ "width": "50%" }}>
                <div className="">
                  <Avatar image={current.home.logo} shape="circle" />
                </div>
                <div className="font-bold surface-overlay white-space-nowrap overflow-hidden text-overflow-ellipsis" style={{ "max-width": "100%" }}>
                  {current.home.name}
                </div>
                <div className="text-base font-bold">
                  {current.home.proj}
                </div>
              </div>
            </div>
            <DataTable value={playerList} selectionMode="single" showGridlines>
              <Column body={awayScoreTemplate}></Column>
              <Column body={roleTemplate} style={{ "background-color": "var(--surface-300)", "max-width": "50px", "padding-left": "0px!important" }}></Column>
              <Column body={homeScoreTemplate}></Column>
            </DataTable>
          </div>
        </>
      )}
    </div>
  );
}

export default BoxScores;
