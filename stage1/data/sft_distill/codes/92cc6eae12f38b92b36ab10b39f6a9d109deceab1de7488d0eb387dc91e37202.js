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
let keys;
const SPEED = 80; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 30;
  const hexSides = 6;
  const hexAngle = (Math.PI * 2) / hexSides;
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  for (let i = 0; i < hexSides; i++) {
    const x = hexRadius * Math.cos(hexAngle * i - Math.PI / 2);
    const y = hexRadius * Math.sin(hexAngle * i - Math.PI / 2);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2 + 4, hexRadius * 2 + 4);
  graphics.destroy();
  
  // 创建六边形精灵
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 添加 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算本帧的移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检查按键状态并设置速度方向
  if (keys.w.isDown) {
    velocityY = -1;
  }
  if (keys.s.isDown) {
    velocityY = 1;
  }
  if (keys.a.isDown) {
    velocityX = -1;
  }
  if (keys.d.isDown) {
    velocityX = 1;
  }
  
  // 归一化对角线移动速度（避免对角线移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新六边形位置
  hexagon.x += velocityX * distance;
  hexagon.y += velocityY * distance;
  
  // 边界限制（可选）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);