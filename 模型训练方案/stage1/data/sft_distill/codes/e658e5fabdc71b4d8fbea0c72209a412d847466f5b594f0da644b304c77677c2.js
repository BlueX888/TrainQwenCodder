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
const SPEED = 120; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个指向上方的三角形
  graphics.beginPath();
  graphics.moveTo(0, -20);  // 顶点
  graphics.lineTo(-15, 20);  // 左下角
  graphics.lineTo(15, 20);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 30, 40);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中央
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 设置键盘输入
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update(time, delta) {
  // 计算每帧应移动的距离 = 速度 * 时间差（转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 根据按键状态设置速度方向
  if (keyW.isDown) {
    velocityY = -1;
  }
  if (keyS.isDown) {
    velocityY = 1;
  }
  if (keyA.isDown) {
    velocityX = -1;
  }
  if (keyD.isDown) {
    velocityX = 1;
  }
  
  // 归一化对角线移动（避免对角线速度过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新三角形位置
  triangle.x += velocityX * distance;
  triangle.y += velocityY * distance;
  
  // 边界限制（可选）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);