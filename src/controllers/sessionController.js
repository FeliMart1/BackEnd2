const UserDTO = require('../dao/dtos/UserDTO');

const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'No autorizado' });
  }

  const userDTO = new UserDTO(req.user);
  res.status(200).send(userDTO);
};

module.exports = { getCurrentUser };
