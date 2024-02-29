"use client";

import Chart from "@/components/Chart";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { socketService } from "../api/socket";
import MovieUpdate from "@/models/MovieUpdate";
import Movie from "@/models/Movie";
import MoviesTable from "@/components/movies-table/MoviesTable";
import { signIn } from "@/api/auth";
import { getMoviesData } from "@/api/data";
import { formatDate } from "@/utils/TimeUtils";
import InputBase from "@mui/material/InputBase";

const ConnectedStatus = ({
  connected,
  lastUpdate,
}: {
  connected: boolean;
  lastUpdate: string;
}) => {
  return (
    <div className="flex items-center gap-x-2">
      <div
        className={`w-4 h-4 rounded-full ${
          connected ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      <span>{connected ? "Connected" : "Disconnected"}</span>
      {connected && <span>Last update: {lastUpdate}</span>}
    </div>
  );
};

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [movieTitles, setMovieTitles] = useState<{ [id: string]: string }>({});
  const [movies, setMovies] = useState<{ [id: number]: Movie }>({});
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [moviesFilter, setMoviesFilter] = useState<string>("");
  const [token, setToken] = useState<string | null>();

  const setSelectedMovieId = (movieId: number) => {
    setSelectedMovie(movies[movieId]);
  };

  const onData = (data: MovieUpdate[]) => {
    setLastUpdate(formatDate(new Date()));
    for (const newMovie of data) {
      const historyUpdate = {
        votes: newMovie.itemCount,
        timestamp: newMovie.generatedTime,
      };
      const movieValues = Object.values(movies);
      if (newMovie.itemId in movies) {
        movies[newMovie.itemId].votes += newMovie.itemCount;
        if (movies[newMovie.itemId].history.length == 20) {
          movies[newMovie.itemId].history.shift();
        }
        movies[newMovie.itemId].history = [
          ...movies[newMovie.itemId].history,
          historyUpdate,
        ];
      } else {
        movies[newMovie.itemId] = {
          id: newMovie.itemId,
          name: movieTitles[newMovie.itemId] || "Unknown",
          lastUpdate: newMovie.generatedTime,
          votes: newMovie.itemCount,
          history: [historyUpdate],
          rank: movieValues.length + 1,
          lastRank: movieValues.length + 1,
        };
      }
    }
    const sortedMovies = Object.values(movies).sort(
      (a, b) => b.votes - a.votes,
    );
    for (let i = 0; i < sortedMovies.length; i++) {
      sortedMovies[i].lastRank = sortedMovies[i].rank;
      sortedMovies[i].rank = i + 1;
    }

    setMovies({ ...movies });
  };

  const onClose = () => {
    setConnected(false);
  };

  useEffect(() => {
    const authenticate = async () => {
      const response = await signIn();
      if (response.token) {
        setToken(response.token);
      } else {
        alert("Failed to authenticate");
      }
    };
    authenticate();
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const data = await getMoviesData(token);
      if (data) {
        for (const movie of data) {
          movieTitles[movie.id] = movie.description;
          console.log(movie.description);
        }
        setMovieTitles({ ...movieTitles });
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    try {
      socketService.registerOnServerEvents(
        `NewMessage`,
        onData,
        onClose,
        token,
      );
      setConnected(true);
    } catch (error) {
      setConnected(false);
      console.error(error);
    }

    return () => {
      socketService.stopConnection(`${process.env.NEXT_PUBLIC_HUB_METHOD}`);
    };
  }, [token]);

  return (
    <main className="flex h-screen items-center flex-col gap-y-8">
      <Typography variant="h1" className="pt-4 text-[2rem] font-bold">
        Movie Voting Analyzer 3000!
      </Typography>
      <ConnectedStatus connected={connected} lastUpdate={lastUpdate} />

      <div className="flex flex-col flex-1 w-full overflow-y-auto px-8">
        <div className="flex bg-white rounded-lg p-2 w-80 mb-2">
          <InputBase
            placeholder="Search Movies"
            inputProps={{ "aria-label": "search" }}
            className=""
            onChange={(e) => setMoviesFilter(e.target.value)}
          />
        </div>
        <MoviesTable
          movies={Object.values(movies).filter((movie) =>
            movie.name.toLowerCase().includes(moviesFilter.toLowerCase()),
          )}
          setSelectedMovieId={setSelectedMovieId}
        />
      </div>
      <div className="flex flex-col w-full">
        <Typography variant="h2" className="text-[1.5rem] text-center py-2">
          {selectedMovie && `Votes for ${selectedMovie?.name}`}
        </Typography>
        <Chart selectedMovie={selectedMovie} />
      </div>
    </main>
  );
}
