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
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（指向上方）
  graphics.fillTriangle(
    20, 0,   // 顶点
    0, 40,   // 左下
    40, 40   // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 40, 40);
  graphics.destroy();
  
  // 创建三角形精灵，放在屏幕中央
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置 WASD 键监听
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算速度向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检查按键状态并设置速度
  if (keys.W.isDown) {
    velocityY = -SPEED;
  } else if (keys.S.isDown) {
    velocityY = SPEED;
  }
  
  if (keys.A.isDown) {
    velocityX = -SPEED;
  } else if (keys.D.isDown) {
    velocityX = SPEED;
  }
  
  // 对角线移动时归一化速度（保持总速度为 200）
  if (velocityX !== 0 && velocityY !== 0) {
    const factor = Math.sqrt(2) / 2; // 约 0.707
    velocityX *= factor;
    velocityY *= factor;
  }
  
  // 根据 delta 时间更新位置
  triangle.x += velocityX * (delta / 1000);
  triangle.y += velocityY * (delta / 1000);
  
  // 边界限制（可选）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);