export class DBRepositoty {
  nmodel;

  constructor(model) {
    this.nmodel = model;
  }

  async create(item) {
    const doc = new this.nmodel(item);
    return await doc.save();
  }

  async update(
    filter,
    update,
    options = { new: true, returnDocument: "after" },
  ) {
    return await this.nmodel.findOneAndUpdate(filter, update, options);
  }

  async getOne(filter, projection = {}, options = {}) {
    return await this.nmodel.findOne(filter, projection, options);
  }
  async getAll(filter, projection = {}, options = {}) {
    return await this.nmodel.find(filter, projection, options);
  }

  async deleteOne(filter) {
    return await this.nmodel.deleteOne(filter);
  }
}
