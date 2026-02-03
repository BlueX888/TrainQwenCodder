// 完整的 Phaser3 代码
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
const SPEED = 300; // 像素/秒

function preload() {
  // 使用 Graphics 程序化生成方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，放置在屏幕中央
  player = this.add.sprite(400, 300, 'playerBlock');
  
  // 添加 WASD 键盘控制
  cursors = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文字
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态并设置速度
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }
  
  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 如果同时按下两个方向键，需要归一化速度（避免斜向移动过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const normalizer = Math.sqrt(2) / 2; // 约 0.707
    velocityX *= normalizer;
    velocityY *= normalizer;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 限制玩家在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);