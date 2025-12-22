import { generateArray } from "../utils/generateArray";

export default function Controls({ setArray }) {
  return (
    <button onClick={() => setArray(generateArray(30))}>
      Generate Array
    </button>
  );
}
