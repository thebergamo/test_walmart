Teste Scup
===

## Objetivo
O objetivo deste teste é ajudar a scupTel na sua missão de transparência, criar uma API onde seus clientes possam consultar os valores gastos ao utilizar os planos FaleMais. Em uma página web aberta ao público, o cliente deve escolher seu plano, a origem da ligação, o destino e a quantidade de minutos. O sistema irá mostrar os valores que esse cliente gastaria não usando os planos FaleMais e usando o FaleMais.

## Ferramentas
- **Node.js** - A JavaScript platform.
- **Hapi** - Web framework
- **MongoDB** - NoSQL Database
- **Lab** - BDD and Code Coverage framework
- **Chai** - Assertion library

## API
### GET /plans
**Overview**: GET /plans retornará todas os planos  
**request**
```
GET /plans
```
**output**
```json
[
	{
		_id: "5629678b4ef023e8292881e0",
		name: "FaleMais 30",
		__v: 0,
		pack: {
			cost: 30,
			extra: 10,
			minutes: 30
		}
	}
]
```

### GET /plan/{id}
**Overview**: GET /plan/{id} retornará o plano especificado. 
**Parameters**:
- **id** - Precisa ser um ObjectID - Id é obrigatório.

**request**  
```
GET /plan/561dc3c1e2f5436f6e6e4981
```
**output**
```json
{
	_id: "561dc3c1e2f5436f6e6e4981",
	name: "FaleMais 30",
	__v: 0,
	pack: {
		cost: 30,
		extra: 10,
		minutes: 30
	}
}
```

### GET /plan/{id}/query
**Overview**: GET /plan/{id}/query irá retornar o custo das ligações com e sem o plano FaleMais. Se algum dos parâmetros enviados for inválido, um erro `statusCode=400` será retornado, junto com o erro. **Parameters**: Todos os parâmetros são obrigatórios.
- **origin** - Cidade/DDD de origem da ligação.
- **destination** - Cidade/DDD de destino da ligação.
- **minutes** - Qtd de minutos a ser considerado.

**request**  
```
GET /plan/5626ab22bb3900c615dc38f2/query?origin=011&destination=016&minutes=80
```  
**output**
```json
{
  "origin": "011",
  "destination": "016",
  "minutes": 80,
  "plan": "FaleMais 30",
  "planCost": "104.50",
  "noPlanCost": "152.00"
}
```

### POST /plan
**Overview**: POST /plan Criará um novo plano no banco de dados.   
**Parameters**: Todos os parâmetros são obrigatórios.
- **name** - O nome para o novo plano.
- **pack** - Informações disponíveis do pacote do plano.  
    * **cost** - Valor do plano.
    * **minutes** - Minutos disponíveis no pacote.
    * **extra** - Valor em porcentagem(%) a ser cobrado por minutos excedentes.

**request**  
```
POST /plan { "name": "FaleMais 30", "pack": {"extra": 10, "minutes": 30, "cost": 30} } 
```
**output**
```json
{
	_id: "5629678b4ef023e8292881e0",
	name: "FaleMais 30",
	__v: 0,
	pack: {
		cost: 30,
		extra: 10,
		minutes: 30
	}
}
```

### PUT /plan/{id}
**Overview**: PUT /plan Atualizará um plano no banco de dados.  
**Parameters**: 
- **id** - Id do documento a ser editado. (*Query string*)
- **name** - O nome para o novo plano.
- **pack** - Informações disponíveis do pacote do plano.  
    * **cost** - Valor do plano.
    * **minutes** - Minutos disponíveis no pacote.
    * **extra** - Valor em porcentagem(%) a ser cobrado por minutos excedentes.

**request**  
```
PUT /plan/5629678b4ef023e8292881e0 { "name": "Fale Mais 30" } 
```
**output**
```json
{
	_id: "5629678b4ef023e8292881e0",
	name: "Fale Mais 30",
	__v: 0,
	pack: {
		cost: 30,
		extra: 10,
		minutes: 30
	}
}
```

### DELETE /plan/{id}
**Overview**: DELETE /plan Deleta um plano do banco de dados.   
**Parameters**: Todos os parâmetros são obrigatórios.
- **id** - Id do plano a ser deletado. (*Query string*)
- 
**request**  
```
DELETE /plan/5629678b4ef023e8292881e0
```
**output**
```json

````

### GET /prices
**Overview**: GET /prices retornará todas os preços  
**request**
```
GET /prices
```
**output**
```json
[
  {
    "_id": "5629678b4ef023e8292881e3",
    "origin": "011",
    "__v": 0,
    "destinations": [
      {
        "cost": 1.9,
        "destination": "016",
        "_id": "5629678b4ef023e8292881e6"
      },
      {
        "cost": 1.7,
        "destination": "017",
        "_id": "5629678b4ef023e8292881e5"
      },
      {
        "cost": 0.9,
        "destination": "018",
        "_id": "5629678b4ef023e8292881e4"
      }
    ]
  }
]
```

### GET /price/{id}
**Overview**: GET /price/{id} retornará o preço especificado. 
**Parameters**:
- **id** - Precisa ser um ObjectID - Id é obrigatório.

**request**  
```
GET /price/5629678b4ef023e8292881e7
```
**output**
```json
{
  "_id": "5629678b4ef023e8292881e7",
  "origin": "016",
  "__v": 0,
  "destinations": [
    {
      "destination": "011",
      "cost": 2.9,
      "_id": "5629678b4ef023e8292881e8"
    }
  ]
}
```

### POST /price
**Overview**: POST /price Criará um novo preço para ligações entre origem e destinos no banco de dados.   
**Parameters**: Todos os parâmetros são obrigatórios.
- **origin** - Origem das ligações.
- **destinations** - Array com os destinos possíveis e seus preços.  
    * **destination** - Destinatário.
    * **cost** - Valor do minuto de ligação para o destinatário.

**request**  
```
POST /price { "origin": "011", "destinations": [{"destination": "016", "cost": 1.9}] } 
```
**output**
```json
{
  "_id": "5629678b4ef023e829288117",
  "origin": "011",
  "__v": 0,
  "destinations": [
    {
      "destination": "016",
      "cost": 1.9,
      "_id": "5629678b4ef023e8292881s8"
    }
  ]
}
```

### PUT /price/{id}
**Overview**: PUT /price Atualizará um preço no banco de dados.  
**Parameters**: 
- **id** - Id do documento a ser editado. (*Query string*)
- **origin** - Origem das ligações.
- **destinations** - Array com os destinos possíveis e seus preços.  
    * **destination** - Destinatário.
    * **cost** - Valor do minuto de ligação para o destinatário.

**request**  
```
PUT /price/5629678b4ef023e829288117 { "origin": "SP" } 
```
**output**
```json
{
  "_id": "5629678b4ef023e829288117",
  "origin": "SP",
  "__v": 0,
  "destinations": [
    {
      "destination": "016",
      "cost": 1.9,
      "_id": "5629678b4ef023e8292881s8"
    }
  ]
}
```

### DELETE /price/{id}
**Overview**: DELETE /price Deleta um preço do banco de dados.   
**Parameters**: Todos os parâmetros são obrigatórios.
- **id** - Id do plano a ser deletado. (*Query string*)
- 
**request**  
```
DELETE /price/5629678b4ef023e829288117
```
**output**
```json

````

## Run this Project
To run this project you need have installed 
- **Node.js** (latest version)
- **MongoDB** 3.0.6

And then just run:
```sh
npm run build && npm start
```

If you want to run tests just run:
```sh
npm test
```
