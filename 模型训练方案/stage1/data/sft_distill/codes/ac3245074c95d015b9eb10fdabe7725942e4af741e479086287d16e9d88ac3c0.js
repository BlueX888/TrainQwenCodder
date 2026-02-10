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
  
  // 设置初始位置为屏幕中心
  player.x = 400;
  player.y = 300;
  
  // 设置 WASD 键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间增量(秒)
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keys.W.isDown) {
    player.y -= distance; // 向上移动
  }
  if (keys.S.isDown) {
    player.y += distance; // 向下移动
  }
  if (keys.A.isDown) {
    player.x -= distance; // 向左移动
  }
  if (keys.D.isDown) {
    player.x += distance; // 向右移动
  }
  
  // 限制在画布范围内
  player.x = Phaser.Math.Clamp(player.x, 20, 780);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

new Phaser.Game(config);