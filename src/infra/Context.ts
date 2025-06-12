import type { Domain } from "../domain";
import type { Drivers } from "../drivers";

export interface Context {
	domain: Domain;
	drivers: Drivers;
}
