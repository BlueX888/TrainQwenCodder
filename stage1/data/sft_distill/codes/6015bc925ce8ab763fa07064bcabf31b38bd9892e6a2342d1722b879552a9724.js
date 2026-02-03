const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let player;
let keys;
const SPEED = 160; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建圆形玩家
  player = this.add.graphics();
  player.fillStyle(0x00ff00, 1);
  player.fillCircle(0, 0, 20); // 半径 20 的圆形
  
  // 设置初始位置
  player.x = 400;
  player.y = 300;
  
  // 添加 WASD 键盘监听
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
}

function update(time, delta) {
  // 计算每帧的移动距离 = 速度 * 时间（转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 根据按键状态设置速度方向
  if (keys.W.isDown) {
    velocityY = -1;
  }
  if (keys.S.isDown) {
    velocityY = 1;
  }
  if (keys.A.isDown) {
    velocityX = -1;
  }
  if (keys.D.isDown) {
    velocityX = 1;
  }
  
  // 归一化对角线移动（避免对角线速度过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

new Phaser.Game(config);