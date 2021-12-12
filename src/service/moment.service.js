const connection = require('../app/database');

const sqlFragment = `
SELECT
    m.id id,m.content content,m.createAt createTime,m.updateAt updataTime,
    JSON_OBJECT('id',u.id,'name',u.name,'avatar',u.avatar_url) USER
    FROM moment m
    LEFT JOIN users u ON m.user_id = u.id
`

class MomentService {
  
  // 发出动态
  async create(userId,content) {
    const statement = `INSERT INTO moment (content,user_id) VALUES (?,?);`;
    const [result] = await connection.execute(statement,[content,userId]);
    return result;
  }

  // 根据动态的id，获取单条动态
  async getMomentById(id) {
    const statement = `
    ${sqlFragment}
    WHERE m.id = ?;`;
    const [result] = await connection.execute(statement,[id]);
    return result[0];
  }

  // 获取多条动态
  async getMomentList(offset,size) {
    const statement = `
    SELECT
      m.id id,m.content content,m.createAt createTime,m.updateAt updataTime,
      JSON_OBJECT('id',u.id,'name',u.name) USER,
      (SELECT COUNT(*) FROM comment c WHERE c.moment_id = m.id) commentCount,
      (SELECT COUNT(*) FROM moment_label ml WHERE ml.moment_id = m.id) labelCount
    FROM moment m
    LEFT JOIN users u ON m.user_id = u.id
    LIMIT ?,?;`;
    const [result] = await connection.execute(statement,[offset,size]);
    return result;
  }

  // 更新动态内容
  async updateMoment(content,momentId) {
    const statement = `UPDATE moment SET content = ? WHERE id = ?;`;
    const [result] = await connection.execute(statement,[content,momentId]);
    
    return result;
  }
  
  async removeMoment(momentId) {
    const statement = `DELETE FROM moment WHERE id = ?;`;
    const [result] = await connection.execute(statement,[momentId]);
    return result;
  }

  async hasLabel(momentId,labelId) {
    const statement = `SELECT * FROM moment_label WHERE moment_id = ? AND label_id = ?;`;
    const [result] = await connection.execute(statement,[momentId,labelId]);
    return result[0]? true:false;
  }

  async addLabel(momentId,labelId) {
    const statement = `INSERT INTO moment_label (moment_id,label_id) VALUES (?,?);`;
    const [result] = await connection.execute(statement,[momentId,labelId]);
    return result;
  }

}
module.exports = new MomentService();