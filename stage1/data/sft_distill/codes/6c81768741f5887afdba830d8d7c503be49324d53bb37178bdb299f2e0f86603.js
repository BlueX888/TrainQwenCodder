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
let cursors;
const SPEED = 360; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBox', 50, 50);
  graphics.destroy();

  // 创建玩家方块，放置在屏幕中央
  player = this.add.sprite(400, 300, 'playerBox');

  // 设置 WASD 按键监听
  cursors = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the box', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);

  // 根据按键状态移动方块
  if (cursors.w.isDown) {
    player.y -= distance;
  }
  if (cursors.s.isDown) {
    player.y += distance;
  }
  if (cursors.a.isDown) {
    player.x -= distance;
  }
  if (cursors.d.isDown) {
    player.x += distance;
  }

  // 限制方块在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);