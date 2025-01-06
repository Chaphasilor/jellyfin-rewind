import { writable } from "svelte/store";
import { formatDateToSql } from "./utility/format";

export const start = new Date(2024, 0, 1);
export const end = new Date(2024, 11, 31);
export const startSql = formatDateToSql(start);
export const endSql = formatDateToSql(end);
export const initTasksTodo = writable(0);
export const initTasksDone = writable(0);
export const processTaskTodo = writable(0);
export const processTaskDone = writable(0);
export const fetchingTaskTodo = writable(0);
export const fetchingTaskDone = writable(0);
