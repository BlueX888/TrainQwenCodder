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
let keyW, keyA, keyS, keyD;
const SPEED = 160; // 像素/秒

function preload() {
  // 不需要加载外部资源
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
  graphics.destroy(); // 销毁 Graphics 对象，只保留纹理
  
  // 创建三角形精灵，放置在屏幕中央
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置键盘输入
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // 计算实际移动距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 按键状态并更新速度
  if (keyW.isDown) {
    velocityY = -1; // 向上
  }
  if (keyS.isDown) {
    velocityY = 1; // 向下
  }
  if (keyA.isDown) {
    velocityX = -1; // 向左
  }
  if (keyD.isDown) {
    velocityX = 1; // 向右
  }
  
  // 如果同时按下多个方向键，进行归一化处理以保持恒定速度
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新三角形位置
  triangle.x += velocityX * distance;
  triangle.y += velocityY * distance;
  
  // 限制三角形在画布范围内
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);