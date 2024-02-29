interface Movie {
  id: number;
  name: string;
  votes: number;
  lastUpdate: Date;
  rank: number;
  lastRank: number;
  history: {
    timestamp: Date;
    votes: number;
  }[];
}

export default Movie;
