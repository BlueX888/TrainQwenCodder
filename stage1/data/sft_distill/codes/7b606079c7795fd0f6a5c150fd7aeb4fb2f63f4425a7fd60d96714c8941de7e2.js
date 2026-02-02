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

// 玩家对象
let player;
// 按键对象
let keys;
// 移动速度（像素/秒）
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建矩形玩家
  player = this.add.graphics();
  player.fillStyle(0x00ff00, 1); // 绿色矩形
  player.fillRect(0, 0, 50, 50); // 50x50 的矩形
  
  // 设置初始位置（居中）
  player.x = 375;
  player.y = 275;
  
  // 绑定 WASD 按键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 检测 W 键（向上）
  if (keys.W.isDown) {
    player.y -= distance;
  }
  
  // 检测 S 键（向下）
  if (keys.S.isDown) {
    player.y += distance;
  }
  
  // 检测 A 键（向左）
  if (keys.A.isDown) {
    player.x -= distance;
  }
  
  // 检测 D 键（向右）
  if (keys.D.isDown) {
    player.x += distance;
  }
  
  // 边界限制（防止矩形移出屏幕）
  player.x = Phaser.Math.Clamp(player.x, 0, 750);
  player.y = Phaser.Math.Clamp(player.y, 0, 550);
}

new Phaser.Game(config);