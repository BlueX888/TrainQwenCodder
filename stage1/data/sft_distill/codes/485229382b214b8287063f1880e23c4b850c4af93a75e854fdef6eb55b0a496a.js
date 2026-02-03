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
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制六边形（中心点在 40, 40）
  const hexRadius = 30;
  const centerX = 40;
  const centerY = 40;
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 80, 80);
  graphics.destroy();
  
  // 创建六边形精灵
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置键盘输入
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键并设置速度方向
  if (keys.W.isDown) {
    velocityY = -1;
  }
  if (keys.S.isDown) {
    velocityY = 1;
  }
  if (keys.A.isDown) {
    velocityX = -1;
  }
  if (keys.D.isDown) {
    velocityX = 1;
  }
  
  // 归一化对角线移动（避免对角线移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    const normalizer = Math.sqrt(2);
    velocityX /= normalizer;
    velocityY /= normalizer;
  }
  
  // 更新六边形位置
  hexagon.x += velocityX * distance;
  hexagon.y += velocityY * distance;
  
  // 边界限制（可选）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);