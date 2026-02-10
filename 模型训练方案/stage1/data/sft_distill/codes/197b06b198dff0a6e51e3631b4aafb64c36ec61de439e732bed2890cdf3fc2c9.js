const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建圆形玩家
  player = this.add.graphics();
  player.fillStyle(0x00ff00, 1); // 绿色圆形
  player.fillCircle(0, 0, 20); // 半径 20 像素，中心点在 (0, 0)
  player.setPosition(400, 300); // 初始位置在屏幕中心

  // 监听 WASD 按键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the circle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离 = 速度 * 时间（转换为秒）
  const distance = SPEED * (delta / 1000);

  // 获取当前位置
  let x = player.x;
  let y = player.y;

  // 根据按键状态更新位置
  if (keys.W.isDown) {
    y -= distance; // 向上移动
  }
  if (keys.S.isDown) {
    y += distance; // 向下移动
  }
  if (keys.A.isDown) {
    x -= distance; // 向左移动
  }
  if (keys.D.isDown) {
    x += distance; // 向右移动
  }

  // 边界检测（保持圆形在屏幕内）
  const radius = 20;
  x = Phaser.Math.Clamp(x, radius, config.width - radius);
  y = Phaser.Math.Clamp(y, radius, config.height - radius);

  // 更新玩家位置
  player.setPosition(x, y);
}

new Phaser.Game(config);