const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let keys;
const SPEED = 360; // 像素/秒

function preload() {
  // 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（使用路径）
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 底顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，放置在屏幕中央
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 绑定 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加说明文字
  this.add.text(10, 10, 'Use WASD to move the diamond', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧应该移动的距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);
  
  // 检测 W 键（向上）
  if (keys.w.isDown) {
    diamond.y -= distance;
  }
  
  // 检测 S 键（向下）
  if (keys.s.isDown) {
    diamond.y += distance;
  }
  
  // 检测 A 键（向左）
  if (keys.a.isDown) {
    diamond.x -= distance;
  }
  
  // 检测 D 键（向右）
  if (keys.d.isDown) {
    diamond.x += distance;
  }
  
  // 限制菱形在屏幕范围内
  diamond.x = Phaser.Math.Clamp(diamond.x, 32, 768);
  diamond.y = Phaser.Math.Clamp(diamond.y, 32, 568);
}

new Phaser.Game(config);