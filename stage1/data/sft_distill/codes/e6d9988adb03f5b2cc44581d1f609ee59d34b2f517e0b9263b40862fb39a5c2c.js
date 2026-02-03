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
const SPEED = 120; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置三角形填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -20);  // 顶点
  graphics.lineTo(-17, 10);  // 左下角
  graphics.lineTo(17, 10);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 40, 40);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建三角形精灵并放置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 添加 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间差（秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键并设置速度方向
  if (keys.w.isDown) {
    velocityY = -1; // 向上
  }
  if (keys.s.isDown) {
    velocityY = 1;  // 向下
  }
  if (keys.a.isDown) {
    velocityX = -1; // 向左
  }
  if (keys.d.isDown) {
    velocityX = 1;  // 向右
  }
  
  // 归一化对角线移动速度（避免对角线移动更快）
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