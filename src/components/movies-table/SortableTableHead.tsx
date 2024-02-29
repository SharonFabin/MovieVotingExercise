import Movie from "@/models/Movie";
import { TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";

const headCells: { id: keyof Movie; label: string }[] = [
  {
    id: "id",
    label: "ID",
  },
  {
    id: "name",
    label: "Name",
  },

  {
    id: "votes",
    label: "Votes",
  },

  {
    id: "lastUpdate",
    label: "Last Update",
  },
  {
    id: "rank",
    label: "Ranking",
  },
];

type SortableTableHeadProps = {
  onSort: (property: keyof Movie) => void;
  ascending: boolean;
  orderBy: string;
};

const SortableTableHead = ({
  onSort,
  ascending,
  orderBy,
}: SortableTableHeadProps) => {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell, index) => (
          <TableCell key={index}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={ascending ? "desc" : "asc"}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
