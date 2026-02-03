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
const SPEED = 200; // 像素/秒

function preload() {
  // 使用 Graphics 创建方块纹理，无需外部资源
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('player', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，位于屏幕中心
  player = this.add.sprite(400, 300, 'player');
  player.setOrigin(0.5, 0.5);
  
  // 添加 WASD 键盘控制
  cursors = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动速度（像素/秒转换为每帧移动距离）
  const velocity = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态并设置速度
  if (cursors.w.isDown) {
    velocityY = -velocity; // 向上
  } else if (cursors.s.isDown) {
    velocityY = velocity; // 向下
  }
  
  if (cursors.a.isDown) {
    velocityX = -velocity; // 向左
  } else if (cursors.d.isDown) {
    velocityX = velocity; // 向右
  }
  
  // 如果同时按下两个方向键，归一化速度（保持对角线移动速度一致）
  if (velocityX !== 0 && velocityY !== 0) {
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX = (velocityX / magnitude) * velocity;
    velocityY = (velocityY / magnitude) * velocity;
  }
  
  // 更新玩家位置
  player.x += velocityX;
  player.y += velocityY;
  
  // 限制方块在屏幕范围内
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

// 启动游戏
new Phaser.Game(config);