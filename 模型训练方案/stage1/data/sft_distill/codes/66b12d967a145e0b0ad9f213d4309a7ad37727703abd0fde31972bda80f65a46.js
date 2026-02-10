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

let diamond;
let keys;
const SPEED = 300; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形路径（中心点为 32, 32，大小为 64x64）
  const path = new Phaser.Geom.Polygon([
    32, 0,    // 上顶点
    64, 32,   // 右顶点
    32, 64,   // 下顶点
    0, 32     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置键盘输入监听 WASD
  keys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 根据按键状态设置速度方向
  if (keys.left.isDown) {
    velocityX = -1;
  } else if (keys.right.isDown) {
    velocityX = 1;
  }
  
  if (keys.up.isDown) {
    velocityY = -1;
  } else if (keys.down.isDown) {
    velocityY = 1;
  }
  
  // 归一化对角线移动速度（避免对角移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    velocityX *= Math.SQRT1_2; // 等同于 1/sqrt(2)
    velocityY *= Math.SQRT1_2;
  }
  
  // 应用速度移动（delta 是毫秒，需要转换为秒）
  diamond.x += velocityX * SPEED * (delta / 1000);
  diamond.y += velocityY * SPEED * (delta / 1000);
  
  // 边界限制（可选）
  diamond.x = Phaser.Math.Clamp(diamond.x, 0, 800);
  diamond.y = Phaser.Math.Clamp(diamond.y, 0, 600);
}

new Phaser.Game(config);