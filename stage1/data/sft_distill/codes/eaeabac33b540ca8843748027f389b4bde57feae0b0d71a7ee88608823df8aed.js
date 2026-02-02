const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let keyW, keyA, keyS, keyD;
const SPEED = 200; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制一个等边三角形（顶点朝上）
  graphics.beginPath();
  graphics.moveTo(0, -20);      // 顶点
  graphics.lineTo(-17, 10);     // 左下角
  graphics.lineTo(17, 10);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 40, 40);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中央
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 添加 WASD 键盘监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the triangle', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算实际移动距离（根据帧时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态更新位置
  if (keyW.isDown) {
    triangle.y -= distance; // 向上移动
  }
  if (keyS.isDown) {
    triangle.y += distance; // 向下移动
  }
  if (keyA.isDown) {
    triangle.x -= distance; // 向左移动
  }
  if (keyD.isDown) {
    triangle.x += distance; // 向右移动
  }
  
  // 限制三角形在屏幕范围内
  triangle.x = Phaser.Math.Clamp(triangle.x, 0, 800);
  triangle.y = Phaser.Math.Clamp(triangle.y, 0, 600);
}

new Phaser.Game(config);