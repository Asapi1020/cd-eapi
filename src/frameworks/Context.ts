import { Domain } from "../domain";
import { Drivers, mongo } from "../drivers";
import { Infra } from "../infra";
import { Usecase } from "../usecase";

export interface Context {
	domain: Domain;
	drivers: Drivers;
	infra: Infra;
	usecases: Usecase;
}

export async function createContext(): Promise<Context> {
	const domain = new Domain();
	const mongoClient = await mongo(domain.config.mongoURI);
	const drivers = new Drivers(mongoClient);
	const infra = new Infra({ domain, drivers });
	const usecases = new Usecase({ domain, drivers, infra });

	return {
		domain,
		drivers,
		infra,
		usecases,
	};
}
