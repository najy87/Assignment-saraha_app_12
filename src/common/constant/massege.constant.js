const generateMassege = (entity) => {
  return {
    created: `${entity} created successfully`,
    alreadyExist: `${entity} already Exist`,
    notFound: `${entity} not found`,
  };
};

export const SYS_MASSEGE = {
  user: generateMassege("User"),
  product: generateMassege("Product"),
  note: generateMassege("Note"),
  massege: generateMassege("Massege"),
};
