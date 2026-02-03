const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let keys;
const SPEED = 300; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制六边形（中心点为原点）
  const hexRadius = 30;
  const hexPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPath.push(new Phaser.Math.Vector2(x, y));
  }
  
  graphics.fillPoints(hexPath, true);
  graphics.strokePoints(hexPath, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2 + 4, hexRadius * 2 + 4);
  graphics.destroy();
  
  // 创建六边形精灵
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the hexagon', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间差（秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测按键并设置速度方向
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
  
  // 如果同时按下多个键，需要归一化速度向量
  if (velocityX !== 0 || velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
    
    // 更新六边形位置
    hexagon.x += velocityX * distance;
    hexagon.y += velocityY * distance;
  }
  
  // 限制在屏幕范围内
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

new Phaser.Game(config);