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

let triangle;
let keys;
const SPEED = 300; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向上方的三角形
  graphics.fillTriangle(
    0, -20,    // 顶点（上）
    -15, 20,   // 左下角
    15, 20     // 右下角
  );
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 创建三角形精灵，放置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置键盘输入监听 WASD
  keys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算速度增量（像素/帧）
  const velocity = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 根据按键状态计算移动方向
  if (keys.left.isDown) {
    velocityX -= velocity;
  }
  if (keys.right.isDown) {
    velocityX += velocity;
  }
  if (keys.up.isDown) {
    velocityY -= velocity;
  }
  if (keys.down.isDown) {
    velocityY += velocity;
  }
  
  // 更新三角形位置
  triangle.x += velocityX;
  triangle.y += velocityY;
  
  // 边界限制（可选，防止三角形移出屏幕）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);