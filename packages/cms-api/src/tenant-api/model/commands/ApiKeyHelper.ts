import ApiKey from '../type/ApiKey'
import { now } from '../../../utils/date'

class ApiKeyHelper {
	public static getExpiration(type: ApiKey.Type): Date | null {
		switch (type) {
			case ApiKey.Type.PERMANENT:
				return null

			case ApiKey.Type.SESSION:
				return new Date(now().getTime() + 30 * 60 * 1000)

			case ApiKey.Type.ONE_OFF:
				return null
		}
	}
}

export default ApiKeyHelper