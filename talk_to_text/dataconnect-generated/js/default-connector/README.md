# Table of Contents
- [**Overview**](#generated-typescript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
- [**Mutations**](#mutations)

# Generated TypeScript README
이 README는 `default` 커넥터에 대해 생성된 TypeScript SDK 패키지를 사용하는 방법을 안내합니다. 또한 생성된 SDK를 사용하여 Data Connect 쿼리 및 변형을 호출하는 예시도 제공합니다.

***참고:** 이 README는 생성된 SDK와 함께 생성됩니다. 이 파일을 수정하면 SDK가 다시 생성될 때 덮어씌워집니다.*

생성된 SDK는 아래와 같이 `@firebasegen/default-connector` 패키지에서 가져올 수 있습니다. CommonJS와 ESM 임포트를 모두 지원합니다.

또한, [Data Connect 문서](https://firebase.google.com/docs/data-connect/web-sdk#set-client)에서 자세한 내용을 확인할 수 있습니다.


# Accessing the connector
커넥터는 쿼리(Query)와 변형(Mutation)의 집합입니다. 각 커넥터에 대해 하나의 SDK가 생성됩니다. 이 SDK는 `default` 커넥터에 대해 생성됩니다.

커넥터에 대한 자세한 내용은 [Data Connect 문서](https://firebase.google.com/docs/data-connect#how-does)에서 확인할 수 있습니다.

javascript
import { getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/default-connector';

const dataConnect = getDataConnect(connectorConfig);


## Connecting to the local Emulator
기본적으로 커넥터는 프로덕션 서비스와 연결됩니다.

로컬 에뮬레이터에 연결하려면 아래와 같은 코드를 사용할 수 있습니다. Data Connect 문서에서 에뮬레이터 사용 방법을 더 알아볼 수 있습니다.
(https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

javascript
import { connectDataConnectEmulator, getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/default-connector';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);


이후에는 생성된 SDK에서 쿼리(Query)와 변형(Mutation)을 호출할 수 있습니다.

# Queries

현재 default 커넥터에 대한 쿼리가 생성되지 않았습니다.

쿼리 사용 방법에 대해 더 배우고 싶다면 Data Connect 문서에서 예시를 참고하세요.[Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

# Mutations
N현재 default 커넥터에 대한 변형이 생성되지 않았습니다.

변형 사용 방법에 대해 더 배우고 싶다면 Data Connect 문서에서 예시를 참고하세요 [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).
