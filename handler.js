const pacientes = [
  {id: 1, nome: 'Maria', dataNascimento: '1984-01-11'},
  {id: 2, nome: 'Josefina', dataNascimento: '1980-01-16'},
  {id: 3, nome: 'Jose', dataNascimento: '1998-06-06'},

]

const AWS = require("aws-sdk")
const { v4: uuidv4 } = require("uuid")

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const params = {
  TableName: "PACIENTES",
}

module.exports.listarPacientes = async (event) => {

  try {
    let data = await dynamoDb.scan(params).promise()
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    }
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),

    }
  }

}

module.exports.obterPaciente = async (event) => {

  try {
    const { pacienteId } = event.pathParameters

    const data = await dynamoDb
      .get({
        ... params,
        Key: {
          paciente_id: pacienteId
        }
      })
      .promise()

    if(!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Paciente não existe' }, null, 2)
      }
    }

    const paciente = data.Item

    return {
      statusCode: 200,
      body: JSON.stringify(paciente, null, 2)
    }
  } catch (err) {
    console.log('Error', err)
    return{
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }

};

module.exports.cadastrarPaciente = async (event) => {

  try {
    const timestamp = new Date().getTime()

    let dados = JSON.parse(event.body)
  
    const {
      nome, data_nascimento, email, telefone
    } = dados
  
  
    const paciente = {
      paciente_id: uuidv4(),
      nome,
      data_nascimento,
      email,
      telefone,
      status: true,
      criacao_em: timestamp,
      atualizacao_em: timestamp
    }
  
    await dynamoDb
      .put({
        TableName: "PACIENTES",
        Item: paciente,
      })
      .promise()
  
      return {
        statusCode: 201,
      }
  } catch(err) {
    console.log('Error', err)
    return{
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }


}

module.exports.atualizarPaciente = async (event) => {
  const { pacienteId } = event.pathParameters

  try {
    const timestamp = new Date().getTime()

    let dados = JSON.parse(event.body)

    const { nome, data_nascimento, email, telefone } = dados

    await dynamoDb
      .update({
        ... params,
        Key: {
          paciente_id: pacienteId
        },
        UpdateExpression:
          'SET nome = :nome, data_nascimento = :dt, email = :email,'
          + ' telefone = :telefone, atualizacao_em = :atualizacao_em',
        ConditionExpression: 'attribute_exists(paciente_id)',
        ExpressionAttributeValues: {
          ':nome': nome,
          ':dt': data_nascimento,
          ':email': email,
          ':telefone': telefone,
          ':atualizacao_em': timestamp
        }
      })
      .promise()
    return {
      statusCode: 204,
    }

  } catch (err) {
    console.log("Error", err)

    let error = err.name ? err.name :  "Exception"
    let message = err.message  ? err.message : "Unknown error"
    let statusCode = err.statusCode ? err.statusCode : 500

    if(error == 'ConditionalCheckFailedException') {
      error = 'Paciente não existe'
      message = `Recurso não pode ser atualizado porque o ID ${pacienteId} não existe`
      statusCode = 404
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message
      })
    }
  }
}

module.exports.excluirPaciente = async (event) => {
  const { pacienteId } = event.pathParameters

  try {
    await dynamoDb
      .delete({
        ... params,
        Key: {
          paciente_id: pacienteId
        },
        ConditionExpression: 'attribute_exists(paciente_id)',
      })
      .promise()
      
    return {
      statusCode: 204,
    }

  } catch (err) {
    console.log("Error", err)

    let error = err.name ? err.name :  "Exception"
    let message = err.message  ? err.message : "Unknown error"
    let statusCode = err.statusCode ? err.statusCode : 500

    if(error == 'ConditionalCheckFailedException') {
      error = 'Paciente não existe'
      message = `Recurso não pode ser atualizado porque o ID ${pacienteId} não existe`
      statusCode = 404
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message
      })
    }
  }
}