import BubbleSort from "./BubbleSort";
import SelectionSort from "./SelectionSort";
import InsertionSort from "./InsertionSort";
import MergeSort from "./MergeSort";
import QuickSort from "./QuickSort";

const ALGORITHMS = {
  "Bubble Sort": { algo: BubbleSort },
  "Selection Sort": { algo: SelectionSort },
  "Insertion Sort": { algo: InsertionSort },
  "Merge Sort": { algo: MergeSort },
  "Quick Sort": { algo: QuickSort }
};

export default ALGORITHMS;
