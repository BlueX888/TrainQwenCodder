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

let hexagon;
let cursors;
const SPEED = 80;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制六边形（中心点在 32, 32）
  const hexRadius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = 32 + hexRadius * Math.cos(angle);
    const y = 32 + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  graphics.beginPath();
  graphics.moveTo(hexPoints[0], hexPoints[1]);
  for (let i = 2; i < hexPoints.length; i += 2) {
    graphics.lineTo(hexPoints[i], hexPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  graphics.destroy();
  
  // 创建六边形精灵，放置在屏幕中央
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 添加 WASD 键盘输入
  cursors = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检查 WASD 键状态并设置移动方向
  if (cursors.w.isDown) {
    velocityY = -1;
  } else if (cursors.s.isDown) {
    velocityY = 1;
  }
  
  if (cursors.a.isDown) {
    velocityX = -1;
  } else if (cursors.d.isDown) {
    velocityX = 1;
  }
  
  // 归一化对角线移动速度（避免对角线移动过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const normalizer = Math.sqrt(2);
    velocityX /= normalizer;
    velocityY /= normalizer;
  }
  
  // 应用移动
  hexagon.x += velocityX * distance;
  hexagon.y += velocityY * distance;
  
  // 边界限制（可选）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);