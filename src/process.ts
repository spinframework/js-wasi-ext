//@ts-ignore
import { getEnvironment } from "wasi:cli/environment@0.2.3";
//@ts-ignore
import process from "process/browser"

process.title = "starlingMonkey"

if (delete process.env) {
	Object.defineProperty(process, 'env', {
		get: function () {
			let env = getEnvironment();
			let result: Record<string, string> = {}
			env.map((k: any) => {
				result[k[0] as string] = k[1] as string;
			})
			return result;
		},
		configurable: true,
		enumerable: true,
	});
}

// We can probably support chdir if desired (these throw errors in the upstream process shim).
// If we do that, we probably want to fix cwd to properly represent the state as well. 

export default process;

