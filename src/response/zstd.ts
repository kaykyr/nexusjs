import ProcessStream from 'process-streams'
import { execSync } from 'child_process'
import through from 'through2'
import isZst from 'is-zst'
import peek from 'peek-stream'
import fs from 'fs'

import {
	ZSTDNotFoundExeption,
	InvalidArgumentTypeException,
	ZSTDCompressionException,
} from '../exception'

export class ZSTD {
	private binPath: string

	constructor() {
		try {
			this.binPath = execSync(
				process.platform === 'win32' ? 'where zstd.exe' : 'which zstd',
				{ env: process.env },
			)
				.toString()
				.replace(/\n$/, '')
				.replace(/\r$/, '')
		} catch (error) {
			throw new ZSTDNotFoundExeption(
				'Cannot found zstd! Is it installed?',
			)
		}

		try {
			fs.accessSync(this.binPath, fs.constants.X_OK)
		} catch (error) {
			throw new ZSTDNotFoundExeption('zstd is not executable')
		}
	}

	public compress(compressionLevel: number = 3) {
		const processStream = new ProcessStream()

		const allowedLevels = [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
			20, 21, 22,
		]

		if (typeof compressionLevel !== 'number')
			throw new InvalidArgumentTypeException('compressionLevel', 'number')
		if (!allowedLevels.includes(compressionLevel))
			throw new InvalidArgumentTypeException(
				'compressionLevel',
				'number between 1 and 22',
			)

		const compressionProcess = processStream
			.spawn(this.binPath, [`-${compressionLevel}`])
			.on('exit', (code: number, signal: string) => {
				if (code !== 0) {
					setTimeout(() => {
						compressionProcess.destroy(
							new ZSTDCompressionException(
								`ZSTD exited with non zero code. Code: ${code} signal: ${signal}`,
							),
						)
					}, 1)
				}
			})

		return compressionProcess
	}

	public decompress() {
		return peek(
			{ newline: false, maxBuffer: 10 },
			(data: Buffer, swap: Function) => {
				if (isZst(data)) return swap(null, this._decompress())
				return swap(null, through())
			},
		)
	}

	protected _decompress() {
		const decompressProcess = new ProcessStream()
		return decompressProcess.spawn(this.binPath, ['-d'])
	}
}
