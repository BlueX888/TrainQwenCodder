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
const SPEED = 240; // 像素/秒

function preload() {
  // 使用 Graphics 生成方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家方块，初始位置在屏幕中央
  player = this.add.sprite(400, 300, 'playerSquare');
  
  // 添加 WASD 键监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the square', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间间隔（转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态并设置移动方向
  if (keys.w.isDown) {
    velocityY = -1; // 向上
  } else if (keys.s.isDown) {
    velocityY = 1;  // 向下
  }
  
  if (keys.a.isDown) {
    velocityX = -1; // 向左
  } else if (keys.d.isDown) {
    velocityX = 1;  // 向右
  }
  
  // 对角线移动时归一化速度（避免对角线速度过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const normalize = Math.sqrt(2) / 2;
    velocityX *= normalize;
    velocityY *= normalize;
  }
  
  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;
  
  // 边界限制（可选）
  player.x = Phaser.Math.Clamp(player.x, 25, 775);
  player.y = Phaser.Math.Clamp(player.y, 25, 575);
}

new Phaser.Game(config);