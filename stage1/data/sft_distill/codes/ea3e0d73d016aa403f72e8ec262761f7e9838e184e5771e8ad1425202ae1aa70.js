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
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 设置 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the triangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键状态并设置速度
  if (keys.w.isDown) {
    velocityY = -1;
  } else if (keys.s.isDown) {
    velocityY = 1;
  }
  
  if (keys.a.isDown) {
    velocityX = -1;
  } else if (keys.d.isDown) {
    velocityX = 1;
  }
  
  // 归一化对角线移动速度（避免对角线移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    velocityX *= Math.SQRT1_2; // 等同于 1/√2
    velocityY *= Math.SQRT1_2;
  }
  
  // 根据 delta 时间更新位置（delta 单位是毫秒）
  triangle.x += velocityX * SPEED * (delta / 1000);
  triangle.y += velocityY * SPEED * (delta / 1000);
  
  // 边界限制（可选，防止三角形移出屏幕）
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);