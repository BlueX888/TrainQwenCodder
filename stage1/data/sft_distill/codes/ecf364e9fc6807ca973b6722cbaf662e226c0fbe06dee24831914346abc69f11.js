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
const SPEED = 300; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy();

  // 创建玩家精灵并放置在屏幕中心
  player = this.add.sprite(400, 300, 'playerRect');

  // 添加 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the rectangle', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算本帧应移动的距离
  const moveDistance = SPEED * deltaSeconds;

  // 根据按键状态更新位置
  if (keys.w.isDown) {
    player.y -= moveDistance;
  }
  if (keys.s.isDown) {
    player.y += moveDistance;
  }
  if (keys.a.isDown) {
    player.x -= moveDistance;
  }
  if (keys.d.isDown) {
    player.x += moveDistance;
  }

  // 限制玩家在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);