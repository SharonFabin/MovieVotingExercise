"use client";

import { useMemo, useState } from "react";
import Movie from "@/models/Movie";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SortableTableHead from "./SortableTableHead";
import { formatDate } from "@/utils/TimeUtils";

const MovieRank = ({ movie }: { movie: Movie }) => {
  if (movie.rank < movie.lastRank) {
    return <ArrowUpwardIcon />;
  } else if (movie.rank > movie.lastRank) {
    return <ArrowDownwardIcon />;
  }
};

type MoviesTableProps = {
  movies: Movie[];
  setSelectedMovieId: (movieId: number) => void;
};
const MoviesTable = ({ movies, setSelectedMovieId }: MoviesTableProps) => {
  const [ascending, setAscending] = useState(false);
  const [orderBy, setOrderBy] = useState<keyof Movie>("votes");
  const onSort = (property: keyof Movie) => {
    if (orderBy === property) {
      setAscending(!ascending);
    } else {
      setOrderBy(property);
    }
  };

  const sortedMovies = useMemo(
    () =>
      movies.sort((a, b) => {
        const multiplier = ascending ? 1 : -1;
        if (a[orderBy] > b[orderBy]) {
          return 1 * multiplier;
        } else if (a[orderBy] < b[orderBy]) {
          return -1 * multiplier;
        } else {
          return 0;
        }
      }),
    [movies, orderBy, ascending],
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <SortableTableHead
          onSort={onSort}
          ascending={ascending}
          orderBy={orderBy}
        />
        <TableBody>
          {sortedMovies.map((movie, index) => (
            <TableRow
              key={movie.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              className="hover:bg-blue-50 hover:cursor-pointer"
              onClick={() => setSelectedMovieId(movie.id)}
            >
              <TableCell component="th" scope="row">
                {movie.id}
              </TableCell>
              <TableCell component="th" scope="row">
                {movie.name}
              </TableCell>
              <TableCell align="center">{movie.votes}</TableCell>
              <TableCell align="center">
                {formatDate(new Date(movie.lastUpdate.toString()))}
              </TableCell>
              <TableCell align="center">
                <MovieRank movie={movie} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MoviesTable;
