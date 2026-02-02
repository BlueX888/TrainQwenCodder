const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let keys;
const SPEED = 160; // 像素/秒

function preload() {
  // 使用 Graphics 创建三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个向上的三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillTriangle(
    32, 10,  // 顶点
    10, 54,  // 左下
    54, 54   // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在屏幕中央
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置键盘输入 - WASD
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the triangle', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应该移动的距离
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度
  if (keys.W.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.S.isDown) {
    velocityY = 1; // 向下
  }
  if (keys.A.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.D.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量
  if (velocityX !== 0 && velocityY !== 0) {
    // 对角线移动时，保持总速度为 160
    const factor = Math.sqrt(2) / 2; // 约 0.707
    velocityX *= factor;
    velocityY *= factor;
  }
  
  // 更新三角形位置
  triangle.x += velocityX * distance;
  triangle.y += velocityY * distance;
  
  // 边界限制（可选）
  triangle.x = Phaser.Math.Clamp(triangle.x, 32, 768);
  triangle.y = Phaser.Math.Clamp(triangle.y, 32, 568);
}

new Phaser.Game(config);