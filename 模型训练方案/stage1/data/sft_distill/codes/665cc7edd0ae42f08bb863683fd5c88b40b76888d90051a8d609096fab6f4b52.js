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
let keyW, keyA, keyS, keyD;
// 移动速度（像素/秒）
const SPEED = 120;

function preload() {
  // 本游戏不需要预加载外部资源
}

function create() {
  // 创建玩家矩形（50x50 的红色矩形）
  player = this.add.graphics();
  player.fillStyle(0xff0000, 1);
  player.fillRect(0, 0, 50, 50);
  
  // 设置初始位置（屏幕中心）
  player.x = 400 - 25; // 减去矩形宽度的一半使其居中
  player.y = 300 - 25; // 减去矩形高度的一半使其居中
  
  // 绑定 WASD 按键
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the red square', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧的移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 根据按键状态更新位置
  if (keyW.isDown) {
    player.y -= moveDistance; // 向上移动
  }
  if (keyS.isDown) {
    player.y += moveDistance; // 向下移动
  }
  if (keyA.isDown) {
    player.x -= moveDistance; // 向左移动
  }
  if (keyD.isDown) {
    player.x += moveDistance; // 向右移动
  }
  
  // 限制在画布范围内（可选）
  player.x = Phaser.Math.Clamp(player.x, 0, 750); // 800 - 50
  player.y = Phaser.Math.Clamp(player.y, 0, 550); // 600 - 50
}

new Phaser.Game(config);