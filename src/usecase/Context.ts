import type { Domain } from "../domain";
import type { Drivers } from "../drivers";
import type { Infra } from "../infra";

export interface Context {
	domain: Domain;
	drivers: Drivers;
	infra: Infra;
}
