const pacientes = [
  {id: 1, nome: 'Maria', dataNascimento: '1984-01-11'},
  {id: 2, nome: 'Josefina', dataNascimento: '1984-01-11'},
  {id: 3, nome: 'Jose', dataNascimento: '1984-01-11'},

]

module.exports.listarPacientes = async (event) => {
  console.log(event)
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        pacientes
      },
      null,
      2
    ),
  };

};
