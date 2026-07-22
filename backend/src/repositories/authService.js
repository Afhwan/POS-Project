const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const roleRepository = require('../repositories/roleRepository');

class AuthService {
  async login(username, password) {
    // 1. Cari user di database
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // 2. Cek apakah akun aktif
    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    // 3. Bandingkan password dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // 4. Ambil nama role
    const role = await roleRepository.findById(user.role_id);
    if (!role) {
      throw new Error('Role not found');
    }

    // 5. Update waktu login terakhir
    await userRepository.updateLastLogin(user.id);

    // 6. Kembalikan data user (tanpa password_hash)
    const { password_hash, ...userData } = user;
    return {
      ...userData,
      role_name: role.name,
    };
  }
}

module.exports = new AuthService();